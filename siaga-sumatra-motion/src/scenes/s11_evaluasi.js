import { E, prog, enter, pose, h, place, lerp, s, draw } from '../engine.js';
import { counter } from '../components.js';
import { header, X0, CW, text } from './common.js';

// 11_evaluasi — form_rater_scores: grouped horizontal bars on an ordinal 1–3 scale
export default {
  id: '11_evaluasi', chapter: ['11', 'Hasil Evaluasi Rater'], dur: 13, light: true,
  build(root, ctx) {
    const D = ctx.data.chart_data.form_rater_scores;
    const N = D.scale_to_number;
    const C = ctx.C;
    const cols = [C.blue, C.teal, C.amber];
    const hdr = header(root, { kicker: 'Bagian baru · Evaluasi rancangan', title: 'Bagaimana *3 rater* menilai rancangan?', size: 68, light: true, delay: 0.45 });

    // legend
    const legend = h('div', 'abs', root);
    place(legend, X0, 548, CW);
    Object.assign(legend.style, { display: 'flex', flexWrap: 'wrap', gap: '10px 28px' });
    const legItems = D.aspects.map((a, i) => h('div', null, legend,
      `<span style="display:inline-block;width:26px;height:26px;border-radius:7px;background:${cols[i]};vertical-align:-5px;margin-right:10px"></span><span style="font-size:25px;font-weight:700;color:#12355B">${a}</span>`));

    const BW = 800, TOP = 668, GH = 238;
    const xs = v => X0 + (v / 3) * BW;
    const axis = s('svg', { width: 1080, height: 1920, class: 'abs' }, root);
    axis.style.left = axis.style.top = '0';
    const grid = Object.entries(N).map(([label, v]) => {
      const l = s('path', { d: `M${xs(v)} ${TOP - 10}V${TOP + 3 * GH - 40}`, stroke: 'rgba(18,53,91,0.18)', 'stroke-width': 2, 'stroke-dasharray': '6 8', pathLength: 1 }, axis);
      const lab = text(root, '', label, xs(v) - 100, TOP - 52, 200);
      Object.assign(lab.style, { fontSize: '22px', fontWeight: '700', color: '#5F6368', textAlign: 'center', letterSpacing: '.04em' });
      return { l, lab };
    });
    const base = s('path', { d: `M${X0} ${TOP - 10}V${TOP + 3 * GH - 40}`, stroke: '#12355B', 'stroke-width': 3, pathLength: 1 }, axis);

    const groups = D.raters.map((r, g) => {
      const m = r.match(/^(.*?)\s*\((.*)\)$/);
      const y0 = TOP + g * GH;
      const head = h('div', 'abs', root, `<span style="font-size:30px;font-weight:800;color:#12355B">${m ? m[1] : r}</span><span style="margin-left:14px;font-size:21px;font-weight:700;color:#fff;background:${C.teal};padding:5px 14px;border-radius:999px;vertical-align:4px">${m ? m[2] : ''}</span>`);
      place(head, X0 + 18, y0);
      const bars = D.scores[r].map((sc, j) => {
        const v = N[sc];
        const bar = h('div', 'abs', root);
        place(bar, X0, y0 + 56 + j * 50, xs(v) - X0, 38);
        Object.assign(bar.style, { background: cols[j], borderRadius: '0 10px 10px 0', transformOrigin: '0 50%' });
        const val = text(root, '', sc, xs(v) + 14, y0 + 58 + j * 50, 140);
        Object.assign(val.style, { fontSize: '25px', fontWeight: '800', color: sc === 'Baik' ? C.green : '#12355B' });
        return { bar, val, sc };
      });
      return { head, bars };
    });

    // derived callouts (counted from the scores, nothing new)
    const all = D.raters.flatMap(r => D.scores[r]);
    const nTidak = all.filter(x => x === 'Tidak Baik').length;
    const lastAspect = D.aspects[2];
    const nCukupLast = D.raters.filter(r => D.scores[r][2] === 'Cukup').length;
    const stat = (x, big, label) => {
      const p = h('div', 'panel', root);
      place(p, x, 1410, 458, 136);
      p.innerHTML = `<div class="abs" style="left:28px;top:22px;font-size:66px;font-weight:800;color:#12355B;line-height:1"></div><div class="abs" style="left:${big.length > 2 ? 160 : 100}px;top:28px;width:${big.length > 2 ? 270 : 330}px;font-size:23px;font-weight:600;line-height:1.3;color:#33475F">${label}</div>`;
      return { p, n: p.children[0] };
    };
    const s1 = stat(X0, '0', `penilaian <b>Tidak Baik</b> dari ${all.length} penilaian`);
    const s2 = stat(X0 + 478, `${nCukupLast}/${D.raters.length}`, `rater menilai <b>${lastAspect}</b>: Cukup`);
    const src = text(root, 'small', 'Sumber: Form Rater, Lampiran C laporan · skala Tidak Baik / Cukup / Baik', X0, 1566, CW);
    src.style.fontSize = '21px';

    ctx.cue(-0.4, 'whoosh', { gain: 0.9 }); // paper reveal
    groups.forEach((_, g) => ctx.cue(2.1 + g * 1.1, 'pop'));
    ctx.cue(6.1, 'tick'); ctx.cue(6.4, 'tick');

    const OUT = 12.35;
    return t => {
      hdr(t, OUT);
      legItems.forEach((el, i) => enter(el, t, 1.0 + i * 0.1, OUT, { dy: 14 }));
      const ex = E.inCubic(prog(t, OUT, 0.45));
      grid.forEach(({ l, lab }, i) => {
        draw(l, E.outCubic(prog(t, 1.3 + i * 0.1, 0.9)));
        l.style.opacity = (1 - ex).toFixed(3);
        enter(lab, t, 1.4 + i * 0.1, OUT, { dy: 10 });
      });
      draw(base, E.outCubic(prog(t, 1.2, 0.9)));
      base.style.opacity = (1 - ex).toFixed(3);
      groups.forEach(({ head, bars }, g) => {
        const tg = 2.0 + g * 1.1;
        enter(head, t, tg, OUT, { dx: -30, dy: 0 });
        bars.forEach(({ bar, val }, j) => {
          const k = E.outCubic(prog(t, tg + 0.15 + j * 0.12, 1.1));
          bar.style.transform = `scaleX(${k.toFixed(4)})`;
          bar.style.opacity = (1 - ex).toFixed(3);
          enter(val, t, tg + 0.9 + j * 0.12, OUT, { dx: -16, dy: 0 });
        });
      });
      enter(s1.p, t, 6.0, OUT, { dy: 40 });
      enter(s2.p, t, 6.3, OUT, { dy: 40 });
      counter(s1.n, t, 6.1, 0.6, nTidak);
      s2.n.textContent = t >= 6.4 ? `${nCukupLast}/${D.raters.length}` : '';
      enter(src, t, 6.8, OUT, { dy: 0 });
    };
  },
};
