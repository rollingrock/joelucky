<?php
// Receives the registration-sheet snapshot pushed every 15 minutes by
// apps-script/registration/Board.js and stores it outside the docroot, where
// index.php reads it and a deploy (rsync --delete of _site/) never reaches.
//
// Auth: the caller sends the shared key in an X-Board-Key header. The same
// string lives in /home/jaspha2/board-private/ingest-secret on the server and
// in the BOARD_PUSH_SECRET Script Property on the Apps Script side.
declare(strict_types=1);

// A warning printed before the status line would turn a failed write into an
// HTTP 200, and the push's only alarm is a non-200. Warnings go to the log.
ini_set('display_errors', '0');

const PRIVATE_DIR = '/home/jaspha2/board-private';

// Everything this script creates is registrant PII on a shared server:
// owner-only from the first byte.
umask(0077);

header('Content-Type: text/plain; charset=utf-8');
header('Cache-Control: no-store');

function fail(int $code, string $message): void
{
    http_response_code($code);
    echo $message, "\n";
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    fail(405, 'POST only');
}

$secret = @file_get_contents(PRIVATE_DIR . '/ingest-secret');
if ($secret === false || trim($secret) === '') {
    fail(500, 'ingest-secret is missing on the server');
}
$given = (string) ($_SERVER['HTTP_X_BOARD_KEY'] ?? '');
if ($given === '' || !hash_equals(trim($secret), $given)) {
    fail(403, 'bad key');
}

// The sheet is sent base64-encoded in one form field so nothing a registrant
// typed (quotes, angle brackets, SQL-looking notes) reaches the host's web
// application firewall as raw text.
$raw = base64_decode((string) ($_POST['payload'] ?? ''), true);
if ($raw === false || $raw === '') {
    fail(400, 'payload is not base64');
}
$snapshot = json_decode($raw, true);
if (!is_array($snapshot)
    || !isset($snapshot['headers'], $snapshot['rows'])
    || !is_array($snapshot['headers']) || !is_array($snapshot['rows'])) {
    fail(400, 'payload is not a snapshot');
}
$snapshot['received_at'] = gmdate('c');

// Write to a per-process temp file and rename, so index.php never reads a
// half-written snapshot and two overlapping pushes (a manual run beside the
// trigger) never share a file.
$file = PRIVATE_DIR . '/snapshot.json';
$tmp  = $file . '.' . getmypid() . '.tmp';
$json = json_encode($snapshot, JSON_UNESCAPED_UNICODE);
if ($json === false
    || file_put_contents($tmp, $json) === false
    || !rename($tmp, $file)) {
    @unlink($tmp);
    fail(500, 'could not write ' . $file);
}

echo 'ok ', count($snapshot['rows']), " rows\n";
