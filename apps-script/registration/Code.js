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
 */
const PRICES = {
  tournament_fee_qty: { label: "Tournament Fee",           price: 125 },
  mulligan_qty:       { label: "Mulligans",                price: 10 },
  club_rental_qty:    { label: "Club Rentals",             price: 35 },
  corp_sponsor_qty:   { label: "Corporate Sponsor",        price: 1250, additional: 500 },
  donation_qty:       { label: "Donation",                 price: 100 },
  shirt_qty:          { label: "Shirt w/ Logo",            price: 45 },
  gallery_fee_qty:    { label: "Gallery Fee (w/ Dinner)",  price: 15 }
};

const QTY_FIELDS = Object.keys(PRICES);

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
  var missing = QTY_FIELDS.filter(function (f) {
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

  // Totals
  var serverTotal = computeServerTotal_(data);
  var clientTotal = Number(data.calculated_total || 0);
  var tampered = !Number.isFinite(clientTotal) ||
                 Math.abs(serverTotal - clientTotal) > 0.01 ? "Yes" : "No";

  // 3) Save only valid submissions
  var sheet = targetSheet_();
  var row = [
    new Date(),
    data.registration_type || "",
    data.assign_individual ? "Yes" : "No",
    data.team_name || "",
    data.contact_name || "",
    data.contact_email || "",
    data.contact_phone || ""
  ];
  row.push(data.member1 || "", data.member2 || "", data.member3 || "", data.member4 || "");
  QTY_FIELDS.forEach(function (f) { row.push(asInt_(data[f])); });
  row.push(
    serverTotal.toFixed(2),   // calculated_total = authoritative server total
    Number.isFinite(clientTotal) ? clientTotal.toFixed(2) : String(clientTotal),
    serverTotal.toFixed(2),   // server_total (explicit column)
    tampered,                 // total_tampered (Yes/No)
    data.notes || ""
  );
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

  // Return simple success or redirect to thank-you page
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
  // Required fields
  var required = ["registration_type", "team_name", "contact_name", "contact_email", "contact_phone"];
  for (var i = 0; i < required.length; i++) {
    var k = required[i];
    if (!d[k] || String(d[k]).trim() === "") return { ok: false, err: "missing:" + k };
  }

  // Allowed registration types
  var allowedTypes = { "corp-sponsor":1, "individual-entry":1, "donation":1 };
  if (!allowedTypes[d.registration_type]) return { ok:false, err:"badtype" };

  // Basic email/phone sanity
  if (!/\S+@\S+\.\S+/.test(d.contact_email)) return { ok:false, err:"email" };
  var digits = (d.contact_phone || "").replace(/\D/g, "");
  if (digits.length < 10) return { ok:false, err:"phone" };

  // Quantity fields must be ints >= 0
  var anyQty = false;
  for (var j = 0; j < QTY_FIELDS.length; j++) {
    var q = Number(d[QTY_FIELDS[j]] || 0);
    if (!Number.isFinite(q) || q < 0 || Math.floor(q) !== q) return { ok:false, err:"qty" };
    if (q > 0) anyQty = true;
  }

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

  function qtyRow(field) {
    const spec = PRICES[field];
    const q = asInt_(data[field]);
    if (!q) return "";

    const subtotal = lineSubtotal_(field, q);
    const detail = spec.additional
      ? (q === 1
          ? "1 foursome @ " + toCurrency_(spec.price)
          : "1 foursome @ " + toCurrency_(spec.price) + " + " + (q - 1) +
            " additional @ " + toCurrency_(spec.additional))
      : "Qty: " + q + " @ " + toCurrency_(spec.price);

    return "<tr>" +
            "<td style='padding:6px;border-bottom:1px solid #eee;'>" +
              escapeHtml_(spec.label + " (" + toCurrency_(spec.price) + ")") + "</td>" +
            "<td style='padding:6px;border-bottom:1px solid #eee;'>" +
              escapeHtml_(detail) + " — Subtotal: " + toCurrency_(subtotal) +
            "</td>" +
          "</tr>";
  }

  const top =
    "<table cellpadding='0' cellspacing='0' style='border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;width:100%;max-width:640px'>" +
    row("Registration Type", data.registration_type) +
    row("Assign Me a Team", data.assign_individual ? "Yes" : "No") +
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

  const items =
    "<h3 style='font-family:Arial,sans-serif'>Selected Items</h3>" +
    "<table cellpadding='0' cellspacing='0' style='border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;width:100%;max-width:640px'>" +
    QTY_FIELDS.map(qtyRow).join("") +
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

// Subtotal for one line item. Corporate Sponsor is the only tiered rule:
// first foursome at the base price, each additional at PRICES.*.additional.
function lineSubtotal_(field, qty) {
  var spec = PRICES[field];
  if (!spec) return 0;
  var q = asInt_(qty);
  if (q <= 0) return 0;
  if (spec.additional) return spec.price + (q - 1) * spec.additional;
  return q * spec.price;
}

function computeServerTotal_(d) {
  var total = QTY_FIELDS.reduce(function (sum, field) {
    return sum + lineSubtotal_(field, d[field]);
  }, 0);
  // return cents-rounded to 2 decimals
  return Math.round(total * 100) / 100;
}
