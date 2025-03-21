<?php
header('Content-Type: application/json');
session_start();
require_once '../config.php';

ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', '../error.log');
error_reporting(E_ALL);

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Chưa đăng nhập']);
    exit;
}

$user_id = $_SESSION['user_id'];
$tz = new DateTimeZone('Asia/Ho_Chi_Minh');
$today = new DateTime('now', $tz);
$today_str = $today->format('Y-m-d');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['claim_reward'])) {
    $task_id = (int)$_POST['task_id'];
    $sql = "SELECT ut.is_completed, ut.is_rewarded, dt.exp_reward FROM user_tasks ut JOIN daily_tasks dt ON ut.task_id = dt.task_id WHERE ut.user_id = ? AND ut.task_id = ? AND ut.last_reset = ?";
    $stmt = mysqli_prepare($conn, $sql);
    if (!$stmt) {
        error_log('Prepare failed: ' . mysqli_error($conn));
        echo json_encode(['error' => 'Lỗi server']);
        exit;
    }
    mysqli_stmt_bind_param($stmt, "iis", $user_id, $task_id, $today_str);
    mysqli_stmt_execute($stmt);
    $task = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));
    mysqli_stmt_close($stmt);

    if ($task && $task['is_completed'] == 1 && $task['is_rewarded'] == 0) {
        $exp_reward = $task['exp_reward'];

        $sql_update1 = "UPDATE user_level SET exp = exp + ? WHERE user_id = ?";
        $stmt_update1 = mysqli_prepare($conn, $sql_update1);
        if (!$stmt_update1) {
            error_log('Prepare failed (update1): ' . mysqli_error($conn));
            echo json_encode(['error' => 'Lỗi server']);
            exit;
        }
        mysqli_stmt_bind_param($stmt_update1, "ii", $exp_reward, $user_id);
        $success1 = mysqli_stmt_execute($stmt_update1);
        mysqli_stmt_close($stmt_update1);

        $sql_update2 = "UPDATE user_tasks SET is_rewarded = 1 WHERE user_id = ? AND task_id = ? AND last_reset = ?";
        $stmt_update2 = mysqli_prepare($conn, $sql_update2);
        if (!$stmt_update2) {
            error_log('Prepare failed (update2): ' . mysqli_error($conn));
            echo json_encode(['error' => 'Lỗi server']);
            exit;
        }
        mysqli_stmt_bind_param($stmt_update2, "iis", $user_id, $task_id, $today_str);
        $success2 = mysqli_stmt_execute($stmt_update2);
        mysqli_stmt_close($stmt_update2);

        if ($success1 && $success2) {
            echo json_encode(['success' => true, 'message' => 'Nhận thưởng thành công']);
        } else {
            error_log('Execute failed: ' . mysqli_error($conn));
            echo json_encode(['error' => 'Lỗi khi cập nhật dữ liệu']);
        }
    } else {
        echo json_encode(['error' => 'Nhiệm vụ không hợp lệ hoặc đã nhận thưởng']);
    }
    exit;
}

// Đồng bộ và reset nhiệm vụ
$sql_check = "SELECT last_reset FROM user_tasks WHERE user_id = ? LIMIT 1";
$stmt_check = mysqli_prepare($conn, $sql_check);
mysqli_stmt_bind_param($stmt_check, "i", $user_id);
mysqli_stmt_execute($stmt_check);
$last_reset = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt_check))['last_reset'] ?? null;
mysqli_stmt_close($stmt_check);

if (!$last_reset || $last_reset != $today_str) {
    $sql_delete = "DELETE FROM user_tasks WHERE user_id = ?";
    $stmt_delete = mysqli_prepare($conn, $sql_delete);
    mysqli_stmt_bind_param($stmt_delete, "i", $user_id);
    mysqli_stmt_execute($stmt_delete);
    mysqli_stmt_close($stmt_delete);

    $sql_tasks = "SELECT * FROM daily_tasks";
    $result_tasks = mysqli_query($conn, $sql_tasks);
    while ($task = mysqli_fetch_assoc($result_tasks)) {
        $progress = $task['task_type'] === 'login' ? $task['target'] : 0;
        $is_completed = $task['task_type'] === 'login' ? 1 : 0;
        $sql_insert = "INSERT INTO user_tasks (user_id, task_id, last_reset, progress, is_completed, is_rewarded) VALUES (?, ?, ?, ?, ?, 0)";
        $stmt_insert = mysqli_prepare($conn, $sql_insert);
        mysqli_stmt_bind_param($stmt_insert, "iisii", $user_id, $task['task_id'], $today_str, $progress, $is_completed);
        mysqli_stmt_execute($stmt_insert);
        mysqli_stmt_close($stmt_insert);
    }
    mysqli_free_result($result_tasks);
}

$sql_comments = "SELECT COUNT(*) as count FROM comments WHERE user_id = ? AND DATE(created_at) = ?";
$stmt_comments = mysqli_prepare($conn, $sql_comments);
mysqli_stmt_bind_param($stmt_comments, "is", $user_id, $today_str);
mysqli_stmt_execute($stmt_comments);
$comment_count = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt_comments))['count'];
mysqli_stmt_close($stmt_comments);

// Sửa truy vấn: Đếm số chương khác nhau (dựa trên chuong_id)
$sql_reads = "SELECT COUNT(DISTINCT chuong_id) as count FROM lich_su_doc_new WHERE user_id = ? AND DATE(thoi_gian_doc) = ?";
$stmt_reads = mysqli_prepare($conn, $sql_reads);
mysqli_stmt_bind_param($stmt_reads, "is", $user_id, $today_str);
mysqli_stmt_execute($stmt_reads);
$read_count = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt_reads))['count'];
mysqli_stmt_close($stmt_reads);

$sql_update = "UPDATE user_tasks ut JOIN daily_tasks dt ON ut.task_id = dt.task_id SET ut.progress = LEAST(?, dt.target), ut.is_completed = IF(? >= dt.target, 1, 0) WHERE ut.user_id = ? AND dt.task_type = 'comment' AND ut.last_reset = ?";
$stmt_update = mysqli_prepare($conn, $sql_update);
mysqli_stmt_bind_param($stmt_update, "iiis", $comment_count, $comment_count, $user_id, $today_str);
mysqli_stmt_execute($stmt_update);
mysqli_stmt_close($stmt_update);

$sql_update = "UPDATE user_tasks ut JOIN daily_tasks dt ON ut.task_id = dt.task_id SET ut.progress = LEAST(?, dt.target), ut.is_completed = IF(? >= dt.target, 1, 0) WHERE ut.user_id = ? AND dt.task_type = 'read' AND ut.last_reset = ?";
$stmt_update = mysqli_prepare($conn, $sql_update);
mysqli_stmt_bind_param($stmt_update, "iiis", $read_count, $read_count, $user_id, $today_str);
mysqli_stmt_execute($stmt_update);
mysqli_stmt_close($stmt_update);

$sql_bonus = "SELECT COUNT(*) as completed FROM user_tasks ut JOIN daily_tasks dt ON ut.task_id = dt.task_id WHERE ut.user_id = ? AND dt.task_type != 'bonus' AND ut.last_reset = ? AND ut.is_completed = 1";
$stmt_bonus = mysqli_prepare($conn, $sql_bonus);
mysqli_stmt_bind_param($stmt_bonus, "is", $user_id, $today_str);
mysqli_stmt_execute($stmt_bonus);
$completed_count = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt_bonus))['completed'];
$sql_total = "SELECT COUNT(*) as total FROM daily_tasks WHERE task_type != 'bonus'";
$total_tasks = mysqli_fetch_assoc(mysqli_query($conn, $sql_total))['total'];
$sql_update_bonus = "UPDATE user_tasks ut JOIN daily_tasks dt ON ut.task_id = dt.task_id SET ut.progress = ?, ut.is_completed = IF(? >= dt.target, 1, 0) WHERE ut.user_id = ? AND dt.task_type = 'bonus' AND ut.last_reset = ?";
$stmt_update_bonus = mysqli_prepare($conn, $sql_update_bonus);
mysqli_stmt_bind_param($stmt_update_bonus, "iiis", $completed_count, $completed_count, $user_id, $today_str);
mysqli_stmt_execute($stmt_update_bonus);
mysqli_stmt_close($stmt_bonus);
mysqli_stmt_close($stmt_update_bonus);

$sql = "SELECT ut.*, dt.task_name, dt.description, dt.exp_reward, dt.task_type, dt.target FROM user_tasks ut JOIN daily_tasks dt ON ut.task_id = dt.task_id WHERE ut.user_id = ? AND ut.last_reset = ?";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "is", $user_id, $today_str);
mysqli_stmt_execute($stmt);
$tasks = [];
$result = mysqli_stmt_get_result($stmt);
while ($row = mysqli_fetch_assoc($result)) {
    $tasks[] = $row;
}
mysqli_stmt_close($stmt);

echo json_encode(['success' => true, 'tasks' => $tasks]);
mysqli_close($conn);