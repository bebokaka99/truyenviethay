<?php
header('Content-Type: application/json');
session_start();
require_once '../config.php';

if (!isset($_SESSION['user_id'])) die(json_encode(['error' => 'Chưa đăng nhập']));
$user_id = (int)$_SESSION['user_id'];
$truyen_id = (int)$_POST['truyen_id'];

$sql_check = "SELECT * FROM theo_doi WHERE user_id = ? AND truyen_id = ?";
$stmt_check = mysqli_prepare($conn, $sql_check);
mysqli_stmt_bind_param($stmt_check, "ii", $user_id, $truyen_id);
mysqli_stmt_execute($stmt_check);
$hasFollowed = mysqli_num_rows(mysqli_stmt_get_result($stmt_check)) > 0;
mysqli_stmt_close($stmt_check);

if ($hasFollowed) {
    $sql = "DELETE FROM theo_doi WHERE user_id = ? AND truyen_id = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $user_id, $truyen_id);
    if (mysqli_stmt_execute($stmt)) {
        $sql_update = "UPDATE truyen_new SET luot_theo_doi = luot_theo_doi - 1 WHERE id = ?";
        $stmt_update = mysqli_prepare($conn, $sql_update);
        mysqli_stmt_bind_param($stmt_update, "i", $truyen_id);
        mysqli_stmt_execute($stmt_update);
        mysqli_stmt_close($stmt_update);
        echo json_encode(['success' => true, 'followed' => false]);
    }
    mysqli_stmt_close($stmt);
} else {
    $sql = "INSERT INTO theo_doi (user_id, truyen_id) VALUES (?, ?)";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $user_id, $truyen_id);
    if (mysqli_stmt_execute($stmt)) {
        $sql_update = "UPDATE truyen_new SET luot_theo_doi = luot_theo_doi + 1 WHERE id = ?";
        $stmt_update = mysqli_prepare($conn, $sql_update);
        mysqli_stmt_bind_param($stmt_update, "i", $truyen_id);
        mysqli_stmt_execute($stmt_update);
        mysqli_stmt_close($stmt_update);
        echo json_encode(['success' => true, 'followed' => true]);
    }
    mysqli_stmt_close($stmt);
}
mysqli_close($conn);