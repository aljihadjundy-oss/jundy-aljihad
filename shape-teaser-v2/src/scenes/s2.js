import { E, clamp, prog, lerp, el, mono, kin, vis, makeSlot, ease, easeIO, pad2, W, H, MX, MY, COLORS } from '../lib.js';
import { TRIO } from '../brand.js';

// S2 · THREE WORDS (8–18 s). GTFN rhythm: full-bleed graded footage, one huge word at a time, bottom-left; two cuts per word.
export default {
  id: 's2', name: 'THREE WORDS', dur: 10.0, hardOut: false,
  build(root, ctx) {
    const CUTS = ['s2-venue', 's1-biometric', 's2-b2b', 's4-matchmaking', 's2-community', 's1-athlete'], SEG = 10 / 6;
    const slots = CUTS.map((id, i) => makeSlot(root, id, ctx, ctx.t0 + i * SEG, SEG + 0.2, { kb: [i % 2 ? 1 : -1, i % 3 === 0 ? -1 : 0], dim: id === 's2-venue' ? 0.3 : 0.1 }));
    const wsz = 188;
    const words = TRIO.map((t, i) => kin(root, [t], { size: wsz, weight: 800, x: MX, y: H - MY - wsz * 1.12 - 6, w: W - 2 * MX }));
    const cnt = TRIO.map((t, i) => mono(root, `SHAPE INDONESIA · ${pad2(i + 1)} / 03`, { x: MX, y: 128, size: 17, ls: 0.28, color: COLORS.mist }));
    const bar = TRIO.map((t, i) => el(root, 'abs', { left: `${MX}px`, top: `${H - MY + 4}px`, width: '120px', height: '3px', background: COLORS.accent, transformOrigin: '0 50%', opacity: 0 }));
    const flash = el(root, 'layer', { background: '#fff', opacity: 0 });
    TRIO.forEach((_, i) => { const t = i * 10 / 3; ctx.cue(t + 0.05, 'hit', { gain: 0.45 }); ctx.cue(t + 0.35, 'ping', { gain: 0.6 }); });
    CUTS.forEach((_, i) => { if (i % 2) ctx.cue(i * SEG, 'air', { gain: 0.4 }); });
    return async lt => {
      const ci = clamp(Math.floor((lt + 1e-4) / SEG), 0, 5), local = lt - ci * SEG;
      slots.forEach((s, i) => { s.el.style.display = i === ci ? '' : 'none'; });
      await slots[ci].update(local);
      flash.style.opacity = ((1 - ease(prog(local, 0, 0.14))) * (lt < 0.1 ? 0 : 0.1)).toFixed(3);
      const wi = clamp(Math.floor((lt + 1e-4) / (10 / 3)), 0, 2), lw = lt - wi * 10 / 3;
      words.forEach((w, i) => {
        const on = i === wi;
        w.box.style.display = on ? 'flex' : 'none'; cnt[i].style.display = bar[i].style.display = on ? '' : 'none';
        if (!on) return;
        w.set(lw, 0.12, 10 / 3 - 0.25, 0.1);
        cnt[i].style.opacity = ease(prog(lw, 0.1, 0.6)).toFixed(3);
        bar[i].style.opacity = ease(prog(lw, 0.3, 0.4)).toFixed(3); bar[i].style.transform = `scaleX(${ease(prog(lw, 0.3, 0.9)).toFixed(3)})`;
      });
    };
  },
};
