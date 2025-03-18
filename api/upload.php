<?php
header('Content-Type: application/json');
session_start();
require_once '../config.php';

// Đặt múi giờ Việt Nam (UTC+7) cho MySQL và PHP
if (!mysqli_query($conn, "SET time_zone = '+07:00'")) {
    echo json_encode(['error' => 'Lỗi thiết lập múi giờ MySQL: ' . mysqli_error($conn)]);
    exit;
}
date_default_timezone_set('Asia/Ho_Chi_Minh');

// Kiểm tra đăng nhập
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Chưa đăng nhập', 'redirect' => '/truyenviethay/users/login.html']);
    exit;
}

$user_id = $_SESSION['user_id'];
$sql_user = "SELECT role, full_name FROM users_new WHERE id = ?";
$stmt_user = mysqli_prepare($conn, $sql_user);
mysqli_stmt_bind_param($stmt_user, "i", $user_id);
mysqli_stmt_execute($stmt_user);
$user = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt_user)) ?: null;
mysqli_stmt_close($stmt_user);

if (!$user || $user['role'] !== 'author') {
    echo json_encode(['error' => 'Chỉ tác giả mới có quyền đăng tải truyện']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT * FROM theloai_new ORDER BY ten_theloai ASC";
    $result = mysqli_query($conn, $sql);
    $theloai_list = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $theloai_list[] = $row;
    }
    echo json_encode(['success' => true, 'theloai_list' => $theloai_list, 'tac_gia' => $user['full_name']]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Debug dữ liệu gửi lên
    error_log("POST data: " . print_r($_POST, true));
    error_log("FILES data: " . print_r($_FILES, true));

    // Lấy dữ liệu từ form
    $ten_truyen = trim($_POST['ten_truyen'] ?? '');
    $tac_gia = trim($_POST['tac_gia'] ?? '');
    $mo_ta = trim($_POST['mo_ta'] ?? '');
    $theloai_ids = isset($_POST['theloai']) ? array_map('intval', (array)$_POST['theloai']) : [];
    $trang_thai = $_POST['trang_thai'] ?? '';
    $tinh_trang = $_POST['tinh_trang'] ?? '';
    $trang_thai_viet = $_POST['trang_thai_viet'] ?? '';
    $yeu_to_nhay_cam = isset($_POST['yeu_to_nhay_cam']) ? implode(',', (array)$_POST['yeu_to_nhay_cam']) : '';
    $link_nguon = $_POST['link_nguon'] ?? '';
    $muc_tieu = $_POST['muc_tieu'] ?? '';
    $doi_tuong_doc_gia = $_POST['doi_tuong_doc_gia'] ?? '';
    $chuong_mau = trim($_POST['chuong_mau'] ?? '');
    $ghi_chu_admin = trim($_POST['ghi_chu_admin'] ?? '');
    $danh_gia_noi_dung = isset($_POST['danh_gia_noi_dung']) ? (int)$_POST['danh_gia_noi_dung'] : null;
    $danh_gia_van_phong = isset($_POST['danh_gia_van_phong']) ? (int)$_POST['danh_gia_van_phong'] : null;
    $danh_gia_sang_tao = isset($_POST['danh_gia_sang_tao']) ? (int)$_POST['danh_gia_sang_tao'] : null;
    $thoi_gian_cap_nhat = date('Y-m-d H:i:s');
    $trang_thai_kiem_duyet = 'cho_duyet';

    // Debug giá trị chương mẫu
    error_log("Nội dung chương mẫu: '$chuong_mau'");

    $errors = [];
    if (empty($ten_truyen)) $errors['ten_truyen'] = 'Tên truyện là bắt buộc';
    if (empty($tac_gia)) $errors['tac_gia'] = 'Tác giả là bắt buộc';
    if (empty($mo_ta)) $errors['mo_ta'] = 'Mô tả là bắt buộc';
    if (empty($theloai_ids)) $errors['theloai'] = 'Vui lòng chọn ít nhất một thể loại';
    if (empty($chuong_mau)) {
        $errors['chuong_mau'] = 'Nội dung chương mẫu là bắt buộc';
    } else {
        // Đếm số từ trong nội dung chương mẫu
        $word_count = str_word_count($chuong_mau);
        if ($word_count < 50) {
            $errors['chuong_mau'] = 'Nội dung chương mẫu phải có ít nhất 50 từ (hiện tại: ' . $word_count . ' từ)';
        }
    }
    if (!$danh_gia_noi_dung || $danh_gia_noi_dung < 1 || $danh_gia_noi_dung > 10) {
        $errors['danh_gia_noi_dung'] = 'Đánh giá nội dung phải từ 1 đến 10';
    }
    if (!$danh_gia_van_phong || $danh_gia_van_phong < 1 || $danh_gia_van_phong > 10) {
        $errors['danh_gia_van_phong'] = 'Đánh giá văn phong phải từ 1 đến 10';
    }
    if (!$danh_gia_sang_tao || $danh_gia_sang_tao < 1 || $danh_gia_sang_tao > 10) {
        $errors['danh_gia_sang_tao'] = 'Đánh giá sáng tạo phải từ 1 đến 10';
    }

    $anh_bia = '';
    if (empty($errors) && isset($_FILES['anh_bia']) && $_FILES['anh_bia']['error'] === UPLOAD_ERR_OK) {
        $file_tmp = $_FILES['anh_bia']['tmp_name'];
        $file_name = $_FILES['anh_bia']['name'];
        $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
        $file_size = $_FILES['anh_bia']['size'];
        $allowed_exts = ['jpg', 'jpeg', 'png', 'gif'];
        $max_file_size = 5 * 1024 * 1024;

        if (!in_array($file_ext, $allowed_exts)) {
            $errors['anh_bia'] = 'Chỉ chấp nhận jpg, jpeg, png, gif';
        } elseif ($file_size > $max_file_size) {
            $errors['anh_bia'] = 'Kích thước ảnh vượt quá 5MB';
        } else {
            $upload_dir = '../anh/';
            if (!file_exists($upload_dir)) mkdir($upload_dir, 0755, true);
            if (!is_writable($upload_dir)) {
                $errors['anh_bia'] = "Thư mục 'anh/' không có quyền ghi";
            } else {
                $new_file_name = 'truyen_' . time() . '.' . $file_ext;
                $upload_path = $upload_dir . $new_file_name;
                if (move_uploaded_file($file_tmp, $upload_path)) {
                    $anh_bia = $new_file_name;
                } else {
                    $errors['anh_bia'] = 'Lỗi khi tải lên ảnh bìa';
                }
            }
        }
    } else {
        if (!isset($_FILES['anh_bia']) || $_FILES['anh_bia']['error'] !== UPLOAD_ERR_OK) {
            $errors['anh_bia'] = 'Ảnh bìa là bắt buộc';
        }
    }

    if (empty($errors)) {
        // Thêm truyện vào bảng truyen_new
        $sql = "INSERT INTO truyen_new (
                    ten_truyen, tac_gia, mo_ta, trang_thai, tinh_trang, trang_thai_viet, 
                    yeu_to_nhay_cam, link_nguon, muc_tieu, doi_tuong_doc_gia, 
                    thoi_gian_cap_nhat, anh_bia, trang_thai_kiem_duyet, user_id, 
                    ghi_chu_admin, danh_gia_noi_dung, danh_gia_van_phong, danh_gia_sang_tao
                ) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param(
            $stmt, 
            "sssssssssssssisiii", 
            $ten_truyen, $tac_gia, $mo_ta, $trang_thai, $tinh_trang, $trang_thai_viet, 
            $yeu_to_nhay_cam, $link_nguon, $muc_tieu, $doi_tuong_doc_gia, 
            $thoi_gian_cap_nhat, $anh_bia, $trang_thai_kiem_duyet, $user_id, 
            $ghi_chu_admin, $danh_gia_noi_dung, $danh_gia_van_phong, $danh_gia_sang_tao
        );
        if (mysqli_stmt_execute($stmt)) {
            $new_truyen_id = mysqli_insert_id($conn);
            foreach ($theloai_ids as $theloai_id) {
                $sql = "INSERT INTO truyen_theloai (truyen_id, theloai_id) VALUES (?, ?)";
                $stmt_theloai = mysqli_prepare($conn, $sql);
                mysqli_stmt_bind_param($stmt_theloai, "ii", $new_truyen_id, $theloai_id);
                mysqli_stmt_execute($stmt_theloai);
                mysqli_stmt_close($stmt_theloai);
            }

            // Lưu chương mẫu với is_chuong_mau = 1
            $so_chuong = 0; // Chương mẫu vẫn giữ so_chuong = 0
            $thoi_gian_dang = $thoi_gian_cap_nhat;
            $trang_thai_chuong = 'cho_duyet';
            $is_chuong_mau = 1;
            $sql_chuong = "INSERT INTO chuong (truyen_id, so_chuong, noi_dung_chuong_mau, thoi_gian_dang, trang_thai, is_chuong_mau) 
                           VALUES (?, ?, ?, ?, ?, ?)";
            $stmt_chuong = mysqli_prepare($conn, $sql_chuong);
            if (!$stmt_chuong) {
                $errors['database'] = 'Lỗi chuẩn bị câu lệnh SQL cho chương mẫu: ' . mysqli_error($conn);
                error_log("Lỗi chuẩn bị câu lệnh chuong: " . mysqli_error($conn));
            } else {
                mysqli_stmt_bind_param($stmt_chuong, "iissii", $new_truyen_id, $so_chuong, $chuong_mau, $thoi_gian_dang, $trang_thai_chuong, $is_chuong_mau);
                if (mysqli_stmt_execute($stmt_chuong)) {
                    error_log("Chương mẫu lưu thành công cho truyen_id: $new_truyen_id với is_chuong_mau = 1");
                } else {
                    $errors['chuong_mau'] = 'Lỗi khi lưu chương mẫu: ' . mysqli_error($conn);
                    error_log("Lỗi lưu chương mẫu cho truyen_id $new_truyen_id: " . mysqli_error($conn));
                }
                mysqli_stmt_close($stmt_chuong);
            }

            if (empty($errors)) {
                echo json_encode(['success' => true, 'message' => 'Đăng tải truyện thành công! Đang chờ admin kiểm duyệt']);
            } else {
                echo json_encode(['errors' => $errors]);
            }
        } else {
            $errors['database'] = 'Lỗi khi đăng tải truyện: ' . mysqli_error($conn);
            echo json_encode(['errors' => $errors]);
        }
        mysqli_stmt_close($stmt);
    } else {
        echo json_encode(['errors' => $errors]);
    }
    exit;
}

echo json_encode(['error' => 'Phương thức không hợp lệ']);
mysqli_close($conn);
?>