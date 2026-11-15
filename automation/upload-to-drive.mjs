// Sends one or more files to the Google Drive folder behind the Apps Script web app
// (automation/drive-upload.gs).
//
// Usage: node automation/upload-to-drive.mjs <file> [more files...]
// Env:   DRIVE_UPLOAD_URL    the web app URL (https://script.google.com/macros/s/.../exec)
//        DRIVE_UPLOAD_TOKEN  the UPLOAD_TOKEN script property

import fs from 'node:fs';
import path from 'node:path';

const { DRIVE_UPLOAD_URL, DRIVE_UPLOAD_TOKEN } = process.env;
if (!DRIVE_UPLOAD_URL || !DRIVE_UPLOAD_TOKEN) {
  console.error('Set DRIVE_UPLOAD_URL and DRIVE_UPLOAD_TOKEN.');
  process.exit(1);
}

const MIME = {
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.png': 'image/png',
};

const files = process.argv.slice(2).filter((f) => fs.existsSync(f));
if (files.length === 0) {
  console.error('No files to upload.');
  process.exit(1);
}

let failed = false;
for (const file of files) {
  const filename = path.basename(file);
  const res = await fetch(DRIVE_UPLOAD_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: DRIVE_UPLOAD_TOKEN,
      filename,
      mimeType: MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      data: fs.readFileSync(file).toString('base64'),
    }),
    redirect: 'follow', // Apps Script answers via a redirect to googleusercontent.com
  });

  let result;
  try {
    result = await res.json();
  } catch {
    result = { ok: false, error: `HTTP ${res.status}, response was not JSON` };
  }

  if (result.ok) {
    console.log(`Uploaded ${filename} to Google Drive.`); // no URL: Actions logs are public
  } else {
    console.error(`Upload of ${filename} failed: ${result.error}`);
    failed = true;
  }
}
process.exit(failed ? 1 : 0);
