
var pcc_default_symbol = ' USD';
var pcc_default_button_text = 'E-mail this to me';
var pcc_version = '2.1.2';
var ajaxurl = '';
var quoteApiUrl = '';
var pcc_coupon_state = {};
var pcc_coupon_notice = {};
var pcc_draft_timers = {};
var pcc_wizard_state = {};
var pcc_form_options = {};
var pcc_form_history = {};
var pcc_form_history_idx = {};
var pcc_form_history_lock = {};
var pcc_adapter_registry = {};
var pcc_debug_state = {};
var pcc_defaults = {
locale: 'en-US',
currencySymbol: pcc_default_symbol,
emailButtonText: pcc_default_button_text,
currencyCode: '',
numberMinDigits: 2,
numberMaxDigits: 2,
decimalSeparator: '',
thousandSeparator: '',
inlineValidation: true,
validationSummary: true,
scrollToError: true,
focusFirstError: true,
autosave: true,
restoreDraftPrompt: true,
history: true,
historyLimit: 80,
historyShortcuts: true,
wizardKeyboard: true,
ruleDebugger: false,
debugMaxEntries: 120,
theme: {},
templates: {},
hooks: {},
adapters: {
select2: true,
datepicker: true,
slider: true,
mask: true
},
lang: {
validationTitle: 'Validation errors',
validationIntro: 'Please fix the following:',
saveButton: 'Save Quote',
loadButton: 'Load Last',
shareButton: 'Share',
printButton: 'Print',
pdfButton: 'PDF',
csvButton: 'CSV',
undoButton: 'Undo',
redoButton: 'Redo',
prevButton: 'Previous',
nextButton: 'Next Step',
reviewButton: 'Review Summary',
emailActionButton: 'Send Email',
sendNow: 'Open Draft',
emailPrompt: 'Enter the email address that should receive this estimate',
reviewReadyTitle: 'Estimate ready',
reviewReadyMessage: 'Your estimate is ready. Use the actions below to email, save, share, or export it.',
estimatedTotal: 'Estimated Total : ',
repeaterAdd: 'Add Item',
repeaterRemove: 'Remove',
debugPanelTitle: 'Rule Debugger',
debugFormulaCol: 'Formula Evaluation',
debugRuleCol: 'Condition Evaluation',
debugResultPass: 'PASS',
debugResultFail: 'FAIL',
debugNoData: 'No rule or formula evaluations yet.'
}
};

function pcc_infer_base_url() {
var origin = window.location.origin || ((window.location.protocol || 'http:') + '//' + (window.location.host || 'localhost'));
var pathname = String(window.location.pathname || '').replace(/\\/g, '/');
if (!pathname) {
return origin;
}
if (pathname === '/') {
return origin;
}
if (pathname.charAt(pathname.length - 1) === '/') {
return origin + pathname.replace(/\/+$/, '');
}
var lastSegment = pathname.split('/').pop() || '';
if (lastSegment.indexOf('.') === -1) {
return origin + pathname;
}
var lastSlash = pathname.lastIndexOf('/');
var basePath = lastSlash > 0 ? pathname.slice(0, lastSlash) : '';
return origin + basePath;
}

function pcc_get_runtime_base() {
var configured = (typeof wpcc_domain !== 'undefined') ? pcc_trim(wpcc_domain) : '';
if (configured) {
return configured.replace(/\/+$/, '');
}
var inferred = pcc_infer_base_url().replace(/\/+$/, '');
try {
window.wpcc_domain = inferred;
} catch (e) {}
return inferred;
}

function pcc_asset_url(relativePath) {
return pcc_get_runtime_base() + '/' + String(relativePath || '').replace(/^\/+/, '');
}

jQuery(document).ready(function () {
var runtimeBase = pcc_get_runtime_base();
ajaxurl = runtimeBase + '/send_email.php';
quoteApiUrl = runtimeBase + '/quote_api.php';

pcc_register_default_adapters();

pcc_boot_forms();
pcc_calc_forms();

jQuery(document).on('click', '.pcc-mail-sender', function () {
var fidx = pcc_trim(jQuery('.wpcc-hidden-fid').val());
if (!fidx) {
return;
}
var $form = jQuery('#' + fidx);
$form.addClass('pcc-show-validation');
var validation = pcc_validate_form($form, { mark: true, interactive: true });
var errors = validation.errors;
if (errors.length) {
pcc_alertx(pcc_missing_fields_markup($form, errors), pcc_lang($form, 'validationTitle', 'Validation errors'));
return;
}

var ymail = pcc_trim(jQuery('.pcc-email').val());

if (!wpcc_validateEmail(ymail)) {
pcc_alertx('The email address you provided seems incorrect. Please try again.', 'Error');
return;
}

var subject = pcc_build_mail_draft_subject($form);
var body = pcc_build_mail_draft_body($form);
var baseMailto = 'mailto:' + encodeURIComponent(ymail) + '?subject=' + encodeURIComponent(subject);
var fullMailto = baseMailto + '&body=' + encodeURIComponent(body);
var maxMailtoLength = 1800;

pcc_closex();

if (fullMailto.length <= maxMailtoLength) {
  pcc_open_mail_client(fullMailto);
  pcc_alertx('Your default email app should open with a draft addressed to <b>' + pcc_escape_html(ymail) + '</b>.', 'Mail draft ready');
  return;
}

pcc_copy_text(body).then(function () {
  pcc_open_mail_client(baseMailto);
  pcc_alertx('The estimate was too long for a full <code>mailto:</code> draft. Your mail app was opened with the recipient and subject, and the estimate text was copied to your clipboard. Paste it into the email body.', 'Mail draft ready');
}).catch(function () {
  pcc_open_mail_client(baseMailto);
  pcc_alertx('The estimate was too long for a full <code>mailto:</code> draft. Your mail app was opened with the recipient and subject. Copy the estimate from the summary and paste it into the email body manually.', 'Mail draft ready');
});
});

jQuery(document).on('click', '.pcc-mail-send', function () {
var $form = pcc_summary_to_form(jQuery(this));
var fidx = $form.attr('id') || '';
if (!fidx) {
return;
}
$form.addClass('pcc-show-validation');
var validation = pcc_validate_form($form, { mark: true, interactive: true });
var errors = validation.errors;
if (errors.length) {
pcc_alertx(pcc_missing_fields_markup($form, errors), pcc_lang($form, 'validationTitle', 'Validation errors'));
return;
}

var defaultEmail = pcc_guess_email_recipient($form);
var xhtml = '';
xhtml += '<input type="hidden" class="wpcc-hidden-fid" value="' + pcc_escape_html(fidx) + '" name="wpcc-hidden-fid" />';
xhtml += '<p style="margin:0 0 10px;color:#43506a;line-height:1.5;">This opens your default email app on this computer. Nothing is sent through the server.</p>';
xhtml += '<div class="pcc-mail-dialog-row">';
xhtml += '<input type="text" class="pcc-email" name="pcc-email" value="' + pcc_escape_html(defaultEmail) + '" placeholder="you@example.com" />';
xhtml += pcc_action_button_html($form, 'pcc-mail-sender', pcc_lang($form, 'sendNow', 'Send Now'), 'mail', 'is-primary');
xhtml += '</div>';
pcc_alertx(xhtml, pcc_lang($form, 'emailPrompt', 'Please enter your email'));
});

jQuery(document).on('click', '.pcc-coupon-apply', function () {
var $form = jQuery(this).closest('.pcc-form');
pcc_apply_coupon_for_form($form);
});

jQuery(document).on('click', '.pcc-clear-coupon', function () {
var $form = jQuery(this).closest('.pcc-form');
var formid = $form.attr('id') || '';
if (!formid) {
return;
}
delete pcc_coupon_state[formid];
pcc_set_coupon_notice($form, 'info', pcc_lang($form, 'couponCleared', 'Coupon cleared.'));
pcc_handle_form_change($form);
});

jQuery(document).on('input', '.pcc-form [data-coupon-input]', function () {
var $form = jQuery(this).closest('.pcc-form');
var formid = $form.attr('id') || '';
if (!formid) {
return;
}
delete pcc_coupon_state[formid];
pcc_set_coupon_notice($form, 'info', pcc_lang($form, 'couponChanged', 'Coupon changed. Click Apply to use it.'));
pcc_handle_form_change($form);
});

jQuery(document).on('click', '.pcc-save-quote', function () {
var $form = pcc_summary_to_form(jQuery(this));
pcc_save_quote($form);
});

jQuery(document).on('click', '.pcc-load-last-quote', function () {
var $form = pcc_summary_to_form(jQuery(this));
pcc_load_last_quote($form);
});

jQuery(document).on('click', '.pcc-share-link', function () {
var $form = pcc_summary_to_form(jQuery(this));
pcc_share_quote_state($form);
});

jQuery(document).on('click', '.pcc-export-print', function () {
var $form = pcc_summary_to_form(jQuery(this));
pcc_export_print($form);
});

jQuery(document).on('click', '.pcc-export-csv', function () {
var $form = pcc_summary_to_form(jQuery(this));
pcc_export_csv($form);
});

jQuery(document).on('click', '.pcc-export-pdf', function () {
var $form = pcc_summary_to_form(jQuery(this));
pcc_export_pdf($form);
});

jQuery(document).on('click', '.pcc-wizard-next', function () {
var $form = jQuery(this).closest('.pcc-form');
var formid = $form.attr('id') || '';
if (!formid) {
return;
}
var idx = pcc_get_wizard_step($form);
var $step = pcc_get_wizard_step_element($form, idx);
var validation = pcc_validate_form($form, { mark: true, interactive: true, scope: $step });
var errors = validation.errors;
if (errors.length) {
$form.addClass('pcc-show-validation');
pcc_alertx(pcc_missing_fields_markup($form, errors), pcc_lang($form, 'validationTitle', 'Validation errors'));
return;
}
if (idx < pcc_get_wizard_steps($form).length - 1) {
pcc_set_wizard_step($form, idx + 1);
pcc_autosave_form($form);
} else {
var $preview = jQuery('#' + formid + '-show');
if ($preview.length) {
window.scrollTo({ top: $preview.offset().top - 20, behavior: 'smooth' });
pcc_mark_review_ready($form);
}
pcc_alertx(
  pcc_review_ready_markup($form),
  pcc_lang($form, 'reviewReadyTitle', 'Estimate ready')
);
}
});

jQuery(document).on('click', '.pcc-wizard-prev', function () {
var $form = jQuery(this).closest('.pcc-form');
var idx = pcc_get_wizard_step($form);
if (idx > 0) {
pcc_set_wizard_step($form, idx - 1);
pcc_autosave_form($form);
}
});

jQuery(document).on('input change', '.pcc-form input, .pcc-form select, .pcc-form textarea', function () {
var $form = jQuery(this).closest('.pcc-form');
pcc_handle_form_change($form);
});

jQuery(document).on('keydown', '.pcc-form', function (evt) {
var $form = jQuery(this);
if (!pcc_get_form_options($form).historyShortcuts) {
return;
}
var ctrl = evt.ctrlKey || evt.metaKey;
if (!ctrl) {
return;
}
var key = String(evt.key || '').toLowerCase();
if (key === 'z' && !evt.shiftKey) {
evt.preventDefault();
pcc_undo_state($form);
return;
}
if (key === 'y' || (key === 'z' && evt.shiftKey)) {
evt.preventDefault();
pcc_redo_state($form);
}
});

jQuery(document).on('click', '.pcc-undo-state', function () {
var $form = pcc_summary_to_form(jQuery(this));
pcc_undo_state($form);
});

jQuery(document).on('click', '.pcc-redo-state', function () {
var $form = pcc_summary_to_form(jQuery(this));
pcc_redo_state($form);
});

jQuery(document).on('click', '.pcc-repeater-add', function () {
var $repeater = jQuery(this).closest('[data-pcc-repeater]');
pcc_repeater_add($repeater);
});

jQuery(document).on('click', '.pcc-repeater-remove', function () {
var $item = jQuery(this).closest('[data-pcc-repeat-item]');
var $repeater = $item.closest('[data-pcc-repeater]');
pcc_repeater_remove($repeater, $item);
});

jQuery(document).on('keydown', '.pcc-wizard-prev, .pcc-wizard-next', function (evt) {
var $form = jQuery(this).closest('.pcc-form');
if (!pcc_get_form_options($form).wizardKeyboard) {
return;
}
if (evt.key === 'ArrowLeft') {
evt.preventDefault();
var idx = pcc_get_wizard_step($form);
if (idx > 0) {
pcc_set_wizard_step($form, idx - 1);
}
} else if (evt.key === 'ArrowRight') {
evt.preventDefault();
var idx2 = pcc_get_wizard_step($form);
if (idx2 < pcc_get_wizard_steps($form).length - 1) {
pcc_set_wizard_step($form, idx2 + 1);
}
}
});

jQuery(document).on('click', '.pcc-wizard-steps li', function () {
var $li = jQuery(this);
var idx = parseInt($li.attr('data-step-index'), 10);
if (isNaN(idx)) {
return;
}
var $form = $li.closest('.pcc-form');
pcc_set_wizard_step($form, idx);
});

jQuery(document).on('keydown', '.pcc-wizard-steps li', function (evt) {
if (evt.key !== 'Enter' && evt.key !== ' ') {
return;
}
evt.preventDefault();
var $li = jQuery(this);
var idx = parseInt($li.attr('data-step-index'), 10);
if (isNaN(idx)) {
return;
}
var $form = $li.closest('.pcc-form');
pcc_set_wizard_step($form, idx);
});
});

function pcc_boot_forms() {
jQuery('.pcc-form').each(function () {
var $form = jQuery(this);
pcc_init_form_options($form, {});
pcc_apply_theme($form);
pcc_init_repeaters($form);
pcc_init_wizard($form);
pcc_bind_adapters($form);
pcc_restore_initial_state($form);
pcc_push_history($form, pcc_collect_form_state($form), true);
});
}

function pcc_handle_form_change($form) {
if (!$form || !$form.length) {
return;
}
pcc_apply_formulas($form);
pcc_apply_conditional_logic($form);
if (pcc_get_form_options($form).autosave) {
pcc_autosave_form($form);
}
pcc_calc_forms();
pcc_push_history($form, null, false);
pcc_trigger_event($form, 'stateChange', {
state: pcc_collect_form_state($form)
});
}

function pcc_summary_to_form($el) {
var formid = pcc_trim($el.attr('data-pcc-form-id'));
if (!formid) {
var previewId = pcc_trim($el.attr('data-pcc-preview-id'));
if (previewId) {
formid = previewId.replace(/-show$/, '');
}
}
if (!formid) {
var closestPreviewId = ($el.closest('.wpcc-preview').attr('id') || '');
formid = closestPreviewId.replace(/-show$/, '');
}
return jQuery('#' + formid);
}

function pcc_alertx(contentHtml, heading) {
pcc_closex();
if (heading == null || heading === '') {
heading = 'Message from server';
}
var closeSrc = pcc_asset_url('lib-pcc/close.png');
var data = '<div class="dbg"></div><div class="dbug" role="dialog" aria-modal="true"><div class="dbugbox"><span class="dbugh">' + heading + '</span><img class="dbugx" onclick="pcc_closex()" src="' + closeSrc + '" alt="Close"><span class="dbugm">' + contentHtml + '</span></div></div>';
jQuery('body').append(data);
jQuery('.dbug').fadeTo('slow', '1');
}

function pcc_closex() {
jQuery('.dbg').remove();
jQuery('.dbug').remove();
}

function pcc_trim(value) {
if (value == null) {
return '';
}
return String(value).replace(/^\s+|\s+$/g, '');
}

function pcc_parse_json(text, fallback) {
if (text == null || text === '') {
return fallback;
}
try {
return JSON.parse(text);
} catch (e) {
return fallback;
}
}

function pcc_is_truthy(value) {
var txt = pcc_trim(String(value || '')).toLowerCase();
return txt === '1' || txt === 'true' || txt === 'yes' || txt === 'on';
}

function pcc_ensure_form_id($form) {
if (!$form || !$form.length) {
return '';
}
var formid = $form.attr('id') || '';
if (formid) {
return formid;
}
formid = 'pcc-form-' + String(Date.now()) + '-' + String(Math.floor(Math.random() * 100000));
$form.attr('id', formid);
return formid;
}

function pcc_init_form_options($form, runtimeOptions) {
if (!$form || !$form.length) {
return;
}
var formid = pcc_ensure_form_id($form);
if (!formid) {
return;
}
var baseOptions = pcc_parse_json($form.attr('data-pcc-options'), {});
var langPack = pcc_parse_json($form.attr('data-lang-pack') || $form.attr('data-lang'), {});
var themePack = pcc_parse_json($form.attr('data-theme'), {});
var options = jQuery.extend(true, {}, pcc_defaults, baseOptions || {}, runtimeOptions || {});

if ($form.attr('data-curr') !== undefined) {
options.currencySymbol = $form.attr('data-curr');
}
if ($form.attr('data-emtext') !== undefined) {
options.emailButtonText = $form.attr('data-emtext');
}
if ($form.attr('data-locale') !== undefined) {
options.locale = $form.attr('data-locale');
}
if ($form.attr('data-currency-code') !== undefined) {
options.currencyCode = $form.attr('data-currency-code');
}
if ($form.attr('data-inline-validation') !== undefined) {
options.inlineValidation = pcc_is_truthy($form.attr('data-inline-validation'));
}
if ($form.attr('data-validation-summary') !== undefined) {
options.validationSummary = pcc_is_truthy($form.attr('data-validation-summary'));
}

options.lang = jQuery.extend(true, {}, pcc_defaults.lang, (baseOptions || {}).lang || {}, (runtimeOptions || {}).lang || {}, langPack || {});
options.theme = jQuery.extend(true, {}, pcc_defaults.theme, (baseOptions || {}).theme || {}, (runtimeOptions || {}).theme || {}, themePack || {});
options.templates = jQuery.extend(true, {}, pcc_defaults.templates, (baseOptions || {}).templates || {}, (runtimeOptions || {}).templates || {});
options.hooks = jQuery.extend(true, {}, pcc_defaults.hooks, (baseOptions || {}).hooks || {}, (runtimeOptions || {}).hooks || {});
options.adapters = jQuery.extend(true, {}, pcc_defaults.adapters, (baseOptions || {}).adapters || {}, (runtimeOptions || {}).adapters || {});
pcc_form_options[formid] = options;
}

function pcc_get_form_options(formOrId) {
var formid = '';
if (typeof formOrId === 'string') {
formid = formOrId;
} else if (formOrId && formOrId.jquery) {
formid = formOrId.attr('id') || '';
}
if (!formid) {
return pcc_defaults;
}
if (!pcc_form_options[formid]) {
var $f = jQuery('#' + formid);
if ($f.length) {
pcc_init_form_options($f, {});
}
}
return pcc_form_options[formid] || pcc_defaults;
}

function pcc_lang($form, key, fallback) {
var options = pcc_get_form_options($form);
if (options.lang && options.lang[key] !== undefined && options.lang[key] !== null && options.lang[key] !== '') {
return options.lang[key];
}
return fallback;
}

function pcc_lang_tpl($form, key, fallback, map) {
var text = pcc_lang($form, key, fallback);
var k;
for (k in map) {
if (map.hasOwnProperty(k)) {
text = String(text).replace(new RegExp('\\{' + k + '\\}', 'g'), String(map[k]));
}
}
return text;
}

function pcc_trigger_event($form, eventName, payload) {
if (!$form || !$form.length) {
return;
}
var data = payload || {};
$form.trigger('pcc:' + eventName, [data]);
var options = pcc_get_form_options($form);
if (options.hooks && typeof options.hooks[eventName] === 'function') {
try {
options.hooks[eventName].call($form[0], data);
} catch (e) {}
}
}

function pcc_get_email_button_label($form) {
return pcc_lang($form, 'emailActionButton', 'Send Email');
}

function pcc_action_icon_url(iconName) {
return pcc_asset_url('assets/icons/' + iconName + '.svg');
}

function pcc_icon_span(iconName, extraClass) {
var iconUrl = pcc_action_icon_url(iconName);
var classes = ['pcc-action-icon'];
if (extraClass) {
classes.push(extraClass);
}
return '<span class="' + pcc_escape_html(classes.join(' ')) + '" aria-hidden="true" style="-webkit-mask-image:url(\'' + pcc_escape_html(iconUrl) + '\');mask-image:url(\'' + pcc_escape_html(iconUrl) + '\');"></span>';
}

function pcc_button_content_html(label, iconName, iconAtEnd, extraIconClass) {
var iconHtml = pcc_icon_span(iconName, extraIconClass || '');
var labelHtml = '<span>' + pcc_escape_html(label) + '</span>';
return iconAtEnd ? (labelHtml + iconHtml) : (iconHtml + labelHtml);
}

function pcc_action_button_html($form, className, label, iconName, toneClass) {
var formid = ($form && $form.length) ? ($form.attr('id') || '') : '';
var classes = ['pcc-action-button'];
if (className) {
classes.push(className);
}
if (toneClass) {
classes.push(toneClass);
}
return '<button type="button" class="' + pcc_escape_html(classes.join(' ')) + '"' + (formid ? ' data-pcc-form-id="' + pcc_escape_html(formid) + '"' : '') + '>' + pcc_button_content_html(label, iconName, false, '') + '</button>';
}

function pcc_inline_button_html(label, iconName, className, toneClass, iconAtEnd) {
var classes = ['pcc-inline-button'];
if (className) {
classes.push(className);
}
if (toneClass) {
classes.push(toneClass);
}
return '<button type="button" class="' + pcc_escape_html(classes.join(' ')) + '">' + pcc_button_content_html(label, iconName, !!iconAtEnd, 'pcc-inline-icon') + '</button>';
}

function pcc_primary_actions_markup($form) {
var html = '<div class="pcc-actions pcc-actions-primary">';
html += pcc_action_button_html($form, 'pcc-mail-send', pcc_get_email_button_label($form), 'mail', 'is-primary');
html += pcc_action_button_html($form, 'pcc-save-quote', pcc_lang($form, 'saveButton', 'Save Quote'), 'save', 'is-primary');
html += pcc_action_button_html($form, 'pcc-share-link', pcc_lang($form, 'shareButton', 'Share'), 'share', 'is-secondary');
html += pcc_action_button_html($form, 'pcc-export-print', pcc_lang($form, 'printButton', 'Print'), 'print', 'is-secondary');
html += pcc_action_button_html($form, 'pcc-export-pdf', pcc_lang($form, 'pdfButton', 'PDF'), 'pdf', 'is-secondary');
html += pcc_action_button_html($form, 'pcc-export-csv', pcc_lang($form, 'csvButton', 'CSV'), 'csv', 'is-secondary');
html += '</div>';
return html;
}

function pcc_history_actions_markup($form) {
if (!$form || !$form.length || !pcc_get_form_options($form).history) {
return '';
}
var html = '<div class="pcc-actions pcc-actions-history">';
html += pcc_action_button_html($form, 'pcc-load-last-quote', pcc_lang($form, 'loadButton', 'Load Last'), 'load', 'is-ghost');
html += pcc_action_button_html($form, 'pcc-undo-state', pcc_lang($form, 'undoButton', 'Undo'), 'undo', 'is-ghost');
html += pcc_action_button_html($form, 'pcc-redo-state', pcc_lang($form, 'redoButton', 'Redo'), 'redo', 'is-ghost');
html += '</div>';
return html;
}

function pcc_review_ready_markup($form) {
var html = '<div class="pcc-review-modal">';
html += '<p class="pcc-review-copy">' + pcc_escape_html(pcc_lang($form, 'reviewReadyMessage', 'Your estimate is ready. Use the actions below to email, save, share, or export it.')) + '</p>';
html += pcc_primary_actions_markup($form);
html += '</div>';
return html;
}

function pcc_mark_review_ready($form) {
if (!$form || !$form.length) {
return;
}
var formid = $form.attr('id') || '';
if (!formid) {
return;
}
var $preview = jQuery('#' + formid + '-show');
if (!$preview.length) {
return;
}
var activeTimer = $preview.data('pccReviewReadyTimer');
if (activeTimer) {
clearTimeout(activeTimer);
}
$preview.attr('tabindex', '-1').addClass('pcc-review-ready');
try {
$preview[0].focus({ preventScroll: true });
} catch (e) {
$preview.trigger('focus');
}
var timer = window.setTimeout(function () {
$preview.removeClass('pcc-review-ready');
}, 2400);
$preview.data('pccReviewReadyTimer', timer);
}

function pcc_debug_enabled($form) {
if (!$form || !$form.length) {
return false;
}
if (pcc_is_truthy($form.attr('data-rule-debugger'))) {
return true;
}
return !!pcc_get_form_options($form).ruleDebugger;
}

function pcc_debug_get_state($form) {
var formid = ($form && $form.length) ? ($form.attr('id') || '') : '';
if (!formid) {
return null;
}
if (!pcc_debug_state[formid]) {
pcc_debug_state[formid] = {
formulas: [],
rules: [],
updatedAt: 0
};
}
return pcc_debug_state[formid];
}

function pcc_debug_reset($form) {
var state = pcc_debug_get_state($form);
if (!state) {
return;
}
state.formulas = [];
state.rules = [];
state.updatedAt = Date.now();
}

function pcc_debug_log_formula($form, payload) {
if (!pcc_debug_enabled($form)) {
return;
}
var state = pcc_debug_get_state($form);
if (!state) {
return;
}
state.formulas.push(payload || {});
var maxEntries = parseInt(pcc_get_form_options($form).debugMaxEntries, 10);
if (isNaN(maxEntries) || maxEntries < 10) {
maxEntries = 120;
}
if (state.formulas.length > maxEntries) {
state.formulas.shift();
}
}

function pcc_debug_log_rule($form, payload) {
if (!pcc_debug_enabled($form)) {
return;
}
var state = pcc_debug_get_state($form);
if (!state) {
return;
}
state.rules.push(payload || {});
var maxEntries = parseInt(pcc_get_form_options($form).debugMaxEntries, 10);
if (isNaN(maxEntries) || maxEntries < 10) {
maxEntries = 120;
}
if (state.rules.length > maxEntries) {
state.rules.shift();
}
}

function pcc_debug_render($form) {
if (!$form || !$form.length) {
return;
}
var formid = $form.attr('id') || '';
if (!formid) {
return;
}
var $existing = $form.find('.pcc-debug-panel').first();
if (!pcc_debug_enabled($form)) {
if ($existing.length) {
$existing.remove();
}
return;
}
var state = pcc_debug_get_state($form);
if (!state) {
return;
}
var panelTitle = pcc_lang($form, 'debugPanelTitle', 'Rule Debugger');
var formulaHeading = pcc_lang($form, 'debugFormulaCol', 'Formula Evaluation');
var ruleHeading = pcc_lang($form, 'debugRuleCol', 'Condition Evaluation');
var noDataText = pcc_lang($form, 'debugNoData', 'No rule or formula evaluations yet.');
var passText = pcc_lang($form, 'debugResultPass', 'PASS');
var failText = pcc_lang($form, 'debugResultFail', 'FAIL');
var html = '<div class="pcc-debug-panel" data-pcc-form="' + pcc_escape_html(formid) + '">';
html += '<h4>' + pcc_escape_html(panelTitle) + '</h4>';
if (!state.formulas.length && !state.rules.length) {
html += '<p class="pcc-debug-empty">' + pcc_escape_html(noDataText) + '</p>';
} else {
html += '<div class="pcc-debug-grid">';
html += '<div class="pcc-debug-col"><h5>' + pcc_escape_html(formulaHeading) + '</h5><ul>';
for (var i = 0; i < state.formulas.length; i++) {
var fx = state.formulas[i] || {};
html += '<li><code>' + pcc_escape_html(fx.field || '-') + '</code> = <code>' + pcc_escape_html(fx.expanded || fx.formula || '') + '</code> -> <strong>' + pcc_escape_html(String(fx.result)) + '</strong></li>';
}
if (!state.formulas.length) {
html += '<li class="pcc-debug-empty">' + pcc_escape_html(noDataText) + '</li>';
}
html += '</ul></div>';
html += '<div class="pcc-debug-col"><h5>' + pcc_escape_html(ruleHeading) + '</h5><ul>';
for (var j = 0; j < state.rules.length; j++) {
var rx = state.rules[j] || {};
var okTxt = rx.result ? passText : failText;
html += '<li><code>' + pcc_escape_html(rx.rule || '-') + '</code> -> <strong class="' + (rx.result ? 'ok' : 'fail') + '">' + pcc_escape_html(okTxt) + '</strong></li>';
}
if (!state.rules.length) {
html += '<li class="pcc-debug-empty">' + pcc_escape_html(noDataText) + '</li>';
}
html += '</ul></div>';
html += '</div>';
}
html += '</div>';
if ($existing.length) {
$existing.replaceWith(html);
} else {
$form.append(html);
}
}

function pcc_apply_theme($form) {
if (!$form || !$form.length) {
return;
}
var formid = $form.attr('id') || '';
if (!formid) {
return;
}
var options = pcc_get_form_options($form);
var theme = options.theme || {};
var $preview = jQuery('#' + formid + '-show');
var k;
for (k in theme) {
if (!theme.hasOwnProperty(k)) {
continue;
}
var cssVar = k.indexOf('--') === 0 ? k : '--pcc-' + k;
$form[0].style.setProperty(cssVar, String(theme[k]));
if ($preview.length) {
$preview[0].style.setProperty(cssVar, String(theme[k]));
}
}
}

function pcc_validate_form($form, cfg) {
if (!$form || !$form.length) {
return { valid: true, errors: [] };
}
var config = jQuery.extend({
mark: true,
interactive: false,
scope: null
}, cfg || {});
var formid = $form.attr('id') || '';
var errors = pcc_validate_required_fields(formid, config.mark, config.scope, config);
if (errors.length && config.interactive) {
pcc_trigger_event($form, 'validationFail', { errors: errors });
}
return { valid: errors.length === 0, errors: errors };
}

function pcc_history_hash(state) {
try {
return JSON.stringify(state || {});
} catch (e) {
return '';
}
}

function pcc_push_history($form, explicitState, force) {
if (!$form || !$form.length) {
return;
}
var formid = $form.attr('id') || '';
if (!formid) {
return;
}
var options = pcc_get_form_options($form);
if (!options.history || pcc_form_history_lock[formid]) {
return;
}
if (!pcc_form_history[formid]) {
pcc_form_history[formid] = [];
pcc_form_history_idx[formid] = -1;
}
var state = explicitState || pcc_collect_form_state($form);
var hash = pcc_history_hash(state);
var currentIdx = pcc_form_history_idx[formid];
var currentHash = currentIdx >= 0 ? pcc_history_hash(pcc_form_history[formid][currentIdx]) : '';
if (!force && hash === currentHash) {
return;
}
if (currentIdx < pcc_form_history[formid].length - 1) {
pcc_form_history[formid] = pcc_form_history[formid].slice(0, currentIdx + 1);
}
pcc_form_history[formid].push(JSON.parse(JSON.stringify(state)));
var limit = Math.max(5, parseInt(options.historyLimit, 10) || 80);
if (pcc_form_history[formid].length > limit) {
pcc_form_history[formid].shift();
}
pcc_form_history_idx[formid] = pcc_form_history[formid].length - 1;
}

function pcc_undo_state($form) {
if (!$form || !$form.length) {
return;
}
var formid = $form.attr('id') || '';
if (!formid || !pcc_form_history[formid]) {
return;
}
var idx = pcc_form_history_idx[formid];
if (idx <= 0) {
return;
}
pcc_form_history_idx[formid] = idx - 1;
pcc_form_history_lock[formid] = true;
pcc_apply_form_state($form, JSON.parse(JSON.stringify(pcc_form_history[formid][idx - 1])));
pcc_form_history_lock[formid] = false;
}

function pcc_redo_state($form) {
if (!$form || !$form.length) {
return;
}
var formid = $form.attr('id') || '';
if (!formid || !pcc_form_history[formid]) {
return;
}
var idx = pcc_form_history_idx[formid];
if (idx >= pcc_form_history[formid].length - 1) {
return;
}
pcc_form_history_idx[formid] = idx + 1;
pcc_form_history_lock[formid] = true;
pcc_apply_form_state($form, JSON.parse(JSON.stringify(pcc_form_history[formid][idx + 1])));
pcc_form_history_lock[formid] = false;
}

function pcc_register_adapter(name, binder) {
if (!name || typeof binder !== 'function') {
return;
}
pcc_adapter_registry[name] = binder;
}

function pcc_bind_adapters($form) {
var options = pcc_get_form_options($form);
var adapters = options.adapters || {};
jQuery.each(pcc_adapter_registry, function (name, binder) {
if (adapters[name] === false) {
return;
}
binder($form, function () {
pcc_handle_form_change($form);
});
});
}

function pcc_register_default_adapters() {
if (!jQuery.isEmptyObject(pcc_adapter_registry)) {
return;
}
pcc_register_adapter('select2', function ($form, onChange) {
$form.find('select').off('select2:select.pccad select2:unselect.pccad').on('select2:select.pccad select2:unselect.pccad', onChange);
});
pcc_register_adapter('datepicker', function ($form, onChange) {
$form.find('input, select, textarea').off('changeDate.pccad').on('changeDate.pccad', onChange);
});
pcc_register_adapter('slider', function ($form, onChange) {
$form.find('[data-slider], .ui-slider').off('slidechange.pccad slide.pccad').on('slidechange.pccad slide.pccad', onChange);
});
pcc_register_adapter('mask', function ($form, onChange) {
$form.find('input').off('complete.pccad').on('complete.pccad', onChange);
});
}

function pcc_apply_formulas($form) {
if (!$form || !$form.length) {
return;
}
$form.find('[data-formula]:not(:disabled)').each(function () {
var $field = jQuery(this);
var formula = pcc_trim($field.attr('data-formula'));
if (!formula) {
return;
}
var detail = pcc_eval_formula_detail($form, formula);
var val = detail.result;
if (isNaN(val)) {
return;
}
var precision = parseInt($field.attr('data-formula-precision'), 10);
if (isNaN(precision)) {
precision = 2;
}
if ($field.attr('data-formula-output') === 'int') {
$field.val(String(Math.round(pcc_to_number(val))));
} else {
$field.val(Number(val).toFixed(Math.max(0, precision)));
}
pcc_debug_log_formula($form, {
field: $field.attr('name') || $field.attr('data-title') || 'formula-field',
formula: formula,
expanded: detail.expanded,
result: val,
error: detail.error || ''
});
});
}

function pcc_eval_formula($form, expr) {
return pcc_eval_formula_detail($form, expr).result;
}

function pcc_eval_formula_detail($form, expr) {
var source = String(expr || '');
source = source.replace(/\{([^}]+)\}/g, function (m, fieldName) {
return String(pcc_get_field_numeric($form, pcc_trim(fieldName)));
});
source = source.replace(/\b(min|max|abs|round|ceil|floor|pow)\b/gi, function (m) {
return 'Math.' + m.toLowerCase();
});
if (/[^0-9+\-*/%().,\sA-Za-z_]/.test(source)) {
return { result: 0, expanded: source, error: 'invalid-characters' };
}
try {
var fn = new Function('Math', 'return (' + source + ');');
return { result: pcc_to_number(fn(Math)), expanded: source, error: '' };
} catch (e) {
return { result: 0, expanded: source, error: String(e && e.message ? e.message : e) };
}
}

function pcc_get_field_numeric($form, name) {
var values = pcc_get_field_values($form, name);
var sum = 0;
for (var i = 0; i < values.length; i++) {
sum += pcc_to_number(values[i]);
}
return sum;
}

function pcc_init_repeaters($form) {
if (!$form || !$form.length) {
return;
}
$form.find('[data-pcc-repeater]').each(function () {
var $rep = jQuery(this);
if ($rep.attr('data-pcc-repeater-ready') === '1') {
return;
}
$rep.attr('data-pcc-repeater-ready', '1');
if ($rep.find('[data-pcc-repeat-item]').length === 0) {
return;
}
$rep.find('[data-pcc-repeat-item]').each(function () {
pcc_prepare_repeater_item(jQuery(this), $form);
});
if ($rep.find('.pcc-repeater-add').length === 0 && $rep.attr('data-pcc-repeater-controls') !== 'manual') {
$rep.append(pcc_inline_button_html(pcc_lang($form, 'repeaterAdd', 'Add Item'), 'add', 'pcc-repeater-add pcc-repeater-button', 'is-soft', false));
}
pcc_repeater_sync($rep, $form);
});
}

function pcc_prepare_repeater_item($item, $form) {
$item.find('input[name], select[name], textarea[name]').each(function () {
var $f = jQuery(this);
if (!$f.attr('data-pcc-base-name')) {
$f.attr('data-pcc-base-name', $f.attr('name'));
}
});
if ($item.find('.pcc-repeater-remove').length === 0 && $item.attr('data-pcc-repeat-remove') !== 'manual') {
$item.append(pcc_inline_button_html(pcc_lang($form, 'repeaterRemove', 'Remove'), 'remove', 'pcc-repeater-remove pcc-repeater-button', 'is-soft', false));
}
}

function pcc_repeater_sync($rep, $form) {
var minItems = parseInt($rep.attr('data-min-items'), 10);
var maxItems = parseInt($rep.attr('data-max-items'), 10);
if (isNaN(minItems)) {
minItems = 1;
}
var $items = $rep.find('[data-pcc-repeat-item]');
$items.each(function (idx) {
var $item = jQuery(this);
$item.attr('data-pcc-repeat-index', String(idx));
$item.find('input[name], select[name], textarea[name]').each(function () {
var $f = jQuery(this);
var base = $f.attr('data-pcc-base-name') || $f.attr('name');
if (base.indexOf('__index__') > -1) {
$f.attr('name', base.replace(/__index__/g, String(idx)));
}
});
});
$rep.find('.pcc-repeater-remove').prop('disabled', $items.length <= minItems);
if (!isNaN(maxItems)) {
$rep.find('.pcc-repeater-add').prop('disabled', $items.length >= maxItems);
}
}

function pcc_repeater_add($rep, silent) {
if (!$rep || !$rep.length) {
return;
}
var $form = $rep.closest('.pcc-form');
var maxItems = parseInt($rep.attr('data-max-items'), 10);
var $items = $rep.find('[data-pcc-repeat-item]');
if (!isNaN(maxItems) && $items.length >= maxItems) {
return;
}
var $template = $rep.find('[data-pcc-repeat-template]').first();
if (!$template.length) {
$template = $items.last();
}
if (!$template.length) {
return;
}
var $newItem = $template.clone(false, false);
$newItem.removeAttr('data-pcc-repeat-template');
$newItem.find('.pcc-field-error').remove();
$newItem.find('input, textarea').each(function () {
var $f = jQuery(this);
if ($f.is(':checkbox, :radio')) {
$f.prop('checked', false);
} else {
$f.val('');
}
});
$newItem.find('select').each(function () {
jQuery(this).prop('selectedIndex', 0);
});
$newItem.insertAfter($items.last());
pcc_prepare_repeater_item($newItem, $form);
pcc_repeater_sync($rep, $form);
pcc_bind_adapters($form);
if (!silent) {
pcc_handle_form_change($form);
}
}

function pcc_repeater_remove($rep, $item) {
if (!$rep || !$rep.length || !$item || !$item.length) {
return;
}
var minItems = parseInt($rep.attr('data-min-items'), 10);
if (isNaN(minItems)) {
minItems = 1;
}
var $items = $rep.find('[data-pcc-repeat-item]');
if ($items.length <= minItems) {
return;
}
var $form = $rep.closest('.pcc-form');
$item.remove();
pcc_repeater_sync($rep, $form);
pcc_handle_form_change($form);
}

function wpcc_validateEmail(email) {
return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function pcc_missing_fields_markup($form, messages) {
if (!Array.isArray(messages)) {
messages = $form || [];
$form = jQuery();
}
var html = '<p>' + pcc_escape_html(pcc_lang($form, 'validationIntro', 'Please fix the following:')) + '</p><ul>';
for (var i = 0; i < messages.length; i++) {
html += '<li>' + pcc_escape_html(messages[i]) + '</li>';
}
html += '</ul>';
return html;
}
function pcc_set_coupon_notice(formOrId, type, text) {
var formid = '';
if (typeof formOrId === 'string') {
formid = formOrId;
} else if (formOrId && formOrId.jquery) {
formid = formOrId.attr('id') || '';
}
if (!formid) {
return;
}
pcc_coupon_notice[formid] = { type: type || 'info', text: text || '' };
}

function pcc_coupon_notice_markup(formid) {
var note = pcc_coupon_notice[formid];
if (!note || !note.text) {
return '';
}
return '<div class="pcc-coupon-status ' + pcc_escape_html(note.type) + '">' + pcc_escape_html(note.text) + '</div>';
}

function pcc_get_coupon_map($form) {
var raw = $form.attr('data-coupons');
var map = {};
if (!raw) {
return map;
}
var parsed;
try {
parsed = JSON.parse(raw);
} catch (e) {
return map;
}
for (var key in parsed) {
if (!parsed.hasOwnProperty(key)) {
continue;
}
var code = pcc_trim(key).toUpperCase();
if (!code) {
continue;
}
var def = parsed[key] || {};
var type = pcc_trim(def.type || '').toLowerCase();
if (type !== 'fixed' && type !== 'percent') {
continue;
}
var value = pcc_to_number(def.value);
if (value <= 0) {
continue;
}
map[code] = { type: type, value: value, title: def.title ? String(def.title) : ('Coupon ' + code) };
}
return map;
}

function pcc_apply_coupon_for_form($form) {
if (!$form || !$form.length) {
return;
}
var formid = $form.attr('id') || '';
if (!formid) {
return;
}
var $couponInput = $form.find('[data-coupon-input]').first();
if (!$couponInput.length) {
return;
}
var couponMap = pcc_get_coupon_map($form);
var code = pcc_trim($couponInput.val()).toUpperCase();
if (!code) {
delete pcc_coupon_state[formid];
pcc_set_coupon_notice($form, 'error', pcc_lang($form, 'couponMissing', 'Please enter a coupon code.'));
pcc_handle_form_change($form);
return;
}
if (!couponMap[code]) {
delete pcc_coupon_state[formid];
pcc_set_coupon_notice($form, 'error', pcc_lang($form, 'couponInvalid', 'Coupon code is not valid.'));
pcc_handle_form_change($form);
return;
}
pcc_coupon_state[formid] = {
code: code,
type: couponMap[code].type,
value: couponMap[code].value,
title: couponMap[code].title
};
pcc_set_coupon_notice($form, 'ok', pcc_lang_tpl($form, 'couponApplied', '{title} applied.', { title: couponMap[code].title }));
pcc_handle_form_change($form);
}

function pcc_get_field_label($field) {
return $field.attr('data-title') || $field.attr('name') || 'Field';
}

function pcc_get_msg($form, $field, key, fallback) {
var msg = $field.attr('data-msg-' + key);
return msg !== undefined && msg !== '' ? msg : fallback;
}

function pcc_has_validation_rules($field) {
return (
$field.attr('data-required') !== undefined ||
$field.attr('data-min') !== undefined ||
$field.attr('data-max') !== undefined ||
$field.attr('data-minlen') !== undefined ||
$field.attr('data-maxlen') !== undefined ||
$field.attr('data-pattern') !== undefined ||
$field.attr('data-validate') !== undefined
);
}

function pcc_validate_field_constraints($form, $field) {
var label = pcc_get_field_label($field);
var rawVal = $field.val();
var val = Array.isArray(rawVal) ? pcc_trim(rawVal.join('')) : pcc_trim(rawVal);
var required = $field.attr('data-required') !== undefined;

if (required && val === '') {
return { valid: false, message: pcc_get_msg($form, $field, 'required', label + ' is required.') };
}
if (!required && val === '') {
return { valid: true, message: '' };
}

var isNumeric = $field.is('input[type="number"]') || $field.attr('data-validate') === 'number' || $field.attr('data-min') !== undefined || $field.attr('data-max') !== undefined;
if (isNumeric) {
var num = parseFloat(val);
if (isNaN(num)) {
return { valid: false, message: pcc_get_msg($form, $field, 'number', label + ' must be a valid number.') };
}
if ($field.attr('data-min') !== undefined) {
var minVal = parseFloat($field.attr('data-min'));
if (!isNaN(minVal) && num < minVal) {
return { valid: false, message: pcc_get_msg($form, $field, 'min', label + ' must be at least ' + minVal + '.') };
}
}
if ($field.attr('data-max') !== undefined) {
var maxVal = parseFloat($field.attr('data-max'));
if (!isNaN(maxVal) && num > maxVal) {
return { valid: false, message: pcc_get_msg($form, $field, 'max', label + ' must be at most ' + maxVal + '.') };
}
}
}

if ($field.attr('data-minlen') !== undefined) {
var minLen = parseInt($field.attr('data-minlen'), 10);
if (!isNaN(minLen) && val.length < minLen) {
return { valid: false, message: pcc_get_msg($form, $field, 'minlen', label + ' must be at least ' + minLen + ' characters.') };
}
}
if ($field.attr('data-maxlen') !== undefined) {
var maxLen = parseInt($field.attr('data-maxlen'), 10);
if (!isNaN(maxLen) && val.length > maxLen) {
return { valid: false, message: pcc_get_msg($form, $field, 'maxlen', label + ' must be at most ' + maxLen + ' characters.') };
}
}

if ($field.attr('data-pattern') !== undefined) {
var patternText = pcc_trim($field.attr('data-pattern'));
if (patternText !== '') {
try {
var re = new RegExp(patternText);
if (!re.test(val)) {
return { valid: false, message: pcc_get_msg($form, $field, 'pattern', label + ' has an invalid format.') };
}
} catch (e) {
return { valid: false, message: pcc_get_msg($form, $field, 'pattern', label + ' pattern is invalid.') };
}
}
}

if ($field.attr('data-validate') === 'email' && !wpcc_validateEmail(val)) {
return { valid: false, message: pcc_get_msg($form, $field, 'email', label + ' must be a valid email address.') };
}
return { valid: true, message: '' };
}

function pcc_clear_validation_ui($form) {
if (!$form || !$form.length) {
return;
}
$form.find('.pcc-field-error').remove();
$form.find('.pcc-validation-summary').remove();
$form.find('.pcc-invalid').removeClass('pcc-invalid');
$form.find('[aria-invalid="true"]').removeAttr('aria-invalid');
$form.find('[data-pcc-error-id]').each(function () {
var $f = jQuery(this);
var errId = $f.attr('data-pcc-error-id');
var desc = pcc_trim($f.attr('aria-describedby'));
if (!desc) {
$f.removeAttr('data-pcc-error-id');
return;
}
var parts = desc.split(/\s+/);
var keep = [];
for (var i = 0; i < parts.length; i++) {
if (parts[i] !== errId) {
keep.push(parts[i]);
}
}
if (keep.length) {
$f.attr('aria-describedby', keep.join(' '));
} else {
$f.removeAttr('aria-describedby');
}
$f.removeAttr('data-pcc-error-id');
});
}

function pcc_show_inline_error($form, $field, message, token) {
var options = pcc_get_form_options($form);
if (!options.inlineValidation) {
return;
}
var formid = $form.attr('id') || 'pcc';
var errId = 'pcc-err-' + formid + '-' + String(token || $field.attr('name') || 'field').replace(/[^a-zA-Z0-9_-]/g, '-');
var html = '';
if (options.templates && typeof options.templates.inlineError === 'function') {
html = options.templates.inlineError({
id: errId,
message: message,
field: $field,
form: $form
});
}
if (!html) {
html = '<div class="pcc-field-error" id="' + pcc_escape_html(errId) + '" role="alert">' + pcc_escape_html(message) + '</div>';
}
var $container = $field.closest('.field-group');
if (!$container.length) {
$container = $field.parent();
}
$container.find('#' + errId).remove();
$container.append(html);
$field.addClass('pcc-invalid').attr('aria-invalid', 'true');
var describedBy = pcc_trim($field.attr('aria-describedby'));
if (describedBy.indexOf(errId) === -1) {
$field.attr('aria-describedby', pcc_trim((describedBy + ' ' + errId)));
}
$field.attr('data-pcc-error-id', errId);
}

function pcc_show_validation_summary($form, errors) {
var options = pcc_get_form_options($form);
if (!options.validationSummary || !errors.length) {
return;
}
var html = '';
if (options.templates && typeof options.templates.validationSummary === 'function') {
html = options.templates.validationSummary({
errors: errors,
form: $form
});
}
if (!html) {
html = '<div class="pcc-validation-summary" role="alert" tabindex="-1"><strong>' + pcc_escape_html(pcc_lang($form, 'validationIntro', 'Please fix the following:')) + '</strong><ul>';
for (var i = 0; i < errors.length; i++) {
html += '<li>' + pcc_escape_html(errors[i]) + '</li>';
}
html += '</ul></div>';
}
var $step = $form.find('.pcc-step-active').first();
if ($step.length) {
$step.prepend(html);
} else {
$form.prepend(html);
}
}

function pcc_validate_required_fields(fid, markFields, scope, cfg) {
var $form = jQuery('#' + fid);
if (!$form.length) {
return [];
}
var options = pcc_get_form_options($form);
var $scope = scope ? jQuery(scope) : $form;
if (!$scope.length) {
$scope = $form;
}
var config = jQuery.extend({
interactive: false
}, cfg || {});
pcc_clear_validation_ui($form);
var errors = [];
var seen = {};
var handledGroups = {};
var firstInvalid = null;

function addError(msg, $field, token) {
var txt = pcc_trim(msg || 'Invalid field.');
if (!txt) {
txt = 'Invalid field.';
}
if (!seen[txt]) {
seen[txt] = true;
errors.push(txt);
}
if (markFields && $field && $field.length) {
pcc_show_inline_error($form, $field.first(), txt, token);
if (!firstInvalid) {
firstInvalid = $field.first();
}
}
}

function markGroup($group, ok) {
if (markFields) {
$group.toggleClass('pcc-invalid', !ok);
}
}

$scope.find('input[type="hidden"][name$="-name"][data-required]:not(:disabled)').each(function () {
var $hidden = jQuery(this);
var gname = ($hidden.attr('name') || '').replace(/-name$/, '');
if (!gname) {
return;
}
handledGroups[gname] = true;
var $group = $form.find('input[name="' + gname + '"]:not(:disabled), input[name="' + gname + '[]"]:not(:disabled)');
var ok = $group.filter(':checked').length > 0;
if (!ok) {
addError($hidden.attr('data-msg-required') || (($hidden.attr('data-title') || gname) + ' is required.'), $group.first(), gname + '-group');
}
markGroup($group, ok);
});

$scope.find('input:not(:disabled), select:not(:disabled), textarea:not(:disabled)').each(function () {
var $field = jQuery(this);
if (!$field.attr('name')) {
return;
}
if ($field.is('input[type="hidden"][name$="-name"]')) {
return;
}

if ($field.is(':radio, :checkbox')) {
var raw = $field.attr('name') || '';
var gname = raw.replace(/\[\]$/, '');
if (!gname || handledGroups[gname]) {
return;
}
handledGroups[gname] = true;
var reqGroup = $field.attr('data-required') !== undefined || $form.find('input[type="hidden"][name="' + gname + '-name"][data-required]').length > 0;
if (!reqGroup) {
return;
}
var $group = $form.find('input[name="' + gname + '"]:not(:disabled), input[name="' + gname + '[]"]:not(:disabled)');
var okGroup = $group.filter(':checked').length > 0;
if (!okGroup) {
var $hidden = $form.find('input[type="hidden"][name="' + gname + '-name"]').first();
var label = $hidden.attr('data-title') || $field.attr('data-title') || gname;
addError($hidden.attr('data-msg-required') || $field.attr('data-msg-required') || (label + ' is required.'), $group.first(), gname + '-group');
}
markGroup($group, okGroup);
return;
}

if (!pcc_has_validation_rules($field)) {
if (markFields) {
$field.removeClass('pcc-invalid');
}
return;
}

var result = pcc_validate_field_constraints($form, $field);
if (!result.valid) {
addError(result.message, $field, $field.attr('name') || 'field');
}
if (markFields) {
$field.toggleClass('pcc-invalid', !result.valid);
}
});

if (errors.length) {
if (markFields || config.interactive) {
pcc_show_validation_summary($form, errors);
}
if (config.interactive && options.scrollToError && firstInvalid && firstInvalid.length) {
try {
window.scrollTo({ top: Math.max(0, firstInvalid.offset().top - 20), behavior: 'smooth' });
} catch (e) {
window.scrollTo(0, Math.max(0, firstInvalid.offset().top - 20));
}
}
if (config.interactive && options.focusFirstError && firstInvalid && firstInvalid.length && firstInvalid.is(':visible')) {
try {
firstInvalid.trigger('focus');
} catch (e2) {}
}
}

return errors;
}

function pcc_collect_extra_fields($form) {
var extra = {};
$form.find('.wpcc-xtra:not(:disabled)').each(function () {
var $f = jQuery(this);
var name = $f.attr('name');
if (!name) {
return;
}
extra[name] = $f.val();
});
return extra;
}
function pcc_calc_forms() {
jQuery('.pcc-form').each(function () {
var $form = jQuery(this);
var formid = $form.attr('id');
if (!formid) {
return;
}
pcc_init_form_options($form, {});
var options = pcc_get_form_options($form);
pcc_trigger_event($form, 'beforeCalc', { formId: formid });
pcc_debug_reset($form);
pcc_apply_formulas($form);
pcc_apply_conditional_logic($form);

var symbol = options.currencySymbol || pcc_default_symbol;
var buttonText = options.emailButtonText || pcc_default_button_text;
var summary = pcc_form_data(formid, symbol);
var pricing = pcc_apply_pricing_engine($form, summary[0], symbol, formid);
var totalLabel = pcc_lang($form, 'estimatedTotal', 'Estimated Total : ');
var totalHtml = totalLabel + pcc_format_money(pricing.finalTotal, formid, symbol);

var actions = '';
if (options.templates && typeof options.templates.actionButtons === 'function') {
actions = options.templates.actionButtons({
form: $form,
formId: formid,
buttonText: buttonText,
lang: options.lang
}) || '';
}
if (!actions) {
actions = pcc_history_actions_markup($form);
}

var $preview = jQuery('#' + formid + '-show');
$preview.attr('aria-live', 'polite').attr('aria-atomic', 'true');
$preview.html(
'<h3 class="pcc-total" role="status" aria-live="polite" aria-atomic="true">' + pcc_escape_html(totalHtml) + '</h3>' +
'<div class="pcc-content">' + summary[1] + pricing.breakdownHtml + pcc_coupon_notice_markup(formid) + pcc_quote_meta_markup(formid) + '<br /><br /></div>' +
actions
);

var showValidation = $form.hasClass('pcc-show-validation');
var validationScope = null;
if (showValidation && pcc_is_wizard_form($form)) {
validationScope = pcc_get_wizard_step_element($form, pcc_get_wizard_step($form));
}
pcc_validate_required_fields(formid, showValidation, validationScope);
if (pcc_is_wizard_form($form)) {
pcc_update_wizard_ui($form);
}
pcc_trigger_event($form, 'afterCalc', {
formId: formid,
subtotal: pricing.subtotal,
finalTotal: pricing.finalTotal
});
pcc_debug_render($form);
});
}

function pcc_quote_meta_markup(formid) {
var qid = pcc_get_last_quote_id(formid);
if (!qid) {
return '';
}
var $form = jQuery('#' + formid);
var options = pcc_get_form_options($form);
if (options.templates && typeof options.templates.quoteMeta === 'function') {
var custom = options.templates.quoteMeta({
formId: formid,
quoteId: qid,
form: $form
});
if (custom) {
return custom;
}
}
return '<div class="pcc-quote-meta">Last saved quote: <code>' + pcc_escape_html(qid) + '</code></div>';
}

function pcc_apply_pricing_engine($form, baseTotal, symbol, formid) {
var subtotal = pcc_round(baseTotal);
var fixedDiscount = pcc_to_number($form.attr('data-discount-fixed'));
var percentRate = pcc_to_number($form.attr('data-discount-percent'));
var taxRate = pcc_to_number($form.attr('data-tax-rate'));

if (fixedDiscount < 0) { fixedDiscount = 0; }
if (percentRate < 0) { percentRate = 0; }
if (percentRate > 100) { percentRate = 100; }
if (taxRate < 0) { taxRate = 0; }

var percentAmount = pcc_round(subtotal * (percentRate / 100));
var couponDiscount = 0;
var couponLabel = '';
if (pcc_coupon_state[formid]) {
var coupon = pcc_coupon_state[formid];
if (coupon.type === 'percent') {
couponDiscount = pcc_round(subtotal * (coupon.value / 100));
couponLabel = coupon.title + ' (' + pcc_format_amount(coupon.value, formid) + '%)';
} else if (coupon.type === 'fixed') {
couponDiscount = pcc_round(coupon.value);
couponLabel = coupon.title;
}
}

var cap = pcc_round(subtotal - fixedDiscount - percentAmount);
if (cap < 0) { cap = 0; }
if (couponDiscount > cap) { couponDiscount = cap; }

var discountedSubtotal = pcc_round(subtotal - fixedDiscount - percentAmount - couponDiscount);
if (discountedSubtotal < 0) { discountedSubtotal = 0; }
var taxAmount = pcc_round(discountedSubtotal * (taxRate / 100));
var finalTotal = pcc_round(discountedSubtotal + taxAmount);

var breakdown = '<div class="pcc-pricing-breakdown">';
breakdown += pcc_pricing_row('Subtotal', subtotal, symbol, false, formid);
if (fixedDiscount > 0) { breakdown += pcc_pricing_row('Form Discount (fixed)', -fixedDiscount, symbol, false, formid); }
if (percentAmount > 0) { breakdown += pcc_pricing_row('Form Discount (' + pcc_format_amount(percentRate, formid) + '%)', -percentAmount, symbol, false, formid); }
if (couponDiscount > 0) { breakdown += pcc_pricing_row(couponLabel || 'Coupon Discount', -couponDiscount, symbol, false, formid); }
if (taxRate > 0) { breakdown += pcc_pricing_row('Tax (' + pcc_format_amount(taxRate, formid) + '%)', taxAmount, symbol, false, formid); }
breakdown += pcc_pricing_row('Final Total', finalTotal, symbol, true, formid);
breakdown += '</div>';

return { subtotal: subtotal, finalTotal: finalTotal, breakdownHtml: breakdown };
}

function pcc_pricing_row(label, amount, symbol, totalRow, formid) {
var cls = totalRow ? 'pcc-pricing-row pcc-pricing-row-total' : 'pcc-pricing-row';
var prefix = amount < 0 ? '- ' : '';
var num = pcc_format_money(Math.abs(amount), formid, symbol);
var $form = jQuery('#' + formid);
var options = pcc_get_form_options($form);
if (options.templates && typeof options.templates.pricingRow === 'function') {
var custom = options.templates.pricingRow({
label: label,
amount: amount,
symbol: symbol,
formId: formid,
totalRow: totalRow,
formattedAmount: prefix + num
});
if (custom) {
return custom;
}
}
return '<div class="' + cls + '"><span>' + pcc_escape_html(label) + '</span><strong>' + pcc_escape_html(prefix + num) + '</strong></div>';
}

function pcc_apply_conditional_logic($form) {
if (!$form || !$form.length) { return; }
var sections = $form.find('[data-show-if]').get();
sections.sort(function (a, b) {
return jQuery(a).parents('[data-show-if]').length - jQuery(b).parents('[data-show-if]').length;
});
jQuery(sections).each(function () {
var $section = jQuery(this);
var rule = pcc_trim($section.attr('data-show-if'));
var show = pcc_evaluate_show_rule($form, rule);
if ($section.parents('[data-show-if].pcc-cond-hidden').length > 0) { show = false; }
pcc_toggle_conditional_section($section, show);
pcc_debug_log_rule($form, {
rule: rule || '(always visible)',
result: !!show,
section: $section.attr('class') || $section.prop('tagName') || 'section'
});
});
}

function pcc_toggle_conditional_section($section, show) {
if (show) {
$section.removeClass('pcc-cond-hidden');
$section.find('[data-pcc-disabled-by-rule="1"]').each(function () {
jQuery(this).prop('disabled', false).removeAttr('data-pcc-disabled-by-rule');
});
return;
}
$section.addClass('pcc-cond-hidden');
$section.find('input, select, textarea, button').each(function () {
var $f = jQuery(this);
if ($f.prop('disabled')) { return; }
$f.attr('data-pcc-disabled-by-rule', '1').prop('disabled', true).removeClass('pcc-invalid');
});
}

function pcc_evaluate_show_rule($form, ruleText) {
var text = pcc_trim(ruleText || '');
if (!text) { return true; }
var normalized = text.replace(/\band\b/gi, '&&').replace(/\bor\b/gi, '||').replace(/;/g, '&&');
try {
return pcc_eval_condition_expression($form, normalized);
} catch (e) {
return pcc_eval_legacy_rule($form, text);
}
}

function pcc_eval_legacy_rule($form, ruleText) {
var clauses = String(ruleText || '').split(';');
for (var i = 0; i < clauses.length; i++) {
var clause = pcc_trim(clauses[i]);
if (!clause) { continue; }
var op = '';
var ops = ['!=', '>=', '<=', '=', '>', '<'];
for (var j = 0; j < ops.length; j++) {
if (clause.indexOf(ops[j]) > -1) {
op = ops[j];
break;
}
}
if (!op) { continue; }
var parts = clause.split(op);
var field = pcc_trim(parts[0] || '');
var value = pcc_trim(parts.slice(1).join(op));
if (!pcc_eval_condition($form, field, op, value)) {
return false;
}
}
return true;
}

function pcc_eval_condition_expression($form, expr) {
var tokens = pcc_tokenize_condition_expression(expr);
var idx = 0;

function peek() {
return idx < tokens.length ? tokens[idx] : null;
}
function match(type) {
var t = peek();
if (t && t.type === type) {
idx += 1;
return true;
}
return false;
}
function expect(type) {
if (!match(type)) {
throw new Error('Expected ' + type);
}
}
function parsePrimary() {
if (match('not')) {
return !parsePrimary();
}
if (match('lparen')) {
var nested = parseOr();
expect('rparen');
return nested;
}
var t = peek();
if (!t || t.type !== 'cond') {
throw new Error('Invalid condition token');
}
idx += 1;
return pcc_eval_condition($form, t.field, t.op, t.value);
}
function parseAnd() {
var left = parsePrimary();
while (match('and')) {
left = left && parsePrimary();
}
return left;
}
function parseOr() {
var left = parseAnd();
while (match('or')) {
left = left || parseAnd();
}
return left;
}
var result = parseOr();
if (idx !== tokens.length) {
throw new Error('Trailing tokens');
}
return !!result;
}

function pcc_tokenize_condition_expression(expr) {
var text = String(expr || '');
var tokens = [];
var i = 0;
while (i < text.length) {
var ch = text.charAt(i);
if (/\s/.test(ch)) {
i += 1;
continue;
}
if (ch === '(') {
tokens.push({ type: 'lparen' });
i += 1;
continue;
}
if (ch === ')') {
tokens.push({ type: 'rparen' });
i += 1;
continue;
}
if (text.substr(i, 2) === '&&') {
tokens.push({ type: 'and' });
i += 2;
continue;
}
if (text.substr(i, 2) === '||') {
tokens.push({ type: 'or' });
i += 2;
continue;
}
if (ch === '!') {
tokens.push({ type: 'not' });
i += 1;
continue;
}
var parsed = pcc_parse_condition_token(text, i);
if (!parsed) {
throw new Error('Unable to parse condition token');
}
tokens.push({
type: 'cond',
field: parsed.field,
op: parsed.op,
value: parsed.value
});
i = parsed.next;
}
return tokens;
}

function pcc_parse_condition_token(text, startIdx) {
var i = startIdx;
while (i < text.length && /\s/.test(text.charAt(i))) { i += 1; }
var field = '';
while (i < text.length) {
var ch = text.charAt(i);
if (/\s/.test(ch) || ch === '!' || ch === '<' || ch === '>' || ch === '=' || ch === '(' || ch === ')' || ch === '&' || ch === '|') {
break;
}
field += ch;
i += 1;
}
field = pcc_trim(field);
if (!field) {
return null;
}
while (i < text.length && /\s/.test(text.charAt(i))) { i += 1; }
var op = '';
var op2 = text.substr(i, 2);
if (op2 === '!=' || op2 === '>=' || op2 === '<=') {
op = op2;
i += 2;
} else if (text.charAt(i) === '=' || text.charAt(i) === '>' || text.charAt(i) === '<') {
op = text.charAt(i);
i += 1;
} else {
return null;
}
while (i < text.length && /\s/.test(text.charAt(i))) { i += 1; }
var value = '';
if (text.charAt(i) === '"' || text.charAt(i) === "'") {
var q = text.charAt(i);
i += 1;
while (i < text.length && text.charAt(i) !== q) {
value += text.charAt(i);
i += 1;
}
if (text.charAt(i) === q) {
i += 1;
}
} else {
while (i < text.length) {
if (text.substr(i, 2) === '&&' || text.substr(i, 2) === '||' || text.charAt(i) === ')') {
break;
}
value += text.charAt(i);
i += 1;
}
}
return {
field: field,
op: op,
value: pcc_trim(value),
next: i
};
}

function pcc_resolve_rule_value($form, rawValue) {
var txt = pcc_trim(rawValue || '');
if (!txt) {
return '';
}
return txt.replace(/\{([^}]+)\}/g, function (m, fieldName) {
var vals = pcc_get_field_values($form, pcc_trim(fieldName));
return vals.length ? vals[0] : '';
});
}

function pcc_eval_condition($form, field, op, rawExpected) {
var expectedRaw = pcc_resolve_rule_value($form, rawExpected);
var actual = pcc_get_field_values($form, field);
if (op === '=' || op === '!=') {
var expected = expectedRaw.split('|').map(function (v) { return pcc_trim(v).toLowerCase(); });
var match = pcc_values_intersect(actual, expected);
return op === '=' ? match : !match;
}
var actualNum = pcc_to_number(actual.length ? actual[0] : 0);
var expectedNum = pcc_to_number(expectedRaw);
if (op === '>') { return actualNum > expectedNum; }
if (op === '<') { return actualNum < expectedNum; }
if (op === '>=') { return actualNum >= expectedNum; }
if (op === '<=') { return actualNum <= expectedNum; }
return false;
}

function pcc_get_field_values($form, name) {
var values = [];
var selector = '[name="' + name + '"]:not(:disabled), [name="' + name + '[]"]:not(:disabled)';
$form.find(selector).each(function () {
var $f = jQuery(this);
if ($f.is(':checkbox, :radio')) {
if ($f.is(':checked')) { values.push(pcc_trim($f.val()).toLowerCase()); }
return;
}
if ($f.is('select')) {
var val = $f.val();
if (Array.isArray(val)) {
for (var i = 0; i < val.length; i++) { values.push(pcc_trim(val[i]).toLowerCase()); }
} else {
values.push(pcc_trim(val).toLowerCase());
}
return;
}
values.push(pcc_trim($f.val()).toLowerCase());
});
return values;
}

function pcc_values_intersect(actual, expected) {
var map = {};
for (var i = 0; i < expected.length; i++) { if (expected[i]) { map[expected[i]] = true; } }
for (var j = 0; j < actual.length; j++) { if (map[actual[j]]) { return true; } }
return false;
}
function pcc_form_data(fid, symbol) {
var total = 0;
var details = '';
var cbox = {};
var cboxTitles = {};
var doneRadios = {};
var $form = jQuery('#' + fid);

$form.find('input[type="text"]:not(:disabled), input[type="number"]:not(:disabled), textarea[data-cost]:not(:disabled)').each(function () {
var $i = jQuery(this);
var title = $i.attr('data-title') || $i.attr('name') || 'Text input';
var rawCost = $i.attr('data-cost');
if (rawCost === undefined) { return; }
var mult = parseFloat($i.attr('data-mult')); if (isNaN(mult)) { mult = 1; }
var inputNum = pcc_to_number($i.val());
var baseCost = rawCost === 'this' ? inputNum : pcc_to_number(rawCost);
var line = pcc_round(baseCost * mult);
total += line;
if (mult === 1) {
details += '<br /><b>' + pcc_escape_html(title) + '</b> : ' + pcc_format_money(baseCost, fid, symbol);
} else {
details += '<br /><b>' + pcc_escape_html(title) + '</b> : ' + pcc_format_amount(baseCost, fid) + ' X ' + pcc_format_amount(mult, fid) + ' = ' + pcc_format_money(line, fid, symbol);
}
});

$form.find('select:not(:disabled)').each(function () {
var $s = jQuery(this);
var title = $s.attr('data-title') || $s.attr('name') || 'Select';
var $opt = $s.find('option:selected');
var rawCost = $opt.attr('data-cost');
if (rawCost === undefined) { return; }
var optLabel = $opt.attr('data-title');
var optText = $opt.text();
var suffix = optLabel === undefined ? ' ( ' + optText + ' ) ' : ' ( ' + optLabel + ' ) ';
var mult = parseFloat($s.attr('data-mult')); if (isNaN(mult)) { mult = 1; }
var optNum = pcc_to_number(optText);
var baseCost = rawCost === 'this' ? optNum : pcc_to_number(rawCost);
var line = pcc_round(baseCost * mult);
total += line;
if (mult === 1) {
details += '<br /><b>' + pcc_escape_html(title) + pcc_escape_html(suffix) + '</b> : ' + pcc_format_money(baseCost, fid, symbol);
} else {
details += '<br /><b>' + pcc_escape_html(title) + pcc_escape_html(suffix) + '</b> : ' + pcc_format_amount(baseCost, fid) + ' X ' + pcc_format_amount(mult, fid) + ' = ' + pcc_format_money(line, fid, symbol);
}
});

$form.find('input[type="radio"]:not(:disabled)').each(function () {
var $r = jQuery(this);
var name = $r.attr('name');
if (!name || doneRadios[name]) { return; }
doneRadios[name] = true;
var $checked = $form.find('input[type="radio"][name="' + name + '"]:checked:not(:disabled)');
if (!$checked.length) { return; }
var $meta = $form.find('input[type="hidden"][name="' + name + '-name"]:not(:disabled)');
var groupTitle = $meta.attr('data-title') || name;
var optionTitle = $checked.attr('data-title') || 'Selected option';
var rawCost = $checked.attr('data-cost');
if (rawCost === undefined) { return; }
var mult = parseFloat($meta.attr('data-mult')); if (isNaN(mult)) { mult = 1; }
var valNum = pcc_to_number($checked.val());
var baseCost = rawCost === 'this' ? valNum : pcc_to_number(rawCost);
var line = pcc_round(baseCost * mult);
total += line;
if (mult === 1) {
details += '<br /><b>' + pcc_escape_html(groupTitle) + ' ( ' + pcc_escape_html(optionTitle) + ' )</b> : ' + pcc_format_money(baseCost, fid, symbol);
} else {
details += '<br /><b>' + pcc_escape_html(groupTitle) + ' ( ' + pcc_escape_html(optionTitle) + ' )</b> : ' + pcc_format_amount(baseCost, fid) + ' X ' + pcc_format_amount(mult, fid) + ' = ' + pcc_format_money(line, fid, symbol);
}
});

$form.find('input[type="checkbox"]:not(:disabled)').each(function () {
var $c = jQuery(this);
var rawName = $c.attr('name') || '';
var name = rawName.replace(/\[\]$/, '');
if (!name) { return; }
var $meta = $form.find('input[type="hidden"][name="' + name + '-name"]:not(:disabled)');
var title = $c.attr('data-title') || 'Option';
var groupTitle = $meta.attr('data-title') || '';
var rawCost = $c.attr('data-cost');
if (!$c.is(':checked') || rawCost === undefined) { return; }
var mult = parseFloat($meta.attr('data-mult')); if (isNaN(mult)) { mult = 1; }
var valNum = pcc_to_number($c.val());
var baseCost = rawCost === 'this' ? valNum : pcc_to_number(rawCost);
var line = pcc_round(baseCost * mult);
total += line;
if (!cbox[name]) { cbox[name] = ''; }
cboxTitles[name] = groupTitle;
if (mult === 1) {
cbox[name] += '<li><b>' + pcc_escape_html(title) + '</b> : ' + pcc_format_money(baseCost, fid, symbol) + '</li>';
} else {
cbox[name] += '<li><b>' + pcc_escape_html(title) + '</b> : ' + pcc_format_amount(baseCost, fid) + ' X ' + pcc_format_amount(mult, fid) + ' = ' + pcc_format_money(line, fid, symbol) + '</li>';
}
});

for (var key in cbox) {
if (cbox.hasOwnProperty(key)) {
details += '<fieldset><legend>' + pcc_escape_html(cboxTitles[key]) + '</legend><ul>' + cbox[key] + '</ul></fieldset>';
}
}

return [pcc_round(total), details];
}

function pcc_local_storage_available() {
try {
localStorage.setItem('__pcc_test__', '1');
localStorage.removeItem('__pcc_test__');
return true;
} catch (e) {
return false;
}
}

function pcc_get_storage_key(formid) { return 'pcc_draft_' + formid; }
function pcc_get_last_quote_id_key(formid) { return 'pcc_last_quote_' + formid; }

function pcc_collect_form_state($form) {
var state = { values: {}, coupon_input: '', coupon_state: null, wizard_step: 0, updated_at: Date.now() };
if (!$form || !$form.length) { return state; }

$form.find('input[name], select[name], textarea[name]').each(function () {
var $f = jQuery(this);
var name = $f.attr('name');
if (!name) { return; }
if ($f.is(':radio')) {
if ($f.is(':checked')) { state.values[name] = String($f.val()); }
return;
}
if ($f.is(':checkbox')) {
if (name.slice(-2) === '[]') {
if (!Array.isArray(state.values[name])) { state.values[name] = []; }
if ($f.is(':checked')) { state.values[name].push(String($f.val())); }
} else {
state.values[name] = $f.is(':checked') ? '1' : '0';
}
return;
}
if ($f.is('select[multiple]')) {
state.values[name] = $f.val() || [];
return;
}
var shouldBeArray = name.slice(-2) === '[]' || $form.find('[name="' + name + '"]').length > 1;
if (shouldBeArray) {
if (!Array.isArray(state.values[name])) {
state.values[name] = [];
}
state.values[name].push($f.val());
} else {
state.values[name] = $f.val();
}
});

var $couponInput = $form.find('[data-coupon-input]').first();
if ($couponInput.length) { state.coupon_input = $couponInput.val(); }
var formid = $form.attr('id') || '';
if (formid && pcc_coupon_state[formid]) { state.coupon_state = pcc_coupon_state[formid]; }
state.wizard_step = pcc_get_wizard_step($form);
return state;
}

function pcc_ensure_field_count($form, name, count) {
if (!name || !count || count < 1) {
return;
}
if ($form.find('[name="' + name + '"]').length >= count) {
return;
}
$form.find('[data-pcc-repeater]').each(function () {
var $rep = jQuery(this);
while ($form.find('[name="' + name + '"]').length < count) {
var before = $form.find('[name="' + name + '"]').length;
pcc_repeater_add($rep, true);
if ($form.find('[name="' + name + '"]').length <= before) {
break;
}
}
});
}

function pcc_apply_form_state($form, state) {
if (!$form || !$form.length || !state || typeof state !== 'object') { return; }
var values = state.values || {};
for (var name in values) {
if (!values.hasOwnProperty(name)) { continue; }
var value = values[name];
var $fields = $form.find('[name="' + name + '"]');
if (!$fields.length && Array.isArray(value)) {
pcc_ensure_field_count($form, name, value.length);
$fields = $form.find('[name="' + name + '"]');
}
if (!$fields.length) { continue; }
if ($fields.first().is(':radio')) {
$fields.prop('checked', false);
$fields.filter(function () { return String(jQuery(this).val()) === String(value); }).prop('checked', true);
continue;
}
if ($fields.first().is(':checkbox')) {
if (name.slice(-2) === '[]') {
var arr = Array.isArray(value) ? value.map(String) : [];
$fields.each(function () { jQuery(this).prop('checked', arr.indexOf(String(jQuery(this).val())) > -1); });
} else {
$fields.prop('checked', String(value) === '1' || value === true);
}
continue;
}
$fields = $form.find('[name="' + name + '"]');
if (Array.isArray(value) && $fields.length > 1) {
$fields.each(function (idx) {
jQuery(this).val(value[idx] !== undefined ? value[idx] : '');
});
continue;
}
$fields.val(value);
}

var $couponInput = $form.find('[data-coupon-input]').first();
if ($couponInput.length && state.coupon_input !== undefined) { $couponInput.val(state.coupon_input); }
var formid = $form.attr('id') || '';
if (formid) {
if (state.coupon_state && typeof state.coupon_state === 'object') { pcc_coupon_state[formid] = state.coupon_state; }
else { delete pcc_coupon_state[formid]; }
}
if (pcc_is_wizard_form($form)) {
var step = parseInt(state.wizard_step, 10);
if (!isNaN(step)) { pcc_set_wizard_step($form, step); }
}
pcc_apply_conditional_logic($form);
pcc_calc_forms();
if (!pcc_form_history_lock[$form.attr('id') || '']) {
pcc_push_history($form, pcc_collect_form_state($form), false);
}
}
function pcc_autosave_form($form) {
if (!pcc_local_storage_available() || !$form || !$form.length) { return; }
var formid = $form.attr('id') || '';
if (!formid) { return; }
if (!pcc_get_form_options($form).autosave) { return; }
if (pcc_draft_timers[formid]) { clearTimeout(pcc_draft_timers[formid]); }
pcc_draft_timers[formid] = setTimeout(function () {
localStorage.setItem(pcc_get_storage_key(formid), JSON.stringify(pcc_collect_form_state($form)));
}, 250);
}

function pcc_restore_initial_state($form) {
if (!$form || !$form.length) { return; }
var formid = $form.attr('id') || '';
if (!formid) { return; }

var quoteId = pcc_get_query_param('quote_id');
if (quoteId) {
pcc_load_quote_by_id($form, quoteId, true);
return;
}
var shared = pcc_get_query_param('pcc_state');
if (shared) {
var decoded = pcc_decode_state_payload(shared);
if (decoded) {
pcc_apply_form_state($form, decoded);
pcc_set_coupon_notice(formid, 'info', 'Loaded from shared link state.');
return;
}
}
if (!pcc_local_storage_available()) { return; }
var raw = localStorage.getItem(pcc_get_storage_key(formid));
if (!raw) { return; }
try {
var options = pcc_get_form_options($form);
var shouldRestore = true;
if (options.restoreDraftPrompt) {
shouldRestore = window.confirm(pcc_lang($form, 'restoreDraftPrompt', 'A saved draft was found for this form. Restore it?'));
}
if (shouldRestore) {
pcc_apply_form_state($form, JSON.parse(raw));
pcc_set_coupon_notice(formid, 'info', 'Draft restored from this browser.');
} else {
localStorage.removeItem(pcc_get_storage_key(formid));
}
} catch (e) {
}
}

function pcc_encode_state_payload(state) {
try {
var json = JSON.stringify(state);
var b64 = btoa(unescape(encodeURIComponent(json)));
return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
} catch (e) {
return '';
}
}

function pcc_decode_state_payload(payload) {
if (!payload) { return null; }
try {
var normalized = String(payload).replace(/-/g, '+').replace(/_/g, '/');
while (normalized.length % 4 !== 0) { normalized += '='; }
var json = decodeURIComponent(escape(atob(normalized)));
return JSON.parse(json);
} catch (e) {
return null;
}
}

function pcc_get_query_param(key) {
try {
return new URLSearchParams(window.location.search).get(key);
} catch (e) {
return null;
}
}

function pcc_update_query_param(key, value) {
try {
var url = new URL(window.location.href);
if (value === null || value === '') { url.searchParams.delete(key); }
else { url.searchParams.set(key, value); }
window.history.replaceState({}, '', url.toString());
} catch (e) {
}
}

function pcc_copy_text(text) {
if (navigator.clipboard && navigator.clipboard.writeText) {
return navigator.clipboard.writeText(text);
}
return new Promise(function (resolve, reject) {
var $tmp = jQuery('<textarea>').css({ position: 'fixed', left: '-9999px', top: '-9999px' }).val(text);
jQuery('body').append($tmp);
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

function pcc_share_link_modal_markup(message, link) {
var html = '<p class="pcc-share-link-copy">' + pcc_escape_html(message || '') + '</p>';
html += '<textarea class="pcc-share-link-textarea" readonly spellcheck="false" onclick="this.select()" onfocus="this.select()" aria-label="Share link">' + pcc_escape_html(link || '') + '</textarea>';
return html;
}

function pcc_share_quote_state($form) {
if (!$form || !$form.length) { return; }
var payload = pcc_encode_state_payload(pcc_collect_form_state($form));
if (!payload) {
pcc_alertx('Unable to generate share link.', 'Error');
return;
}
var url = new URL(window.location.href);
url.searchParams.set('pcc_state', payload);
url.searchParams.delete('quote_id');
var link = url.toString();
pcc_copy_text(link).then(function () {
pcc_alertx(pcc_share_link_modal_markup('Share link copied to clipboard. You can also copy it from the box below.', link), 'Share link ready');
}).catch(function () {
pcc_alertx(pcc_share_link_modal_markup('Copy failed. Use the link below.', link), 'Share link ready');
});
}

function pcc_get_last_quote_id(formid) {
if (!pcc_local_storage_available() || !formid) { return ''; }
return pcc_trim(localStorage.getItem(pcc_get_last_quote_id_key(formid)) || '');
}

function pcc_php_not_supported_message() {
return 'PHP is not supported on this server, on real php supported server only, this feature will work';
}

function pcc_php_feature_error_message(xhr, textStatus, fallback) {
var responseText = xhr && xhr.responseText ? String(xhr.responseText) : '';
var contentType = '';
if (xhr && typeof xhr.getResponseHeader === 'function') {
try {
contentType = String(xhr.getResponseHeader('Content-Type') || '').toLowerCase();
} catch (ignoreHeader) {}
}
if (
textStatus === 'parsererror' ||
responseText.indexOf('<?php') !== -1 ||
responseText.indexOf('declare(strict_types=1)') !== -1 ||
responseText.indexOf('session_start()') !== -1 ||
responseText.indexOf('require_once __DIR__') !== -1 ||
((xhr && xhr.status === 200) && contentType && contentType.indexOf('application/json') === -1)
) {
return pcc_php_not_supported_message();
}
return fallback;
}

function pcc_ensure_csrf_token() {
var deferred = jQuery.Deferred();
var existing = (typeof wpcc_csrf_token !== 'undefined') ? pcc_trim(wpcc_csrf_token) : '';
if (existing) {
deferred.resolve(existing);
return deferred.promise();
}
if (!quoteApiUrl) {
quoteApiUrl = pcc_get_runtime_base() + '/quote_api.php';
}
jQuery.ajax({
url: quoteApiUrl + '?action=csrf',
method: 'GET',
dataType: 'json'
}).done(function (res) {
var token = res && res.ok && res.csrf_token ? pcc_trim(res.csrf_token) : '';
if (!token) {
deferred.reject('Missing CSRF token.');
return;
}
window.wpcc_csrf_token = token;
deferred.resolve(token);
}).fail(function (xhr, textStatus) {
var msg = 'Unable to initialize secure save.';
if (xhr && xhr.responseJSON && xhr.responseJSON.message) { msg = xhr.responseJSON.message; }
else if (xhr && xhr.responseText) { msg = xhr.responseText; }
msg = pcc_php_feature_error_message(xhr, textStatus, msg);
deferred.reject(msg);
});
return deferred.promise();
}

function pcc_set_last_quote_id(formid, quoteId) {
if (!pcc_local_storage_available() || !formid || !quoteId) { return; }
localStorage.setItem(pcc_get_last_quote_id_key(formid), quoteId);
}

function pcc_save_quote($form) {
if (!$form || !$form.length) { return; }
var formid = $form.attr('id') || '';
if (!formid) { return; }
if (typeof wpcc_csrf_token === 'undefined' || !pcc_trim(wpcc_csrf_token)) {
pcc_ensure_csrf_token().done(function () {
pcc_save_quote($form);
}).fail(function (msg) {
pcc_alertx(pcc_escape_html(msg), 'Security error');
});
return;
}
var totalText = pcc_trim(jQuery('#' + formid + '-show .pcc-total').text());
var summaryHtml = jQuery('#' + formid + '-show .pcc-content').html() || '';
var state = pcc_collect_form_state($form);
var extra = pcc_collect_extra_fields($form);

jQuery.ajax({
url: quoteApiUrl + '?action=save',
method: 'POST',
dataType: 'json',
data: {
csrf: wpcc_csrf_token,
form_id: formid,
total_text: totalText,
summary_html: summaryHtml,
extra_json: JSON.stringify(extra),
form_state_json: JSON.stringify(state),
source_url: window.location.href
}
}).done(function (res) {
if (!res || !res.ok) {
pcc_alertx((res && res.message) ? pcc_escape_html(res.message) : 'Unable to save quote.', 'Save error');
return;
}
var quoteId = res.quote_id || '';
if (!quoteId) {
pcc_alertx('Quote save response was incomplete.', 'Save error');
return;
}
pcc_set_last_quote_id(formid, quoteId);
pcc_update_query_param('quote_id', quoteId);
pcc_set_coupon_notice(formid, 'ok', 'Quote saved as ' + quoteId + '.');
pcc_calc_forms();
pcc_alertx('Quote saved successfully.<br /><br />Quote ID: <b>' + pcc_escape_html(quoteId) + '</b>', 'Quote saved');
}).fail(function (xhr, textStatus) {
var msg = 'Unable to save quote.';
if (xhr && xhr.responseJSON && xhr.responseJSON.message) { msg = xhr.responseJSON.message; }
else if (xhr && xhr.responseText) { msg = xhr.responseText; }
msg = pcc_php_feature_error_message(xhr, textStatus, msg);
pcc_alertx(pcc_escape_html(msg), 'Save error');
});
}

function pcc_load_last_quote($form) {
if (!$form || !$form.length) { return; }
var formid = $form.attr('id') || '';
if (!formid) { return; }
var quoteId = pcc_get_last_quote_id(formid);
if (!quoteId) {
pcc_alertx('No saved quote found in this browser for this form.', 'No saved quote');
return;
}
pcc_load_quote_by_id($form, quoteId, false);
}

function pcc_load_quote_by_id($form, quoteId, silent) {
if (!$form || !$form.length || !quoteId) { return; }
var formid = $form.attr('id') || '';
jQuery.ajax({
url: quoteApiUrl + '?action=get&quote_id=' + encodeURIComponent(quoteId),
method: 'GET',
dataType: 'json'
}).done(function (res) {
if (!res || !res.ok || !res.quote) {
if (!silent) { pcc_alertx('Quote not found.', 'Load error'); }
return;
}
var quote = res.quote;
var state = {};
try { state = JSON.parse(quote.form_state_json || '{}'); } catch (e) { state = {}; }
pcc_apply_form_state($form, state);
if (formid) {
pcc_set_last_quote_id(formid, quote.quote_id);
pcc_set_coupon_notice(formid, 'ok', 'Loaded quote ' + quote.quote_id + '.');
}
pcc_update_query_param('quote_id', quote.quote_id);
pcc_calc_forms();
if (!silent) {
pcc_alertx('Quote loaded successfully.<br /><br />Quote ID: <b>' + pcc_escape_html(quote.quote_id) + '</b>', 'Quote restored');
}
}).fail(function (xhr, textStatus) {
if (silent) { return; }
var msg = 'Unable to load quote.';
if (xhr && xhr.responseJSON && xhr.responseJSON.message) { msg = xhr.responseJSON.message; }
else if (xhr && xhr.responseText) { msg = xhr.responseText; }
msg = pcc_php_feature_error_message(xhr, textStatus, msg);
pcc_alertx(pcc_escape_html(msg), 'Load error');
});
}

function pcc_extract_summary_lines($form) {
var lines = [];
if (!$form || !$form.length) { return lines; }
var formid = $form.attr('id') || '';
if (!formid) { return lines; }
var totalText = pcc_trim(jQuery('#' + formid + '-show .pcc-total').text());
if (totalText) { lines.push(totalText); }
var $content = jQuery('#' + formid + '-show .pcc-content').clone();
$content.find('.pcc-coupon-status, .pcc-quote-meta').remove();
$content.find('.pcc-pricing-row').each(function () {
var $row = jQuery(this);
var label = pcc_trim($row.find('span').first().text());
var value = pcc_trim($row.find('strong').first().text());
var rowLine = pcc_trim(label + (label && value ? ': ' : '') + value);
$row.replaceWith('\n' + rowLine + '\n');
});
$content.find('legend').each(function () {
var $legend = jQuery(this);
var text = pcc_trim($legend.text());
if (text) {
$legend.replaceWith('\n' + text + '\n');
} else {
$legend.remove();
}
});
$content.find('fieldset').each(function () {
jQuery(this).prepend('\n').append('\n');
});
$content.find('div').each(function () {
jQuery(this).prepend('\n').append('\n');
});
$content.find('br').replaceWith('\n');
$content.find('li').each(function () {
var text = pcc_trim(jQuery(this).text());
jQuery(this).text('- ' + text + '\n');
});
var raw = $content.text().replace(/\r/g, '').split('\n');
for (var i = 0; i < raw.length; i++) {
var line = pcc_trim(raw[i]);
if (line) { lines.push(line); }
}
return lines;
}

function pcc_guess_email_recipient($form) {
var found = '';
if (!$form || !$form.length) { return found; }
$form.find('input:not(:disabled), textarea:not(:disabled), select:not(:disabled)').each(function () {
var $field = jQuery(this);
var name = pcc_trim($field.attr('name')).toLowerCase();
var validate = pcc_trim($field.attr('data-validate')).toLowerCase();
var value = pcc_trim($field.val());
if (!value) {
return;
}
if (validate === 'email' || name.indexOf('email') !== -1) {
if (wpcc_validateEmail(value)) {
found = value;
return false;
}
}
});
return found;
}

function pcc_mail_draft_title($form) {
var formid = ($form && $form.length) ? ($form.attr('id') || '') : '';
var title = ($form && $form.length) ? pcc_trim($form.attr('data-title')) : '';
if (!title && formid) {
title = pcc_trim(jQuery('#' + formid + '-show').closest('.pcc-schema-runtime').find('.pcc-schema-title').first().text());
}
if (!title) {
title = pcc_trim(jQuery('#scenario-title').first().text());
}
if (!title) {
title = pcc_trim(document.title || '');
}
if (!title) {
title = formid || 'PCC Estimate';
}
return title;
}

function pcc_build_mail_draft_subject($form) {
var title = pcc_mail_draft_title($form);
var formid = ($form && $form.length) ? ($form.attr('id') || '') : '';
var total = formid ? pcc_trim(jQuery('#' + formid + '-show .pcc-total').text()) : '';
return total ? (title + ' - ' + total) : title;
}

function pcc_get_project_notes_text($form) {
var state = pcc_collect_form_state($form);
var notesText = (state && state.values) ? state.values.notes : '';
return pcc_trim(Array.isArray(notesText) ? notesText.join('\n') : notesText);
}

function pcc_build_mail_draft_lines($form) {
var lines = pcc_extract_summary_lines($form);
var formattedLines = [];
var notesText = pcc_get_project_notes_text($form);
var body = [];
body.push('Estimate from PCC');
body.push('Form: ' + pcc_mail_draft_title($form));
body.push('Source: ' + window.location.href);
body.push('');
if (!lines.length) {
body.push('No estimate summary is available.');
} else {
for (var i = 0; i < lines.length; i++) {
if (/^Subtotal\b/i.test(lines[i]) || /^Final Total\b/i.test(lines[i])) {
formattedLines.push('');
}
formattedLines.push(lines[i]);
if (/^Estimated Total\b/i.test(lines[i])) {
formattedLines.push('');
}
}
for (var j = 0; j < formattedLines.length; j++) {
body.push(formattedLines[j]);
}
}
if (notesText) {
body.push('');
body.push('');
body.push('Project Notes:');
var noteLines = notesText.replace(/\r/g, '').split('\n');
for (var n = 0; n < noteLines.length; n++) {
body.push(noteLines[n]);
}
}
return body;
}

function pcc_build_mail_draft_body($form) {
return pcc_build_mail_draft_lines($form).join('\n');
}

function pcc_open_mail_client(mailtoUrl) {
if (!mailtoUrl) { return false; }
var helper = null;
try {
helper = window.open('about:blank', '_blank');
} catch (ignore) {
helper = null;
}
if (helper && !helper.closed) {
try {
helper.opener = null;
helper.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Opening Email Draft</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#1f2a29;line-height:1.6;background:#f6f7fb;}main{max-width:520px;margin:0 auto;background:#fff;border:1px solid #d7dbe7;border-radius:8px;padding:24px;box-shadow:0 12px 30px rgba(31,42,41,.08);}h1{font-size:22px;margin:0 0 12px;}p{margin:0 0 10px;}small{color:#637089;}</style></head><body><main><h1>Opening your email draft</h1><p>Your default email app should open from this tab. The PCC demo remains open in the original tab.</p><small>If your email app does not appear, check your browser mailto handler or popup settings.</small></main></body></html>');
helper.document.close();
} catch (ignoreDoc) {}
try {
helper.location.href = mailtoUrl;
try {
helper.blur();
window.focus();
} catch (ignoreFocus) {}
return true;
} catch (e) {
try { helper.close(); } catch (ignoreClose) {}
}
}
try {
var frame = document.getElementById('pcc-mailto-launcher');
if (!frame) {
frame = document.createElement('iframe');
frame.id = 'pcc-mailto-launcher';
frame.setAttribute('aria-hidden', 'true');
frame.style.display = 'none';
document.body.appendChild(frame);
}
frame.src = mailtoUrl;
return true;
} catch (ignoreFrame) {}
return false;
}

function pcc_export_print($form) {
if (!$form || !$form.length) { return; }
var formid = $form.attr('id') || '';
if (!formid) { return; }
var totalHtml = jQuery('#' + formid + '-show .pcc-total').html() || '';
var contentHtml = jQuery('#' + formid + '-show .pcc-content').html() || '';
var notesText = pcc_get_project_notes_text($form);
var notesHtml = '';
if (notesText) {
notesHtml = '<section class="pcc-print-notes"><h3>Project Notes</h3><div>' + pcc_escape_html(notesText).replace(/\r?\n/g, '<br />') + '</div></section>';
}
var win = window.open('', '_blank');
if (!win) {
pcc_alertx('Popup blocked. Allow popups to print the quote.', 'Print error');
return;
}
win.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Quote Print</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#1f2a29;}h3{margin:0 0 12px;}fieldset{margin-top:12px;} .pcc-pricing-row{display:flex;justify-content:space-between;margin-top:6px;} .pcc-pricing-row-total{font-weight:bold;border-top:1px solid #ccc;padding-top:8px;margin-top:10px;} .pcc-print-notes{margin-top:24px;padding-top:16px;border-top:1px solid #d5dbe8;} .pcc-print-notes h3{margin-bottom:8px;} .pcc-print-notes div{white-space:normal;line-height:1.6;}</style></head><body><h1>Project Cost Quote</h1><h3>' + totalHtml + '</h3><div>' + contentHtml + '</div>' + notesHtml + '</body></html>');
win.document.close();
win.focus();
win.print();
}
function pcc_export_csv($form) {
if (!$form || !$form.length) { return; }
var formid = $form.attr('id') || 'pcc-quote';
var lines = pcc_extract_summary_lines($form);
if (!lines.length) {
pcc_alertx('No quote data available for export.', 'CSV export');
return;
}
var rows = [['Field', 'Value']];
for (var i = 0; i < lines.length; i++) {
var line = lines[i];
var idx = line.indexOf(':');
if (idx > -1) { rows.push([pcc_trim(line.slice(0, idx)), pcc_trim(line.slice(idx + 1))]); }
else { rows.push([line, '']); }
}
var csv = '';
for (var r = 0; r < rows.length; r++) {
csv += '"' + String(rows[r][0]).replace(/"/g, '""') + '","' + String(rows[r][1]).replace(/"/g, '""') + '"\n';
}
var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
var link = document.createElement('a');
link.href = URL.createObjectURL(blob);
link.download = formid + '-quote.csv';
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
}

function pcc_export_pdf($form) {
if (!$form || !$form.length) { return; }
var formid = $form.attr('id') || 'pcc-quote';
var rawLines = pcc_extract_summary_lines($form);
if (!rawLines.length) {
pcc_alertx('No quote data available for export.', 'PDF export');
return;
}
var lines = pcc_build_mail_draft_lines($form);
if (!(window.jspdf && window.jspdf.jsPDF)) {
pcc_alertx('PDF library unavailable. Falling back to print.', 'PDF export');
pcc_export_print($form);
return;
}
var jsPDFCtor = window.jspdf.jsPDF;
var doc = new jsPDFCtor();
doc.setFontSize(16);
doc.text('Project Cost Quote', 14, 20);
doc.setFontSize(11);
var y = 30;
for (var i = 0; i < lines.length; i++) {
if (lines[i] === '') {
y += 6;
if (y > 285) { doc.addPage(); y = 20; }
continue;
}
var wrapped = doc.splitTextToSize(lines[i], 180);
for (var j = 0; j < wrapped.length; j++) {
doc.text(wrapped[j], 14, y);
y += 6;
if (y > 285) { doc.addPage(); y = 20; }
}
}
doc.save(formid + '-quote.pdf');
}

function pcc_is_wizard_form($form) {
var flag = pcc_trim($form.attr('data-wizard')).toLowerCase();
return flag === '1' || flag === 'true' || flag === 'yes';
}

function pcc_get_wizard_steps($form) { return $form.find('.pcc-step'); }

function pcc_get_wizard_step($form) {
var formid = $form.attr('id') || '';
if (!formid) { return 0; }
if (pcc_wizard_state[formid] === undefined) { pcc_wizard_state[formid] = 0; }
return pcc_wizard_state[formid];
}

function pcc_get_wizard_step_element($form, idx) {
var $steps = pcc_get_wizard_steps($form);
if (!$steps.length) { return $form; }
if (idx < 0) { idx = 0; }
if (idx > $steps.length - 1) { idx = $steps.length - 1; }
return $steps.eq(idx);
}

function pcc_set_wizard_step($form, idx) {
if (!$form || !$form.length || !pcc_is_wizard_form($form)) { return; }
var $steps = pcc_get_wizard_steps($form);
if (!$steps.length) { return; }
if (idx < 0) { idx = 0; }
if (idx > $steps.length - 1) { idx = $steps.length - 1; }
var formid = $form.attr('id') || '';
pcc_wizard_state[formid] = idx;
$steps.removeClass('pcc-step-active').attr('aria-hidden', 'true');
$steps.eq(idx).addClass('pcc-step-active').attr('aria-hidden', 'false');
pcc_update_wizard_ui($form);
pcc_trigger_event($form, 'stepChange', {
stepIndex: idx,
totalSteps: $steps.length
});
}

function pcc_init_wizard($form) {
if (!$form || !$form.length || !pcc_is_wizard_form($form)) { return; }
var $steps = pcc_get_wizard_steps($form);
if (!$steps.length) { return; }
if ($form.find('.pcc-wizard-progress').length === 0) {
$form.prepend('<div class="pcc-wizard-progress"><div class="pcc-wizard-track"><div class="pcc-wizard-bar"></div></div><ol class="pcc-wizard-steps"></ol></div>');
var $ol = $form.find('.pcc-wizard-steps');
$steps.each(function (i) {
var title = pcc_trim(jQuery(this).attr('data-step-title'));
if (!title) { title = 'Step ' + (i + 1); }
$ol.append('<li data-step-index="' + i + '" tabindex="0">' + pcc_escape_html(title) + '</li>');
});
}
if ($form.find('.pcc-wizard-nav').length === 0) {
$form.append('<div class="pcc-wizard-nav">' + pcc_inline_button_html(pcc_lang($form, 'prevButton', 'Previous'), 'prev', 'pcc-wizard-prev', 'is-ghost', false) + pcc_inline_button_html(pcc_lang($form, 'nextButton', 'Next Step'), 'next', 'pcc-wizard-next', 'is-primary', true) + '</div>');
}
pcc_set_wizard_step($form, pcc_get_wizard_step($form));
}

function pcc_update_wizard_ui($form) {
if (!$form || !$form.length || !pcc_is_wizard_form($form)) { return; }
var $steps = pcc_get_wizard_steps($form);
if (!$steps.length) { return; }
var idx = pcc_get_wizard_step($form);
var total = $steps.length;
$form.find('.pcc-wizard-bar').css('width', (((idx + 1) / total) * 100) + '%');
$form.find('.pcc-wizard-steps li').each(function () {
var $li = jQuery(this);
var liIdx = parseInt($li.attr('data-step-index'), 10);
$li.removeClass('is-active is-done');
if (liIdx < idx) { $li.addClass('is-done').removeAttr('aria-current'); }
else if (liIdx === idx) { $li.addClass('is-active').attr('aria-current', 'step'); }
else { $li.removeAttr('aria-current'); }
});
var $prev = $form.find('.pcc-wizard-prev');
var $next = $form.find('.pcc-wizard-next');
$prev.prop('disabled', idx === 0);
$next.html(pcc_button_content_html(idx === total - 1 ? pcc_lang($form, 'reviewButton', 'Review Summary') : pcc_lang($form, 'nextButton', 'Next Step'), idx === total - 1 ? 'review' : 'next', true, 'pcc-inline-icon'));
}

function pcc_to_number(value) {
var num = parseFloat(value);
return isNaN(num) ? 0 : num;
}

function pcc_round(value) {
return Math.round(pcc_to_number(value) * 100) / 100;
}

function pcc_format_amount(value, formOrId) {
var rounded = pcc_round(value);
var options = pcc_get_form_options(formOrId);
var minDigits = parseInt(options.numberMinDigits, 10);
var maxDigits = parseInt(options.numberMaxDigits, 10);
if (isNaN(minDigits)) { minDigits = 2; }
if (isNaN(maxDigits)) { maxDigits = 2; }
if (options.decimalSeparator || options.thousandSeparator) {
var fixed = rounded.toFixed(maxDigits).split('.');
var intPart = fixed[0];
var decPart = fixed[1] || '';
var rgx = /(\d+)(\d{3})/;
var groupSep = options.thousandSeparator || ',';
while (rgx.test(intPart)) {
intPart = intPart.replace(rgx, '$1' + groupSep + '$2');
}
if (maxDigits <= 0) {
return intPart;
}
return intPart + (options.decimalSeparator || '.') + decPart;
}
if (typeof rounded.toLocaleString === 'function') {
return rounded.toLocaleString(options.locale || 'en-US', { minimumFractionDigits: minDigits, maximumFractionDigits: maxDigits });
}
return rounded.toFixed(maxDigits);
}

function pcc_format_money(value, formOrId, symbol) {
var options = pcc_get_form_options(formOrId);
var abs = Math.abs(pcc_to_number(value));
if (options.currencyCode) {
try {
return new Intl.NumberFormat(options.locale || 'en-US', {
style: 'currency',
currency: options.currencyCode,
minimumFractionDigits: parseInt(options.numberMinDigits, 10) || 2,
maximumFractionDigits: parseInt(options.numberMaxDigits, 10) || 2
}).format(abs);
} catch (e) {}
}
return pcc_format_amount(abs, formOrId) + '' + (symbol || options.currencySymbol || pcc_default_symbol);
}

function pcc_escape_html(value) {
if (value == null) { return ''; }
return String(value)
.replace(/&/g, '&amp;')
.replace(/</g, '&lt;')
.replace(/>/g, '&gt;')
.replace(/"/g, '&quot;')
.replace(/'/g, '&#39;');
}

function pcc_schema_validate(schema) {
var errors = [];
if (!schema || typeof schema !== 'object') {
errors.push('Schema must be an object.');
return { valid: false, errors: errors };
}
var steps = Array.isArray(schema.steps) ? schema.steps : [];
if (!steps.length && Array.isArray(schema.fields)) {
steps = [{ title: 'Step 1', fields: schema.fields }];
}
if (!steps.length) {
errors.push('Schema must include `steps` or `fields`.');
return { valid: false, errors: errors };
}
var allowedTypes = {
text: true,
number: true,
textarea: true,
select: true,
radio: true,
checkbox: true,
'radio-group': true,
'checkbox-group': true,
hidden: true
};
for (var i = 0; i < steps.length; i++) {
var fields = Array.isArray(steps[i] && steps[i].fields) ? steps[i].fields : [];
for (var j = 0; j < fields.length; j++) {
var f = fields[j] || {};
var type = pcc_trim(f.type || 'text').toLowerCase();
if (!allowedTypes[type]) {
errors.push('Step ' + (i + 1) + ', field ' + (j + 1) + ': unsupported type `' + type + '`.');
continue;
}
if (type !== 'hidden' && !f.name) {
errors.push('Step ' + (i + 1) + ', field ' + (j + 1) + ': missing `name`.');
}
if ((type === 'select' || type === 'radio-group' || type === 'checkbox-group') && !Array.isArray(f.options)) {
errors.push('Step ' + (i + 1) + ', field ' + (j + 1) + ': options array is required.');
}
}
}
return { valid: errors.length === 0, errors: errors };
}

function pcc_schema_normalize(schema) {
var cfg = jQuery.extend(true, {}, schema || {});
if (!cfg.id) {
cfg.id = 'pcc-schema-' + String(Date.now()) + '-' + String(Math.floor(Math.random() * 100000));
}
cfg.summaryId = cfg.summaryId || (cfg.id + '-show');
cfg.className = pcc_trim(cfg.className || 'pcc-form');
if (cfg.className.indexOf('pcc-form') === -1) {
cfg.className += ' pcc-form';
}
cfg.method = cfg.method || 'post';
cfg.action = cfg.action || '#';
if (!Array.isArray(cfg.steps)) {
cfg.steps = [];
}
if (!cfg.steps.length && Array.isArray(cfg.fields)) {
cfg.steps = [{ title: 'Step 1', fields: cfg.fields }];
}
for (var i = 0; i < cfg.steps.length; i++) {
if (!Array.isArray(cfg.steps[i].fields)) {
cfg.steps[i].fields = [];
}
}
if (cfg.wizard === undefined) {
cfg.wizard = cfg.steps.length > 1;
}
return cfg;
}

function pcc_schema_attr_html(attrs) {
var html = '';
for (var key in attrs) {
if (!attrs.hasOwnProperty(key)) {
continue;
}
var val = attrs[key];
if (val === undefined || val === null) {
continue;
}
if (val === '' && key !== 'value') {
continue;
}
if (val === true) {
html += ' ' + key;
continue;
}
html += ' ' + key + '="' + pcc_escape_html(String(val)) + '"';
}
return html;
}

function pcc_schema_merge_messages(attrs, field) {
var msgMap = field.messages || {};
var keys = ['required', 'min', 'max', 'minlen', 'maxlen', 'pattern', 'email', 'number'];
for (var i = 0; i < keys.length; i++) {
var k = keys[i];
var direct = field['msg' + k.charAt(0).toUpperCase() + k.slice(1)];
var val = msgMap[k];
if (direct !== undefined && direct !== null && direct !== '') {
val = direct;
}
if (val !== undefined && val !== null && val !== '') {
attrs['data-msg-' + k] = val;
}
}
}

function pcc_schema_base_attrs(field, includeName) {
var attrs = {};
if (includeName && field.name) {
attrs.name = field.name;
}
if (field.className) {
attrs['class'] = field.className;
}
if (field.placeholder !== undefined) {
attrs.placeholder = field.placeholder;
}
if (field.value !== undefined && field.value !== null) {
attrs.value = field.value;
}
if (field.readonly) {
attrs.readonly = 'readonly';
}
if (field.disabled) {
attrs.disabled = 'disabled';
}
if (field.title || field.label) {
attrs['data-title'] = field.title || field.label;
}
if (field.required) {
attrs['data-required'] = '1';
}
if (field.cost !== undefined && field.cost !== null && field.cost !== '') {
attrs['data-cost'] = field.cost;
}
if (field.mult !== undefined && field.mult !== null && field.mult !== '') {
attrs['data-mult'] = field.mult;
}
if (field.validate !== undefined && field.validate !== null && field.validate !== '') {
attrs['data-validate'] = field.validate;
}
if (field.min !== undefined && field.min !== null && field.min !== '') {
attrs.min = field.min;
attrs['data-min'] = field.min;
}
if (field.max !== undefined && field.max !== null && field.max !== '') {
attrs.max = field.max;
attrs['data-max'] = field.max;
}
if (field.step !== undefined && field.step !== null && field.step !== '') {
attrs.step = field.step;
}
if (field.minlen !== undefined && field.minlen !== null && field.minlen !== '') {
attrs['data-minlen'] = field.minlen;
}
if (field.maxlen !== undefined && field.maxlen !== null && field.maxlen !== '') {
attrs['data-maxlen'] = field.maxlen;
}
if (field.pattern !== undefined && field.pattern !== null && field.pattern !== '') {
attrs['data-pattern'] = field.pattern;
}
if (field.formula !== undefined && field.formula !== null && field.formula !== '') {
attrs['data-formula'] = field.formula;
}
if (field.formulaPrecision !== undefined && field.formulaPrecision !== null && field.formulaPrecision !== '') {
attrs['data-formula-precision'] = field.formulaPrecision;
}
if (field.formulaOutput !== undefined && field.formulaOutput !== null && field.formulaOutput !== '') {
attrs['data-formula-output'] = field.formulaOutput;
}
if (field.rows !== undefined && field.rows !== null && field.rows !== '') {
attrs.rows = field.rows;
}
pcc_schema_merge_messages(attrs, field);
if (field.attrs && typeof field.attrs === 'object') {
for (var ak in field.attrs) {
if (field.attrs.hasOwnProperty(ak)) {
attrs[ak] = field.attrs[ak];
}
}
}
return attrs;
}

function pcc_schema_option_html(opt, field, type) {
var option = opt || {};
var attrs = {
value: option.value !== undefined ? option.value : ''
};
if (option.title !== undefined && option.title !== null && option.title !== '') {
attrs['data-title'] = option.title;
} else if (option.label !== undefined && option.label !== null && option.label !== '') {
attrs['data-title'] = option.label;
}
if (option.cost !== undefined && option.cost !== null && option.cost !== '') {
attrs['data-cost'] = option.cost;
} else if (field.cost !== undefined && field.cost !== null && field.cost !== '') {
attrs['data-cost'] = field.cost;
}
if (option.checked) {
attrs.checked = 'checked';
}
if (option.selected) {
attrs.selected = 'selected';
}
if (option.disabled) {
attrs.disabled = 'disabled';
}
if (type === 'option') {
return '<option' + pcc_schema_attr_html(attrs) + '>' + pcc_escape_html(option.label != null ? option.label : option.value) + '</option>';
}
return '<label><input' + pcc_schema_attr_html(attrs) + ' /> ' + pcc_escape_html(option.label != null ? option.label : option.value) + '</label>';
}

function pcc_schema_required_mark(field) {
if (!field || !field.required) {
return '';
}
return ' <span class="pcc-required-mark" aria-hidden="true">*</span>';
}

function pcc_schema_field_markup(field) {
var f = field || {};
var type = pcc_trim(f.type || 'text').toLowerCase();
var label = f.label || f.title || f.name || 'Field';
if (type === 'hidden') {
var hiddenAttrs = pcc_schema_base_attrs(f, true);
hiddenAttrs.type = 'hidden';
return '<input' + pcc_schema_attr_html(hiddenAttrs) + ' />';
}
var wrapperAttrs = '';
if (f.showIf) {
wrapperAttrs = ' data-show-if="' + pcc_escape_html(String(f.showIf)) + '"';
}
var html = '<div class="field-group"' + wrapperAttrs + '>';
if (type !== 'checkbox' && type !== 'radio') {
html += '<h3>' + pcc_escape_html(label) + pcc_schema_required_mark(f) + '</h3>';
}
if (type === 'textarea') {
var txAttrs = pcc_schema_base_attrs(f, true);
var txVal = txAttrs.value !== undefined ? txAttrs.value : '';
delete txAttrs.value;
html += '<textarea' + pcc_schema_attr_html(txAttrs) + '>' + pcc_escape_html(txVal) + '</textarea>';
html += '</div>';
return html;
}
if (type === 'select') {
var selAttrs = pcc_schema_base_attrs(f, true);
html += '<select' + pcc_schema_attr_html(selAttrs) + '>';
var opts = Array.isArray(f.options) ? f.options : [];
for (var i = 0; i < opts.length; i++) {
html += pcc_schema_option_html(opts[i], f, 'option');
}
html += '</select></div>';
return html;
}
if (type === 'radio-group' || type === 'checkbox-group') {
var groupType = type === 'radio-group' ? 'radio' : 'checkbox';
var hiddenMeta = {
type: 'hidden',
name: (f.name || 'group') + '-name',
'data-title': f.title || f.label || f.name || 'Group'
};
if (f.required) {
hiddenMeta['data-required'] = '1';
}
if (f.mult !== undefined && f.mult !== null && f.mult !== '') {
hiddenMeta['data-mult'] = f.mult;
}
pcc_schema_merge_messages(hiddenMeta, f);
html += '<input' + pcc_schema_attr_html(hiddenMeta) + ' />';
var groupOpts = Array.isArray(f.options) ? f.options : [];
for (var j = 0; j < groupOpts.length; j++) {
var o = jQuery.extend(true, {}, groupOpts[j] || {});
o.attrs = o.attrs || {};
o.attrs.type = groupType;
o.attrs.name = groupType === 'checkbox' ? ((f.name || 'group') + '[]') : (f.name || 'group');
var inputAttrs = pcc_schema_base_attrs(o, false);
inputAttrs.type = groupType;
inputAttrs.name = groupType === 'checkbox' ? ((f.name || 'group') + '[]') : (f.name || 'group');
if (o.value !== undefined) {
inputAttrs.value = o.value;
}
if (o.checked) {
inputAttrs.checked = 'checked';
}
if (o.cost !== undefined && o.cost !== null && o.cost !== '') {
inputAttrs['data-cost'] = o.cost;
} else if (f.cost !== undefined && f.cost !== null && f.cost !== '') {
inputAttrs['data-cost'] = f.cost;
}
if (o.label || o.title) {
inputAttrs['data-title'] = o.title || o.label;
}
html += '<label><input' + pcc_schema_attr_html(inputAttrs) + ' /> ' + pcc_escape_html(o.label != null ? o.label : o.value) + '</label>';
}
html += '</div>';
return html;
}
if (type === 'radio' || type === 'checkbox') {
var inAttrs = pcc_schema_base_attrs(f, true);
inAttrs.type = type;
if (f.checked) {
inAttrs.checked = 'checked';
}
html += '<label><input' + pcc_schema_attr_html(inAttrs) + ' /> ' + pcc_escape_html(label) + pcc_schema_required_mark(f) + '</label></div>';
return html;
}
var attrs = pcc_schema_base_attrs(f, true);
attrs.type = type;
html += '<input' + pcc_schema_attr_html(attrs) + ' />';
html += '</div>';
return html;
}

function pcc_schema_step_markup(step) {
var s = step || {};
var fields = Array.isArray(s.fields) ? s.fields : [];
var attrs = {
'class': 'pcc-step',
'data-step-title': s.title || 'Step'
};
if (s.showIf) {
attrs['data-show-if'] = s.showIf;
}
var html = '<section' + pcc_schema_attr_html(attrs) + '>';
for (var i = 0; i < fields.length; i++) {
html += pcc_schema_field_markup(fields[i]);
}
html += '</section>';
return html;
}

function pcc_schema_to_html(schema) {
var cfg = pcc_schema_normalize(schema);
var formAttrs = {
id: cfg.id,
'class': cfg.className,
method: cfg.method,
action: cfg.action
};
if (cfg.currencySymbol) {
formAttrs['data-curr'] = cfg.currencySymbol;
}
if (cfg.emailButtonText) {
formAttrs['data-emtext'] = cfg.emailButtonText;
}
if (cfg.locale) {
formAttrs['data-locale'] = cfg.locale;
}
if (cfg.currencyCode) {
formAttrs['data-currency-code'] = cfg.currencyCode;
}
if (cfg.wizard) {
formAttrs['data-wizard'] = '1';
}
if (cfg.ruleDebugger) {
formAttrs['data-rule-debugger'] = '1';
}
if (cfg.pricing && typeof cfg.pricing === 'object') {
if (cfg.pricing.taxRate !== undefined) { formAttrs['data-tax-rate'] = cfg.pricing.taxRate; }
if (cfg.pricing.discountPercent !== undefined) { formAttrs['data-discount-percent'] = cfg.pricing.discountPercent; }
if (cfg.pricing.discountFixed !== undefined) { formAttrs['data-discount-fixed'] = cfg.pricing.discountFixed; }
if (cfg.pricing.coupons !== undefined) { formAttrs['data-coupons'] = typeof cfg.pricing.coupons === 'string' ? cfg.pricing.coupons : JSON.stringify(cfg.pricing.coupons); }
}
if (cfg.formAttrs && typeof cfg.formAttrs === 'object') {
for (var fk in cfg.formAttrs) {
if (cfg.formAttrs.hasOwnProperty(fk)) {
formAttrs[fk] = cfg.formAttrs[fk];
}
}
}
if (cfg.options && typeof cfg.options === 'object') {
formAttrs['data-pcc-options'] = JSON.stringify(cfg.options);
}
var html = '<div class="pcc-schema-runtime">';
if (cfg.title) {
html += '<h3 class="pcc-schema-title">' + pcc_escape_html(cfg.title) + '</h3>';
}
html += '<form' + pcc_schema_attr_html(formAttrs) + '>';
for (var i = 0; i < cfg.steps.length; i++) {
html += pcc_schema_step_markup(cfg.steps[i]);
}
html += '</form>';
html += '<div class="wpcc-preview" id="' + pcc_escape_html(cfg.summaryId) + '">No Data available</div>';
html += '</div>';
return html;
}

function pcc_render_schema(target, schema, runtimeOptions) {
var $target = target && target.jquery ? target.first() : jQuery(target).first();
if (!$target.length) {
return { ok: false, message: 'Target not found.' };
}
var validation = pcc_schema_validate(schema);
if (!validation.valid) {
return { ok: false, errors: validation.errors };
}
var cfg = pcc_schema_normalize(schema);
var baseId = cfg.id;
var seq = 2;
while (jQuery('#' + cfg.id).length && !$target.find('#' + cfg.id).length) {
cfg.id = baseId + '-' + seq;
cfg.summaryId = cfg.id + '-show';
seq += 1;
}
$target.html(pcc_schema_to_html(cfg));
var $form = $target.find('#' + cfg.id).first();
if (!$form.length) {
return { ok: false, message: 'Failed to render schema form.' };
}
var mergedOptions = jQuery.extend(true, {}, cfg.options || {}, runtimeOptions || {});
pcc_init_form_options($form, mergedOptions);
pcc_apply_theme($form);
pcc_init_repeaters($form);
pcc_init_wizard($form);
pcc_bind_adapters($form);
if (!mergedOptions.skipRestore) {
pcc_restore_initial_state($form);
}
pcc_push_history($form, pcc_collect_form_state($form), true);
pcc_calc_forms();
return {
ok: true,
formId: cfg.id,
summaryId: cfg.summaryId,
schema: cfg
};
}

var pcc_api_methods = {
init: function (options) {
return this.each(function () {
var $form = jQuery(this);
pcc_init_form_options($form, options || {});
pcc_apply_theme($form);
pcc_init_repeaters($form);
pcc_init_wizard($form);
pcc_bind_adapters($form);
pcc_calc_forms();
});
},
recalc: function () {
pcc_calc_forms();
return this;
},
validate: function (options) {
var $form = this.first();
if (!$form.length) {
return { valid: true, errors: [] };
}
pcc_init_form_options($form, {});
return pcc_validate_form($form, jQuery.extend({ mark: true, interactive: true }, options || {}));
},
getState: function () {
var $form = this.first();
if (!$form.length) {
return {};
}
return pcc_collect_form_state($form);
},
setState: function (state) {
return this.each(function () {
var $form = jQuery(this);
pcc_apply_form_state($form, state || {});
});
},
reset: function () {
return this.each(function () {
var $form = jQuery(this);
if ($form.length && $form[0] && typeof $form[0].reset === 'function') {
$form[0].reset();
}
pcc_handle_form_change($form);
});
},
destroy: function () {
return this.each(function () {
var $form = jQuery(this);
var formid = $form.attr('id') || '';
$form.off('.pccform');
$form.find('.pcc-wizard-progress, .pcc-wizard-nav').remove();
$form.find('.pcc-step').removeClass('pcc-step-active').attr('aria-hidden', 'false');
pcc_clear_validation_ui($form);
delete pcc_form_options[formid];
delete pcc_coupon_state[formid];
delete pcc_coupon_notice[formid];
delete pcc_draft_timers[formid];
delete pcc_wizard_state[formid];
delete pcc_form_history[formid];
delete pcc_form_history_idx[formid];
delete pcc_form_history_lock[formid];
});
},
goToStep: function (stepIndex) {
return this.each(function () {
pcc_set_wizard_step(jQuery(this), parseInt(stepIndex, 10) || 0);
});
},
undo: function () {
return this.each(function () {
pcc_undo_state(jQuery(this));
});
},
redo: function () {
return this.each(function () {
pcc_redo_state(jQuery(this));
});
},
renderSchema: function (schema, options) {
return this.each(function () {
pcc_render_schema(jQuery(this), schema || {}, options || {});
});
}
};

jQuery.fn.pcc = function (methodOrOptions) {
if (pcc_api_methods[methodOrOptions]) {
return pcc_api_methods[methodOrOptions].apply(this, Array.prototype.slice.call(arguments, 1));
}
if (typeof methodOrOptions === 'object' || methodOrOptions === undefined) {
return pcc_api_methods.init.apply(this, arguments);
}
jQuery.error('Method ' + methodOrOptions + ' does not exist on jQuery.pcc');
return this;
};

jQuery.pcc = {
version: pcc_version,
defaults: pcc_defaults,
registerAdapter: pcc_register_adapter,
recalcAll: pcc_calc_forms,
renderSchema: pcc_render_schema,
schemaToHtml: pcc_schema_to_html,
validateSchema: pcc_schema_validate
};
