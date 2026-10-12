import { E, clamp, prog, lerp, el, mono, statement, pad2, W, H } from '../lib.js';

// 08 — how it happens: the Shape Connect flow as six steps along a rail, running year-round.
export default {
  id: 'pipeline', name: 'HOW IT HAPPENS', dur: 8.0,
  build(root, ctx) {
    const S = ctx.content.pipeline;
    const kick = mono(root, 'SHAPE CONNECT · HOW IT HAPPENS', 0, 190, { size: 17, ls: 0.3, w: W, align: 'center' });
    const title = statement(root, [{ t: 'FROM HELLO TO ' }, { t: 'deal.', c: 'serif' }], 0, 232, { size: 84 });
    title.style.width = `${W}px`; title.style.textAlign = 'center';
    const Y = 580, X0 = 220, X1 = 1700, dx = (X1 - X0) / (S.length - 1);
    const track = el(root, 'abs', { left: `${X0}px`, top: `${Y}px`, width: `${X1 - X0}px`, height: '2px', background: 'rgba(140,200,234,.25)' });
    const fill = el(root, 'abs', { left: `${X0}px`, top: `${Y - 1}px`, width: `${X1 - X0}px`, height: '4px', background: 'linear-gradient(90deg, var(--sky), var(--ice))', transformOrigin: '0 50%' });
    const nodes = S.map((n, i) => {
      const x = X0 + i * dx, last = i === S.length - 1, sz = last ? 40 : 26;
      const dot = el(root, 'abs', { left: `${x - sz / 2 + 1}px`, top: `${Y + 1 - sz / 2}px`, width: `${sz}px`, height: `${sz}px`, borderRadius: '50%', background: last ? 'var(--white)' : 'var(--bg)', border: `3px solid ${last ? 'var(--white)' : 'var(--ice)'}` });
      const num = mono(root, pad2(i + 1), x - 40, Y - 80, { size: 15, ls: 0.2, w: 80, align: 'center', color: 'rgba(246,250,253,.5)' });
      const name = el(root, 'abs', { left: `${x - 120}px`, width: '240px', textAlign: 'center', top: `${Y + 50}px`, fontSize: last ? '38px' : '30px', fontWeight: 800, letterSpacing: '0.02em' }, n);
      return { dot, num, name, t: 1.2 + i * 0.85 };
    });
    const note = mono(root, 'VERIFIED PROFILES · MEETINGS WITH PURPOSE · ONLINE, YEAR-ROUND, THEN ON THE EXPO FLOOR', 0, 840, { size: 17, ls: 0.2, w: W, align: 'center', color: 'rgba(246,250,253,.85)' });
    ctx.cue(0.3, 'swell', { dur: 1.8, gain: 0.45 });
    nodes.forEach((n, i) => ctx.cue(n.t, 'ping', { gain: 0.35 + 0.1 * i }));
    ctx.cue(6.1, 'hit', { gain: 0.4 });
    return lt => {
      const vis = (e, t, d = 20) => { const k = E.outExpo(prog(lt, t, 0.8)); e.style.opacity = k.toFixed(3); e.style.transform = `translate3d(0,${((1 - k) * d).toFixed(1)}px,0)`; };
      vis(kick, 0.1, 10); vis(title, 0.3, 36); vis(note, 5.6, 10);
      track.style.opacity = E.outCubic(prog(lt, 0.4, 0.6)).toFixed(3);
      fill.style.transform = `scaleX(${E.inOutCubic(prog(lt, 1.2, 4.25)).toFixed(4)})`;
      nodes.forEach(n => {
        n.dot.style.transform = `scale(${E.outBack(prog(lt, n.t, 0.6)).toFixed(3)})`;
        vis(n.num, n.t, 10); vis(n.name, n.t + 0.1, 18);
      });
    };
  },
};
