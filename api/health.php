<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

echo json_encode([
    'status' => 'ok',
    'service' => 'herbheez-cpanel-production-server',
    'engine' => 'PHP ' . PHP_VERSION,
    'timestamp' => gmdate('c')
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
