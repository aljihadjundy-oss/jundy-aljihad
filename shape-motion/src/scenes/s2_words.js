import { E, clamp, prog, lerp, el, mono, statement, wipe, makeSlot, pad2, W, H } from '../lib.js';

// 02 — SEEN. CONNECTED. ACTIVATED. : what a brand gets from Shape, one word per promise, two stock clips under each (graded into the Shape palette).
export default {
  id: 'words', name: 'WHAT YOU GET', dur: 12.0, hardIn: true,
  build(root, ctx) {
    const PER = 4.0, CLIP = 2.0;
    const ids = ['f01', 'f02', 'f03', 'f04', 'f05', 'f06'];
    const slots = ids.map((id, i) => {
      const s = makeSlot(root, id, ctx, ctx.t0 + i * CLIP, CLIP);
      return s;
    });
    const words = ctx.content.words.map((w, i) => {
      const e = statement(root, w.word, 110, 640, { size: 170, color: 'var(--white)' });
      e.style.textShadow = '0 6px 40px rgba(5,14,26,.7)';
      const sub = mono(root, w.sub, 118, 868, { size: 20, ls: 0.28, color: 'var(--ice)' });
      const idx = mono(root, `WHAT YOU GET FROM SHAPE — ${pad2(i + 1)} / 03`, 118, 120, { size: 17, ls: 0.28, color: 'rgba(246,250,253,.75)' });
      const bar = el(root, 'abs', { left: '118px', top: '838px', width: '160px', height: '3px', background: 'var(--ice)', transformOrigin: '0 50%' });
      return { e, sub, idx, bar };
    });
    const flash = el(root, 'layer', { background: 'rgba(200,230,248,.9)', opacity: 0, mixBlendMode: 'screen' });
    const sweep = el(root, 'abs', { left: '0', top: '0', width: '160px', height: `${H}px`, background: 'linear-gradient(90deg, rgba(140,200,234,0), rgba(140,200,234,.22), rgba(140,200,234,0))', opacity: 0 });

    const cutAt = [0, 4, 8];
    cutAt.forEach((c, i) => ctx.cue(c + 0.1, 'hit', { gain: 0.55 }));   // soft bloom per promise
    [2, 6, 10].forEach(c => ctx.cue(c, 'tick', { gain: 0.4 }));
    ctx.cue(0.6, 'ping', { gain: 0.5 }); ctx.cue(4.6, 'ping', { gain: 0.5 }); ctx.cue(8.6, 'ping', { gain: 0.5 });

    return async lt => {
      const ci = clamp(Math.floor(lt / CLIP), 0, 5);
      const local = lt - ci * CLIP;
      await slots[ci].update(local);
      slots.forEach((s, i) => { s.el.style.display = i === ci ? '' : 'none'; });
      // punch + flash on every cut
      const f = (1 - E.outCubic(prog(local, 0, 0.16))) * (lt < 0.1 ? 0 : 0.22);
      flash.style.opacity = f.toFixed(3);
      sweep.style.opacity = ((ci % 2 === 0 ? 0.6 : 0) * (1 - prog(local, 0, 1.0))).toFixed(3);
      sweep.style.left = `${lerp(-200, W, E.inOutCubic(prog(local, 0, 1.0)))}px`;
      words.forEach((w, i) => {
        const lw = lt - i * PER;
        const on = lw >= -0.01 && lw < PER + 0.01;
        for (const x of [w.e, w.sub, w.idx, w.bar]) x.style.display = on ? '' : 'none';
        if (!on) return;
        const k = E.outExpo(prog(lw, 0.05, 0.9));
        wipe(w.e, k, 'up');
        w.e.style.transform = `translate3d(0,${((1 - k) * 60).toFixed(1)}px,0)`;
        const out = E.inCubic(prog(lw, PER - 0.25, 0.25));
        w.e.style.opacity = (1 - out).toFixed(3);
        w.sub.style.opacity = (E.outExpo(prog(lw, 0.5, 0.7)) * (1 - out)).toFixed(3);
        w.idx.style.opacity = (E.outExpo(prog(lw, 0.2, 0.7)) * (1 - out)).toFixed(3);
        w.bar.style.transform = `scaleX(${(E.outExpo(prog(lw, 0.3, 0.9)) * (1 - out)).toFixed(4)})`;
      });
    };
  },
};
