/***** BOARD MIRROR *****
 * Pushes a read-only copy of the registration sheet to jlmgt.org/board/ so
 * board members whose employers block Google Sheets can still see who has
 * registered. The website never talks to Google; this script talks to the
 * website, every 15 minutes, from a time-driven trigger.
 *
 * One-time setup (details in apps-script/README.md):
 *   1. On the server, create /home/jaspha2/board-private/ingest-secret
 *      holding a long random string.
 *   2. Script Properties: BOARD_PUSH_SECRET = that same string.
 *   3. Run installBoardTrigger() from the editor. It prompts for the extra
 *      scopes (external requests, trigger management) and creates the trigger.
 *   4. Run pushBoardSnapshot() from the editor once and confirm the log says
 *      "HTTP 200 ok N rows".
 *
 * Nothing here changes at the yearly rollover: the snapshot comes from
 * whatever SHEET_ID in Code.js points at.
 */
const BOARD_INGEST_URL = "https://jlmgt.org/board/ingest.php";

function boardSecret_() {
  var v = PropertiesService.getScriptProperties().getProperty("BOARD_PUSH_SECRET");
  if (!v) throw new Error("Script Property BOARD_PUSH_SECRET is not set.");
  return v.trim();
}

// Runs from the trigger. Throwing on anything but a 200 is deliberate: Apps
// Script emails the owner a summary of failed trigger runs, which is the
// only alarm this mirror has.
function pushBoardSnapshot() {
  var sheet = targetSheet_();
  // Display values, so dates and dollar amounts arrive formatted the way the
  // sheet shows them and the page has nothing to interpret.
  var values = sheet.getDataRange().getDisplayValues();
  var headers = values.length ? values[0] : [];
  var rows = values.slice(1).filter(function (row) {
    return row.some(function (cell) { return String(cell).trim() !== ""; });
  });

  var snapshot = {
    year: TOURNAMENT_YEAR,
    sheet: sheet.getParent().getName() + " / " + sheet.getName(),
    pushed_at: new Date().toISOString(),
    headers: headers,
    rows: rows
  };

  // Base64 in a single form field: registrant-typed text never reaches the
  // host's web application firewall as raw text (see ingest.php).
  var encoded = Utilities.base64Encode(JSON.stringify(snapshot), Utilities.Charset.UTF_8);
  var response = UrlFetchApp.fetch(BOARD_INGEST_URL, {
    method: "post",
    payload: { payload: encoded },
    headers: { "X-Board-Key": boardSecret_() },
    muteHttpExceptions: true
  });

  var code = response.getResponseCode();
  var text = "Board snapshot: HTTP " + code + " " +
             response.getContentText().trim().slice(0, 200) +
             " (sent " + rows.length + " rows)";
  if (code !== 200) throw new Error(text);
  console.log(text);
  return text;
}

// Creates the 15-minute trigger if there is none. An existing trigger is left
// alone, because recreating it would reset its failure-notification setting
// back to the daily summary. Delete it on the Triggers page to start over.
function installBoardTrigger() {
  var exists = ScriptApp.getProjectTriggers().some(function (t) {
    return t.getHandlerFunction() === "pushBoardSnapshot";
  });
  if (exists) {
    console.log("pushBoardSnapshot trigger already installed; leaving it alone.");
    return;
  }
  ScriptApp.newTrigger("pushBoardSnapshot").timeBased().everyMinutes(15).create();
  console.log("pushBoardSnapshot will run every 15 minutes.");
}
