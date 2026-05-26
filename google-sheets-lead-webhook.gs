const SPREADSHEET_ID = "1V2XOLEd9ORDwmfqBDtsrmQK4AK1xLIfytXhyIza8lLA";
const SHEET_NAME = "DAE Leads";

function doPost(event) {
  const sheet = getLeadSheet();
  const payload = JSON.parse(event.postData.contents || "{}");

  sheet.appendRow([
    new Date(),
    payload.firstName || "",
    payload.lastName || "",
    payload.email || "",
    payload.phone || "",
    payload.isPracticeOwner || "",
    payload.clinicName || "",
    payload.monthlyRevenue || "",
    payload.pageUrl || "",
    payload.submittedAt || "",
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getLeadSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Received At",
      "First Name",
      "Last Name",
      "Email",
      "Phone Number",
      "Dental Practice Owner",
      "Clinic Name",
      "Monthly Revenue",
      "Page URL",
      "Submitted At",
    ]);
  }

  return sheet;
}
