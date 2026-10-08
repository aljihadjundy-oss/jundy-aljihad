import { E, prog, enter, pose, h, place, lerp, s, draw, clamp } from '../engine.js';
import { icon } from '../components.js';
import { header, X0, CW, text } from './common.js';

const STEP_ICON = ['map', 'bell', 'backpack', 'run', 'megaphone', 'phone'];

// 13_roadmap (bagian 1) — peran bersama + usage_flow: 6 langkah, panah menggambar diri
export const s13a = {
  id: '13a_roadmap_alur', chapter: ['13', 'Peran Bersama & Roadmap'], dur: 9, light: true,
  build(root, ctx) {
    const S = ctx.data.chart_data.usage_flow.steps;
    const C = ctx.C;
    const hdr = header(root, { kicker: 'Peran bersama · warga & pemerintah Agam', title: `_${S.length} langkah_ warga memakai SIAGA SUMATRA`, size: 64, light: true });
    const R = 44, CX = X0 + R, Y0 = 590, STEP = 152;
    const svg = s('svg', { width: 1080, height: 1920, class: 'abs' }, root);
    svg.style.left = svg.style.top = '0';
    const arrows = S.slice(1).map((_, i) => {
      const y1 = Y0 + i * STEP + 2 * R + 10, y2 = Y0 + (i + 1) * STEP - 12;
      const g = s('g', {}, svg);
      const p = s('path', { d: `M${CX} ${y1}V${y2}`, stroke: C.teal, 'stroke-width': 4, fill: 'none', pathLength: 1, 'stroke-linecap': 'round' }, g);
      const head = s('path', { d: `M${CX - 11} ${y2 - 12}L${CX} ${y2}L${CX + 11} ${y2 - 12}`, stroke: C.teal, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
      return { p, head, g };
    });
    const nodes = S.map((st, i) => {
      const y = Y0 + i * STEP;
      const c = h('div', 'abs', root, icon(STEP_ICON[i]).replace('class="ico ', 'style="width:46px;height:46px" class="ico '));
      place(c, X0, y, 2 * R, 2 * R);
      Object.assign(c.style, { borderRadius: '50%', background: C.teal, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 24px -12px rgba(27,127,140,.8)' });
      const t1 = text(root, '', `<span style="color:${C.teal};font-size:22px;font-weight:800;letter-spacing:.1em;margin-right:12px">${String(st.step).padStart(2, '0')}</span>${st.label}`, X0 + 2 * R + 28, y + 2, 780);
      Object.assign(t1.style, { fontSize: '38px', fontWeight: '800', color: '#12355B' });
      const t2 = text(root, '', st.detail, X0 + 2 * R + 28, y + 52, 800);
      Object.assign(t2.style, { fontSize: '26px', fontWeight: '500', color: '#33475F', lineHeight: '1.3' });
      return { c, t1, t2, tin: 1.2 + i * 1.0 };
    });
    ctx.cue(0.05, 'swoosh', { gain: 0.4 });
    nodes.forEach(n => ctx.cue(n.tin, 'pop', { gain: 0.7 }));
    const OUT = 8.35;
    return t => {
      hdr(t, OUT);
      const ex = E.inCubic(prog(t, OUT, 0.45));
      nodes.forEach((n, i) => {
        const k = E.outBack(prog(t, n.tin, 0.6));
        pose(n.c, { s: lerp(0.4, 1, k), o: E.linear(prog(t, n.tin, 0.2)) * (1 - ex), y: -28 * ex });
        enter(n.t1, t, n.tin + 0.1, OUT, { dx: 40, dy: 0 });
        enter(n.t2, t, n.tin + 0.2, OUT, { dx: 40, dy: 0 });
      });
      arrows.forEach((a, i) => {
        const k = E.inOutCubic(prog(t, nodes[i].tin + 0.4, 0.55));
        draw(a.p, k);
        a.head.style.opacity = (k >= 0.98 ? 1 : 0) * (1 - ex);
        a.g.style.opacity = (1 - ex).toFixed(3);
      });
    };
  },
};

// 13_roadmap (bagian 2) — development_roadmap: progress stepper, tahap 1–2 terisi
export const s13b = {
  id: '13b_roadmap_tahap', chapter: ['13', 'Peran Bersama & Roadmap'], dur: 9, light: true,
  build(root, ctx) {
    const st = ctx.data.chart_data.development_roadmap.stages;
    const C = ctx.C;
    const done = st.filter(x => x.status.startsWith('selesai')).length;
    const hdr = header(root, { kicker: 'Roadmap pengembangan', title: `_${st.length} tahap_ dari buku panduan menuju aplikasi`, size: 64, light: true });
    const R = 42, CX = X0 + R, Y0 = 600, STEP = 176, NOWF = 0.66;
    const yC = i => Y0 + i * STEP + R;
    const svg = s('svg', { width: 1080, height: 1920, class: 'abs' }, root);
    svg.style.left = svg.style.top = '0';
    const track = s('path', { d: `M${CX} ${yC(0)}V${yC(st.length - 1)}`, stroke: 'rgba(18,53,91,.16)', 'stroke-width': 8, 'stroke-linecap': 'round', pathLength: 1 }, svg);
    const fill = s('path', { d: `M${CX} ${yC(0)}V${yC(done - 1) + STEP * NOWF}`, stroke: C.teal, 'stroke-width': 8, 'stroke-linecap': 'round', pathLength: 1 }, svg);
    const FILL = 3.4, OUT = 8.35;
    const rows = st.map((x, i) => {
      const isDone = x.status.startsWith('selesai');
      const node = h('div', 'abs', root);
      place(node, X0, Y0 + i * STEP, 2 * R, 2 * R);
      Object.assign(node.style, { borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '800' });
      const t1 = text(root, '', x.label, X0 + 2 * R + 30, Y0 + i * STEP - 2, 560);
      Object.assign(t1.style, { fontSize: '38px', fontWeight: '800', color: '#12355B' });
      const t2 = text(root, '', x.detail, X0 + 2 * R + 30, Y0 + i * STEP + 50, 800);
      Object.assign(t2.style, { fontSize: '26px', fontWeight: '500', color: '#33475F', lineHeight: '1.3' });
      const pill = h('div', 'abs', root, x.status.replace(/^./, c => c.toUpperCase()));
      Object.assign(pill.style, { fontSize: '21px', fontWeight: '800', padding: '6px 14px', borderRadius: '999px', whiteSpace: 'nowrap',
        background: isDone ? 'rgba(46,125,50,.12)' : 'transparent', color: isDone ? C.green : '#5F6368', border: `2px solid ${isDone ? 'rgba(46,125,50,.4)' : 'rgba(95,99,104,.35)'}` });
      place(pill, X0 + 2 * R + 30, Y0 + i * STEP + 96);
      // time at which the (eased) fill line reaches this node
      const f = i / (done - 1 + NOWF);
      let lo = 0, hi = 1;
      for (let it = 0; it < 30; it++) { const m = (lo + hi) / 2; if (E.inOutCubic(m) < f) lo = m; else hi = m; }
      return { node, t1, t2, pill, isDone, tin: 1.1 + i * 0.35, treach: FILL + lo * 1.8 };
    });
    const now = h('div', 'abs', root, 'Posisi saat ini');
    Object.assign(now.style, { fontSize: '22px', fontWeight: '800', color: '#fff', background: C.amber, padding: '8px 16px', borderRadius: '10px', whiteSpace: 'nowrap' });
    place(now, 706, yC(done - 1) + STEP * NOWF - 22);
    const nowDot = h('div', 'abs', root);
    Object.assign(nowDot.style, { width: '26px', height: '26px', borderRadius: '50%', background: C.amber, boxShadow: '0 0 0 8px rgba(224,161,0,.25)' });
    place(nowDot, CX - 13, yC(done - 1) + STEP * NOWF - 13);
    const nowLine = s('path', { d: `M${CX + 20} ${yC(done - 1) + STEP * NOWF}H690`, stroke: C.amber, 'stroke-width': 3, 'stroke-dasharray': '6 7' }, svg);

    ctx.cue(0.05, 'swoosh', { gain: 0.4 });
    rows.forEach(r => ctx.cue(r.tin, 'tick', { gain: 0.5 }));
    ctx.cue(3.4, 'whoosh', { gain: 0.5 }); rows.filter(r => r.isDone).forEach(r => ctx.cue(r.treach, 'pop')); ctx.cue(FILL + 1.9, 'pop', { gain: 1.1 });

    return t => {
      hdr(t, OUT);
      const ex = E.inCubic(prog(t, OUT, 0.45));
      draw(track, E.inOutCubic(prog(t, 0.9, 1.6)));
      track.style.opacity = (1 - ex).toFixed(3);
      const fk = E.inOutCubic(prog(t, FILL, 1.8));
      draw(fill, fk);
      fill.style.opacity = (1 - ex).toFixed(3);
      rows.forEach((r, i) => {
        const k = E.outBack(prog(t, r.tin, 0.6));
        // node turns "done" as the fill reaches it
        const reach = r.isDone ? E.outCubic(prog(t, r.treach, 0.35)) : 0;
        r.node.style.background = reach > 0.5 ? C.teal : '#fff';
        r.node.style.border = reach > 0.5 ? `4px solid ${C.teal}` : '4px solid rgba(18,53,91,.25)';
        r.node.style.color = reach > 0.5 ? '#fff' : '#5F6368';
        r.node.innerHTML = reach > 0.5 ? icon('check').replace('class="ico ', 'style="width:40px;height:40px" class="ico ') : String(i + 1);
        pose(r.node, { s: lerp(0.4, 1, k) * (1 + 0.15 * Math.sin(Math.PI * clamp(reach))), o: E.linear(prog(t, r.tin, 0.2)) * (1 - ex), y: -28 * ex });
        enter(r.t1, t, r.tin + 0.1, OUT, { dx: 40, dy: 0 });
        enter(r.t2, t, r.tin + 0.2, OUT, { dx: 40, dy: 0 });
        const pk = r.isDone ? reach : E.outExpo(prog(t, r.tin + 0.3, 0.6));
        pose(r.pill, { x: (1 - pk) * 20, o: pk * (1 - ex), y: -28 * ex });
      });
      const nk = E.outBack(prog(t, FILL + 1.9, 0.6));
      pose(nowDot, { s: nk * (1 + 0.12 * Math.sin(t * 5)), o: Math.min(1, nk) * (1 - ex) });
      enter(now, t, FILL + 2.0, OUT, { dx: -30, dy: 0 });
      nowLine.style.opacity = (E.linear(prog(t, FILL + 2.0, 0.4)) * (1 - ex)).toFixed(3);
    };
  },
};
