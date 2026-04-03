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
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>PCC Visual Builder</title>
  <script>wpcc_domain = '<?php echo htmlspecialchars($wpccDomain, ENT_QUOTES, 'UTF-8'); ?>';</script>
  <script>wpcc_csrf_token = '<?php echo htmlspecialchars($wpccCsrfToken, ENT_QUOTES, 'UTF-8'); ?>';</script>
  <script src="lib-pcc/jquery-4.0.0.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  <script src="lib-pcc/jquery.pcc.js"></script>
  <link rel="stylesheet" href="site.css" />
  <link rel="stylesheet" href="lib-pcc/pcc.css" />
  <link rel="stylesheet" href="builder.css" />
</head>
<body>
  <div class="site-nav-wrap">
    <nav class="site-nav" aria-label="Primary">
      <a class="site-brand" href="index.html">
        <span class="site-brand-mark">PCC</span>
        <span class="site-brand-copy">
          <strong>Demo Studio</strong>
          <span>Schema builder and live form preview</span>
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
        <a href="scenario-demo.html">Live Demo</a>
        <a class="is-active" href="builder.html">Builder</a>
        <a href="admin_quotes.php">Saved Quotes</a>
        <a href="Documentation/index.html">Docs</a>
      </div>
    </nav>
  </div>

  <div class="builder-shell">
    <header class="builder-hero">
      <p class="builder-kicker">PCC Builder</p>
      <h1>PCC Visual Form Builder</h1>
      <p>Create a quote form in three steps: set the basics, add steps and fields, then preview the result. Advanced options stay tucked away until you need them.</p>
      <p class="small-note"><a href="index.html">Back to Scenario Hub</a> <span>/</span> <a href="Documentation/index.html">Documentation</a></p>
    </header>

    <section class="builder-guide" aria-label="Quick start">
      <article class="guide-card">
        <span class="guide-index">1</span>
        <h2>Name the form</h2>
        <p>Choose the title, currency, and email button text first so the preview feels real from the start.</p>
      </article>
      <article class="guide-card">
        <span class="guide-index">2</span>
        <h2>Add steps</h2>
        <p>Keep each step focused. Group related fields together so the final form reads like a conversation.</p>
      </article>
      <article class="guide-card">
        <span class="guide-index">3</span>
        <h2>Render and export</h2>
        <p>Preview anytime, then open JSON or HTML only when you want to copy the output into another page.</p>
      </article>
    </section>

    <main class="builder-grid">
      <section class="builder-main">
        <div class="panel">
          <div class="panel-head">
            <h2>1. Form Basics</h2>
            <p>Start with the simple details every form needs. Pricing controls and debug tools are under Advanced.</p>
          </div>
          <div class="field-grid">
            <label>Form ID
              <input id="bf-form-id" type="text" />
            </label>
            <label>Form Title
              <input id="bf-form-title" type="text" />
            </label>
            <label>Currency Suffix
              <input id="bf-currency" type="text" />
            </label>
            <label>Email Button Text
              <input id="bf-email-button" type="text" />
            </label>
            <label>Locale
              <input id="bf-locale" type="text" />
            </label>
          </div>
          <details class="builder-disclosure">
            <summary>Advanced pricing and behaviour</summary>
            <div class="disclosure-body">
              <div class="field-grid">
                <label>Tax Rate %
                  <input id="bf-tax-rate" type="number" step="0.01" />
                </label>
                <label>Discount % (form level)
                  <input id="bf-discount-percent" type="number" step="0.01" />
                </label>
                <label>Discount Fixed
                  <input id="bf-discount-fixed" type="number" step="0.01" />
                </label>
              </div>
              <label>Coupons JSON (object map)
                <textarea id="bf-coupons"></textarea>
              </label>
              <div class="check-row">
                <label><input id="bf-wizard" type="checkbox" /> Wizard mode</label>
                <label><input id="bf-debugger" type="checkbox" /> Rule debugger panel</label>
              </div>
            </div>
          </details>
          <div class="btn-row">
            <button id="bf-apply-settings" type="button">Apply Settings</button>
            <button class="secondary" id="bf-render-preview" type="button">Render Preview</button>
          </div>
        </div>

        <div class="panel">
          <div class="panel-head">
            <h2>2. Steps and Fields</h2>
            <p>Add one step at a time. Only the essential field options are visible by default so the editor stays approachable.</p>
          </div>
          <div class="field-grid-3">
            <label>Step
              <select id="bf-step-select"></select>
            </label>
            <label>Step Title
              <input id="bf-step-title" type="text" />
            </label>
            <label class="label-action">
              <span class="label-spacer"></span>
              <button class="secondary" id="bf-rename-step" type="button">Rename Step</button>
            </label>
          </div>
          <div class="btn-row">
            <button class="secondary" id="bf-add-step" type="button">Add Step</button>
            <button class="danger" id="bf-remove-step" type="button">Remove Step</button>
          </div>

          <div class="panel-divider"></div>

          <div class="field-grid">
            <label>Field Type
              <select id="bf-field-type">
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="textarea">Textarea</option>
                <option value="select">Select</option>
                <option value="radio-group">Radio Group</option>
                <option value="checkbox-group">Checkbox Group</option>
                <option value="checkbox">Single Checkbox</option>
                <option value="hidden">Hidden</option>
              </select>
            </label>
            <label>Field Name
              <input id="bf-field-name" type="text" />
            </label>
            <label>Label / Title
              <input id="bf-field-label" type="text" />
            </label>
            <label>Default Value
              <input id="bf-field-value" type="text" />
            </label>
            <label>Placeholder
              <input id="bf-field-placeholder" type="text" />
            </label>
            <label>Cost
              <input id="bf-field-cost" type="text" placeholder="this or number" />
            </label>
            <label>Multiplier
              <input id="bf-field-mult" type="text" />
            </label>
            <label>Show If Rule
              <input id="bf-field-show-if" type="text" placeholder="timeline=1800 && area>=500" />
            </label>
          </div>
          <div class="check-row">
            <label><input id="bf-field-required" type="checkbox" /> Required</label>
            <label><input id="bf-field-readonly" type="checkbox" /> Readonly</label>
          </div>
          <details class="builder-disclosure">
            <summary>Show advanced field settings</summary>
            <div class="disclosure-body">
              <div class="field-grid-3">
                <label>Validate (email|number)
                  <input id="bf-field-validate" type="text" />
                </label>
                <label>Formula
                  <input id="bf-field-formula" type="text" placeholder="{area}*0.2" />
                </label>
                <label>Formula Precision
                  <input id="bf-field-formula-precision" type="number" />
                </label>
                <label>Rows (textarea)
                  <input id="bf-field-rows" type="number" />
                </label>
                <label>Min
                  <input id="bf-field-min" type="text" />
                </label>
                <label>Max
                  <input id="bf-field-max" type="text" />
                </label>
                <label>Step
                  <input id="bf-field-step" type="text" />
                </label>
                <label>Pattern
                  <input id="bf-field-pattern" type="text" />
                </label>
              </div>
              <label>Options (for select/radio-group/checkbox-group): one per line as <code>Label|Value|Cost|Title|Checked</code>
                <textarea id="bf-field-options"></textarea>
              </label>
            </div>
          </details>
          <div class="btn-row">
            <button id="bf-add-field" type="button">Add Field</button>
            <button class="secondary" id="bf-clear-field" type="button">Reset Editor</button>
          </div>

          <div class="panel-subhead">
            <h3>Fields In Current Step</h3>
            <p>This list updates as you add, edit, or remove fields.</p>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Type</th>
                  <th>Name</th>
                  <th>Label</th>
                  <th>Rule / Formula</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="bf-field-table-body"></tbody>
            </table>
          </div>
        </div>
      </section>

      <aside class="builder-side">
        <div class="panel panel-preview">
          <div class="panel-head">
            <h2>3. Live Preview</h2>
            <p>Render the form anytime to see the layout, interactions, and total summary before exporting anything.</p>
          </div>
          <div id="bf-status" class="status ok">Ready.</div>
          <div class="builder-preview" id="schema-preview"></div>
        </div>

        <details class="builder-disclosure">
          <summary>Show JSON config</summary>
          <div class="panel panel-inner">
            <textarea id="bf-json" class="code-area code-area-lg"></textarea>
            <div class="btn-row">
              <button id="bf-apply-json" type="button">Validate + Render JSON</button>
              <button class="secondary" id="bf-copy-json" type="button">Copy JSON</button>
              <button class="secondary" id="bf-download-json" type="button">Download JSON</button>
            </div>
            <p class="small-note">No server call needed. JSON download uses the browser Blob API.</p>
          </div>
        </details>

        <details class="builder-disclosure">
          <summary>Show generated HTML</summary>
          <div class="panel panel-inner">
            <textarea id="bf-html" class="code-area"></textarea>
            <div class="btn-row">
              <button class="secondary" id="bf-copy-html" type="button">Copy HTML</button>
            </div>
          </div>
        </details>
      </aside>
    </main>
  </div>

  <footer class="site-credit">
    A product of <a href="https://phploaded.com" target="_blank" rel="noopener noreferrer">phploaded.com</a>
  </footer>

  <script>
    jQuery(function ($) {
      var editIndex = -1;
      var state = getDefaultSchema();

      function getDefaultSchema() {
        return {
          id: 'pcc-custom-form',
          title: 'Custom Project Estimator',
          currencySymbol: ' USD',
          emailButtonText: 'Email My Estimate',
          locale: 'en-US',
          wizard: true,
          ruleDebugger: true,
          options: {
            history: true,
            historyShortcuts: true,
            restoreDraftPrompt: false
          },
          pricing: {
            taxRate: 8.25,
            discountPercent: 0,
            discountFixed: 0,
            coupons: {
              SAVE10: { type: 'percent', value: 10, title: 'SAVE10 Coupon' },
              FIX500: { type: 'fixed', value: 500, title: 'FIX500 Coupon' }
            }
          },
          steps: [
            {
              title: 'Project Inputs',
              fields: [
                { type: 'number', name: 'area', label: 'Floor Area', value: 600, min: 100, cost: 'this', mult: 4.2, required: true },
                { type: 'number', name: 'rooms', label: 'Rooms Included', value: 3, min: 1, cost: 'this', mult: 1400, required: true },
                { type: 'number', name: 'contingency', label: 'Contingency Buffer', formula: '({area}*0.2)+({rooms}*100)', formulaPrecision: 0, cost: 'this', readonly: true },
                {
                  type: 'radio-group',
                  name: 'timeline',
                  label: 'Timeline',
                  required: true,
                  options: [
                    { label: 'Standard', value: '0', cost: 'this', checked: true },
                    { label: 'Expedited', value: '1800', cost: 'this' }
                  ]
                },
                { type: 'number', name: 'expedite_days', label: 'Expedite Crew Days', value: 2, min: 1, showIf: 'timeline=1800', cost: 'this', mult: 250, required: true },
                { type: 'text', name: 'coupon_code', label: 'Coupon Code', placeholder: 'SAVE10', attrs: { 'data-coupon-input': '1' } }
              ]
            },
            {
              title: 'Contact Details',
              fields: [
                { type: 'text', name: 'client_name', label: 'Client Name', required: true, minlen: 3 },
                { type: 'text', name: 'client_email', label: 'Email', required: true, validate: 'email' },
                { type: 'textarea', name: 'notes', label: 'Project Notes', rows: 3 }
              ]
            }
          ]
        };
      }

      function setStatus(msg, ok) {
        var $s = $('#bf-status');
        $s.removeClass('ok error').addClass(ok ? 'ok' : 'error').text(msg);
      }

      function trimText(v) {
        return String(v == null ? '' : v).trim();
      }

      function toNumberOrString(v) {
        var txt = trimText(v);
        if (txt === '') {
          return '';
        }
        var n = Number(txt);
        return isNaN(n) ? txt : n;
      }

      function parseCoupons(raw) {
        var txt = trimText(raw);
        if (!txt) {
          return {};
        }
        try {
          var obj = JSON.parse(txt);
          return (obj && typeof obj === 'object') ? obj : {};
        } catch (e) {
          return null;
        }
      }

      function writeSettingsToUi() {
        $('#bf-form-id').val(state.id || '');
        $('#bf-form-title').val(state.title || '');
        $('#bf-currency').val(state.currencySymbol || '');
        $('#bf-email-button').val(state.emailButtonText || '');
        $('#bf-locale').val(state.locale || '');
        $('#bf-tax-rate').val(state.pricing && state.pricing.taxRate != null ? state.pricing.taxRate : '');
        $('#bf-discount-percent').val(state.pricing && state.pricing.discountPercent != null ? state.pricing.discountPercent : '');
        $('#bf-discount-fixed').val(state.pricing && state.pricing.discountFixed != null ? state.pricing.discountFixed : '');
        $('#bf-coupons').val(JSON.stringify((state.pricing && state.pricing.coupons) || {}, null, 2));
        $('#bf-wizard').prop('checked', !!state.wizard);
        $('#bf-debugger').prop('checked', !!state.ruleDebugger);
      }

      function readSettingsFromUi() {
        state.id = trimText($('#bf-form-id').val()) || ('pcc-custom-' + Date.now());
        state.summaryId = state.id + '-show';
        state.title = trimText($('#bf-form-title').val());
        state.currencySymbol = $('#bf-currency').val();
        state.emailButtonText = $('#bf-email-button').val();
        state.locale = $('#bf-locale').val();
        state.wizard = $('#bf-wizard').is(':checked');
        state.ruleDebugger = $('#bf-debugger').is(':checked');
        state.options = state.options || {};
        state.options.restoreDraftPrompt = false;
        state.pricing = state.pricing || {};
        state.pricing.taxRate = toNumberOrString($('#bf-tax-rate').val());
        state.pricing.discountPercent = toNumberOrString($('#bf-discount-percent').val());
        state.pricing.discountFixed = toNumberOrString($('#bf-discount-fixed').val());
        var coupons = parseCoupons($('#bf-coupons').val());
        if (coupons === null) {
          setStatus('Coupons JSON is invalid. Using empty object.', false);
          coupons = {};
        }
        state.pricing.coupons = coupons;
      }

      function ensureSteps() {
        if (!Array.isArray(state.steps) || !state.steps.length) {
          state.steps = [{ title: 'Step 1', fields: [] }];
        }
      }

      function currentStepIndex() {
        ensureSteps();
        var idx = parseInt($('#bf-step-select').val(), 10);
        if (isNaN(idx) || idx < 0 || idx >= state.steps.length) {
          idx = 0;
        }
        return idx;
      }

      function currentStep() {
        return state.steps[currentStepIndex()];
      }

      function renderStepSelect() {
        ensureSteps();
        var idx = currentStepIndex();
        var $sel = $('#bf-step-select');
        $sel.empty();
        for (var i = 0; i < state.steps.length; i++) {
          var title = state.steps[i].title || ('Step ' + (i + 1));
          $sel.append('<option value="' + i + '">' + $('<div>').text(title).html() + '</option>');
        }
        if (idx >= state.steps.length) {
          idx = state.steps.length - 1;
        }
        $sel.val(String(Math.max(0, idx)));
        $('#bf-step-title').val(currentStep().title || '');
      }

      function resetFieldEditor() {
        editIndex = -1;
        $('#bf-field-type').val('text');
        $('#bf-field-name').val('');
        $('#bf-field-label').val('');
        $('#bf-field-placeholder').val('');
        $('#bf-field-value').val('');
        $('#bf-field-validate').val('');
        $('#bf-field-cost').val('');
        $('#bf-field-mult').val('');
        $('#bf-field-show-if').val('');
        $('#bf-field-formula').val('');
        $('#bf-field-formula-precision').val('');
        $('#bf-field-rows').val('');
        $('#bf-field-min').val('');
        $('#bf-field-max').val('');
        $('#bf-field-step').val('');
        $('#bf-field-pattern').val('');
        $('#bf-field-required').prop('checked', false);
        $('#bf-field-readonly').prop('checked', false);
        $('#bf-field-options').val('');
        $('#bf-add-field').text('Add Field');
      }

      function fieldToEditor(f) {
        var field = f || {};
        $('#bf-field-type').val(field.type || 'text');
        $('#bf-field-name').val(field.name || '');
        $('#bf-field-label').val(field.label || field.title || '');
        $('#bf-field-placeholder').val(field.placeholder || '');
        $('#bf-field-value').val(field.value != null ? field.value : '');
        $('#bf-field-validate').val(field.validate || '');
        $('#bf-field-cost').val(field.cost != null ? field.cost : '');
        $('#bf-field-mult').val(field.mult != null ? field.mult : '');
        $('#bf-field-show-if').val(field.showIf || '');
        $('#bf-field-formula').val(field.formula || '');
        $('#bf-field-formula-precision').val(field.formulaPrecision != null ? field.formulaPrecision : '');
        $('#bf-field-rows').val(field.rows != null ? field.rows : '');
        $('#bf-field-min').val(field.min != null ? field.min : '');
        $('#bf-field-max').val(field.max != null ? field.max : '');
        $('#bf-field-step').val(field.step != null ? field.step : '');
        $('#bf-field-pattern').val(field.pattern || '');
        $('#bf-field-required').prop('checked', !!field.required);
        $('#bf-field-readonly').prop('checked', !!field.readonly);
        var lines = [];
        var opts = Array.isArray(field.options) ? field.options : [];
        for (var i = 0; i < opts.length; i++) {
          var o = opts[i] || {};
          var parts = [
            o.label != null ? o.label : '',
            o.value != null ? o.value : '',
            o.cost != null ? o.cost : '',
            o.title != null ? o.title : '',
            o.checked ? '1' : ''
          ];
          lines.push(parts.join('|'));
        }
        $('#bf-field-options').val(lines.join('\n'));
        $('#bf-add-field').text('Update Field');
      }

      function parseOptionsLines(raw) {
        var lines = String(raw || '').split(/\r?\n/);
        var out = [];
        for (var i = 0; i < lines.length; i++) {
          var line = trimText(lines[i]);
          if (!line) {
            continue;
          }
          var parts = line.split('|');
          var label = trimText(parts[0] || '');
          var value = trimText(parts[1] || '');
          var cost = trimText(parts[2] || '');
          var title = trimText(parts[3] || '');
          var checked = trimText(parts[4] || '').toLowerCase();
          var opt = {
            label: label || value,
            value: value || label
          };
          if (cost !== '') {
            opt.cost = toNumberOrString(cost);
          }
          if (title) {
            opt.title = title;
          }
          if (checked === '1' || checked === 'true' || checked === 'yes') {
            opt.checked = true;
            opt.selected = true;
          }
          out.push(opt);
        }
        return out;
      }

      function buildFieldFromEditor() {
        var type = $('#bf-field-type').val();
        var name = trimText($('#bf-field-name').val());
        var label = trimText($('#bf-field-label').val());
        if (type !== 'hidden' && !name) {
          setStatus('Field name is required.', false);
          return null;
        }
        if (type !== 'hidden' && !label) {
          setStatus('Field label/title is required.', false);
          return null;
        }
        var field = {
          type: type,
          name: name,
          label: label
        };
        var map = [
          ['placeholder', '#bf-field-placeholder'],
          ['value', '#bf-field-value'],
          ['validate', '#bf-field-validate'],
          ['showIf', '#bf-field-show-if'],
          ['formula', '#bf-field-formula'],
          ['pattern', '#bf-field-pattern']
        ];
        for (var i = 0; i < map.length; i++) {
          var v = trimText($(map[i][1]).val());
          if (v !== '') {
            field[map[i][0]] = v;
          }
        }
        var nmap = [
          ['formulaPrecision', '#bf-field-formula-precision'],
          ['rows', '#bf-field-rows'],
          ['cost', '#bf-field-cost'],
          ['mult', '#bf-field-mult'],
          ['min', '#bf-field-min'],
          ['max', '#bf-field-max'],
          ['step', '#bf-field-step']
        ];
        for (var j = 0; j < nmap.length; j++) {
          var raw = trimText($(nmap[j][1]).val());
          if (raw !== '') {
            field[nmap[j][0]] = toNumberOrString(raw);
          }
        }
        if ($('#bf-field-required').is(':checked')) {
          field.required = true;
        }
        if ($('#bf-field-readonly').is(':checked')) {
          field.readonly = true;
        }
        if (type === 'select' || type === 'radio-group' || type === 'checkbox-group') {
          field.options = parseOptionsLines($('#bf-field-options').val());
          if (!field.options.length) {
            setStatus('Options are required for selected field type.', false);
            return null;
          }
        }
        return field;
      }

      function renderFieldTable() {
        var step = currentStep();
        var fields = Array.isArray(step.fields) ? step.fields : [];
        var $tb = $('#bf-field-table-body');
        $tb.empty();
        if (!fields.length) {
          $tb.append('<tr><td colspan="6">No fields in this step.</td></tr>');
          return;
        }
        for (var i = 0; i < fields.length; i++) {
          var f = fields[i] || {};
          var ruleText = [];
          if (f.showIf) {
            ruleText.push('showIf: ' + f.showIf);
          }
          if (f.formula) {
            ruleText.push('formula: ' + f.formula);
          }
          $tb.append(
            '<tr>' +
              '<td>' + (i + 1) + '</td>' +
              '<td><code>' + $('<div>').text(f.type || '').html() + '</code></td>' +
              '<td><code>' + $('<div>').text(f.name || '').html() + '</code></td>' +
              '<td>' + $('<div>').text(f.label || f.title || '').html() + '</td>' +
              '<td>' + $('<div>').text(ruleText.join(' | ')).html() + '</td>' +
              '<td>' +
                '<button type="button" class="secondary bf-edit-field" data-idx="' + i + '">Edit</button> ' +
                '<button type="button" class="danger bf-del-field" data-idx="' + i + '">Delete</button>' +
              '</td>' +
            '</tr>'
          );
        }
      }

      function updateJsonAndCode() {
        $('#bf-json').val(JSON.stringify(state, null, 2));
        $('#bf-html').val($.pcc.schemaToHtml(state));
      }

      function renderPreview() {
        var validation = $.pcc.validateSchema(state);
        if (!validation.valid) {
          setStatus('Schema invalid: ' + validation.errors.join(' | '), false);
          return;
        }
        var rendered = $.pcc.renderSchema('#schema-preview', state, {
          skipRestore: true,
          autosave: false,
          restoreDraftPrompt: false
        });
        if (!rendered.ok) {
          setStatus('Render failed: ' + ((rendered.errors || []).join(' | ') || rendered.message || 'Unknown error'), false);
          return;
        }
        setStatus('Schema valid. Form rendered successfully.', true);
      }

      function copyText(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          return navigator.clipboard.writeText(text);
        }
        return new Promise(function (resolve, reject) {
          var $tmp = $('<textarea>').css({ position: 'fixed', left: '-9999px', top: '-9999px' }).val(text);
          $('body').append($tmp);
          $tmp[0].select();
          try {
            document.execCommand('copy');
            $tmp.remove();
            resolve();
          } catch (e) {
            $tmp.remove();
            reject(e);
          }
        });
      }

      function downloadJsonFile(filename, content) {
        var blob = new Blob([content], { type: 'application/json;charset=utf-8;' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      function applyJsonTextarea() {
        var txt = $('#bf-json').val();
        var parsed;
        try {
          parsed = JSON.parse(txt);
        } catch (e) {
          setStatus('Invalid JSON: ' + e.message, false);
          return;
        }
        var validation = $.pcc.validateSchema(parsed);
        if (!validation.valid) {
          setStatus('Schema invalid: ' + validation.errors.join(' | '), false);
          return;
        }
        state = parsed;
        ensureSteps();
        writeSettingsToUi();
        renderStepSelect();
        renderFieldTable();
        resetFieldEditor();
        updateJsonAndCode();
        renderPreview();
      }

      $('#bf-apply-settings').on('click', function () {
        readSettingsFromUi();
        renderStepSelect();
        updateJsonAndCode();
        renderPreview();
      });

      $('#bf-render-preview').on('click', function () {
        readSettingsFromUi();
        updateJsonAndCode();
        renderPreview();
      });

      $('#bf-add-step').on('click', function () {
        ensureSteps();
        state.steps.push({ title: 'Step ' + (state.steps.length + 1), fields: [] });
        renderStepSelect();
        $('#bf-step-select').val(String(state.steps.length - 1));
        $('#bf-step-title').val(state.steps[state.steps.length - 1].title);
        renderFieldTable();
        updateJsonAndCode();
        renderPreview();
      });

      $('#bf-remove-step').on('click', function () {
        ensureSteps();
        if (state.steps.length <= 1) {
          setStatus('At least one step is required.', false);
          return;
        }
        var idx = currentStepIndex();
        state.steps.splice(idx, 1);
        renderStepSelect();
        renderFieldTable();
        updateJsonAndCode();
        renderPreview();
      });

      $('#bf-rename-step').on('click', function () {
        var idx = currentStepIndex();
        state.steps[idx].title = trimText($('#bf-step-title').val()) || ('Step ' + (idx + 1));
        renderStepSelect();
        updateJsonAndCode();
        renderPreview();
      });

      $('#bf-step-select').on('change', function () {
        renderStepSelect();
        renderFieldTable();
        resetFieldEditor();
      });

      $('#bf-add-field').on('click', function () {
        var field = buildFieldFromEditor();
        if (!field) {
          return;
        }
        var idx = currentStepIndex();
        state.steps[idx].fields = Array.isArray(state.steps[idx].fields) ? state.steps[idx].fields : [];
        if (editIndex > -1) {
          state.steps[idx].fields[editIndex] = field;
        } else {
          state.steps[idx].fields.push(field);
        }
        resetFieldEditor();
        renderFieldTable();
        updateJsonAndCode();
        renderPreview();
      });

      $('#bf-clear-field').on('click', function () {
        resetFieldEditor();
      });

      $(document).on('click', '.bf-edit-field', function () {
        var idx = parseInt($(this).attr('data-idx'), 10);
        if (isNaN(idx)) {
          return;
        }
        var step = currentStep();
        var fields = Array.isArray(step.fields) ? step.fields : [];
        if (!fields[idx]) {
          return;
        }
        editIndex = idx;
        fieldToEditor(fields[idx]);
      });

      $(document).on('click', '.bf-del-field', function () {
        var idx = parseInt($(this).attr('data-idx'), 10);
        if (isNaN(idx)) {
          return;
        }
        var stepIdx = currentStepIndex();
        var fields = Array.isArray(state.steps[stepIdx].fields) ? state.steps[stepIdx].fields : [];
        if (!fields[idx]) {
          return;
        }
        fields.splice(idx, 1);
        resetFieldEditor();
        renderFieldTable();
        updateJsonAndCode();
        renderPreview();
      });

      $('#bf-copy-json').on('click', function () {
        copyText($('#bf-json').val()).then(function () {
          setStatus('JSON copied to clipboard.', true);
        }).catch(function () {
          setStatus('Could not copy JSON. Please copy manually.', false);
        });
      });

      $('#bf-download-json').on('click', function () {
        downloadJsonFile((state.id || 'pcc-form') + '.json', $('#bf-json').val());
        setStatus('JSON download started.', true);
      });

      $('#bf-apply-json').on('click', function () {
        applyJsonTextarea();
      });

      $('#bf-copy-html').on('click', function () {
        copyText($('#bf-html').val()).then(function () {
          setStatus('Generated HTML copied to clipboard.', true);
        }).catch(function () {
          setStatus('Could not copy HTML. Please copy manually.', false);
        });
      });

      writeSettingsToUi();
      renderStepSelect();
      renderFieldTable();
      resetFieldEditor();
      updateJsonAndCode();
      renderPreview();
    });
  </script>
</body>
</html>
