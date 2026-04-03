# PCC

PCC is a ready-made quote and estimate form tool for websites.

It helps you turn a normal form into a live price calculator. As people fill the form, PCC can show the running total, a clean summary, and action buttons like email, print, PDF, CSV, undo, redo, and share.

This package is the plugin only. Demo pages are not included here.

## What PCC Can Do

- Show a live total while the form is being filled
- Show a clean summary of selected items and prices
- Work in normal form mode or step-by-step wizard mode
- Open the visitor's own email app with the estimate draft
- Print the estimate
- Export PDF and CSV
- Create share links
- Save and load quotes when PHP is available

## What Is Included

- `lib-pcc/jquery.pcc.js`
  Main plugin file
- `lib-pcc/pcc.css`
  Main plugin styles
- `lib-pcc/close.png`
  Close icon used by plugin popups
- `assets/icons/`
  Local button icons used by the plugin
- `quote_api.php`
  Optional save/load handler
- `quote_storage.php`
  Optional SQLite storage file for saved quotes

## What Works Without PHP

You can use PCC on a normal HTML page without PHP for:

- live totals
- summary
- email draft
- share link
- print
- PDF
- CSV
- undo / redo

You only need PHP for:

- `Save Quote`
- `Load Last`

If PHP is missing, PCC shows a warning only for those PHP-based parts.

## Folder Layout

Keep the files in this layout:

```text
your-site/
  assets/
    icons/
  lib-pcc/
    jquery.pcc.js
    pcc.css
    close.png
  quote_api.php
  quote_storage.php
```

## Basic Setup

1. Copy `lib-pcc` and `assets/icons` into your website.
2. If you want save and load, also copy `quote_api.php` and `quote_storage.php`.
3. Load jQuery, then load PCC.
4. Add a form and a summary box.
5. Start PCC on that form.

## Small Example

```html
<link rel="stylesheet" href="lib-pcc/pcc.css">

<form id="myQuote" class="pcc-form">
  <!-- your fields go here -->
</form>

<div id="myQuote-show" class="wpcc-preview"></div>

<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script src="lib-pcc/jquery.pcc.js"></script>
<script>
  jQuery(function ($) {
    $('#myQuote').pcc();
  });
</script>
```

## Important Notes

- The email button does not send mail from a server. It opens the user's own email app as a draft.
- PDF works best when `jsPDF` is loaded on the page.
- Save/load needs a real PHP server with SQLite support.
- This repo is meant to be a clean plugin package, so demo pages were left out on purpose.

## In Simple Words

PCC is useful when you want people to fill a form and instantly see "how much it will cost" without building everything from scratch.
