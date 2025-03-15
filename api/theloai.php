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

function syncChaptersToDatabase($conn, $truyen_id) {
    $chapter_dir = __DIR__ . "/../truyen/noidung/{$truyen_id}/";
    if (is_dir($chapter_dir)) {
        for ($i = 1; $i <= 1000; $i++) {
            $chapter_file = $chapter_dir . "chapter{$i}.txt";
            if (file_exists($chapter_file)) {
                $noi_dung = file_get_contents($chapter_file);
                $thoi_gian_dang = date('Y-m-d H:i:s', filemtime($chapter_file));
                $sql_check = "SELECT id FROM chuong WHERE truyen_id = ? AND so_chuong = ?";
                $stmt_check = mysqli_prepare($conn, $sql_check);
                mysqli_stmt_bind_param($stmt_check, "ii", $truyen_id, $i);
                mysqli_stmt_execute($stmt_check);
                $result_check = mysqli_stmt_get_result($stmt_check);
                if (mysqli_num_rows($result_check) == 0) {
                    $sql_insert = "INSERT INTO chuong (truyen_id, so_chuong, noi_dung, thoi_gian_dang) VALUES (?, ?, ?, ?)";
                    $stmt_insert = mysqli_prepare($conn, $sql_insert);
                    mysqli_stmt_bind_param($stmt_insert, "iiss", $truyen_id, $i, $noi_dung, $thoi_gian_dang);
                    mysqli_stmt_execute($stmt_insert);
                    mysqli_stmt_close($stmt_insert);
                }
                mysqli_stmt_close($stmt_check);
            }
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $action = $_GET['subaction'] ?? 'list';

    if ($action === 'categories') {
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
        if (empty($theloai_list)) {
            echo json_encode(['success' => true, 'data' => [], 'message' => 'Chưa có thể loại nào']);
        } else {
            echo json_encode(['success' => true, 'data' => $theloai_list]);
        }
        exit;
    }

    if ($action === 'years') {
        $sql = "SELECT DISTINCT YEAR(thoi_gian_cap_nhat) as nam FROM truyen_new WHERE thoi_gian_cap_nhat IS NOT NULL ORDER BY nam DESC";
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

    $selected_theloai = isset($_GET['theloai']) ? json_decode($_GET['theloai'], true) : [];
    $selected_loai_truyen = $_GET['loai_truyen'] ?? '';
    $selected_trang_thai = $_GET['trang_thai'] ?? '';
    $selected_rating = (int)($_GET['rating'] ?? 0);
    $selected_nam_dang = $_GET['nam_dang'] ?? '';
    $sort_by = $_GET['sort'] ?? 'thoi_gian_cap_nhat_desc';
    $page = (int)($_GET['page'] ?? 1);
    $per_page = 18;
    $offset = ($page - 1) * $per_page;

    $sql_truyen = "SELECT DISTINCT t.id, t.ten_truyen, t.anh_bia, t.thoi_gian_cap_nhat, t.rating ";
    $sql_count = "SELECT COUNT(DISTINCT t.id) as total ";
    $from_clause = "FROM truyen_new t ";
    $where_clause = "";
    $join_clause = "";
    $order_clause = "ORDER BY ";

    if (!empty($selected_theloai)) {
        $selected_theloai = array_map('intval', $selected_theloai);
        $theloai_ids = implode(',', $selected_theloai);
        $join_clause .= "JOIN truyen_theloai tt ON t.id = tt.id_truyen ";
        $where_clause = "WHERE tt.id_theloai IN ($theloai_ids) ";
    }

    if (!empty($selected_loai_truyen)) {
        $selected_loai_truyen = mysqli_real_escape_string($conn, $selected_loai_truyen);
        $where_clause .= ($where_clause ? "AND " : "WHERE ") . "t.loai_truyen = '$selected_loai_truyen' ";
    }

    if (!empty($selected_trang_thai)) {
        $selected_trang_thai = mysqli_real_escape_string($conn, $selected_trang_thai);
        $where_clause .= ($where_clause ? "AND " : "WHERE ") . "t.tinh_trang = '$selected_trang_thai' ";
    }

    if ($selected_rating > 0) {
        $where_clause .= ($where_clause ? "AND " : "WHERE ") . "t.rating >= $selected_rating ";
    }

    if (!empty($selected_nam_dang)) {
        if ($selected_nam_dang == 'older') {
            $where_clause .= ($where_clause ? "AND " : "WHERE ") . "YEAR(t.thoi_gian_cap_nhat) < 2010 ";
        } else {
            $selected_nam_dang = (int)$selected_nam_dang;
            $where_clause .= ($where_clause ? "AND " : "WHERE ") . "YEAR(t.thoi_gian_cap_nhat) = $selected_nam_dang ";
        }
    }

    switch ($sort_by) {
        case 'name_asc': $order_clause .= "t.ten_truyen ASC"; break;
        case 'rating_desc': $order_clause .= "t.rating DESC, t.thoi_gian_cap_nhat DESC"; break;
        case 'top_day':
            $where_clause .= ($where_clause ? "AND " : "WHERE ") . "t.thoi_gian_cap_nhat >= DATE_SUB(NOW(), INTERVAL 1 DAY) ";
            $order_clause .= "t.luot_xem DESC"; break;
        case 'top_week':
            $where_clause .= ($where_clause ? "AND " : "WHERE ") . "t.thoi_gian_cap_nhat >= DATE_SUB(NOW(), INTERVAL 1 WEEK) ";
            $order_clause .= "t.luot_xem DESC"; break;
        case 'top_month':
            $where_clause .= ($where_clause ? "AND " : "WHERE ") . "t.thoi_gian_cap_nhat >= DATE_SUB(NOW(), INTERVAL 1 MONTH) ";
            $order_clause .= "t.luot_xem DESC"; break;
        case 'top_year':
            $where_clause .= ($where_clause ? "AND " : "WHERE ") . "t.thoi_gian_cap_nhat >= DATE_SUB(NOW(), INTERVAL 1 YEAR) ";
            $order_clause .= "t.luot_xem DESC"; break;
        default: $order_clause .= "t.thoi_gian_cap_nhat DESC"; break;
    }

    $sql_count .= $from_clause . $join_clause . $where_clause;
    $result_count = mysqli_query($conn, $sql_count);
    if ($result_count === false) {
        echo json_encode(['success' => false, 'error' => 'Lỗi đếm tổng truyện: ' . mysqli_error($conn)]);
        exit;
    }
    $total_truyen = mysqli_fetch_assoc($result_count)['total'];
    $total_pages = ceil($total_truyen / $per_page);

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
        $sql_chapters = "SELECT MAX(so_chuong) as latest_chapter, MAX(thoi_gian_dang) as latest_time FROM chuong WHERE truyen_id = ?";
        $stmt_chapters = mysqli_prepare($conn, $sql_chapters);
        mysqli_stmt_bind_param($stmt_chapters, "i", $truyen_id);
        mysqli_stmt_execute($stmt_chapters);
        $chapter_data = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt_chapters)) ?: ['latest_chapter' => null, 'latest_time' => null];
        $chapter_latest = $chapter_data['latest_chapter'] ? "Chapter {$chapter_data['latest_chapter']}" : "Chưa có chương";
        $chapter_time = $chapter_data['latest_time'] ? strtotime($chapter_data['latest_time']) : strtotime($row['thoi_gian_cap_nhat']);
        $row['update_time'] = $chapter_time ? format_time_ago($chapter_time) : "Chưa cập nhật";
        $row['chuong_moi_nhat'] = $chapter_latest;
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