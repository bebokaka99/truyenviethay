<?php
header('Content-Type: application/json');
session_start();
require_once '../config.php';

// Đặt múi giờ Việt Nam (UTC+7) cho MySQL và PHP
mysqli_query($conn, "SET time_zone = '+07:00'");
date_default_timezone_set('Asia/Ho_Chi_Minh');

if (!isset($_SESSION['user_id']) || mysqli_fetch_assoc(mysqli_query($conn, "SELECT role FROM users_new WHERE id = " . $_SESSION['user_id']))['role'] !== 'admin') {
    echo json_encode(['error' => 'Không có quyền truy cập']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $truyen_id = (int)$_POST['truyen_id'];
    $action = $_POST['action'];
    $status = $action === 'approve' ? 'duyet' : ($action === 'reject' ? 'tu_choi' : '');
    if ($status) {
        $current_time = date('Y-m-d H:i:s'); // Lấy thời gian hiện tại theo múi giờ UTC+7
        $sql = "UPDATE truyen_new SET trang_thai_kiem_duyet = ?, thoi_gian_cap_nhat = ? WHERE id = ?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "ssi", $status, $current_time, $truyen_id);
        mysqli_stmt_execute($stmt);
        echo json_encode(['success' => true]);
        mysqli_stmt_close($stmt);
        exit;
    }
    echo json_encode(['error' => 'Hành động không hợp lệ']);
    exit;
}

$sql = "SELECT t.id, t.ten_truyen, t.tac_gia, t.thoi_gian_cap_nhat, u.full_name as tac_gia_name 
        FROM truyen_new t 
        JOIN users_new u ON t.user_id = u.id 
        WHERE t.trang_thai_kiem_duyet = 'cho_duyet'";
$result = mysqli_query($conn, $sql);
$truyen_list = [];
while ($row = mysqli_fetch_assoc($result)) {
    $truyen_list[] = $row;
}
echo json_encode(['success' => true, 'truyen_list' => $truyen_list]);
mysqli_close($conn);