// Core timing + DOM helpers. Every visual is a pure function of time t (seconds),
// so any frame can be rendered in any order and always looks identical.

export const W = 1080, H = 1920;

export function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = t => ((ax * t + bx) * t + cx) * t;
  const sy = t => ((ay * t + by) * t + cy) * t;
  const dx = t => (3 * ax * t + 2 * bx) * t + cx;
  return x => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 10; i++) {
      const e = sx(t) - x;
      if (Math.abs(e) < 1e-7) break;
      const d = dx(t);
      if (Math.abs(d) < 1e-7) break;
      t -= e / d;
    }
    return sy(Math.min(1, Math.max(0, t)));
  };
}

export const E = {
  linear: x => Math.min(1, Math.max(0, x)),
  outExpo: bezier(0.16, 1, 0.3, 1),     // entrances: fast start, long soft landing
  outQuart: bezier(0.25, 1, 0.5, 1),
  outCubic: bezier(0.33, 1, 0.68, 1),   // counters, bar growth
  inCubic: bezier(0.32, 0, 0.67, 0),    // exits
  inOutCubic: bezier(0.65, 0, 0.35, 1), // camera moves, morphs
  inOutQuart: bezier(0.76, 0, 0.24, 1),
  outBack: x => {                        // small overshoot for pops
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    const c1 = 1.4, c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  },
};

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const prog = (t, start, dur) => clamp((t - start) / dur);
export const lerp = (a, b, k) => a + (b - a) * k;

// entrance progress k (0→1) at tin, exit progress x (0→1) at tout
export function io(t, tin, tout, din = 0.8, dout = 0.45, ein = E.outExpo, eout = E.inCubic) {
  const k = ein(prog(t, tin, din));
  const x = tout == null ? 0 : eout(prog(t, tout, dout));
  return { k, x, v: k * (1 - x) };
}

export function pose(el, { x = 0, y = 0, s = 1, r = 0, o = 1 } = {}) {
  el.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) scale(${s.toFixed(4)}) rotate(${r.toFixed(3)}deg)`;
  el.style.opacity = o.toFixed(4);
  el.style.visibility = o <= 0.001 ? 'hidden' : 'visible';
}

// Standard "rise in, drift up out" motion used across scenes.
export function enter(el, t, tin, tout, opt = {}) {
  const { dy = 56, dx = 0, s0 = 1, r0 = 0, din = 0.8, dout = 0.45, exitDy = -28, exitDx = 0 } = opt;
  const { k, x } = io(t, tin, tout, din, dout);
  pose(el, {
    x: dx * (1 - k) + exitDx * x,
    y: dy * (1 - k) + exitDy * x,
    s: s0 + (1 - s0) * k,
    r: r0 * (1 - k),
    o: k * (1 - x),
  });
  return k * (1 - x);
}

export function h(tag, cls, parent, html) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (html != null) el.innerHTML = html;
  if (parent) parent.appendChild(el);
  return el;
}

const SVGNS = 'http://www.w3.org/2000/svg';
export function s(tag, attrs = {}, parent) {
  const el = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (parent) parent.appendChild(el);
  return el;
}

export function place(el, x, y, w, hgt) {
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  if (w != null) el.style.width = `${w}px`;
  if (hgt != null) el.style.height = `${hgt}px`;
  return el;
}

// stroke-draw: path must have pathLength="1"
export function draw(pathEl, k) {
  pathEl.style.strokeDasharray = '1 1';
  pathEl.style.strokeDashoffset = (1 - clamp(k)).toFixed(4);
}

export const fmt = (n, d = 0) => n.toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d });

// deterministic pseudo-random (for decorative layouts)
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
