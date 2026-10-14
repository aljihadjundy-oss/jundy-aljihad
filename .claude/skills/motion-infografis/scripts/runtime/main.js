import { h, E, prog, pose, place } from './engine.js';
import { buildBackground, buildChrome } from './layers.js';
import { buildFootage, buildPerson, buildCard } from './footage.js';
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
  const mono = brand.mono ?? 'space-mono';
  const css2 = css + [400, 700].map(w => `@font-face{font-family:"MonoFont";font-weight:${w};src:url("/fonts/${mono}/files/${mono}-latin-${w}-normal.woff2") format("woff2");}`).join('');
  h('style', null, document.head, css2);
  const probe = h('div', 'abs', document.body, [400, 500, 600, 700, 800].map(w => `<span style="font-weight:${w}">a</span>`).join('')
    + '<span style="font-family:SerifFont">a</span><span style="font-family:SerifFont;font-style:italic">a</span><span class="mono">a</span><span class="mono" style="font-weight:700">a</span>');
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
  // overlay titles / insert headers start here; layout.overlayTop raises it for tight close-ups where the hair starts near the top
  const top = proj.layout?.overlayTop != null ? Math.round(proj.layout.overlayTop * H) : Math.round(Math.max(0.135 * H, 250 * S));
  const captionsY = Math.round((capCfg.y ?? 0.775) * H);
  const bottom = words && capCfg.when !== 'split' ? captionsY - Math.round(28 * S) : Math.round(0.82 * H);
  // footage that already carries text (burned-in subtitles): overlay cards stay above this line
  const overlayBottom = proj.layout?.overlayBottom != null ? Math.min(bottom, Math.round(proj.layout.overlayBottom * H)) : bottom;
  const pip = { w: Math.round(0.3 * W), h: Math.round(0.3 * H), x: 0, y: top, r: Math.round(34 * S) };
  pip.x = W - m - pip.w;
  // layout.pip: { pos: "bottom", w: 0.86, h: 0.2, fy: 0.4, bottom: 0.045 } = a wide landscape window of the speaker at the bottom,
  // the whole area above it is free for graphics (ref e). Default stays the small portrait PiP at the top right.
  const lp = proj.layout?.pip;
  // The wide bottom window only works when the RAW footage is landscape. On portrait footage it crops the face badly, so it is ignored
  // (the default portrait window at the top right stays) unless layout.pip.force is true.
  const rawLandscape = (footageMeta?.source?.w ?? 1) >= (footageMeta?.source?.h ?? 0);
  if (lp?.pos === 'bottom' && !rawLandscape && !lp.force) console.warn('layout.pip bottom ignored: the raw footage is portrait and the wide window would cut the face. Use split mode or the default PiP (or set pip.force).');
  if (lp?.pos === 'bottom' && (rawLandscape || lp.force)) {
    Object.assign(pip, { w: Math.round((lp.w ?? 0.86) * W), h: Math.round((lp.h ?? 0.2) * H), r: Math.round(30 * S), crop: true, fy: lp.fy ?? 0.4, bottom: true });
    pip.x = Math.round((W - pip.w) / 2);
    pip.y = Math.round(H - pip.h - (lp.bottom ?? 0.045) * H);
  }
  // split mode: top panel for a screen/graphic, bottom panel shows the face window of the footage
  const split = { seam: Math.round((proj.layout?.seam ?? 0.5) * H), focus: proj.layout?.splitFocus ?? 0.33, zoom: proj.layout?.splitZoom ?? 1 };

  // card mode (S12): the raw LANDSCAPE picture as a rounded card at the bottom (its top slightly cut), the speaker layered above it, graphics on top.
  // layout.card: { w: 0.88, bottom: 0.04, top: 0.14 (fraction of the picture cut off at the top), r: 28, pop: true }. Needs prep_footage --dual.
  const lc = proj.layout?.card ?? {};
  const land = footageMeta?.land;
  const usesCard = (proj.beats || []).some(b => b.mode === 'card');
  if (usesCard && !land) console.warn('mode "card" needs landscape frames: run prep_footage.py raw.mp4 proj --dual. Card beats fall back to split.');
  const card = (() => {
    if (!land) return null;
    const cw = Math.round((lc.w ?? 0.88) * W), fullH = Math.round(cw * land.h / land.w), cut = Math.round((lc.top ?? 0.14) * fullH);
    const x = Math.round((W - cw) / 2), fullTop = Math.round(H - fullH - (lc.bottom ?? 0.04) * H);
    const g = { x, w: cw, fullH, fullTop, cut, top: fullTop + cut, h: fullH - cut };
    g.capY = fullTop - Math.round(64 * S) - Math.round(0.05 * W) * 1.2;   // the caption line sits just above the picture / cap tip
    return g;
  })();

  const bg = buildBackground(stage, W, H, brand);
  // beat.backdrop: "grid" | "dots" | "plain" paints this part's own background (in the beat's palette) under the footage / PiP,
  // e.g. graph paper behind a whiteboard-style part (ref e). It fades in and out with the beat.
  const rgba = (hex, a) => { const n = parseInt(hex.replace('#', '').padStart(6, '0'), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };
  const bdrops = (proj.beats || []).filter(b => b.backdrop && b.mode !== 'card').map(b => {
    const pal = PALETTES[b.palette] ?? brand;
    const el = h('div', 'layer', stage);
    const line = rgba(pal.ink, 0.09), dot = rgba(pal.ink, 0.22), u = Math.round(54 * S);
    el.style.background = b.backdrop === 'grid' ? `linear-gradient(${line} 2px, transparent 2px) 0 0 / ${u}px ${u}px, linear-gradient(90deg, ${line} 2px, transparent 2px) 0 0 / ${u}px ${u}px, ${pal.bg}`
      : b.backdrop === 'dots' ? `radial-gradient(circle, ${dot} 2.5px, transparent 3px) 0 0 / ${u}px ${u}px, ${pal.bg}` : pal.bg;
    el.style.opacity = '0';
    return { el, a: b.t, b: b.t + b.dur, hard: b.mode === 'card' };
  });
  // card stage (S12): ONE persistent backdrop for the whole card stretch (layout.card.palette, default frost, grid paper), so nothing flashes between two card
  // parts; individual card beats do not paint their own backdrop. The card parts must use a light palette (the caption above the card is dark).
  const cardPal = PALETTES[lc.palette ?? 'frost'] ?? PALETTES.frost;
  const cardBg = card && usesCard ? h('div', 'layer', stage) : null;
  if (cardBg) {
    const line = rgba(cardPal.ink, 0.09), u2 = Math.round(54 * S);
    cardBg.style.background = `linear-gradient(${line} 2px, transparent 2px) 0 0 / ${u2}px ${u2}px, linear-gradient(90deg, ${line} 2px, transparent 2px) 0 0 / ${u2}px ${u2}px, ${cardPal.bg}`;
    cardBg.style.opacity = '0';
  }
  const footage = footageMeta ? buildFootage(stage, W, H, footageMeta, i => `${PROJ}footage/frames/${String(i).padStart(6, '0')}.jpg`, pip, split) : null;
  const cardLayer = footage && card && usesCard
    ? buildCard(stage, card, footageMeta, { r: Math.round((lc.r ?? 28) * S), pop: lc.pop }, i => `${PROJ}footage/frames_land/${String(i).padStart(6, '0')}.jpg`,
        lc.pop === false ? null : i => `${PROJ}footage/matte_land/${String(i).padStart(6, '0')}.jpg`) : null;
  // behind: true on a beat puts it BETWEEN the background footage and the speaker (needs scripts/matte.py masks), so the speaker
  // stays in front of the scene or text. The base footage fades out like a full-screen part; the matted speaker stays.
  const hasBehind = footage && (proj.beats || []).some(b => b.behind);
  const behindLayer = h('div', 'layer', stage);
  const person = hasBehind ? buildPerson(stage, W, H, footageMeta, i => `${PROJ}footage/frames/${String(i).padStart(6, '0')}.jpg`, i => `${PROJ}footage/matte/${String(i).padStart(6, '0')}.jpg`) : null;
  const beatsLayer = h('div', 'layer', stage);
  const fxLayer = h('div', 'layer', stage); // transitions: above captions and chrome (moved to the end below)
  const cues = [];

  const beats = (proj.beats || []).map((b0, i) => {
    const def = BEATS[b0.type];
    if (!def) throw new Error(`unknown beat type "${b0.type}" (beat ${i})`);
    const b = { ...def.defaults, ...b0 };
    if (!footage) b.behind = false;
    if (b.behind) b.mode = 'full';
    if (b.mode === 'card' && !cardLayer) b.mode = 'split';
    if (!footage && b.mode !== 'overlay') b.mode = 'full';
    if (!footage && b.mode === 'overlay' && !def.defaults.free) b.mode = 'full';
    // a beat that reaches the end of the video holds to the last frame: no exit fade, no PiP springing back mid-frame
    if (b.t + b.dur >= total - 0.3) b.dur = total - b.t + 60;
    return { b, def, i };
  });

  // hard cuts: a non-card beat that runs across the start of a card stretch is cut at the boundary (it would otherwise linger over the new state),
  // and gaps inside a card stretch (an empty stage) are reported
  if (cardLayer) {
    const cb = beats.filter(x => x.b.mode === 'card').map(x => [x.b.t, x.b.t + x.b.dur]).sort((a, b) => a[0] - b[0]);
    const cw = [];
    for (const v of cb) { const l = cw[cw.length - 1]; if (l && v[0] - l[1] < 1.0) { if (v[0] - l[1] > 0.05) console.warn(`card stretch: ${(v[0] - l[1]).toFixed(2)} s with no card beat at ${l[1].toFixed(2)} s (empty stage)`); l[1] = Math.max(l[1], v[1]); } else cw.push([...v]); }
    for (const x of beats) {
      if (x.b.mode === 'card') continue;
      for (const [a, e] of cw) {
        if (x.b.t < a - 0.01 && x.b.t + x.b.dur > a + 0.01) { console.warn(`beat ${x.i} (${x.b.type}) runs into a card stretch at ${a.toFixed(2)} s: cut to end there`); x.b.dur = a - x.b.t; }
        else if (x.b.t >= a - 0.01 && x.b.t < e - 0.02 && x.b.type !== 'zoom') console.warn(`beat ${x.i} (${x.b.type}, ${x.b.mode}) starts inside a card stretch (${a.toFixed(1)}-${e.toFixed(1)} s)`);
      }
    }
  }
  for (const it of beats) {
    const { b, def } = it;
    const layer = h('div', 'layer', b.behind ? behindLayer : def.defaults.onTop ? fxLayer : beatsLayer);
    if (b.palette && PALETTES[b.palette]) { applyPalette(layer.style, PALETTES[b.palette]); layer.style.color = 'var(--ink)'; } // per-part palette for variety (text colour follows it)
    const t0 = b.mode === 'overlay' ? 0.2 : b.mode === 'card' ? 0.08 : 0.55;
    const OUT = b.mode === 'card' ? b.dur - 0.06 : b.dur - 0.45;   // card parts end on a hard cut
    const ctx = {
      W, H, S, m, mode: b.mode, t0, OUT, dur: b.dur, captionsY, locale: proj.locale || 'id-ID', brand,
      asset, aspect: src => aspects[src] ?? 1, pip, root: layer, panel: { x: 0, y: 0, w: W, h: split.seam }, seam: split.seam,
      words: allWords, beatT: b.t, hasFootage: !!footage, stage: card ? { x: 0, y: 0, w: W, h: Math.round(card.capY - 20 * S) } : null,
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
      const headW = b.mode === 'insert' && !pip.bottom && b.mode !== 'card' ? W - 2 * m - pip.w - 28 * S : W - 2 * m;
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
      const mainTop = b.mode === 'insert' && !pip.bottom ? Math.max(pip.y + pip.h + 40 * S, hasHead ? top + headH + 48 * S : 0) : (hasHead ? top + headH + (b.mode === 'split' || b.mode === 'card' ? 36 : 56) * S : top);
      const zoneBottom = b.mode === 'card' ? Math.round(card.capY - 36 * S) : b.mode === 'split' ? split.seam - Math.round(48 * S) : b.mode === 'insert' && pip.bottom ? pip.y - Math.round(44 * S) : bottom;
      zone = { x: m, y: mainTop, w: W - 2 * m, h: zoneBottom - mainTop };
      ctx.zone = zone;
      place(box, zone.x, zone.y, zone.w);
    }
    const mod = def.async ? await def.load(b, ctx) : null;
    // content scale: larger on dedicated (insert/full) screens; shrink and rebuild until it fits its zone
    let F = b.scale ?? (b.mode === 'card' ? (TEXTY.has(b.type) ? 1.1 : 1.6) : TEXTY.has(b.type) ? 1 : b.mode === 'overlay' ? 0.95 : 1.3);   // the card stage is big: data beats scale up
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
  const windows = (mode, behindOnly = false) => {
    const iv = beats.filter(x => (behindOnly ? x.b.behind : x.b.mode === mode)).map(x => [x.b.t, x.b.t + x.b.dur]).sort((a, b) => a[0] - b[0]);
    const out = [];
    for (const v of iv) { const l = out[out.length - 1]; if (l && v[0] - l[1] < 1.0) l[1] = Math.max(l[1], v[1]); else out.push([...v]); }
    return out;
  };
  const cardW = cardLayer ? windows('card') : [];
  const inW = (T, ws) => (ws.some(([a, b]) => T >= a - 1e-6 && T < b - 1e-6) ? 1 : 0);   // hard cut, no ramp
  const insertW = footage ? windows('insert') : [], fullW = footage ? windows('full') : [], splitW = footage ? windows('split') : [], behindW = footage ? windows(null, true) : [];
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

  const captions = words ? buildCaptions(stage, W, H, words, capCfg, splitW.length ? split : null, cardLayer ? { y: Math.round(card.capY) } : null) : null;
  const chrome = proj.chrome !== false ? buildChrome(stage, W, H, proj.chrome || {}, asset, total) : null;
  stage.appendChild(fxLayer);
  const chapters = beats.filter(x => x.b.type === 'chapter').map(x => ({ num: x.b.num, name: x.b.label ?? x.b.name, start: x.b.t }));

  window.seek = async T => {
    bg.update(T);
    bdrops.forEach(d => { d.el.style.opacity = (d.hard ? (T >= d.a && T < d.b ? 1 : 0) : kOf(T, [[d.a, d.b]])).toFixed(3); });
    for (const it of beats) {
      const lt = T - it.b.t;
      const vis = it.b.mode === 'card' || it.b.mode === 'full' ? T >= it.b.t - 1e-6 && T < it.b.t + it.b.dur - 1e-6 : lt >= -0.2 && lt <= it.b.dur + 0.1;   // full + card parts: hard cuts, no early/late frame (an opaque stack/slab background would flash over the neighbouring state)   // card parts are hard cuts (same float expression as the card window, so no one-frame leftover)
      it.layer.style.display = vis ? '' : 'none';
      if (!vis) continue;
      if (it.headUpd) it.headUpd(lt);
      if (it.overlayGlass) {
        const k = E.outExpo(prog(lt, 0.05, 0.7)), x = E.inCubic(prog(lt, it.b.dur - 0.4, 0.4));
        pose(it.box, { y: 40 * (1 - k) - 20 * x, o: k * (1 - x) });
      }
      it.update(lt);
      if (it.b.mode === 'card') {   // graphics whip in from the right with a motion blur (0.22 s), then sit still; the exit is the hard cut
        const w = E.outCubic(prog(lt, 0, 0.22));
        it.layer.style.transform = w < 1 ? `translateX(${((1 - w) * W * 0.45).toFixed(1)}px)` : '';
        it.layer.style.filter = w < 1 ? `blur(${((1 - w) * 16).toFixed(1)}px)` : '';
      }
    }
    const splitK = kOf(T, splitW);
    const cardK = inW(T, cardW);
    if (cardBg) cardBg.style.opacity = cardK.toFixed(0);
    if (footage) await footage.update(T, kOf(T, insertW), Math.max(kOf(T, fullW), cardK), splitK, zoomAt(T));
    if (cardLayer) await cardLayer.update(T, cardK);
    if (person) await person.update(T, kOf(T, behindW), zoomAt(T));
    // kinetic scenes already show the spoken words, so captions step aside (kinetic `captions: true` keeps them)
    if (captions) captions.update(T, Math.max(kOf(T, kinCapW), pip.bottom ? kOf(T, insertW) : 0), splitK, cardK);
    if (chrome) {
      const ch = [...chapters].reverse().find(c => T >= c.start) || null;
      chrome.update(T, ch, Math.max(chromeHideSplit ? splitK : 0, kOf(T, kinW), cardK));
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
