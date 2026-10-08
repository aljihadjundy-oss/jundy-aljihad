import { E, prog, enter, pose, h, s, place, lerp, draw } from '../engine.js';
import { icon, counter } from '../components.js';
import { header, X0, CW, text } from './common.js';

// 02_masalah (bagian 2) — kancah_selection: peta Sumatra → zoom ke Kabupaten Agam
export default {
  id: '02b_masalah_kancah', chapter: ['02', 'Kenapa Dibutuhkan'], dur: 10,
  build(root, ctx) {
    const K = ctx.data.chart_data.kancah_selection;
    const G = ctx.geo;
    const POS = +K.reasons[0].match(/(\d+)\s*pos/)[1]; // "Ada pos lapangan aktif di Agam (13 pos)"
    const hdr = header(root, { kicker: 'Fokus wilayah', title: 'Dari *3 provinsi* ke _1 kabupaten_', size: 80 });

    const MX = X0, MY = 560, MW = CW, MH = 740;
    const box = h('div', 'panel', root);
    place(box, MX, MY, MW, MH);
    box.style.overflow = 'hidden';
    box.style.background = 'rgba(255,255,255,0.035)';
    const svg = s('svg', { width: MW, height: MH, viewBox: `0 0 ${MW} ${MH}`, class: 'abs' }, box);
    svg.style.left = svg.style.top = '0';
    const cam = s('g', {}, svg);
    const provs = G.provinces.map(p => {
      const el = s('path', { d: p.d, 'vector-effect': 'non-scaling-stroke', pathLength: 1 }, cam);
      return { p, el };
    });
    const agam = s('path', { d: G.agam.d, 'vector-effect': 'non-scaling-stroke', fill: '#E0A100', stroke: '#fff', 'stroke-width': 2.5 }, cam);

    // overlays positioned through the camera
    const labels = provs.filter(x => x.p.focus).map(x => {
      const l = h('div', 'abs', box, x.p.name);
      Object.assign(l.style, { fontSize: '26px', fontWeight: '800', color: '#fff', whiteSpace: 'nowrap', textShadow: '0 2px 10px rgba(0,0,0,0.6)' });
      return { l, c: x.p.c };
    });
    const agamLabel = h('div', 'abs', box, 'Kabupaten Agam');
    Object.assign(agamLabel.style, { fontSize: '34px', fontWeight: '800', color: '#fff', background: 'rgba(10,30,54,0.85)', padding: '10px 20px', borderRadius: '14px', border: '2px solid var(--amber)', whiteSpace: 'nowrap' });
    const ring = h('div', 'abs', box);
    Object.assign(ring.style, { width: '10px', height: '10px', borderRadius: '50%', border: '4px solid var(--amber)' });

    // before / after chip
    const chip = h('div', 'abs', box);
    place(chip, MW - 560 - 28, 26, 560);
    Object.assign(chip.style, { background: 'rgba(10,30,54,0.85)', borderRadius: '18px', padding: '16px 22px', border: '2px solid rgba(255,255,255,0.14)' });
    const before = h('div', null, chip, `<div class="kicker" style="font-size:20px">Sebelum</div><div style="font-size:26px;font-weight:700;margin-top:6px">${K.before}</div>`);
    const after = h('div', 'abs', chip, `<div class="kicker" style="font-size:20px;color:var(--amber)">Sesudah</div><div style="font-size:26px;font-weight:700;margin-top:6px">${K.after}</div>`);
    place(after, 22, 16, 516);
    const attr = text(box, 'small', 'Peta: geoBoundaries (CC BY 4.0)', MW - 330, MH - 44, 310);
    attr.style.fontSize = '18px';
    attr.style.textAlign = 'right';

    // reasons
    const icons = [null, 'slide', 'check'];
    const rows = K.reasons.map((r, i) => {
      const row = h('div', 'abs', root);
      place(row, X0, 1334 + i * 92, CW, 80);
      Object.assign(row.style, { display: 'flex', alignItems: 'center', gap: '22px' });
      const badge = h('div', null, row);
      Object.assign(badge.style, { width: '72px', height: '72px', borderRadius: '20px', flex: '0 0 72px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: i === 0 ? 'var(--amber)' : 'rgba(63,182,196,0.18)', color: i === 0 ? '#0A1E36' : 'var(--teal-hi)', fontSize: '38px', fontWeight: '800' });
      if (icons[i]) badge.innerHTML = icon(icons[i]).replace('class="ico ', 'style="width:40px;height:40px" class="ico ');
      const tx = h('div', null, row, r);
      Object.assign(tx.style, { fontSize: '32px', fontWeight: '600', lineHeight: '1.25' });
      return { row, badge };
    });

    ctx.cue(0.5, 'whoosh', { gain: 0.6 });
    ctx.cue(1.9, 'pop'); ctx.cue(2.05, 'pop'); ctx.cue(2.2, 'pop');
    ctx.cue(3.0, 'whoosh');
    ctx.cue(4.35, 'pop', { gain: 1.2 });
    rows.forEach((_, i) => ctx.cue(5.3 + i * 0.9, 'tick'));

    const camA = { x: 585, y: 600, s: 0.6 }, camB = { x: G.agam.c[0], y: G.agam.c[1], s: 5.2 };
    const OUT = 9.35;
    return t => {
      hdr(t, OUT);
      enter(box, t, 0.35, OUT, { dy: 40, s0: 0.97 });
      const z = E.inOutQuart(prog(t, 3.0, 1.6));
      const sc = Math.exp(lerp(Math.log(camA.s), Math.log(camB.s), z));
      const cx = lerp(camA.x, camB.x, z), cy = lerp(camA.y, camB.y, z) - 20 * z;
      const tx = MW / 2 - cx * sc, ty = MH / 2 - cy * sc;
      cam.setAttribute('transform', `translate(${tx.toFixed(2)},${ty.toFixed(2)}) scale(${sc.toFixed(4)})`);
      const P = c => [tx + c[0] * sc, ty + c[1] * sc];

      const dk = E.inOutCubic(prog(t, 0.5, 1.6));
      const fk = E.outCubic(prog(t, 1.6, 0.8));
      provs.forEach(({ p, el }) => {
        draw(el, dk);
        el.setAttribute('stroke', p.focus ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)');
        el.setAttribute('stroke-width', p.focus ? 2 : 1.4);
        const a = p.focus ? lerp(0.08, 0.55, fk) * lerp(1, 0.45, z) : 0.06;
        el.setAttribute('fill', p.focus ? `rgba(27,127,140,${a.toFixed(3)})` : `rgba(255,255,255,${a})`);
        el.style.strokeDasharray = dk >= 1 ? 'none' : el.style.strokeDasharray;
      });
      const ak = E.outBack(prog(t, 4.35, 0.6));
      agam.style.opacity = E.linear(prog(t, 4.2, 0.4)).toFixed(3);
      labels.forEach(({ l, c }, i) => {
        const [x, y] = P(c);
        const k = E.outExpo(prog(t, 1.9 + i * 0.15, 0.7)) * (1 - E.inCubic(prog(t, 2.9, 0.4)));
        pose(l, { x: x - 70, y: y - 18 + (1 - k) * 16, o: k });
      });
      const [ax, ay] = P(G.agam.c);
      const lk = E.outExpo(prog(t, 4.5, 0.8));
      pose(agamLabel, { x: ax - 130, y: ay + 190 + (1 - lk) * 20, o: lk });
      const pulse = ((t - 4.4) % 1.6) / 1.6;
      const rr = t > 4.4 ? lerp(60, 230, E.outCubic(pulse)) : 0;
      ring.style.width = ring.style.height = `${rr * 2}px`;
      pose(ring, { x: ax - rr - 5, y: ay - rr - 5, o: t > 4.4 ? (1 - pulse) * 0.9 : 0 });

      enter(chip, t, 1.2, null, { dy: 16 });
      const sw = E.inOutCubic(prog(t, 3.9, 0.6));
      pose(before, { y: -20 * sw, o: 1 - sw });
      pose(after, { y: 20 * (1 - sw), o: sw });
      enter(attr, t, 1.5, null, { dy: 0 });

      rows.forEach(({ row, badge }, i) => {
        const tin = 5.3 + i * 0.9;
        enter(row, t, tin, OUT + i * 0.05, { dx: 60, dy: 0 });
        if (i === 0) counter(badge, t, tin + 0.1, 1.1, POS);
      });
    };
  },
};
