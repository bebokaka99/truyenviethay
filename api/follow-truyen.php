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
    echo json_encode(['error' => 'Bạn cần đăng nhập để xem danh sách truyện theo dõi']);
    exit;
}

$user_id = $_SESSION['user_id'];

try {
    // Lấy danh sách truyện theo dõi, chỉ lấy chương có trang_thai = 'da_duyet'
    $sql = "SELECT t.id, t.ten_truyen, t.anh_bia, t.luot_xem, t.luot_thich, t.luot_theo_doi, 
                   (SELECT so_chuong FROM chuong WHERE truyen_id = t.id AND trang_thai = 'da_duyet' ORDER BY so_chuong DESC LIMIT 1) as latest_chapter,
                   (SELECT thoi_gian_dang FROM chuong WHERE truyen_id = t.id AND trang_thai = 'da_duyet' ORDER BY so_chuong DESC LIMIT 1) as last_update
            FROM truyen_new t 
            JOIN theo_doi td ON t.id = td.truyen_id 
            WHERE td.user_id = ?
            ORDER BY (SELECT thoi_gian_dang FROM chuong WHERE truyen_id = t.id AND trang_thai = 'da_duyet' ORDER BY so_chuong DESC LIMIT 1) DESC, t.id DESC";
    
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "i", $user_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    $truyen_list = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $last_update = $row['last_update'];
        $time_ago = $last_update ? format_time_ago(strtotime($last_update)) : 'Chưa có chương';
        $truyen_list[] = [
            'id' => $row['id'],
            'ten_truyen' => $row['ten_truyen'],
            'anh_bia_url' => !empty($row['anh_bia']) ? "../anh/{$row['anh_bia']}" : "../anh/default-truyen.jpg",
            'luot_xem' => $row['luot_xem'],
            'luot_thich' => $row['luot_thich'],
            'luot_theo_doi' => $row['luot_theo_doi'],
            'time_ago' => $time_ago,
            'latest_chapter' => $row['latest_chapter'] ?? 0
        ];
    }

    echo json_encode($truyen_list);
} catch (Exception $e) {
    echo json_encode(['error' => 'Lỗi khi lấy danh sách truyện: ' . $e->getMessage()]);
}

mysqli_stmt_close($stmt);
mysqli_close($conn);
?>