<?php
header('Content-Type: application/json');
session_start();
require_once '../config.php';

try {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'error' => 'Chưa đăng nhập', 'redirect' => '/truyenviethay/users/login.html']);
        exit;
    }

    $user_id = $_SESSION['user_id'];
    $sql_user = "SELECT role FROM users_new WHERE id = ?";
    $stmt_user = mysqli_prepare($conn, $sql_user);
    if (!$stmt_user) throw new Exception("Lỗi chuẩn bị truy vấn: " . mysqli_error($conn));
    mysqli_stmt_bind_param($stmt_user, "i", $user_id);
    mysqli_stmt_execute($stmt_user);
    $user = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt_user)) ?: null;
    mysqli_stmt_close($stmt_user);

    if (!$user || !in_array($user['role'], ['admin', 'author'])) {
        echo json_encode(['success' => false, 'error' => 'Không có quyền truy cập']);
        exit;
    }

    $truyen_id = (int)($_GET['truyen_id'] ?? $_POST['truyen_id'] ?? 0);
    $chapter_id = (int)($_GET['chapter_id'] ?? $_POST['chapter_id'] ?? 0);

    if ($truyen_id <= 0 || $chapter_id <= 0) {
        echo json_encode(['success' => false, 'error' => 'ID không hợp lệ']);
        exit;
    }

    $sql_truyen = "SELECT ten_truyen, user_id FROM truyen_new WHERE id = ?";
    $stmt_truyen = mysqli_prepare($conn, $sql_truyen);
    if (!$stmt_truyen) throw new Exception("Lỗi chuẩn bị truy vấn: " . mysqli_error($conn));
    mysqli_stmt_bind_param($stmt_truyen, "i", $truyen_id);
    mysqli_stmt_execute($stmt_truyen);
    $truyen = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt_truyen)) ?: null;
    mysqli_stmt_close($stmt_truyen);

    if (!$truyen) {
        echo json_encode(['success' => false, 'error' => 'Truyện không tồn tại']);
        exit;
    }

    $is_author = ($user['role'] === 'author' && $truyen['user_id'] == $user_id);
    $is_admin = ($user['role'] === 'admin');
    if (!$is_admin && !$is_author) {
        echo json_encode(['success' => false, 'error' => 'Không có quyền quản lý chương của truyện này']);
        exit;
    }

    // Kiểm tra phương thức request
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $action = $_POST['action'] ?? '';

        if ($action === 'update') {
            // Cập nhật chương
            $so_chuong = (int)($_POST['so_chuong'] ?? 0);
            $tieu_de = trim($_POST['tieu_de'] ?? '');
            $noi_dung = $_POST['noi_dung'] ?? '';

            if ($so_chuong <= 0 || empty($tieu_de) || empty($noi_dung)) {
                echo json_encode(['success' => false, 'error' => 'Dữ liệu không hợp lệ']);
                exit;
            }

            $sql_update = "UPDATE chuong SET so_chuong = ?, tieu_de = ?, noi_dung = ? WHERE id = ? AND truyen_id = ?";
            $stmt_update = mysqli_prepare($conn, $sql_update);
            if (!$stmt_update) throw new Exception("Lỗi chuẩn bị truy vấn: " . mysqli_error($conn));
            mysqli_stmt_bind_param($stmt_update, "issii", $so_chuong, $tieu_de, $noi_dung, $chapter_id, $truyen_id);
            $success = mysqli_stmt_execute($stmt_update);
            mysqli_stmt_close($stmt_update);

            if ($success) {
                echo json_encode(['success' => true, 'message' => 'Cập nhật chương thành công']);
            } else {
                echo json_encode(['success' => false, 'error' => 'Lỗi khi cập nhật chương']);
            }
            exit;
        } elseif ($action === 'delete') {
            // Xóa chương
            $sql_delete = "DELETE FROM chuong WHERE id = ? AND truyen_id = ?";
            $stmt_delete = mysqli_prepare($conn, $sql_delete);
            if (!$stmt_delete) throw new Exception("Lỗi chuẩn bị truy vấn: " . mysqli_error($conn));
            mysqli_stmt_bind_param($stmt_delete, "ii", $chapter_id, $truyen_id);
            $success = mysqli_stmt_execute($stmt_delete);
            mysqli_stmt_close($stmt_delete);

            if ($success) {
                echo json_encode(['success' => true, 'message' => 'Xóa chương thành công']);
            } else {
                echo json_encode(['success' => false, 'error' => 'Lỗi khi xóa chương']);
            }
            exit;
        } else {
            echo json_encode(['success' => false, 'error' => 'Hành động không hợp lệ']);
            exit;
        }
    }

    // Lấy thông tin chương (GET)
    $sql_chapter = "SELECT * FROM chuong WHERE id = ? AND truyen_id = ?";
    $stmt_chapter = mysqli_prepare($conn, $sql_chapter);
    if (!$stmt_chapter) throw new Exception("Lỗi chuẩn bị truy vấn: " . mysqli_error($conn));
    mysqli_stmt_bind_param($stmt_chapter, "ii", $chapter_id, $truyen_id);
    mysqli_stmt_execute($stmt_chapter);
    $chapter = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt_chapter)) ?: null;
    mysqli_stmt_close($stmt_chapter);

    if (!$chapter) {
        echo json_encode(['success' => false, 'error' => 'Chương không tồn tại']);
        exit;
    }

    if (!isset($_SESSION['viewed_chapters'][$chapter_id])) {
        $new_luot_xem = $chapter['luot_xem'] + 1;
        $sql_update_luot_xem = "UPDATE chuong SET luot_xem = ? WHERE id = ?";
        $stmt_update = mysqli_prepare($conn, $sql_update_luot_xem);
        if (!$stmt_update) throw new Exception("Lỗi chuẩn bị truy vấn: " . mysqli_error($conn));
        mysqli_stmt_bind_param($stmt_update, "ii", $new_luot_xem, $chapter_id);
        mysqli_stmt_execute($stmt_update);
        mysqli_stmt_close($stmt_update);
        $_SESSION['viewed_chapters'][$chapter_id] = true;
        $chapter['luot_xem'] = $new_luot_xem;
    }

    $chapter['thoi_gian_dang'] = $chapter['thoi_gian_dang'] ? date('d/m/Y H:i', strtotime($chapter['thoi_gian_dang'])) : 'Chưa đăng';

    echo json_encode([
        'success' => true,
        'chapter' => $chapter,
        'ten_truyen' => $truyen['ten_truyen'],
        'is_admin' => $is_admin,
        'is_author' => $is_author
    ]);
} catch (Exception $e) {
    error_log("Lỗi trong chi-tiet-chuong.php: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Lỗi server: ' . $e->getMessage()]);
    exit;
}

mysqli_close($conn);
