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

if (!$user || !in_array($user['role'], ['admin', 'author'])) {
    echo json_encode(['error' => 'Không có quyền truy cập']);
    exit;
}

$truyen_id = (int)($_GET['truyen_id'] ?? $_POST['truyen_id'] ?? 0);
if ($truyen_id <= 0) {
    echo json_encode(['error' => 'ID truyện không hợp lệ']);
    exit;
}

$sql_truyen = "SELECT user_id FROM truyen_new WHERE id = ?";
$stmt_truyen = mysqli_prepare($conn, $sql_truyen);
mysqli_stmt_bind_param($stmt_truyen, "i", $truyen_id);
mysqli_stmt_execute($stmt_truyen);
$truyen = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt_truyen)) ?: null;
mysqli_stmt_close($stmt_truyen);

if (!$truyen) {
    echo json_encode(['error' => 'Truyện không tồn tại']);
    exit;
}

$is_author = ($user['role'] === 'author' && $truyen['user_id'] == $user_id);
$is_admin = ($user['role'] === 'admin');
if (!$is_admin && !$is_author) {
    echo json_encode(['error' => 'Không có quyền quản lý chương của truyện này']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT * FROM chuong WHERE truyen_id = ? ORDER BY so_chuong DESC";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "i", $truyen_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $chuong_list = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $row['thoi_gian_dang'] = $row['thoi_gian_dang'] ? date('d/m/Y H:i', strtotime($row['thoi_gian_dang'])) : 'Chưa đăng';
        $chuong_list[] = $row;
    }
    mysqli_stmt_close($stmt);

    $sql_truyen_name = "SELECT ten_truyen FROM truyen_new WHERE id = ?";
    $stmt_truyen_name = mysqli_prepare($conn, $sql_truyen_name);
    mysqli_stmt_bind_param($stmt_truyen_name, "i", $truyen_id);
    mysqli_stmt_execute($stmt_truyen_name);
    $ten_truyen = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt_truyen_name))['ten_truyen'] ?? '';
    mysqli_stmt_close($stmt_truyen_name);

    echo json_encode([
        'success' => true,
        'data' => $chuong_list,
        'ten_truyen' => $ten_truyen,
        'is_admin' => $is_admin,
        'is_author' => $is_author
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'add' && $is_author) {
        $so_chuong = (int)$_POST['so_chuong'];
        $tieu_de = trim($_POST['tieu_de']);
        $noi_dung = trim($_POST['noi_dung']);
        $trang_thai = 'cho_duyet';
        $thoi_gian_dang = date('Y-m-d H:i:s');
        $luot_xem = 0;

        if (empty($tieu_de) || empty($noi_dung)) {
            echo json_encode(['error' => 'Tiêu đề và nội dung không được để trống']);
            exit;
        }

        $sql = "SELECT id FROM chuong WHERE truyen_id = ? AND so_chuong = ? AND trang_thai IN ('cho_duyet', 'da_duyet')";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "ii", $truyen_id, $so_chuong);
        mysqli_stmt_execute($stmt);
        if (mysqli_stmt_num_rows(mysqli_stmt_get_result($stmt)) > 0) {
            echo json_encode(['error' => "Chương $so_chuong đã tồn tại"]);
            exit;
        }
        mysqli_stmt_close($stmt);

        $sql = "INSERT INTO chuong (truyen_id, so_chuong, tieu_de, noi_dung, thoi_gian_dang, luot_xem, trang_thai) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "iisssis", $truyen_id, $so_chuong, $tieu_de, $noi_dung, $thoi_gian_dang, $luot_xem, $trang_thai);
        if (mysqli_stmt_execute($stmt)) {
            $sql = "UPDATE truyen_new SET thoi_gian_cap_nhat = ? WHERE id = ?";
            $stmt_update = mysqli_prepare($conn, $sql);
            mysqli_stmt_bind_param($stmt_update, "si", $thoi_gian_dang, $truyen_id);
            mysqli_stmt_execute($stmt_update);
            mysqli_stmt_close($stmt_update);
            echo json_encode(['success' => true, 'message' => 'Thêm chương thành công! (Chờ phê duyệt)']);
        } else {
            echo json_encode(['error' => 'Thêm chương thất bại: ' . mysqli_error($conn)]);
        }
        mysqli_stmt_close($stmt);
        exit;
    }

    if ($action === 'approve' && $is_admin) {
        $chapter_id = (int)$_POST['chapter_id'];
        $thoi_gian_dang = date('Y-m-d H:i:s');
        $sql = "UPDATE chuong SET trang_thai = 'da_duyet', thoi_gian_dang = ? WHERE id = ? AND truyen_id = ?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "sii", $thoi_gian_dang, $chapter_id, $truyen_id);
        if (mysqli_stmt_execute($stmt)) {
            $sql = "UPDATE truyen_new SET thoi_gian_cap_nhat = ? WHERE id = ?";
            $stmt_update = mysqli_prepare($conn, $sql);
            mysqli_stmt_bind_param($stmt_update, "si", $thoi_gian_dang, $truyen_id);
            mysqli_stmt_execute($stmt_update);
            mysqli_stmt_close($stmt_update);
            echo json_encode(['success' => true, 'message' => 'Phê duyệt chương thành công']);
        } else {
            echo json_encode(['error' => 'Phê duyệt thất bại: ' . mysqli_error($conn)]);
        }
        mysqli_stmt_close($stmt);
        exit;
    }

    if ($action === 'reject' && $is_admin) {
        $chapter_id = (int)$_POST['chapter_id'];
        $ly_do_tu_choi = trim($_POST['ly_do_tu_choi']);
        if (empty($ly_do_tu_choi)) {
            echo json_encode(['error' => 'Vui lòng nhập lý do từ chối']);
            exit;
        }
        $sql = "UPDATE chuong SET trang_thai = 'tu_choi', ly_do_tu_choi = ? WHERE id = ? AND truyen_id = ?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "sii", $ly_do_tu_choi, $chapter_id, $truyen_id);
        if (mysqli_stmt_execute($stmt)) {
            echo json_encode(['success' => true, 'message' => 'Từ chối chương thành công']);
        } else {
            echo json_encode(['error' => 'Từ chối thất bại: ' . mysqli_error($conn)]);
        }
        mysqli_stmt_close($stmt);
        exit;
    }

    if ($action === 'delete' && ($is_admin || $is_author)) {
        $chapter_id = (int)$_POST['chapter_id'];
        $sql = "SELECT trang_thai FROM chuong WHERE id = ? AND truyen_id = ?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "ii", $chapter_id, $truyen_id);
        mysqli_stmt_execute($stmt);
        $status = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt))['trang_thai'] ?? '';
        mysqli_stmt_close($stmt);

        if (!in_array($status, ['cho_duyet', 'tu_choi'])) {
            echo json_encode(['error' => "Chỉ có thể xóa chương ở trạng thái 'Chờ duyệt' hoặc 'Từ chối'"]);
            exit;
        }

        $sql = "DELETE FROM chuong WHERE id = ? AND truyen_id = ?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "ii", $chapter_id, $truyen_id);
        if (mysqli_stmt_execute($stmt)) {
            echo json_encode(['success' => true, 'message' => 'Xóa chương thành công']);
        } else {
            echo json_encode(['error' => 'Xóa thất bại: ' . mysqli_error($conn)]);
        }
        mysqli_stmt_close($stmt);
        exit;
    }

    if ($action === 'update' && $is_author) {
        $chapter_id = (int)$_POST['chapter_id'];
        $so_chuong = (int)$_POST['so_chuong'];
        $tieu_de = trim($_POST['tieu_de']);
        $noi_dung = trim($_POST['noi_dung']);
        $trang_thai = 'cho_duyet';

        if (empty($tieu_de) || empty($noi_dung)) {
            echo json_encode(['error' => 'Tiêu đề và nội dung không được để trống']);
            exit;
        }

        $sql = "SELECT id FROM chuong WHERE truyen_id = ? AND so_chuong = ? AND id != ? AND trang_thai IN ('cho_duyet', 'da_duyet')";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "iii", $truyen_id, $so_chuong, $chapter_id);
        mysqli_stmt_execute($stmt);
        if (mysqli_stmt_num_rows(mysqli_stmt_get_result($stmt)) > 0) {
            echo json_encode(['error' => "Chương $so_chuong đã tồn tại"]);
            exit;
        }
        mysqli_stmt_close($stmt);

        $sql = "UPDATE chuong SET so_chuong = ?, tieu_de = ?, noi_dung = ?, trang_thai = ? WHERE id = ? AND truyen_id = ?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "isssii", $so_chuong, $tieu_de, $noi_dung, $trang_thai, $chapter_id, $truyen_id);
        if (mysqli_stmt_execute($stmt)) {
            echo json_encode(['success' => true, 'message' => 'Cập nhật chương thành công']);
        } else {
            echo json_encode(['error' => 'Cập nhật thất bại: ' . mysqli_error($conn)]);
        }
        mysqli_stmt_close($stmt);
        exit;
    }

    echo json_encode(['error' => 'Hành động không hợp lệ']);
    exit;
}

echo json_encode(['error' => 'Phương thức không hợp lệ']);
mysqli_close($conn);