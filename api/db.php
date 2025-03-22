<?php
require_once '../config.php';

function timeAgo($datetime) {
    if (!$datetime) return "Không xác định";
    $now = time();
    $past = strtotime($datetime);
    $diff = $now - $past;
    if ($diff < 0) {
        $diff = abs($diff);
        if ($diff < 60) return "trong $diff giây";
        elseif ($diff < 3600) return "trong " . floor($diff / 60) . " phút";
        elseif ($diff < 86400) return "trong " . floor($diff / 3600) . " tiếng";
        elseif ($diff < 604800) return "trong " . floor($diff / 86400) . " ngày";
        elseif ($diff < 2592000) return "trong " . floor($diff / 604800) . " tuần";
        elseif ($diff < 31536000) return "trong " . floor($diff / 2592000) . " tháng";
        else return "trong " . floor($diff / 31536000) . " năm";
    } else {
        if ($diff < 60) return "$diff giây trước";
        elseif ($diff < 3600) return floor($diff / 60) . " phút trước";
        elseif ($diff < 86400) return floor($diff / 3600) . " tiếng trước";
        elseif ($diff < 604800) return floor($diff / 604800) . " ngày trước";
        elseif ($diff < 2592000) return floor($diff / 604800) . " tuần trước";
        elseif ($diff < 31536000) return floor($diff / 2592000) . " tháng trước";
        else return floor($diff / 31536000) . " năm trước";
    }
}

function syncChaptersToDatabase($conn, $truyen_id) {
    $chapter_dir = $_SERVER['DOCUMENT_ROOT'] . "/truyenviethay/truyen/noidung/{$truyen_id}/";
    if (is_dir($chapter_dir)) {
        for ($i = 1; $i <= 1000; $i++) {
            $chapter_file = $chapter_dir . "chapter{$i}.txt";
            if (file_exists($chapter_file)) {
                $noi_dung = file_get_contents($chapter_file);
                $noi_dung = mysqli_real_escape_string($conn, $noi_dung);
                $thoi_gian_dang = date('Y-m-d H:i:s', filemtime($chapter_file));

                $sql_check = "SELECT id FROM chuong WHERE truyen_id = ? AND so_chuong = ?";
                $stmt_check = mysqli_prepare($conn, $sql_check);
                mysqli_stmt_bind_param($stmt_check, "ii", $truyen_id, $i);
                mysqli_stmt_execute($stmt_check);
                $result_check = mysqli_stmt_get_result($stmt_check);
                if (mysqli_num_rows($result_check) == 0) {
                    $sql_insert = "INSERT INTO chuong (truyen_id, so_chuong, noi_dung, thoi_gian_dang) VALUES (?, ?, ?, ?)";
                    $stmt_insert = mysqli_prepare($conn, $sql_insert);
                    mysqli_stmt_bind_param($stmt_insert, "iiss", $truyen_id, $i, $noi_dung, $thoi_gian_dang);
                    mysqli_stmt_execute($stmt_insert);
                    mysqli_stmt_close($stmt_insert);
                }
                mysqli_stmt_close($stmt_check);
            }
        }
    }
}