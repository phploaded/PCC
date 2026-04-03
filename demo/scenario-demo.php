<?php
declare(strict_types=1);

session_start();

if (empty($_SESSION['pcc_csrf_token'])) {
    try {
        $_SESSION['pcc_csrf_token'] = bin2hex(random_bytes(32));
    } catch (Exception $e) {
        $_SESSION['pcc_csrf_token'] = hash('sha256', uniqid((string)mt_rand(), true));
    }
}

$wpccCsrfToken = $_SESSION['pcc_csrf_token'];
$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
$scheme = $isHttps ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$scriptDir = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/PCC')), '/');
if ($scriptDir === '') {
    $scriptDir = '/';
}
$wpccDomain = $scheme . '://' . $host . ($scriptDir === '/' ? '' : $scriptDir);

$allowedScenarios = [
    'computer-assembly',
    'web-development',
    'solar-installation',
    'wedding-photography',
    'indian-wedding-tent-house',
    'beauty-parlor',
    'event-catering',
    'auto-repair',
    'moving-services',
    'dental-clinic',
    'interior-design',
    'landscaping'
];

$requestedScenario = isset($_GET['scenario']) ? (string)$_GET['scenario'] : 'computer-assembly';
if (!in_array($requestedScenario, $allowedScenarios, true)) {
    $requestedScenario = 'computer-assembly';
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>PCC Demo - Scenario</title>
  <script>wpcc_domain = '<?php echo htmlspecialchars($wpccDomain, ENT_QUOTES, 'UTF-8'); ?>';</script>
  <script>wpcc_csrf_token = '<?php echo htmlspecialchars($wpccCsrfToken, ENT_QUOTES, 'UTF-8'); ?>';</script>
  <script>window.pccRequestedScenario = <?php echo json_encode($requestedScenario, JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT); ?>;</script>
  <script src="lib-pcc/jquery-4.0.0.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  <script src="lib-pcc/jquery.pcc.js"></script>
  <link rel="stylesheet" href="site.css" />
  <link rel="stylesheet" href="lib-pcc/pcc.css" />
  <link rel="stylesheet" href="scenario-demo.css" />
</head>
<body class="demo-page">
  <div class="site-nav-wrap">
    <nav class="site-nav" aria-label="Primary">
      <a class="site-brand" href="index.html">
        <span class="site-brand-mark">PCC</span>
        <span class="site-brand-copy">
          <strong>Demo Studio</strong>
          <span>Scenario walkthroughs and quote previews</span>
        </span>
      </a>
      <input class="site-nav-toggle" type="checkbox" id="site-nav-toggle" />
      <label class="site-nav-button" for="site-nav-toggle" aria-label="Open menu">
        <span></span>
        <span></span>
        <span></span>
      </label>
      <div class="site-nav-links">
        <a href="index.html">Scenario Hub</a>
        <a class="is-active" href="scenario-demo.html">Live Demo</a>
        <a class="is-accent" href="builder.html">Builder</a>
        <a href="admin_quotes.php">Saved Quotes</a>
        <a href="Documentation/index.html">Docs</a>
      </div>
    </nav>
  </div>

  <div class="scenario-shell">
    <header class="scenario-hero">
      <div class="hero-copy">
        <p class="hero-kicker" id="scenario-industry">Industry</p>
        <h1 id="scenario-title">Scenario Demo</h1>
        <p id="scenario-subtitle">Interactive schema-powered quote form.</p>
        <div class="hero-tools">
          <label for="scenario-picker">Switch Scenario</label>
          <select id="scenario-picker" aria-label="Select demo scenario"></select>
          <p class="meta-pill" id="scenario-meta">Live summary ready</p>
          <div class="hero-links">
            <a href="index.html">All Scenarios</a>
            <a href="builder.html">Design Yourself</a>
            <a href="admin_quotes.php">Saved Quotes</a>
          </div>
        </div>
      </div>
      <figure class="hero-banner-card">
        <img id="scenario-banner" src="" alt="" />
      </figure>
    </header>

    <main id="scenario-form-root" class="scenario-runtime" aria-live="polite"></main>
  </div>

  <footer class="site-credit">
    A product of <a href="https://phploaded.com" target="_blank" rel="noopener noreferrer">phploaded.com</a>
  </footer>

  <script src="scenario-demo.js"></script>
</body>
</html>
