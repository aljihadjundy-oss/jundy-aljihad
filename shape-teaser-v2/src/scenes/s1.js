import { E, clamp, prog, lerp, el, mono, kin, vis, makeGlobe, makeIcon, makeCanvas, float, ease, easeIO, drawDot, W, H, MX, COLORS } from '../lib.js';
import { PILLARS, TAGS } from '../brand.js';

// S1 · ORIGIN (0–8 s). A pulsing dot becomes a wireframe globe (HUD callouts), the open-loop line lands, six SHAPE icons orbit, then collapse to one point.
export default {
  id: 's1', name: 'ORIGIN', dur: 8.0, hardIn: true,
  build(root, ctx) {
    const { g } = makeCanvas(root);
    const globe = makeGlobe(root, { meridians: 16, parallels: 9, tilt: 0.42 });
    const cx0 = W / 2, cy0 = H / 2, R0 = 280, CXR = 1400;
    const tags = TAGS.map((t, i) => {
      const line = el(root, 'abs', { height: '1px', background: 'rgba(125,184,224,.6)', opacity: 0 });
      const lab = mono(root, t, { size: 15, color: COLORS.accent });
      Object.assign(lab.style, { padding: '7px 11px', background: 'rgba(9,31,57,.8)', border: '1px solid rgba(125,184,224,.35)' });
      return { line, lab, i };
    });
    const hx = MX, hy = H / 2 - 190;
    const l1 = kin(root, ['Wellbeing', 'is'], { size: 92, weight: 800, x: hx, y: hy, w: 760 });
    const l2 = kin(root, ['no', 'longer'], { size: 92, weight: 800, x: hx, y: hy + 104, w: 760 });
    const l3 = el(root, 'abs serif', { left: `${hx}px`, top: `${hy + 196}px`, fontSize: '126px', lineHeight: 1.05, color: COLORS.accent, opacity: 0, whiteSpace: 'nowrap' }, 'one industry.');
    const ang = [-150, -90, -30, 30, 90, 150].map(a => a * Math.PI / 180);
    const RX = 480, RY = 345, ISZ = 118;
    const icons = PILLARS.map((p, i) => ({ ic: makeIcon(root, p.key, ctx), lab: mono(root, p.title.split(' &')[0], { size: 16, ls: 0.2, color: COLORS.mist, align: 'center', w: 300 }) }));
    const rest = i => [cx0 + Math.cos(ang[i]) * RX, cy0 + Math.sin(ang[i]) * RY];

    ctx.cue(0.0, 'swell', { dur: 1.3, gain: 0.5 }); ctx.cue(1.2, 'ping', { gain: 0.5 });
    [2.0, 2.4, 2.8].forEach(t => ctx.cue(t, 'tick', { gain: 0.4 })); ctx.cue(3.9, 'ping', { gain: 0.55 }); ctx.cue(4.3, 'ping', { gain: 0.5 });
    ctx.cue(5.4, 'air', { gain: 0.5 });
    icons.forEach((o, i) => ctx.cue(5.9 + i * 0.3, 'ping', { gain: 0.45 }));
    ctx.cue(7.3, 'sweep', { gain: 0.45 }); ctx.cue(7.9, 'hit', { gain: 0.55 });

    return lt => {
      const t = lt;
      g.clearRect(0, 0, W, H);
      const dotA = t < 1.0 ? 1 : t < 1.6 ? 1 - ease(prog(t, 1.0, 0.6)) : t < 7.2 ? 0 : ease(prog(t, 7.2, 0.5));
      drawDot(g, cx0, cy0, t, dotA, 1 + (t > 7.7 ? 0.8 * Math.sin(Math.PI * clamp((t - 7.7) / 0.5)) : 0));
      // globe: draw in, slide right for the headline, return to centre, collapse
      const sIn = easeIO(prog(t, 3.4, 0.7)), sOut = easeIO(prog(t, 5.0, 0.7));
      const cx = cx0 + (CXR - cx0) * (sIn - sOut), collapse = ease(prog(t, 7.1, 0.7));
      const R = lerp(0, R0, ease(prog(t, 1.0, 1.5))) * (1 - collapse) * (1 - 0.12 * (sIn - sOut));
      globe.update({ cx, cy: cy0, R, rot: t * 0.55, k: ease(prog(t, 1.0, 2.3)), alpha: 1 - collapse * 0.8 });
      tags.forEach(({ line, lab, i }) => {
        const k = ease(prog(t, 2.0 + i * 0.4, 0.7)) * (1 - ease(prog(t, 3.4, 0.35)));
        const a = [-2.5, -0.5, 0.9][i], ax = cx0 + Math.cos(a) * R0 * 0.94, ay = cy0 + Math.sin(a) * R0 * 0.94, side = Math.cos(a) > 0 ? 1 : -1;
        const len = 170 * k, ex = ax + side * len;
        Object.assign(line.style, { left: `${Math.min(ax, ex)}px`, top: `${ay}px`, width: `${len}px`, opacity: k.toFixed(3) });
        Object.assign(lab.style, { left: `${side > 0 ? ex + 8 : ex - 8 - 330}px`, top: `${ay - 17}px`, width: '330px', textAlign: side > 0 ? 'left' : 'right', opacity: k.toFixed(3) });
      });
      // headline (3.9–5.0)
      l1.set(t, 3.85, 4.95); l2.set(t, 4.05, 4.95);
      vis(l3, t, 4.35, { d: 26, t1: 4.95, outDur: 0.35 });
      // icons
      icons.forEach((o, i) => {
        const [rx, ry] = rest(i), ti = 5.35 + i * 0.1;
        const fly = ease(prog(t, ti, 0.9)), conv = easeIO(prog(t, 7.0, 0.8));
        const sx = rx + Math.cos(ang[i]) * 900, sy = ry + Math.sin(ang[i]) * 600;
        const fl = float(t, i), lit = clamp(1 - Math.abs(t - (6.1 + i * 0.3)) / 0.35);
        const x = lerp(lerp(sx, rx, fly), cx0, conv), y = lerp(lerp(sy, ry, fly), cy0, conv) + fl.dy * (1 - conv);
        o.ic.set({ x, y, size: ISZ, a: fly * (0.55 + 0.45 * lit) * (1 - conv * 0.9), sc: (0.85 + 0.15 * fly) * (1 + 0.12 * lit) * lerp(1, 0.15, conv), rot: fl.rot * (1 - conv) });
        o.lab.style.left = `${x - 150}px`; o.lab.style.top = `${y + ISZ * 0.68}px`;
        o.lab.style.opacity = (fly * (0.4 + 0.6 * lit) * (1 - ease(prog(t, 6.9, 0.3)))).toFixed(3);
      });
    };
  },
};
