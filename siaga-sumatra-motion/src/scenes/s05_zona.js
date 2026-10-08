import { E, prog, enter, pose, h, place, lerp, s, draw } from '../engine.js';
import { icon, shotCard } from '../components.js';
import { header, X0, text } from './common.js';
import { TINT, camera } from './s04_peta.js';

// 05_zona — Detail Zona Risiko + risk_framework (4 unsur → rumus risiko)
export default {
  id: '05_zona', chapter: ['05', 'Detail Zona Risiko'], dur: 13,
  build(root, ctx) {
    const R = ctx.data.chart_data.risk_framework.elements;
    const hdr = header(root, { kicker: 'Fitur · Detail Zona Risiko', title: '_4 unsur_ penentu besar-kecilnya risiko', size: 70 });

    const card = shotCard(root, ctx, 'zona', { w: 420, hgt: 900 });
    place(card.el, 588, 590);

    const cols = [TINT.red, TINT.amber, TINT.blue, TINT.green];
    const icons = ['rain', 'exposure', 'vuln', 'shield'];
    const split = n => { const m = n.match(/^(.*?)\s*\((.*)\)$/); return m ? [m[1], m[2]] : [n, '']; };

    // grid geometry (phase B)
    const GW = 458, GH = 330, GX = [X0, X0 + GW + 20], GY = [580, 580 + GH + 20];
    const items = R.map((el, i) => {
      const [id, en] = split(el.name);
      const gx = GX[i % 2], gy = GY[Math.floor(i / 2)];
      const body = h('div', 'panel', root);
      place(body, gx, gy, GW, GH);
      body.innerHTML = `
        <div class="abs" style="left:28px;top:30px;width:56px;height:56px;color:${cols[i]}">${icon(icons[i]).replace('class="ico ', 'style="width:56px;height:56px" class="ico ')}</div>
        <div class="abs" style="left:28px;top:124px;width:400px;font-size:29px;font-weight:700;line-height:1.25;color:#fff">${el.question}</div>
        <div class="abs" style="left:28px;top:212px;width:404px;font-size:24px;font-weight:500;line-height:1.35;color:rgba(255,255,255,.62)">${el.example}</div>`;
      // the name travels from the phase-A list into the card title slot
      const name = h('div', 'abs', root, `${id}<span style="display:block;font-size:.42em;font-weight:700;letter-spacing:.14em;text-transform:uppercase;opacity:.75;margin-top:6px">${en}</span>`);
      Object.assign(name.style, { fontSize: '60px', fontWeight: '800', color: cols[i], transformOrigin: '0 0', lineHeight: '1', whiteSpace: 'nowrap' });
      place(name, 0, 0);
      return { body, name, from: [X0, 620 + i * 190], to: [gx + 100, gy + 30], q: body.children[1], ex: body.children[2] };
    });

    // formula: Risiko = (Bahaya × Keterpaparan × Kerentanan) / Kapasitas
    const fx = h('div', 'panel', root);
    place(fx, X0, 1290, 936, 250);
    const lhs = text(fx, '', 'Risiko =', 40, 88);
    Object.assign(lhs.style, { fontSize: '44px', fontWeight: '800' });
    const names = R.map(e => split(e.name)[0]);
    const num = h('div', 'abs', fx);
    place(num, 250, 46, 660);
    Object.assign(num.style, { fontSize: '34px', fontWeight: '800', textAlign: 'center', whiteSpace: 'nowrap' });
    const terms = [0, 1, 2].map(i => {
      const sp = h('span', null, num, names[i]);
      sp.style.color = cols[i];
      sp.style.display = 'inline-block';
      if (i < 2) { const x = h('span', null, num, ' × '); x.style.color = 'rgba(255,255,255,.5)'; }
      return sp;
    });
    const lsvg = s('svg', { width: 660, height: 10, class: 'abs' }, fx);
    lsvg.style.left = '250px'; lsvg.style.top = '112px';
    const line = s('path', { d: 'M0 5H660', stroke: '#fff', 'stroke-width': 4, pathLength: 1, 'stroke-linecap': 'round' }, lsvg);
    const den = text(fx, '', names[3], 250, 140, 660);
    Object.assign(den.style, { fontSize: '34px', fontWeight: '800', textAlign: 'center', color: cols[3] });
    const src = text(root, 'small', 'Kerangka 4 unsur: modul edukasi SIAGA SUMATRA, bagian 02.', X0, 1556, 900);
    src.style.fontSize = '20px';

    ctx.cue(0.8, 'soft');
    items.forEach((_, i) => ctx.cue(0.9 + i * 0.25, 'tick', { gain: 0.6 }));
    ctx.cue(4.4, 'whoosh', { gain: 0.6 });
    ctx.cue(8.3, 'pop'); ctx.cue(9.3, 'pop', { gain: 1.1 });

    const MORPH = 4.4, OUT = 12.35;
    return t => {
      hdr(t, OUT);
      // phase A: screenshot + list of names; phase B: screenshot leaves, names fly into cards
      const cx = E.inCubic(prog(t, MORPH - 0.1, 0.6));
      const ck = enter(card.el, t, 0.6, null, { dy: 100, s0: 0.92, din: 1.1 });
      pose(card.el, { x: 420 * cx, y: (1 - E.outExpo(prog(t, 0.6, 1.1))) * 100, r: 6 * cx, s: lerp(0.92, 1, E.outExpo(prog(t, 0.6, 1.1))), o: ck * (1 - cx) });
      camera(card, t, [{ t: 0, z: 1, fx: 0.5, fy: 0 }, { t: 3.8, z: 1.12, fx: 0.5, fy: 0.55, d: 2.4 }]);

      const m = E.inOutCubic(prog(t, MORPH, 1.0));
      const ex = E.inCubic(prog(t, OUT, 0.45));
      items.forEach((it, i) => {
        const k = E.outExpo(prog(t, 0.9 + i * 0.25, 0.8));
        const sc = lerp(1, 0.62, m);
        const x = lerp(it.from[0], it.to[0], m) + (1 - k) * -60;
        const y = lerp(it.from[1], it.to[1], m) - 28 * ex;
        pose(it.name, { x, y, s: sc, o: k * (1 - ex) });
        const bk = E.outExpo(prog(t, MORPH + 0.25 + i * 0.15, 0.9));
        pose(it.body, { y: (1 - bk) * 50 - 28 * ex, s: lerp(0.94, 1, bk), o: bk * (1 - ex) });
        enter(it.q, t, MORPH + 0.7 + i * 0.35, null, { dy: 16 });
        enter(it.ex, t, MORPH + 0.9 + i * 0.35, null, { dy: 16 });
      });

      enter(fx, t, 8.0, OUT, { dy: 40 });
      enter(lhs, t, 8.2, null, { dx: -30, dy: 0 });
      terms.forEach((sp, i) => {
        const k = E.outBack(prog(t, 8.35 + i * 0.2, 0.6));
        sp.style.transform = `translate3d(0,${((1 - k) * 30).toFixed(1)}px,0)`;
        sp.style.opacity = E.linear(prog(t, 8.35 + i * 0.2, 0.2)).toFixed(3);
      });
      [...num.children].filter(c => !terms.includes(c)).forEach(c => { c.style.opacity = E.linear(prog(t, 8.6, 0.3)).toFixed(3); });
      draw(line, E.outCubic(prog(t, 9.0, 0.6)));
      enter(den, t, 9.3, null, { dy: -20 });
      enter(src, t, 9.6, OUT, { dy: 0 });
    };
  },
};
