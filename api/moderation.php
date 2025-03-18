<?php
header('Content-Type: application/json');
session_start();
require_once '../config.php';

// Bắt đầu buffer để kiểm soát đầu ra
ob_start();

// Đặt múi giờ Việt Nam (UTC+7) cho MySQL và PHP
if (!mysqli_query($conn, "SET time_zone = '+07:00'")) {
    echo json_encode(['error' => 'Lỗi thiết lập múi giờ MySQL: ' . mysqli_error($conn)]);
    ob_end_flush();
    exit;
}
date_default_timezone_set('Asia/Ho_Chi_Minh');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Chưa đăng nhập']);
    ob_end_flush();
    exit;
}

// Kiểm tra quyền admin
$sql_check_role = "SELECT role FROM users_new WHERE id = ?";
$stmt_check = mysqli_prepare($conn, $sql_check_role);
if ($stmt_check === false) {
    echo json_encode(['error' => 'Lỗi chuẩn bị câu lệnh kiểm tra quyền: ' . mysqli_error($conn)]);
    ob_end_flush();
    exit;
}
mysqli_stmt_bind_param($stmt_check, "i", $_SESSION['user_id']);
mysqli_stmt_execute($stmt_check);
$result_check = mysqli_stmt_get_result($stmt_check);
$user = mysqli_fetch_assoc($result_check);

if (!$user || $user['role'] !== 'admin') {
    echo json_encode(['error' => 'Không có quyền truy cập']);
    ob_end_flush();
    exit;
}
mysqli_stmt_close($stmt_check);

// Xử lý POST request (duyệt/từ chối truyện)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $truyen_id = (int)$_POST['truyen_id'];
    $action = $_POST['action'];
    $status = $action === 'approve' ? 'duyet' : ($action === 'reject' ? 'tu_choi' : '');
    if ($status) {
        $current_time = date('Y-m-d H:i:s');
        $sql = "UPDATE truyen_new SET trang_thai_kiem_duyet = ?, thoi_gian_cap_nhat = ? WHERE id = ?";
        $stmt = mysqli_prepare($conn, $sql);
        if ($stmt === false) {
            echo json_encode(['error' => 'Lỗi chuẩn bị câu lệnh SQL: ' . mysqli_error($conn)]);
            ob_end_flush();
            exit;
        }
        mysqli_stmt_bind_param($stmt, "ssi", $status, $current_time, $truyen_id);
        if (mysqli_stmt_execute($stmt)) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => 'Lỗi thực thi SQL: ' . mysqli_error($conn)]);
        }
        mysqli_stmt_close($stmt);
        ob_end_flush();
        exit;
    }
    echo json_encode(['error' => 'Hành động không hợp lệ']);
    ob_end_flush();
    exit;
}

// Xử lý GET request (lấy danh sách truyện hoặc chi tiết truyện)
$action = $_GET['action'] ?? '';

if ($action === 'moderation_detail') {
    $truyen_id = (int)($_GET['truyen_id'] ?? 0);
    if ($truyen_id <= 0) {
        echo json_encode(['error' => 'ID truyện không hợp lệ']);
        ob_end_flush();
        exit;
    }

    // Lấy thông tin chi tiết truyện
    $sql = "SELECT t.id, t.ten_truyen, t.mo_ta, t.tac_gia, t.anh_bia, t.thoi_gian_cap_nhat, 
                   t.trang_thai, t.tinh_trang, t.trang_thai_viet, t.link_nguon, 
                   t.doi_tuong_doc_gia, t.yeu_to_nhay_cam, t.muc_tieu, t.danh_gia_noi_dung, 
                   t.danh_gia_van_phong, t.danh_gia_sang_tao, t.ghi_chu_admin, u.full_name as tac_gia_name 
            FROM truyen_new t 
            JOIN users_new u ON t.user_id = u.id 
            WHERE t.id = ? AND t.trang_thai_kiem_duyet = 'cho_duyet'";
    $stmt = mysqli_prepare($conn, $sql);
    if ($stmt === false) {
        $error = 'Lỗi chuẩn bị câu lệnh SQL: ' . mysqli_error($conn);
        error_log($error);
        echo json_encode(['error' => $error]);
        ob_end_flush();
        exit;
    }
    mysqli_stmt_bind_param($stmt, "i", $truyen_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $truyen = mysqli_fetch_assoc($result);
    mysqli_stmt_close($stmt);

    if (!$truyen) {
        $error = 'Truyện không tồn tại hoặc không ở trạng thái chờ duyệt';
        error_log($error . " (truyen_id: $truyen_id)");
        echo json_encode(['error' => $error]);
        ob_end_flush();
        exit;
    }

    // Lấy danh sách thể loại của truyện
    $sql_theloai = "SELECT tl.ten_theloai 
                    FROM truyen_theloai tt 
                    JOIN theloai_new tl ON tt.theloai_id = tl.id_theloai 
                    WHERE tt.truyen_id = ?";
    $stmt_theloai = mysqli_prepare($conn, $sql_theloai);
    if ($stmt_theloai === false) {
        $error = 'Lỗi chuẩn bị câu lệnh lấy thể loại: ' . mysqli_error($conn);
        error_log($error);
        echo json_encode(['error' => $error]);
        ob_end_flush();
        exit;
    }
    mysqli_stmt_bind_param($stmt_theloai, "i", $truyen_id);
    mysqli_stmt_execute($stmt_theloai);
    $result_theloai = mysqli_stmt_get_result($stmt_theloai);

    $theloai_list = [];
    while ($theloai = mysqli_fetch_assoc($result_theloai)) {
        $theloai_list[] = $theloai['ten_theloai'];
    }
    mysqli_stmt_close($stmt_theloai);

    // Lấy nội dung chương mẫu với is_chuong_mau = 1
    $chuong_mau = null;
    $sql_chuong_mau = "SELECT noi_dung_chuong_mau 
                       FROM chuong 
                       WHERE truyen_id = ? AND is_chuong_mau = 1 
                       LIMIT 1";
    $stmt_chuong_mau = mysqli_prepare($conn, $sql_chuong_mau);
    if ($stmt_chuong_mau === false) {
        $error = 'Lỗi chuẩn bị câu lệnh lấy chương mẫu: ' . mysqli_error($conn);
        error_log($error);
        echo json_encode(['error' => $error]);
        ob_end_flush();
        exit;
    }
    mysqli_stmt_bind_param($stmt_chuong_mau, "i", $truyen_id);
    if (mysqli_stmt_execute($stmt_chuong_mau)) {
        $result_chuong_mau = mysqli_stmt_get_result($stmt_chuong_mau);
        $chuong_mau = mysqli_fetch_assoc($result_chuong_mau);
        error_log("Chương mẫu cho truyen_id $truyen_id: " . print_r($chuong_mau, true));
    } else {
        error_log('Lỗi thực thi câu lệnh lấy chương mẫu: ' . mysqli_error($conn));
    }
    mysqli_stmt_close($stmt_chuong_mau);

    // Gán nội dung chương mẫu (nếu có)
    $truyen['chuong_mau'] = $chuong_mau ? $chuong_mau['noi_dung_chuong_mau'] : null;

    // Gán danh sách thể loại dưới dạng chuỗi
    $truyen['the_loai'] = !empty($theloai_list) ? implode(', ', $theloai_list) : 'Chưa có thể loại';

    // Xử lý nguồn truyện
    $truyen['nguon_truyen'] = $truyen['link_nguon'] ? $truyen['link_nguon'] : 'Chưa có nguồn';

    // Xử lý cảnh báo nội dung
    $truyen['canh_bao_noi_dung'] = $truyen['doi_tuong_doc_gia'] ? $truyen['doi_tuong_doc_gia'] : 'Chưa có thông tin';

    // Xử lý yếu tố nhạy cảm
    $truyen['yeu_to_nhay_cam'] = $truyen['yeu_to_nhay_cam'] ? $truyen['yeu_to_nhay_cam'] : 'Không có';

    // Xử lý mục tiêu của truyện
    $truyen['muc_tieu'] = $truyen['muc_tieu'] ? $truyen['muc_tieu'] : 'Chưa có thông tin';

    // Xử lý đánh giá ban đầu
    $truyen['danh_gia'] = $truyen['danh_gia_noi_dung'] && $truyen['danh_gia_van_phong'] && $truyen['danh_gia_sang_tao']
        ? "Nội dung: {$truyen['danh_gia_noi_dung']}, Văn phong: {$truyen['danh_gia_van_phong']}, Sáng tạo: {$truyen['danh_gia_sang_tao']}"
        : 'Chưa có đánh giá';

    // Xử lý đường dẫn ảnh bìa
    $truyen['anh_bia'] = !empty($truyen['anh_bia']) ? "../anh/{$truyen['anh_bia']}" : "../anh/default-truyen.jpg";

    // Debug dữ liệu trước khi trả về
    error_log('Dữ liệu truyện gửi về: ' . print_r($truyen, true));

    echo json_encode(['success' => true, 'truyen' => $truyen]);
    ob_end_flush();
    exit;
}

// Lấy danh sách truyện chờ duyệt (action mặc định)
$sql = "SELECT t.id, t.ten_truyen, t.mo_ta, t.tac_gia, t.anh_bia, t.thoi_gian_cap_nhat, 
        u.full_name as tac_gia_name 
        FROM truyen_new t 
        JOIN users_new u ON t.user_id = u.id 
        WHERE t.trang_thai_kiem_duyet = 'cho_duyet'";
$result = mysqli_query($conn, $sql);
if ($result === false) {
    echo json_encode(['error' => 'Lỗi truy vấn SQL: ' . mysqli_error($conn)]);
    ob_end_flush();
    exit;
}

$truyen_list = [];
while ($row = mysqli_fetch_assoc($result)) {
    // Lấy danh sách thể loại của truyện
    $truyen_id = $row['id'];
    $sql_theloai = "SELECT tl.ten_theloai 
                    FROM truyen_theloai tt 
                    JOIN theloai_new tl ON tt.theloai_id = tl.id_theloai 
                    WHERE tt.truyen_id = ?";
    $stmt_theloai = mysqli_prepare($conn, $sql_theloai);
    if ($stmt_theloai === false) {
        echo json_encode(['error' => 'Lỗi chuẩn bị câu lệnh lấy thể loại: ' . mysqli_error($conn)]);
        ob_end_flush();
        exit;
    }
    mysqli_stmt_bind_param($stmt_theloai, "i", $truyen_id);
    mysqli_stmt_execute($stmt_theloai);
    $result_theloai = mysqli_stmt_get_result($stmt_theloai);

    $theloai_list = [];
    while ($theloai = mysqli_fetch_assoc($result_theloai)) {
        $theloai_list[] = $theloai['ten_theloai'];
    }
    mysqli_stmt_close($stmt_theloai);

    // Gán danh sách thể loại dưới dạng chuỗi
    $row['the_loai'] = !empty($theloai_list) ? implode(', ', $theloai_list) : 'Chưa có thể loại';
    // Xử lý đường dẫn ảnh bìa
    $row['anh_bia'] = !empty($row['anh_bia']) ? "../anh/{$row['anh_bia']}" : "../anh/default-truyen.jpg";
    $truyen_list[] = $row;
}

echo json_encode(['success' => true, 'truyen_list' => $truyen_list]);

// Xóa buffer và gửi đầu ra
ob_end_flush();
mysqli_close($conn);
?>