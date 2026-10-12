import { E, clamp, prog, lerp, el, mono, statement, makeSlot, pad2, W, H } from '../lib.js';

// 07 — what you do at Shape: five ways to activate a business live. Dimmed expo-floor plate behind.
export default {
  id: 'doing', name: 'WHAT YOU DO', dur: 9.0,
  build(root, ctx) {
    const slot = makeSlot(root, 'f07', ctx, ctx.t0, 9.0, { quiet: true });
    el(root, 'layer', { background: 'rgba(5,14,26,.72)' });
    const D = ctx.content.doing;
    const kick = mono(root, 'WHAT YOU DO AT SHAPE', 116, 150, { size: 17, ls: 0.3 });
    const s1 = statement(root, 'YOUR BUSINESS MODEL,', 110, 190, { size: 76 });
    const s2 = statement(root, [{ t: 'live.', c: 'serif' }], 110, 280, { size: 96, color: 'var(--ice)' });
    const CW = 330, GAP = 20, X0 = (W - (5 * CW + 4 * GAP)) / 2, Y = 560;
    const cards = D.map((d, i) => {
      const x = X0 + i * (CW + GAP);
      const box = el(root, 'abs', { left: `${x}px`, top: `${Y}px`, width: `${CW}px`, height: '300px', border: '1px solid rgba(140,200,234,.45)', background: 'rgba(8,40,56,.7)' });
      const top = el(box, 'abs', { left: 0, top: 0, width: `${CW}px`, height: '3px', background: 'var(--ice)', transformOrigin: '0 50%' });
      mono(box, pad2(i + 1), 24, 24, { size: 15, color: 'rgba(246,250,253,.5)' });
      mono(box, d.k, 24, 74, { size: 22, ls: 0.14, color: 'var(--white)' });
      const desc = el(box, 'abs', { left: '24px', top: '130px', width: `${CW - 48}px`, fontSize: '22px', lineHeight: 1.35, fontWeight: 600, color: 'rgba(246,250,253,.82)' }, d.d);
      return { box, top, t: 1.8 + i * 0.9 };
    });
    ctx.cue(0.4, 'swell', { dur: 2.2, gain: 0.5 });
    cards.forEach(c => { ctx.cue(c.t, 'rise', { gain: 0.5 }); ctx.cue(c.t + 0.35, 'ping', { gain: 0.4 }); });
    return async lt => {
      await slot.update(lt);
      const vis = (e, t, d = 20) => { const k = E.outExpo(prog(lt, t, 0.8)); e.style.opacity = k.toFixed(3); e.style.transform = `translate3d(0,${((1 - k) * d).toFixed(1)}px,0)`; };
      vis(kick, 0.2, 10); vis(s1, 0.4, 36); vis(s2, 0.9, 36);
      cards.forEach(c => { vis(c.box, c.t, 30); c.top.style.transform = `scaleX(${E.outExpo(prog(lt, c.t + 0.2, 0.8)).toFixed(3)})`; });
    };
  },
};
