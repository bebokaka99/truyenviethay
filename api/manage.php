<?php
ob_start(); // Bật buffer
session_start();
header('Content-Type: application/json');
require_once '../config.php';

$data = ['success' => false];

// Kiểm tra đăng nhập
if (!isset($_SESSION['user_id'])) {
    $data['error'] = 'Chưa đăng nhập';
    $data['redirect'] = '/truyenviethay/users/login.html';
    echo json_encode($data);
    exit;
}

$user_id = $_SESSION['user_id'];
$sql_user = "SELECT role FROM users_new WHERE id = ?";
$stmt_user = mysqli_prepare($conn, $sql_user);
mysqli_stmt_bind_param($stmt_user, "i", $user_id);
mysqli_stmt_execute($stmt_user);
$user = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt_user)) ?: null;
mysqli_stmt_close($stmt_user);

if (!$user || !in_array($user['role'], ['admin', 'author'])) {
    $data['error'] = 'Không có quyền truy cập';
    echo json_encode($data);
    exit;
}

$base_path = str_replace('\\', '/', $_SERVER['DOCUMENT_ROOT'] . '/truyenviethay/');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'add') {
    $ten_truyen = trim($_POST['ten_truyen'] ?? '');
    $tac_gia = trim($_POST['tac_gia'] ?? '');
    $mo_ta = trim($_POST['mo_ta'] ?? '');
    $the_loai_input = trim($_POST['the_loai'] ?? '');
    $trang_thai = $_POST['trang_thai'] ?? '';
    $tinh_trang = $_POST['tinh_trang'] ?? '';
    $thoi_gian_cap_nhat = date('Y-m-d H:i:s');
    $trang_thai_kiem_duyet = 'cho_duyet';

    $errors = [];
    if (empty($ten_truyen)) $errors['ten_truyen'] = 'Tên truyện là bắt buộc';
    if (empty($tac_gia)) $errors['tac_gia'] = 'Tác giả là bắt buộc';
    if (empty($mo_ta)) $errors['mo_ta'] = 'Mô tả là bắt buộc';

    if (empty($errors)) {
        $sql_check = "SELECT id FROM truyen_new WHERE ten_truyen = ?";
        $stmt_check = mysqli_prepare($conn, $sql_check);
        if (!$stmt_check) {
            $data['error'] = 'Lỗi chuẩn bị truy vấn kiểm tra: ' . mysqli_error($conn);
            echo json_encode($data);
            exit;
        }
        mysqli_stmt_bind_param($stmt_check, "s", $ten_truyen);
        mysqli_stmt_execute($stmt_check);
        if (mysqli_stmt_num_rows(mysqli_stmt_get_result($stmt_check)) > 0) {
            $errors['ten_truyen'] = "Tên truyện '$ten_truyen' đã tồn tại";
        }
        mysqli_stmt_close($stmt_check);
    }

    $anh_bia = '';
    if (empty($errors) && isset($_FILES['anh_bia']) && $_FILES['anh_bia']['error'] === UPLOAD_ERR_OK) {
        $file_tmp = $_FILES['anh_bia']['tmp_name'];
        $file_name = $_FILES['anh_bia']['name'];
        $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
        $allowed_exts = ['jpg', 'jpeg', 'png', 'gif'];

        if (!in_array($file_ext, $allowed_exts)) {
            $errors['anh_bia'] = 'Chỉ chấp nhận jpg, jpeg, png, gif';
        } else {
            $upload_dir = $base_path . 'anh/';
            if (!file_exists($upload_dir)) mkdir($upload_dir, 0755, true);
            if (!is_writable($upload_dir)) {
                $errors['anh_bia'] = 'Thư mục upload không có quyền ghi';
            } else {
                $sanitized_ten_truyen = preg_replace("/[^a-zA-Z0-9]/", "_", $ten_truyen);
                $new_file_name = $sanitized_ten_truyen . '_' . time() . '.' . $file_ext;
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
        $sql = "INSERT INTO truyen_new (ten_truyen, tac_gia, mo_ta, trang_thai, trang_thai_kiem_duyet, thoi_gian_cap_nhat, anh_bia, user_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = mysqli_prepare($conn, $sql);
        if (!$stmt) {
            $data['error'] = 'Lỗi chuẩn bị truy vấn insert: ' . mysqli_error($conn);
            echo json_encode($data);
            exit;
        }
        mysqli_stmt_bind_param($stmt, "sssssssi", $ten_truyen, $tac_gia, $mo_ta, $tinh_trang, $trang_thai_kiem_duyet, $thoi_gian_cap_nhat, $anh_bia, $user_id);
        if (mysqli_stmt_execute($stmt)) {
            $new_truyen_id = mysqli_insert_id($conn);
            if (!empty($the_loai_input)) {
                $the_loai_list = array_map('trim', explode(',', $the_loai_input));
                foreach ($the_loai_list as $ten_theloai) {
                    $sql_theloai = "SELECT id_theloai FROM theloai_new WHERE ten_theloai = ?";
                    $stmt_theloai = mysqli_prepare($conn, $sql_theloai);
                    if (!$stmt_theloai) {
                        $data['error'] = 'Lỗi chuẩn bị truy vấn thể loại: ' . mysqli_error($conn);
                        echo json_encode($data);
                        exit;
                    }
                    mysqli_stmt_bind_param($stmt_theloai, "s", $ten_theloai);
                    mysqli_stmt_execute($stmt_theloai);
                    $result = mysqli_stmt_get_result($stmt_theloai);
                    if ($row = mysqli_fetch_assoc($result)) {
                        $theloai_id = $row['id_theloai'];
                    } else {
                        $sql_insert_theloai = "INSERT INTO theloai_new (ten_theloai) VALUES (?)";
                        $stmt_insert_theloai = mysqli_prepare($conn, $sql_insert_theloai);
                        if (!$stmt_insert_theloai) {
                            $data['error'] = 'Lỗi insert thể loại mới: ' . mysqli_error($conn);
                            echo json_encode($data);
                            exit;
                        }
                        mysqli_stmt_bind_param($stmt_insert_theloai, "s", $ten_theloai);
                        mysqli_stmt_execute($stmt_insert_theloai);
                        $theloai_id = mysqli_insert_id($conn);
                        mysqli_stmt_close($stmt_insert_theloai);
                    }
                    mysqli_stmt_close($stmt_theloai);

                    $sql_truyen_theloai = "INSERT INTO truyen_theloai (truyen_id, theloai_id) VALUES (?, ?)";
                    $stmt_truyen_theloai = mysqli_prepare($conn, $sql_truyen_theloai);
                    if (!$stmt_truyen_theloai) {
                        $data['error'] = 'Lỗi insert truyen_theloai: ' . mysqli_error($conn);
                        echo json_encode($data);
                        exit;
                    }
                    mysqli_stmt_bind_param($stmt_truyen_theloai, "ii", $new_truyen_id, $theloai_id);
                    mysqli_stmt_execute($stmt_truyen_theloai);
                    mysqli_stmt_close($stmt_truyen_theloai);
                }
            }
            $data['success'] = true;
            $data['message'] = "Thêm truyện thành công! ID: $new_truyen_id";
        } else {
            $data['error'] = 'Lỗi khi thêm truyện: ' . mysqli_error($conn);
        }
        mysqli_stmt_close($stmt);
    } else {
        $data['errors'] = $errors;
    }
    echo json_encode($data);
    exit;
}

// Xử lý DELETE và GET giữ nguyên (copy từ code cũ của mày)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'delete') {
    $truyen_id = (int)($_POST['id'] ?? 0);
    $sql_check = "SELECT user_id FROM truyen_new WHERE id = ?";
    $stmt_check = mysqli_prepare($conn, $sql_check);
    mysqli_stmt_bind_param($stmt_check, "i", $truyen_id);
    mysqli_stmt_execute($stmt_check);
    $truyen = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt_check)) ?: null;
    mysqli_stmt_close($stmt_check);

    if (!$truyen) {
        $data['error'] = 'Truyện không tồn tại';
    } elseif ($user['role'] !== 'admin' && $truyen['user_id'] != $user_id) {
        $data['error'] = 'Không có quyền xóa truyện này';
    } else {
        mysqli_begin_transaction($conn);
        try {
            $sql = "DELETE FROM truyen_theloai WHERE truyen_id = ?";
            $stmt = mysqli_prepare($conn, $sql);
            mysqli_stmt_bind_param($stmt, "i", $truyen_id);
            mysqli_stmt_execute($stmt);
            mysqli_stmt_close($stmt);

            $sql = "DELETE FROM truyen_new WHERE id = ?";
            $stmt = mysqli_prepare($conn, $sql);
            mysqli_stmt_bind_param($stmt, "i", $truyen_id);
            if (!mysqli_stmt_execute($stmt)) {
                throw new Exception("Lỗi khi xóa truyện: " . mysqli_error($conn));
            }
            mysqli_stmt_close($stmt);

            mysqli_commit($conn);
            $data['success'] = true;
            $data['message'] = 'Xóa truyện thành công';
        } catch (Exception $e) {
            mysqli_rollback($conn);
            $data['error'] = $e->getMessage();
        }
    }
    echo json_encode($data);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $per_page = 10;
    $page = max(1, (int)($_GET['page'] ?? 1));
    $start = ($page - 1) * $per_page;

    $search = isset($_GET['search']) ? '%' . trim($_GET['search']) . '%' : '';
    $status = isset($_GET['status']) ? trim($_GET['status']) : '';

    if ($user['role'] === 'admin') {
        $sql_truyen = "SELECT t.id, t.ten_truyen, t.thoi_gian_cap_nhat, t.tac_gia, t.anh_bia, 
                            (SELECT COUNT(*) FROM chuong c WHERE c.truyen_id = t.id AND c.trang_thai = 'da_duyet') as so_chuong, 
                            (SELECT COUNT(*) FROM chuong c WHERE c.truyen_id = t.id AND c.trang_thai = 'cho_duyet') as chuong_chua_duyet 
                       FROM truyen_new t WHERE t.trang_thai_kiem_duyet = 'duyet'";
        $sql_count = "SELECT COUNT(*) as total FROM truyen_new WHERE trang_thai_kiem_duyet = 'duyet'";
        $params = [];
        $types = '';

        if ($search) {
            $sql_truyen .= " AND (t.ten_truyen LIKE ? OR t.tac_gia LIKE ?)";
            $sql_count .= " AND (ten_truyen LIKE ? OR tac_gia LIKE ?)";
            $params[] = $search;
            $params[] = $search;
            $types .= 'ss';
        }

        if ($status) {
            $sql_truyen .= " AND t.trang_thai = ?";
            $sql_count .= " AND trang_thai = ?";
            $params[] = $status;
            $types .= 's';
        }

        $sql_truyen .= " ORDER BY (SELECT COUNT(*) FROM chuong c WHERE c.truyen_id = t.id AND c.trang_thai = 'cho_duyet') DESC, t.thoi_gian_cap_nhat DESC LIMIT $start, $per_page";
        $stmt_truyen = mysqli_prepare($conn, $sql_truyen);
        if ($params) {
            mysqli_stmt_bind_param($stmt_truyen, $types, ...$params);
        }
        mysqli_stmt_execute($stmt_truyen);
        $result_truyen = mysqli_stmt_get_result($stmt_truyen);

        $stmt_count = mysqli_prepare($conn, $sql_count);
        if ($params) {
            mysqli_stmt_bind_param($stmt_count, $types, ...$params);
        }
        mysqli_stmt_execute($stmt_count);
        $result_count = mysqli_stmt_get_result($stmt_count);
    } else {
        $sql_truyen = "SELECT t.id, t.ten_truyen, t.thoi_gian_cap_nhat, t.tac_gia, t.anh_bia, 
                            (SELECT COUNT(*) FROM chuong c WHERE c.truyen_id = t.id AND c.trang_thai = 'da_duyet') as so_chuong, 
                            (SELECT COUNT(*) FROM chuong c WHERE c.truyen_id = t.id AND c.trang_thai = 'cho_duyet') as chuong_chua_duyet 
                       FROM truyen_new t WHERE t.user_id = ? AND t.trang_thai_kiem_duyet = 'duyet'";
        $sql_count = "SELECT COUNT(*) as total FROM truyen_new WHERE user_id = ? AND trang_thai_kiem_duyet = 'duyet'";
        $params = [$user_id];
        $types = 'i';

        if ($search) {
            $sql_truyen .= " AND (t.ten_truyen LIKE ? OR t.tac_gia LIKE ?)";
            $sql_count .= " AND (ten_truyen LIKE ? OR tac_gia LIKE ?)";
            $params[] = $search;
            $params[] = $search;
            $types .= 'ss';
        }

        if ($status) {
            $sql_truyen .= " AND t.trang_thai = ?";
            $sql_count .= " AND trang_thai = ?";
            $params[] = $status;
            $types .= 's';
        }

        $sql_truyen .= " ORDER BY t.thoi_gian_cap_nhat DESC LIMIT $start, $per_page";
        $stmt_truyen = mysqli_prepare($conn, $sql_truyen);
        mysqli_stmt_bind_param($stmt_truyen, $types, ...$params);
        mysqli_stmt_execute($stmt_truyen);
        $result_truyen = mysqli_stmt_get_result($stmt_truyen);

        $stmt_count = mysqli_prepare($conn, $sql_count);
        mysqli_stmt_bind_param($stmt_count, $types, ...$params);
        mysqli_stmt_execute($stmt_count);
        $result_count = mysqli_stmt_get_result($stmt_count);
    }

    $truyen_list = [];
    while ($row = mysqli_fetch_assoc($result_truyen)) {
        $row['anh_bia'] = $row['anh_bia'] ? "/truyenviethay/anh/{$row['anh_bia']}" : "/truyenviethay/anh/default-truyen.jpg";
        $row['thoi_gian_cap_nhat'] = $row['thoi_gian_cap_nhat'] ? date('d/m/Y H:i', strtotime($row['thoi_gian_cap_nhat'])) : 'Chưa cập nhật';
        $truyen_list[] = $row;
    }
    $total_truyen = mysqli_fetch_assoc($result_count)['total'];
    $total_pages = ceil($total_truyen / $per_page);

    $data['success'] = true;
    $data['data'] = $truyen_list;
    $data['pagination'] = ['total' => $total_truyen, 'per_page' => $per_page, 'current_page' => $page, 'total_pages' => $total_pages];
    echo json_encode($data);
    exit;
}

$data['error'] = 'Phương thức không hợp lệ';
echo json_encode($data);

mysqli_close($conn);
ob_end_flush();
?>