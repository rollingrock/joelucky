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

`registration/` also needs one more, for the board mirror below:

| Key | Value |
|---|---|
| `BOARD_PUSH_SECRET` | the string in `~/board-private/ingest-secret` on the server |

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
update the sheet headers to match. `appendRow` writes positionally and does not
consult the headers, so a sheet whose columns disagree with the code will
silently file values under the wrong names. Run `checkSetup()` from the editor
after any such change; it throws on a missing or out-of-order column.

Prices live in one place per side: the `PRICES` object here, and the `P` object
in `pages/registration.md`. Both must be changed together; the server total is
authoritative and a mismatch is recorded in the `total_tampered` column.

Each `PRICES` entry declares a `kind`:

| `kind` | Meaning |
|---|---|
| `qty` | quantity × `price` |
| `tiered` | first unit at `price`, each additional at `additional` (Corporate Sponsor) |
| `amount` | the submitted value *is* the dollar figure (Extra Donation) — allows cents, capped at `MAX_DONATION` |

## Sheet header row

The 2026 layout, in order. Shirts are one column per cut/size so the committee
can `SUM` each size across every registration when placing the order; the
notification emails roll them back up into a single line.

```
timestamp  registration_type  assign_individual  players_needed
team_name  contact_name  contact_email  contact_phone
member1  member2  member3  member4
tournament_fee_qty  mulligan_qty  club_rental_qty  corp_sponsor_qty
shirt_m_s  shirt_m_m  shirt_m_l  shirt_m_xl  shirt_m_xxl
shirt_w_s  shirt_w_m  shirt_w_l  shirt_w_xl  shirt_w_xxl
donation_amount
calculated_total  client_total  server_total  total_tampered  notes
```

`assign_individual` stays a plain `Yes`/`No` so the column remains filterable.
Its meaning depends on `registration_type`: an individual asking to be placed
on a team, or a corporate sponsor asking us to find golfers to fill their
foursome — in which case `players_needed` holds the count. The emails label it
accordingly.

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

## Board mirror

`registration/Board.js` pushes a read-only copy of the registration sheet to
<https://jlmgt.org/board/> every 15 minutes, for board members whose employers
block Google Sheets. The page shows the last snapshot it received and never
contacts Google. The sheet stays the only place anything is edited.

The three files under `board/` in the site repo (`.htaccess`, `ingest.php`,
`index.php`) hold no secrets and ship with every deploy. Everything sensitive
lives in `/home/jaspha2/board-private/` on the server, outside the docroot,
which the `rsync --delete` deploy never touches: the board password file, the
push key, and the snapshot itself.

### One-time setup

1. Deploy the site so `board/` exists on the server.
2. Over SSH as `jaspha2`, create the private directory:

   ```bash
   mkdir -p ~/board-private
   htpasswd -B -c ~/board-private/.htpasswd board  # the shared board login, bcrypt
   (umask 077; openssl rand -hex 32 > ~/board-private/ingest-secret)
   cat ~/board-private/ingest-secret                # copy for the next step
   ```

   The directory stays `755` and `.htpasswd` `644`: Apache runs as its own
   user and has to read the password file. The push key is `600`: only PHP
   reads it, and PHP runs as `jaspha2`. Add more logins with
   `htpasswd -B ~/board-private/.htpasswd <name>` (no `-c`, which would
   recreate the file); remove one with `htpasswd -D ~/board-private/.htpasswd <name>`.
3. In the `JoeLucky` Apps Script project set the Script Property
   `BOARD_PUSH_SECRET` to that string, then `clasp push`.
4. In the editor run `installBoardTrigger()` once. It asks for two more
   scopes (external requests and trigger management) and creates the
   15-minute trigger; if one already exists it leaves it alone. Then run
   `pushBoardSnapshot()` and check the log says `HTTP 200 ok N rows`.

Two quick checks from any machine:

```bash
curl -s -o /dev/null -w '%{http_code}
' https://jlmgt.org/board/                  # expect 401
curl -s -o /dev/null -w '%{http_code}
' -X POST https://jlmgt.org/board/ingest.php  # expect 403
```

A 401 from the second command means the `<Files>` exemption in
`board/.htaccess` is not being honoured and the push cannot get in.

### When it breaks

- The page shows a yellow banner once the snapshot is more than two hours
  old. Look at the project's Executions page for `pushBoardSnapshot`.
- A failed push throws, so Apps Script emails the script owner. The trigger's
  failure notification defaults to a daily summary; open the trigger in the
  editor to switch it to immediate.
- `500 ingest-secret is missing on the server` from a manual run means the
  file is absent or empty. `ls -l ~/board-private/` should show
  `ingest-secret` owned by `jaspha2` with mode `-rw-------`. Do not loosen
  it: on a shared server that lets other customers read the push key. If PHP
  were somehow not running as `jaspha2`, the snapshot write would fail too,
  and permissions would not be the fix.
- A push failing with HTTP 413 or 418 once the sheet is a few hundred rows
  long is the host's web application firewall rejecting the body size. Turn
  off Extra Web Security for jlmgt.org in the DreamHost panel.

### Yearly rollover

Nothing. The snapshot follows `SHEET_ID` in `Code.js`, and the page labels
itself with `TOURNAMENT_YEAR`. Columns the board adds to the sheet appear on
the page automatically; keep them to the right of `notes` so `appendRow` in
`doPost` keeps writing registrations into the right columns.
