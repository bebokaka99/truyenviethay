<?php
header('Content-Type: application/json');
session_start();
require_once '../config.php';

$user_id = $_SESSION['user_id'] ?? null;
$is_admin = false;
$is_author = false;

if ($user_id) {
    $sql_user = "SELECT role FROM users_new WHERE id = ?";
    $stmt_user = mysqli_prepare($conn, $sql_user);
    mysqli_stmt_bind_param($stmt_user, "i", $user_id);
    mysqli_stmt_execute($stmt_user);
    $user = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt_user)) ?: null;
    mysqli_stmt_close($stmt_user);

    if (!$user) {
        echo json_encode(['error' => 'Người dùng không tồn tại']);
        exit;
    }
    $is_admin = $user['role'] === 'admin';
}

$truyen_id = (int)($_GET['truyen_id'] ?? 0);
$chapter_id = (int)($_GET['chapter_id'] ?? 0);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($truyen_id <= 0 || $chapter_id <= 0) {
        echo json_encode(['error' => 'ID không hợp lệ']);
        exit;
    }

    $sql_truyen = "SELECT ten_truyen, user_id, luot_xem FROM truyen_new WHERE id = ?";
    $stmt_truyen = mysqli_prepare($conn, $sql_truyen);
    mysqli_stmt_bind_param($stmt_truyen, "i", $truyen_id);
    mysqli_stmt_execute($stmt_truyen);
    $truyen = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt_truyen)) ?: null;
    mysqli_stmt_close($stmt_truyen);

    if (!$truyen) {
        echo json_encode(['error' => 'Truyện không tồn tại']);
        exit;
    }

    $sql_chuong = "SELECT * FROM chuong WHERE so_chuong = ? AND truyen_id = ?";
    $stmt_chuong = mysqli_prepare($conn, $sql_chuong);
    mysqli_stmt_bind_param($stmt_chuong, "ii", $chapter_id, $truyen_id);
    mysqli_stmt_execute($stmt_chuong);
    $chapter = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt_chuong)) ?: null;
    mysqli_stmt_close($stmt_chuong);

    if (!$chapter) {
        echo json_encode(['error' => 'Chương không tồn tại']);
        exit;
    }

    // Ghi lịch sử đọc vào bảng lich_su_doc_new (nếu user đã đăng nhập)
    if ($user_id) {
        $sql = "INSERT INTO lich_su_doc_new (user_id, truyen_id, chuong_id, thoi_gian_doc) VALUES (?, ?, ?, NOW())";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "iii", $user_id, $truyen_id, $chapter['id']);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);
    }

    // Tăng lượt xem cho chương
    if (!isset($_SESSION['viewed_chapters'][$chapter_id])) {
        $new_luot_xem_chuong = ($chapter['luot_xem'] ?? 0) + 1;
        $sql_update_chuong = "UPDATE chuong SET luot_xem = ? WHERE so_chuong = ? AND truyen_id = ?";
        $stmt_update_chuong = mysqli_prepare($conn, $sql_update_chuong);
        mysqli_stmt_bind_param($stmt_update_chuong, "iii", $new_luot_xem_chuong, $chapter_id, $truyen_id);
        mysqli_stmt_execute($stmt_update_chuong);
        mysqli_stmt_close($stmt_update_chuong);
        $_SESSION['viewed_chapters'][$chapter_id] = true;
        $chapter['luot_xem'] = $new_luot_xem_chuong;
    }

    // Tăng lượt xem cho truyện
    if (!isset($_SESSION['viewed_truyen'][$truyen_id])) {
        $new_luot_xem_truyen = ($truyen['luot_xem'] ?? 0) + 1;
        $sql_update_truyen = "UPDATE truyen_new SET luot_xem = ? WHERE id = ?";
        $stmt_update_truyen = mysqli_prepare($conn, $sql_update_truyen);
        mysqli_stmt_bind_param($stmt_update_truyen, "ii", $new_luot_xem_truyen, $truyen_id);
        mysqli_stmt_execute($stmt_update_truyen);
        mysqli_stmt_close($stmt_update_truyen);
        $_SESSION['viewed_truyen'][$truyen_id] = true;
        $truyen['luot_xem'] = $new_luot_xem_truyen;
    }

    // Lấy danh sách chương (vẫn giữ thứ tự giảm dần để hiển thị trong dropdown)
    $sql_chapters = "SELECT so_chuong, tieu_de FROM chuong WHERE truyen_id = ? AND trang_thai = 'da_duyet' ORDER BY so_chuong DESC";
    $stmt_chapters = mysqli_prepare($conn, $sql_chapters);
    if (!$stmt_chapters) {
        echo json_encode(['error' => 'Lỗi truy vấn danh sách chương: ' . mysqli_error($conn)]);
        exit;
    }
    mysqli_stmt_bind_param($stmt_chapters, "i", $truyen_id);
    if (!mysqli_stmt_execute($stmt_chapters)) {
        echo json_encode(['error' => 'Lỗi khi thực thi truy vấn danh sách chương: ' . mysqli_stmt_error($stmt_chapters)]);
        exit;
    }
    $result_chapters = mysqli_stmt_get_result($stmt_chapters);
    if (!$result_chapters) {
        echo json_encode(['error' => 'Lỗi khi lấy kết quả danh sách chương: ' . mysqli_stmt_error($stmt_chapters)]);
        exit;
    }
    $chapters = [];
    while ($row = mysqli_fetch_assoc($result_chapters)) {
        $chapters[] = $row;
    }
    mysqli_stmt_close($stmt_chapters);

    // Tìm chương trước và sau (dựa trên giá trị so_chuong, không phụ thuộc vào thứ tự mảng $chapters)
    $chuong_truoc = null;
    $chuong_sau = null;

    // Tìm chương trước (so_chuong nhỏ hơn $chapter_id và gần nhất)
    $prev_chapter_id = $chapter_id - 1;
    $sql_prev = "SELECT so_chuong FROM chuong WHERE truyen_id = ? AND so_chuong = ? AND trang_thai = 'da_duyet'";
    $stmt_prev = mysqli_prepare($conn, $sql_prev);
    mysqli_stmt_bind_param($stmt_prev, "ii", $truyen_id, $prev_chapter_id);
    mysqli_stmt_execute($stmt_prev);
    $result_prev = mysqli_stmt_get_result($stmt_prev);
    if (mysqli_num_rows($result_prev) > 0) {
        $chuong_truoc = $prev_chapter_id;
    }
    mysqli_stmt_close($stmt_prev);

    // Tìm chương sau (so_chuong lớn hơn $chapter_id và gần nhất)
    $next_chapter_id = $chapter_id + 1;
    $sql_next = "SELECT so_chuong FROM chuong WHERE truyen_id = ? AND so_chuong = ? AND trang_thai = 'da_duyet'";
    $stmt_next = mysqli_prepare($conn, $sql_next);
    mysqli_stmt_bind_param($stmt_next, "ii", $truyen_id, $next_chapter_id);
    mysqli_stmt_execute($stmt_next);
    $result_next = mysqli_stmt_get_result($stmt_next);
    if (mysqli_num_rows($result_next) > 0) {
        $chuong_sau = $next_chapter_id;
    }
    mysqli_stmt_close($stmt_next);

    // Kiểm tra trạng thái theo dõi
    $hasFollowed = false;
    if ($user_id) {
        $sql_follow = "SELECT * FROM theo_doi WHERE user_id = ? AND truyen_id = ?";
        $stmt_follow = mysqli_prepare($conn, $sql_follow);
        mysqli_stmt_bind_param($stmt_follow, "ii", $user_id, $truyen_id);
        mysqli_stmt_execute($stmt_follow);
        $result_follow = mysqli_stmt_get_result($stmt_follow);
        $hasFollowed = mysqli_num_rows($result_follow) > 0;
        mysqli_stmt_close($stmt_follow);

        $is_author = $truyen['user_id'] == $user_id;
    }

    $chapter['thoi_gian_dang'] = $chapter['thoi_gian_dang'] ? date('d/m/Y H:i', strtotime($chapter['thoi_gian_dang'])) : 'Chưa đăng';
    echo json_encode([
        'success' => true,
        'ten_truyen' => $truyen['ten_truyen'],
        'chuong' => $chapter,
        'chapters' => $chapters,
        'chuong_truoc' => $chuong_truoc,
        'chuong_sau' => $chuong_sau,
        'is_admin' => $is_admin,
        'is_author' => $is_author,
        'hasFollowed' => $hasFollowed,
        'luot_xem' => $truyen['luot_xem']
    ]);
    exit;
}

echo json_encode(['error' => 'Phương thức không hợp lệ']);
mysqli_close($conn);
?>