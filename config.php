<?php
$host = "localhost";
$username = "root";
$password = "";
$dbname = "truyenviethay_new";

$conn = mysqli_connect($host, $username, $password, $dbname);
// Đặt múi giờ cho MySQL ngay sau khi kết nối
mysqli_query($conn, "SET time_zone = '+07:00'");
if (!$conn) {
    die("Kết nối thất bại: " . mysqli_connect_error());
}

?>
