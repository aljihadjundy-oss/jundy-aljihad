import { E, prog, lerp, clamp, pose, h, s, draw, rng } from '../engine.js';
import { PALETTES } from '../palettes.js';

// Beats from the five motion references of 2026-10 (see references/style-library.md, S7-S11). Free-placed full-canvas layers; every one
// is a pure function of the beat-local time. Palette: `palette` (default per beat) and `bg` ("none" = transparent over the footage).
const SANS = 'var(--font), "Liberation Sans", Arial, sans-serif';
const SERIF = '"SerifFont", "DejaVu Serif", Georgia, serif';
const MONO = '"MonoFont", "DejaVu Sans Mono", Menlo, monospace';
const pal = (b, d) => ({ ...(PALETTES[b.palette ?? d] ?? PALETTES[d]), ...(b.bg && b.bg !== 'none' ? { bg: b.bg } : {}), ...(b.ink ? { ink: b.ink } : {}), ...(b.accent ? { accent: b.accent } : {}) });
const css = (el, o) => Object.assign(el.style, o);
const mix = (a, bcol, k) => `color-mix(in srgb, ${a} ${Math.round(clamp(k, 0, 1) * 100)}%, ${bcol})`;
// text with ^accent^ markup
const mark = (t, col) => String(t).replace(/\^([^^]+)\^/g, `<span style="color:${col}">$1</span>`);
const strong = t => String(t).replace(/\^([^^]+)\^/g, '<b style="font-weight:800">$1</b>');   // editorial emphasis: heavier weight, same ink
function backdrop(root, b, p, { grid = false } = {}) {
  const bg = h('div', 'layer', root);
  bg.style.background = b.bg === 'none' ? 'transparent' : p.bg;
  if (grid && b.bg !== 'none') {
    const g = h('div', 'layer', root);
    css(g, { backgroundImage: `linear-gradient(${p.ink}14 1px, transparent 1px), linear-gradient(90deg, ${p.ink}14 1px, transparent 1px)`, backgroundSize: `${54}px ${54}px` });
  }
  return bg;
}
const fadeOut = (lt, ctx, d = 0.3) => 1 - E.inCubic(prog(lt, ctx.dur - d, d));

// stack — editorial type stack (S11, ref "Money still moves like it's 1973"): lines land one by one, earlier lines dim to grey, an optional big
// number/word lands last with a small caption. { "type": "stack", "lines": ["Money", "still moves", "like it's"], "big": "1973.", "caption": "SWIFT launched in 1973.",
//   "every": 0.7, "header": { "left": "Brand", "right": "Tagline" }, "grid": true, "palette": "editorial" }  (line items may be { t, at })
export const stack = {
  defaults: { mode: 'full', free: true },
  build(root, b, ctx) {
    const { W, H, S } = ctx, p = pal(b, 'editorial'), size = (b.size ?? 92) * S, m = 70 * S;
    backdrop(root, b, p, { grid: b.grid ?? true });
    if (b.header) {
      const hd = h('div', 'abs', root); css(hd, { left: `${m}px`, right: `${m}px`, top: `${64 * S}px`, display: 'flex', justifyContent: 'space-between', fontSize: `${22 * S}px`, fontWeight: 600, color: p.ink, fontFamily: SANS });
      hd.innerHTML = `<span>${b.header.left ?? ''}</span><span>${b.header.right ?? ''}</span>`;
      const rule = h('div', 'abs', root); css(rule, { left: `${m}px`, right: `${m}px`, top: `${100 * S}px`, height: `${2 * S}px`, background: `${p.ink}55` });
    }
    const box = h('div', 'abs', root); css(box, { left: `${m}px`, right: `${m}px`, top: `${(b.y ?? 0.2) * H}px`, fontFamily: SANS, color: p.ink });
    const items = (b.lines || []).map((l, i) => ({ t: typeof l === 'string' ? l : l.t, at: (typeof l === 'object' && l.at != null) ? l.at : 0.12 + i * (b.every ?? 0.7) }));
    const els = items.map(it => { const el = h('div', null, box, strong(it.t)); css(el, { fontSize: `${size}px`, fontWeight: 500, lineHeight: 1.08, letterSpacing: '-0.02em' }); return el; });
    let bigEl = null, capEl = null;
    const bigAt = b.bigAt ?? (items.length ? items[items.length - 1].at + (b.every ?? 0.7) + 0.2 : 0.2);
    if (b.big) {
      bigEl = h('div', null, box, b.big); css(bigEl, { fontSize: `${(b.bigSize ?? 230) * S}px`, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.04em', marginTop: `${24 * S}px` });
      if (b.caption) { capEl = h('div', null, box, b.caption); css(capEl, { fontSize: `${20 * S}px`, fontWeight: 500, color: p.accent2, marginTop: `${8 * S}px` }); }
    }
    items.forEach(it => ctx.cue(it.at, 'tick', { gain: 0.35 }));
    if (b.big) ctx.cue(bigAt, 'pop', { gain: 0.5 });
    return lt => {
      const o = fadeOut(lt, ctx);
      els.forEach((el, i) => {
        const k = E.outCubic(prog(lt, items[i].at, 0.5));
        const nextAt = i + 1 < items.length ? items[i + 1].at : (b.big ? bigAt : 1e9);
        const dim = E.inOutCubic(prog(lt, nextAt, 0.45)) * (b.dim ?? 0.62);   // earlier lines recede
        pose(el, { y: 26 * S * (1 - k), o: k * o });
        el.style.color = mix(p.ink, p.accent2, 1 - dim);
      });
      if (bigEl) { const k = E.outExpo(prog(lt, bigAt, 0.7)); pose(bigEl, { y: 50 * S * (1 - k), o: k * o }); }
      if (capEl) { const k = E.outCubic(prog(lt, bigAt + 0.35, 0.5)); pose(capEl, { y: 10 * S * (1 - k), o: k * o }); }
    };
  },
};

// roll — a word that rolls like a slot machine inside a fixed line (S11, "Pay anyone. Anywhere. USD → EUR").
//   { "type": "roll", "lines": ["Pay anyone.", "^Anywhere.^"], "values": ["USD", "EUR"], "at": [0.9, 2.2], "size": 96, "valueSize": 190, "palette": "editorial" }
// For a centred serif word swap (S10, "ask? → task") use { "align": "center", "serif": true, "lines": [], "values": ["ask^?^", "task"] }; ^x^ marks the accent colour.
export const roll = {
  defaults: { mode: 'full', free: true },
  build(root, b, ctx) {
    const { W, H, S } = ctx, p = pal(b, b.serif ? 'engrave' : 'editorial'), size = (b.size ?? 96) * S, vs = (b.valueSize ?? 190) * S, m = 70 * S, center = b.align === 'center';
    backdrop(root, b, p, { grid: b.grid ?? !b.serif });
    const box = h('div', 'abs', root); css(box, { left: `${m}px`, right: `${m}px`, top: `${(b.y ?? 0.28) * H}px`, fontFamily: b.serif ? SERIF : SANS, color: p.ink, textAlign: center ? 'center' : 'left' });
    const lines = (b.lines || []).map((l, i) => { const el = h('div', null, box, mark(l, p.accent2)); css(el, { fontSize: `${size}px`, fontWeight: b.serif ? 600 : 500, lineHeight: 1.08, letterSpacing: '-0.02em' }); return { el, at: 0.12 + i * 0.55 }; });
    const vals = b.values || [], win = h('div', null, box); css(win, { height: `${vs * 1.05}px`, overflow: 'hidden', position: 'relative', marginTop: `${20 * S}px` });
    const rows = vals.map(v => { const r = h('div', 'abs', win, mark(v, p.accent)); css(r, { left: 0, right: 0, top: 0, fontSize: `${vs}px`, fontWeight: b.serif ? 600 : 600, lineHeight: 1.05, letterSpacing: '-0.03em', textAlign: center ? 'center' : 'left' }); return r; });
    const at = b.at ?? vals.map((_, i) => 0.9 + i * 1.3);
    const sw = vs * 1.05;
    vals.forEach((_, i) => ctx.cue(at[i], 'tick', { gain: 0.4 }));
    return lt => {
      const o = fadeOut(lt, ctx);
      lines.forEach(l => { const k = E.outCubic(prog(lt, l.at, 0.5)); pose(l.el, { y: 24 * S * (1 - k), o: k * o }); });
      win.style.opacity = o.toFixed(3);
      rows.forEach((r, i) => {
        const enter = E.inOutCubic(prog(lt, at[i], 0.55)), leave = i + 1 < vals.length ? E.inOutCubic(prog(lt, at[i + 1], 0.55)) : 0;
        const y = (1 - enter) * sw * (i === 0 && at[0] <= 0.15 ? 0 : 1) - leave * sw;   // rolls up into the window, then out of the top
        r.style.transform = `translateY(${y.toFixed(1)}px)`;
        r.style.opacity = (enter > 0 && leave < 1 ? 1 : 0).toString();
      });
    };
  },
};

// glitch — one big word (or a sequence) with a chromatic-aberration landing (S7 / S8 / S10): the word lands split into red and cyan ghosts that
// snap together. { "type": "glitch", "words": [{ "w": "NEVER", "at": 0.1 }, { "w": "SLEEPS.", "at": 1.0, "color": "accent" }], "palette": "newsroom", "size": 220 }
export const glitch = {
  defaults: { mode: 'full', free: true },
  build(root, b, ctx) {
    const { W, H, S } = ctx, p = pal(b, 'newsroom'), size = (b.size ?? 220) * S, r = rng(7);
    backdrop(root, b, p, { grid: b.grid });
    const words = (b.words || [{ w: b.text, at: 0.1 }]).map((w, i) => ({ ...w, at: w.at ?? 0.1 + i * 0.9 }));
    const holder = h('div', 'abs', root); css(holder, { left: 0, top: `${(b.y ?? 0.5) * H - size * 0.6}px`, width: `${W}px`, height: `${size * 1.2}px`, textAlign: 'center', fontFamily: b.serif ? SERIF : SANS });
    const layers = words.map(w => {
      const col = w.color === 'accent' ? p.accent : w.color || p.ink;
      const mk = (c, blend) => { const el = h('div', 'abs', holder, w.w); css(el, { left: 0, right: 0, top: 0, fontSize: `${(w.size ? w.size * S : size)}px`, fontWeight: 800, letterSpacing: '-0.03em', color: c, mixBlendMode: blend ?? 'normal', whiteSpace: 'nowrap', lineHeight: 1.2 }); return el; };
      return { w, red: mk('#FF2D55', 'screen'), cyan: mk('#18C8FF', 'screen'), main: mk(col), jit: [0, 1, 2, 3, 4, 5].map(() => r() - 0.5) };
    });
    words.forEach(w => ctx.cue(w.at, 'swoosh', { gain: 0.5 }));
    return lt => {
      const o = fadeOut(lt, ctx, 0.25);
      layers.forEach((L, i) => {
        const nextAt = i + 1 < layers.length ? layers[i + 1].w.at : 1e9;
        const live = lt >= L.w.at && lt < nextAt ? 1 : 0;
        const a = lt - L.w.at, g = clamp(1 - a / 0.42), step = Math.floor(a * 24) % 6, off = g * (b.split ?? 26) * S * (0.5 + L.jit[step]);
        const k = E.outCubic(prog(lt, L.w.at, 0.16)), vis = live * o;
        pose(L.main, { x: g * 6 * S * L.jit[(step + 1) % 6], y: (1 - k) * 18 * S, o: vis * Math.max(0.01, k) });
        pose(L.red, { x: -off, y: g * 4 * S * L.jit[(step + 2) % 6], o: vis * g * 0.9 });
        pose(L.cyan, { x: off, y: -g * 4 * S * L.jit[(step + 3) % 6], o: vis * g * 0.9 });
      });
    };
  },
};

// ticker — market-ticker tapes scrolling along the top and bottom edge (S7, ref "NEVER SLEEPS"). Decoration: items are the words you give it.
//   { "type": "ticker", "items": ["AAPL +3.37%", "TSLA +2.1%"], "top": 0.045, "bottom": 0.935, "speed": 120, "palette": "newsroom", "bg": "none" }
export const ticker = {
  defaults: { mode: 'overlay', free: true },
  build(root, b, ctx) {
    const { W, H, S } = ctx, p = pal(b, 'newsroom'), th = (b.height ?? 54) * S;
    if (b.bg !== 'none' && b.backdrop) backdrop(root, b, p);
    const text = (b.items || ['LIVE']).join('     •     ') + '     •     ';
    const mk = (y, dir, strip) => {
      const bar = h('div', 'abs', root); css(bar, { left: `${-20 * S}px`, width: `${W + 40 * S}px`, top: `${y}px`, height: `${th}px`, overflow: 'hidden', background: strip ? p.accent : 'rgba(255,255,255,.88)', color: strip ? '#fff' : '#0A0F2A', fontFamily: MONO, fontWeight: 700, fontSize: `${24 * S}px`, whiteSpace: 'nowrap', lineHeight: `${th}px`, transform: `rotate(${(b.tilt ?? -1.6) * dir}deg)` });
      const inner = h('div', 'abs', bar, text + text + text); css(inner, { left: 0, top: 0 });
      return { bar, inner, w: 0 };
    };
    const t1 = mk(b.top != null ? b.top * H : 70 * S, 1, true), t2 = mk(b.bottom != null ? b.bottom * H : H - th - 70 * S, -1, false);
    const loop = t => (t.w = t.w || t.inner.scrollWidth / 3);
    return lt => {
      const o = E.outCubic(prog(lt, 0, 0.35)) * fadeOut(lt, ctx, 0.35);
      [t1, t2].forEach((t, i) => { const w = loop(t); const x = -(((lt * (b.speed ?? 120) * S) % w) + w) % w; t.inner.style.transform = `translateX(${i ? (x - w).toFixed(1) : x.toFixed(1)}px)`; t.bar.style.opacity = o.toFixed(3); });
    };
  },
};

// hud — camera / recorder overlay (S8, ref "PLANE → CLAUDE"): corner brackets, labels, a running timecode and REC dots.
//   { "type": "hud", "left": "CLAUDE / MOTION 001", "right": "SCENE 02", "palette": "hud", "bg": "none", "fps": 30 }
export const hud = {
  defaults: { mode: 'overlay', free: true },
  build(root, b, ctx) {
    const { W, H, S } = ctx, p = pal(b, 'hud'), m = 36 * S, L = 40 * S, col = b.color ?? mix(p.ink, 'transparent', 0.85);
    if (b.bg !== 'none') backdrop(root, b, p);
    const svg = s('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}`, class: 'layer' }, root);
    [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]].forEach(([x, y, dx, dy]) => s('path', { d: `M${x + dx * L} ${y}H${x}V${y + dy * L}`, fill: 'none', stroke: col, 'stroke-width': 2 * S }, svg));
    const txt = (x, y, anchor, t) => { const el = h('div', 'abs', root, t); css(el, { [anchor]: `${x}px`, top: `${y}px`, fontFamily: MONO, fontSize: `${17 * S}px`, letterSpacing: '.12em', color: col, textTransform: 'uppercase', whiteSpace: 'nowrap' }); return el; };
    txt(m + 14 * S, m + 12 * S, 'left', b.left ?? ''); txt(m + 14 * S, m + 12 * S, 'right', b.right ?? '');
    const tc = txt(m + 14 * S, H - m - 36 * S, 'left', ''), dots = txt(0, H - m - 36 * S, 'left', '');
    dots.style.left = `${W / 2 - 40 * S}px`;
    const fps = b.fps ?? 30;
    return lt => {
      const o = E.outCubic(prog(lt, 0, 0.3)) * fadeOut(lt, ctx, 0.3), f = Math.floor(Math.max(0, lt) * fps), pad = n => String(n).padStart(2, '0');
      tc.textContent = `T1 ${pad(Math.floor(f / fps / 60))}:${pad(Math.floor(f / fps) % 60)}:${pad(f % fps)}`;
      dots.textContent = (Math.floor(lt * 2) % 2 ? '● ' : '○ ') + '■■■ ' + (b.rate ?? '120 FPS');
      root.style.opacity = o.toFixed(3);
    };
  },
};

// slab — a flat coloured slab with a label that tilts in 3D, collapses to a hairline with a ruler, and ends as a glowing dot (S8, ref "PLANE").
//   { "type": "slab", "text": "PLANE", "meta": "1440 × 620", "palette": "hud" }  ≈ 3.6 s; hand over to a `glitch` word at the end
export const slab = {
  defaults: { mode: 'full', free: true },
  build(root, b, ctx) {
    const { W, H, S } = ctx, p = pal(b, 'hud'), cy = (b.y ?? 0.5) * H;
    backdrop(root, b, p, { grid: b.bg !== 'none' });
    const stage = h('div', 'abs', root); css(stage, { left: 0, top: 0, width: `${W}px`, height: `${H}px`, perspective: `${1400 * S}px` });
    const sw = W * 0.8, sh = sw * 0.42;
    const sl = h('div', 'abs', stage); css(sl, { left: `${(W - sw) / 2}px`, top: `${cy - sh / 2}px`, width: `${sw}px`, height: `${sh}px`, background: p.accent, transformStyle: 'preserve-3d' });
    const lab = h('div', 'abs', sl, b.text ?? 'PLANE'); css(lab, { left: `${40 * S}px`, bottom: `${22 * S}px`, fontSize: `${(b.size ?? 120) * S}px`, fontWeight: 900, color: '#0A0A0A', letterSpacing: '-0.03em', fontFamily: SANS });
    const meta = h('div', 'abs', sl, b.meta ?? ''); css(meta, { right: `${24 * S}px`, bottom: `${24 * S}px`, fontFamily: MONO, fontSize: `${16 * S}px`, color: '#0A0A0A' });
    const ruler = s('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}`, class: 'layer' }, root);
    const line = s('path', { d: `M${W * 0.1} ${cy}H${W * 0.9}`, stroke: p.accent, 'stroke-width': 3 * S, fill: 'none' }, ruler);
    const ticks = [];
    for (let i = 0; i <= 16; i++) ticks.push(s('path', { d: `M${W * 0.1 + (W * 0.8 / 16) * i} ${cy - 18 * S}v${i % 4 === 0 ? 30 * S : 16 * S}`, stroke: p.ink, 'stroke-width': 1.5 * S }, ruler));
    const dot = h('div', 'abs', root); css(dot, { left: `${W / 2 - 16 * S}px`, top: `${cy - 16 * S}px`, width: `${32 * S}px`, height: `${32 * S}px`, borderRadius: '50%', background: '#fff', boxShadow: `0 0 ${60 * S}px ${24 * S}px ${p.accent}` });
    ctx.cue(0.5, 'whoosh', { gain: 0.5 }); ctx.cue(2.0, 'tick', { gain: 0.6 });
    return lt => {
      const o = fadeOut(lt, ctx, 0.2);
      const tilt = E.inOutCubic(prog(lt, 0.4, 1.0)), fall = E.inOutCubic(prog(lt, 1.5, 0.55)), dotK = E.outCubic(prog(lt, 2.05, 0.4));
      sl.style.transform = `rotateX(${(tilt * 62).toFixed(2)}deg) rotateZ(${(-tilt * 28).toFixed(2)}deg) scaleY(${(1 - fall).toFixed(3)}) scale(${(1 - tilt * 0.12).toFixed(3)})`;
      sl.style.opacity = (fall >= 0.999 ? 0 : o).toFixed(3);
      const lk = E.outCubic(prog(lt, 1.7, 0.45));
      draw(line, lk); line.style.opacity = (o * (1 - dotK * 0.6)).toFixed(3);
      ticks.forEach((t, i) => { t.style.opacity = (E.outCubic(prog(lt, 1.9 + i * 0.015, 0.2)) * o * (1 - dotK)).toFixed(3); });
      pose(dot, { s: lerp(0.2, 1, dotK), o: dotK * o });
    };
  },
};

// cursor — an animated pointer that moves through a path of keys and clicks (S9, ref "Frame by Frame": the pointer opens a menu-bar app).
//   { "type": "cursor", "keys": [{ "t": 0.2, "x": 0.5, "y": 0.8 }, { "t": 1.4, "x": 0.62, "y": 0.35, "click": true }], "bg": "none" }  x, y = fractions of the canvas
export const cursor = {
  defaults: { mode: 'overlay', free: true },
  build(root, b, ctx) {
    const { W, H, S } = ctx, keys = b.keys || [];
    const cur = h('div', 'abs', root, '<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M4 2l14 9-6 1.4 3.6 7-2.7 1.4-3.6-7L4 18z" fill="#111" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>');
    css(cur, { width: `${54 * S}px`, height: `${54 * S}px`, left: 0, top: 0, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,.35))' });
    const rip = h('div', 'abs', root); css(rip, { width: `${90 * S}px`, height: `${90 * S}px`, borderRadius: '50%', border: `${4 * S}px solid ${b.color ?? '#2F6BFF'}`, left: 0, top: 0 });
    keys.filter(k => k.click).forEach(k => ctx.cue(k.t, 'tick', { gain: 0.6 }));
    const at = lt => {
      if (!keys.length) return [0.5, 0.5];
      if (lt <= keys[0].t) return [keys[0].x, keys[0].y];
      for (let i = 1; i < keys.length; i++) if (lt <= keys[i].t) { const a = keys[i - 1], c = keys[i], k = E.inOutCubic(prog(lt, a.t, c.t - a.t)); return [lerp(a.x, c.x, k), lerp(a.y, c.y, k)]; }
      const l = keys[keys.length - 1]; return [l.x, l.y];
    };
    return lt => {
      const [x, y] = at(lt), o = E.outCubic(prog(lt, 0, 0.25)) * fadeOut(lt, ctx, 0.25);
      let press = 0, ring = 0;
      keys.forEach(k => { if (k.click) { const a = lt - k.t; if (a > -0.08 && a < 0.14) press = 1 - Math.abs(a) / 0.14; if (a >= 0 && a < 0.6) ring = a / 0.6; } });
      pose(cur, { x: x * W, y: y * H, s: 1 - press * 0.16, o });
      pose(rip, { x: x * W - 18 * S, y: y * H - 18 * S, s: 0.3 + ring * 1.1, o: ring > 0 ? (1 - ring) * 0.9 * o : 0 });
    };
  },
};

// orbit — an app logo with small satellite chips that spring out and circle it (S9, ref "Frame by Frame"). { "type": "orbit", "label": "FF", "chips": ["#2F6BFF", "#22C1F5", "#2BBF8E"], "palette": "ui" }
export const orbit = {
  defaults: { mode: 'full', free: true },
  build(root, b, ctx) {
    const { W, H, S } = ctx, p = pal(b, 'ui'), R = (b.radius ?? 230) * S, cx = W / 2, cy = (b.y ?? 0.45) * H;
    backdrop(root, b, p);
    const ring = h('div', 'abs', root); css(ring, { width: `${R * 1.9}px`, height: `${R * 1.9}px`, left: `${cx - R * 0.95}px`, top: `${cy - R * 0.95}px`, borderRadius: '50%', background: `${p.ink}0F` });
    const logo = h('div', 'abs', root, b.label ?? ''); css(logo, { width: `${190 * S}px`, height: `${190 * S}px`, left: `${cx - 95 * S}px`, top: `${cy - 95 * S}px`, borderRadius: `${46 * S}px`, background: p.ink, color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: `${(b.labelSize ?? 70) * S}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 ${20 * S}px ${50 * S}px ${p.ink}44` });
    const chips = (b.chips || [p.accent, p.accent2, p.accent3]).map(c0 => { const c = typeof c0 === 'string' ? c0 : c0.color, lab = typeof c0 === 'string' ? '' : (c0.label ?? ''); const el = h('div', 'abs', root, lab); css(el, { minWidth: `${74 * S}px`, height: `${74 * S}px`, padding: lab ? `0 ${22 * S}px` : '0', borderRadius: `${22 * S}px`, background: c, color: '#fff', fontFamily: SANS, fontWeight: 700, fontSize: `${26 * S}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap', left: `${cx - 37 * S}px`, top: `${cy - 37 * S}px`, boxShadow: `0 ${10 * S}px ${24 * S}px ${c}55` }); return el; });
    ctx.cue(0.35, 'pop', { gain: 0.6 });
    return lt => {
      const o = fadeOut(lt, ctx, 0.3), k = E.outBack(prog(lt, 0.2, 0.7)), spin = (b.spin ?? 22) * Math.max(0, lt - 0.5);
      pose(logo, { s: lerp(0.6, 1, k), o: Math.min(1, k * 1.5) * o }); pose(ring, { s: lerp(0.4, 1, E.outCubic(prog(lt, 0.1, 0.6))), o });
      chips.forEach((c, i) => {
        const a = (i / chips.length) * Math.PI * 2 - 1.1 + spin * Math.PI / 180, kk = E.outBack(prog(lt, 0.45 + i * 0.12, 0.6)), r = R * 0.78 * kk;
        pose(c, { x: Math.cos(a) * r, y: Math.sin(a) * r, s: lerp(0.3, 1, kk), o: Math.min(1, kk * 1.5) * o });
      });
    };
  },
};

// wipe — a diagonal colour wipe between two parts (S7, ref "NEVER SLEEPS → Headlines"): two skewed panels sweep across, centred on the cut.
//   { "type": "wipe", "t": 12.7, "dur": 0.8, "colors": ["#3B3BB0", "#5B5BE8"], "dir": 1 }
export const wipe = {
  defaults: { mode: 'overlay', free: true },
  build(root, b, ctx) {
    const { W, H, S } = ctx, cols = b.colors ?? ['var(--accent3)', 'var(--accent)'], d = b.dir ?? 1;
    const ps = cols.map(c => { const el = h('div', 'abs', root); css(el, { top: `${-H * 0.1}px`, height: `${H * 1.2}px`, width: `${W * 1.5}px`, left: `${-W * 0.25}px`, background: c, transform: 'skewX(-18deg)' }); return el; });
    ctx.cue(0.05, 'swoosh', { gain: 0.7 });
    return lt => {
      ps.forEach((el, i) => {
        const a = E.inOutCubic(prog(lt, 0.02 + i * 0.1, ctx.dur * 0.62));   // crossing time per panel
        const x = lerp(-W * 1.7, W * 1.7, a) * d;
        el.style.transform = `translateX(${x.toFixed(1)}px) skewX(-18deg)`;
      });
    };
  },
};
