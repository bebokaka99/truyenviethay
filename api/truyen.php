<?php
header('Content-Type: application/json');
require_once '../config.php';

// Đặt múi giờ Việt Nam (UTC+7)
mysqli_query($conn, "SET time_zone = '+07:00'");
date_default_timezone_set('Asia/Ho_Chi_Minh');

function format_time_ago($timestamp) {
    $now = time();
    $diff = $now - $timestamp;

    // Debug: Ghi log thời gian
    error_log("Timestamp: " . date('Y-m-d H:i:s', $timestamp) . " | Now: " . date('Y-m-d H:i:s', $now) . " | Diff: $diff");

    if ($diff < 0) return "vừa xong";
    if ($diff < 60) return $diff . " giây trước";
    if ($diff < 3600) return floor($diff / 60) . " phút trước";
    if ($diff < 86400) return floor($diff / 3600) . " giờ trước";
    if ($diff < 2592000) return floor($diff / 86400) . " ngày trước";
    if ($diff < 31536000) return floor($diff / 2592000) . " tháng trước";
    return floor($diff / 31536000) . " năm trước";
}

$subaction = $_GET['subaction'] ?? 'new';
$page = (int)($_GET['page'] ?? 1);
$per_page = ($subaction === 'slider') ? 10 : 18; // Sửa từ 5 thành 10 cho slider
$offset = ($page - 1) * $per_page;

// Xác định truy vấn
if ($subaction === 'slider' || $subaction === 'new') {
    $sql_count = "SELECT COUNT(*) as total FROM truyen_new WHERE trang_thai_kiem_duyet = 'duyet'";
    $order_by = "ORDER BY t.thoi_gian_cap_nhat DESC";
} elseif ($subaction === 'top_rating') {
    $sql_count = "SELECT COUNT(*) as total FROM truyen_new WHERE rating > 0 AND trang_thai_kiem_duyet = 'duyet'";
    $order_by = "ORDER BY t.rating DESC, t.thoi_gian_cap_nhat DESC";
} else {
    echo json_encode(['success' => false, 'error' => 'Subaction không hợp lệ']);
    exit;
}

// Tổng số truyện
$result_count = mysqli_query($conn, $sql_count);
if (!$result_count) {
    echo json_encode(['success' => false, 'error' => 'Lỗi truy vấn tổng số truyện: ' . mysqli_error($conn)]);
    exit;
}
$total_truyen = mysqli_fetch_assoc($result_count)['total'];
$total_pages = ceil($total_truyen / $per_page);

// Danh sách truyện
$sql = "SELECT t.id, t.ten_truyen, t.anh_bia, t.is_hot, t.thoi_gian_cap_nhat, t.rating 
        FROM truyen_new t 
        WHERE t.trang_thai_kiem_duyet = 'duyet' 
        $order_by 
        LIMIT ? OFFSET ?";
$stmt = mysqli_prepare($conn, $sql);
if (!$stmt) {
    echo json_encode(['success' => false, 'error' => 'Lỗi chuẩn bị truy vấn: ' . mysqli_error($conn)]);
    exit;
}
mysqli_stmt_bind_param($stmt, "ii", $per_page, $offset);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
if (!$result) {
    echo json_encode(['success' => false, 'error' => 'Lỗi thực thi truy vấn: ' . mysqli_error($conn)]);
    exit;
}

$truyen_list = [];
while ($row = mysqli_fetch_assoc($result)) {
    // Lấy chương mới nhất
    $sql_chuong = "SELECT so_chuong, tieu_de, thoi_gian_dang 
                   FROM chuong 
                   WHERE truyen_id = ? AND trang_thai = 'da_duyet' 
                   ORDER BY thoi_gian_dang DESC LIMIT 1";
    $stmt_chuong = mysqli_prepare($conn, $sql_chuong);
    if ($stmt_chuong) {
        mysqli_stmt_bind_param($stmt_chuong, "i", $row['id']);
        mysqli_stmt_execute($stmt_chuong);
        $chuong = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt_chuong)) ?: null;
        mysqli_stmt_close($stmt_chuong);
    } else {
        $chuong = null;
        error_log("Lỗi chuẩn bị truy vấn chương: " . mysqli_error($conn));
    }

    if ($chuong) {
        $row['chuong_moi_nhat'] = "Chương " . $chuong['so_chuong'] . ": " . $chuong['tieu_de'];
        $row['chuong_moi_nhat_so_chuong'] = $chuong['so_chuong']; // Thêm số chương
        $update_time = strtotime($chuong['thoi_gian_dang']);
    } else {
        $row['chuong_moi_nhat'] = "Chưa có chương";
        $row['chuong_moi_nhat_so_chuong'] = null; // Không có chương thì để null
        $update_time = strtotime($row['thoi_gian_cap_nhat']);
    }
    $row['update_time'] = $update_time ? format_time_ago($update_time) : "Chưa cập nhật";
    
    // Sửa đường dẫn ảnh bìa
    $row['anh_bia'] = !empty($row['anh_bia']) ? "../anh/{$row['anh_bia']}" : "../anh/default-truyen.jpg";
    
    $truyen_list[] = $row;
}

mysqli_stmt_close($stmt);
echo json_encode([
    'success' => true,
    'data' => $truyen_list,
    'total_pages' => $total_pages,
    'current_page' => $page
]);
mysqli_close($conn);
?>