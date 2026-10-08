import { E, clamp, prog, lerp, h, s, place, pose, rng } from '/rt/engine.js';
export { E, clamp, prog, lerp, h, s, place, pose, rng };

export const W = 1920, H = 1080;
export const C = { bg: '#050E1A', deep: '#082838', navy: '#183858', steel: '#284868', blue: '#386888', sky: '#487898', ice: '#8CC8EA', white: '#F6FAFD' };

export const el = (parent, cls, style = {}, html = null, tag = 'div') => {
  const e = h(tag, cls, parent, html);
  Object.assign(e.style, style);
  return e;
};
export const fmtN = (n, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
export const pad2 = n => String(n).padStart(2, '0');

// small uppercase mono label
export function mono(parent, text, x, y, o = {}) {
  return el(parent, 'abs mono', {
    left: `${x}px`, top: `${y}px`, fontSize: `${o.size ?? 18}px`, color: o.color ?? 'var(--ice)', letterSpacing: `${o.ls ?? 0.18}em`,
    whiteSpace: 'nowrap', width: o.w ? `${o.w}px` : 'auto', textAlign: o.align ?? 'left', lineHeight: 1.5,
  }, text);
}

// big statement type. segs: string or [{t, c: 'ice'|'serif'|undefined}]
export function statement(parent, segs, x, y, o = {}) {
  const e = el(parent, 'abs hl', { left: `${x}px`, top: `${y}px`, fontSize: `${o.size ?? 120}px`, color: o.color ?? 'var(--white)', whiteSpace: 'nowrap', lineHeight: o.lh ?? 1.02, letterSpacing: o.ls ?? '-0.02em' });
  if (typeof segs === 'string') segs = [{ t: segs }];
  segs.forEach(sg => {
    if (sg.br) { h('br', null, e); return; }
    const sp = h('span', sg.c === 'serif' ? 'serif' : (sg.c === 'ice' ? 'ice' : ''), e, sg.t);
    if (sg.c === 'serif') { sp.style.fontWeight = '400'; sp.style.letterSpacing = '-0.01em'; sp.style.fontSize = '1.08em'; }
  });
  return e;
}

// wipe-reveal: k 0→1 reveals from the left (or the bottom with dir 'up'); returns nothing
export function wipe(e, k, dir = 'right') {
  const r = (1 - clamp(k)) * 100;
  e.style.clipPath = dir === 'up' ? `inset(${r}% 0 0 0)` : `inset(0 ${r}% 0 0)`;
  e.style.visibility = k <= 0 ? 'hidden' : 'visible';
}

// typed text. segs: [{t, c}] ; k 0→1
export function typed(e, segs, k) {
  const total = segs.reduce((n, sg) => n + sg.t.length, 0);
  let left = Math.round(total * clamp(k)), html = '';
  for (const sg of segs) {
    const part = sg.t.slice(0, Math.max(0, left));
    left -= sg.t.length;
    if (part) html += sg.c === 'ice' ? `<span style="color:var(--ice)">${part}</span>` : part;
  }
  e.innerHTML = html + (k > 0 && k < 1 ? '<span style="opacity:.8">_</span>' : '');
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

// ---------------------------------------------------------------- footage slot (real clip frames, or a labelled placeholder)
const gradeFilter = 'grayscale(1) contrast(1.22) brightness(0.72)';
export function makeSlot(parent, id, ctx, absStart, dur, opt = {}) {
  const info = ctx.footage?.[id];
  const meta = ctx.content.slots[id];
  ctx.slots.push({ id, start: +absStart.toFixed(2), dur, desc: meta.desc, scene: meta.scene, ready: !!info });
  const box = el(parent, 'abs', { left: 0, top: 0, width: `${W}px`, height: `${H}px`, overflow: 'hidden', background: '#04101c' });
  const inner = el(box, 'abs', { left: 0, top: 0, width: `${W}px`, height: `${H}px`, transformOrigin: '50% 50%' });
  let img = null;
  if (info) {
    img = el(inner, 'abs', { left: 0, top: 0, width: `${W}px`, height: `${H}px`, objectFit: 'cover', filter: gradeFilter }, null, 'img');
  } else {
    inner.style.background = 'linear-gradient(135deg,#0c2338,#183858 55%,#0a1b2c)';
    const stripes = el(inner, 'abs', { inset: 0, backgroundImage: 'repeating-linear-gradient(135deg, rgba(140,200,234,.07) 0 2px, transparent 2px 46px)' });
    if (opt.quiet) {
      el(inner, 'abs mono', { left: '0', width: `${W}px`, top: '1000px', textAlign: 'center', fontSize: '13px', letterSpacing: '0.2em', color: 'rgba(140,200,234,.55)' }, `${id.toUpperCase()} · PLACEHOLDER · ${dur.toFixed(1)}s · ${meta.desc}`);
    } else {
      el(inner, 'abs mono', { left: '0', width: `${W}px`, top: '190px', textAlign: 'center', fontSize: '26px', letterSpacing: '0.3em', color: 'rgba(140,200,234,.8)' }, 'PLACEHOLDER · STOCK FOOTAGE');
      el(inner, 'abs hl', { left: '0', width: `${W}px`, top: '232px', textAlign: 'center', fontSize: '130px', color: 'rgba(246,250,253,.9)' }, id.toUpperCase().replace('F', 'F-'));
      el(inner, 'abs', { left: '360px', width: `${W - 720}px`, top: '400px', textAlign: 'center', fontSize: '28px', lineHeight: 1.35, fontWeight: 600, color: 'rgba(246,250,253,.75)' }, meta.desc);
      el(inner, 'abs mono', { left: '0', width: `${W}px`, top: '510px', textAlign: 'center', fontSize: '20px', letterSpacing: '0.24em', color: 'rgba(140,200,234,.7)' }, `${dur.toFixed(1)} s · 16:9 · 1080p · ${absStart.toFixed(1)}s in the film`);
    }
  }
  // house grade: steel-blue colour wash + vignette keep any stock clip inside the Shape palette
  el(box, 'abs', { inset: 0, background: '#284868', mixBlendMode: 'color', opacity: 0.55 });
  el(box, 'abs', { inset: 0, background: 'linear-gradient(180deg, rgba(5,14,26,.55) 0%, rgba(5,14,26,0) 30%, rgba(5,14,26,0) 55%, rgba(5,14,26,.85) 100%)' });
  el(box, 'abs', { inset: 0, background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 100%)' });
  return {
    el: box,
    async update(lt) {
      const z = 1.03 + 0.07 * clamp(lt / dur);
      inner.style.transform = `scale(${z.toFixed(4)}) translate3d(${(-14 * clamp(lt / dur)).toFixed(1)}px,0,0)`;
      if (img) {
        const idx = clamp(Math.floor(lt * info.fps), 0, info.count - 1) + 1;
        if (img.dataset.i !== String(idx)) {
          img.src = `/p/assets/footage/${id}/${String(idx).padStart(6, '0')}.jpg`;
          img.dataset.i = String(idx);
          try { await img.decode(); } catch (e) { /* keep previous frame */ }
        }
      }
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

// canvas layer helper
export function makeCanvas(parent) {
  const c = el(parent, 'layer', {}, null, 'canvas');
  c.width = W; c.height = H;
  return { c, g: c.getContext('2d') };
}
