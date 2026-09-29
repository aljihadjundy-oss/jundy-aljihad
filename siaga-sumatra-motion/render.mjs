// Frame-by-frame renderer: static server → headless Chromium → seek(t) → screenshot → ffmpeg (H.264).
//
//   node render.mjs                       full video → out/siaga_sumatra_motion.mp4
//   node render.mjs --range 20,32         partial preview (seconds) → out/preview.mp4
//   node render.mjs --stills 1,5.5,12     PNG stills → out/stills/
//   node render.mjs --meta                timeline + cues only → out/meta.json
//
// Options: --fps 30  --workers 3  --crf 16  --no-audio
import { chromium } from 'playwright-core';
import { spawn, spawnSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, 'out');
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  if (i < 0) return def;
  const v = args[i + 1];
  return v === undefined || v.startsWith('--') ? true : v;
};
const FPS = +opt('fps', 30);
const WORKERS = +opt('workers', 3);
const CRF = String(opt('crf', 16));

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };

function serve() {
  const server = http.createServer((req, res) => {
    const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': MIME[path.extname(p).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(p).pipe(res);
  });
  return new Promise(r => server.listen(0, '127.0.0.1', () => r(server)));
}

async function openPage(browser, url) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => { console.error('page error:', e.message); process.exitCode = 1; });
  page.on('console', m => { if (m.type() === 'error' && !m.text().includes('404')) console.error('console:', m.text()); });
  await page.goto(url);
  await page.evaluate(() => window.__ready);
  return page;
}

async function renderRange(page, f0, f1, file, onFrame) {
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', CRF, '-pix_fmt', 'yuv420p', '-g', String(FPS * 2),
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', file], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = f0; f < f1; f++) {
    await page.evaluate(t => window.seek(t), f / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    onFrame();
  }
  ff.stdin.end();
  await new Promise((res, rej) => ff.on('close', c => (c === 0 ? res() : rej(new Error(`ffmpeg exited ${c}`)))));
}

const server = await serve();
const url = `http://127.0.0.1:${server.address().port}/src/index.html`;
const browser = await chromium.launch({ executablePath: CHROME, args: ['--force-color-profile=srgb', '--disable-lcd-text'] });
fs.mkdirSync(OUT, { recursive: true });

try {
  const page = await openPage(browser, url);
  const meta = await page.evaluate(() => ({ duration: window.__duration, timeline: window.__timeline, cues: window.__cues, missing: window.__missing }));
  fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify(meta, null, 2));
  console.log(`duration ${meta.duration.toFixed(2)}s, ${meta.timeline.length} scenes, ${meta.cues.length} cues` +
    (meta.missing.length ? `; placeholder screenshots: ${meta.missing.join(', ')}` : ''));

  if (opt('meta', false)) {
    // done
  } else if (opt('stills', false)) {
    const dir = path.join(OUT, 'stills');
    fs.mkdirSync(dir, { recursive: true });
    for (const t of String(opt('stills')).split(',').map(Number)) {
      await page.evaluate(x => window.seek(x), t);
      await page.screenshot({ path: path.join(dir, `t${t.toFixed(2).padStart(6, '0')}.png`) });
    }
    console.log('stills →', dir);
  } else {
    const range = opt('range', false);
    const [a, b] = range ? String(range).split(',').map(Number) : [0, meta.duration];
    const F0 = Math.round(a * FPS), F1 = Math.round(b * FPS);
    const n = Math.max(1, Math.min(WORKERS, Math.ceil((F1 - F0) / FPS)));
    const pages = [page];
    for (let i = 1; i < n; i++) pages.push(await openPage(browser, url));
    const chunk = Math.ceil((F1 - F0) / n);
    let done = 0;
    const t0 = Date.now();
    const tick = () => {
      done++;
      if (done % (FPS * 5) === 0 || done === F1 - F0) {
        const el = (Date.now() - t0) / 1000;
        process.stdout.write(`\r${done}/${F1 - F0} frames  ${(done / el).toFixed(1)} fps  eta ${((F1 - F0 - done) / (done / el)).toFixed(0)}s   `);
      }
    };
    const segs = pages.map((_, i) => path.join(OUT, `seg_${i}.mp4`));
    await Promise.all(pages.map((p, i) => renderRange(p, F0 + i * chunk, Math.min(F1, F0 + (i + 1) * chunk), segs[i], tick)));
    process.stdout.write('\n');
    const list = path.join(OUT, 'segs.txt');
    fs.writeFileSync(list, segs.map(s => `file '${s}'`).join('\n'));
    const silent = path.join(OUT, range ? 'preview_silent.mp4' : 'video_silent.mp4');
    const run = (cmd, a) => { const r = spawnSync(cmd, a, { stdio: 'inherit' }); if (r.status !== 0) throw new Error(`${cmd} failed`); };
    run('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', silent]);
    segs.forEach(s => fs.rmSync(s));
    fs.rmSync(list);
    const final = path.join(OUT, range ? 'preview.mp4' : 'siaga_sumatra_motion.mp4');
    if (opt('no-audio', false)) {
      fs.renameSync(silent, final);
    } else {
      const wav = path.join(OUT, 'audio.wav');
      run('python3', [path.join(ROOT, 'tools', 'synth_audio.py'), path.join(OUT, 'meta.json'), wav, String(a), String(b)]);
      run('ffmpeg', ['-y', '-loglevel', 'error', '-i', silent, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
        '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', final]);
      fs.rmSync(silent);
    }
    console.log(`→ ${final}  (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  }
} finally {
  await browser.close();
  server.close();
}
