/*** CONFIG ***/
const FROM_NAME = "JLMGT Contact Form";

// Recipient addresses live in Script Properties, not in this file — the site
// repo is public. Set this under Project Settings › Script Properties:
//   CONTACT_RECIPIENTS  comma-separated notification list
function recipients_() {
  const raw = PropertiesService.getScriptProperties().getProperty("CONTACT_RECIPIENTS") || "";
  const list = raw.split(",").map(s => s.trim()).filter(Boolean);
  if (!list.length) throw new Error("Script Property CONTACT_RECIPIENTS is not set.");
  return list;
}
/******************/

/** Run from the editor to grant scopes and confirm the recipient list. */
function checkSetup() {
  const list = recipients_();
  const text = "Contact recipients: " + list.length + "\n" + list.join("\n");
  console.log(text);
  return text;
}

function doPost(e) {
  try {
    // Honeypot: quietly discard bots that filled the hidden field
    if (e.parameter.hp_company) return _json({ ok: true });

    const name    = (e.parameter.name || "").trim();
    const email   = (e.parameter.email || "").trim();
    const subject = (e.parameter.subject || "").trim();
    const message = (e.parameter.message || "").trim();

    if (!name || !subject || !message || !email) {
      return _json({ ok: false, error: "Missing required fields." }, 400);
    }

    const html = `
      <p><b>Name:</b> ${_esc(name)}</p>
      <p><b>Email:</b> ${_esc(email)}</p>
      <p><b>Subject:</b> ${_esc(subject)}</p>
      <p><b>Message:</b><br>${_esc(message).replace(/\n/g, "<br>")}</p>
    `;

    // Send one email to multiple recipients (comma-separated)
    MailApp.sendEmail({
      to: recipients_().join(","),
      subject: `[Website Contact] ${subject}`,
      htmlBody: html,
      name: FROM_NAME,
      replyTo: email  
    });

    return _json({ ok: true });
  } catch (err) {
    return _json({ ok: false, error: String(err) }, 500);
  }
}

/*** helpers ***/
function _json(obj, status) {
  const out = ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
  if (status && out.setStatusCode) out.setStatusCode(status); // harmless if not supported
  return out;
}
function _esc(s) {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
