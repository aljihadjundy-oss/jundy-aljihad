import { E, prog, enter, pose, h, place, lerp } from '../engine.js';
import { shotCard } from '../components.js';
import { header, stepBadge, X0, text } from './common.js';

export const TINT = { red: '#F06A5F', amber: '#F2B81F', green: '#5DBB63', blue: '#6E9BF0', teal: '#3FB6C4' };

// camera keyframes → setView; eased between keys
export function camera(card, t, keys) {
  let a = keys[0], b = keys[0], k = 0;
  for (let i = 0; i < keys.length - 1; i++) {
    if (t >= keys[i].t) { a = keys[i]; b = keys[i + 1]; k = E.inOutCubic(prog(t, keys[i + 1].t - (keys[i + 1].d ?? 1.2), keys[i + 1].d ?? 1.2)); }
  }
  if (t >= keys[keys.length - 1].t) { a = b = keys[keys.length - 1]; k = 1; }
  card.setView(lerp(a.z, b.z, k), lerp(a.fx, b.fx, k), lerp(a.fy, b.fy, k));
}

// 04_peta — Peta Risiko + risk_status_levels
export default {
  id: '04_peta', chapter: ['04', 'Peta Risiko'], dur: 10,
  build(root, ctx) {
    const D = ctx.data.chart_data;
    const L = D.risk_status_levels.levels;
    const hdr = header(root, { kicker: 'Fitur · Peta Risiko', title: 'Kenali wilayah *rawan* di sekitar Anda', size: 70 });
    const badge = stepBadge(root, D.usage_flow.steps[0], X0, 526);

    const card = shotCard(root, ctx, 'peta', { w: 420, hgt: 930 });
    place(card.el, X0, 620);

    const sub = text(root, 'kicker', '3 level status wilayah', 540, 624, 470);
    sub.style.fontSize = '24px';
    const cards = L.map((lv, i) => {
      const c = h('div', 'panel', root);
      place(c, 540, 672 + i * 296, 468, 276);
      c.style.overflow = 'hidden';
      const col = TINT[lv.color];
      c.innerHTML = `
        <div class="abs" style="left:0;top:0;bottom:0;width:12px;background:${col}"></div>
        <div class="abs" style="left:40px;top:30px;font-size:38px;font-weight:800;letter-spacing:.04em;color:${col}">${lv.label}</div>
        <div class="abs" style="left:40px;top:84px;font-size:24px;font-weight:600;color:rgba(255,255,255,.6)">Risiko ${lv.level}</div>
        <div class="abs" style="left:40px;top:130px;width:400px;font-size:28px;font-weight:600;line-height:1.3;color:#fff">${lv.action}</div>`;
      return c;
    });

    ctx.cue(0.8, 'soft');
    cards.forEach((_, i) => ctx.cue(2.6 + i * 0.55, 'pop'));

    const OUT = 9.35;
    return t => {
      hdr(t, OUT);
      enter(badge, t, 0.7, OUT, { dx: -30, dy: 0 });
      enter(card.el, t, 0.8, OUT, { dy: 120, s0: 0.92, din: 1.1 });
      camera(card, t, [
        { t: 0, z: 1, fx: 0.5, fy: 0.5 },
        { t: 4.6, z: 1.55, fx: 0.25, fy: 0.66, d: 1.3 },
        { t: 7.8, z: 1.0, fx: 0.5, fy: 0.5, d: 1.2 },
      ]);
      enter(sub, t, 2.4, OUT, { dy: 16 });
      cards.forEach((c, i) => enter(c, t, 2.6 + i * 0.55, OUT + i * 0.05, { dx: 90, dy: 0 }));
    };
  },
};
