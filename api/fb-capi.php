<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?: [];
$pixelId = $input['pixelId'] ?? '';
$accessToken = $input['accessToken'] ?? '';
$payload = $input['payload'] ?? null;

if (!$pixelId || !$accessToken || !$payload) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing pixelId, accessToken, or payload']);
    exit;
}

require_once __DIR__ . '/_lib/supabaseHelper.php';
$clientIp = getClientIp();
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';

if (isset($payload['data']) && is_array($payload['data'])) {
    foreach ($payload['data'] as &$item) {
        if (!isset($item['user_data'])) $item['user_data'] = [];
        $item['user_data']['client_ip_address'] = $clientIp;
        if (empty($item['user_data']['client_user_agent'])) {
            $item['user_data']['client_user_agent'] = $userAgent;
        }
    }
}

$url = "https://graph.facebook.com/v19.0/{$pixelId}/events?access_token={$accessToken}";
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

http_response_code($httpCode ?: 200);
echo $response ?: json_encode(['success' => true]);
