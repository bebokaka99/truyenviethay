<?php
header('Content-Type: application/json');
session_start();
require_once '../config.php';

if (isset($_SESSION['user_id'])) {
    echo json_encode(['success' => true, 'redirect' => '/truyenviethay/index.php']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Phương thức không hợp lệ']);
    exit;
}

$username = trim($_POST['username'] ?? '');
$password = trim($_POST['password'] ?? '');

if (empty($username)) {
    echo json_encode(['error' => 'Vui lòng nhập tên đăng nhập']);
    exit;
}
if (empty($password)) {
    echo json_encode(['error' => 'Vui lòng nhập mật khẩu']);
    exit;
}

$sql = "SELECT id, username, password FROM users_new WHERE username = ?";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "s", $username);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if (mysqli_num_rows($result) == 1) {
    $row = mysqli_fetch_assoc($result);
    if (password_verify($password, $row['password'])) {
        $_SESSION['user_id'] = $row['id'];
        $_SESSION['tenDangNhap'] = $row['username'];
        echo json_encode(['success' => true, 'redirect' => '/truyenviethay/index.html']);
    } else {
        echo json_encode(['error' => 'Tên đăng nhập hoặc mật khẩu không đúng']);
    }
} else {
    echo json_encode(['error' => 'Tên đăng nhập hoặc mật khẩu không đúng']);
}

mysqli_stmt_close($stmt);
mysqli_close($conn);