import { E, clamp, prog, lerp, el, mono, typed, makeCanvas, rng, W, H } from '../lib.js';

// 03 — the provocative question over a drifting particle field (the "pause" before the map).
export default {
  id: 'question', name: 'THE QUESTION', dur: 5.0,
  build(root, ctx) {
    const { c, g } = makeCanvas(root);
    const r = rng(21);
    const P = Array.from({ length: 260 }, () => ({ x: r() * W, y: r() * H, z: 0.3 + r() * 0.7, ph: r() * 6.28, vx: (r() - 0.5) * 8, vy: -4 - r() * 10 }));
    const l1 = mono(root, '', 0, 452, { size: 46, ls: 0.2, w: W, align: 'center', color: 'var(--white)' });
    const l2 = mono(root, '', 0, 522, { size: 46, ls: 0.2, w: W, align: 'center', color: 'var(--white)' });
    const ring = el(root, 'abs', { left: `${W / 2 - 360}px`, top: `${H / 2 - 360}px`, width: '720px', height: '720px', borderRadius: '50%', border: '1px solid rgba(140,200,234,.25)', opacity: 0 });
    ctx.cue(0.0, 'riser', { dur: 1.4, gain: 0.5 });
    [0.5, 0.9, 1.3, 1.7, 2.1].forEach((x, i) => ctx.cue(x, 'tick', { gain: 0.4 }));
    ctx.cue(2.35, 'ping', { gain: 0.7 });
    ctx.cue(3.0, 'swell', { dur: 2.0 });
    return lt => {
      g.clearRect(0, 0, W, H);
      const a = E.outCubic(prog(lt, 0, 0.8));
      P.forEach(p => {
        const x = (p.x + p.vx * lt + W) % W, y = (p.y + p.vy * lt + H) % H;
        const tw = 0.5 + 0.5 * Math.sin(lt * 2.2 + p.ph);
        g.fillStyle = `rgba(140,200,234,${(0.15 + 0.6 * tw) * p.z * a})`;
        g.beginPath(); g.arc(x, y, 1 + p.z * 1.8, 0, 6.283); g.fill();
      });
      typed(l1, [{ t: 'WHERE DOES THE WELLNESS ECONOMY' }], prog(lt, 0.4, 1.4));
      typed(l2, [{ t: 'MEET ITS ' }, { t: 'BUYERS?', c: 'ice' }], prog(lt, 1.9, 1.2));
      ring.style.opacity = (E.outExpo(prog(lt, 2.4, 1.2)) * 0.8).toFixed(3);
      ring.style.transform = `scale(${(0.6 + 0.4 * E.outExpo(prog(lt, 2.4, 1.6))).toFixed(4)})`;
    };
  },
};
