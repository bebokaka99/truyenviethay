<?php
session_start();
require_once '../config.php';

header('Content-Type: application/json');

// Đặt múi giờ Việt Nam (UTC+7)
mysqli_query($conn, "SET time_zone = '+07:00'");
date_default_timezone_set('Asia/Ho_Chi_Minh');

// Hàm format_time_ago
function format_time_ago($timestamp) {
    $now = time();
    $diff = $now - $timestamp;

    if ($diff < 0) return "vừa xong";
    if ($diff < 60) return $diff . " giây trước";
    if ($diff < 3600) return floor($diff / 60) . " phút trước";
    if ($diff < 86400) return floor($diff / 3600) . " giờ trước";
    if ($diff < 2592000) return floor($diff / 86400) . " ngày trước";
    if ($diff < 31536000) return floor($diff / 2592000) . " tháng trước";
    return floor($diff / 31536000) . " năm trước";
}

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Bạn cần đăng nhập để xem lịch sử đọc']);
    exit;
}

$user_id = $_SESSION['user_id'];

try {
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $limit = 18;
    $offset = ($page - 1) * $limit;

    $sql_count = "SELECT COUNT(DISTINCT truyen_id) as total FROM lich_su_doc_new WHERE user_id = ?";
    $stmt_count = mysqli_prepare($conn, $sql_count);
    mysqli_stmt_bind_param($stmt_count, "i", $user_id);
    mysqli_stmt_execute($stmt_count);
    $total_items = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt_count))['total'];
    mysqli_stmt_close($stmt_count);

    $total_pages = ceil($total_items / $limit);

    $sql = "
        SELECT 
            lsd.truyen_id, 
            lsd.thoi_gian_doc, 
            t.ten_truyen, 
            t.anh_bia, 
            (SELECT MAX(c2.so_chuong) 
             FROM chuong c2 
             WHERE c2.truyen_id = lsd.truyen_id) as so_chuong,
            (SELECT c3.id 
             FROM chuong c3 
             WHERE c3.truyen_id = lsd.truyen_id 
             AND c3.so_chuong = (SELECT MAX(c4.so_chuong) 
                                 FROM chuong c4 
                                 WHERE c4.truyen_id = lsd.truyen_id)) as chuong_id
        FROM lich_su_doc_new lsd
        JOIN truyen_new t ON lsd.truyen_id = t.id
        WHERE lsd.user_id = ?
        AND lsd.thoi_gian_doc = (
            SELECT MAX(thoi_gian_doc)
            FROM lich_su_doc_new lsd2
            WHERE lsd2.user_id = lsd.user_id AND lsd2.truyen_id = lsd.truyen_id
        )
        ORDER BY lsd.thoi_gian_doc DESC
        LIMIT ? OFFSET ?
    ";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "iii", $user_id, $limit, $offset);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $history = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $time_ago = $row['thoi_gian_doc'] ? format_time_ago(strtotime($row['thoi_gian_doc'])) : 'Chưa có chương';

        $history[] = [
            'truyen_id' => $row['truyen_id'],
            'ten_truyen' => $row['ten_truyen'],
            'anh_bia' => !empty($row['anh_bia']) ? "../anh/{$row['anh_bia']}" : "../anh/default-truyen.jpg",
            'chuong_id' => $row['chuong_id'],
            'so_chuong' => $row['so_chuong'] ?? 0,
            'thoi_gian_doc' => $time_ago
        ];
    }

    echo json_encode([
        'success' => true,
        'history' => $history,
        'total_pages' => $total_pages,
        'current_page' => $page
    ]);
} catch (Exception $e) {
    echo json_encode(['error' => 'Lỗi khi lấy lịch sử đọc: ' . $e->getMessage()]);
}

mysqli_stmt_close($stmt);
mysqli_close($conn);
?>