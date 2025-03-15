<?php
header('Content-Type: application/json');
session_start();
require_once '../config.php';

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
    $ten_truyen = trim($_POST['ten_truyen'] ?? '');
    $tac_gia = trim($_POST['tac_gia'] ?? '');
    $mo_ta = trim($_POST['mo_ta'] ?? '');
    $theloai_ids = isset($_POST['theloai']) ? array_map('intval', (array)$_POST['theloai']) : [];
    $trang_thai = $_POST['trang_thai'] ?? '';
    $tinh_trang = $_POST['tinh_trang'] ?? '';
    $thoi_gian_cap_nhat = date('Y-m-d H:i:s');
    $trang_thai_kiem_duyet = 'cho_duyet';

    $errors = [];
    if (empty($ten_truyen)) $errors['ten_truyen'] = 'Tên truyện là bắt buộc';
    if (empty($tac_gia)) $errors['tac_gia'] = 'Tác giả là bắt buộc';
    if (empty($mo_ta)) $errors['mo_ta'] = 'Mô tả là bắt buộc';
    if (empty($theloai_ids)) $errors['theloai'] = 'Vui lòng chọn ít nhất một thể loại';

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
    }

    if (empty($errors)) {
        $sql = "INSERT INTO truyen_new (ten_truyen, tac_gia, mo_ta, trang_thai, tinh_trang, thoi_gian_cap_nhat, anh_bia, trang_thai_kiem_duyet, user_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "ssssssssi", $ten_truyen, $tac_gia, $mo_ta, $trang_thai, $tinh_trang, $thoi_gian_cap_nhat, $anh_bia, $trang_thai_kiem_duyet, $user_id);
        if (mysqli_stmt_execute($stmt)) {
            $new_truyen_id = mysqli_insert_id($conn);
            foreach ($theloai_ids as $theloai_id) {
                $sql = "INSERT INTO truyen_theloai (truyen_id, theloai_id) VALUES (?, ?)";
                $stmt_theloai = mysqli_prepare($conn, $sql);
                mysqli_stmt_bind_param($stmt_theloai, "ii", $new_truyen_id, $theloai_id);
                mysqli_stmt_execute($stmt_theloai);
                mysqli_stmt_close($stmt_theloai);
            }
            echo json_encode(['success' => true, 'message' => 'Đăng tải truyện thành công! Đang chờ admin kiểm duyệt']);
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