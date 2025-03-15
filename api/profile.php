<?php
header('Content-Type: application/json');
session_start();
require_once '../config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Chưa đăng nhập', 'redirect' => '/truyenviethay/users/login.html']);
    exit;
}

$user_id = $_SESSION['user_id'];

function getUserInfo($conn, $user_id) {
    $sql = "SELECT full_name, username, email, phone, avatar, gender, created_at AS signup_date, role FROM users_new WHERE id = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "i", $user_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $data = mysqli_fetch_assoc($result) ?: null;
    mysqli_stmt_close($stmt);
    return $data;
}

function getDaysJoined($signup_date) {
    return (new DateTime())->diff(new DateTime($signup_date))->days;
}

$user_info = getUserInfo($conn, $user_id);
if (!$user_info) {
    echo json_encode(['error' => 'Không tìm thấy thông tin người dùng']);
    exit;
}

$user_info['days_joined'] = getDaysJoined($user_info['signup_date']);
$user_info['avatar'] = $user_info['avatar'] ?? 'anh/avatar-default.jpg';

// Logic EXP và Level
if ($user_info['role'] === 'user') {
    $sql = "SELECT exp, level FROM user_level WHERE user_id = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "i", $user_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    if ($row = mysqli_fetch_assoc($result)) {
        $user_info['exp'] = $row['exp'];
        $user_info['level'] = $row['level'];
    } else {
        $user_info['exp'] = $user_info['days_joined'] * 5; // Tạm tính
        $user_info['level'] = floor($user_info['exp'] / 100);
        $sql_insert = "INSERT INTO user_level (user_id, exp, level) VALUES (?, ?, ?)";
        $stmt_insert = mysqli_prepare($conn, $sql_insert);
        mysqli_stmt_bind_param($stmt_insert, "iii", $user_id, $user_info['exp'], $user_info['level']);
        mysqli_stmt_execute($stmt_insert);
        mysqli_stmt_close($stmt_insert);
    }
    $user_info['title'] = $user_info['level'] >= 10 ? 'Độc giả Vàng' : ($user_info['level'] >= 5 ? 'Độc giả Bạc' : ($user_info['level'] >= 3 ? 'Độc giả Đồng' : 'Độc giả Mới'));
    mysqli_stmt_close($stmt);
} elseif ($user_info['role'] === 'author') {
    $sql = "SELECT SUM(luot_xem) as total_views, COUNT(*) as total_chapters FROM truyen_new WHERE user_id = ? AND trang_thai_kiem_duyet = 'duyet'";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "i", $user_id);
    mysqli_stmt_execute($stmt);
    $row = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt)) ?: ['total_views' => 0, 'total_chapters' => 0];
    $exp = $row['total_views'] * 1 + $row['total_chapters'] * 50;
    $level = floor($exp / 200);
    $sql_level = "INSERT INTO author_level (user_id, exp, level) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE exp = ?, level = ?";
    $stmt_level = mysqli_prepare($conn, $sql_level);
    mysqli_stmt_bind_param($stmt_level, "iiiii", $user_id, $exp, $level, $exp, $level);
    mysqli_stmt_execute($stmt_level);
    $user_info['exp'] = $exp;
    $user_info['level'] = $level;
    $user_info['title'] = $level >= 10 ? 'Bậc thầy sáng tác' : ($level >= 5 ? 'Tác giả nổi tiếng' : ($level >= 3 ? 'Tác giả triển vọng' : 'Tác giả mới'));
    $user_info['stats'] = array_merge($row, ['top_story' => 'Chưa có truyện']);
    $sql_top = "SELECT ten_truyen FROM truyen_new WHERE user_id = ? ORDER BY luot_xem DESC LIMIT 1";
    $stmt_top = mysqli_prepare($conn, $sql_top);
    mysqli_stmt_bind_param($stmt_top, "i", $user_id);
    mysqli_stmt_execute($stmt_top);
    if ($top = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt_top))) {
        $user_info['stats']['top_story'] = $top['ten_truyen'];
    }
    mysqli_stmt_close($stmt);
    mysqli_stmt_close($stmt_level);
    mysqli_stmt_close($stmt_top);
} else { // admin
    $user_info['exp'] = 0;
    $user_info['level'] = 0;
    $user_info['stats'] = ['truyen_cho_duyet' => 0];
    $sql = "SELECT COUNT(*) as count FROM truyen_new WHERE trang_thai_kiem_duyet = 'cho_duyet'";
    $user_info['stats']['truyen_cho_duyet'] = mysqli_fetch_assoc(mysqli_query($conn, $sql))['count'];
}

echo json_encode(['success' => true, 'data' => $user_info]);
mysqli_close($conn);