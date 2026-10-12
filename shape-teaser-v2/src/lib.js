import { E, clamp, prog, lerp, h, s, rng } from '/rt/engine.js';
export { E, clamp, prog, lerp, h, s, rng };
import { COLORS } from './brand.js';
export { COLORS };

const proj = await (await fetch('/p/project.json', { cache: 'no-store' })).json();
export const W = proj.canvas.w, H = proj.canvas.h, P = H > W;
// safe areas: 8% margin (16:9); 10% horizontal and 14% vertical (9:16)
export const MX = Math.round(W * (P ? 0.10 : 0.08)), MY = Math.round(H * (P ? 0.14 : 0.08));
export const pad2 = n => String(n).padStart(2, '0');

// Easing.bezier(0.22, 1, 0.36, 1): smooth ease-out, no bounce
export const bez = (x1, y1, x2, y2) => {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = t => ((ax * t + bx) * t + cx) * t, sy = t => ((ay * t + by) * t + cy) * t, dx = t => (3 * ax * t + 2 * bx) * t + cx;
  return x => {
    if (x <= 0) return 0; if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) { const e = sx(t) - x; if (Math.abs(e) < 1e-5) break; const d = dx(t); if (Math.abs(d) < 1e-6) break; t -= e / d; }
    return sy(t);
  };
};
export const ease = bez(0.22, 1, 0.36, 1);
export const easeIO = E.inOutCubic;

export const el = (parent, cls, style = {}, html = null, tag = 'div') => { const e = h(tag, cls, parent, html); Object.assign(e.style, style); return e; };
export function mono(parent, text, o = {}) {
  return el(parent, o.flow ? 'mono' : 'abs mono', {
    ...(o.flow ? {} : { left: `${o.x ?? 0}px`, top: `${o.y ?? 0}px` }), fontSize: `${o.size ?? 20}px`, color: o.color ?? COLORS.accent, letterSpacing: `${o.ls ?? 0.16}em`,
    whiteSpace: o.wrap ? 'normal' : 'nowrap', width: o.w ? `${o.w}px` : 'auto', textAlign: o.align ?? 'left', lineHeight: o.lh ?? 1.5, opacity: 0,
  }, text);
}
// fade + rise in at t, optional fade out at t1 (local scene time lt)
export function vis(e, lt, t, o = {}) {
  const k = ease(prog(lt, t, o.dur ?? 0.9)), out = o.t1 != null ? ease(prog(lt, o.t1, o.outDur ?? 0.4)) : 0;
  const a = k * (1 - out) * (o.max ?? 1);
  e.style.opacity = a.toFixed(3);
  e.style.transform = `translate3d(${((1 - k) * (o.dx ?? 0)).toFixed(1)}px,${((1 - k) * (o.d ?? 20)).toFixed(1)}px,0)`;
  return a;
}
// kinetic text: words stagger in (fade + rise 22 px, letter-spacing narrows). words: strings or {t, c:'acc'|'warm'} or {br:true}
export function kin(parent, words, o = {}) {
  const size = o.size ?? 72;
  const box = el(parent, o.flow ? '' : 'abs', {
    ...(o.flow ? {} : { left: `${o.x ?? 0}px`, top: `${o.y ?? 0}px` }), width: o.w ? `${o.w}px` : 'auto', display: 'flex', flexWrap: 'wrap', columnGap: `${size * 0.27}px`, rowGap: `${size * (o.rowGap ?? 0.04)}px`,
    fontSize: `${size}px`, fontWeight: o.weight ?? 700, lineHeight: o.lh ?? 1.12, color: o.color ?? COLORS.white, letterSpacing: '-0.02em', justifyContent: o.center ? 'center' : 'flex-start', textAlign: o.center ? 'center' : 'left',
  });
  const spans = [];
  words.forEach(w => {
    if (w === 'br' || w.br) { el(box, '', { flexBasis: '100%', height: 0 }); return; }
    const t = typeof w === 'string' ? w : w.t, c = typeof w === 'string' ? '' : (w.c ?? '');
    spans.push(el(box, c, { display: 'inline-block', opacity: 0, willChange: 'transform' }, t, 'span'));
  });
  return {
    box,
    set(lt, t0, t1 = 1e9, step = 0.17) {
      spans.forEach((sp, i) => {
        const k = ease(prog(lt, t0 + i * step, 0.85)), out = ease(prog(lt, t1, 0.4));
        sp.style.opacity = (k * (1 - out)).toFixed(3);
        sp.style.transform = `translate3d(0,${((1 - k) * 22).toFixed(1)}px,0)`;
        sp.style.letterSpacing = `${(0.03 - 0.05 * k).toFixed(3)}em`;
      });
      box.style.visibility = lt < t0 - 0.01 || lt > t1 + 0.5 ? 'hidden' : 'visible';
    },
  };
}
export function makeCanvas(parent) { const c = el(parent, 'layer', {}, null, 'canvas'); c.width = W; c.height = H; return { c, g: c.getContext('2d') }; }

// ---------------------------------------------------------------- footage slot: real frames, or an elegant labelled placeholder
export function makeSlot(parent, id, ctx, absStart, dur, o = {}) {
  const spec = ctx.footageSpec[id], key = P && ctx.footage[id + '_v'] ? id + '_v' : id, info = ctx.footage[key];
  ctx.slots.push({ id, start: +absStart.toFixed(2), dur, desc: spec?.desc ?? '', scene: spec?.scene ?? '', ready: !!ctx.footage[id] });
  const bw = o.w ?? W, bh = o.h ?? H;
  const box = el(parent, 'abs', { left: `${o.x ?? 0}px`, top: `${o.y ?? 0}px`, width: `${bw}px`, height: `${bh}px`, overflow: 'hidden', background: '#0A2440' });
  const inner = el(box, 'abs', { left: 0, top: 0, width: `${bw}px`, height: `${bh}px`, transformOrigin: '50% 50%' });
  let img = null, simgs = null;
  if (spec?.stills) {
    simgs = spec.stills.map(f => { const im = el(inner, 'abs', { left: 0, top: 0, width: `${bw}px`, height: `${bh}px`, objectFit: 'cover', objectPosition: o.pos ?? '50% 50%', filter: 'saturate(0.55) contrast(1.1) brightness(0.72)', opacity: 0 }, null, 'img'); im.src = `/p/assets/stills/${f}`; return im; });
  } else if (info) img = el(inner, 'abs', { left: 0, top: 0, width: `${bw}px`, height: `${bh}px`, objectFit: 'cover', objectPosition: o.pos ?? '50% 50%', filter: `saturate(${o.cold ? 0.35 : 0.6}) contrast(1.15) brightness(0.8)` }, null, 'img');
  else {
    inner.style.background = 'linear-gradient(135deg,#0E2B4A,#1C3D5A 55%,#123152)';
    el(inner, 'abs', { inset: 0, backgroundImage: 'repeating-linear-gradient(135deg, rgba(125,184,224,.06) 0 2px, transparent 2px 54px)' });
    const small = bw < W * 0.5;
    const lab = el(inner, 'abs mono', { left: 0, width: `${bw}px`, top: small ? `${bh / 2 - 10}px` : `${Math.round(bh * (P ? 0.1 : 0.12))}px`, textAlign: 'center', fontSize: small ? '13px' : `${P ? 22 : 20}px`, letterSpacing: '0.22em', color: 'rgba(215,223,229,.7)' }, `FOOTAGE: ${id}`);
    if (!small && !o.quiet) el(inner, 'abs', { left: `${bw * 0.18}px`, width: `${bw * 0.64}px`, top: `${Math.round(bh * (P ? 0.1 : 0.12)) + 44}px`, textAlign: 'center', fontSize: `${P ? 24 : 22}px`, lineHeight: 1.35, color: 'rgba(215,223,229,.55)' }, spec?.desc ?? '');
    void lab;
  }
  // house grade: navy-blue colour wash, ink gradient at the bottom for text, soft vignette
  el(box, 'abs', { inset: 0, background: '#2E5A7A', mixBlendMode: 'color', opacity: o.cold ? 0.7 : 0.5 });
  el(box, 'abs', { inset: 0, background: 'linear-gradient(180deg, rgba(9,31,57,.35) 0%, rgba(9,31,57,0) 28%, rgba(9,31,57,.25) 55%, rgba(9,31,57,.88) 100%)' });
  if (o.dim) el(box, 'abs', { inset: 0, background: `rgba(9,31,57,${o.dim})` });
  const kb = o.kb ?? [-1, 0];
  return {
    el: box,
    async update(lt) {
      if (simgs) {   // photo sequence: crossfade between stills, each with its own slow push
        if (!simgs._d) { simgs._d = true; await Promise.all(simgs.map(i => i.decode().catch(() => {}))); }
        const n = simgs.length, seg = dur / n;
        inner.style.transform = 'none';
        simgs.forEach((im, i) => {
          const a = i === 0 ? 1 : clamp((lt - (i * seg - 0.25)) / 0.25), kk = clamp((lt - i * seg + 0.25) / (seg + 0.5));
          im.style.opacity = a.toFixed(3);
          im.style.transform = `scale(${(1.02 + 0.07 * kk).toFixed(4)}) translate3d(${((i % 2 ? 1 : -1) * 16 * kk).toFixed(1)}px,${((i % 3 === 0 ? -1 : 0) * 12 * kk).toFixed(1)}px,0)`;
        });
        return;
      }
      const k = clamp(lt / dur);
      inner.style.transform = `scale(${(1 + 0.06 * k).toFixed(4)}) translate3d(${(kb[0] * 14 * k).toFixed(1)}px,${(kb[1] * 14 * k).toFixed(1)}px,0)`;
      if (img) {
        const idx = clamp(Math.floor(Math.max(0, lt) * info.fps), 0, info.count - 1) + 1;
        if (img.dataset.i !== String(idx)) {
          img.src = `/p/assets/footage/${key}/${String(idx).padStart(6, '0')}.jpg`; img.dataset.i = String(idx);
          try { await img.decode(); } catch (e) { /* keep previous frame */ }
        }
      }
    },
  };
}

// ---------------------------------------------------------------- SHAPE theme icons (PNG from assets/icons/<key>.png, or a drawn stand-in)
let gid = 0;
const star = (n, ro, ri) => Array.from({ length: n * 2 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / n, r = i % 2 ? ri : ro; return `${(50 + Math.cos(a) * r).toFixed(1)},${(50 + Math.sin(a) * r).toFixed(1)}`; }).join(' ');
const FALLBACK = {
  'mind-power': { g: ['#1E3A8A', '#60A5FA'], d: '<path d="M50 8 C74 6 94 26 90 50 C86 76 68 94 46 91 C24 88 8 70 12 46 C15 24 30 10 50 8Z"/>' },
  health: { g: ['#6EE7B7', '#A78BFA'], d: '<path d="M50 90 C20 68 7 48 7 31 C7 16 19 8 31 8 C40 8 47 13 50 21 C53 13 60 8 69 8 C81 8 93 16 93 31 C93 48 80 68 50 90Z"/>' },
  fitness: { g: ['#818CF8', '#C7D2FE'], d: '<path d="M30 12 Q20 12 20 24 L20 76 Q20 88 31 82 L84 56 Q93 50 84 44 L31 13Z"/>' },
  longevity: { g: ['#1E3A8A', '#22D3EE'], d: `<polygon points="${star(7, 46, 24)}" stroke-linejoin="round"/>` },
  nutrition: { g: ['#F9A8D4', '#D9F99D'], d: '<path d="M16 84 C8 40 38 10 90 12 C92 60 62 92 16 84Z"/>' },
  aesthetics: { g: ['#F9A8D4', '#5EEAD4'], d: '<path d="M50 4 C54 34 66 46 96 50 C66 54 54 66 50 96 C46 66 34 54 4 50 C34 46 46 34 50 4Z"/>' },
};
export function makeIcon(parent, key, ctx) {
  const box = el(parent, 'abs', { left: 0, top: 0, opacity: 0, transformOrigin: '50% 50%' });
  const has = ctx.icons[key];
  if (has) { const im = el(box, 'abs', { left: 0, top: 0, width: '100%', height: '100%', objectFit: 'contain' }, null, 'img'); im.src = `/p/assets/icons/${key}.png`; box.dataset.png = '1'; }
  else {
    const f = FALLBACK[key], id = `ig${gid++}`;
    box.innerHTML = `<svg viewBox="0 0 100 100" width="100%" height="100%"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${f.g[0]}"/><stop offset="1" stop-color="${f.g[1]}"/></linearGradient></defs><g fill="url(#${id})">${f.d}</g></svg>`;
  }
  return {
    el: box,
    // x,y = centre; size in px; a opacity; sc scale; rot degrees
    set({ x, y, size, a = 1, sc = 1, rot = 0 }) {
      Object.assign(box.style, { left: `${(x - size / 2).toFixed(1)}px`, top: `${(y - size / 2).toFixed(1)}px`, width: `${size.toFixed(1)}px`, height: `${size.toFixed(1)}px`, opacity: a.toFixed(3), transform: `rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(4)})` });
    },
  };
}
// gentle float: translateY ±6 px, rotate ±4°, ~4 s period
export const float = (T, ph = 0) => ({ dy: Math.sin(T * 2 * Math.PI / 4 + ph) * 6, rot: Math.sin(T * 2 * Math.PI / 4 + ph + 1.3) * 4 });

// ---------------------------------------------------------------- the recurring motif: a dot with concentric rings, pulsing at 60 bpm (frame 0 and the final frame)
export function drawDot(g, cx, cy, t, a = 1, s = 1) {
  if (a <= 0.003) return;
  const m = ((t % 1) + 1) % 1, k = ease(clamp(m / 0.9));
  g.lineWidth = 1.5; g.strokeStyle = `rgba(125,184,224,${(0.28 * a).toFixed(3)})`; g.beginPath(); g.arc(cx, cy, 58 * s, 0, 6.283); g.stroke();
  g.strokeStyle = `rgba(125,184,224,${(0.55 * a).toFixed(3)})`; g.beginPath(); g.arc(cx, cy, 34 * s, 0, 6.283); g.stroke();
  g.strokeStyle = `rgba(125,184,224,${((1 - k) * 0.6 * a).toFixed(3)})`; g.beginPath(); g.arc(cx, cy, (30 + 62 * k) * s, 0, 6.283); g.stroke();
  g.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`; g.beginPath(); g.arc(cx, cy, 8 * s * (1 + 0.18 * (1 - k)), 0, 6.283); g.fill();
}

// ---------------------------------------------------------------- wireframe globe
export function makeGlobe(parent, o = {}) {
  const svg = s('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}`, class: 'layer' }, parent);
  svg.style.overflow = 'visible';
  const nM = o.meridians ?? 16, nP = o.parallels ?? 9, tilt = o.tilt ?? 0.42;
  const mk = (n, w) => Array.from({ length: n }, () => ({
    front: s('path', { fill: 'none', stroke: 'var(--ice)', 'stroke-width': w, 'stroke-linecap': 'round', pathLength: 1 }, svg),
    back: s('path', { fill: 'none', stroke: 'var(--ice)', 'stroke-width': w * 0.8, opacity: 0.16, pathLength: 1 }, svg),
  }));
  const mer = mk(nM, 1.6), par = mk(nP, 1.4);
  const rim = s('circle', { fill: 'none', stroke: 'var(--ice)', 'stroke-width': 2, opacity: 0.9 }, svg);
  const glow = s('circle', { fill: 'url(#gg)', opacity: 0.5 }, svg);
  const defs = s('defs', {}, svg);
  const rg = s('radialGradient', { id: 'gg' }, defs);
  s('stop', { offset: '0%', 'stop-color': '#8CC8EA', 'stop-opacity': 0.18 }, rg);
  s('stop', { offset: '100%', 'stop-color': '#8CC8EA', 'stop-opacity': 0 }, rg);
  svg.insertBefore(defs, svg.firstChild);
  svg.insertBefore(glow, svg.firstChild.nextSibling);
  const proj = (lat, lon, rot) => {
    const cl = Math.cos(lat), x = cl * Math.sin(lon + rot), y = Math.sin(lat), z = cl * Math.cos(lon + rot);
    return [x, y * Math.cos(tilt) - z * Math.sin(tilt), y * Math.sin(tilt) + z * Math.cos(tilt)];
  };
  const build = (pts, cx, cy, R) => {
    let f = '', b = '', lastZ = null;
    pts.forEach(([x, y, z], i) => {
      const cmd = (z >= 0 ? f : b);
      const front = z >= 0;
      const px = (cx + x * R).toFixed(1), py = (cy - y * R).toFixed(1);
      const started = i > 0 && (lastZ >= 0) === front;
      if (front) f += (started ? 'L' : 'M') + px + ',' + py; else b += (started ? 'L' : 'M') + px + ',' + py;
      lastZ = z;
    });
    return [f, b];
  };
  return {
    svg,
    update({ cx, cy, R, rot = 0, k = 1, alpha = 1 }) {
      svg.style.opacity = alpha.toFixed(3);
      rim.setAttribute('cx', cx); rim.setAttribute('cy', cy); rim.setAttribute('r', R);
      glow.setAttribute('cx', cx); glow.setAttribute('cy', cy); glow.setAttribute('r', R * 1.5);
      rim.style.opacity = clamp(k * 3).toFixed(3);
      mer.forEach((m, i) => {
        const lon = (i / nM) * Math.PI;
        // one meridian = half circle at lon, the other half at lon+π; build as a single closed loop
        const loop = [];
        for (let j = 0; j <= 48; j++) loop.push(proj(-Math.PI / 2 + (j / 48) * Math.PI, lon, rot));
        for (let j = 48; j >= 0; j--) loop.push(proj(-Math.PI / 2 + (j / 48) * Math.PI, lon + Math.PI, rot));
        const [f, b] = build(loop, cx, cy, R);
        m.front.setAttribute('d', f); m.back.setAttribute('d', b);
        const kk = clamp(k * 1.7 - i * 0.04);
        for (const p of [m.front, m.back]) { p.style.strokeDasharray = '1 1'; p.style.strokeDashoffset = (1 - kk).toFixed(4); }
      });
      par.forEach((p, i) => {
        const lat = -Math.PI / 2 + ((i + 1) / (nP + 1)) * Math.PI;
        const loop = [];
        for (let j = 0; j <= 72; j++) loop.push(proj(lat, (j / 72) * Math.PI * 2, rot));
        const [f, b] = build(loop, cx, cy, R);
        p.front.setAttribute('d', f); p.back.setAttribute('d', b);
        const kk = clamp(k * 1.7 - 0.2 - i * 0.05);
        for (const q of [p.front, p.back]) { q.style.strokeDasharray = '1 1'; q.style.strokeDashoffset = (1 - kk).toFixed(4); }
      });
    },
  };
}


// ---------------------------------------------------------------- isometric helpers
export function isoProject(ox, oy, u) {
  const c = Math.cos(Math.PI / 6);
  return (x, y, z = 0) => [ox + (x - y) * c * u, oy + (x + y) * 0.5 * u - z * u];
}
const poly = pts => pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
// box on the iso grid; faces: top / left (y+d plane) / right (x+w plane)
export function isoBox(parent, P, { x, y, w, d, top = '#8CC8EA', left = '#386888', right = '#183858', edge = 'rgba(140,200,234,.9)' }) {
  const g = s('g', {}, parent);
  const fL = s('polygon', { fill: left, stroke: edge, 'stroke-width': 1.2, 'stroke-linejoin': 'round' }, g);
  const fR = s('polygon', { fill: right, stroke: edge, 'stroke-width': 1.2, 'stroke-linejoin': 'round' }, g);
  const fT = s('polygon', { fill: top, stroke: edge, 'stroke-width': 1.2, 'stroke-linejoin': 'round' }, g);
  const api = {
    g, topCenter: () => P(x + w / 2, y + d / 2, api.hgt),
    hgt: 0,
    set(hh, o = {}) {
      api.hgt = hh;
      fL.setAttribute('points', poly([P(x, y + d, 0), P(x + w, y + d, 0), P(x + w, y + d, hh), P(x, y + d, hh)]));
      fR.setAttribute('points', poly([P(x + w, y, 0), P(x + w, y + d, 0), P(x + w, y + d, hh), P(x + w, y, hh)]));
      fT.setAttribute('points', poly([P(x, y, hh), P(x + w, y, hh), P(x + w, y + d, hh), P(x, y + d, hh)]));
      g.style.opacity = hh <= 0.01 ? 0 : (o.alpha ?? 1);
      fT.setAttribute('fill', o.topFill ?? top);
    },
  };
  api.set(0);
  return api;
}
export function isoFloor(parent, P, { x0 = 0, y0 = 0, nx = 6, ny = 6, step = 1, color = 'rgba(140,200,234,.22)' }) {
  const g = s('g', {}, parent);
  const lines = [];
  for (let i = 0; i <= nx; i++) lines.push(s('line', { stroke: color, 'stroke-width': 1 }, g));
  for (let j = 0; j <= ny; j++) lines.push(s('line', { stroke: color, 'stroke-width': 1 }, g));
  return {
    g,
    set(k) {
      let n = 0;
      for (let i = 0; i <= nx; i++) { const a = P(x0 + i * step, y0), b = P(x0 + i * step, y0 + ny * step); const l = lines[n++]; l.setAttribute('x1', a[0]); l.setAttribute('y1', a[1]); l.setAttribute('x2', lerp(a[0], b[0], clamp(k))); l.setAttribute('y2', lerp(a[1], b[1], clamp(k))); }
      for (let j = 0; j <= ny; j++) { const a = P(x0, y0 + j * step), b = P(x0 + nx * step, y0 + j * step); const l = lines[n++]; l.setAttribute('x1', a[0]); l.setAttribute('y1', a[1]); l.setAttribute('x2', lerp(a[0], b[0], clamp(k))); l.setAttribute('y2', lerp(a[1], b[1], clamp(k))); }
    },
  };
}


export function wipe(e, k, dir = 'right') { const r = (1 - clamp(k)) * 100; e.style.clipPath = dir === 'up' ? `inset(${r}% 0 0 0)` : `inset(0 ${r}% 0 0)`; }
export function typed(e, text, k) { const n = Math.round(text.length * clamp(k)); e.textContent = text.slice(0, n) + (k > 0 && k < 1 ? '_' : ''); }
