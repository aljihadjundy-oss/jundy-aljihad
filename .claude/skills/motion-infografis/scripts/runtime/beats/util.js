import { E, prog, clamp, pose, h } from '../engine.js';

export const div = (parent, style = {}, html = null, cls = null) => {
  const el = h('div', cls, parent, html);
  Object.assign(el.style, style);
  return el;
};

// rise/slide in at tin, fade out with the beat at OUT
export function appear(el, lt, tin, OUT, { dy = 40, dx = 0, s0 = 1, din = 0.8, dout = 0.45 } = {}) {
  const k = E.outExpo(prog(lt, tin, din));
  const x = OUT == null ? 0 : E.inCubic(prog(lt, OUT, dout));
  pose(el, { x: dx * (1 - k), y: dy * (1 - k) - 24 * x, s: s0 + (1 - s0) * k, o: k * (1 - x) });
  return k * (1 - x);
}

export function pop(el, lt, tin, OUT, { s0 = 0.6, din = 0.6 } = {}) {
  const k = E.outBack(prog(lt, tin, din));
  const x = OUT == null ? 0 : E.inCubic(prog(lt, OUT, 0.45));
  pose(el, { s: s0 + (1 - s0) * k, y: -24 * x, o: Math.min(1, E.linear(prog(lt, tin, 0.2))) * (1 - x) });
}

// colour keyword → css value
export function tone(key, fallback = 'var(--accent)') {
  const map = { accent: 'var(--accent)', accent2: 'var(--accent2)', pos: 'var(--pos)', neg: 'var(--neg)', neutral: 'var(--ink)', ink: 'var(--ink)' };
  if (!key) return fallback;
  return map[key] || key;
}

// start times for n sequential items that must all land before the beat ends
// Item times: evenly spaced from t0, or pinned per item with `at` (seconds from the beat start) to land on a spoken word.
export function sequence(n, t0, OUT, every, items = []) {
  const room = Math.max(0.5, OUT - t0 - 1.2);
  const step = every ?? clamp(room / Math.max(1, n), 0.35, 1.6);
  return Array.from({ length: n }, (_, i) => (typeof items[i] === 'object' && items[i]?.at != null ? items[i].at : t0 + i * step));
}

export const text = (v) => (typeof v === 'string' ? { title: v } : v);
