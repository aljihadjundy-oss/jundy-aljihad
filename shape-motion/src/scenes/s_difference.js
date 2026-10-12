import { E, clamp, prog, lerp, el, mono, statement, W, H } from '../lib.js';

// 11 — why Shape is different: four "not this, but that" shifts.
export default {
  id: 'difference', name: 'WHY SHAPE', dur: 8.0,
  build(root, ctx) {
    const D = ctx.content.difference;
    const kick = mono(root, 'WHY SHAPE IS DIFFERENT', 116, 150, { size: 17, ls: 0.3 });
    const title = statement(root, [{ t: 'NOT JUST ANOTHER ' }, { t: 'expo.', c: 'serif' }], 110, 190, { size: 88 });
    const Y0 = 400, DY = 130;
    const rows = D.map(([a, b], i) => {
      const y = Y0 + i * DY, t = 1.4 + i * 1.2;
      const from = el(root, 'abs hl', { left: '116px', top: `${y}px`, fontSize: '54px', color: 'rgba(246,250,253,.45)', whiteSpace: 'nowrap' }, a);
      const strike = el(root, 'abs', { left: '116px', top: `${y + 34}px`, height: '3px', background: 'var(--ice)', transformOrigin: '0 50%', width: '0px' });
      const arrow = mono(root, '→', 760, y + 4, { size: 44, ls: 0, color: 'var(--ice)' });
      const to = el(root, 'abs hl', { left: '880px', top: `${y}px`, fontSize: '54px', whiteSpace: 'nowrap', color: 'var(--white)' }, b);
      return { from, strike, arrow, to, t, y };
    });
    ctx.cue(0.3, 'swell', { dur: 1.8, gain: 0.45 });
    rows.forEach(r => { ctx.cue(r.t + 0.5, 'ping', { gain: 0.45 }); ctx.cue(r.t, 'tick', { gain: 0.3 }); });
    ctx.cue(6.4, 'hit', { gain: 0.4 });
    return lt => {
      const vis = (e, t, d = 20) => { const k = E.outExpo(prog(lt, t, 0.8)); e.style.opacity = k.toFixed(3); e.style.transform = `translate3d(0,${((1 - k) * d).toFixed(1)}px,0)`; };
      vis(kick, 0.1, 10); vis(title, 0.3, 36);
      rows.forEach(r => {
        const a = E.outExpo(prog(lt, r.t, 0.7));
        r.from.style.opacity = a.toFixed(3); r.from.style.transform = `translate3d(${((1 - a) * -30).toFixed(1)}px,0,0)`;
        r.strike.style.width = `${(r.from.offsetWidth || 400) * E.inOutCubic(prog(lt, r.t + 0.45, 0.4))}px`;
        vis(r.arrow, r.t + 0.45, 0); vis(r.to, r.t + 0.6, 24);
      });
    };
  },
};
