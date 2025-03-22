<?php
ob_start();
header('Content-Type: application/json');
session_start();
require_once '../config.php';

// Set múi giờ GMT+7
date_default_timezone_set('Asia/Ho_Chi_Minh');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Chưa đăng nhập.']);
    exit;
}
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'error' => 'Chỉ admin mới có quyền truy cập.', 'session' => $_SESSION]);
    exit;
}

$subaction = $_POST['subaction'] ?? $_GET['subaction'] ?? '';
if (empty($subaction)) {
    echo json_encode(['success' => false, 'error' => 'Không nhận được subaction', 'post' => $_POST, 'get' => $_GET]);
    exit;
}

switch ($subaction) {
    case 'list':
        $page = max(1, $_GET['page'] ?? 1);
        $perPage = 20;
        $offset = ($page - 1) * $perPage;
        $roleFilter = $_GET['role'] ?? '';
        $statusFilter = $_GET['status'] ?? '';
        $search = $_GET['search'] ?? '';

        $where = "WHERE 1=1";
        $params = [];
        $types = '';
        if ($roleFilter) {
            $where .= " AND role = ?";
            $params[] = $roleFilter;
            $types .= 's';
        }
        if ($statusFilter) {
            $where .= " AND status = ?";
            $params[] = $statusFilter;
            $types .= 's';
        }
        if ($search) {
            $where .= " AND (username LIKE ? OR full_name LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
            $types .= 'ss';
        }

        $sqlCount = "SELECT COUNT(*) as total FROM users_new $where";
        $stmtCount = mysqli_prepare($conn, $sqlCount);
        if (!$stmtCount) {
            echo json_encode(['success' => false, 'error' => 'Lỗi prepare count: ' . mysqli_error($conn)]);
            break;
        }
        if ($types) mysqli_stmt_bind_param($stmtCount, $types, ...$params);
        mysqli_stmt_execute($stmtCount);
        $total = mysqli_fetch_assoc(mysqli_stmt_get_result($stmtCount))['total'];
        $totalPages = ceil($total / $perPage);

        $sql = "SELECT id, username, full_name, role, avatar, created_at AS signup_date, status, ban_until 
                FROM users_new $where 
                ORDER BY created_at DESC 
                LIMIT $offset, $perPage";
        $stmt = mysqli_prepare($conn, $sql);
        if (!$stmt) {
            echo json_encode(['success' => false, 'error' => 'Lỗi prepare select: ' . mysqli_error($conn)]);
            break;
        }
        if ($types) mysqli_stmt_bind_param($stmt, $types, ...$params);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $users = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $row['avatar'] = $row['avatar'] ?: 'anh/avatar-default.jpg';
            $users[] = $row;
        }

        echo json_encode([
            'success' => true,
            'users' => $users,
            'current_page' => $page,
            'total_pages' => $totalPages
        ]);
        break;

    case 'detail':
        $userId = $_GET['user_id'] ?? 0;
        $sql = "SELECT username, full_name, email, phone FROM users_new WHERE id = ?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, 'i', $userId);
        mysqli_stmt_execute($stmt);
        $user = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));
        echo json_encode(['success' => !!$user, 'user' => $user ?: [], 'error' => $user ? '' : 'Không tìm thấy người dùng.']);
        break;

    case 'update':
        $userId = $_POST['user_id'] ?? 0;
        $status = $_POST['status'] ?? '';
        $role = $_POST['role'] ?? '';
        $banDays = $_POST['ban_days'] ?? '';

        if (!$userId) {
            echo json_encode(['success' => false, 'error' => 'Thiếu ID người dùng.']);
            break;
        }

        if (empty($status) && empty($role) && empty($banDays)) {
            echo json_encode(['success' => false, 'error' => 'Không có dữ liệu để cập nhật.']);
            break;
        }

        $sql = "UPDATE users_new SET ";
        $params = [];
        $types = '';

        // Xử lý status và ban_until
        if ($status === 'blocked' && $banDays && $banDays !== 'null') {
            $sql .= "status = ?, ban_until = ?, ";
            $banUntil = $banDays === 'forever' ? null : date('Y-m-d H:i:s', strtotime("+$banDays days"));
            $params[] = $status;
            $params[] = $banUntil;
            $types .= 's' . ($banUntil ? 's' : 's');
        } elseif ($status === 'active' || $banDays === 'null') {
            $sql .= "status = ?, ban_until = NULL, ";
            $params[] = 'active';
            $types .= 's';
        } elseif ($status) {
            $sql .= "status = ?, ";
            $params[] = $status;
            $types .= 's';
        }

        // Xử lý role
        if ($role) {
            $sql .= "role = ?, ";
            $params[] = $role;
            $types .= 's';
        }

        $sql = rtrim($sql, ', ') . " WHERE id = ?";
        $params[] = $userId;
        $types .= 'i';

        $stmt = mysqli_prepare($conn, $sql);
        if (!$stmt) {
            echo json_encode(['success' => false, 'error' => 'Lỗi prepare: ' . mysqli_error($conn)]);
            break;
        }

        if (!empty($params)) {
            if (!mysqli_stmt_bind_param($stmt, $types, ...$params)) {
                echo json_encode(['success' => false, 'error' => 'Lỗi bind_param: ' . mysqli_error($conn)]);
                break;
            }
        }

        if (!mysqli_stmt_execute($stmt)) {
            echo json_encode(['success' => false, 'error' => 'Lỗi execute: ' . mysqli_error($conn)]);
            break;
        }

        echo json_encode(['success' => true, 'message' => 'Cập nhật thành công!']);
        break;

    default:
        echo json_encode(['success' => false, 'error' => 'Hành động không hợp lệ.', 'subaction' => $subaction]);
}
mysqli_close($conn);
ob_end_flush();
?>