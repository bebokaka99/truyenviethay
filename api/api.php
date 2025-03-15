<?php
header('Content-Type: application/json');
$action = $_GET['action'] ?? 'truyen';
switch ($action) {
    case 'user': require 'user.php'; break;
    case 'theloai': require 'theloai.php'; break;
    case 'truyen': require 'truyen.php'; break;
    case 'chi-tiet': require 'chi-tiet.php'; break;
    case 'follow': require 'follow.php'; break;
    case 'like': require 'like.php'; break;
    case 'comment': require 'comment.php'; break;
    case 'chuong': require 'chuong.php'; break;
    case 'login': require 'login.php'; break;
    case 'register': require 'register.php'; break;
    case 'captcha': require 'captcha.php'; break;
    case 'profile': require 'profile.php'; break;
    case 'tasks': require 'tasks.php'; break;
    case 'moderation': require 'moderation.php'; break;
    case 'settings': require 'settings.php'; break;
    case 'manage': require 'manage.php'; break;
    case 'edit': require 'edit.php'; break;
    case 'chapter': require 'chapter.php'; break;
    case 'upload': require 'upload.php'; break;
    case 'manage-author': require 'manage-author.php'; break;
    case 'search': require 'search.php'; break;
    case 'chi-tiet-chuong': require 'chi-tiet-chuong.php'; break;
    default: echo json_encode(['error' => 'Invalid action']);
}