# Apps Script projects

The two Google Apps Script web apps behind the site's forms, pulled with
[clasp](https://github.com/google/clasp) so they can be version-controlled
alongside the pages that post to them.

| Directory | Script | Posted to by |
|---|---|---|
| `registration/` | `JoeLucky` | `pages/registration.md` |
| `contact/` | `JoeLucky Contact` | `pages/contact.md` |

## Script Properties

No email addresses live in these files — the site repo is public. Both scripts
read their recipient lists at runtime from Script Properties, set once per
project under **Project Settings › Script Properties** in the Apps Script
editor.

`registration/`:

| Key | Value |
|---|---|
| `ADMIN_EMAILS` | comma-separated notification list |
| `ORGANIZER_REPLY_TO` | single reply-to address |

`contact/`:

| Key | Value |
|---|---|
| `CONTACT_RECIPIENTS` | comma-separated notification list |

A missing property throws with the key name rather than silently sending
nowhere.

## Yearly rollover

Edit the CONFIG block at the top of `registration/Code.js`:

- `TOURNAMENT_YEAR` — appears in the registrant auto-reply
- `SHEET_ID` — Drive id of that year's registration spreadsheet
- `SHEET_NAME` — tab within it (default `Sheet1`)

The new sheet needs the same header row as the previous year. The script writes
columns in `QTY_FIELDS` order, which is derived from the `PRICES` object, so
adding or reordering a priced line item changes the spreadsheet layout —
update the sheet headers to match.

Prices live in one place per side: the `PRICES` object here, and the `P` object
in `pages/registration.md`. Both must be changed together; the server total is
authoritative and a mismatch is recorded in the `total_tampered` column.

## Working with clasp

```bash
cd apps-script/registration
clasp pull                  # fetch remote changes into this directory
clasp push                  # upload local changes to the script project
clasp list-deployments
clasp create-deployment -d "2026 season"   # mints a NEW /exec url
```

Creating a deployment returns a new `/exec` URL, which must be pasted into the
`action` attribute of the corresponding form. Use
`clasp update-deployment <deploymentId>` instead to publish a new version at
the **existing** URL and avoid touching the page.

The `@HEAD` entry in `list-deployments` is the editor's test deployment. It is
a `/dev` URL reachable only by the owner and is not a substitute for a
versioned deployment — an archived versioned deployment is why the 2025
registration endpoint began returning 404.

## Authorization note

`registration/Code.js` opens its spreadsheet with `SpreadsheetApp.openById()`
rather than `getActiveSpreadsheet()`. That is a broader OAuth scope than the
bound-script version needed, so the first run after this change will prompt for
re-authorization.
