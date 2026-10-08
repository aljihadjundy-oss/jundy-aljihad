import { E, clamp, prog, lerp, el, mono, makeGlobe, wipe, typed, W, H } from '../lib.js';

// 01 — cold open: a point of light becomes a wireframe globe; the Shape wordmark lands with an impact.
export default {
  id: 'open', name: 'ORIGIN', dur: 6.0,
  build(root, ctx) {
    const globe = makeGlobe(root, { meridians: 16, parallels: 9, tilt: 0.42 });
    const dot = el(root, 'abs', { width: '10px', height: '10px', borderRadius: '50%', background: 'var(--white)', boxShadow: '0 0 40px 14px rgba(140,200,234,.7)', left: `${W / 2 - 5}px`, top: `${H / 2 - 5}px` });
    const tags = [
      ['01 · SOUTHEAST ASIA PLATFORM', 0, -1, 2.2],
      ['02 · B2B + B2C', 1, 0.2, 2.6],
      ['03 · NICE PIK 2 · JAKARTA', 0, 1, 3.0],
    ].map(([txt, side, dy, tin]) => {
      const line = el(root, 'abs', { height: '1px', background: 'rgba(140,200,234,.6)', transformOrigin: side ? '100% 50%' : '0 50%' });
      const lab = mono(root, txt, 0, 0, { size: 15, color: 'var(--ice)' });
      lab.style.padding = '6px 10px'; lab.style.background = 'rgba(5,14,26,.75)'; lab.style.border = '1px solid rgba(140,200,234,.35)';
      return { line, lab, side, dy, tin };
    });
    const logo = el(root, 'abs', { left: '1000px', top: '0', width: '760px', opacity: 0 }, null, 'img');
    logo.src = ctx.logo;
    const sub = mono(root, '', 1000, 0, { size: 17, w: 760, color: 'var(--ice)', ls: 0.3 });
    const flash = el(root, 'layer', { background: 'radial-gradient(circle at 70% 50%, rgba(246,250,253,.3), rgba(140,200,234,0) 55%)', opacity: 0 });

    ctx.cue(0.35, 'ping', { gain: 0.8 });
    ctx.cue(1.0, 'riser', { dur: 2.9 });
    [2.2, 2.6, 3.0].forEach(x => ctx.cue(x, 'tick'));
    ctx.cue(3.9, 'hit', { gain: 1.0 });
    ctx.cue(4.0, 'breath');
    ctx.cue(4.7, 'ping', { gain: 0.5 });

    return lt => {
      const dk = E.outExpo(prog(lt, 0.2, 0.7)) * (1 - E.inCubic(prog(lt, 1.0, 0.5)));
      dot.style.opacity = dk.toFixed(3);
      const gk = E.inOutCubic(prog(lt, 0.9, 2.2));
      const shift = E.inOutQuart(prog(lt, 3.5, 1.1));
      const cx = lerp(W / 2, 520, shift), cy = H / 2, R = lerp(0, 300, E.outExpo(prog(lt, 0.9, 1.6))) * lerp(1, 0.86, shift);
      globe.update({ cx, cy, R, rot: lt * 0.55, k: gk, alpha: 1 });
      tags.forEach(({ line, lab, side, dy, tin }) => {
        const k = E.outExpo(prog(lt, tin, 0.8)) * (1 - E.inCubic(prog(lt, 3.5, 0.4)));
        const ang = (side ? -0.55 : -2.6) + dy * 0.6;
        const ax = cx + Math.cos(ang) * R * 0.92, ay = cy + Math.sin(ang) * R * 0.92;
        const len = 150 * k, ex = ax + (side ? 1 : -1) * len, ey = ay + dy * 20;
        Object.assign(line.style, { left: `${Math.min(ax, ex)}px`, top: `${ay}px`, width: `${len}px`, opacity: k.toFixed(3), transform: `rotate(${(Math.atan2(ey - ay, ex - ax) * 180 / Math.PI + (side ? 0 : 180)).toFixed(2)}deg)` });
        line.style.transformOrigin = side ? '0 50%' : '100% 50%';
        Object.assign(lab.style, { left: `${side ? ex + 8 : ex - 8 - 330}px`, top: `${ey - 18}px`, width: '330px', textAlign: side ? 'left' : 'right', opacity: k.toFixed(3) });
      });
      const lk = E.outExpo(prog(lt, 3.9, 1.0));
      const lw = 760, lh = lw * 1056 / 3044;
      Object.assign(logo.style, { top: `${H / 2 - lh / 2 - 20}px`, opacity: lk > 0 ? 1 : 0, filter: `blur(${((1 - lk) * 18).toFixed(1)}px)`, transform: `scale(${(1.06 - 0.06 * lk).toFixed(4)})` });
      wipe(logo, E.outExpo(prog(lt, 3.9, 0.9)));
      sub.style.top = `${H / 2 + lh / 2 + 10}px`;
      typed(sub, [{ t: 'EXPO 2027 · NICE PIK 2 · JAKARTA' }], prog(lt, 4.6, 1.0));
      const f = E.outCubic(prog(lt, 3.9, 0.15)) * (1 - E.inCubic(prog(lt, 4.05, 0.7)));
      flash.style.opacity = f.toFixed(3);
    };
  },
};
