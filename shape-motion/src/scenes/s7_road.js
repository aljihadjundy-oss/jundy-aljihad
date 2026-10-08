import { E, clamp, prog, lerp, el, mono, statement, pad2, W, H } from '../lib.js';

// 07 — the road to the expo: a rail fills left to right and each milestone lands as the line reaches it.
export default {
  id: 'road', name: 'THE ROAD TO SHAPE', dur: 6.0,
  build(root, ctx) {
    const R = ctx.content.road;
    const kick = mono(root, 'THE TIMELINE', 116, 190, { size: 17, ls: 0.3 });
    const title = statement(root, [{ t: 'THE ROAD TO ' }, { t: 'Shape Expo 2027.', c: 'serif' }], 110, 226, { size: 64 });
    const Y = 590, X0 = 180, X1 = 1740;
    const track = el(root, 'abs', { left: `${X0}px`, top: `${Y}px`, width: `${X1 - X0}px`, height: '2px', background: 'rgba(140,200,234,.25)' });
    const fill = el(root, 'abs', { left: `${X0}px`, top: `${Y - 1}px`, width: `${X1 - X0}px`, height: '4px', background: 'linear-gradient(90deg, var(--sky), var(--ice))', transformOrigin: '0 50%' });
    const head = el(root, 'abs', { width: '16px', height: '16px', borderRadius: '50%', background: 'var(--white)', boxShadow: '0 0 30px 8px rgba(140,200,234,.8)', top: `${Y - 7}px` });
    const xs = [180, 780, 1380];
    const nodes = R.map((r, i) => {
      const last = i === R.length - 1, x = xs[i];
      const dotSize = last ? 34 : 22;
      const dot = el(root, 'abs', { left: `${x - dotSize / 2 + 1}px`, top: `${Y + 1 - dotSize / 2}px`, width: `${dotSize}px`, height: `${dotSize}px`, borderRadius: '50%', background: last ? 'var(--white)' : 'var(--bg)', border: `3px solid ${last ? 'var(--white)' : 'var(--ice)'}` });
      const ring = el(root, 'abs', { left: `${x - 40}px`, top: `${Y + 1 - 40}px`, width: '80px', height: '80px', borderRadius: '50%', border: '1px solid rgba(140,200,234,.7)' });
      const when = mono(root, r.when, x, Y - 140, { size: 18, ls: 0.26, color: 'var(--ice)' });
      const idx = mono(root, pad2(i + 1), x, Y - 100, { size: 14, ls: 0.2, color: 'rgba(246,250,253,.5)' });
      const name = el(root, 'abs', { left: `${x}px`, top: `${Y + 52}px`, fontSize: last ? '44px' : '36px', fontWeight: 800, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }, r.title);
      const line = mono(root, r.line, x, Y + (last ? 112 : 106), { size: 17, ls: 0.06, color: 'rgba(246,250,253,.8)' });
      const stem = el(root, 'abs', { left: `${x}px`, top: `${Y - 76}px`, width: '1px', height: '68px', background: 'rgba(140,200,234,.5)', transformOrigin: '50% 100%' });
      return { dot, ring, when, idx, name, line, stem, x, tin: 0.8 + (x - X0) / (X1 - X0) * 3.2 };
    });
    ctx.cue(0.3, 'whoosh', { gain: 0.5 });
    ctx.cue(0.8, 'sweep', { gain: 0.5 });
    nodes.forEach((n, i) => ctx.cue(n.tin, i === nodes.length - 1 ? 'hit' : 'ping', { gain: i === nodes.length - 1 ? 0.8 : 0.7 }));

    return lt => {
      const k = E.inOutCubic(prog(lt, 0.8, 3.2));
      fill.style.transform = `scaleX(${k.toFixed(4)})`;
      head.style.left = `${X0 + (X1 - X0) * k - 8}px`;
      head.style.opacity = (k > 0 && k < 1 ? 1 : 0).toString();
      const vis = (e, t, d = 20) => { const q = E.outExpo(prog(lt, t, 0.8)); e.style.opacity = q.toFixed(3); e.style.transform = `translate3d(0,${((1 - q) * d).toFixed(1)}px,0)`; };
      vis(kick, 0.1, 10); vis(title, 0.25, 36); track.style.opacity = E.outCubic(prog(lt, 0.2, 0.6)).toFixed(3);
      nodes.forEach((n, i) => {
        const q = E.outBack(prog(lt, n.tin, 0.6));
        n.dot.style.transform = `scale(${q.toFixed(3)})`;
        const cyc = ((lt - n.tin) % 2.2) / 2.2;
        n.ring.style.opacity = (lt > n.tin ? (1 - cyc) * 0.8 : 0).toFixed(3);
        n.ring.style.transform = `scale(${(0.3 + cyc * 1.1).toFixed(3)})`;
        vis(n.when, n.tin, 14); vis(n.idx, n.tin + 0.1, 10); vis(n.name, n.tin + 0.15, 22); vis(n.line, n.tin + 0.3, 10);
        n.stem.style.transform = `scaleY(${E.outExpo(prog(lt, n.tin, 0.6)).toFixed(3)})`;
      });
    };
  },
};
