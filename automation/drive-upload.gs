// Google Apps Script web app that receives a file from the daily GitHub Action
// and saves it into one Google Drive folder. Paste this into a new project at
// https://script.google.com — setup steps are in automation/README.md.
//
// Script properties (Project Settings -> Script properties):
//   FOLDER_ID     ID of the Drive folder to save into (the part after /folders/ in its URL)
//   UPLOAD_TOKEN  a long random string; the same value goes into the GitHub secret DRIVE_UPLOAD_TOKEN

function doPost(e) {
  try {
    const props = PropertiesService.getScriptProperties();
    const body = JSON.parse(e.postData.contents);

    if (!body.token || body.token !== props.getProperty('UPLOAD_TOKEN')) {
      return reply({ ok: false, error: 'unauthorized' });
    }

    const folder = DriveApp.getFolderById(props.getProperty('FOLDER_ID'));
    const blob = Utilities.newBlob(
      Utilities.base64Decode(body.data),
      body.mimeType || 'application/octet-stream',
      body.filename
    );

    // Re-running on the same day replaces that day's file instead of duplicating it.
    const existing = folder.getFilesByName(body.filename);
    while (existing.hasNext()) existing.next().setTrashed(true);

    const file = folder.createFile(blob);
    return reply({ ok: true, id: file.getId(), url: file.getUrl() });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  }
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
