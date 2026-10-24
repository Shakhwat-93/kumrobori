<?php
/**
 * Herbheez BD — Supabase & Environment Helper for PHP Runtime
 */

function loadEnvFile() {
    $candidates = [
        __DIR__ . '/../../.env',
        __DIR__ . '/../.env',
        dirname($_SERVER['DOCUMENT_ROOT'] ?? '') . '/.env'
    ];
    foreach ($candidates as $file) {
        if (file_exists($file) && is_readable($file)) {
            $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                $line = trim($line);
                if (!$line || str_starts_with($line, '#')) continue;
                $pos = strpos($line, '=');
                if ($pos !== false) {
                    $key = trim(substr($line, 0, $pos));
                    $val = trim(substr($line, $pos + 1));
                    if (!isset($_ENV[$key]) && !getenv($key)) {
                        putenv("$key=$val");
                        $_ENV[$key] = $val;
                    }
                }
            }
            break;
        }
    }
}

loadEnvFile();

function getSupabaseUrl() {
    return getenv('SUPABASE_URL') ?: getenv('VITE_SUPABASE_URL') ?: 'https://ovpsfqsvwmtzxglxrceg.supabase.co';
}

function getSupabaseServiceKey() {
    return getenv('SUPABASE_SERVICE_ROLE_KEY') ?: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92cHNmcXN2d210enhnbHhyY2VnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTE1OTc1MiwiZXhwIjoyMTA2NzM1NzUyfQ.mkmSTM9VCv5DT9JlJPYWmXMeNhd4C4Mgj23emc2rQs4';
}

function getClientIp() {
    $headers = [
        'HTTP_CF_CONNECTING_IP',
        'HTTP_X_REAL_IP',
        'HTTP_X_FORWARDED_FOR',
        'REMOTE_ADDR'
    ];
    foreach ($headers as $header) {
        if (!empty($_SERVER[$header])) {
            $ip = trim(explode(',', $_SERVER[$header])[0]);
            if ($ip === '::1') return '127.0.0.1';
            if (str_starts_with($ip, '::ffff:')) return substr($ip, 7);
            return $ip;
        }
    }
    return '127.0.0.1';
}

function normalizeBdPhone($input) {
    if (!$input) return '';
    $bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    $englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    $str = str_replace($bengaliDigits, $englishDigits, (string)$input);
    $digits = preg_replace('/\D/', '', $str);
    if (str_starts_with($digits, '8801') && strlen($digits) === 13) {
        return substr($digits, 2);
    }
    return $digits;
}

function isValidBdPhone($phone) {
    $normalized = normalizeBdPhone($phone);
    return preg_match('/^01[3-9]\d{8}$/', $normalized) === 1;
}

function callSupabaseRest($path, $method = 'GET', $data = null) {
    $url = rtrim(getSupabaseUrl(), '/') . '/rest/v1/' . ltrim($path, '/');
    $apiKey = getSupabaseServiceKey();

    $ch = curl_init($url);
    $headers = [
        'Content-Type: application/json',
        "apikey: $apiKey",
        "Authorization: Bearer $apiKey",
        'Prefer: return=representation'
    ];

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($data !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
    } elseif ($method === 'PATCH') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PATCH');
        if ($data !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);

    // Fallback retry if shared host curl has outdated CA certificates
    if ($response === false && $curlError && (stripos($curlError, 'ssl') !== false || stripos($curlError, 'certificate') !== false)) {
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
    }
    curl_close($ch);

    if ($response === false) {
        return ['status' => 500, 'error' => $curlError, 'data' => null];
    }

    $decoded = json_decode($response, true);
    return ['status' => $httpCode, 'data' => $decoded, 'raw' => $response];
}

function getEncryptionKey() {
    $secret = getenv('BDCOURIER_ENCRYPTION_SECRET') ?: getSupabaseServiceKey() ?: 'bdcourier-secret-encryption-seed-2026';
    return hash('sha256', $secret . 'bdcourier_salt_v1', true);
}

function encryptApiKey($apiKey) {
    if (!$apiKey) return null;
    $key = getEncryptionKey();
    $iv = openssl_random_pseudo_bytes(16);
    $tag = '';
    $encrypted = openssl_encrypt(trim($apiKey), 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag);
    if ($encrypted === false) return null;
    return [
        'encrypted' => bin2hex($encrypted),
        'iv' => bin2hex($iv),
        'tag' => bin2hex($tag)
    ];
}

function decryptApiKey($encryptedHex, $ivHex, $tagHex) {
    if (!$encryptedHex || !$ivHex || !$tagHex) return null;

    $encryptedHex = trim((string)$encryptedHex);
    $ivHex = trim((string)$ivHex);
    $tagHex = trim((string)$tagHex);

    if (!ctype_xdigit($encryptedHex) || !ctype_xdigit($ivHex) || !ctype_xdigit($tagHex)) {
        return null;
    }

    $rawEncrypted = hex2bin($encryptedHex);
    $rawIv = hex2bin($ivHex);
    $rawTag = hex2bin($tagHex);

    // Try candidate secrets in order of likelihood
    $candidateSecrets = array_filter(array_unique([
        getenv('BDCOURIER_ENCRYPTION_SECRET'),
        getSupabaseServiceKey(),
        getenv('SUPABASE_SERVICE_ROLE_KEY'),
        'bdcourier-secret-encryption-seed-2026'
    ]));

    foreach ($candidateSecrets as $secret) {
        $key = hash('sha256', $secret . 'bdcourier_salt_v1', true);
        $decrypted = @openssl_decrypt(
            $rawEncrypted,
            'aes-256-gcm',
            $key,
            OPENSSL_RAW_DATA,
            $rawIv,
            $rawTag
        );
        if ($decrypted !== false && !empty($decrypted)) {
            return trim($decrypted);
        }
    }
    return null;
}

function maskApiKey($apiKey) {
    if (!$apiKey) return '';
    $trimmed = trim($apiKey);
    if (strlen($trimmed) <= 6) return '••••••••';
    $start = substr($trimmed, 0, 4);
    $end = substr($trimmed, -4);
    return "{$start}••••••••••••{$end}";
}

