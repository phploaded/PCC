<?php
declare(strict_types=1);

function pcc_quote_db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dataDir = __DIR__ . DIRECTORY_SEPARATOR . 'data';
    if (!is_dir($dataDir)) {
        mkdir($dataDir, 0775, true);
    }

    $dbPath = $dataDir . DIRECTORY_SEPARATOR . 'pcc_quotes.sqlite';
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    pcc_quote_migrate($pdo);
    return $pdo;
}

function pcc_quote_migrate(PDO $pdo): void
{
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS quotes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            quote_id TEXT NOT NULL UNIQUE,
            form_id TEXT NOT NULL,
            email TEXT,
            total_text TEXT NOT NULL,
            summary_html TEXT NOT NULL,
            extra_json TEXT NOT NULL,
            form_state_json TEXT NOT NULL,
            source_url TEXT,
            ip_hash TEXT,
            ua_hash TEXT,
            created_at TEXT NOT NULL
        )'
    );
    $pdo->exec('CREATE INDEX IF NOT EXISTS idx_quotes_quote_id ON quotes(quote_id)');
    $pdo->exec('CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC)');
}

function pcc_quote_generate_id(): string
{
    $rand = bin2hex(random_bytes(4));
    return 'Q' . gmdate('YmdHis') . strtoupper($rand);
}

function pcc_quote_save(array $payload): string
{
    $pdo = pcc_quote_db();
    $quoteId = pcc_quote_generate_id();

    $stmt = $pdo->prepare(
        'INSERT INTO quotes (
            quote_id, form_id, email, total_text, summary_html, extra_json, form_state_json, source_url, ip_hash, ua_hash, created_at
        ) VALUES (
            :quote_id, :form_id, :email, :total_text, :summary_html, :extra_json, :form_state_json, :source_url, :ip_hash, :ua_hash, :created_at
        )'
    );

    $stmt->execute([
        ':quote_id' => $quoteId,
        ':form_id' => (string)($payload['form_id'] ?? ''),
        ':email' => (string)($payload['email'] ?? ''),
        ':total_text' => (string)($payload['total_text'] ?? ''),
        ':summary_html' => (string)($payload['summary_html'] ?? ''),
        ':extra_json' => (string)($payload['extra_json'] ?? '{}'),
        ':form_state_json' => (string)($payload['form_state_json'] ?? '{}'),
        ':source_url' => (string)($payload['source_url'] ?? ''),
        ':ip_hash' => (string)($payload['ip_hash'] ?? ''),
        ':ua_hash' => (string)($payload['ua_hash'] ?? ''),
        ':created_at' => gmdate('c'),
    ]);

    return $quoteId;
}

function pcc_quote_get(string $quoteId): ?array
{
    $pdo = pcc_quote_db();
    $stmt = $pdo->prepare('SELECT quote_id, form_id, email, total_text, summary_html, extra_json, form_state_json, source_url, created_at FROM quotes WHERE quote_id = :quote_id LIMIT 1');
    $stmt->execute([':quote_id' => $quoteId]);
    $row = $stmt->fetch();
    return $row ?: null;
}

function pcc_quote_list(int $limit = 200): array
{
    $limit = max(1, min(1000, $limit));
    $pdo = pcc_quote_db();
    $stmt = $pdo->prepare('SELECT quote_id, form_id, email, total_text, source_url, created_at FROM quotes ORDER BY created_at DESC LIMIT :lim');
    $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
    $stmt->execute();
    return $stmt->fetchAll();
}
