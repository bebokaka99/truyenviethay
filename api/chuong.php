<?php
header('Content-Type: application/json');
session_start();
require_once '../config.php';

$user_id = $_SESSION['user_id'] ?? null; // Lấy user_id nếu có, không thì null
$is_admin = false;
$is_author = false;

if ($user_id) {
    $sql_user = "SELECT role FROM users_new WHERE id = ?";
    $stmt_user = mysqli_prepare($conn, $sql_user);
    mysqli_stmt_bind_param($stmt_user, "i", $user_id);
    mysqli_stmt_execute($stmt_user);
    $user = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt_user)) ?: null;
    mysqli_stmt_close($stmt_user);

    if (!$user) {
        echo json_encode(['error' => 'Người dùng không tồn tại']);
        exit;
    }
    $is_admin = $user['role'] === 'admin';
}

$truyen_id = (int)($_GET['truyen_id'] ?? 0);
$chapter_id = (int)($_GET['chapter_id'] ?? 0);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($truyen_id <= 0 || $chapter_id <= 0) {
        echo json_encode(['error' => 'ID không hợp lệ']);
        exit;
    }

    $sql_truyen = "SELECT ten_truyen, user_id FROM truyen_new WHERE id = ?";
    $stmt_truyen = mysqli_prepare($conn, $sql_truyen);
    mysqli_stmt_bind_param($stmt_truyen, "i", $truyen_id);
    mysqli_stmt_execute($stmt_truyen);
    $truyen = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt_truyen)) ?: null;
    mysqli_stmt_close($stmt_truyen);

    if (!$truyen) {
        echo json_encode(['error' => 'Truyện không tồn tại']);
        exit;
    }

    $sql_chuong = "SELECT * FROM chuong WHERE so_chuong = ? AND truyen_id = ?"; // Sửa id thành so_chuong
    $stmt_chuong = mysqli_prepare($conn, $sql_chuong);
    mysqli_stmt_bind_param($stmt_chuong, "ii", $chapter_id, $truyen_id);
    mysqli_stmt_execute($stmt_chuong);
    $chapter = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt_chuong)) ?: null;
    mysqli_stmt_close($stmt_chuong);

    if (!$chapter) {
        echo json_encode(['error' => 'Chương không tồn tại']);
        exit;
    }

    if (!isset($_SESSION['viewed_chapters'][$chapter_id])) {
        $new_luot_xem = ($chapter['luot_xem'] ?? 0) + 1;
        $sql_update = "UPDATE chuong SET luot_xem = ? WHERE so_chuong = ? AND truyen_id = ?";
        $stmt_update = mysqli_prepare($conn, $sql_update);
        mysqli_stmt_bind_param($stmt_update, "iii", $new_luot_xem, $chapter_id, $truyen_id);
        mysqli_stmt_execute($stmt_update);
        mysqli_stmt_close($stmt_update);
        $_SESSION['viewed_chapters'][$chapter_id] = true;
        $chapter['luot_xem'] = $new_luot_xem;
    }

    // Lấy danh sách chương để tạo selector
    $sql_chapters = "SELECT so_chuong, tieu_de FROM chuong WHERE truyen_id = ? AND trang_thai = 'da_duyet' ORDER BY so_chuong ASC";
    $stmt_chapters = mysqli_prepare($conn, $sql_chapters);
    mysqli_stmt_bind_param($stmt_chapters, "i", $truyen_id);
    mysqli_stmt_execute($stmt_chapters);
    $result_chapters = mysqli_stmt_get_result($stmt_chapters);
    $chapters = [];
    while ($row = mysqli_fetch_assoc($result_chapters)) {
        $chapters[] = $row;
    }
    mysqli_stmt_close($stmt_chapters);

    // Tìm chương trước và chương sau
    $chuong_truoc = null;
    $chuong_sau = null;
    for ($i = 0; $i < count($chapters); $i++) {
        if ($chapters[$i]['so_chuong'] == $chapter_id) {
            if ($i > 0) $chuong_truoc = $chapters[$i - 1]['so_chuong'];
            if ($i < count($chapters) - 1) $chuong_sau = $chapters[$i + 1]['so_chuong'];
            break;
        }
    }

    // Kiểm tra trạng thái theo dõi (nếu đã đăng nhập)
    $hasFollowed = false;
    if ($user_id) {
        $sql_follow = "SELECT * FROM theo_doi WHERE user_id = ? AND truyen_id = ?";
        $stmt_follow = mysqli_prepare($conn, $sql_follow);
        mysqli_stmt_bind_param($stmt_follow, "ii", $user_id, $truyen_id);
        mysqli_stmt_execute($stmt_follow);
        $result_follow = mysqli_stmt_get_result($stmt_follow);
        $hasFollowed = mysqli_num_rows($result_follow) > 0;
        mysqli_stmt_close($stmt_follow);

        $is_author = $truyen['user_id'] == $user_id;
    }

    $chapter['thoi_gian_dang'] = $chapter['thoi_gian_dang'] ? date('d/m/Y H:i', strtotime($chapter['thoi_gian_dang'])) : 'Chưa đăng';
    echo json_encode([
        'success' => true,
        'ten_truyen' => $truyen['ten_truyen'], // Sửa truyen thành ten_truyen để khớp với chuong.js
        'chuong' => $chapter,
        'chapters' => $chapters, // Danh sách chương cho selector
        'chuong_truoc' => $chuong_truoc,
        'chuong_sau' => $chuong_sau,
        'is_admin' => $is_admin,
        'is_author' => $is_author,
        'hasFollowed' => $hasFollowed
    ]);
    exit;
}

echo json_encode(['error' => 'Phương thức không hợp lệ']);
mysqli_close($conn);