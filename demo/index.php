<?php
declare(strict_types=1);

$scenarios = [
    [
        'slug' => 'computer-assembly',
        'title' => 'Computer Assembly Shop',
        'industry' => 'Retail + Hardware Service',
        'summary' => 'Estimate custom PC builds with component tiers, labor, and upgrade add-ons.'
    ],
    [
        'slug' => 'web-development',
        'title' => 'Web Developer Quotation Form',
        'industry' => 'Agency + Freelance',
        'summary' => 'Quote websites and web apps by pages, integrations, QA depth, and support plan.'
    ],
    [
        'slug' => 'solar-installation',
        'title' => 'Solar Installation Estimator',
        'industry' => 'Energy + Construction',
        'summary' => 'Model system size, financing, and battery add-ons for residential projects.'
    ],
    [
        'slug' => 'wedding-photography',
        'title' => 'Wedding Photography Packages',
        'industry' => 'Events + Creative Services',
        'summary' => 'Build event coverage pricing with photographers, delivery speed, and extras.'
    ],
    [
        'slug' => 'indian-wedding-tent-house',
        'title' => 'Indian Wedding Tent House Estimator',
        'industry' => 'Wedding Infrastructure + Tent Services',
        'summary' => 'Estimate tent area, decor tiers, logistics, and seasonal surcharges for Indian weddings.'
    ],
    [
        'slug' => 'beauty-parlor',
        'title' => 'Beauty Parlor Service Estimator',
        'industry' => 'Salon + Bridal Makeup Studio',
        'summary' => 'Estimate salon, bridal, and home-service bookings using artist tier, product kit, and timing surcharges.'
    ],
    [
        'slug' => 'event-catering',
        'title' => 'Event Catering Calculator',
        'industry' => 'Hospitality + Catering',
        'summary' => 'Estimate menu service, staffing, and logistics using guest count and style.'
    ],
    [
        'slug' => 'auto-repair',
        'title' => 'Auto Repair Service Quote',
        'industry' => 'Automotive',
        'summary' => 'Calculate labor, diagnostics, parts budget, and turnaround options.'
    ],
    [
        'slug' => 'moving-services',
        'title' => 'Moving Services Estimator',
        'industry' => 'Logistics + Relocation',
        'summary' => 'Estimate home moves using property size, distance, truck count, and packing add-ons.'
    ],
    [
        'slug' => 'dental-clinic',
        'title' => 'Dental Treatment Plan Quote',
        'industry' => 'Healthcare',
        'summary' => 'Create patient-facing treatment estimates with sessions, diagnostics, and payment plans.'
    ],
    [
        'slug' => 'interior-design',
        'title' => 'Interior Design Proposal',
        'industry' => 'Architecture + Design',
        'summary' => 'Quote design packages by rooms, area, complexity, and supervision extras.'
    ],
    [
        'slug' => 'landscaping',
        'title' => 'Landscaping Project Estimator',
        'industry' => 'Outdoor + Home Services',
        'summary' => 'Estimate yard upgrades with area-based pricing and seasonal installation choices.'
    ]
];
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>PCC Demo Hub - Real-Life Scenario Gallery</title>
  <link rel="stylesheet" href="site.css" />
  <link rel="stylesheet" href="hub.css" />
</head>
<body>
  <div class="site-nav-wrap">
    <nav class="site-nav" aria-label="Primary">
      <a class="site-brand" href="index.html">
        <span class="site-brand-mark">PCC</span>
        <span class="site-brand-copy">
          <strong>Demo Studio</strong>
          <span>Quotation flows and live schema builder</span>
        </span>
      </a>
      <input class="site-nav-toggle" type="checkbox" id="site-nav-toggle" />
      <label class="site-nav-button" for="site-nav-toggle" aria-label="Open menu">
        <span></span>
        <span></span>
        <span></span>
      </label>
      <div class="site-nav-links">
        <a class="is-active" href="index.html">Scenario Hub</a>
        <a href="scenario-demo.html">Live Demo</a>
        <a class="is-accent" href="builder.html">Builder</a>
        <a href="admin_quotes.php">Saved Quotes</a>
        <a href="Documentation/index.html">Docs</a>
      </div>
    </nav>
  </div>

  <div class="hub-shell">
    <header class="hub-hero">
      <p class="kicker">PCC Scenario Hub</p>
      <h1><?php echo count($scenarios); ?> Real-Life Quotation Demos</h1>
      <p>Pick any scenario to see a production-style quote flow powered by the same jQuery PCC plugin. Each demo has its own visual theme and domain-specific fields.</p>
      <div class="hero-links">
        <a href="Documentation/index.html">Documentation</a>
        <a href="admin_quotes.php">Saved Quotes Admin</a>
      </div>
    </header>

    <main class="hub-grid">
      <?php foreach ($scenarios as $index => $scenario): ?>
        <article class="scenario-card">
          <p class="card-index"><?php echo str_pad((string)($index + 1), 2, '0', STR_PAD_LEFT); ?></p>
          <p class="card-industry"><?php echo htmlspecialchars($scenario['industry'], ENT_QUOTES, 'UTF-8'); ?></p>
          <h2><?php echo htmlspecialchars($scenario['title'], ENT_QUOTES, 'UTF-8'); ?></h2>
          <p><?php echo htmlspecialchars($scenario['summary'], ENT_QUOTES, 'UTF-8'); ?></p>
          <a class="card-link" href="scenario-demo.html?scenario=<?php echo urlencode($scenario['slug']); ?>">Open Demo</a>
        </article>
      <?php endforeach; ?>

      <article class="scenario-card builder-card">
        <p class="card-index"><?php echo str_pad((string)(count($scenarios) + 1), 2, '0', STR_PAD_LEFT); ?></p>
        <p class="card-industry">Create Your Own</p>
        <h2>Design Yourself</h2>
        <p>Launch the visual builder to create a custom form schema, import/export JSON, and render an interactive calculator instantly.</p>
        <a class="card-link" href="builder.html">Open Visual Builder</a>
      </article>
    </main>
  </div>

  <footer class="site-credit">
    A product of <a href="https://phploaded.com" target="_blank" rel="noopener noreferrer">phploaded.com</a>
  </footer>
</body>
</html>
