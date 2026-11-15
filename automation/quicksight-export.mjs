// Daily export of the "User detail" table from the FarmRise QuickSight dashboard.
//
// Flow:
//   1. Reuse a saved login session (auth/quicksight-state.json) if it is still valid.
//   2. Otherwise sign in with QuickSight credentials from env vars and save the session.
//   3. Open the dashboard sheet and wait for the visuals to finish loading.
//   4. Scroll to the "User detail" table at the bottom, hover it, open the
//      three-dot menu (top right of the visual) -> Export to Excel.
//   5. Save the file as downloads/user-detail-YYYY-MM-DD.xlsx.
//
// Run:  node automation/quicksight-export.mjs            (headless)
//       HEADED=1 node automation/quicksight-export.mjs   (watch it, useful the first time)
//
// Env vars (put them in automation/.env or your scheduler's secret store, never in git):
//   QS_ACCOUNT   QuickSight account name   (shpf-in-farmrise-analytics)
//   QS_USERNAME  QuickSight user name or email
//   QS_PASSWORD  QuickSight password
//   QS_OTP       optional, only if MFA is on: a 6-digit code (see README for TOTP)

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const STATE_FILE = path.join(HERE, 'auth', 'quicksight-state.json');
const OUT_DIR = path.join(HERE, 'downloads');
const SHOTS_DIR = path.join(HERE, 'screenshots');

const DASHBOARD_URL =
  'https://ap-south-1.quicksight.aws.amazon.com/sn/account/shpf-in-farmrise-analytics' +
  '/dashboards/63bd0601-26e9-4bfa-ab23-741db24b93d5' +
  '/views/8195860d-1a32-4cfb-985d-351f13a6876a';

const VISUAL_TITLE = /user detail/i; // title of the table at the bottom of the sheet

loadDotEnv(path.join(HERE, '.env'));

const today = new Date().toISOString().slice(0, 10);
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(SHOTS_DIR, { recursive: true });
fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });

const browser = await chromium.launch({ headless: !process.env.HEADED });
const context = await browser.newContext({
  acceptDownloads: true,
  viewport: { width: 1600, height: 1000 },
  storageState: fs.existsSync(STATE_FILE) ? STATE_FILE : undefined,
});
const page = await context.newPage();
page.setDefaultTimeout(60_000);

try {
  // ---- 1-2. Open dashboard, sign in if we were bounced to the login page ----
  await page.goto(DASHBOARD_URL, { waitUntil: 'domcontentloaded' });
  if (await isOnSignInPage(page)) {
    console.log('Session missing or expired, signing in...');
    await signIn(page);
    await context.storageState({ path: STATE_FILE });
    await page.goto(DASHBOARD_URL, { waitUntil: 'domcontentloaded' });
  }

  // ---- 3. Wait for the dashboard to render ----
  await page.waitForLoadState('networkidle', { timeout: 120_000 }).catch(() => {});
  const title = page.getByText(VISUAL_TITLE).first();

  // ---- 4. Scroll to the visual (QuickSight lazy-loads visuals below the fold) ----
  await scrollUntilVisible(page, title);
  // The visual container is the nearest ancestor that also holds the menu button.
  const visual = title.locator(
    'xpath=ancestor::*[.//*[@aria-label="Menu options" or @data-automation-id="analysis_visual_dropdown_menu_button"]][1]'
  );
  await visual.scrollIntoViewIfNeeded();
  await visual.hover();             // reveals the toolbar at the top right
  await page.waitForTimeout(500);

  const menuButton = visual
    .locator('[data-automation-id="analysis_visual_dropdown_menu_button"]')
    .or(visual.getByRole('button', { name: /menu options/i }))
    .first();
  await menuButton.click();

  // ---- 5. Export to Excel and save ----
  const exportItem = page.getByRole('menuitem', { name: /export to excel/i })
    .or(page.getByText(/export to excel/i))
    .first();
  // Some QuickSight versions nest it under an "Export" submenu.
  if (!(await exportItem.isVisible().catch(() => false))) {
    await page.getByRole('menuitem', { name: /^export/i }).first().hover();
  }
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 180_000 }), // large tables take a while
    exportItem.click(),
  ]);

  const target = path.join(OUT_DIR, `user-detail-${today}.xlsx`);
  await download.saveAs(target);
  console.log(`Saved ${target}`);
  await context.storageState({ path: STATE_FILE }); // refresh cookies for tomorrow
} catch (err) {
  const shot = path.join(SHOTS_DIR, `failure-${Date.now()}.png`);
  await page.screenshot({ path: shot, fullPage: true }).catch(() => {});
  console.error(`Export failed: ${err.message}\nScreenshot: ${shot}`);
  process.exitCode = 1;
} finally {
  await browser.close();
}

// ---------------------------------------------------------------------------

async function isOnSignInPage(page) {
  await page.waitForLoadState('domcontentloaded');
  return /signin|auth|login/i.test(page.url());
}

// QuickSight native sign-in: account name -> username -> password (-> MFA).
// Selectors are best guesses from the public sign-in page; confirm with HEADED=1.
async function signIn(page) {
  const { QS_ACCOUNT, QS_USERNAME, QS_PASSWORD, QS_OTP } = process.env;
  if (!QS_ACCOUNT || !QS_USERNAME || !QS_PASSWORD) {
    throw new Error('Set QS_ACCOUNT, QS_USERNAME and QS_PASSWORD to sign in.');
  }

  const account = page.locator('#account-name-input, input[name="accountName"]').first();
  if (await account.isVisible({ timeout: 10_000 }).catch(() => false)) {
    await account.fill(QS_ACCOUNT);
    await page.getByRole('button', { name: /next|continue/i }).first().click();
  }

  // Confirmed on the live page: "Sign in to shpf-in-farmrise-analytics" -> Username -> Next.
  await page.locator('#username-input').fill(QS_USERNAME);
  await page.locator('#username-submit-button').click();

  await page.locator('#password-input, input[type="password"]').first().fill(QS_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).first().click();

  const otp = page.locator('input[name*="mfa" i], input[autocomplete="one-time-code"]').first();
  if (await otp.isVisible({ timeout: 8_000 }).catch(() => false)) {
    if (!QS_OTP) throw new Error('MFA code requested but QS_OTP is not set.');
    await otp.fill(QS_OTP);
    await page.getByRole('button', { name: /submit|verify|sign in/i }).first().click();
  }

  await page.waitForURL(/\/sn\//, { timeout: 120_000 });
}

async function scrollUntilVisible(page, locator, maxScrolls = 30) {
  for (let i = 0; i < maxScrolls; i++) {
    if (await locator.isVisible().catch(() => false)) return;
    await page.mouse.move(800, 600);
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(1_000);
  }
  throw new Error('Could not find the "User detail" visual on the sheet.');
}

function loadDotEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}
