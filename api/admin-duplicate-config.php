<?php
/**
 * Herbheez BD — Duplicate Order Protection & Anti-Fraud Config Bridge (PHP)
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0');
header('Pragma: no-cache');
header('Expires: Thu, 01 Jan 1970 00:00:00 GMT');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/_lib/supabaseHelper.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // 1. Fetch current settings from duplicate_order_settings
    $res = callSupabaseRest('duplicate_order_settings?id=eq.config&select=*', 'GET');
    $config = [
        'id' => 'config',
        'is_enabled' => true,
        'block_same_phone' => true,
        'block_same_ip' => true,
        'duration_minutes' => 10,
        'updated_at' => null,
        'updated_by' => 'admin'
    ];

    if ($res['status'] === 200 && !empty($res['data'])) {
        $config = array_merge($config, $res['data'][0]);
    }

    // Normalize duration and populate backward-compatible aliases
    $duration = (int)($config['duration_minutes'] ?? $config['phone_window_minutes'] ?? 10);
    if ($duration <= 0) $duration = 10;
    $config['duration_minutes'] = $duration;
    $config['phone_window_minutes'] = $duration;
    $config['ip_window_minutes'] = $duration;

    // 2. Fetch recent duplicate blocked logs
    $logsRes = callSupabaseRest('duplicate_order_logs?select=id,phone,phone_masked,ip_address,ip_masked,blocked_reason,matching_order_id,cooldown_remaining_seconds,duration_minutes,user_agent,created_at&order=created_at.desc&limit=25', 'GET');
    $logs = ($logsRes['status'] === 200 && is_array($logsRes['data'])) ? $logsRes['data'] : [];

    // 3. Count total blocked attempts
    $countRes = callSupabaseRest('duplicate_order_logs?select=id', 'GET');
    $totalBlocked = ($countRes['status'] === 200 && is_array($countRes['data'])) ? count($countRes['data']) : count($logs);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'config' => $config,
        'totalBlocked' => $totalBlocked,
        'logs' => $logs
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($method === 'POST') {
    $input = file_get_contents('php://input');
    if (!$input && php_sapi_name() === 'cli') {
        $input = file_get_contents('php://stdin');
    }
    $body = json_decode($input, true) ?: [];

    $duration = max(1, min(1440, (int)($body['duration_minutes'] ?? $body['phone_window_minutes'] ?? $body['ip_window_minutes'] ?? 10)));

    $updatePayload = [
        'is_enabled' => isset($body['is_enabled']) ? (bool)$body['is_enabled'] : true,
        'block_same_phone' => isset($body['block_same_phone']) ? (bool)$body['block_same_phone'] : true,
        'block_same_ip' => isset($body['block_same_ip']) ? (bool)$body['block_same_ip'] : true,
        'duration_minutes' => $duration,
        'updated_at' => gmdate('c'),
        'updated_by' => 'admin'
    ];

    // Attempt PATCH update
    $res = callSupabaseRest('duplicate_order_settings?id=eq.config', 'PATCH', $updatePayload);

    // If update returned empty or status error, attempt insert
    if ($res['status'] < 200 || $res['status'] >= 300 || empty($res['data'])) {
        $insertPayload = array_merge(['id' => 'config'], $updatePayload);
        $res = callSupabaseRest('duplicate_order_settings', 'POST', $insertPayload);
    }

    $retConfig = $updatePayload;
    $retConfig['id'] = 'config';
    $retConfig['phone_window_minutes'] = $duration;
    $retConfig['ip_window_minutes'] = $duration;

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'ডুপ্লিকেট অর্ডার প্রতিরোধ সেটিংস সফলভাবে সংরক্ষিত হয়েছে',
        'config' => $retConfig
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method Not Allowed']);
