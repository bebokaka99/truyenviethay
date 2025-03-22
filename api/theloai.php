<?php
header('Content-Type: application/json');
session_start();
require_once '../config.php';

// Đặt múi giờ Việt Nam (UTC+7)
mysqli_query($conn, "SET time_zone = '+07:00'");
date_default_timezone_set('Asia/Ho_Chi_Minh');

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

function syncChaptersToDatabase($conn, $truyen_id) {
    // Đồng bộ từ file hệ thống (nếu có)
    $chapter_dir = __DIR__ . "/../truyen/noidung/{$truyen_id}/";
    if (is_dir($chapter_dir)) {
        for ($i = 1; $i <= 1000; $i++) {
            $chapter_file = $chapter_dir . "chapter{$i}.txt";
            if (file_exists($chapter_file)) {
                $noi_dung = file_get_contents($chapter_file);
                $thoi_gian_dang = date('Y-m-d H:i:s', filemtime($chapter_file));
                $trang_thai = 'da_duyet'; // Đặt trạng thái mặc định là 'da_duyet'

                // Kiểm tra xem chương đã tồn tại chưa
                $sql_check = "SELECT id FROM chuong WHERE truyen_id = ? AND so_chuong = ?";
                $stmt_check = mysqli_prepare($conn, $sql_check);
                mysqli_stmt_bind_param($stmt_check, "ii", $truyen_id, $i);
                mysqli_stmt_execute($stmt_check);
                $result_check = mysqli_stmt_get_result($stmt_check);

                if (mysqli_num_rows($result_check) == 0) {
                    // Thêm chương mới vào bảng chuong
                    $sql_insert = "INSERT INTO chuong (truyen_id, so_chuong, noi_dung, thoi_gian_dang, trang_thai) VALUES (?, ?, ?, ?, ?)";
                    $stmt_insert = mysqli_prepare($conn, $sql_insert);
                    mysqli_stmt_bind_param($stmt_insert, "iisss", $truyen_id, $i, $noi_dung, $thoi_gian_dang, $trang_thai);
                    mysqli_stmt_execute($stmt_insert);
                    mysqli_stmt_close($stmt_insert);
                }
                mysqli_stmt_close($stmt_check);
            }
        }
    }

    // Cập nhật cột chuong_moi trong bảng truyen_new dựa trên bảng chuong
    $sql_latest_chapter = "SELECT so_chuong 
                           FROM chuong 
                           WHERE truyen_id = ? AND trang_thai = 'da_duyet' 
                           ORDER BY so_chuong DESC LIMIT 1";
    $stmt_latest_chapter = mysqli_prepare($conn, $sql_latest_chapter);
    mysqli_stmt_bind_param($stmt_latest_chapter, "i", $truyen_id);
    mysqli_stmt_execute($stmt_latest_chapter);
    $result_latest_chapter = mysqli_stmt_get_result($stmt_latest_chapter);
    $latest_chapter = mysqli_fetch_assoc($result_latest_chapter);

    if ($latest_chapter && isset($latest_chapter['so_chuong'])) {
        $chuong_moi = $latest_chapter['so_chuong'];
        $sql_update = "UPDATE truyen_new SET chuong_moi = ? WHERE id = ?";
        $stmt_update = mysqli_prepare($conn, $sql_update);
        mysqli_stmt_bind_param($stmt_update, "ii", $chuong_moi, $truyen_id);
        mysqli_stmt_execute($stmt_update);
        mysqli_stmt_close($stmt_update);
    } else {
        // Nếu không có chương, đặt chuong_moi là 0
        $chuong_moi = 0;
        $sql_update = "UPDATE truyen_new SET chuong_moi = ? WHERE id = ?";
        $stmt_update = mysqli_prepare($conn, $sql_update);
        mysqli_stmt_bind_param($stmt_update, "ii", $chuong_moi, $truyen_id);
        mysqli_stmt_execute($stmt_update);
        mysqli_stmt_close($stmt_update);
    }
    mysqli_stmt_close($stmt_latest_chapter);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $subaction = $_GET['subaction'] ?? 'list';

    if ($subaction === 'categories') {
        $sql = "SELECT * FROM theloai_new ORDER BY ten_theloai ASC";
        $result = mysqli_query($conn, $sql);
        if ($result === false) {
            echo json_encode(['success' => false, 'error' => 'Lỗi truy vấn database: ' . mysqli_error($conn)]);
            exit;
        }
        $theloai_list = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $theloai_list[] = $row;
        }
        echo json_encode(['success' => true, 'data' => $theloai_list]);
        exit;
    }

    if ($subaction === 'years') {
        $sql = "SELECT DISTINCT YEAR(thoi_gian_cap_nhat) as nam FROM truyen_new WHERE thoi_gian_cap_nhat IS NOT NULL AND trang_thai_kiem_duyet = 'duyet' ORDER BY nam DESC";
        $result = mysqli_query($conn, $sql);
        if ($result === false) {
            echo json_encode(['success' => false, 'error' => 'Lỗi truy vấn database: ' . mysqli_error($conn)]);
            exit;
        }
        $nam_dang_list = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $nam_dang_list[] = $row['nam'];
        }
        echo json_encode(['success' => true, 'data' => $nam_dang_list]);
        exit;
    }

    // Khai báo các biến mặc định
    $selected_theloai = $_GET['theloai'] ?? [];
    if (!is_array($selected_theloai)) $selected_theloai = [];
    $selected_trang_thai = $_GET['trang_thai'] ?? '';
    $selected_rating = isset($_GET['rating']) ? (int)$_GET['rating'] : 0;
    $sort_by = $_GET['sort'] ?? 'thoi_gian_cap_nhat_desc';
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $per_page = 18;
    $offset = ($page - 1) * $per_page;

    // Xây dựng truy vấn
    $sql_truyen = "SELECT DISTINCT t.id, t.ten_truyen, t.anh_bia, t.thoi_gian_cap_nhat, t.rating, t.chuong_moi ";
    $sql_count = "SELECT COUNT(DISTINCT t.id) as total ";
    $from_clause = "FROM truyen_new t ";
    $where_clause = "WHERE t.trang_thai_kiem_duyet = 'duyet' ";
    $join_clause = "";
    $order_clause = "ORDER BY ";

    if (!empty($selected_theloai)) {
        $selected_theloai = array_map('intval', $selected_theloai);
        $theloai_ids = implode(',', $selected_theloai);
        $join_clause .= "LEFT JOIN truyen_theloai tt ON t.id = tt.truyen_id ";
        $where_clause .= "AND tt.theloai_id IN ($theloai_ids) ";
    }

    if (!empty($selected_trang_thai)) {
        $selected_trang_thai = mysqli_real_escape_string($conn, $selected_trang_thai);
        $where_clause .= "AND t.trang_thai = '$selected_trang_thai' ";
    }

    if ($selected_rating > 0) {
        $where_clause .= "AND t.rating >= $selected_rating ";
    }

    switch ($sort_by) {
        case 'name_asc':
            $order_clause .= "t.ten_truyen ASC";
            break;
        case 'rating_desc':
            $order_clause .= "t.rating DESC, t.thoi_gian_cap_nhat DESC";
            break;
        case 'thoi_gian_cap_nhat_desc':
        default:
            $order_clause .= "t.thoi_gian_cap_nhat DESC";
            break;
    }

    // Truy vấn tổng số truyện
    $sql_count .= $from_clause . $join_clause . $where_clause;
    $result_count = mysqli_query($conn, $sql_count);
    if ($result_count === false) {
        echo json_encode(['success' => false, 'error' => 'Lỗi đếm tổng truyện: ' . mysqli_error($conn)]);
        exit;
    }
    $total_truyen = mysqli_fetch_assoc($result_count)['total'];
    $total_pages = ceil($total_truyen / $per_page);

    // Truy vấn danh sách truyện
    $sql_truyen .= $from_clause . $join_clause . $where_clause . $order_clause . " LIMIT $per_page OFFSET $offset";
    $result_truyen = mysqli_query($conn, $sql_truyen);
    if ($result_truyen === false) {
        echo json_encode(['success' => false, 'error' => 'Lỗi truy vấn truyện: ' . mysqli_error($conn)]);
        exit;
    }

    $truyen_list = [];
    while ($row = mysqli_fetch_assoc($result_truyen)) {
        $truyen_id = $row['id'];
        syncChaptersToDatabase($conn, $truyen_id);

        // Lấy chương mới nhất từ bảng chuong
        $sql_chapters = "SELECT so_chuong as latest_chapter, so_chuong as chuong_so_chuong, thoi_gian_dang as latest_time 
                         FROM chuong 
                         WHERE truyen_id = ? AND trang_thai = 'da_duyet' 
                         ORDER BY so_chuong DESC LIMIT 1";
        $stmt_chapters = mysqli_prepare($conn, $sql_chapters);
        mysqli_stmt_bind_param($stmt_chapters, "i", $truyen_id);
        mysqli_stmt_execute($stmt_chapters);
        $chapter_data = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt_chapters)) ?: ['chuong_so_chuong' => null, 'latest_chapter' => null, 'latest_time' => null];
        $chapter_so_chuong = $chapter_data['chuong_so_chuong'];
        $chapter_latest = $chapter_data['latest_chapter'] ? "Chương {$chapter_data['latest_chapter']}" : "Chưa có chương";
        $chapter_time = $chapter_data['latest_time'] ? strtotime($chapter_data['latest_time']) : strtotime($row['thoi_gian_cap_nhat']);
        $row['update_time'] = $chapter_time ? format_time_ago($chapter_time) : "Chưa cập nhật";
        $row['chuong_moi_nhat'] = $chapter_latest;
        $row['chuong_moi_nhat_so_chuong'] = $chapter_so_chuong; // Trả về số chương (so_chuong)
        $row['anh_bia'] = file_exists(__DIR__ . "/../anh/{$row['anh_bia']}") ? "/truyenviethay/anh/{$row['anh_bia']}" : "/truyenviethay/anh/default.jpg";
        $truyen_list[] = $row;
        mysqli_stmt_close($stmt_chapters);
    }

    echo json_encode([
        'success' => true,
        'data' => $truyen_list,
        'pagination' => [
            'total' => $total_truyen,
            'per_page' => $per_page,
            'current_page' => $page,
            'total_pages' => $total_pages
        ]
    ]);
    exit;
}

echo json_encode(['error' => 'Phương thức không hợp lệ']);
mysqli_close($conn);
?>