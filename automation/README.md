# Daily QuickSight "User detail" export to Google Drive

Every day at **07:15 WIB** (00:15 UTC) a GitHub Action:

1. Signs in to QuickSight (`shpf-in-farmrise-analytics`) with a username and password.
2. Opens the dashboard, scrolls to the **User detail** table, opens its ⋮ menu and
   chooses **Export to Excel**.
3. Sends `user-detail-YYYY-MM-DD.xlsx` to your Google Drive folder.
4. If something fails, the run turns red (GitHub emails you) and a screenshot of the
   page goes to the same Drive folder.

The repository is public, so the Excel file and screenshots are never stored on GitHub.

## One-time setup (about 10 minutes)

### 1. Google Drive folder
Create a folder in Google Drive, e.g. **QuickSight exports**. Open it and copy the ID
from the address bar: `https://drive.google.com/drive/folders/<THIS-PART>`.

### 2. Apps Script that saves into the folder
1. Go to <https://script.google.com> → **New project**, name it *QuickSight Drive upload*.
2. Replace the code with the contents of [`drive-upload.gs`](drive-upload.gs). Save.
3. **Project Settings** (gear icon) → **Script properties** → add:
   - `FOLDER_ID` = the folder ID from step 1
   - `UPLOAD_TOKEN` = a long random password you make up (30+ characters)
4. **Deploy → New deployment** → type **Web app**:
   - *Execute as*: **Me**
   - *Who has access*: **Anyone** (the token keeps others out)
5. Click **Deploy**, allow the Drive permission it asks for, and copy the
   **Web app URL** (ends in `/exec`).

### 3. GitHub secrets
In the repo on GitHub: **Settings → Secrets and variables → Actions → New repository
secret**, and add these four:

| Name | Value |
|---|---|
| `QS_USERNAME` | your QuickSight username |
| `QS_PASSWORD` | your QuickSight password |
| `DRIVE_UPLOAD_URL` | the Web app URL from step 2 |
| `DRIVE_UPLOAD_TOKEN` | the `UPLOAD_TOKEN` from step 2 |

Secrets are hidden from logs and from people viewing the public repo.

### 4. First run
**Actions** tab → **QuickSight daily export** → **Run workflow**. The workflow file must
be on the default branch (`main`) for the button and the daily schedule to appear.

## Changing things
- **Time:** edit the `cron` line in `.github/workflows/quicksight-export.yml` (UTC;
  WIB = UTC+7).
- **Password changed:** update the `QS_PASSWORD` secret.
- **Apps Script code changed:** Deploy → Manage deployments → edit → *New version*
  (the URL stays the same).

## Running it on your own computer
```bash
cp automation/.env.example automation/.env   # fill in username and password
HEADED=1 npm run export:quicksight            # watch the browser click through
```
The file lands in `automation/downloads/`.
