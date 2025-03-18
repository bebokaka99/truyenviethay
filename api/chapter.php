<?php
header('Content-Type: application/json');
session_start();
require_once '../config.php';

// Đặt múi giờ Việt Nam (UTC+7) và kiểm tra lỗi
if (!mysqli_query($conn, "SET time_zone = '+07:00'")) {
    error_log("Lỗi set múi giờ MySQL: " . mysqli_error($conn));
    echo json_encode(['error' => 'Lỗi set múi giờ MySQL: ' . mysqli_error($conn)]);
    exit;
}
date_default_timezone_set('Asia/Ho_Chi_Minh');

// Kiểm tra kết nối DB
if (!$conn) {
    echo json_encode(['error' => 'Không thể kết nối đến database: ' . mysqli_connect_error()]);
    exit;
}

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Chưa đăng nhập', 'redirect' => '/truyenviethay/users/login.html']);
    exit;
}

$user_id = $_SESSION['user_id'];
$sql_user = "SELECT role FROM users_new WHERE id = ?";
$stmt_user = mysqli_prepare($conn, $sql_user);
mysqli_stmt_bind_param($stmt_user, "i", $user_id);
mysqli_stmt_execute($stmt_user);
$user_result = mysqli_stmt_get_result($stmt_user);
$user = mysqli_fetch_assoc($user_result) ?: null;
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
$truyen_result = mysqli_stmt_get_result($stmt_truyen);
$truyen = mysqli_fetch_assoc($truyen_result) ?: null;
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

    // Thêm log để debug
    error_log("Chapter API Response: " . json_encode([
        'success' => true,
        'data' => $chuong_list,
        'ten_truyen' => $ten_truyen,
        'is_admin' => $is_admin,
        'is_author' => $is_author
    ]));

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

        // Kiểm tra chương đã tồn tại
        $sql = "SELECT id FROM chuong WHERE truyen_id = ? AND so_chuong = ? AND trang_thai IN ('cho_duyet', 'da_duyet')";
        $stmt = mysqli_prepare($conn, $sql);
        if (!$stmt) {
            echo json_encode(['error' => 'Lỗi chuẩn bị câu truy vấn: ' . mysqli_error($conn)]);
            exit;
        }
        mysqli_stmt_bind_param($stmt, "ii", $truyen_id, $so_chuong);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        if ($result === false) {
            error_log("Lỗi lấy kết quả kiểm tra chương: " . mysqli_error($conn));
            echo json_encode(['error' => 'Lỗi kiểm tra chương tồn tại: ' . mysqli_error($conn)]);
            mysqli_stmt_close($stmt);
            exit;
        }
        if (mysqli_num_rows($result) > 0) {
            echo json_encode(['error' => "Chương $so_chuong đã tồn tại"]);
            mysqli_stmt_close($stmt);
            exit;
        }
        mysqli_stmt_close($stmt);

        // Thêm chương mới (không cập nhật thoi_gian_cap_nhat)
        $sql = "INSERT INTO chuong (truyen_id, so_chuong, tieu_de, noi_dung, thoi_gian_dang, luot_xem, trang_thai) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = mysqli_prepare($conn, $sql);
        if (!$stmt) {
            echo json_encode(['error' => 'Lỗi chuẩn bị câu truy vấn INSERT: ' . mysqli_error($conn)]);
            exit;
        }
        mysqli_stmt_bind_param($stmt, "iisssis", $truyen_id, $so_chuong, $tieu_de, $noi_dung, $thoi_gian_dang, $luot_xem, $trang_thai);
        if (mysqli_stmt_execute($stmt)) {
            echo json_encode(['success' => true, 'message' => 'Thêm chương thành công! (Chờ phê duyệt)']);
        } else {
            error_log("Lỗi thêm chương: " . mysqli_error($conn));
            echo json_encode(['error' => 'Thêm chương thất bại: ' . mysqli_error($conn)]);
        }
        mysqli_stmt_close($stmt);
        exit;
    }

    if ($action === 'approve' && $is_admin) {
        $chapter_id = (int)$_POST['chapter_id'];
        $truyen_id = (int)$_POST['truyen_id']; // Đảm bảo lấy từ POST
        if ($truyen_id <= 0) {
            echo json_encode(['error' => 'ID truyện không hợp lệ']);
            exit;
        }
        $thoi_gian_dang = date('Y-m-d H:i:s');
        $sql = "UPDATE chuong SET trang_thai = 'da_duyet', thoi_gian_dang = ? WHERE id = ? AND truyen_id = ?";
        $stmt = mysqli_prepare($conn, $sql);
        if (!$stmt) {
            echo json_encode(['error' => 'Lỗi chuẩn bị duyệt chương: ' . mysqli_error($conn)]);
            exit;
        }
        mysqli_stmt_bind_param($stmt, "sii", $thoi_gian_dang, $chapter_id, $truyen_id);
        if (mysqli_stmt_execute($stmt)) {
            $sql = "UPDATE truyen_new SET thoi_gian_cap_nhat = ? WHERE id = ?";
            $stmt_update = mysqli_prepare($conn, $sql);
            if (!$stmt_update) {
                error_log("Lỗi chuẩn bị cập nhật thoi_gian_cap_nhat: " . mysqli_error($conn));
                echo json_encode(['error' => 'Lỗi chuẩn bị cập nhật thời gian']);
                mysqli_stmt_close($stmt);
                exit;
            }
            mysqli_stmt_bind_param($stmt_update, "si", $thoi_gian_dang, $truyen_id);
            if (mysqli_stmt_execute($stmt_update)) {
                if (mysqli_stmt_affected_rows($stmt_update) == 0) {
                    error_log("Không tìm thấy truyện để cập nhật: truyen_id=$truyen_id");
                    echo json_encode(['error' => 'Không tìm thấy truyện để cập nhật thời gian']);
                    mysqli_stmt_close($stmt_update);
                    mysqli_stmt_close($stmt);
                    exit;
                }
                error_log("Cập nhật thoi_gian_cap_nhat thành công: truyen_id=$truyen_id, thoi_gian_cap_nhat=$thoi_gian_dang");
                echo json_encode(['success' => true, 'message' => 'Phê duyệt chương thành công']);
            } else {
                error_log("Lỗi cập nhật thoi_gian_cap_nhat: " . mysqli_error($conn));
                echo json_encode(['error' => 'Cập nhật thời gian truyện thất bại: ' . mysqli_error($conn)]);
            }
            mysqli_stmt_close($stmt_update);
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

        // Cho phép xóa cả trạng thái 'da_duyet' cho admin
        if (!in_array($status, ['cho_duyet', 'tu_choi', 'da_duyet'])) {
            echo json_encode(['error' => "Chỉ có thể xóa chương ở trạng thái 'Chờ duyệt', 'Từ chối' hoặc 'Đã duyệt'"]);
            exit;
        }

        // Xóa các bản ghi trong lich_su_doc_new trước khi xóa chương
        $sql_delete_history = "DELETE FROM lich_su_doc_new WHERE chuong_id = ?";
        $stmt_delete_history = mysqli_prepare($conn, $sql_delete_history);
        mysqli_stmt_bind_param($stmt_delete_history, "i", $chapter_id);
        if (mysqli_stmt_execute($stmt_delete_history)) {
            error_log("Đã xóa " . mysqli_stmt_affected_rows($stmt_delete_history) . " bản ghi trong lich_su_doc_new cho chuong_id=$chapter_id");
        } else {
            error_log("Lỗi xóa lịch sử đọc: " . mysqli_error($conn));
            echo json_encode(['error' => 'Lỗi xóa lịch sử đọc: ' . mysqli_error($conn)]);
            mysqli_stmt_close($stmt_delete_history);
            exit;
        }
        mysqli_stmt_close($stmt_delete_history);

        $sql = "DELETE FROM chuong WHERE id = ? AND truyen_id = ?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "ii", $chapter_id, $truyen_id);
        if (mysqli_stmt_execute($stmt)) {
            error_log("Xóa chương thành công: chuong_id=$chapter_id, truyen_id=$truyen_id");
            echo json_encode(['success' => true, 'message' => 'Xóa chương thành công']);
        } else {
            error_log("Lỗi xóa chương: " . mysqli_error($conn));
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
        $result = mysqli_stmt_get_result($stmt);
        if (mysqli_num_rows($result) > 0) {
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