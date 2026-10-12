import { E, clamp, prog, lerp, el, mono, kin, vis, makeSlot, makeIcon, float, ease, easeIO, pad2, W, H, MX, MY, COLORS } from '../lib.js';
import { PILLARS, THEME_TINT } from '../brand.js';

// S3 · SIX THEMES (18–36 s). Estra-style carousel: a footage circle with the SHAPE icon floating on its edge, one theme at a time, progress dots; then all six together.
export default {
  id: 's3', name: 'SIX THEMES', dur: 18.0,
  build(root, ctx) {
    const SEG = 2.6, TOG = 6 * SEG, CX = 560, CY = 540, D = 640;
    const tint = el(root, 'layer', {});
    const rings = [D + 90, D + 210].map(d => el(root, 'abs', { left: `${CX - d / 2}px`, top: `${CY - d / 2}px`, width: `${d}px`, height: `${d}px`, borderRadius: '50%', border: '1px solid rgba(125,184,224,.22)' }));
    const cards = PILLARS.map((p, i) => {
      const circ = el(root, 'abs', { left: `${CX - D / 2}px`, top: `${CY - D / 2}px`, width: `${D}px`, height: `${D}px`, borderRadius: '50%', overflow: 'hidden', boxShadow: '0 0 0 3px rgba(255,255,255,.14)' });
      const slot = makeSlot(circ, p.footage, ctx, ctx.t0 + i * SEG, SEG + 0.1, { x: 0, y: 0, w: D, h: D, kb: [i % 2 ? 1 : -1, 0] });
      const ic = makeIcon(root, p.key, ctx);
      const col = el(root, 'abs', { left: '1030px', top: '300px', width: '736px', display: 'flex', flexDirection: 'column', rowGap: '22px' });
      const cnt = mono(col, `${pad2(i + 1)} / 06`, { flow: true, size: 19, ls: 0.28, color: COLORS.accent });
      const title = kin(col, p.title.split(' '), { flow: true, size: 98, weight: 800, w: 736, lh: 1.04 });
      const desc = el(col, '', { fontSize: '29px', fontWeight: 400, color: COLORS.mist, lineHeight: 1.4, opacity: 0, maxWidth: '640px' }, p.desc);
      return { circ, slot, ic, col, cnt, title, desc };
    });
    const dots = PILLARS.map((_, i) => el(root, 'abs', { top: `${H - MY - 6}px`, height: '10px', borderRadius: '5px', background: COLORS.mist }));
    // together
    const tg1 = kin(root, ['Six', 'themes.'], { size: 104, weight: 800, center: true, x: 0, y: 190, w: W });
    const tg2 = el(root, 'abs serif', { left: 0, width: `${W}px`, top: '318px', textAlign: 'center', fontSize: '120px', color: COLORS.accent, opacity: 0 }, 'one platform.');
    const row = PILLARS.map(p => makeIcon(root, p.key, ctx));

    PILLARS.forEach((_, i) => { const t = i * SEG; ctx.cue(t, 'hit', { gain: 0.4 }); ctx.cue(t + 0.3, 'ping', { gain: 0.55 }); ctx.cue(t + 0.9, 'tick', { gain: 0.3 }); });
    ctx.cue(TOG, 'swell', { dur: 1.6, gain: 0.7 }); ctx.cue(TOG + 0.5, 'ping', { gain: 0.6 }); ctx.cue(TOG + 1.1, 'ping', { gain: 0.5 });

    return async lt => {
      const tog = lt >= TOG - 0.1, ci = clamp(Math.floor((lt + 1e-4) / SEG), 0, 5), local = lt - ci * SEG;
      const swap = ease(prog(local, 0, 0.5));
      const tc = THEME_TINT[PILLARS[ci].key];
      tint.style.background = `radial-gradient(ellipse at ${CX}px ${CY}px, rgba(${tc},${tog ? 0 : 0.26}) 0%, rgba(${tc},0) 55%)`;
      rings.forEach((r, i) => { r.style.opacity = tog ? 0 : 1; r.style.transform = `scale(${(1 + 0.025 * Math.sin(lt * 1.3 + i)).toFixed(4)})`; });
      for (let i = 0; i < 6; i++) {
        const c = cards[i], on = !tog && i === ci;
        for (const e of [c.circ, c.ic.el, c.col]) e.style.display = on ? '' : 'none';
        if (!on) continue;
        await c.slot.update(local);
        c.circ.style.opacity = swap.toFixed(3); c.circ.style.transform = `scale(${(0.9 + 0.1 * swap).toFixed(4)})`;
        const fl = float(lt, i), k = ease(prog(local, 0.2, 0.9));
        c.ic.set({ x: CX + 255, y: CY + 235 + fl.dy, size: 270, a: k, sc: 0.85 + 0.15 * k, rot: fl.rot });
        c.cnt.style.opacity = ease(prog(local, 0.3, 0.6)).toFixed(3);
        c.title.set(local, 0.35, 1e9, 0.1);
        const dk = ease(prog(local, 0.9, 0.8)); c.desc.style.opacity = dk.toFixed(3); c.desc.style.transform = `translate3d(0,${((1 - dk) * 14).toFixed(1)}px,0)`;
      }
      // dots
      const dx0 = W / 2 - (6 * 14 + 40) / 2;
      dots.forEach((d, i) => {
        const act = !tog && i === ci, wdt = act ? 44 : 10;
        const left = dx0 + i * 20 + (i > ci && !tog ? 34 : 0);
        Object.assign(d.style, { left: `${left}px`, width: `${wdt}px`, background: act ? COLORS.accent : COLORS.mist, opacity: (tog ? 0 : 1) * (act ? 1 : 0.4) });
      });
      // together
      const tl = lt - TOG;
      tg1.set(tl, 0.3, 1e9, 0.12); vis(tg2, tl, 0.8, { d: 26 });
      row.forEach((ic, i) => {
        const k = ease(prog(tl, 0.5 + i * 0.12, 0.8)), fl = float(lt, i * 0.8), sz = 200, gap = 280, x0 = W / 2 - gap * 2.5;
        ic.set({ x: x0 + i * gap, y: 700 + fl.dy, size: sz, a: tog ? k : 0, sc: 0.85 + 0.15 * k, rot: fl.rot });
      });
      tg1.box.style.display = tog ? 'flex' : 'none';
    };
  },
};
