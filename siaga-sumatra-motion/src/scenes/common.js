import { enter, h, place } from '../engine.js';
import { headline } from '../components.js';

export const X0 = 72, CW = 936; // content margin + width

// kicker + kinetic headline, with the standard in/out timing
export function header(root, { kicker, title, size = 76, y = 292, light = false, w = CW, gap = 52, delay = 0 }) {
  const k = h('div', 'abs kicker', root, kicker);
  place(k, X0, y);
  const hl = headline(root, title, { x: X0, y: y + gap, w, size, color: light ? '#12355B' : '#fff' });
  return (t, tout) => {
    enter(k, t, 0.1 + delay, tout, { dy: 24 });
    hl.update(t, 0.25 + delay, tout);
  };
}

// pill linking a feature to its step in data.usage_flow
export function stepBadge(root, flowStep, x, y) {
  const el = h('div', 'step', root, `<span class="n">${flowStep.step}</span>Langkah ${flowStep.step} · <em>${flowStep.label}</em>`);
  place(el, x, y);
  return el;
}

export function text(root, cls, html, x, y, w) {
  const el = h('div', `abs ${cls}`, root, html);
  place(el, x, y, w);
  return el;
}
