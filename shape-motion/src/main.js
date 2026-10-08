import { E, clamp, prog, lerp, h, W, H, el, mono, pad2, rng } from './lib.js';
import opening from './scenes/s1_open.js';
import words from './scenes/s2_words.js';
import question from './scenes/s3_question.js';
import map from './scenes/s4_map.js';
import themes from './scenes/s5_themes.js';
import numbers from './scenes/s6_numbers.js';
import road from './scenes/s7_road.js';
import partners from './scenes/s8_partners.js';
import close from './scenes/s9_close.js';

const SCENES = [opening, words, question, map, themes, numbers, road, partners, close];

async function getJSON(url) { try { const r = await fetch(url, { cache: 'no-store' }); return r.ok ? r.json() : null; } catch { return null; } }

async function init() {
  const stage = document.getElementById('stage');
  const content = await getJSON('/p/assets/content.json');
  const footage = (await getJSON('/p/assets/footage/manifest.json')) || {};
  const seaDots = await getJSON('/p/assets/sea_dots.json');
  await document.fonts.load('900 40px Mont'); await document.fonts.load('800 40px Mont'); await document.fonts.load('600 40px Mont');
  await document.fonts.load('500 20px Plex'); await document.fonts.load('italic 40px Serif');
  await document.fonts.ready;

  // ---- persistent backdrop: near-black navy, drifting blue glow, hairline grid, grain
  const bg = el(stage, 'layer', { background: 'var(--bg)' });
  const glow1 = el(bg, 'abs', { width: '1500px', height: '1500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,104,136,.34) 0%, rgba(5,14,26,0) 66%)' });
  const glow2 = el(bg, 'abs', { width: '1200px', height: '1200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(24,56,88,.55) 0%, rgba(5,14,26,0) 68%)' });
  const grid = el(bg, 'layer', { backgroundImage: 'linear-gradient(rgba(140,200,234,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(140,200,234,.035) 1px, transparent 1px)', backgroundSize: '120px 120px' });
  const cv = document.createElement('canvas'); cv.width = cv.height = 256;
  const gx = cv.getContext('2d'), im = gx.createImageData(256, 256), r = rng(7);
  for (let i = 0; i < im.data.length; i += 4) { const v = Math.floor(r() * 255); im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
  gx.putImageData(im, 0, 0);
  el(bg, 'layer', { backgroundImage: `url(${cv.toDataURL()})`, opacity: 0.045, mixBlendMode: 'overlay' });

  // ---- timeline
  let t = 0;
  const plan = SCENES.map(sc => { const p = { sc, t0: t, t1: t + sc.dur }; t += sc.dur; return p; });
  const total = t;
  const cues = [], slots = [];
  const scenesLayer = el(stage, 'layer');
  const base = { content, footage, seaDots, slots, logo: '/p/assets/logo.png' };
  plan.forEach(p => {
    p.root = el(scenesLayer, 'layer');
    const ctx = { ...base, cue: (lt, type, o = {}) => cues.push({ t: +(p.t0 + lt).toFixed(3), type, ...o }), t0: p.t0, dur: p.sc.dur };
    p.update = p.sc.build(p.root, ctx);
  });

  // ---- HUD: corner brackets, top-left label, timecode, section index, progress
  const hud = el(stage, 'layer');
  const L = (x, y, rx, ry) => el(hud, 'abs', { left: `${x}px`, top: `${y}px`, width: '34px', height: '34px', border: '0 solid rgba(140,200,234,.55)',
    borderTopWidth: ry === 0 ? '2px' : 0, borderBottomWidth: ry === 1 ? '2px' : 0, borderLeftWidth: rx === 0 ? '2px' : 0, borderRightWidth: rx === 1 ? '2px' : 0 });
  L(44, 40, 0, 0); L(W - 78, 40, 1, 0); L(44, H - 74, 0, 1); L(W - 78, H - 74, 1, 1);
  const tl = mono(hud, 'SHAPE INDONESIA · EXPO 2027', 100, 44, { size: 15, color: 'rgba(140,200,234,.8)', ls: 0.22 });
  const tr = mono(hud, '', W - 420, 44, { size: 15, w: 320, align: 'right', color: 'rgba(140,200,234,.8)', ls: 0.22 });
  const bl = mono(hud, '', 100, H - 70, { size: 15, color: 'rgba(140,200,234,.8)', ls: 0.22 });
  const brLabel = mono(hud, 'ROAD TO SHAPE', W - 560, H - 70, { size: 15, w: 320, align: 'right', color: 'rgba(140,200,234,.6)', ls: 0.22 });
  const brNum = mono(hud, '000%', W - 220, H - 70, { size: 15, w: 120, align: 'right', color: 'var(--ice)', ls: 0.12 });
  const bar = el(hud, 'abs', { left: `${W - 560}px`, top: `${H - 44}px`, width: '460px', height: '2px', background: 'rgba(140,200,234,.18)' });
  const barFill = el(bar, 'abs', { inset: 0, background: 'var(--ice)', transformOrigin: '0 50%' });

  const FADE = 0.35;
  window.seek = async T => {
    // backdrop drift
    glow1.style.transform = `translate3d(${(-300 + Math.sin(T * 0.11) * 160).toFixed(1)}px,${(-420 + Math.cos(T * 0.08) * 120).toFixed(1)}px,0)`;
    glow2.style.transform = `translate3d(${(1000 + Math.cos(T * 0.09) * 140).toFixed(1)}px,${(380 + Math.sin(T * 0.07) * 120).toFixed(1)}px,0)`;
    const jobs = [];
    let cur = plan[plan.length - 1];
    plan.forEach((p, i) => {
      const lt = T - p.t0, vis = lt >= -1e-4 && lt <= p.sc.dur + 1e-4;
      p.root.style.display = vis ? '' : 'none';
      if (vis) {
        const fi = p.sc.hardIn ? 1 : clamp(lt / FADE), fo = p.sc.hardOut ? 1 : clamp((p.sc.dur - lt) / FADE);
        p.root.style.opacity = (fi * fo).toFixed(3);
        jobs.push(p.update(lt));
        cur = p;
      }
    });
    await Promise.all(jobs);
    const idx = plan.indexOf(cur);
    const hudK = E.outExpo(prog(T, 1.2, 1.0)) * (1 - E.inCubic(prog(T, total - 1.2, 1.0)));
    hud.style.opacity = hudK.toFixed(3);
    const sec = Math.floor(T), ms = Math.floor((T % 1) * 30);
    tr.textContent = `TC ${pad2(Math.floor(sec / 60))}:${pad2(sec % 60)}:${pad2(ms)}`;
    bl.textContent = `${pad2(idx + 1)} / ${pad2(plan.length)} — ${cur.sc.name}`;
    brNum.textContent = `${String(Math.round(clamp(T / total) * 100)).padStart(3, '0')}%`;
    barFill.style.transform = `scaleX(${clamp(T / total).toFixed(4)})`;
  };
  window.__duration = total;
  window.__fps = 30;
  window.__cues = cues.sort((a, b) => a.t - b.t);
  window.__beats = plan.map(p => ({ id: p.sc.id, type: 'scene', t: p.t0, dur: p.sc.dur }));
  window.__hasFootage = Object.keys(footage).length > 0;
  window.__extra = { slots: slots.sort((a, b) => a.start - b.start), scenes: window.__beats };
  await window.seek(0);
}
window.__ready = init();
