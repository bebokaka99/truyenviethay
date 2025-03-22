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
    // Lấy danh sách truyện theo dõi
    $sql = "SELECT t.id, t.ten_truyen, t.anh_bia, t.luot_xem, t.luot_thich, t.luot_theo_doi
            FROM truyen_new t 
            JOIN theo_doi td ON t.id = td.truyen_id 
            WHERE td.user_id = ?
            ORDER BY t.id DESC";
    
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "i", $user_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    $truyen_list = [];
    while ($row = mysqli_fetch_assoc($result)) {
        // Lấy chương mới nhất
        $sql_chuong = "SELECT so_chuong, thoi_gian_dang 
                       FROM chuong 
                       WHERE truyen_id = ? AND trang_thai = 'da_duyet' 
                       ORDER BY thoi_gian_dang DESC LIMIT 1";
        $stmt_chuong = mysqli_prepare($conn, $sql_chuong);
        mysqli_stmt_bind_param($stmt_chuong, "i", $row['id']);
        mysqli_stmt_execute($stmt_chuong);
        $chuong = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt_chuong)) ?: null;
        mysqli_stmt_close($stmt_chuong);

        // Debug: Ghi log để kiểm tra dữ liệu chương
        if (!$chuong) {
            error_log("Không tìm thấy chương cho truyen_id: " . $row['id']);
        } else {
            error_log("Truyen_id: " . $row['id'] . " | Chương mới nhất: " . $chuong['so_chuong'] . " | Thời gian: " . $chuong['thoi_gian_dang']);
        }

        $last_update = $chuong && $chuong['thoi_gian_dang'] ? strtotime($chuong['thoi_gian_dang']) : 0;
        $time_ago = $last_update ? format_time_ago($last_update) : 'Chưa có chương';
        $chuong_moi_nhat = $chuong ? "Chương " . $chuong['so_chuong'] : "Chưa có chương";
        $chuong_moi_nhat_so_chuong = $chuong ? $chuong['so_chuong'] : null;

        $truyen_list[] = [
            'id' => $row['id'],
            'ten_truyen' => $row['ten_truyen'],
            'anh_bia_url' => !empty($row['anh_bia']) ? "../anh/{$row['anh_bia']}" : "../anh/default-truyen.jpg",
            'luot_xem' => $row['luot_xem'],
            'luot_thich' => $row['luot_thich'],
            'luot_theo_doi' => $row['luot_theo_doi'],
            'time_ago' => $time_ago,
            'chuong_moi_nhat' => $chuong_moi_nhat,
            'chuong_moi_nhat_so_chuong' => $chuong_moi_nhat_so_chuong,
            'last_update' => $last_update // Thêm trường last_update để sắp xếp
        ];
    }

    // Sắp xếp lại danh sách theo thời gian cập nhật chương mới nhất
    usort($truyen_list, function($a, $b) {
        $timeA = $a['last_update'];
        $timeB = $b['last_update'];
        return $timeB - $timeA; // Sắp xếp giảm dần (gần nhất lên đầu)
    });

    echo json_encode($truyen_list);
} catch (Exception $e) {
    echo json_encode(['error' => 'Lỗi khi lấy danh sách truyện: ' . $e->getMessage()]);
}

mysqli_stmt_close($stmt);
mysqli_close($conn);
?>