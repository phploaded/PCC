<?php
declare(strict_types=1);

require_once __DIR__ . '/quote_storage.php';

$selectedId = trim((string)($_GET['quote_id'] ?? ''));
$selectedQuote = null;

try {
    $quotes = pcc_quote_list(500);
    if ($selectedId !== '') {
        $selectedQuote = pcc_quote_get($selectedId);
    }
} catch (Throwable $e) {
    $quotes = [];
    $selectedQuote = null;
}

function esc(string $v): string
{
    return htmlspecialchars($v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>PCC Saved Quotes Admin</title>
  <style>
    body { font: 14px/1.5 Arial, sans-serif; margin: 0; background: #f4f6f8; color: #1f2937; }
    .wrap { max-width: 1200px; margin: 20px auto; padding: 0 16px; }
    .card { background: #fff; border: 1px solid #d9dee5; border-radius: 10px; padding: 16px; margin-top: 14px; }
    h1, h2 { margin: 0 0 12px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { border-bottom: 1px solid #e6e9ee; padding: 8px; text-align: left; vertical-align: top; }
    th { background: #f8fafc; }
    code, pre { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 6px; padding: 2px 6px; }
    pre { padding: 10px; overflow: auto; }
    .muted { color: #6b7280; }
    a { color: #0f5f44; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .site-credit { max-width: 1200px; margin: 28px auto 24px; padding: 0 16px; text-align: center; color: #6b7280; font-size: 14px; }
    .site-credit a { color: #0f5f44; font-weight: 700; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1>PCC Saved Quotes Admin</h1>
      <p class="muted">Use this page to review quote persistence records created from the live estimator.</p>
      <p><a href="index.php">Back to Demo</a></p>
    </div>

    <div class="card">
      <h2>Quotes</h2>
      <table>
        <thead>
          <tr>
            <th>Quote ID</th>
            <th>Form ID</th>
            <th>Email</th>
            <th>Total</th>
            <th>Created</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
        <?php if (!$quotes): ?>
          <tr><td colspan="6">No quotes found.</td></tr>
        <?php else: ?>
          <?php foreach ($quotes as $row): ?>
          <tr>
            <td><a href="?quote_id=<?= esc((string)$row['quote_id']) ?>"><?= esc((string)$row['quote_id']) ?></a></td>
            <td><?= esc((string)$row['form_id']) ?></td>
            <td><?= esc((string)$row['email']) ?></td>
            <td><?= esc((string)$row['total_text']) ?></td>
            <td><?= esc((string)$row['created_at']) ?></td>
            <td><?= esc((string)$row['source_url']) ?></td>
          </tr>
          <?php endforeach; ?>
        <?php endif; ?>
        </tbody>
      </table>
    </div>

    <?php if ($selectedQuote): ?>
    <div class="card">
      <h2>Quote Detail: <?= esc((string)$selectedQuote['quote_id']) ?></h2>
      <p><strong>Form:</strong> <?= esc((string)$selectedQuote['form_id']) ?></p>
      <p><strong>Email:</strong> <?= esc((string)$selectedQuote['email']) ?></p>
      <p><strong>Total:</strong> <?= esc((string)$selectedQuote['total_text']) ?></p>
      <p><strong>Created:</strong> <?= esc((string)$selectedQuote['created_at']) ?></p>

      <h3>Summary HTML</h3>
      <div style="border:1px solid #e5e7eb;padding:12px;border-radius:8px;background:#fff;">
        <?= (string)$selectedQuote['summary_html'] ?>
      </div>

      <h3>Extra JSON</h3>
      <pre><?= esc((string)$selectedQuote['extra_json']) ?></pre>

      <h3>Form State JSON</h3>
      <pre><?= esc((string)$selectedQuote['form_state_json']) ?></pre>
    </div>
    <?php elseif ($selectedId !== ''): ?>
    <div class="card">
      <p>Quote ID <code><?= esc($selectedId) ?></code> was not found.</p>
    </div>
    <?php endif; ?>
  </div>
  <footer class="site-credit">
    A product of <a href="https://phploaded.com" target="_blank" rel="noopener noreferrer">phploaded.com</a>
  </footer>
</body>
</html>
