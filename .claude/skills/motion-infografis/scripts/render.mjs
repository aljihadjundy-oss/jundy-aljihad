#!/usr/bin/env node
// Render a motion-infografis project: static server → headless Chromium → seek(t) → screenshot → ffmpeg (H.264).
//
//   node render.mjs <project-dir>                    full video  → <project>/out/final.mp4
//   node render.mjs <project-dir> --stills 1,4.5,9   PNG stills  → <project>/out/stills/
//   node render.mjs <project-dir> --range 10,20      partial     → <project>/out/preview.mp4
//   node render.mjs <project-dir> --meta             timeline + cues only → <project>/out/meta.json
// Options: --workers 3  --crf 17  --no-audio
import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const RUNTIME = path.join(HERE, 'runtime');
const CACHE = process.env.MOTION_CACHE || path.join(os.homedir(), '.cache', 'motion-infografis');
const require = createRequire(path.join(CACHE, 'package.json'));
let chromium;
try { ({ chromium } = require('playwright-core')); } catch { console.error(`playwright-core not found in ${CACHE}. Run scripts/setup.sh first.`); process.exit(1); }

const args = process.argv.slice(2);
const PROJECT = path.resolve(args.find(a => !a.startsWith('--')) || '.');
const opt = (name, def) => { const i = args.indexOf(`--${name}`); if (i < 0) return def; const v = args[i + 1]; return v === undefined || v.startsWith('--') ? true : v; };
const WORKERS = +opt('workers', Math.max(1, Math.min(4, os.cpus().length - 1)));
const CRF = String(opt('crf', 17));
const OUT = path.join(PROJECT, 'out');
fs.mkdirSync(OUT, { recursive: true });

function findChrome() {
  const c = [process.env.CHROME_PATH, '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    ...(() => { try { return fs.readdirSync('/opt/pw-browsers').filter(d => d.startsWith('chromium-')).map(d => `/opt/pw-browsers/${d}/chrome-linux/chrome`); } catch { return []; } })(),
    '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    path.join(os.homedir(), 'AppData', 'Local', 'Google', 'Chrome', 'Application', 'chrome.exe')];
  return c.find(p => p && fs.existsSync(p));
}

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.gif': 'image/gif' };
const ROUTES = [['/rt/', RUNTIME], ['/p/', PROJECT], ['/fonts/', path.join(CACHE, 'node_modules', '@fontsource')]];
function serve() {
  const server = http.createServer((req, res) => {
    const u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = null;
    if (u === '/' || u === '/index.html') file = path.join(RUNTIME, 'index.html');
    for (const [pre, dir] of ROUTES) if (u.startsWith(pre)) { const f = path.join(dir, u.slice(pre.length)); if (f.startsWith(dir)) file = f; }
    if (!file || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(r => server.listen(0, '127.0.0.1', () => r(server)));
}

async function openPage(browser, url, W, H) {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('pageerror', e => { console.error('page error:', e.message); process.exitCode = 1; });
  page.on('console', m => { if (['error', 'warning'].includes(m.type()) && !m.text().includes('404')) console.error(`[${m.type()}]`, m.text()); });
  await page.goto(url);
  await page.evaluate(() => window.__ready);
  return page;
}

function run(cmd, a) { const r = spawnSync(cmd, a, { stdio: 'inherit' }); if (r.status !== 0) throw new Error(`${cmd} failed`); }

async function renderRange(page, fps, f0, f1, file, tick) {
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', CRF, '-pix_fmt', 'yuv420p', '-g', String(fps * 2),
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', file], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = f0; f < f1; f++) {
    await page.evaluate(t => window.seek(t), f / fps);
    const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    tick();
  }
  ff.stdin.end();
  await new Promise((res, rej) => ff.on('close', c => (c === 0 ? res() : rej(new Error(`ffmpeg exited ${c}`)))));
}

const proj = JSON.parse(fs.readFileSync(path.join(PROJECT, 'project.json'), 'utf8'));
const W = proj.canvas?.w ?? 1080, H = proj.canvas?.h ?? 1920, FPS = proj.canvas?.fps ?? 30;
const exe = findChrome();
if (!exe) { console.error('No Chrome/Chromium found. Set CHROME_PATH.'); process.exit(1); }
const server = await serve();
const url = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch({ executablePath: exe, args: ['--force-color-profile=srgb', '--disable-lcd-text', '--allow-file-access-from-files'] });
try {
  const page = await openPage(browser, url, W, H);
  const meta = await page.evaluate(() => ({ duration: window.__duration, fps: window.__fps, cues: window.__cues, beats: window.__beats, hasFootage: window.__hasFootage }));
  fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify(meta, null, 2));
  console.log(`duration ${meta.duration.toFixed(2)}s · ${meta.beats.length} beats · ${meta.cues.length} cues · footage: ${meta.hasFootage ? 'yes' : 'no'}`);
  if (opt('meta', false)) {
    // done
  } else if (opt('stills', false)) {
    const dir = path.join(OUT, 'stills');
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
    for (const t of String(opt('stills')).split(',').map(Number)) {
      await page.evaluate(x => window.seek(x), t);
      await page.screenshot({ path: path.join(dir, `t${t.toFixed(2).padStart(7, '0')}.png`) });
    }
    console.log('stills →', dir);
  } else {
    const range = opt('range', false);
    const [a, b] = range ? String(range).split(',').map(Number) : [0, meta.duration];
    const F0 = Math.round(a * FPS), F1 = Math.round(b * FPS);
    const n = Math.max(1, Math.min(WORKERS, Math.ceil((F1 - F0) / FPS)));
    const pages = [page];
    for (let i = 1; i < n; i++) pages.push(await openPage(browser, url, W, H));
    const chunk = Math.ceil((F1 - F0) / n);
    let done = 0;
    const t0 = Date.now();
    const tick = () => { done++; if (done % (FPS * 5) === 0 || done === F1 - F0) { const el = (Date.now() - t0) / 1000; process.stdout.write(`\r${done}/${F1 - F0} frames  ${(done / el).toFixed(1)} fps  eta ${((F1 - F0 - done) / (done / el)).toFixed(0)}s   `); } };
    const segs = pages.map((_, i) => path.join(OUT, `seg_${i}.mp4`));
    await Promise.all(pages.map((p, i) => renderRange(p, FPS, F0 + i * chunk, Math.min(F1, F0 + (i + 1) * chunk), segs[i], tick)));
    process.stdout.write('\n');
    const list = path.join(OUT, 'segs.txt');
    fs.writeFileSync(list, segs.map(s => `file '${s.replace(/'/g, "'\\''")}'`).join('\n'));
    const silent = path.join(OUT, 'video_silent.mp4');
    run('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', silent]);
    segs.forEach(s => fs.rmSync(s)); fs.rmSync(list);
    const final = path.join(OUT, range ? 'preview.mp4' : 'final.mp4');
    if (opt('no-audio', false)) fs.renameSync(silent, final);
    else {
      const wav = path.join(OUT, 'mix.wav');
      run(process.platform === 'win32' ? 'python' : 'python3', [path.join(HERE, 'mix_audio.py'), PROJECT, wav, String(a), String(b)]);
      run('ffmpeg', ['-y', '-loglevel', 'error', '-i', silent, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', final]);
      fs.rmSync(silent);
    }
    console.log(`→ ${final}  (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  }
} finally {
  await browser.close();
  server.close();
}
