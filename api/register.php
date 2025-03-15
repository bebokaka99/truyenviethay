<?php
header('Content-Type: application/json');
session_start();
require_once '../config.php';

if (isset($_SESSION['user_id'])) {
    echo json_encode(['success' => true, 'redirect' => '/truyenviethay/index.html']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Phương thức không hợp lệ']);
    exit;
}

$full_name = trim($_POST['full_name'] ?? '');
$username = trim($_POST['username'] ?? '');
$email = trim($_POST['email'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$password = trim($_POST['password'] ?? '');
$confirm_password = trim($_POST['confirm_password'] ?? '');
$captcha = trim($_POST['captcha'] ?? '');
$terms = $_POST['terms'] ?? '';

$errors = [];

// Kiểm tra điều khoản
if ($terms !== 'agree') $errors['terms'] = 'Bạn phải đồng ý với điều khoản dịch vụ';

// Kiểm tra CAPTCHA
if (empty($captcha)) {
    $errors['captcha'] = 'Vui lòng nhập mã xác thực';
} elseif (strtoupper($captcha) !== strtoupper($_SESSION['captcha_code'])) {
    $errors['captcha'] = 'Mã xác thực không đúng';
}

// Kiểm tra username
if (empty($username)) {
    $errors['username'] = 'Vui lòng nhập tên đăng nhập';
} elseif (!preg_match("/^[a-zA-Z0-9_]*$/", $username)) {
    $errors['username'] = 'Tên đăng nhập chỉ được chứa chữ thường, số và dấu gạch dưới';
} else {
    $sql = "SELECT id FROM users_new WHERE username = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "s", $username);
    mysqli_stmt_execute($stmt);
    if (mysqli_num_rows(mysqli_stmt_get_result($stmt)) > 0) {
        $errors['username'] = 'Tên đăng nhập đã tồn tại';
    }
    mysqli_stmt_close($stmt);
}

// Kiểm tra email
if (empty($email)) {
    $errors['email'] = 'Vui lòng nhập email';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Email không hợp lệ';
} else {
    $sql = "SELECT COUNT(*) as count FROM users_new WHERE email = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "s", $email);
    mysqli_stmt_execute($stmt);
    if (mysqli_fetch_assoc(mysqli_stmt_get_result($stmt))['count'] >= 10) {
        $errors['email'] = 'Email này đã đạt giới hạn 10 tài khoản';
    }
    mysqli_stmt_close($stmt);
}

// Kiểm tra phone
if (empty($phone)) {
    $errors['phone'] = 'Vui lòng nhập số điện thoại';
} elseif (!preg_match("/^[0-9]{10,11}$/", $phone)) {
    $errors['phone'] = 'Số điện thoại không hợp lệ';
} else {
    $sql = "SELECT COUNT(*) as count FROM users_new WHERE phone = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "s", $phone);
    mysqli_stmt_execute($stmt);
    if (mysqli_fetch_assoc(mysqli_stmt_get_result($stmt))['count'] >= 10) {
        $errors['phone'] = 'Số điện thoại này đã đạt giới hạn 10 tài khoản';
    }
    mysqli_stmt_close($stmt);
}

// Kiểm tra password
if (empty($password)) {
    $errors['password'] = 'Vui lòng nhập mật khẩu';
} elseif (strlen($password) < 6) {
    $errors['password'] = 'Mật khẩu phải có ít nhất 6 ký tự';
}

// Kiểm tra confirm password
if (empty($confirm_password)) {
    $errors['confirm_password'] = 'Vui lòng xác nhận mật khẩu';
} elseif ($password !== $confirm_password) {
    $errors['confirm_password'] = 'Mật khẩu xác nhận không khớp';
}

if (!empty($errors)) {
    echo json_encode(['errors' => $errors]);
    exit;
}

// Thêm user vào database
$hashed_password = password_hash($password, PASSWORD_DEFAULT);
$sql = "INSERT INTO users_new (full_name, username, email, phone, password) VALUES (?, ?, ?, ?, ?)";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "sssss", $full_name, $username, $email, $phone, $hashed_password);

if (mysqli_stmt_execute($stmt)) {
    $_SESSION['captcha_code'] = substr(str_shuffle("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"), 0, 6);
    echo json_encode(['success' => true, 'message' => 'Chào mừng bạn đến với Truyenviethay, chúc bạn đọc truyện vui vẻ!', 'redirect' => '/truyenviethay/users/login.html']);
} else {
    echo json_encode(['error' => 'Đã có lỗi xảy ra: ' . mysqli_error($conn)]);
}

mysqli_stmt_close($stmt);
mysqli_close($conn);