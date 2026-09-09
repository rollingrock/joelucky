<?php
// Read-only mirror of the registration sheet for board members whose employers
// block Google Sheets. It renders whatever snapshot Board.js last pushed to
// ingest.php; nothing on this page talks to Google, and it loads no outside
// assets. Access is gated by the Basic Auth in .htaccess.
declare(strict_types=1);
ini_set('display_errors', '0'); // a printed warning would break the headers below

const PRIVATE_DIR = '/home/jaspha2/board-private'; // outside the docroot
const STALE_AFTER = 2 * 3600;                       // the push runs every 15 minutes

date_default_timezone_set('America/Chicago');

header('Cache-Control: no-store'); // registrant PII: keep it out of shared caches
header('X-Robots-Tag: noindex, nofollow');
header('Referrer-Policy: no-referrer');
header('X-Content-Type-Options: nosniff');

// Every cell came from an anonymous web form, so everything is escaped on the
// way out. A team name is not allowed to become a script.
function h($value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

// Nor a formula: Excel and Sheets execute a CSV cell that starts with one of
// these characters, so such a cell is prefixed with a quote and shows as text.
function csv_cell($value): string
{
    $cell = (string) $value;
    if ($cell !== '' && strpos("=+-@\t\r\n", $cell[0]) !== false) {
        $cell = "'" . $cell;
    }
    return $cell;
}

function ago(int $seconds): string
{
    if ($seconds < 90) return 'just now';
    if ($seconds < 3600) return intdiv($seconds, 60) . ' minutes ago';
    if ($seconds < 172800) return intdiv($seconds, 3600) . ' hours ago';
    return intdiv($seconds, 86400) . ' days ago';
}

$snapshot = null;
$problem  = '';
$raw = @file_get_contents(PRIVATE_DIR . '/snapshot.json');
if ($raw === false) {
    $problem = 'No snapshot has arrived from the sheet yet.';
} else {
    $snapshot = json_decode($raw, true);
    if (!is_array($snapshot) || !isset($snapshot['headers'], $snapshot['rows'])
        || !is_array($snapshot['headers']) || !is_array($snapshot['rows'])) {
        $snapshot = null;
        $problem  = 'The snapshot on the server could not be read.';
    }
}

$headers  = $snapshot['headers'] ?? [];
$rows     = array_reverse($snapshot['rows'] ?? []); // newest registration first
$year     = (string) ($snapshot['year'] ?? '');
$source   = (string) ($snapshot['sheet'] ?? '');
$received = isset($snapshot['received_at']) ? strtotime((string) $snapshot['received_at']) : false;
$age      = $received ? max(0, time() - $received) : null;
$stale    = $snapshot !== null && ($age === null || $age > STALE_AFTER);

// ?csv downloads the same snapshot for Excel, in sheet order (oldest first).
if ($snapshot !== null && isset($_GET['csv'])) {
    $tag   = preg_replace('/[^0-9A-Za-z-]/', '', $year) ?: 'board';
    $stamp = $received ? date('Y-m-d-Hi', $received) : 'undated';
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="jlmgt-' . $tag . '-registrations-' . $stamp . '.csv"');
    $out = fopen('php://output', 'w');
    fwrite($out, "\xEF\xBB\xBF"); // byte-order mark, so Excel reads accented names as UTF-8
    fputcsv($out, array_map('csv_cell', $headers), ',', '"', '');
    foreach ($snapshot['rows'] as $row) {
        $line = [];
        foreach ($headers as $i => $header) {
            $line[] = csv_cell($row[$i] ?? '');
        }
        fputcsv($out, $line, ',', '"', '');
    }
    fclose($out);
    exit;
}

$nonce = base64_encode(random_bytes(16));
header('Content-Type: text/html; charset=utf-8');
header("Content-Security-Policy: default-src 'none'; style-src 'nonce-$nonce'; "
     . "script-src 'nonce-$nonce'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>JLMGT board: <?= h($year) ?> registrations</title>
<style nonce="<?= h($nonce) ?>">
  body { margin: 0; padding: 1rem 1.25rem; font: 14px/1.4 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #222; background: #fff; }
  h1 { font-size: 1.25rem; margin: 0 0 .25rem; }
  .meta { color: #555; margin: 0 0 .75rem; }
  .warn { background: #fff4d6; border: 1px solid #e0b64b; padding: .6rem .8rem; margin: 0 0 .75rem; }
  .err  { background: #fde8e8; border: 1px solid #d9534f; padding: .6rem .8rem; margin: 0 0 .75rem; }
  .tools { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; margin: 0 0 .75rem; }
  #q { flex: 1 1 16rem; max-width: 28rem; padding: .45rem .6rem; font: inherit; border: 1px solid #bbb; border-radius: 4px; box-sizing: border-box; }
  .btn { padding: .45rem .8rem; border: 1px solid #1a5fb4; border-radius: 4px; color: #1a5fb4; text-decoration: none; white-space: nowrap; }
  .btn:hover { background: #eef4fc; }
  .scroll { overflow-x: auto; border: 1px solid #ddd; }
  table { border-collapse: collapse; white-space: nowrap; font-size: 13px; }
  th, td { padding: .35rem .6rem; border-bottom: 1px solid #eee; text-align: left; vertical-align: top; }
  th { position: sticky; top: 0; background: #f4f4f4; font-weight: 600; }
  tbody tr:hover { background: #fafafa; }
  td.z { color: #bbb; }
  a { color: #1a5fb4; }
  [hidden] { display: none !important; }
</style>
</head>
<body>
<h1>Joe Lucky <?= h($year) ?> registrations</h1>

<?php if ($problem !== ''): ?>
<p class="err"><?= h($problem) ?></p>
<?php else: ?>
<p class="meta">
  <?= count($rows) ?> registrations.
  Updated <?= $age === null ? 'at an unknown time' : h(ago($age)) ?><?= $received ? ' (' . h(date('D M j, g:i A', $received)) . ' Central)' : '' ?>.
  Newest first. Read-only copy of <?= h($source) ?>; changes belong in the sheet.
</p>
<?php if ($stale): ?>
<p class="warn">This copy is more than two hours old, so the sync from the sheet may be broken. Jason: check the Apps Script executions for pushBoardSnapshot.</p>
<?php endif; ?>

<div class="tools">
  <input id="q" type="search" placeholder="Filter by name, team, email, anything" autocomplete="off">
  <a class="btn" href="?csv">Download CSV</a>
</div>

<div class="scroll">
<table>
  <thead>
    <tr>
      <?php foreach ($headers as $header): ?>
      <th><?= h(str_replace('_', ' ', (string) $header)) ?></th>
      <?php endforeach; ?>
    </tr>
  </thead>
  <tbody>
    <?php foreach ($rows as $row): ?>
    <tr>
      <?php foreach ($headers as $i => $header):
          $cell = (string) ($row[$i] ?? '');
          $zero = ($cell === '' || $cell === '0');
      ?>
      <td<?= $zero ? ' class="z"' : '' ?>><?php
          // Link only a plain address. The form accepts anything with an @,
          // and "me@x.com?bcc=..." would otherwise become a working mailto.
          if ($header === 'contact_email'
              && preg_match('/^[A-Za-z0-9._+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/', $cell)) {
              echo '<a href="mailto:', h($cell), '">', h($cell), '</a>';
          } else {
              echo h($cell);
          }
      ?></td>
      <?php endforeach; ?>
    </tr>
    <?php endforeach; ?>
  </tbody>
</table>
</div>

<script nonce="<?= h($nonce) ?>">
  (function () {
    var box = document.getElementById('q');
    var rows = document.querySelectorAll('tbody tr');
    box.addEventListener('input', function () {
      var needle = box.value.trim().toLowerCase();
      for (var i = 0; i < rows.length; i++) {
        rows[i].hidden = needle !== '' && rows[i].textContent.toLowerCase().indexOf(needle) === -1;
      }
    });
  })();
</script>
<?php endif; ?>
</body>
</html>
