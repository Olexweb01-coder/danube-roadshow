/**
 * Danube Roadshow — registration sheet endpoint.
 *
 * Setup (5 minutes):
 * 1. Open the Google Sheet → Extensions → Apps Script.
 * 2. Replace the editor contents with this file. Set SECRET below to the same
 *    value as GOOGLE_SCRIPT_SECRET in Vercel.
 * 3. Run `setup` once from the toolbar and approve the permissions.
 * 4. Deploy → New deployment → type "Web app".
 *      Execute as: Me
 *      Who has access: Anyone
 *    Copy the /exec URL into GOOGLE_SCRIPT_URL in Vercel.
 *    Tip: add a filter on "Lead tier" so the sales team sees HOT leads first.
 * 5. After editing this script later, use Deploy → Manage deployments → Edit →
 *    Version: New version, so the same URL keeps working.
 */

var SECRET = "change-me-to-a-long-random-string";
var SHEET_NAME = "Registrations";

var HEADERS = [
  "Registered at", "Registration ID", "Lead tier", "Full name", "Phone", "Email", "Lives in",
  "Ready to invest", "Amount typed", "How they want to buy", "Ready to reserve", "Notes for sales",
  "Opened from project", "Consent",
  "Joined WhatsApp community", "Community joined at",
  "UTM source", "UTM medium", "UTM campaign", "Device",
  "Heard about it from", "Friend's name or other source",
];
// 1-based column of "Joined WhatsApp community".
var JOINED_COL = HEADERS.indexOf("Joined WhatsApp community") + 1;

function setup() {
  var sheet = getSheet_();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight("bold");
  sheet.setFrozenRows(1);
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Stops spreadsheet formula injection from user input. */
function safe_(v) {
  var s = v == null ? "" : String(v);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function doGet() {
  return json_({ ok: true, service: "danube-roadshow" });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    if (body.secret !== SECRET) return json_({ ok: false, error: "Unauthorised" });

    var sheet = getSheet_();
    var tz = Session.getScriptTimeZone();

    if (body.action === "register") {
      sheet.appendRow([
        Utilities.formatDate(new Date(body.timestamp || new Date()), tz, "yyyy-MM-dd HH:mm:ss"),
        safe_(body.id), safe_(body.tier), safe_(body.fullName), safe_(body.phone), safe_(body.email),
        safe_(body.location), safe_(body.budget), safe_(body.budgetOther), safe_(body.buying), safe_(body.ready),
        safe_(body.notes), safe_(body.project), safe_(body.consent), "No", "",
        safe_(body.utmSource), safe_(body.utmMedium), safe_(body.utmCampaign), safe_(body.userAgent),
        safe_(body.heardFrom), safe_(body.heardDetail),
      ]);
      return json_({ ok: true });
    }

    if (body.action === "community") {
      var last = sheet.getLastRow();
      if (last < 2) return json_({ ok: false, error: "Not found" });
      var ids = sheet.getRange(2, 2, last - 1, 1).getValues();
      for (var i = ids.length - 1; i >= 0; i--) {
        if (ids[i][0] === body.id) {
          sheet.getRange(i + 2, JOINED_COL, 1, 2).setValues([[
            "Yes",
            Utilities.formatDate(new Date(body.timestamp || new Date()), tz, "yyyy-MM-dd HH:mm:ss"),
          ]]);
          return json_({ ok: true });
        }
      }
      return json_({ ok: false, error: "Not found" });
    }

    return json_({ ok: false, error: "Unknown action" });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}
