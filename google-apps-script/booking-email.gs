/**
 * Public Star Driving School: booking form -> email + Google Sheet
 *
 * Runs inside the publicstardrivingschool@gmail.com Google account, so booking
 * emails are sent by that Gmail account to itself and are not caught as spam.
 * Every booking is also added as a row to the Google Sheet this script lives in.
 *
 * Setup: see the "Booking form" section of README.md.
 */

// Where booking emails go. Add more addresses separated by commas if needed.
const TO = "publicstardrivingschool@gmail.com";

// Order of the fields in the email and the spreadsheet
const FIELDS = [
  "Full Name",
  "Phone",
  "Email",
  "Current Licence",
  "Package",
  "Preferred Date",
  "Preferred Time",
  "City",
  "Pick-up Address",
  "Message",
];

function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || "{}");

    // Spam bots fill the hidden field: say OK and do nothing
    if (data._honey) return reply({ success: true });

    const name = String(data["Full Name"] || "").trim();
    const phone = String(data["Phone"] || "").trim();
    if (!name || !phone) return reply({ success: false, message: "Missing name or phone" });

    logToSheet(data);
    sendEmail(data);
    return reply({ success: true });
  } catch (err) {
    console.error(err);
    return reply({ success: false, message: String(err) });
  }
}

// Visiting the web app URL in a browser shows this, which confirms it is deployed
function doGet() {
  return reply({ success: true, message: "Public Star booking endpoint is running." });
}

function sendEmail(data) {
  const subject = String(data.subject || "New booking request – " + (data["Full Name"] || "")).slice(0, 250);
  const rows = FIELDS.map(function (f) {
    return (
      '<tr><td style="padding:8px 12px;border:1px solid #e4e8ef;background:#f5f7fb;font-weight:bold;white-space:nowrap">' +
      esc(f) +
      '</td><td style="padding:8px 12px;border:1px solid #e4e8ef">' +
      esc(data[f] || "").replace(/\n/g, "<br>") +
      "</td></tr>"
    );
  }).join("");
  const phoneDigits = String(data["Phone"] || "").replace(/[^\d+]/g, "");
  const html =
    '<div style="font-family:Arial,sans-serif;font-size:14px;color:#1b2233">' +
    '<h2 style="color:#0E3B2E;margin:0 0 12px">New booking request</h2>' +
    '<table style="border-collapse:collapse">' + rows + "</table>" +
    '<p style="margin-top:16px">Reply to this email to answer the student' +
    (phoneDigits ? ', or call <a href="tel:' + esc(phoneDigits) + '">' + esc(data["Phone"]) + "</a>" : "") +
    ".</p></div>";

  const options = { to: TO, subject: subject, htmlBody: html, name: "Public Star website" };
  const studentEmail = String(data["Email"] || "").trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmail)) options.replyTo = studentEmail;
  MailApp.sendEmail(options);
}

function logToSheet(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return; // script not attached to a sheet: email only
  let sheet = ss.getSheetByName("Bookings");
  if (!sheet) {
    sheet = ss.insertSheet("Bookings");
    sheet.appendRow(["Received"].concat(FIELDS));
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, FIELDS.length + 1).setFontWeight("bold");
  }
  sheet.appendRow([new Date()].concat(FIELDS.map(function (f) { return data[f] || ""; })));
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

/**
 * Optional: run this once from the Apps Script editor (select it, press Run)
 * to send yourself a test email and approve the permissions.
 */
function sendTestEmail() {
  sendEmail({
    subject: "Test – Public Star booking form",
    "Full Name": "Test Student",
    Phone: "437-777-4494",
    Email: TO,
    Package: "Test",
    Message: "If you can read this, booking emails are working.",
  });
}
