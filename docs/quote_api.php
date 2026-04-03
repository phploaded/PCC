<?php
declare(strict_types=1);

session_start();
header('Content-Type: application/json; charset=UTF-8');

require_once __DIR__ . '/quote_storage.php';

function pcc_api_response(bool $ok, string $message, array $extra = [], int $status = 200): void
{
    http_response_code($status);
    echo json_encode(array_merge(['ok' => $ok, 'message' => $message], $extra));
    exit;
}

function pcc_api_sanitize_summary_html(string $html): string
{
    $allowed = '<br><b><strong><fieldset><legend><ul><li><div><span><code><em>';
    $clean = strip_tags($html, $allowed);
    $clean = preg_replace('/<(\/?)([a-z0-9]+)([^>]*)>/i', '<$1$2>', $clean);
    return (string)$clean;
}

function pcc_api_is_valid_quote_id(string $quoteId): bool
{
    return (bool)preg_match('/^Q[0-9]{14}[A-F0-9]{8}$/', $quoteId);
}

function pcc_api_ensure_csrf_token(): string
{
    if (!empty($_SESSION['pcc_csrf_token']) && is_string($_SESSION['pcc_csrf_token'])) {
        return $_SESSION['pcc_csrf_token'];
    }

    try {
        $_SESSION['pcc_csrf_token'] = bin2hex(random_bytes(32));
    } catch (Throwable $e) {
        $_SESSION['pcc_csrf_token'] = hash('sha256', uniqid((string)mt_rand(), true));
    }

    return $_SESSION['pcc_csrf_token'];
}

$action = (string)($_GET['action'] ?? $_POST['action'] ?? '');
if ($action === '') {
    pcc_api_response(false, 'Missing action.', [], 400);
}

if ($action === 'csrf') {
    pcc_api_response(true, 'CSRF token ready.', ['csrf_token' => pcc_api_ensure_csrf_token()], 200);
}

if ($action === 'save') {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        pcc_api_response(false, 'Invalid request method.', [], 405);
    }

    $csrf = (string)($_POST['csrf'] ?? '');
    $sessionToken = pcc_api_ensure_csrf_token();
    if ($csrf === '' || $sessionToken === '' || !hash_equals($sessionToken, $csrf)) {
        pcc_api_response(false, 'Security validation failed.', [], 403);
    }

    $formId = trim((string)($_POST['form_id'] ?? ''));
    $totalText = trim((string)($_POST['total_text'] ?? ''));
    $summaryHtml = pcc_api_sanitize_summary_html((string)($_POST['summary_html'] ?? ''));
    $extraJson = (string)($_POST['extra_json'] ?? '{}');
    $formStateJson = (string)($_POST['form_state_json'] ?? '{}');
    $sourceUrl = trim((string)($_POST['source_url'] ?? ''));

    if ($formId === '' || $totalText === '' || $summaryHtml === '') {
        pcc_api_response(false, 'Missing required payload fields.', [], 400);
    }

    if (strlen($summaryHtml) > 250000 || strlen($formStateJson) > 250000 || strlen($extraJson) > 250000) {
        pcc_api_response(false, 'Payload too large.', [], 413);
    }

    json_decode($extraJson);
    if (json_last_error() !== JSON_ERROR_NONE) {
        pcc_api_response(false, 'Invalid extra_json payload.', [], 400);
    }
    json_decode($formStateJson);
    if (json_last_error() !== JSON_ERROR_NONE) {
        pcc_api_response(false, 'Invalid form_state_json payload.', [], 400);
    }

    $ipHash = hash('sha256', (string)($_SERVER['REMOTE_ADDR'] ?? ''));
    $uaHash = hash('sha256', (string)($_SERVER['HTTP_USER_AGENT'] ?? ''));

    $email = '';
    $extraArr = json_decode($extraJson, true);
    if (is_array($extraArr)) {
        foreach ($extraArr as $k => $v) {
            $name = strtolower((string)$k);
            if (strpos($name, 'email') !== false && filter_var((string)$v, FILTER_VALIDATE_EMAIL)) {
                $email = (string)$v;
                break;
            }
        }
    }

    try {
        $quoteId = pcc_quote_save([
            'form_id' => $formId,
            'email' => $email,
            'total_text' => $totalText,
            'summary_html' => $summaryHtml,
            'extra_json' => $extraJson,
            'form_state_json' => $formStateJson,
            'source_url' => $sourceUrl,
            'ip_hash' => $ipHash,
            'ua_hash' => $uaHash,
        ]);
    } catch (Throwable $e) {
        pcc_api_response(false, 'Failed to save quote.', [], 500);
    }

    pcc_api_response(true, 'Quote saved.', ['quote_id' => $quoteId], 200);
}

if ($action === 'get') {
    $quoteId = trim((string)($_GET['quote_id'] ?? ''));
    if ($quoteId === '') {
        pcc_api_response(false, 'Missing quote_id.', [], 400);
    }
    if (!pcc_api_is_valid_quote_id($quoteId)) {
        pcc_api_response(false, 'Invalid quote_id format.', [], 400);
    }

    try {
        $quote = pcc_quote_get($quoteId);
    } catch (Throwable $e) {
        pcc_api_response(false, 'Failed to load quote.', [], 500);
    }

    if (!$quote) {
        pcc_api_response(false, 'Quote not found.', [], 404);
    }

    pcc_api_response(true, 'Quote loaded.', ['quote' => $quote], 200);
}

pcc_api_response(false, 'Unsupported action.', [], 400);
