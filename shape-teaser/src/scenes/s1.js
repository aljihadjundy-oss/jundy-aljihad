import { E, clamp, prog, lerp, el, mono, kin, makeSlot, makeIcon, makeCanvas, float, ease, easeIO, rng, drawDot, W, H, P, MX, MY, COLORS } from '../lib.js';
import { HOOK, PILLARS } from '../brand.js';

// S1 · FRAGMENTATION (0–8 s). A pulsing dot, four cold fragments, then six SHAPE icons drifting in as separate pieces that collapse into one point.
export default {
  id: 's1', name: 'FRAGMENTATION', dur: 8.0, hardIn: true,
  build(root, ctx) {
    const R = rng(3), cx = W / 2, cy = H / 2;
    const { g } = makeCanvas(root);
    const PART = Array.from({ length: 80 }, () => ({ a: R() * 6.283, r: (0.2 + R() * 0.8) * Math.hypot(W, H) * 0.5, ph: R() * 6.28, sp: 0.6 + R() }));
    const rects = P ? [[.10, .07, .45, .12], [.50, .13, .40, .12], [.10, .23, .45, .12], [.50, .30, .40, .12]]
                    : [[.08, .08, .26, .36], [.37, .06, .21, .27], [.62, .11, .24, .3], [.33, .38, .22, .26]];
    const ids = ['s1-athlete', 's1-biometric', 's1-meditation', 's1-aesthetic'], T0 = [1.0, 1.75, 2.5, 3.25], LEAVE = 4.9;
    const frames = ids.map((id, i) => {
      const [fx, fy, fw, fh] = rects[i];
      const sl = makeSlot(root, id, ctx, ctx.t0 + T0[i], LEAVE + 0.6 - T0[i], { x: fx * W, y: fy * H, w: fw * W, h: fh * H, cold: true, kb: [i % 2 ? 1 : -1, 0] });
      sl.el.style.outline = '1px solid rgba(125,184,224,.4)';
      return sl;
    });
    const size = P ? 84 : 78;
    const words = P ? HOOK.line.flatMap(l => l).map(t => t === HOOK.accent ? { t, c: 'acc' } : t)
                    : [...HOOK.line[0], 'br', ...HOOK.line[1]].map(t => t === HOOK.accent ? { t, c: 'acc' } : t);
    const head = kin(root, words, { size, x: MX, y: H - MY - size * 1.12 * (P ? 3 : 2), w: W - 2 * MX });
    // six icons on a ring
    const ang = [-150, -90, -30, 30, 90, 150].map(a => a * Math.PI / 180);
    const RX = P ? W * 0.31 : W * 0.25, RY = P ? H * 0.17 : H * 0.3, ISZ = P ? 150 : 128;
    const icons = PILLARS.map((p, i) => ({ ic: makeIcon(root, p.key, ctx), lab: mono(root, p.title.split(' &')[0], { size: P ? 20 : 17, ls: 0.2, color: COLORS.mist, align: 'center', w: 320 }), i }));
    const rest = i => [cx + Math.cos(ang[i]) * RX, cy + Math.sin(ang[i]) * RY];

    ctx.cue(0.0, 'swell', { dur: 1.2, gain: 0.5 });
    T0.forEach((t, i) => ctx.cue(t, 'ping', { gain: 0.5 }));
    ctx.cue(1.5, 'air', { gain: 0.5 });
    icons.forEach((o, i) => { ctx.cue(5.1 + i * 0.35, 'ping', { gain: 0.5 }); });
    ctx.cue(7.1, 'sweep', { gain: 0.5 });
    ctx.cue(7.9, 'hit', { gain: 0.6 });

    return async lt => {
      g.clearRect(0, 0, W, H);
      const t = lt;
      // particles drift toward the centre while the fragments are on screen
      const pa = ease(prog(t, 0.8, 0.8)) * (1 - ease(prog(t, 4.8, 0.7)));
      if (pa > 0) PART.forEach(p => {
        const k = ease(prog(t, 1.0, 3.9)) * 0.8, r = p.r * (1 - k * p.sp * 0.8) + Math.sin(t * 0.7 + p.ph) * 6;
        const x = cx + Math.cos(p.a + t * 0.03) * r, y = cy + Math.sin(p.a + t * 0.03) * r;
        g.fillStyle = `rgba(125,184,224,${(pa * (0.25 + 0.4 * (0.5 + 0.5 * Math.sin(t * 1.6 + p.ph)))).toFixed(3)})`;
        g.beginPath(); g.arc(x, y, 1.4, 0, 6.283); g.fill();
      });
      // central dot: frame 0 hero, hidden while fragments play, back for the icon ring
      const dotA = t < 1.0 ? 1 : t < 1.5 ? 1 - ease(prog(t, 1.0, 0.5)) : t < 4.9 ? 0 : ease(prog(t, 4.9, 0.6));
      let ds = 1;
      if (t > 7.5) ds = 1 + 0.9 * Math.sin(Math.PI * clamp((t - 7.5) / 0.7)) * (t < 8.3 ? 1 : 0);
      drawDot(g, cx, cy, t, dotA, ds * (P ? 0.8 : 1));
      // dotted spokes
      const sp = ease(prog(t, 5.3, 1.2)) * (1 - ease(prog(t, 7.2, 0.6)));
      if (sp > 0) {
        g.setLineDash([2, 9]); g.lineWidth = 1.6; g.strokeStyle = `rgba(125,184,224,${(0.55 * sp).toFixed(3)})`;
        icons.forEach((o, i) => { const [x, y] = rest(i); g.beginPath(); g.moveTo(cx + (x - cx) * 0.12, cy + (y - cy) * 0.12); g.lineTo(cx + (x - cx) * (0.12 + 0.76 * sp), cy + (y - cy) * (0.12 + 0.76 * sp)); g.stroke(); });
        g.setLineDash([]);
      }
      // fragments
      frames.forEach((sl, i) => {
        const k = ease(prog(t, T0[i], 0.7)), out = ease(prog(t, LEAVE, 0.55));
        sl.el.style.opacity = (k * (1 - out)).toFixed(3);
        sl.el.style.transform = `translate3d(0,${((1 - k) * 16).toFixed(1)}px,0) scale(${(0.97 + 0.03 * k).toFixed(4)})`;
      });
      await Promise.all(frames.map((sl, i) => sl.update(t - T0[i])));
      head.set(t, 1.5, 4.7);
      // icons
      icons.forEach((o, i) => {
        const [rx, ry] = rest(i), ti = 5.0 + i * 0.1;
        const fly = ease(prog(t, ti, 1.0)), conv = easeIO(prog(t, 7.1, 0.8));
        const sx = rx + Math.cos(ang[i]) * W * 0.5, sy = ry + Math.sin(ang[i]) * H * 0.5;
        const fl = float(t, i), lit = clamp(1 - Math.abs(t - (5.45 + i * 0.35)) / 0.4);
        const x = lerp(lerp(sx, rx, fly), cx, conv), y = lerp(lerp(sy, ry, fly), cy, conv) + fl.dy * (1 - conv);
        const sc = (0.85 + 0.15 * fly) * (1 + 0.1 * lit) * lerp(1, 0.15, conv);
        o.ic.set({ x, y, size: ISZ * (0.8 + 0.2 * ((i * 37) % 5) / 4), a: fly * (0.6 + 0.4 * lit) * (1 - conv * 0.9), sc, rot: fl.rot * (1 - conv) });
        const la = fly * (0.45 + 0.55 * lit) * (1 - ease(prog(t, 7.0, 0.35)));
        o.lab.style.left = `${x - 160}px`; o.lab.style.top = `${y + ISZ * 0.62}px`; o.lab.style.opacity = la.toFixed(3);
      });
    };
  },
};
