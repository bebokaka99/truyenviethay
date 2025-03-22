<?php
header('Content-Type: application/json');
session_start();
require_once '../config.php';

if (!isset($_SESSION['user_id'])) die(json_encode(['error' => 'Chưa đăng nhập']));
$user_id = (int)$_SESSION['user_id'];
$truyen_id = (int)$_POST['truyen_id'];
$content = trim($_POST['content']);

if (empty($content)) die(json_encode(['error' => 'Nội dung bình luận trống']));

$sql = "INSERT INTO comments (truyen_id, user_id, content) VALUES (?, ?, ?)";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "iis", $truyen_id, $user_id, $content);
if (mysqli_stmt_execute($stmt)) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['error' => 'Lỗi khi gửi bình luận']);
}
mysqli_stmt_close($stmt);
mysqli_close($conn);