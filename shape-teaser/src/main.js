import { E, clamp, prog, lerp, el, rng, W, H, P, COLORS } from './lib.js';
import s1 from './scenes/s1.js';
import s2 from './scenes/s2.js';
import s3 from './scenes/s3.js';
import s4 from './scenes/s4.js';
import s5 from './scenes/s5.js';

const SCENES = [s1, s2, s3, s4, s5];
const getJSON = async url => { try { const r = await fetch(url, { cache: 'no-store' }); return r.ok ? r.json() : null; } catch { return null; } };
const exists = async url => { try { const r = await fetch(url, { cache: 'no-store' }); return r.ok && (r.headers.get('content-type') || '').startsWith('image'); } catch { return false; } };

async function init() {
  document.documentElement.style.width = document.body.style.width = `${W}px`;
  document.documentElement.style.height = document.body.style.height = `${H}px`;
  const stage = document.getElementById('stage');
  const footage = (await getJSON('/p/assets/footage/manifest.json')) || {};
  const footageSpec = (await getJSON('/p/src/footage.json')).slots;
  const KEYS = ['mind-power', 'health', 'fitness', 'longevity', 'nutrition', 'aesthetics'];
  const icons = {}; for (const k of KEYS) icons[k] = await exists(`/p/assets/icons/${k}.png`);
  for (const w of ['400', '600', '700', '800']) await document.fonts.load(`${w} 40px Pop`);
  await document.fonts.load('500 20px JB'); await document.fonts.ready;

  // ---- persistent backdrop: SHAPE navy gradient, the big blue curve, grain, vignette
  const bg = el(stage, 'layer', { background: 'linear-gradient(135deg, #091F39 0%, #1C3D5A 55%, #3B6F91 100%)' });
  const curveSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  curveSvg.setAttribute('width', W); curveSvg.setAttribute('height', H); curveSvg.setAttribute('viewBox', `0 0 ${W} ${H}`); curveSvg.setAttribute('class', 'layer'); curveSvg.style.position = 'absolute'; curveSvg.style.inset = '0';
  curveSvg.innerHTML = `<defs><linearGradient id="cg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2E5A7A"/><stop offset="1" stop-color="#447CA0"/></linearGradient></defs><ellipse id="cv" fill="url(#cg)"/><ellipse id="cv2" fill="none" stroke="#7DB8E0" stroke-width="1.5"/>`;
  bg.appendChild(curveSvg);
  const cv = curveSvg.querySelector('#cv'), cv2 = curveSvg.querySelector('#cv2');
  const cv0 = P ? { cx: W * 0.5, cy: H * 1.12, rx: W * 1.05, ry: H * 0.46 } : { cx: W * 1.04, cy: H * 0.58, rx: W * 0.52, ry: H * 0.98 };

  const cuesAll = [], slots = [];
  let t = 0;
  const plan = SCENES.map(sc => { const p = { sc, t0: t, t1: t + sc.dur }; t += sc.dur; return p; });
  const total = t;
  const scenesLayer = el(stage, 'layer');
  const base = { footage, footageSpec, icons, slots, logo: '/p/assets/logo.png' };
  plan.forEach(p => {
    p.root = el(scenesLayer, 'layer');
    const ctx = { ...base, cue: (lt, type, o = {}) => cuesAll.push({ t: +(p.t0 + lt).toFixed(3), type, ...o }), t0: p.t0, dur: p.sc.dur };
    p.update = p.sc.build(p.root, ctx);
  });
  // grain + vignette on top
  const cvn = document.createElement('canvas'); cvn.width = cvn.height = 256;
  const gx = cvn.getContext('2d'), im = gx.createImageData(256, 256), r = rng(7);
  for (let i = 0; i < im.data.length; i += 4) { const v = Math.floor(r() * 255); im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
  gx.putImageData(im, 0, 0);
  el(stage, 'layer', { backgroundImage: `url(${cvn.toDataURL()})`, opacity: 0.04, mixBlendMode: 'overlay' });
  el(stage, 'layer', { background: 'radial-gradient(ellipse at center, rgba(9,31,57,0) 55%, rgba(9,31,57,.55) 100%)' });

  const FADE = 0.38;
  window.seek = async T => {
    // backdrop: curve fades in from the convergence and out at the end; slow periodic drift (identical at 0 and 60 s)
    const ca = 0.62 * E.outCubic(prog(T, 8, 1.5)) * (1 - E.outCubic(prog(T, total - 1.0, 0.8)));
    const dr = Math.sin(T * 2 * Math.PI / 60) * 22, dr2 = Math.cos(T * 4 * Math.PI / 60) * 12;
    for (const [e, k] of [[cv, 0.5], [cv2, 0.6]]) {
      e.setAttribute('cx', cv0.cx + dr * (P ? 0.4 : 1)); e.setAttribute('cy', cv0.cy + dr2); e.setAttribute('rx', cv0.rx * (e === cv2 ? 0.93 : 1)); e.setAttribute('ry', cv0.ry * (e === cv2 ? 0.93 : 1));
      e.style.opacity = (ca * (e === cv ? 0.55 : 0.45)).toFixed(3); void k;
    }
    const jobs = [];
    plan.forEach(p => {
      const a = p.sc.hardIn ? 0 : FADE / 2, b = p.sc.hardOut ? 0 : FADE / 2;
      const lt = T - p.t0, vis = lt >= -a - 1e-4 && lt <= p.sc.dur + b + 1e-4;
      p.root.style.display = vis ? '' : 'none';
      if (vis) {
        const fi = p.sc.hardIn ? 1 : clamp((lt + a) / FADE), fo = p.sc.hardOut ? 1 : clamp((p.sc.dur + b - lt) / FADE);
        p.root.style.opacity = (fi * fo).toFixed(3);
        jobs.push(p.update(lt));
      }
    });
    await Promise.all(jobs);
  };
  window.__duration = total; window.__fps = 30;
  window.__cues = cuesAll.sort((a, b) => a.t - b.t);
  window.__beats = plan.map(p => ({ id: p.sc.id, type: 'scene', t: p.t0, dur: p.sc.dur }));
  window.__hasFootage = Object.keys(footage).length > 0;
  window.__extra = { slots: slots.sort((a, b) => a.start - b.start), scenes: window.__beats };
  await window.seek(0);
}
window.__ready = init();
