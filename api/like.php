<?php
header('Content-Type: application/json');
session_start();
require_once '../config.php';

$user_id = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : null;
$truyen_id = (int)($_POST['truyen_id'] ?? $_GET['truyen_id'] ?? 0);

if ($truyen_id <= 0) {
    echo json_encode(['error' => 'ID truyện không hợp lệ']);
    exit;
}

$sql_check = "SELECT * FROM thich WHERE user_id = ? AND truyen_id = ?";
$stmt_check = mysqli_prepare($conn, $sql_check);
mysqli_stmt_bind_param($stmt_check, "ii", $user_id, $truyen_id);
mysqli_stmt_execute($stmt_check);
$hasLiked = mysqli_num_rows(mysqli_stmt_get_result($stmt_check)) > 0;
mysqli_stmt_close($stmt_check);

$sql_luot_thich = "SELECT luot_thich FROM truyen_new WHERE id = ?";
$stmt_luot_thich = mysqli_prepare($conn, $sql_luot_thich);
mysqli_stmt_bind_param($stmt_luot_thich, "i", $truyen_id);
mysqli_stmt_execute($stmt_luot_thich);
$luot_thich = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt_luot_thich))['luot_thich'] ?? 0;
mysqli_stmt_close($stmt_luot_thich);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode([
        'liked' => $user_id && $hasLiked, // Chỉ true nếu user đăng nhập và đã thích
        'luot_thich' => $luot_thich
    ]);
    exit;
}

if (!$user_id) {
    echo json_encode(['error' => 'Chưa đăng nhập']);
    exit;
}

if ($hasLiked) {
    $sql = "DELETE FROM thich WHERE user_id = ? AND truyen_id = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $user_id, $truyen_id);
    if (mysqli_stmt_execute($stmt)) {
        $sql_update = "UPDATE truyen_new SET luot_thich = luot_thich - 1 WHERE id = ?";
        $stmt_update = mysqli_prepare($conn, $sql_update);
        mysqli_stmt_bind_param($stmt_update, "i", $truyen_id);
        mysqli_stmt_execute($stmt_update);
        $luot_thich = max(0, $luot_thich - 1);
        mysqli_stmt_close($stmt_update);
        echo json_encode(['success' => true, 'liked' => false, 'luot_thich' => $luot_thich]);
    }
    mysqli_stmt_close($stmt);
} else {
    $sql = "INSERT INTO thich (user_id, truyen_id) VALUES (?, ?)";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $user_id, $truyen_id);
    if (mysqli_stmt_execute($stmt)) {
        $sql_update = "UPDATE truyen_new SET luot_thich = luot_thich + 1 WHERE id = ?";
        $stmt_update = mysqli_prepare($conn, $sql_update);
        mysqli_stmt_bind_param($stmt_update, "i", $truyen_id);
        mysqli_stmt_execute($stmt_update);
        $luot_thich += 1;
        mysqli_stmt_close($stmt_update);
        echo json_encode(['success' => true, 'liked' => true, 'luot_thich' => $luot_thich]);
    }
    mysqli_stmt_close($stmt);
}
mysqli_close($conn);
?>