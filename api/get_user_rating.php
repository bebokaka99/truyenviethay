<?php
header('Content-Type: application/json');
require_once "../config.php";

$truyen_id = $_GET["truyen_id"] ?? null;
$user_id = $_GET["user_id"] ?? null;

if (!$truyen_id || !$user_id) {
    echo json_encode(["success" => false, "message" => "Thiếu thông tin"]);
    exit;
}

$result = mysqli_query($conn, "SELECT score FROM ratings WHERE user_id = '$user_id' AND truyen_id = '$truyen_id'");
if (mysqli_num_rows($result) > 0) {
    $row = mysqli_fetch_assoc($result);
    echo json_encode(["success" => true, "user_rating" => floatval($row["score"])]);
} else {
    echo json_encode(["success" => true, "user_rating" => 0]);
}
?>