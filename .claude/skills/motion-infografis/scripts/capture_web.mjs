#!/usr/bin/env node
// Capture a web page (or one element of it) as a PNG asset for a motion project. The headless fallback for "screenshot it with Claude in Chrome".
//
//   node capture_web.mjs <url> <out.png> [--w 1280] [--h 800] [--scale 2] [--full] [--selector "article h1"] [--wait 1500] [--mobile] [--scroll 600]
//
// Use it only where the network can reach the page (a cloud sandbox often cannot). Public pages only: never a logged-in page, never private data.
// Needs scripts/setup.sh (playwright-core in ~/.cache/motion-infografis) and any Chrome/Chromium (CHROME_PATH overrides detection).
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CACHE = process.env.MOTION_CACHE || path.join(os.homedir(), '.cache', 'motion-infografis');
const require = createRequire(path.join(CACHE, 'package.json'));
const { chromium } = require('playwright-core');
const args = process.argv.slice(2);
const pos = args.filter((a, i) => !a.startsWith('--') && !(args[i - 1] || '').match(/^--(w|h|scale|selector|wait|scroll)$/));
const [url, out] = pos;
if (!url || !out) { console.error('usage: node capture_web.mjs <url> <out.png> [--w 1280] [--h 800] [--scale 2] [--full] [--selector css] [--wait ms] [--mobile] [--scroll px]'); process.exit(1); }
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i < 0 ? d : args[i + 1]?.startsWith('--') || args[i + 1] === undefined ? true : args[i + 1]; };
const mobile = !!opt('mobile', false);
const W = +opt('w', mobile ? 430 : 1280), H = +opt('h', mobile ? 900 : 800), scale = +opt('scale', 2);
const exe = [process.env.CHROME_PATH, ...(() => { try { return fs.readdirSync('/opt/pw-browsers').filter(d => d.startsWith('chromium-')).map(d => `/opt/pw-browsers/${d}/chrome-linux/chrome`); } catch { return []; } })(),
  '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome'].find(p => p && fs.existsSync(p));
if (!exe) { console.error('No Chrome/Chromium found. Set CHROME_PATH.'); process.exit(1); }
// behind an egress proxy (cloud sandbox): use HTTPS_PROXY; the proxy re-signs TLS, so Chromium must trust the proxy CA (CA_BUNDLE, default /root/.ccr/ca-bundle.crt).
// We trust that one CA by its SPKI hash; certificate verification stays ON for everything else.
const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
const caFile = process.env.CA_BUNDLE || '/root/.ccr/ca-bundle.crt';
const launchArgs = ['--force-color-profile=srgb'];
if (proxy && fs.existsSync(caFile)) {
  const { execSync } = await import('node:child_process');
  try {
    const pems = fs.readFileSync(caFile, 'utf8').match(/-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/g) || [];
    const hashes = pems.map(pem => execSync('openssl x509 -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl base64', { input: pem, stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim()).filter(Boolean);
    if (hashes.length) launchArgs.push(`--ignore-certificate-errors-spki-list=${hashes.join(',')}`);
  } catch { /* openssl missing: rely on the system store */ }
}
const browser = await chromium.launch({ executablePath: exe, args: launchArgs, ...(proxy ? { proxy: { server: proxy } } : {}) });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: scale, isMobile: mobile, locale: 'en-US' });
const page = await ctx.newPage();
try {
  const r = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(+opt('wait', 1500));
  // dismiss the usual cookie / consent banners so they do not end up in the asset
  for (const sel of ['button:has-text("Accept all")', 'button:has-text("Accept")', 'button:has-text("I agree")', '[aria-label="Close"]']) {
    await page.locator(sel).first().click({ timeout: 800 }).catch(() => {});
  }
  const sc = +opt('scroll', 0);
  if (sc) await page.evaluate(y => window.scrollTo(0, y), sc);
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  const selector = opt('selector', null);
  if (selector && selector !== true) await page.locator(selector).first().screenshot({ path: out });
  else await page.screenshot({ path: out, fullPage: !!opt('full', false) });
  console.log(`captured ${url} (HTTP ${r?.status()}) → ${out}  [${W}x${H} @${scale}x]`);
} catch (e) {
  console.error(`capture failed for ${url}: ${e.message.split('\n')[0]}`);
  process.exitCode = 2;
} finally { await browser.close(); }
