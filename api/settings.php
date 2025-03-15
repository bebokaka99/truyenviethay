<?php
header('Content-Type: application/json');
session_start();
require_once '../config.php';

// Debug: Log session
error_log("Session user_id: " . (isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 'Not set'));

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Chưa đăng nhập', 'redirect' => '/truyenviethay/users/login.html']);
    exit;
}

$user_id = $_SESSION['user_id'];

function getUserInfo($conn, $user_id) {
    $sql = "SELECT full_name, username, email, phone, avatar, gender, created_at AS signup_date, role, password FROM users_new WHERE id = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "i", $user_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt)) ?: null;
    mysqli_stmt_close($stmt);
    return $result;
}

$action = $_GET['action'] ?? '';
error_log("Action: " . $action);

if ($action === 'settings') {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $user_info = getUserInfo($conn, $user_id);
        if (!$user_info) {
            echo json_encode(['error' => 'Không tìm thấy thông tin người dùng']);
        } else {
            $user_info['avatar'] = $user_info['avatar'] ?? 'anh/avatar-default.jpg';
            unset($user_info['password']); // Không trả về mật khẩu
            echo json_encode(['success' => true, 'data' => $user_info]);
        }
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $full_name = trim($_POST['full_name'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $phone = trim($_POST['phone'] ?? '');
        $gender = trim($_POST['gender'] ?? '');
        $password = !empty($_POST['password']) ? password_hash(trim($_POST['password']), PASSWORD_DEFAULT) : null;

        $errors = [];
        if (empty($full_name)) $errors['full_name'] = 'Vui lòng nhập họ tên';
        if (empty($email)) $errors['email'] = 'Vui lòng nhập email';
        elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors['email'] = 'Email không hợp lệ';
        if (empty($phone)) $errors['phone'] = 'Vui lòng nhập số điện thoại';
        elseif (!preg_match("/^[0-9]{10,11}$/", $phone)) $errors['phone'] = 'Số điện thoại không hợp lệ';
        if (empty($gender)) $errors['gender'] = 'Vui lòng chọn giới tính';

        $new_avatar = getUserInfo($conn, $user_id)['avatar'] ?? 'anh/avatar-default.jpg';
        if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
            $target_dir = "../anh/avatars/";
            $file_name = basename($_FILES['avatar']['name']);
            $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
            $allowed_ext = ['jpg', 'jpeg', 'png', 'gif'];
            $new_file_name = $user_id . '_' . time() . '.' . $file_ext;
            $target_file = $target_dir . $new_file_name;

            if (!in_array($file_ext, $allowed_ext)) $errors['avatar'] = 'Chỉ hỗ trợ file ảnh (jpg, png, gif)';
            elseif ($_FILES['avatar']['size'] > 5000000) $errors['avatar'] = 'Ảnh phải nhỏ hơn 5MB';
            elseif (!move_uploaded_file($_FILES['avatar']['tmp_name'], $target_file)) $errors['avatar'] = 'Lỗi khi upload ảnh';
            else $new_avatar = "anh/avatars/" . $new_file_name;
        }

        if (!empty($errors)) {
            echo json_encode(['errors' => $errors]);
            exit;
        }

        $sql = "UPDATE users_new SET full_name = ?, email = ?, phone = ?, gender = ?, avatar = ?" . ($password ? ", password = ?" : "") . " WHERE id = ?";
        $params = [$full_name, $email, $phone, $gender, $new_avatar];
        $types = "sssss";
        if ($password) {
            $params[] = $password;
            $types .= "s";
        }
        $params[] = $user_id;
        $types .= "i";

        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, $types, ...$params);
        if (mysqli_stmt_execute($stmt)) {
            echo json_encode(['success' => true, 'message' => 'Cập nhật thông tin thành công', 'data' => getUserInfo($conn, $user_id)]);
        } else {
            echo json_encode(['error' => 'Lỗi khi cập nhật thông tin: ' . mysqli_error($conn)]);
        }
        mysqli_stmt_close($stmt);
        exit;
    }
} elseif ($action === 'change_password') {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        error_log("Change password request received");
        $current_password = trim($_POST['current_password'] ?? '');
        $new_password = trim($_POST['new_password'] ?? '');

        error_log("Current password: " . $current_password);
        error_log("New password: " . $new_password);

        $errors = [];
        if (empty($current_password)) $errors['current_password'] = 'Vui lòng nhập mật khẩu hiện tại';
        if (empty($new_password)) $errors['new_password'] = 'Vui lòng nhập mật khẩu mới';
        elseif (strlen($new_password) < 6) $errors['new_password'] = 'Mật khẩu mới phải có ít nhất 6 ký tự';

        if (!empty($errors)) {
            echo json_encode(['error' => $errors[array_key_first($errors)]]);
            exit;
        }

        // Lấy thông tin người dùng
        $user = getUserInfo($conn, $user_id);
        if (!$user) {
            echo json_encode(['error' => 'Không tìm thấy thông tin người dùng']);
            exit;
        }

        error_log("Stored password: " . $user['password']);

        // Kiểm tra mật khẩu hiện tại
        if (!password_verify($current_password, $user['password'])) {
            error_log("Password verification failed");
            echo json_encode(['error' => 'Mật khẩu hiện tại không đúng']);
            exit;
        }

        // Mã hóa mật khẩu mới
        $new_password_hashed = password_hash($new_password, PASSWORD_DEFAULT);
        error_log("New hashed password: " . $new_password_hashed);

        // Cập nhật mật khẩu mới
        $sql = "UPDATE users_new SET password = ? WHERE id = ?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "si", $new_password_hashed, $user_id);
        if (mysqli_stmt_execute($stmt)) {
            // Đăng xuất người dùng bằng cách xóa session
            session_destroy();
            echo json_encode(['success' => true, 'message' => 'Đổi mật khẩu thành công']);
        } else {
            echo json_encode(['error' => 'Lỗi khi đổi mật khẩu: ' . mysqli_error($conn)]);
        }
        mysqli_stmt_close($stmt);
        exit;
    }
}

echo json_encode(['error' => 'Invalid action']);
mysqli_close($conn);