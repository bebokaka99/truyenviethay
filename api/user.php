<?php
header('Content-Type: application/json');
session_start();
require_once '../config.php';

$base_path = str_replace('\\', '/', $_SERVER['DOCUMENT_ROOT'] . '/truyenviethay/');
$data = ['loggedIn' => false, 'avatar' => '/truyenviethay/anh/avatar-default.jpg', 'hoTen' => 'Người dùng'];

if (isset($_SESSION['user_id'])) {
    $user_id = $_SESSION['user_id'];
    $sql = "SELECT full_name, avatar FROM users_new WHERE id = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "i", $user_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    if ($result && mysqli_num_rows($result) > 0) {
        $user = mysqli_fetch_assoc($result);
        $data['hoTen'] = $user['full_name'];
        $avatar_relative_path = !empty($user['avatar']) ? $user['avatar'] : 'anh/avatar-default.jpg';
        $avatar_path = $base_path . $avatar_relative_path;
        $data['avatar'] = file_exists($avatar_path) ? '/truyenviethay/' . $avatar_relative_path : '/truyenviethay/anh/avatar-default.jpg';
        $data['loggedIn'] = true;
    }
    mysqli_stmt_close($stmt);
}
echo json_encode($data);
mysqli_close($conn);