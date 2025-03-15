<?php
header('Content-Type: application/json');
session_start();
require_once '../config.php';

function format_time_ago($timestamp) {
    $now = time();
    $diff = $now - $timestamp;
    if ($diff < 60) return $diff . " giây trước";
    elseif ($diff < 3600) return floor($diff / 60) . " phút trước";
    elseif ($diff < 86400) return floor($diff / 3600) . " giờ trước";
    elseif ($diff < 2592000) return floor($diff / 86400) . " ngày trước";
    elseif ($diff < 31536000) return floor($diff / 2592000) . " tháng trước";
    else return floor($diff / 31536000) . " năm trước";
}

$keyword = trim($_GET['q'] ?? '');
$page = (int)($_GET['page'] ?? 1);
$per_page = 18;
$offset = ($page - 1) * $per_page;

if (empty($keyword)) {
    echo json_encode(['success' => false, 'message' => 'Vui lòng nhập từ khóa để tìm kiếm']);
    exit;
}

$search_keyword = "%" . mysqli_real_escape_string($conn, $keyword) . "%";

$sql_count = "SELECT COUNT(DISTINCT t.id) as total 
              FROM truyen_new t 
              LEFT JOIN truyen_theloai tt ON t.id = tt.truyen_id 
              LEFT JOIN theloai_new tl ON tt.theloai_id = tl.id_theloai 
              WHERE t.ten_truyen LIKE ? OR tl.ten_theloai LIKE ?";
$stmt_count = mysqli_prepare($conn, $sql_count);
mysqli_stmt_bind_param($stmt_count, "ss", $search_keyword, $search_keyword);
mysqli_stmt_execute($stmt_count);
$total_truyen = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt_count))['total'];
$total_pages = ceil($total_truyen / $per_page);
mysqli_stmt_close($stmt_count);

$sql = "SELECT DISTINCT t.id, t.ten_truyen, t.anh_bia, t.is_hot, t.thoi_gian_cap_nhat, t.rating 
        FROM truyen_new t 
        LEFT JOIN truyen_theloai tt ON t.id = tt.truyen_id 
        LEFT JOIN theloai_new tl ON tt.theloai_id = tl.id_theloai 
        WHERE t.ten_truyen LIKE ? OR tl.ten_theloai LIKE ? 
        ORDER BY t.thoi_gian_cap_nhat DESC 
        LIMIT ? OFFSET ?";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "ssii", $search_keyword, $search_keyword, $per_page, $offset);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$truyen_list = [];

while ($row = mysqli_fetch_assoc($result)) {
    $sql_chuong = "SELECT so_chuong, tieu_de, thoi_gian_dang 
                   FROM chuong 
                   WHERE truyen_id = ? AND trang_thai = 'da_duyet' 
                   ORDER BY so_chuong DESC LIMIT 1";
    $stmt_chuong = mysqli_prepare($conn, $sql_chuong);
    mysqli_stmt_bind_param($stmt_chuong, "i", $row['id']);
    mysqli_stmt_execute($stmt_chuong);
    $chuong = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt_chuong)) ?: null;
    mysqli_stmt_close($stmt_chuong);

    if ($chuong) {
        $row['chuong_moi_nhat'] = "Chương " . $chuong['so_chuong'] . ": " . $chuong['tieu_de'];
        $row['update_time'] = format_time_ago(strtotime($chuong['thoi_gian_dang']));
    } else {
        $row['chuong_moi_nhat'] = "Chưa có chương";
        $update_time = strtotime($row['thoi_gian_cap_nhat']);
        $row['update_time'] = $update_time ? format_time_ago($update_time) : "Chưa cập nhật";
    }
    $truyen_list[] = $row;
}
mysqli_stmt_close($stmt);

echo json_encode([
    'success' => true,
    'data' => $truyen_list,
    'total_pages' => $total_pages,
    'current_page' => $page,
    'keyword' => $keyword
]);
mysqli_close($conn);