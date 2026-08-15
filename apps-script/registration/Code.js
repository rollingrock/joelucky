/***** CONFIG — update these each year *****/
const TOURNAMENT_YEAR = 2026;

// Drive id of this year's registration spreadsheet. Previously this script was
// bound to the 2025 sheet and used getActiveSpreadsheet(), which meant a new
// year's sheet could never receive rows. Opening by id makes the rollover a
// one-line change.
const SHEET_ID   = "1cdgyUadzvCGspYdTwB3MuJ52Fp1ICC6qgiTZKra_-28"; // JoeLucky 2026 Registration
const SHEET_NAME = "Sheet1";

const ORG_NAME       = "Joe Lucky Memorial Golf Tournament";
const SEND_AUTOREPLY = true;
const THANKYOU_URL   = "https://jlmgt.org/thank-you/";

// A registration arrived three times in three seconds because the submitter
// tapped Submit again while waiting on a slow response. Identical payloads
// inside this window are treated as the same submission and dropped.
// Consequence worth knowing: two genuinely identical registrations sent
// minutes apart would collapse into one. Anything differing by a single
// character — name, phone, quantity — is a distinct submission and unaffected.
const DEDUPE_WINDOW_SECONDS = 180;

// Recipient addresses live in Script Properties, not in this file — the site
// repo is public. Set these under Project Settings › Script Properties:
//   ADMIN_EMAILS        comma-separated notification list
//   ORGANIZER_REPLY_TO  single reply-to address
function adminEmails_() {
  const raw = PropertiesService.getScriptProperties().getProperty("ADMIN_EMAILS") || "";
  const list = raw.split(",").map(s => s.trim()).filter(Boolean);
  if (!list.length) throw new Error("Script Property ADMIN_EMAILS is not set.");
  return list;
}

function organizerReplyTo_() {
  const v = PropertiesService.getScriptProperties().getProperty("ORGANIZER_REPLY_TO");
  if (!v) throw new Error("Script Property ORGANIZER_REPLY_TO is not set.");
  return v.trim();
}

/***** PRICES — single source of truth *****
 * Keep in sync with the P object in pages/registration.md.
 * Order matters: QTY_FIELDS drives the spreadsheet column order.
 *
 * kind:
 *   "qty"    quantity x price
 *   "tiered" first unit at price, each additional at `additional`
 *   "amount" the submitted value IS the dollar figure (no unit price)
 */
const SHIRT_PRICE = 45;
const MAX_DONATION = 100000;

const PRICES = {
  tournament_fee_qty: { label: "Tournament Fee",    kind: "qty",    price: 125 },
  mulligan_qty:       { label: "Mulligans",         kind: "qty",    price: 10 },
  club_rental_qty:    { label: "Club Rentals",      kind: "qty",    price: 35 },
  corp_sponsor_qty:   { label: "Corporate Sponsor", kind: "tiered", price: 1250, additional: 500 },

  // Shirts are ten separate columns so the committee can SUM each size across
  // every registration when placing the order. They share one price and are
  // rolled up into a single line in the notification emails.
  shirt_m_s:   { label: "Shirt — Men's S",     kind: "qty", price: SHIRT_PRICE, shirt: { cut: "Men's",   size: "S"   } },
  shirt_m_m:   { label: "Shirt — Men's M",     kind: "qty", price: SHIRT_PRICE, shirt: { cut: "Men's",   size: "M"   } },
  shirt_m_l:   { label: "Shirt — Men's L",     kind: "qty", price: SHIRT_PRICE, shirt: { cut: "Men's",   size: "L"   } },
  shirt_m_xl:  { label: "Shirt — Men's XL",    kind: "qty", price: SHIRT_PRICE, shirt: { cut: "Men's",   size: "XL"  } },
  shirt_m_xxl: { label: "Shirt — Men's XXL",   kind: "qty", price: SHIRT_PRICE, shirt: { cut: "Men's",   size: "XXL" } },
  shirt_w_s:   { label: "Shirt — Women's S",   kind: "qty", price: SHIRT_PRICE, shirt: { cut: "Women's", size: "S"   } },
  shirt_w_m:   { label: "Shirt — Women's M",   kind: "qty", price: SHIRT_PRICE, shirt: { cut: "Women's", size: "M"   } },
  shirt_w_l:   { label: "Shirt — Women's L",   kind: "qty", price: SHIRT_PRICE, shirt: { cut: "Women's", size: "L"   } },
  shirt_w_xl:  { label: "Shirt — Women's XL",  kind: "qty", price: SHIRT_PRICE, shirt: { cut: "Women's", size: "XL"  } },
  shirt_w_xxl: { label: "Shirt — Women's XXL", kind: "qty", price: SHIRT_PRICE, shirt: { cut: "Women's", size: "XXL" } },

  donation_amount:    { label: "Extra Donation",    kind: "amount" }
};

const QTY_FIELDS = Object.keys(PRICES);
const SHIRT_FIELDS = QTY_FIELDS.filter(function (f) { return !!PRICES[f].shirt; });

/***** SHEET LAYOUT *****
 * appendRow writes positionally and never consults the header row, so this
 * list and the row built in doPost must stay in lockstep. doPost asserts the
 * lengths match rather than trusting that they do.
 */
const HEADERS = [
  "timestamp", "registration_type", "assign_individual", "players_needed",
  "team_name", "contact_name", "contact_email", "contact_phone",
  "member1", "member2", "member3", "member4"
].concat(QTY_FIELDS).concat([
  "calculated_total", "client_total", "server_total", "total_tampered", "notes"
]);

/***** WRITE THE HEADER ROW *****
 * Run this once from the editor when rolling over to a new sheet, or after
 * adding/removing/reordering a priced line item. It refuses to run if the
 * sheet already holds submissions, since rewriting headers over existing rows
 * would relabel data that was written to the old layout — in that case add or
 * move the columns by hand instead.
 */
function writeHeaders() {
  var sheet = targetSheet_();
  var dataRows = sheet.getLastRow() - 1;
  if (dataRows > 0) {
    throw new Error(
      "Refusing to rewrite headers: the sheet already has " + dataRows +
      " submission(s). Adjust the columns by hand so existing rows stay " +
      "aligned with their values."
    );
  }

  sheet.getRange(1, 1, 1, sheet.getMaxColumns() >= HEADERS.length
                            ? sheet.getMaxColumns() : HEADERS.length).clearContent();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight("bold");
  sheet.setFrozenRows(1);

  var text = "Wrote " + HEADERS.length + " headers to " +
             sheet.getParent().getName() + " / " + sheet.getName() + ":\n" +
             HEADERS.join("  ");
  console.log(text);
  return text;
}

/***** SETUP CHECK *****
 * Run this from the editor after changing the CONFIG block or the Script
 * Properties. It does two jobs: it triggers the OAuth consent prompt for the
 * scopes the web app needs (openById requires a broader spreadsheet scope than
 * the old bound-script call did), and it fails loudly if anything is missing
 * rather than letting a live submission be the thing that discovers it.
 */
function checkSetup() {
  var report = [
    "Tournament year:  " + TOURNAMENT_YEAR,
    "Admin recipients: " + adminEmails_().length,
    "Reply-to:         " + organizerReplyTo_()
  ];

  var sheet = targetSheet_();
  report.push("Spreadsheet:      " + sheet.getParent().getName() +
              " / " + sheet.getName());
  report.push("Rows so far:      " + Math.max(0, sheet.getLastRow() - 1));

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn())
                     .getValues()[0].map(String);
  var missing = QTY_FIELDS.concat(["players_needed"]).filter(function (f) {
    return headers.indexOf(f) === -1;
  });
  if (missing.length) {
    throw new Error("Sheet is missing expected columns: " + missing.join(", "));
  }

  var order = QTY_FIELDS.map(function (f) { return headers.indexOf(f); });
  var ascending = order.every(function (v, i) { return i === 0 || v > order[i - 1]; });
  report.push("Qty columns:      " + (ascending ? "present, in order"
                                                : "PRESENT BUT OUT OF ORDER"));
  if (!ascending) {
    throw new Error("Sheet column order does not match QTY_FIELDS: " +
                    QTY_FIELDS.join(", "));
  }

  var text = report.join("\n");
  console.log(text);
  return text;
}

/***** HANDLER *****/
function doPost(e) {
  var data = (e && e.parameter) || {};

  // 1) Honeypot quick drop
  if (data.website) {
    return ContentService.createTextOutput("Spam blocked").setMimeType(ContentService.MimeType.TEXT);
  }

  // 2) Validate required fields + sanity checks
  var v = validate_(data);
  if (!v.ok) {
    // Do not save; return a generic response (avoid giving spammers clues)
    return ContentService.createTextOutput("Invalid submission.");
  }

  // 3) Collapse duplicates. The lock matters as much as the cache: three
  // rapid submissions can run concurrently, and without it all three would
  // check the cache before any of them wrote to it.
  var lock = LockService.getScriptLock();
  var locked = false;
  try {
    locked = lock.tryLock(30000);
  } catch (err) {
    console.error("Lock error:", err);
  }

  if (!locked) {
    // Record it anyway rather than dropping it. A duplicate row can be
    // deleted afterwards; a registration that was accepted, acknowledged with
    // a thank-you page, and never written is gone with nobody any the wiser.
    console.warn("Proceeding without the dedupe lock.");
    return recordSubmission_(data);
  }

  try {
    var cache = CacheService.getScriptCache();
    var fingerprint = submissionFingerprint_(data);
    if (cache.get(fingerprint)) {
      console.log("Duplicate submission suppressed: " + (data.team_name || "") +
                  " / " + (data.contact_email || ""));
      return doneResponse_();
    }

    var response = recordSubmission_(data);
    // Marked as seen only once it is actually saved. Caching first would mean
    // a failed append poisons the window: the submitter retries, is told
    // "duplicate", and the registration is lost. Safe to do after the write
    // because the lock is still held, so no concurrent run can slip past.
    cache.put(fingerprint, "1", DEDUPE_WINDOW_SECONDS);
    return response;
  } finally {
    lock.releaseLock();
  }
}

// Everything that actually persists or notifies, run once per unique
// submission under the lock held by doPost.
function recordSubmission_(data) {
  // Totals
  var serverTotal = computeServerTotal_(data);
  var clientTotal = Number(data.calculated_total || 0);
  var tampered = !Number.isFinite(clientTotal) ||
                 Math.abs(serverTotal - clientTotal) > 0.01 ? "Yes" : "No";

  var sheet = targetSheet_();
  var row = [
    new Date(),
    data.registration_type || "",
    data.assign_individual ? "Yes" : "No",
    asInt_(data.players_needed),
    data.team_name || "",
    data.contact_name || "",
    data.contact_email || "",
    data.contact_phone || ""
  ];
  row.push(data.member1 || "", data.member2 || "", data.member3 || "", data.member4 || "");
  // Quantities write as integers; the Extra Donation writes as a dollar amount
  // so cents are not silently truncated out of the sheet.
  QTY_FIELDS.forEach(function (f) {
    row.push(PRICES[f].kind === "amount" ? asMoney_(data[f]) : asInt_(data[f]));
  });
  row.push(
    serverTotal.toFixed(2),   // calculated_total = authoritative server total
    Number.isFinite(clientTotal) ? clientTotal.toFixed(2) : String(clientTotal),
    serverTotal.toFixed(2),   // server_total (explicit column)
    tampered,                 // total_tampered (Yes/No)
    data.notes || ""
  );
  if (row.length !== HEADERS.length) {
    throw new Error("Row/header mismatch: built " + row.length + " cells for " +
                    HEADERS.length + " columns.");
  }
  sheet.appendRow(row);

  // Send admin notification
  try {
    sendAdminNotification_(data);
  } catch (err) {
    console.error("Admin email failed:", err);
  }

  // Optional: send auto-reply to submitter
  if (SEND_AUTOREPLY && data.contact_email) {
    try {
      sendAutoReply_(data);
    } catch (err) {
      console.error("Auto-reply failed:", err);
    }
  }

  return doneResponse_();
}

// A suppressed duplicate gets the same answer a fresh submission does — the
// submitter did nothing wrong and should not be told anything is amiss.
function doneResponse_() {
  if (THANKYOU_URL) {
    return HtmlService.createHtmlOutput(
      '<!doctype html><meta http-equiv="refresh" content="0; url=' + THANKYOU_URL + '">' +
      '<p>Thanks! If you are not redirected, <a href="' + THANKYOU_URL + '">click here</a>.</p>'
    );
  }
  return ContentService
    .createTextOutput("Success! Your registration has been recorded.")
    .setMimeType(ContentService.MimeType.TEXT);
}

// Identifies a submission by its content. Deliberately excludes form_started
// and elapsed_ms: those differ between a resubmission and the original, which
// is exactly what needs to collapse.
function submissionFingerprint_(d) {
  var parts = [
    d.registration_type, d.assign_individual, d.players_needed,
    d.team_name, d.contact_name, d.contact_email, d.contact_phone,
    d.member1, d.member2, d.member3, d.member4, d.notes
  ].concat(QTY_FIELDS.map(function (f) { return d[f]; }));

  // JSON encoding keeps the fields unambiguously separated, so shifting
  // characters between adjacent values cannot produce the same string.
  var raw = JSON.stringify(parts.map(function (p) {
    return String(p == null ? "" : p).trim();
  }));
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, raw,
                                       Utilities.Charset.UTF_8);
  return "reg_" + digest.map(function (b) {
    return ((b & 0xFF) + 0x100).toString(16).slice(1);
  }).join("");
}

function targetSheet_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error('Sheet "' + SHEET_NAME + '" not found in spreadsheet ' + SHEET_ID);
  }
  return sheet;
}

/****Validate Data*****/
function validate_(d) {
  // Required fields. A team name is only meaningful for someone who is
  // playing — a sponsor or donor who is not has no team to name.
  var required = ["registration_type", "contact_name", "contact_email", "contact_phone"];
  if (d.registration_type !== "not-playing") required.push("team_name");
  for (var i = 0; i < required.length; i++) {
    var k = required[i];
    if (!d[k] || String(d[k]).trim() === "") return { ok: false, err: "missing:" + k };
  }

  // Allowed registration types. The first three are current. "corp-sponsor"
  // and "donation" are the retired labels, still accepted because a browser
  // holding the previous page in cache would otherwise have a real
  // registration silently rejected.
  var allowedTypes = {
    "team-entry":1, "individual-entry":1, "not-playing":1,
    "corp-sponsor":1, "donation":1
  };
  if (!allowedTypes[d.registration_type]) return { ok:false, err:"badtype" };

  // Basic email/phone sanity
  if (!/\S+@\S+\.\S+/.test(d.contact_email)) return { ok:false, err:"email" };
  var digits = (d.contact_phone || "").replace(/\D/g, "");
  if (digits.length < 10) return { ok:false, err:"phone" };

  // Quantity fields must be ints >= 0; the Extra Donation is a dollar amount,
  // so it may carry cents.
  var anyQty = false;
  for (var j = 0; j < QTY_FIELDS.length; j++) {
    var field = QTY_FIELDS[j];
    var n = Number(d[field] || 0);
    if (PRICES[field].kind === "amount") {
      if (!Number.isFinite(n) || n < 0 || n > MAX_DONATION) return { ok:false, err:"amount" };
    } else {
      if (!Number.isFinite(n) || n < 0 || Math.floor(n) !== n) return { ok:false, err:"qty" };
    }
    if (n > 0) anyQty = true;
  }

  // Corporate sponsors may ask us to find golfers to complete their team.
  var players = Number(d.players_needed || 0);
  if (!Number.isFinite(players) || players < 0 || players > 100 ||
      Math.floor(players) !== players) return { ok:false, err:"players" };

  // At least one intent (nonzero qty or some notes)
  if (!anyQty && (!d.notes || String(d.notes).trim() === "")) return { ok:false, err:"emptyorder" };

  // Anti-bot elapsed time
  if (d.elapsed_ms && Number(d.elapsed_ms) < 1500) return { ok:false, err:"too_fast" };

  // Notes sanity
  if ((d.notes || "").length > 2000) return { ok:false, err:"notes_len" };
  if ((d.notes || "").match(/https?:\/\//g)?.length > 3) return { ok:false, err:"too_many_links" };

  return { ok: true };
}

/***** EMAIL HELPERS *****/
function sendAdminNotification_(data) {
  const subject = "New Registration: " + (data.registration_type || "Unknown") +
                  (data.team_name ? " — " + data.team_name : "");
  MailApp.sendEmail({
    to: adminEmails_().join(","),
    subject: subject,
    replyTo: organizerReplyTo_(),
    name: "Registration Bot",
    htmlBody: buildHtmlSummary_(data, /*forAdmin=*/true)
  });
}

function sendAutoReply_(data) {
  const subject = "Thanks for your registration" +
                  (data.team_name ? " — " + data.team_name : "");
  const replyTo = organizerReplyTo_();
  const htmlBody =
    "<p>Hi " + (escapeHtml_(data.contact_name || "")) + ",</p>" +
    "<p>Thanks for registering for the " + TOURNAMENT_YEAR + " " + escapeHtml_(ORG_NAME) + "! " +
    "We’ve received your registration. We’ll be in touch soon with any next steps.</p>" +
    buildHtmlSummary_(data, /*forAdmin=*/false) +
    "<p>If you have questions, just reply to this email.</p>" +
    "<p>— " + escapeHtml_(ORG_NAME) + "</p>";

  MailApp.sendEmail({
    to: data.contact_email,
    subject: subject,
    replyTo: replyTo,
    name: ORG_NAME,
    htmlBody: htmlBody
  });
}

/***** RENDER SUMMARY *****/
function buildHtmlSummary_(data, forAdmin) {
  const total = toCurrency_(computeServerTotal_(data));

  function row(label, value) {
    return "<tr><th align='left' style='padding:6px;border-bottom:1px solid #eee;'>" +
      escapeHtml_(label) + "</th><td style='padding:6px;border-bottom:1px solid #eee;'>" +
      escapeHtml_(value || "") + "</td></tr>";
  }

  function itemRow(label, detail, subtotal) {
    return "<tr>" +
            "<td style='padding:6px;border-bottom:1px solid #eee;'>" +
              escapeHtml_(label) + "</td>" +
            "<td style='padding:6px;border-bottom:1px solid #eee;'>" +
              escapeHtml_(detail) + " — Subtotal: " + toCurrency_(subtotal) +
            "</td>" +
          "</tr>";
  }

  function qtyRow(field) {
    const spec = PRICES[field];

    if (spec.kind === "amount") {
      const amount = asMoney_(data[field]);
      if (!amount) return "";
      return itemRow(spec.label, "Any amount", amount);
    }

    const q = asInt_(data[field]);
    if (!q) return "";

    const detail = spec.kind === "tiered"
      ? (q === 1
          ? "1 foursome @ " + toCurrency_(spec.price)
          : "1 foursome @ " + toCurrency_(spec.price) + " + " + (q - 1) +
            " additional @ " + toCurrency_(spec.additional))
      : "Qty: " + q + " @ " + toCurrency_(spec.price);

    return itemRow(spec.label + " (" + toCurrency_(spec.price) + ")",
                   detail, lineSubtotal_(field, q));
  }

  // Ten shirt columns would drown the email, so they collapse to one line.
  function shirtRow() {
    const count = shirtCount_(data);
    if (!count) return "";
    return itemRow("Shirts w/ Logo (" + toCurrency_(SHIRT_PRICE) + ")",
                   count + " total — " + shirtBreakdown_(data),
                   count * SHIRT_PRICE);
  }

  // The "assign me a team" checkbox means something different depending on who
  // ticked it. "corp-sponsor" is the retired type that used to carry the
  // team-side meaning, kept here so older rows still read correctly.
  const isTeam = data.registration_type === "team-entry" ||
                 data.registration_type === "corp-sponsor";
  const assignLabel = isTeam ? "Needs Help Filling Team" : "Assign Me a Team";
  const players = asInt_(data.players_needed);

  const top =
    "<table cellpadding='0' cellspacing='0' style='border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;width:100%;max-width:640px'>" +
    row("Registration Type", data.registration_type) +
    row(assignLabel, data.assign_individual ? "Yes" : "No") +
    (players ? row("Players Needed", String(players)) : "") +
    row("Team Name", data.team_name) +
    row("Contact Name", data.contact_name) +
    row("Contact Email", data.contact_email) +
    row("Contact Phone", data.contact_phone) +
    row("Member 1", data.member1) +
    row("Member 2", data.member2) +
    row("Member 3", data.member3) +
    row("Member 4", data.member4) +
    row("Notes", data.notes) +
    "</table>";

  // Walk QTY_FIELDS in order, substituting the single rolled-up shirt line
  // where the first shirt column would have appeared.
  var shirtEmitted = false;
  const itemRows = QTY_FIELDS.map(function (field) {
    if (!PRICES[field].shirt) return qtyRow(field);
    if (shirtEmitted) return "";
    shirtEmitted = true;
    return shirtRow();
  }).join("");

  const items =
    "<h3 style='font-family:Arial,sans-serif'>Selected Items</h3>" +
    "<table cellpadding='0' cellspacing='0' style='border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;width:100%;max-width:640px'>" +
    itemRows +
    (total ? "<tr><th align='left' style='padding:8px;border-top:2px solid #000;'>Total</th><th align='left' style='padding:8px;border-top:2px solid #000;'>" + total + "</th></tr>" : "") +
    "</table>";

  const adminNote = forAdmin
    ? "<p style='font-family:Arial,sans-serif;color:#666;font-size:12px'>This is an automated notification from your registration form.</p>"
    : "";

  return top + items + adminNote;
}

/***** UTILS *****/
function toCurrency_(n) {
  if (n == null || n === "") return "";
  var num = Number(n);
  if (isNaN(num)) return escapeHtml_(n);
  return "$" + num.toFixed(2);
}

function escapeHtml_(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function asInt_(v) {
  var n = Number(v);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

// Dollar amount entered directly by the registrant (Extra Donation), rounded
// to cents and clamped to a sane ceiling.
function asMoney_(v) {
  var n = Number(v);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(Math.round(n * 100) / 100, MAX_DONATION);
}

// Subtotal for one line item, per the spec's `kind`.
function lineSubtotal_(field, value) {
  var spec = PRICES[field];
  if (!spec) return 0;

  if (spec.kind === "amount") return asMoney_(value);

  var q = asInt_(value);
  if (q <= 0) return 0;
  if (spec.kind === "tiered") return spec.price + (q - 1) * spec.additional;
  return q * spec.price;
}

// "Men's: 2 M, 1 L; Women's: 1 XXL" — for the emails only; the spreadsheet
// keeps one column per size.
function shirtBreakdown_(d) {
  var groups = {};
  var order = [];
  SHIRT_FIELDS.forEach(function (f) {
    var q = asInt_(d[f]);
    if (!q) return;
    var cut = PRICES[f].shirt.cut;
    if (!groups[cut]) { groups[cut] = []; order.push(cut); }
    groups[cut].push(q + " " + PRICES[f].shirt.size);
  });
  return order.map(function (cut) {
    return cut + ": " + groups[cut].join(", ");
  }).join("; ");
}

function shirtCount_(d) {
  return SHIRT_FIELDS.reduce(function (sum, f) { return sum + asInt_(d[f]); }, 0);
}

function computeServerTotal_(d) {
  var total = QTY_FIELDS.reduce(function (sum, field) {
    return sum + lineSubtotal_(field, d[field]);
  }, 0);
  // return cents-rounded to 2 decimals
  return Math.round(total * 100) / 100;
}
