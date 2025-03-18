<?php
$host = "localhost";
$username = "root";
$password = "";
$dbname = "truyenviethay_new"; // Cập nhật tên cơ sở dữ liệu mới

$conn = mysqli_connect($host, $username, $password, $dbname);
// Đặt múi giờ cho MySQL ngay sau khi kết nối
mysqli_query($conn, "SET time_zone = '+07:00'");
if (!$conn) {
    die("Kết nối thất bại: " . mysqli_connect_error());
}

?>
