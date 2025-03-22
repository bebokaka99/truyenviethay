<?php
ob_start(); // Thêm để chặn output không mong muốn
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

$sql = "SELECT id, username, password, role, status, ban_until FROM users_new WHERE username = ?";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "s", $username);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if (mysqli_num_rows($result) == 1) {
    $row = mysqli_fetch_assoc($result);
    if (password_verify($password, $row['password'])) {
        // Kiểm tra trạng thái tài khoản
        if ($row['status'] === 'blocked') {
            if ($row['ban_until'] === null) {
                echo json_encode(['error' => 'Tài khoản của bạn đã bị khóa vĩnh viễn.']);
                exit;
            } elseif (strtotime($row['ban_until']) > time()) {
                $banUntil = date('d/m/Y H:i:s', strtotime($row['ban_until']));
                echo json_encode(['error' => "Tài khoản của bạn bị khóa đến $banUntil."]);
                exit;
            } else {
                // Nếu ban_until hết hạn, tự động mở khóa
                $sql = "UPDATE users_new SET status = 'active', ban_until = NULL WHERE id = ?";
                $stmt = mysqli_prepare($conn, $sql);
                mysqli_stmt_bind_param($stmt, 'i', $row['id']);
                mysqli_stmt_execute($stmt);
                $row['status'] = 'active';
                $row['ban_until'] = null;
            }
        }

        // Đăng nhập thành công
        $_SESSION['user_id'] = $row['id'];
        $_SESSION['tenDangNhap'] = $row['username'];
        $_SESSION['role'] = $row['role'];
        echo json_encode(['success' => true, 'redirect' => '/truyenviethay/index.html']);
    } else {
        echo json_encode(['error' => 'Tên đăng nhập hoặc mật khẩu không đúng']);
    }
} else {
    echo json_encode(['error' => 'Tên đăng nhập hoặc mật khẩu không đúng']);
}

mysqli_stmt_close($stmt);
mysqli_close($conn);
ob_end_flush(); // Thêm để đảm bảo chỉ trả JSON
?>