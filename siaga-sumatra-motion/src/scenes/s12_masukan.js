import { E, prog, enter, pose, h, place, lerp, draw } from '../engine.js';
import { header, X0, CW, text } from './common.js';

// 12_masukan — development_inputs_4_9: checklist, one item per beat, check "written" in
export default {
  id: '12_masukan', chapter: ['12', '7 Area Perbaikan'], dur: 15, light: true,
  build(root, ctx) {
    const items = ctx.data.chart_data.development_inputs_4_9.items;
    const hdr = header(root, { kicker: 'Bagian baru · Masukan rater', title: `_${items.length} area_ perbaikan sebelum jadi aplikasi`, size: 66, light: true });
    const C = ctx.C;
    const rows = items.map((it, i) => {
      const y = 572 + i * 134;
      const box = h('div', 'abs', root);
      place(box, X0, y + 4, 56, 56);
      box.innerHTML = `<svg viewBox="0 0 56 56" style="width:56px;height:56px;overflow:visible">
        <rect x="2" y="2" width="52" height="52" rx="14" fill="none" stroke="#12355B" stroke-width="3.5" pathLength="1"/>
        <rect x="2" y="2" width="52" height="52" rx="14" fill="${C.green}"/>
        <path d="M14 29l9 9 19-20" fill="none" stroke="#fff" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" pathLength="1"/></svg>`;
      const [outline, fill, check] = box.querySelectorAll('rect, path');
      const num = text(root, '', String(i + 1).padStart(2, '0'), X0 + 84, y + 2, 60);
      Object.assign(num.style, { fontSize: '22px', fontWeight: '800', color: C.teal, letterSpacing: '.08em' });
      const tx = text(root, '', it, X0 + 84, y + 30, CW - 84);
      Object.assign(tx.style, { fontSize: '30px', fontWeight: '700', lineHeight: '1.3', color: '#12355B' });
      return { box, outline, fill, check, num, tx, tin: 1.2 + i * 1.45 };
    });

    ctx.cue(0.05, 'swoosh', { gain: 0.5 });
    rows.forEach(r => ctx.cue(r.tin + 0.4, 'tick'));

    const OUT = 14.35, ALL = rows[rows.length - 1].tin + 1.4;
    return t => {
      hdr(t, OUT);
      const ex = E.inCubic(prog(t, OUT, 0.45));
      rows.forEach((r, i) => {
        const k = E.outExpo(prog(t, r.tin, 0.8));
        // earlier items dim slightly while the newest one lands, then everything returns for the final read
        const next = rows[i + 1];
        const dim = next ? E.inOutCubic(prog(t, next.tin, 0.5)) * (1 - E.inOutCubic(prog(t, ALL, 0.6))) : 0;
        const o = k * (1 - 0.45 * dim) * (1 - ex);
        pose(r.box, { s: lerp(0.6, 1, E.outBack(prog(t, r.tin, 0.5))), o: Math.min(1, k * 2) * (1 - ex) });
        draw(r.outline, E.outCubic(prog(t, r.tin, 0.35)));
        r.fill.style.opacity = E.linear(prog(t, r.tin + 0.35, 0.15)).toFixed(3);
        draw(r.check, E.outCubic(prog(t, r.tin + 0.4, 0.35)));
        pose(r.tx, { x: (1 - k) * 60, y: -28 * ex, o });
        pose(r.num, { x: (1 - k) * 40, y: -28 * ex, o });
      });
    };
  },
};
