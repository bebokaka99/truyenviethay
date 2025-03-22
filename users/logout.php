<?php
// Khởi động session
session_start();

// Kiểm tra và xóa session
if (isset($_SESSION['user_id']) || isset($_SESSION['tenDangNhap']) || isset($_SESSION)) {
    // Xóa tất cả biến session
    session_unset();
    
    // Hủy session hoàn toàn
    session_destroy();
    
    // Xóa cookie session (nếu có)
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            time() - 42000, // Hết hạn cookie ngay lập tức
            $params["path"],
            $params["domain"],
            $params["secure"],
            $params["httponly"]
        );
    }
}

// Đóng kết nối cơ sở dữ liệu nếu đã mở (không cần thiết ở đây, nhưng giữ để tương thích)
if (isset($conn)) {
    mysqli_close($conn);
}

// Chuyển hướng về trang chính với đường dẫn tuyệt đối
$base_url = "http://localhost:888/truyenviethay/"; // Thay bằng domain thực tế khi deploy
header("Location: " . $base_url . "index.html");
exit();

?>