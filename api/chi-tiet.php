<?php
header('Content-Type: application/json');
session_start();
require_once '../config.php';
require_once 'db.php';

$truyen_id = isset($_GET['truyen_id']) ? (int)$_GET['truyen_id'] : 0;
if ($truyen_id <= 0) die(json_encode(['error' => 'Truyện không hợp lệ']));

$base_path = str_replace('\\', '/', $_SERVER['DOCUMENT_ROOT'] . '/truyenviethay/');

// Lấy thông tin truyện
$sql_truyen = "SELECT ten_truyen, anh_bia, tac_gia, mo_ta, rating, luot_xem, tinh_trang, luot_thich, luot_theo_doi FROM truyen_new WHERE id = ?";
$stmt_truyen = mysqli_prepare($conn, $sql_truyen);
mysqli_stmt_bind_param($stmt_truyen, "i", $truyen_id);
mysqli_stmt_execute($stmt_truyen);
$result_truyen = mysqli_stmt_get_result($stmt_truyen);
if (!$result_truyen || mysqli_num_rows($result_truyen) == 0) die(json_encode(['error' => 'Không tìm thấy truyện']));
$truyen = mysqli_fetch_assoc($result_truyen);
mysqli_stmt_close($stmt_truyen);

$truyen['anh_bia_url'] = !empty($truyen['anh_bia']) && file_exists($base_path . 'anh/' . $truyen['anh_bia']) ? '/truyenviethay/anh/' . $truyen['anh_bia'] : null;

// Lấy thể loại của truyện
$sql_theloai = "SELECT t.ten_theloai, t.id_theloai FROM theloai_new t JOIN truyen_theloai tt ON t.id_theloai = tt.theloai_id WHERE tt.truyen_id = ?";
$stmt_theloai = mysqli_prepare($conn, $sql_theloai);
mysqli_stmt_bind_param($stmt_theloai, "i", $truyen_id);
mysqli_stmt_execute($stmt_theloai);
$result_theloai = mysqli_stmt_get_result($stmt_theloai);
$truyen['theloai'] = [];
while ($row = mysqli_fetch_assoc($result_theloai)) $truyen['theloai'][] = $row;
mysqli_stmt_close($stmt_theloai);

// Đồng bộ và lấy danh sách chương
syncChaptersToDatabase($conn, $truyen_id);
$sql_chapters = "SELECT so_chuong, thoi_gian_dang FROM chuong WHERE truyen_id = ? AND trang_thai = 'da_duyet' ORDER BY so_chuong DESC";
$stmt_chapters = mysqli_prepare($conn, $sql_chapters);
mysqli_stmt_bind_param($stmt_chapters, "i", $truyen_id);
mysqli_stmt_execute($stmt_chapters);
$result_chapters = mysqli_stmt_get_result($stmt_chapters);
$truyen['chapters'] = [];
while ($row = mysqli_fetch_assoc($result_chapters)) {
    $truyen['chapters'][] = ['id' => $row['so_chuong'], 'thoi_gian' => $row['thoi_gian_dang']];
}
mysqli_stmt_close($stmt_chapters);

// Lịch sử đọc
$user_id = $_SESSION['user_id'] ?? null;
$truyen['chuong_da_doc'] = [];
$truyen['chuong_gan_nhat'] = 0;
if ($user_id) {
    // Lấy danh sách chương đã đọc
    $sql_lich_su = "SELECT c.so_chuong 
                    FROM lich_su_doc_new lsd 
                    JOIN chuong c ON lsd.chuong_id = c.id 
                    WHERE lsd.user_id = ? AND lsd.truyen_id = ?";
    $stmt_lich_su = mysqli_prepare($conn, $sql_lich_su);
    if (!$stmt_lich_su) {
        die(json_encode(['error' => 'Lỗi truy vấn lịch sử đọc: ' . mysqli_error($conn)]));
    }
    mysqli_stmt_bind_param($stmt_lich_su, "ii", $user_id, $truyen_id);
    if (!mysqli_stmt_execute($stmt_lich_su)) {
        die(json_encode(['error' => 'Lỗi khi thực thi truy vấn lịch sử đọc: ' . mysqli_stmt_error($stmt_lich_su)]));
    }
    $result_lich_su = mysqli_stmt_get_result($stmt_lich_su);
    while ($row = mysqli_fetch_assoc($result_lich_su)) {
        $truyen['chuong_da_doc'][] = (int)$row['so_chuong'];
    }
    mysqli_stmt_close($stmt_lich_su);

    // Lấy chương gần nhất
    $sql_gan_nhat = "SELECT c.so_chuong 
                     FROM lich_su_doc_new lsd 
                     JOIN chuong c ON lsd.chuong_id = c.id 
                     WHERE lsd.user_id = ? AND lsd.truyen_id = ? 
                     ORDER BY lsd.thoi_gian_doc DESC LIMIT 1";
    $stmt_gan_nhat = mysqli_prepare($conn, $sql_gan_nhat);
    if (!$stmt_gan_nhat) {
        die(json_encode(['error' => 'Lỗi truy vấn chương gần nhất: ' . mysqli_error($conn)]));
    }
    mysqli_stmt_bind_param($stmt_gan_nhat, "ii", $user_id, $truyen_id);
    if (!mysqli_stmt_execute($stmt_gan_nhat)) {
        die(json_encode(['error' => 'Lỗi khi thực thi truy vấn chương gần nhất: ' . mysqli_stmt_error($stmt_gan_nhat)]));
    }
    $result_gan_nhat = mysqli_stmt_get_result($stmt_gan_nhat);
    if ($row = mysqli_fetch_assoc($result_gan_nhat)) {
        $truyen['chuong_gan_nhat'] = (int)$row['so_chuong'];
    }
    mysqli_stmt_close($stmt_gan_nhat);
}

// Bình luận
$truyen['comments'] = [];
if (mysqli_num_rows(mysqli_query($conn, "SHOW TABLES LIKE 'comments'")) > 0) {
    $sql_comments = "SELECT c.content, c.created_at, u.full_name, u.avatar FROM comments c JOIN users_new u ON c.user_id = u.id WHERE c.truyen_id = ? ORDER BY c.created_at DESC";
    $stmt_comments = mysqli_prepare($conn, $sql_comments);
    mysqli_stmt_bind_param($stmt_comments, "i", $truyen_id);
    mysqli_stmt_execute($stmt_comments);
    $result_comments = mysqli_stmt_get_result($stmt_comments);
    while ($row = mysqli_fetch_assoc($result_comments)) {
        $avatar_relative_path = !empty($row['avatar']) ? $row['avatar'] : 'anh/avatar-default.jpg';
        $avatar_path = $base_path . $avatar_relative_path;
        $row['avatar'] = file_exists($avatar_path) ? '/truyenviethay/' . $avatar_relative_path : '/truyenviethay/anh/avatar-default.jpg';
        $truyen['comments'][] = $row;
    }
    mysqli_stmt_close($stmt_comments);
}

echo json_encode($truyen);
mysqli_close($conn);
?>