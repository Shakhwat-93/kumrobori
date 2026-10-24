<?php
/**
 * Herbheez BD — BD Courier Check API Bridge (PHP for cPanel)
 * Strict AT-MOST-ONCE lookup guarantee with permanent Supabase caching
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

// Helper to sanitize courier data matching Node.js bdcourierService
function sanitizeCourierData($raw, $canonicalPhone) {
    if (!$raw) return ['phone' => $canonicalPhone, 'summary' => null, 'couriers' => []];
    $rawData = $raw['data'] ?? $raw;

    $summary = $rawData['summary'] ?? null;
    $couriersList = ['pathao', 'steadfast', 'redx', 'parceldex', 'courrierfast', 'paperfly', 'carrybee'];

    if (!$summary) {
        $total = 0;
        $success = 0;
        $cancelled = 0;
        $found = false;

        foreach ($couriersList as $c) {
            $info = $rawData[$c] ?? null;
            if (is_array($info)) {
                $found = true;
                $total += (int)($info['total_parcel'] ?? 0);
                $success += (int)($info['success_parcel'] ?? 0);
                $cancelled += (int)($info['cancelled_parcel'] ?? 0);
            }
        }

        if ($found) {
            $ratio = $total > 0 ? round(($success / $total) * 100, 1) : 0;
            $summary = [
                'total_parcel' => $total,
                'success_parcel' => $success,
                'cancelled_parcel' => $cancelled,
                'success_ratio' => $ratio
            ];
        } else {
            $summary = [
                'total_parcel' => 0,
                'success_parcel' => 0,
                'cancelled_parcel' => 0,
                'success_ratio' => 0
            ];
        }
    } else {
        $summary = [
            'total_parcel' => (int)($summary['total_parcel'] ?? 0),
            'success_parcel' => (int)($summary['success_parcel'] ?? 0),
            'cancelled_parcel' => (int)($summary['cancelled_parcel'] ?? 0),
            'success_ratio' => (float)($summary['success_ratio'] ?? 0)
        ];
    }

    $couriers = [];
    foreach ($couriersList as $c) {
        if (!empty($rawData[$c]) && is_array($rawData[$c])) {
            $item = $rawData[$c];
            $couriers[$c] = [
                'name' => $item['name'] ?? ucfirst($c),
                'logo' => $item['logo'] ?? null,
                'total_parcel' => (int)($item['total_parcel'] ?? 0),
                'success_parcel' => (int)($item['success_parcel'] ?? 0),
                'cancelled_parcel' => (int)($item['cancelled_parcel'] ?? 0),
                'success_ratio' => (float)($item['success_ratio'] ?? 0)
            ];
        }
    }

    $reports = is_array($raw['reports'] ?? null) ? array_slice($raw['reports'], 0, 5) : [];
    $totalParcels = $summary['total_parcel'] ?? 0;
    $ratio = $summary['success_ratio'] ?? 0;

    $riskLevel = $raw['risk_level'] ?? (
        $totalParcels === 0 ? 'new_customer' : (
            $ratio >= 80 ? 'safe' : (
                $ratio >= 60 ? 'medium' : 'high_risk'
            )
        )
    );

    return [
        'phone' => $canonicalPhone,
        'summary' => $summary,
        'couriers' => $couriers,
        'reports' => $reports,
        'risk_level' => $riskLevel,
        'retrieved_at' => gmdate('c')
    ];
}

// -----------------------------------------------------------------------------
// GET: Fetch single cached record by phone OR all checks overview for orders list
// -----------------------------------------------------------------------------
if ($method === 'GET') {
    $rawPhone = $_GET['phone'] ?? '';
    
    if (!empty($rawPhone)) {
        $canonicalPhone = normalizeBdPhone($rawPhone);
        $res = callSupabaseRest("bdcourier_checks?phone=eq.{$canonicalPhone}&select=*");
        $record = ($res['status'] === 200 && !empty($res['data'])) ? $res['data'][0] : null;
        http_response_code(200);
        echo json_encode(['success' => true, 'record' => $record], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Overview list of all checks for admin order manager
    $res = callSupabaseRest('bdcourier_checks?select=id,phone,status,data,created_at,completed_at,error');
    $checks = ($res['status'] === 200 && is_array($res['data'])) ? $res['data'] : [];
    http_response_code(200);
    echo json_encode(['success' => true, 'checks' => $checks], JSON_UNESCAPED_UNICODE);
    exit;
}

// -----------------------------------------------------------------------------
// POST: Execute lookup with AT-MOST-ONCE guarantee and permanent Supabase caching
// -----------------------------------------------------------------------------
if ($method === 'POST') {
    $input = file_get_contents('php://input');
    if (!$input && php_sapi_name() === 'cli') {
        $input = file_get_contents('php://stdin');
    }
    $body = json_decode($input, true) ?: [];

    $phone = $body['phone'] ?? '';
    $orderId = $body['orderId'] ?? null;

    if (!$phone) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing phone number']);
        exit;
    }

    $canonicalPhone = normalizeBdPhone($phone);
    if (!isValidBdPhone($canonicalPhone)) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Invalid Bangladeshi phone number. Must be 11 digits starting with 01.'
        ]);
        exit;
    }

    // 1. Check if record already exists in cache
    $cacheRes = callSupabaseRest("bdcourier_checks?phone=eq.{$canonicalPhone}&select=*");
    if ($cacheRes['status'] === 200 && !empty($cacheRes['data'])) {
        $existing = $cacheRes['data'][0];
        
        // Link order if orderId given
        if ($orderId && !empty($existing['id'])) {
            callSupabaseRest("orders?order_id=eq.{$orderId}", 'PATCH', ['courier_check_id' => $existing['id']]);
        }

        if ($existing['status'] === 'completed') {
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'source' => 'cache',
                'status' => 'completed',
                'data' => $existing['data'],
                'record_id' => $existing['id'],
                'phone' => $canonicalPhone
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if ($existing['status'] === 'failed' || $existing['status'] === 'unknown') {
            http_response_code(200);
            echo json_encode([
                'success' => false,
                'source' => 'cache',
                'status' => $existing['status'],
                'error' => $existing['error'] ?? 'Previous lookup attempt failed or was inconclusive',
                'record_id' => $existing['id'],
                'phone' => $canonicalPhone
            ]);
            exit;
        }

        if ($existing['status'] === 'pending') {
            http_response_code(200);
            echo json_encode([
                'success' => false,
                'source' => 'cache',
                'status' => 'pending',
                'message' => 'Lookup is currently in progress',
                'record_id' => $existing['id'],
                'phone' => $canonicalPhone
            ]);
            exit;
        }
    }

    // 2. Verify integration enabled
    $settingsRes = callSupabaseRest('bdcourier_settings?id=eq.config&select=*');
    $settings = ($settingsRes['status'] === 200 && !empty($settingsRes['data'])) ? $settingsRes['data'][0] : null;

    if (empty($settings['is_enabled'])) {
        http_response_code(200);
        echo json_encode([
            'success' => false,
            'source' => 'skipped',
            'status' => 'disabled',
            'message' => 'BD Courier integration is not enabled in settings'
        ]);
        exit;
    }

    // 3. Decrypt API Key
    $apiKey = decryptApiKey(
        $settings['api_key_encrypted'] ?? null,
        $settings['encryption_iv'] ?? null,
        $settings['encryption_tag'] ?? null
    );

    if (!$apiKey) {
        http_response_code(200);
        echo json_encode([
            'success' => false,
            'status' => 'error',
            'error' => 'API Key could not be decrypted or is not configured'
        ]);
        exit;
    }

    // 4. Atomic insert / pending claim
    $insertPayload = [
        'phone' => $canonicalPhone,
        'status' => 'pending',
        'created_at' => gmdate('c'),
        'claimed_at' => gmdate('c'),
        'updated_at' => gmdate('c')
    ];
    $insertRes = callSupabaseRest('bdcourier_checks', 'POST', $insertPayload);
    $checkRecord = ($insertRes['status'] >= 200 && $insertRes['status'] < 300 && !empty($insertRes['data'])) ? $insertRes['data'][0] : null;

    // If concurrent insert failed, fetch existing
    if (!$checkRecord) {
        $recheck = callSupabaseRest("bdcourier_checks?phone=eq.{$canonicalPhone}&select=*");
        if ($recheck['status'] === 200 && !empty($recheck['data'])) {
            $checkRecord = $recheck['data'][0];
        }
    }

    $recordId = $checkRecord['id'] ?? null;

    // 5. Query official BD Courier API
    $ch = curl_init('https://api.bdcourier.com/courier-check');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        "Authorization: Bearer $apiKey"
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['phone' => $canonicalPhone]));
    curl_setopt($ch, CURLOPT_TIMEOUT, 12);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

    $apiResp = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr = curl_error($ch);

    // If host has outdated SSL CA bundle, retry with fallback SSL verification
    if ($curlErr && (stripos($curlErr, 'ssl') !== false || stripos($curlErr, 'certificate') !== false)) {
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        $apiResp = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlErr = curl_error($ch);
    }
    curl_close($ch);

    $now = gmdate('c');

    if ($curlErr) {
        if ($recordId) {
            callSupabaseRest("bdcourier_checks?id=eq.{$recordId}", 'PATCH', [
                'status' => 'failed',
                'error' => "Network error: $curlErr",
                'updated_at' => $now
            ]);
        }
        http_response_code(200);
        echo json_encode([
            'success' => false,
            'status' => 'failed',
            'error' => "Network error contacting BD Courier: $curlErr",
            'record_id' => $recordId,
            'phone' => $canonicalPhone
        ]);
        exit;
    }

    $rawJson = json_decode($apiResp, true) ?: [];

    // Success response
    if ($httpCode === 200 || (isset($rawJson['status']) && $rawJson['status'] === 'success')) {
        $sanitized = sanitizeCourierData($rawJson, $canonicalPhone);

        if ($recordId) {
            callSupabaseRest("bdcourier_checks?id=eq.{$recordId}", 'PATCH', [
                'status' => 'completed',
                'data' => $sanitized,
                'completed_at' => $now,
                'updated_at' => $now
            ]);
        }

        if ($orderId && $recordId) {
            callSupabaseRest("orders?order_id=eq.{$orderId}", 'PATCH', ['courier_check_id' => $recordId]);
        }

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'source' => 'api',
            'status' => 'completed',
            'data' => $sanitized,
            'record_id' => $recordId,
            'phone' => $canonicalPhone
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Handle authentication / invalid key error from BD Courier
    $errorMsg = $rawJson['message'] ?? "BD Courier responded with HTTP $httpCode";
    if ($recordId) {
        callSupabaseRest("bdcourier_checks?id=eq.{$recordId}", 'PATCH', [
            'status' => 'failed',
            'error' => $errorMsg,
            'updated_at' => $now
        ]);
    }

    http_response_code(200);
    echo json_encode([
        'success' => false,
        'status' => 'failed',
        'error' => $errorMsg,
        'record_id' => $recordId,
        'phone' => $canonicalPhone
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method Not Allowed']);
