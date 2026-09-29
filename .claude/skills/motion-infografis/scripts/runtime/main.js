import { h, E, prog, pose, place } from './engine.js';
import { buildBackground, buildChrome } from './layers.js';
import { buildFootage } from './footage.js';
import { buildCaptions } from './captions.js';
import { headline } from './components.js';
import { BEATS } from './beats/index.js';
import { PALETTES, applyPalette } from './palettes.js';

const PROJ = '/p/';
const asset = src => (/^(https?:|data:|\/)/.test(src) ? src : PROJ + src);
const NO_HEADER = new Set(['title', 'quote', 'cta', 'chapter', 'lowerthird']);
const TEXTY = new Set(['title', 'quote', 'cta', 'chapter', 'image', 'custom']);
const GROWABLE = new Set(['list', 'checklist', 'flow', 'stepper', 'bars']); // height-bound types that may scale up to fill a sparse screen

function loadImg(src) {
  return new Promise(res => {
    const img = new Image();
    img.onload = () => img.decode().then(() => res(img), () => res(img));
    img.onerror = () => res(null);
    img.src = src;
  });
}
async function getJSON(url) {
  const r = await fetch(url, { cache: 'no-store' });
  return r.ok ? r.json() : null;
}

async function init() {
  const proj = await getJSON(PROJ + 'project.json');
  if (!proj) throw new Error('project.json not found');
  const cv = { w: 1080, h: 1920, fps: 30, ...(proj.canvas || {}) };
  const W = cv.w, H = cv.h, S = Math.min(W, H) / 1080;
  const stage = document.getElementById('stage');
  Object.assign(document.body.style, { width: `${W}px`, height: `${H}px` });
  Object.assign(stage.style, { width: `${W}px`, height: `${H}px` });

  // brand → CSS tokens + font
  // locked default palette "jundy" (the user's site); brand.palette picks another library palette, brand keys override
  const brand = { ...(PALETTES[proj.brand?.palette] ?? PALETTES.jundy), font: 'plus-jakarta-sans', ...(proj.brand || {}) };
  const root = document.documentElement.style;
  applyPalette(root, brand);
  const css = [400, 500, 600, 700, 800].map(w => `@font-face{font-family:"BrandFont";font-weight:${w};src:url("/fonts/${brand.font}/files/${brand.font}-latin-${w}-normal.woff2") format("woff2");}`).join('')
    // display serif for kinetic / annotate words (installed by setup.sh; falls back to a system serif)
    + ['normal', 'italic'].map(st => `@font-face{font-family:"SerifFont";font-weight:400;font-style:${st};src:url("/fonts/${brand.serif ?? 'dm-serif-display'}/files/${brand.serif ?? 'dm-serif-display'}-latin-400-${st}.woff2") format("woff2");}`).join('');
  h('style', null, document.head, css);
  const probe = h('div', 'abs', document.body, [400, 500, 600, 700, 800].map(w => `<span style="font-weight:${w}">a</span>`).join('')
    + '<span style="font-family:SerifFont">a</span><span style="font-family:SerifFont;font-style:italic">a</span>');
  probe.style.opacity = '0';

  const footageMeta = proj.footage ? await getJSON(PROJ + 'footage/footage.json') : null;
  const capCfg = { enabled: true, ...(proj.captions || {}) };
  const allWords = await getJSON(PROJ + (capCfg.words || 'transcript/words.json')); // also used by kinetic beats
  const words = footageMeta && capCfg.enabled ? allWords : null;

  const aspects = {};
  const srcs = new Set((proj.beats || []).filter(b => b.src).map(b => b.src));
  if (proj.chrome?.logo) srcs.add(proj.chrome.logo);
  for (const src of srcs) { const im = await loadImg(asset(src)); aspects[src] = im ? im.naturalHeight / im.naturalWidth : 1; }
  await document.fonts.ready;

  const beatsEnd = Math.max(0, ...(proj.beats || []).map(b => b.t + b.dur));
  const total = proj.duration ?? footageMeta?.duration ?? beatsEnd + 0.6;

  // zones (all numbers scale with S so 4:5 / 16:9 canvases stay proportional)
  const m = Math.round(72 * S);
  const top = Math.round(Math.max(0.135 * H, 250 * S));
  const captionsY = Math.round((capCfg.y ?? 0.775) * H);
  const bottom = words && capCfg.when !== 'split' ? captionsY - Math.round(28 * S) : Math.round(0.82 * H);
  // footage that already carries text (burned-in subtitles): overlay cards stay above this line
  const overlayBottom = proj.layout?.overlayBottom != null ? Math.min(bottom, Math.round(proj.layout.overlayBottom * H)) : bottom;
  const pip = { w: Math.round(0.3 * W), h: Math.round(0.3 * H), x: 0, y: top, r: Math.round(34 * S) };
  pip.x = W - m - pip.w;
  // split mode: top panel for a screen/graphic, bottom panel shows the face window of the footage
  const split = { seam: Math.round((proj.layout?.seam ?? 0.5) * H), focus: proj.layout?.splitFocus ?? 0.33, zoom: proj.layout?.splitZoom ?? 1 };

  const bg = buildBackground(stage, W, H, brand);
  const footage = footageMeta ? buildFootage(stage, W, H, footageMeta, i => `${PROJ}footage/frames/${String(i).padStart(6, '0')}.jpg`, pip, split) : null;
  const beatsLayer = h('div', 'layer', stage);
  const fxLayer = h('div', 'layer', stage); // transitions: above captions and chrome (moved to the end below)
  const cues = [];

  const beats = (proj.beats || []).map((b0, i) => {
    const def = BEATS[b0.type];
    if (!def) throw new Error(`unknown beat type "${b0.type}" (beat ${i})`);
    const b = { ...def.defaults, ...b0 };
    if (!footage && b.mode !== 'overlay') b.mode = 'full';
    if (!footage && b.mode === 'overlay' && !def.defaults.free) b.mode = 'full';
    // a beat that reaches the end of the video holds to the last frame: no exit fade, no PiP springing back mid-frame
    if (b.t + b.dur >= total - 0.3) b.dur = total - b.t + 60;
    return { b, def, i };
  });

  for (const it of beats) {
    const { b, def } = it;
    const layer = h('div', 'layer', def.defaults.onTop ? fxLayer : beatsLayer);
    if (b.palette && PALETTES[b.palette]) applyPalette(layer.style, PALETTES[b.palette]); // per-part palette for variety
    const t0 = b.mode === 'overlay' ? 0.2 : 0.55;
    const OUT = b.dur - 0.45;
    const ctx = {
      W, H, S, m, mode: b.mode, t0, OUT, dur: b.dur, captionsY, locale: proj.locale || 'id-ID', brand,
      asset, aspect: src => aspects[src] ?? 1, root: layer, panel: { x: 0, y: 0, w: W, h: split.seam }, seam: split.seam,
      words: allWords, beatT: b.t, hasFootage: !!footage,
      cue: (lt, type, opt = {}) => cues.push({ t: +(b.t + lt).toFixed(3), type, ...opt }),
    };
    // header (kicker + title) for data beats
    let head = null, headUpd = null, headH = 0;
    const hasHead = !NO_HEADER.has(b.type) && (b.title || b.kicker);
    const box = h('div', 'abs', layer);
    if (def.defaults.free) {
      it.update = def.build(layer, b, ctx);
      it.layer = layer; it.box = box;
      continue;
    }
    let zone;
    if (b.mode === 'overlay') {
      zone = { x: m, y: top, w: W - 2 * m, h: overlayBottom - top };
      if (b.glass !== false) { box.className = 'glass'; box.style.padding = `${32 * S}px`; }
      place(box, zone.x, 0, zone.w);
      ctx.zone = { ...zone, w: zone.w - (b.glass !== false ? 64 * S : 0) };
      if (hasHead) { // header lives inside the card when floating over footage
        let kick = null;
        if (b.kicker) { kick = h('div', 'kicker', box, b.kicker); kick.style.marginBottom = `${10 * S}px`; }
        const hl = b.title ? headline(box, b.title, { flow: true, size: (b.titleSize ?? 44) * S, w: ctx.zone.w }) : null;
        if (hl) hl.el.style.marginBottom = `${22 * S}px`;
        headUpd = lt => {
          if (kick) { const k = E.outExpo(prog(lt, t0 - 0.1, 0.8)); pose(kick, { y: 16 * (1 - k), o: k }); }
          if (hl) hl.update(lt, t0 - 0.05, null);
        };
      }
    } else {
      const headW = b.mode === 'insert' ? W - 2 * m - pip.w - 28 * S : W - 2 * m;
      if (hasHead) {
        head = h('div', 'abs', layer);
        place(head, m, top + 10 * S, headW);
        let kick = null;
        if (b.kicker) { kick = h('div', 'kicker', head, b.kicker); kick.style.marginBottom = `${12 * S}px`; }
        const hl = b.title ? headline(head, b.title, { flow: true, size: (b.titleSize ?? (b.mode === 'insert' ? 58 : 70)) * S, w: headW }) : null;
        headUpd = lt => {
          if (kick) { const k = E.outExpo(prog(lt, t0 - 0.1, 0.8)), x = E.inCubic(prog(lt, OUT, 0.4)); pose(kick, { y: 20 * (1 - k) - 20 * x, o: k * (1 - x) }); }
          if (hl) hl.update(lt, t0 - 0.05, OUT);
        };
        headH = head.offsetHeight;
      }
      const mainTop = b.mode === 'insert' ? Math.max(pip.y + pip.h + 40 * S, hasHead ? top + headH + 48 * S : 0) : (hasHead ? top + headH + (b.mode === 'split' ? 36 : 56) * S : top);
      const zoneBottom = b.mode === 'split' ? split.seam - Math.round(48 * S) : bottom;
      zone = { x: m, y: mainTop, w: W - 2 * m, h: zoneBottom - mainTop };
      ctx.zone = zone;
      place(box, zone.x, zone.y, zone.w);
    }
    const mod = def.async ? await def.load(b, ctx) : null;
    // content scale: larger on dedicated (insert/full) screens; shrink and rebuild until it fits its zone
    let F = b.scale ?? (TEXTY.has(b.type) ? 1 : b.mode === 'overlay' ? 0.95 : 1.3);
    let pend = [], content = null, bh = 0, grown = false;
    const canGrow = GROWABLE.has(b.type) && b.mode !== 'overlay' && b.scale == null;
    for (let attempt = 0; attempt < 5; attempt++) {
      pend = [];
      content = h('div', null, box);
      content.style.position = 'relative';
      const c2 = { ...ctx, S: S * F, F, cue: (lt, type, opt = {}) => pend.push({ t: +(b.t + lt).toFixed(3), type, ...opt }) };
      it.update = def.build(content, b, c2, mod);
      bh = box.offsetHeight;
      const tooBig = bh > zone.h && F >= 0.45;
      const tooSmall = canGrow && !grown && bh < 0.55 * zone.h; // sparse content on a dedicated screen: fill more of it
      if (!tooBig && !tooSmall) break;
      if (tooBig) F *= Math.max(0.6, (zone.h / bh) * 0.97);
      else { F *= Math.min(1.4, (0.75 * zone.h) / bh); grown = true; }
      content.remove();
    }
    cues.push(...pend);
    // vertical placement once the content has a size
    if (b.mode === 'overlay') {
      const y = b.pos === 'top' ? top : b.pos === 'center' ? Math.round((top + overlayBottom) / 2 - bh / 2) : overlayBottom - bh;
      box.style.top = `${y}px`;
    } else if (b.align !== 'top') {
      box.style.top = `${Math.round(zone.y + Math.max(0, (zone.h - bh) / 2))}px`;
    }
    if (bh > zone.h + 4) console.warn(`beat ${it.i} (${b.type}) content ${bh}px taller than its zone ${Math.round(zone.h)}px — trim items or shorten text`);
    Object.assign(it, { layer, box, head, headUpd, overlayGlass: b.mode === 'overlay' && b.glass !== false });
  }

  // footage state windows (adjacent insert/full beats merge so the PiP does not bounce)
  const windows = mode => {
    const iv = beats.filter(x => x.b.mode === mode).map(x => [x.b.t, x.b.t + x.b.dur]).sort((a, b) => a[0] - b[0]);
    const out = [];
    for (const v of iv) { const l = out[out.length - 1]; if (l && v[0] - l[1] < 1.0) l[1] = Math.max(l[1], v[1]); else out.push([...v]); }
    return out;
  };
  const insertW = footage ? windows('insert') : [], fullW = footage ? windows('full') : [], splitW = footage ? windows('split') : [];
  // the chrome (progress bar, badge) steps aside over a screen in split mode and over kinetic typography scenes
  const kinW = beats.filter(x => x.b.type === 'kinetic' && x.b.chrome !== true).map(x => [x.b.t, x.b.t + x.b.dur]);
  const chromeHideSplit = proj.chrome?.hideInSplit !== false;
  const kinCapW = beats.filter(x => x.b.type === 'kinetic' && x.b.captions !== true).map(x => [x.b.t + 0.1, x.b.t + x.b.dur + 0.1]);
  const kOf = (T, ws) => Math.max(0, ...ws.map(([a, b]) => prog(T, a - 0.15, 0.6) * (1 - prog(T, b - 0.35, 0.6))));
  insertW.forEach(([a, b]) => { cues.push({ t: a - 0.1, type: 'whoosh', gain: 0.7 }); cues.push({ t: b - 0.3, type: 'swoosh', gain: 0.5 }); });
  fullW.forEach(([a, b]) => { cues.push({ t: a - 0.1, type: 'whoosh', gain: 0.8 }); cues.push({ t: b - 0.3, type: 'swoosh', gain: 0.5 }); });
  splitW.forEach(([a, b]) => { cues.push({ t: a - 0.1, type: 'whoosh', gain: 0.6 }); cues.push({ t: b - 0.3, type: 'swoosh', gain: 0.45 }); });
  // zoom beats: punch-in ("cut"), eased push ("smooth") or a slow drift ("slow") on the full-frame footage
  const zoomBeats = beats.filter(x => x.b.type === 'zoom').map(x => x.b);
  const zoomAt = T => {
    let best = null, bk = 0;
    for (const z of zoomBeats) {
      const lt = T - z.t;
      if (lt < 0 || lt > z.dur) continue;
      const ease = z.ease ?? 'cut';
      let k;
      if (ease === 'slow') k = E.inOutCubic(prog(lt, 0, z.dur));
      else {
        const din = z.in ?? (ease === 'cut' ? 0 : 0.45), dout = z.out ?? (ease === 'cut' ? 0 : 0.45);
        const a = din ? E.outCubic(prog(lt, 0, din)) : 1;
        const x = dout ? E.inOutCubic(prog(lt, z.dur - dout, dout)) : 0;
        k = a * (1 - x);
      }
      if (k >= bk) { bk = k; best = { z: 1 + ((z.z ?? 1.18) - 1) * k, fx: z.fx ?? 0.5, fy: z.fy ?? 0.38 }; }
    }
    return best;
  };

  const captions = words ? buildCaptions(stage, W, H, words, capCfg, splitW.length ? split : null) : null;
  const chrome = proj.chrome !== false ? buildChrome(stage, W, H, proj.chrome || {}, asset, total) : null;
  stage.appendChild(fxLayer);
  const chapters = beats.filter(x => x.b.type === 'chapter').map(x => ({ num: x.b.num, name: x.b.label ?? x.b.name, start: x.b.t }));

  window.seek = async T => {
    bg.update(T);
    for (const it of beats) {
      const lt = T - it.b.t;
      const vis = lt >= -0.2 && lt <= it.b.dur + 0.1;
      it.layer.style.display = vis ? '' : 'none';
      if (!vis) continue;
      if (it.headUpd) it.headUpd(lt);
      if (it.overlayGlass) {
        const k = E.outExpo(prog(lt, 0.05, 0.7)), x = E.inCubic(prog(lt, it.b.dur - 0.4, 0.4));
        pose(it.box, { y: 40 * (1 - k) - 20 * x, o: k * (1 - x) });
      }
      it.update(lt);
    }
    const splitK = kOf(T, splitW);
    if (footage) await footage.update(T, kOf(T, insertW), kOf(T, fullW), splitK, zoomAt(T));
    // kinetic scenes already show the spoken words, so captions step aside (kinetic `captions: true` keeps them)
    if (captions) captions.update(T, kOf(T, kinCapW), splitK);
    if (chrome) {
      const ch = [...chapters].reverse().find(c => T >= c.start) || null;
      chrome.update(T, ch, Math.max(chromeHideSplit ? splitK : 0, kOf(T, kinW)));
    }
  };
  window.__duration = total;
  window.__fps = cv.fps;
  window.__cues = cues.sort((a, b) => a.t - b.t);
  window.__beats = beats.map(x => ({ i: x.i, type: x.b.type, mode: x.b.mode, t: x.b.t, dur: x.b.dur }));
  window.__hasFootage = !!footage;
  await window.seek(0);
}

window.__ready = init();
