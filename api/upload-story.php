<?php
header('Content-Type: application/json');
session_start();
require_once '../config.php';

// Tải Smalot/PdfParser
require_once '../vendor/autoload.php';
use Smalot\PdfParser\Parser;

// Tải PhpOffice/PhpWord
use PhpOffice\PhpWord\IOFactory;

// Kiểm tra đăng nhập
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    echo json_encode(['success' => false, 'error' => 'Vui lòng đăng nhập']);
    exit;
}

// Kiểm tra dữ liệu đầu vào
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_FILES['file']) || !isset($_POST['truyen_id'])) {
    echo json_encode(['success' => false, 'error' => 'Yêu cầu không hợp lệ']);
    exit;
}

$truyen_id = (int)$_POST['truyen_id'];
$file = $_FILES['file'];

// Kiểm tra quyền tác giả
$sql_truyen = "SELECT user_id FROM truyen_new WHERE id = ?";
$stmt_truyen = mysqli_prepare($conn, $sql_truyen);
mysqli_stmt_bind_param($stmt_truyen, "i", $truyen_id);
mysqli_stmt_execute($stmt_truyen);
$truyen = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt_truyen));
mysqli_stmt_close($stmt_truyen);

if (!$truyen || $truyen['user_id'] != $user_id) {
    echo json_encode(['success' => false, 'error' => 'Bạn không có quyền upload cho truyện này']);
    exit;
}

// Kiểm tra file
$allowed_extensions = ['pdf', 'doc', 'docx', 'txt'];
$max_file_size = 50 * 1024 * 1024; // 50MB
$file_extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

if (!in_array($file_extension, $allowed_extensions)) {
    echo json_encode(['success' => false, 'error' => 'Định dạng file không được hỗ trợ']);
    exit;
}

if ($file['size'] > $max_file_size) {
    echo json_encode(['success' => false, 'error' => 'File quá lớn, tối đa 50MB']);
    exit;
}

if ($file['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'error' => 'Lỗi khi upload file']);
    exit;
}

// Lưu file gốc
$upload_dir = dirname(__DIR__) . '/uploads/';
if (!is_dir($upload_dir)) {
    if (!mkdir($upload_dir, 0755, true)) {
        echo json_encode(['success' => false, 'error' => 'Không thể tạo thư mục uploads']);
        exit;
    }
}

if (!is_writable($upload_dir)) {
    echo json_encode(['success' => false, 'error' => 'Thư mục uploads không có quyền ghi']);
    exit;
}

$file_name = $user_id . '_' . $truyen_id . '_' . time() . '.' . $file_extension;
$file_path = $upload_dir . $file_name;

if (!move_uploaded_file($file['tmp_name'], $file_path)) {
    echo json_encode(['success' => false, 'error' => 'Lỗi khi lưu file']);
    exit;
}

error_log("DEBUG: File Path: " . $file_path);

// Lưu thông tin file vào bảng files
$sql_file = "INSERT INTO files (truyen_id, user_id, file_path, format, uploaded_at) 
             VALUES (?, ?, ?, ?, NOW())";
$stmt_file = mysqli_prepare($conn, $sql_file);
if ($stmt_file === false) {
    echo json_encode(['success' => false, 'error' => 'Lỗi chuẩn bị câu lệnh SQL: ' . mysqli_error($conn)]);
    exit;
}
mysqli_stmt_bind_param($stmt_file, "iiss", $truyen_id, $user_id, $file_path, $file_extension);
mysqli_stmt_execute($stmt_file);
$file_id = mysqli_insert_id($conn);
mysqli_stmt_close($stmt_file);

// Chuyển đổi file về TXT
$content = '';

switch ($file_extension) {
    case 'pdf':
        // Sử dụng Smalot/PdfParser để trích xuất nội dung PDF
        try {
            $parser = new Parser();
            $pdf = $parser->parseFile($file_path);
            $content = $pdf->getText();
        } catch (Exception $e) {
            error_log("DEBUG: PdfParser Error: " . $e->getMessage());
            echo json_encode(['success' => false, 'error' => 'Lỗi khi trích xuất nội dung PDF: ' . $e->getMessage()]);
            exit;
        }
        break;
    case 'doc':
    case 'docx':
        // Sử dụng PhpOffice/PhpWord để trích xuất nội dung Word
        try {
            $phpWord = IOFactory::load($file_path);
            $content = '';
            foreach ($phpWord->getSections() as $section) {
                foreach ($section->getElements() as $element) {
                    if (method_exists($element, 'getText')) {
                        $content .= $element->getText() . "\n";
                    }
                }
            }
        } catch (Exception $e) {
            error_log("DEBUG: PhpWord Error: " . $e->getMessage());
            echo json_encode(['success' => false, 'error' => 'Lỗi khi trích xuất nội dung Word: ' . $e->getMessage()]);
            exit;
        }
        break;
    case 'txt':
        // Đọc trực tiếp nội dung file TXT
        $content = file_get_contents($file_path);
        if ($content === false) {
            echo json_encode(['success' => false, 'error' => 'Không thể đọc nội dung file TXT']);
            exit;
        }
        break;
    default:
        echo json_encode(['success' => false, 'error' => 'Định dạng không được hỗ trợ']);
        exit;
}

// Kiểm tra nội dung rỗng
if (empty($content)) {
    echo json_encode([
        'success' => true,
        'message' => 'Upload thành công nhưng file không chứa văn bản',
        'file_id' => $file_id
    ]);
    exit;
}

// Chuẩn hóa nội dung
$content = mb_convert_encoding($content, 'UTF-8', 'auto');
$content = preg_replace('/\r\n|\r|\n/', "\n", $content);
$content = trim($content);

// Log nội dung để debug
error_log("DEBUG: TXT Content: " . substr($content, 0, 1000));

// Lưu nội dung TXT vào bảng file_contents
$sql_content = "INSERT INTO file_contents (file_id, truyen_id, user_id, noi_dung_txt, created_at) 
                VALUES (?, ?, ?, ?, NOW())";
$stmt_content = mysqli_prepare($conn, $sql_content);
if ($stmt_content === false) {
    echo json_encode(['success' => false, 'error' => 'Lỗi chuẩn bị câu lệnh SQL: ' . mysqli_error($conn)]);
    exit;
}
mysqli_stmt_bind_param($stmt_content, "iiis", $file_id, $truyen_id, $user_id, $content);
mysqli_stmt_execute($stmt_content);
mysqli_stmt_close($stmt_content);

echo json_encode([
    'success' => true,
    'message' => 'Upload file thành công',
    'file_id' => $file_id
]);

mysqli_close($conn);
?>