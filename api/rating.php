<?php
header('Content-Type: application/json');
require_once "../config.php";
$data = json_decode(file_get_contents("php://input"), true);
$truyen_id = $data["truyen_id"] ?? null;
$score = $data["score"] ?? null;
$user_id = $data["user_id"] ?? null;

if (!$user_id) {
    echo json_encode(["success" => false, "message" => "Đăng nhập để đánh giá"]);
    exit;
}

if (!$truyen_id || $score < 0 || $score > 5) {
    echo json_encode(["success" => false, "message" => "Dữ liệu không hợp lệ"]);
    exit;
}

$check = mysqli_query($conn, "SELECT score FROM ratings WHERE user_id = '$user_id' AND truyen_id = '$truyen_id'");
$rating_count_query = mysqli_query($conn, "SELECT rating, rating_count FROM truyen_new WHERE id = '$truyen_id'");
$row = mysqli_fetch_assoc($rating_count_query);
$old_rating = $row["rating"] ?? 0;
$rating_count = $row["rating_count"] ?? 0;

if (mysqli_num_rows($check) > 0) {
    $old_score_row = mysqli_fetch_assoc($check);
    $old_score = $old_score_row["score"];
    mysqli_query($conn, "UPDATE ratings SET score = '$score', created_at = NOW() WHERE user_id = '$user_id' AND truyen_id = '$truyen_id'");
    $new_rating = (($old_rating * $rating_count) - $old_score + $score) / $rating_count;
} else {
    mysqli_query($conn, "INSERT INTO ratings (user_id, truyen_id, score, created_at) 
        VALUES ('$user_id', '$truyen_id', '$score', NOW())");
    $new_rating = ($old_rating * $rating_count + $score) / ($rating_count + 1);
    $rating_count++;
}

mysqli_query($conn, "UPDATE truyen_new SET rating = '$new_rating', rating_count = '$rating_count' WHERE id = '$truyen_id'");

echo json_encode([
    "success" => true,
    "new_rating" => round($new_rating, 1),
    "rating_count" => $rating_count // Thêm số người vote
]);
?>