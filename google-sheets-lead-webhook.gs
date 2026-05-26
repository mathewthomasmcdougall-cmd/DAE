const SHEET_NAME = "DAE Leads";

function doPost(event) {
  const sheet = getLeadSheet();
  const payload = JSON.parse(event.postData.contents || "{}");

  sheet.appendRow([
    new Date(),
    payload.firstName || "",
    payload.lastName || "",
    payload.clinicName || "",
    payload.monthlyAdSpend || "",
    payload.pageUrl || "",
    payload.submittedAt || "",
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getLeadSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Received At",
      "First Name",
      "Last Name",
      "Clinic Name",
      "Rough Monthly Ad Spend",
      "Page URL",
      "Submitted At",
    ]);
  }

  return sheet;
}
