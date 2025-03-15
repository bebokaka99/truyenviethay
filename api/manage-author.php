<?php
header('Content-Type: application/json');
session_start();
require_once '../config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Chưa đăng nhập', 'redirect' => '/truyenviethay/users/login.html']);
    exit;
}

$user_id = $_SESSION['user_id'];
$sql_user = "SELECT role FROM users_new WHERE id = ?";
$stmt_user = mysqli_prepare($conn, $sql_user);
mysqli_stmt_bind_param($stmt_user, "i", $user_id);
mysqli_stmt_execute($stmt_user);
$user = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt_user)) ?: null;
mysqli_stmt_close($stmt_user);

if (!$user || $user['role'] !== 'author') {
    echo json_encode(['error' => 'Chỉ tác giả mới có quyền truy cập']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT t.id, t.ten_truyen, t.trang_thai, t.thoi_gian_cap_nhat, t.anh_bia, t.tac_gia,
                   (SELECT COUNT(*) FROM chuong c WHERE c.truyen_id = t.id AND c.trang_thai = 'da_duyet') as so_chuong,
                   (SELECT COUNT(*) FROM chuong c WHERE c.truyen_id = t.id AND c.trang_thai = 'cho_duyet') as chuong_cho_duyet
            FROM truyen_new t WHERE t.user_id = ? ORDER BY t.thoi_gian_cap_nhat DESC";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "i", $user_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $truyen_list = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $row['thoi_gian_cap_nhat'] = $row['thoi_gian_cap_nhat'] ? date('d/m/Y H:i', strtotime($row['thoi_gian_cap_nhat'])) : 'Chưa cập nhật';
        $truyen_list[] = $row;
    }
    mysqli_stmt_close($stmt);
    echo json_encode(['success' => true, 'data' => $truyen_list]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    if ($action === 'delete') {
        $truyen_id = (int)$_POST['truyen_id'];
        $sql = "DELETE FROM truyen_new WHERE id = ? AND user_id = ?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "ii", $truyen_id, $user_id);
        if (mysqli_stmt_execute($stmt)) {
            echo json_encode(['success' => true, 'message' => 'Xóa truyện thành công!']);
        } else {
            echo json_encode(['error' => 'Lỗi khi xóa truyện: ' . mysqli_error($conn)]);
        }
        mysqli_stmt_close($stmt);
        exit;
    }
    echo json_encode(['error' => 'Hành động không hợp lệ']);
    exit;
}

echo json_encode(['error' => 'Phương thức không hợp lệ']);
mysqli_close($conn);