<?php
/**
 * Herbheez BD — BD Courier Settings & Test Connection API (PHP Bridge for cPanel)
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/_lib/supabaseHelper.php';

$method = $_SERVER['REQUEST_METHOD'];

// Handle GET: retrieve safe settings for admin UI
if ($method === 'GET') {
    $res = callSupabaseRest('bdcourier_settings?id=eq.config&select=*', 'GET');
    if ($res['status'] === 200 && !empty($res['data'])) {
        $row = $res['data'][0];
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'config' => [
                'is_enabled' => (bool)($row['is_enabled'] ?? false),
                'has_key' => !empty($row['api_key_encrypted']),
                'masked_key' => $row['api_key_masked'] ?? '',
                'connection_status' => $row['connection_status'] ?? 'unconfigured',
                'connection_message' => $row['connection_message'] ?? '',
                'last_checked_at' => $row['last_checked_at'] ?? null
            ]
        ], JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'config' => [
                'is_enabled' => false,
                'has_key' => false,
                'masked_key' => '',
                'connection_status' => 'unconfigured',
                'connection_message' => 'Not configured yet',
                'last_checked_at' => null
            ]
        ], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// Handle POST: test connection OR save settings
if ($method === 'POST') {
    $input = file_get_contents('php://input');
    $body = json_decode($input, true) ?: [];
    $action = $body['action'] ?? null;

    if ($action === 'test') {
        $apiKey = trim($body['api_key'] ?? '');
        
        // If no override key provided, decrypt stored key
        if (!$apiKey) {
            $settingsRes = callSupabaseRest('bdcourier_settings?id=eq.config&select=*', 'GET');
            if ($settingsRes['status'] === 200 && !empty($settingsRes['data'])) {
                $row = $settingsRes['data'][0];
                $apiKey = decryptApiKey(
                    $row['api_key_encrypted'] ?? null,
                    $row['encryption_iv'] ?? null,
                    $row['encryption_tag'] ?? null
                );
            }
        }

        if (!$apiKey) {
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'connected' => false,
                'status' => 'unconfigured',
                'message' => 'No API key has been configured yet.'
            ]);
            exit;
        }

        // Call BD Courier check endpoint with probe phone
        $ch = curl_init('https://api.bdcourier.com/courier-check');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            "Authorization: Bearer $apiKey"
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['phone' => '01700000000']));
        curl_setopt($ch, CURLOPT_TIMEOUT, 12);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlErr = curl_error($ch);

        // If host has outdated SSL CA bundle, retry with fallback SSL verification
        if ($curlErr && (stripos($curlErr, 'ssl') !== false || stripos($curlErr, 'certificate') !== false)) {
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlErr = curl_error($ch);
        }
        curl_close($ch);

        $now = gmdate('c');

        if ($curlErr) {
            $msg = "Network error: $curlErr";
            callSupabaseRest('bdcourier_settings?id=eq.config', 'PATCH', [
                'connection_status' => 'error',
                'connection_message' => $msg,
                'last_checked_at' => $now
            ]);
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'connected' => false,
                'status' => 'error',
                'message' => $msg
            ]);
            exit;
        }

        $resJson = json_decode($response, true) ?: [];

        if ($httpCode === 200 || (isset($resJson['status']) && $resJson['status'] === 'success')) {
            $msg = 'Connected successfully to BD Courier API!';
            callSupabaseRest('bdcourier_settings?id=eq.config', 'PATCH', [
                'connection_status' => 'connected',
                'connection_message' => $msg,
                'last_checked_at' => $now
            ]);
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'connected' => true,
                'status' => 'connected',
                'message' => $msg,
                'raw' => $resJson
            ]);
            exit;
        }

        if ($httpCode === 401 || $httpCode === 403) {
            $msg = 'Invalid API Bearer Token (Authentication failed)';
            callSupabaseRest('bdcourier_settings?id=eq.config', 'PATCH', [
                'connection_status' => 'invalid_key',
                'connection_message' => $msg,
                'last_checked_at' => $now
            ]);
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'connected' => false,
                'status' => 'invalid_key',
                'message' => $msg
            ]);
            exit;
        }

        $msg = $resJson['message'] ?? "BD Courier responded with HTTP $httpCode";
        callSupabaseRest('bdcourier_settings?id=eq.config', 'PATCH', [
            'connection_status' => 'error',
            'connection_message' => $msg,
            'last_checked_at' => $now
        ]);
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'connected' => false,
            'status' => 'error',
            'message' => $msg
        ]);
        exit;
    }

    // Default Action: Save settings
    $isEnabled = isset($body['is_enabled']) ? (bool)$body['is_enabled'] : false;
    $newApiKey = isset($body['api_key']) ? trim($body['api_key']) : '';

    $updatePayload = [
        'is_enabled' => $isEnabled,
        'updated_at' => gmdate('c')
    ];

    if (!empty($newApiKey)) {
        $enc = encryptApiKey($newApiKey);
        if ($enc) {
            $updatePayload['api_key_encrypted'] = $enc['encrypted'];
            $updatePayload['encryption_iv'] = $enc['iv'];
            $updatePayload['encryption_tag'] = $enc['tag'];
            $updatePayload['api_key_masked'] = maskApiKey($newApiKey);
            $updatePayload['connection_status'] = 'unverified';
            $updatePayload['connection_message'] = 'Key updated. Please run "Test Connection".';
        }
    }

    $res = callSupabaseRest('bdcourier_settings?id=eq.config', 'PATCH', $updatePayload);

    // Fetch updated config to return to admin UI
    $fetchRes = callSupabaseRest('bdcourier_settings?id=eq.config&select=*', 'GET');
    $configData = [
        'is_enabled' => $isEnabled,
        'has_key' => false,
        'masked_key' => '',
        'connection_status' => 'unconfigured',
        'connection_message' => '',
        'last_checked_at' => null
    ];

    if ($fetchRes['status'] === 200 && !empty($fetchRes['data'])) {
        $row = $fetchRes['data'][0];
        $configData = [
            'is_enabled' => (bool)($row['is_enabled'] ?? false),
            'has_key' => !empty($row['api_key_encrypted']),
            'masked_key' => $row['api_key_masked'] ?? '',
            'connection_status' => $row['connection_status'] ?? 'unconfigured',
            'connection_message' => $row['connection_message'] ?? '',
            'last_checked_at' => $row['last_checked_at'] ?? null
        ];
    }

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'BD Courier settings saved successfully',
        'config' => $configData
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method Not Allowed']);
