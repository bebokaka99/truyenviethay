<?php
header('Content-Type: application/json');
session_start();
require_once '../config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Chưa đăng nhập', 'redirect' => '/truyenviethay/users/login.html']);
    exit;
}

$user_id = $_SESSION['user_id'];
$sql_user = "SELECT role FROM users_new WHERE id = ?";
$stmt_user = mysqli_prepare($conn, $sql_user);
mysqli_stmt_bind_param($stmt_user, "i", $user_id);
mysqli_stmt_execute($stmt_user);
$user = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt_user)) ?: null;
mysqli_stmt_close($stmt_user);

if (!$user) {
    echo json_encode(['error' => 'Không tìm thấy người dùng']);
    exit;
}

$base_path = str_replace('\\', '/', $_SERVER['DOCUMENT_ROOT'] . '/truyenviethay/');

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['truyen_id'])) { // Sửa từ 'id' thành 'truyen_id'
    $truyen_id = (int)$_GET['truyen_id'];
    if ($truyen_id <= 0) {
        echo json_encode(['error' => 'Truyện không hợp lệ']);
        exit;
    }

    $sql_truyen = "SELECT * FROM truyen_new WHERE id = ?";
    $stmt_truyen = mysqli_prepare($conn, $sql_truyen);
    mysqli_stmt_bind_param($stmt_truyen, "i", $truyen_id);
    mysqli_stmt_execute($stmt_truyen);
    $truyen = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt_truyen)) ?: null;
    mysqli_stmt_close($stmt_truyen);

    if (!$truyen) {
        echo json_encode(['error' => 'Không tìm thấy truyện']);
        exit;
    }

    // Kiểm tra quyền: admin hoặc author của truyện
    if ($user['role'] !== 'admin') {
        $sql_check_author = "SELECT user_id FROM truyen_new WHERE id = ? AND user_id = ?";
        $stmt_check_author = mysqli_prepare($conn, $sql_check_author);
        mysqli_stmt_bind_param($stmt_check_author, "ii", $truyen_id, $user_id);
        mysqli_stmt_execute($stmt_check_author);
        if (mysqli_num_rows(mysqli_stmt_get_result($stmt_check_author)) == 0) {
            echo json_encode(['error' => 'Không có quyền truy cập']);
            exit;
        }
        mysqli_stmt_close($stmt_check_author);
    }

    $sql_current_theloai = "SELECT theloai_id FROM truyen_theloai WHERE truyen_id = ?";
    $stmt_current_theloai = mysqli_prepare($conn, $sql_current_theloai);
    mysqli_stmt_bind_param($stmt_current_theloai, "i", $truyen_id);
    mysqli_stmt_execute($stmt_current_theloai);
    $result = mysqli_stmt_get_result($stmt_current_theloai);
    $current_theloai = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $current_theloai[] = $row['theloai_id'];
    }
    mysqli_stmt_close($stmt_current_theloai);

    $truyen['anh_bia'] = $truyen['anh_bia'] ? "/truyenviethay/anh/{$truyen['anh_bia']}" : '';
    $truyen['theloai'] = $current_theloai;

    $sql_theloai = "SELECT * FROM theloai_new ORDER BY ten_theloai ASC";
    $result_theloai = mysqli_query($conn, $sql_theloai);
    $theloai_list = [];
    while ($row = mysqli_fetch_assoc($result_theloai)) {
        $theloai_list[] = $row;
    }

    echo json_encode([
        'success' => true,
        'truyen' => $truyen,
        'theloai_list' => $theloai_list
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $truyen_id = (int)($_POST['id'] ?? 0);
    if ($truyen_id <= 0) {
        echo json_encode(['error' => 'Truyện không hợp lệ']);
        exit;
    }

    $ten_truyen = trim($_POST['ten_truyen'] ?? '');
    $tac_gia = trim($_POST['tac_gia'] ?? '');
    $mo_ta = trim($_POST['mo_ta'] ?? '');
    $trang_thai = $_POST['trang_thai'] ?? '';
    $theloai_ids = isset($_POST['theloai']) ? array_map('intval', (array)$_POST['theloai']) : [];
    $thoi_gian_cap_nhat = date('Y-m-d H:i:s');

    $errors = [];
    if (empty($ten_truyen)) $errors['ten_truyen'] = 'Tên truyện là bắt buộc';
    if (empty($tac_gia)) $errors['tac_gia'] = 'Tác giả là bắt buộc';
    if (empty($mo_ta)) $errors['mo_ta'] = 'Mô tả là bắt buộc';
    if (empty($theloai_ids)) $errors['theloai'] = 'Vui lòng chọn ít nhất một thể loại';

    if (empty($errors)) {
        $sql_check = "SELECT id FROM truyen_new WHERE ten_truyen = ? AND id != ?";
        $stmt_check = mysqli_prepare($conn, $sql_check);
        mysqli_stmt_bind_param($stmt_check, "si", $ten_truyen, $truyen_id);
        mysqli_stmt_execute($stmt_check);
        if (mysqli_num_rows(mysqli_stmt_get_result($stmt_check)) > 0) {
            $errors['ten_truyen'] = "Tên truyện '$ten_truyen' đã tồn tại";
        }
        mysqli_stmt_close($stmt_check);
    }

    $sql_truyen = "SELECT anh_bia, user_id FROM truyen_new WHERE id = ?";
    $stmt_truyen = mysqli_prepare($conn, $sql_truyen);
    mysqli_stmt_bind_param($stmt_truyen, "i", $truyen_id);
    mysqli_stmt_execute($stmt_truyen);
    $truyen = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt_truyen)) ?: ['anh_bia' => '', 'user_id' => null];
    mysqli_stmt_close($stmt_truyen);

    // Kiểm tra quyền khi POST
    if ($user['role'] !== 'admin') {
        if ($truyen['user_id'] != $user_id) {
            echo json_encode(['error' => 'Không có quyền truy cập']);
            exit;
        }
    }

    $anh_bia = $truyen['anh_bia'];
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
                $errors['anh_bia'] = 'Thư mục upload không có quyền ghi';
            } else {
                $new_file_name = "truyen_{$truyen_id}_" . time() . '.' . $file_ext;
                $upload_path = $upload_dir . $new_file_name;
                if (move_uploaded_file($file_tmp, $upload_path)) {
                    if ($anh_bia && file_exists($upload_dir . $anh_bia)) {
                        unlink($upload_dir . $anh_bia);
                    }
                    $anh_bia = $new_file_name;
                } else {
                    $errors['anh_bia'] = 'Lỗi khi tải lên ảnh bìa';
                }
            }
        }
    }

    if (empty($errors)) {
        $sql = "UPDATE truyen_new SET ten_truyen = ?, tac_gia = ?, mo_ta = ?, trang_thai = ?, thoi_gian_cap_nhat = ?, anh_bia = ? WHERE id = ?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "ssssssi", $ten_truyen, $tac_gia, $mo_ta, $trang_thai, $thoi_gian_cap_nhat, $anh_bia, $truyen_id);
        if (mysqli_stmt_execute($stmt)) {
            $sql = "DELETE FROM truyen_theloai WHERE truyen_id = ?";
            $stmt_delete = mysqli_prepare($conn, $sql);
            mysqli_stmt_bind_param($stmt_delete, "i", $truyen_id);
            mysqli_stmt_execute($stmt_delete);
            mysqli_stmt_close($stmt_delete);

            foreach ($theloai_ids as $theloai_id) {
                $sql = "INSERT INTO truyen_theloai (truyen_id, theloai_id) VALUES (?, ?)";
                $stmt_insert = mysqli_prepare($conn, $sql);
                mysqli_stmt_bind_param($stmt_insert, "ii", $truyen_id, $theloai_id);
                mysqli_stmt_execute($stmt_insert);
                mysqli_stmt_close($stmt_insert);
            }

            echo json_encode(['success' => true, 'message' => "Cập nhật truyện thành công! Ảnh bìa: anh/$anh_bia"]);
        } else {
            $errors['database'] = 'Lỗi khi cập nhật truyện: ' . mysqli_error($conn);
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