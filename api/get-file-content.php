<?php
header('Content-Type: application/json');
session_start();
require_once '../config.php';

// Kiểm tra đăng nhập
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    echo json_encode(['success' => false, 'error' => 'Vui lòng đăng nhập']);
    exit;
}

// Kiểm tra dữ liệu đầu vào
if ($_SERVER['REQUEST_METHOD'] !== 'GET' || !isset($_GET['file_id'])) {
    echo json_encode(['success' => false, 'error' => 'Yêu cầu không hợp lệ']);
    exit;
}

$file_id = (int)$_GET['file_id'];

// Lấy thông tin file từ bảng files
$sql_file = "SELECT truyen_id, user_id FROM files WHERE id = ?";
$stmt_file = mysqli_prepare($conn, $sql_file);
if ($stmt_file === false) {
    echo json_encode(['success' => false, 'error' => 'Lỗi chuẩn bị câu lệnh SQL: ' . mysqli_error($conn)]);
    exit;
}
mysqli_stmt_bind_param($stmt_file, "i", $file_id);
mysqli_stmt_execute($stmt_file);
$file = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt_file));
mysqli_stmt_close($stmt_file);

if (!$file) {
    echo json_encode(['success' => false, 'error' => 'File không tồn tại']);
    exit;
}

// Kiểm tra quyền truy cập: File phải thuộc về truyện của tác giả
$sql_truyen = "SELECT user_id FROM truyen_new WHERE id = ?";
$stmt_truyen = mysqli_prepare($conn, $sql_truyen);
if ($stmt_truyen === false) {
    echo json_encode(['success' => false, 'error' => 'Lỗi chuẩn bị câu lệnh SQL: ' . mysqli_error($conn)]);
    exit;
}
mysqli_stmt_bind_param($stmt_truyen, "i", $file['truyen_id']);
mysqli_stmt_execute($stmt_truyen);
$truyen = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt_truyen));
mysqli_stmt_close($stmt_truyen);

if (!$truyen || $truyen['user_id'] != $user_id) {
    echo json_encode(['success' => false, 'error' => 'Bạn không có quyền xem nội dung file này']);
    exit;
}

// Lấy nội dung TXT từ bảng file_contents
$sql_content = "SELECT noi_dung_txt FROM file_contents WHERE file_id = ?";
$stmt_content = mysqli_prepare($conn, $sql_content);
if ($stmt_content === false) {
    echo json_encode(['success' => false, 'error' => 'Lỗi chuẩn bị câu lệnh SQL: ' . mysqli_error($conn)]);
    exit;
}
mysqli_stmt_bind_param($stmt_content, "i", $file_id);
mysqli_stmt_execute($stmt_content);
$content = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt_content));
mysqli_stmt_close($stmt_content);

if (!$content || empty($content['noi_dung_txt'])) {
    echo json_encode(['success' => false, 'error' => 'Không tìm thấy nội dung file']);
    exit;
}

echo json_encode([
    'success' => true,
    'noi_dung_txt' => $content['noi_dung_txt']
]);

mysqli_close($conn);
?>