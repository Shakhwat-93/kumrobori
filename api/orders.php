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

require_once __DIR__ . '/_lib/supabaseHelper.php';

function triggerCourierCheckIfEnabled($phone, $orderId) {
    try {
        $settingsRes = callSupabaseRest('bdcourier_settings?id=eq.config&select=*');
        if ($settingsRes['status'] === 200 && !empty($settingsRes['data'])) {
            $cfg = $settingsRes['data'][0];
            if (!empty($cfg['is_enabled']) && !empty($cfg['api_key_encrypted'])) {
                $key = decryptApiKey($cfg['api_key_encrypted'], $cfg['encryption_iv'] ?? '', $cfg['encryption_tag'] ?? '');
                if ($key) {
                    $ch = curl_init('https://api.bdcourier.com/courier-check');
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($ch, CURLOPT_POST, true);
                    curl_setopt($ch, CURLOPT_HTTPHEADER, [
                        'Content-Type: application/json',
                        "Authorization: Bearer $key"
                    ]);
                    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['phone' => $phone]));
                    curl_setopt($ch, CURLOPT_TIMEOUT, 8);
                    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
                    $resp = curl_exec($ch);
                    if (curl_errno($ch)) {
                        $cErr = curl_error($ch);
                        if (stripos($cErr, 'ssl') !== false || stripos($cErr, 'certificate') !== false) {
                            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
                            $resp = curl_exec($ch);
                        }
                    }
                    curl_close($ch);

                    $raw = json_decode($resp, true) ?: [];
                    if (isset($raw['status']) && $raw['status'] === 'success') {
                        $insertRes = callSupabaseRest('bdcourier_checks', 'POST', [
                            'phone' => $phone,
                            'status' => 'completed',
                            'data' => $raw['data'] ?? $raw,
                            'completed_at' => gmdate('c')
                        ]);
                        if (!empty($insertRes['data'][0]['id']) && $orderId) {
                            callSupabaseRest("orders?order_id=eq.{$orderId}", 'PATCH', ['courier_check_id' => $insertRes['data'][0]['id']]);
                        }
                    }
                }
            }
        }
    } catch (\Throwable $t) {
        // Suppress background errors so order response is never hindered
    }
}

$rawInput = file_get_contents('php://input');
if (!$rawInput && php_sapi_name() === 'cli') {
    $rawInput = file_get_contents('php://stdin');
}
$body = json_decode($rawInput, true) ?: [];

$name = trim($body['name'] ?? '');
$phone = trim($body['phone'] ?? '');
$address = trim($body['address'] ?? '');
$area = trim($body['area'] ?? 'ঢাকার ভিতরে');
$packageName = trim($body['package_name'] ?? 'Herbheez Product');
$quantity = max(1, (int)($body['quantity'] ?? 1));
$unitPrice = (float)($body['unit_price'] ?? 0);
$totalPrice = (float)($body['total_price'] ?? 0);
$orderId = trim($body['order_id'] ?? ('ORD-' . time() . '-' . rand(100, 999)));

// Enforce: 1200 taka total or 2-bottle course is strictly 2 packets minimum
if (($totalPrice == 1200 || mb_strpos($packageName, '২ বোতল') !== false || stripos($packageName, '2 বোতল') !== false || mb_strpos($packageName, '২ মাসের') !== false) && $quantity < 2) {
    $quantity = 2;
}

if (!$name || !$phone || !$address) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'অনুগ্রহ করে আপনার নাম, মোবাইল নম্বর এবং সম্পূর্ণ ঠিকানা সঠিকভাবে লিখুন।'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$canonicalPhone = normalizeBdPhone($phone);
if (!isValidBdPhone($canonicalPhone)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'সঠিক ১১ ডিজিটের বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$clientIp = getClientIp();
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';

// 1. Execute atomic duplicate-order protection RPC in Supabase (submit_order_secure)
$subtotal = $unitPrice * $quantity;
$deliveryFee = 0;

$rpcParams = [
    'p_order_id' => $orderId,
    'p_name' => $name,
    'p_phone' => $canonicalPhone,
    'p_address' => $address,
    'p_area' => $area ?: 'ঢাকার ভিতরে',
    'p_package_name' => $packageName ?: 'Zero Allergy Course',
    'p_quantity' => (int)$quantity,
    'p_unit_price' => (float)$unitPrice,
    'p_subtotal' => (float)$subtotal,
    'p_delivery_fee' => (float)$deliveryFee,
    'p_total_price' => (float)$totalPrice,
    'p_ip_address' => $clientIp,
    'p_user_agent' => $userAgent,
    'p_items' => []
];

$rpcRes = callSupabaseRest('rpc/submit_order_secure', 'POST', $rpcParams);

if ($rpcRes['status'] === 200 && is_array($rpcRes['data'])) {
    $result = $rpcRes['data'];

    // Check if blocked by duplicate order protection
    if (isset($result['success']) && $result['success'] === false && ($result['code'] ?? '') === 'DUPLICATE_ORDER_BLOCKED') {
        http_response_code(429);
        echo json_encode([
            'success' => false,
            'code' => 'DUPLICATE_ORDER_BLOCKED',
            'reason' => $result['reason'] ?? 'same_phone',
            'message' => $result['message'] ?? 'আপনার তথ্য দিয়ে সম্প্রতি একটি অর্ডার করা হয়েছে। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করে আবার চেষ্টা করুন।',
            'retry_after_seconds' => $result['retry_after_seconds'] ?? 600,
            'duration_minutes' => $result['duration_minutes'] ?? 10
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Allowed / Successfully created order
    if (!empty($result['success']) && !empty($result['order'])) {
        $order = $result['order'];

        // Auto courier check in background if integration active
        @triggerCourierCheckIfEnabled($canonicalPhone, $orderId);

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'অর্ডার সফলভাবে সম্পন্ন হয়েছে!',
            'order' => $order
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// 2. Direct secondary guard against duplicate orders if RPC was unavailable
$dupSettingsRes = callSupabaseRest('duplicate_order_settings?id=eq.config&select=*');
$dupSettings = ($dupSettingsRes['status'] === 200 && !empty($dupSettingsRes['data'])) ? $dupSettingsRes['data'][0] : null;

if ($dupSettings && !empty($dupSettings['is_enabled'])) {
    $duration = max(1, (int)($dupSettings['duration_minutes'] ?? 10));
    $cutoff = gmdate('c', time() - ($duration * 60));

    $checkPhone = !empty($dupSettings['block_same_phone']);
    $checkIp = !empty($dupSettings['block_same_ip']);

    $dupFound = false;
    $dupReason = '';

    if ($checkPhone) {
        $phoneCheck = callSupabaseRest("orders?phone=eq.{$canonicalPhone}&created_at=gte.{$cutoff}&status=not.in.(cancelled,failed,rejected)&select=order_id,created_at&order=created_at.desc&limit=1");
        if ($phoneCheck['status'] === 200 && !empty($phoneCheck['data'])) {
            $dupFound = true;
            $dupReason = 'same_phone';
        }
    }

    if (!$dupFound && $checkIp && $clientIp && $clientIp !== '127.0.0.1') {
        $ipCheck = callSupabaseRest("orders?ip_address=eq.{$clientIp}&created_at=gte.{$cutoff}&status=not.in.(cancelled,failed,rejected)&select=order_id,created_at&order=created_at.desc&limit=1");
        if ($ipCheck['status'] === 200 && !empty($ipCheck['data'])) {
            $dupFound = true;
            $dupReason = 'same_ip';
        }
    }

    if ($dupFound) {
        http_response_code(429);
        echo json_encode([
            'success' => false,
            'code' => 'DUPLICATE_ORDER_BLOCKED',
            'reason' => $dupReason,
            'message' => "আপনার তথ্য দিয়ে সম্প্রতি একটি অর্ডার করা হয়েছে। অনুগ্রহ করে প্রায় {$duration} মিনিট পরে আবার চেষ্টা করুন।",
            'retry_after_seconds' => $duration * 60,
            'duration_minutes' => $duration
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// 3. Fallback direct insert if RPC had transient error but duplicate check passed
$fallbackData = [
    'order_id' => $orderId,
    'name' => $name,
    'phone' => $canonicalPhone,
    'address' => $address,
    'area' => $area ?: 'ঢাকার ভিতরে',
    'package_name' => $packageName ?: 'Zero Allergy Course',
    'quantity' => (int)$quantity,
    'unit_price' => (float)$unitPrice,
    'total_price' => (float)$totalPrice,
    'ip_address' => $clientIp,
    'status' => 'pending',
    'created_at' => gmdate('c')
];

$insertRes = callSupabaseRest('orders', 'POST', [$fallbackData]);

if ($insertRes['status'] >= 200 && $insertRes['status'] < 300) {
    @triggerCourierCheckIfEnabled($canonicalPhone, $orderId);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'অর্ডার সফলভাবে সম্পন্ন হয়েছে!',
        'order' => $fallbackData
    ], JSON_UNESCAPED_UNICODE);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'অর্ডার সংরক্ষণ করতে সমস্যা হয়েছে। অনুগ্রহ করে সরাসরি যোগাযোগ করুন।'
    ], JSON_UNESCAPED_UNICODE);
}
