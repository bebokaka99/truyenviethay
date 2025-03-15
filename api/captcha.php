<?php
header('Content-Type: application/json');
session_start();

$captcha_code = substr(str_shuffle("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"), 0, 6);
$_SESSION['captcha_code'] = $captcha_code;

echo json_encode(['captcha' => $captcha_code]);