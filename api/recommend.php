<?php
ob_start();
header('Content-Type: application/json');
session_start();
require_once 'db.php';

$user_id = $_SESSION['user_id'] ?? null;
$truyen_id = $_GET['truyen_id'] ?? null;

// Hàm lấy truyện từ database
function fetchTruyen($conn, $sql, $params = []) {
    $stmt = mysqli_prepare($conn, $sql);
    if ($params) {
        mysqli_stmt_bind_param($stmt, str_repeat('i', count($params)), ...$params);
    }
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $data = mysqli_fetch_all($result, MYSQLI_ASSOC);
    mysqli_stmt_close($stmt);
    return $data;
}

// Gợi ý cho index
$index_truyen = [];
if ($user_id) {
    $sql = "SELECT DISTINCT tn.id, tn.ten_truyen, tn.tac_gia, tn.anh_bia, tn.rating, tn.thoi_gian_cap_nhat
            FROM truyen_new tn
            JOIN truyen_theloai tt ON tn.id = tt.truyen_id
            WHERE tt.theloai_id IN (
                SELECT tt2.theloai_id FROM theo_doi td 
                JOIN truyen_theloai tt2 ON td.truyen_id = tt2.truyen_id 
                WHERE td.user_id = ?
            )
            AND tn.id NOT IN (
                SELECT truyen_id FROM theo_doi WHERE user_id = ?
            )
            ORDER BY RAND() LIMIT 5";
    $theo_doi_truyen = fetchTruyen($conn, $sql, [$user_id, $user_id]);
    $index_truyen = array_merge($index_truyen, $theo_doi_truyen);

    // 6 truyện từ lich_su_doc_new
    $sql = "SELECT DISTINCT tn.id, tn.ten_truyen, tn.tac_gia, tn.anh_bia, tn.rating, tn.thoi_gian_cap_nhat
            FROM truyen_new tn
            JOIN truyen_theloai tt ON tn.id = tt.truyen_id
            WHERE tt.theloai_id IN (
                SELECT tt2.theloai_id FROM lich_su_doc_new lsd 
                JOIN truyen_theloai tt2 ON lsd.truyen_id = tt2.truyen_id 
                WHERE lsd.user_id = ?
            )
            AND tn.id NOT IN (
                SELECT truyen_id FROM lich_su_doc_new WHERE user_id = ?
            )
            ORDER BY RAND() LIMIT 5";
    $lich_su_truyen = fetchTruyen($conn, $sql, [$user_id, $user_id]);
    $index_truyen = array_merge($index_truyen, $lich_su_truyen);

    // 6 truyện random top rating
    $used_ids = !empty($index_truyen) ? implode(',', array_column($index_truyen, 'id')) : '0';
    $sql = "SELECT id, ten_truyen, tac_gia, anh_bia, rating, thoi_gian_cap_nhat
            FROM truyen_new
            WHERE id NOT IN ($used_ids)
            ORDER BY rating DESC LIMIT 6";
    $random_truyen = fetchTruyen($conn, $sql);
    $index_truyen = array_merge($index_truyen, $random_truyen);
} else {
    // Khi chưa đăng nhập: Lấy 18 truyện ngẫu nhiên từ tất cả truyện
    $sql = "SELECT id, ten_truyen, tac_gia, anh_bia, rating, thoi_gian_cap_nhat
            FROM truyen_new
            ORDER BY RAND() LIMIT 16";
    $index_truyen = fetchTruyen($conn, $sql);
}

// Gợi ý cho chi tiết
$detail_truyen = [];
if ($user_id && $truyen_id) {
    // 6 truyện từ truyện hiện tại
    $sql = "SELECT DISTINCT tn.id, tn.ten_truyen, tn.tac_gia, tn.anh_bia, tn.rating, tn.thoi_gian_cap_nhat
            FROM truyen_new tn
            JOIN truyen_theloai tt ON tn.id = tt.truyen_id
            WHERE tt.theloai_id IN (
                SELECT theloai_id FROM truyen_theloai WHERE truyen_id = ?
            )
            AND tn.id != ?
            ORDER BY RAND() LIMIT 6";
    $current_truyen = fetchTruyen($conn, $sql, [$truyen_id, $truyen_id]);
    $detail_truyen = array_merge($detail_truyen, $current_truyen);

    // 6 truyện từ theo_doi
    $used_ids = !empty($detail_truyen) ? implode(',', array_column($detail_truyen, 'id')) : '0';
    $sql = "SELECT DISTINCT tn.id, tn.ten_truyen, tn.tac_gia, tn.anh_bia, tn.rating, tn.thoi_gian_cap_nhat
            FROM truyen_new tn
            JOIN truyen_theloai tt ON tn.id = tt.truyen_id
            WHERE tt.theloai_id IN (
                SELECT tt2.theloai_id FROM theo_doi td 
                JOIN truyen_theloai tt2 ON td.truyen_id = tt2.truyen_id 
                WHERE td.user_id = ?
            )
            AND tn.id NOT IN ($used_ids)
            ORDER BY RAND() LIMIT 6";
    $theo_doi_truyen = fetchTruyen($conn, $sql, [$user_id]);
    $detail_truyen = array_merge($detail_truyen, $theo_doi_truyen);

    // 6 truyện random top rating
    $used_ids = !empty($detail_truyen) ? implode(',', array_column($detail_truyen, 'id')) : '0';
    $sql = "SELECT id, ten_truyen, tac_gia, anh_bia, rating, thoi_gian_cap_nhat
            FROM truyen_new
            WHERE id NOT IN ($used_ids)
            ORDER BY rating DESC LIMIT 6";
    $random_truyen = fetchTruyen($conn, $sql);
    $detail_truyen = array_merge($detail_truyen, $random_truyen);
} elseif ($truyen_id) {
    // Khi chưa đăng nhập nhưng có truyen_id: Lấy 18 truyện ngẫu nhiên
    $sql = "SELECT id, ten_truyen, tac_gia, anh_bia, rating, thoi_gian_cap_nhat
            FROM truyen_new
            ORDER BY RAND() LIMIT 16";
    $detail_truyen = fetchTruyen($conn, $sql);
}

// Trả dữ liệu JSON
echo json_encode([
    'index_recommend' => $index_truyen,
    'detail_recommend' => $detail_truyen
]);

mysqli_close($conn);
ob_end_flush();
?>