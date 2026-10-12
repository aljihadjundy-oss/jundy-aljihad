import { E, clamp, prog, lerp, el, mono, kin, makeSlot, makeIcon, float, ease, W, H, P, MX, MY, COLORS, pad2 } from '../lib.js';
import { PILLARS } from '../brand.js';

// S3 · SIX THEMES (18–34 s). One theme per 80 frames: footage, icon, counter, title, official one-liner, progress line. Cuts land on the beat.
export default {
  id: 's3', name: 'SIX THEMES', dur: 16.0, hardIn: true,
  build(root, ctx) {
    const SEG = 80 / 30, KB = [[-1, 0], [1, 0], [0, -1], [-1, 0], [1, 0], [0, 1]];
    const slots = PILLARS.map((p, i) => makeSlot(root, p.footage, ctx, ctx.t0 + i * SEG, SEG + 0.1, { kb: KB[i] }));
    const isz = P ? W * 0.3 : W * 0.115, tsz = P ? 92 : 72;
    const stack = el(root, 'abs', { left: `${MX}px`, bottom: `${MY + 36}px`, width: `${W - 2 * MX}px`, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', rowGap: `${P ? 26 : 14}px` });
    const items = PILLARS.map((p, i) => {
      const ic = makeIcon(stack, p.key, ctx);
      ic.el.style.position = 'relative'; ic.el.style.left = '0'; ic.el.style.top = '0'; ic.el.style.width = `${isz}px`; ic.el.style.height = `${isz}px`; ic.el.style.marginBottom = '6px';
      const cnt = mono(stack, `${pad2(i + 1)} / 06`, { flow: true, size: P ? 22 : 17, color: COLORS.accent });
      const title = kin(stack, p.title.split(' '), { flow: true, size: tsz, weight: 700, w: W - 2 * MX });
      const desc = el(stack, '', { fontSize: `${P ? 30 : 26}px`, fontWeight: 400, color: COLORS.mist, opacity: 0, lineHeight: 1.35, maxWidth: `${W - 2 * MX}px` }, p.desc);
      return { ic, cnt, title, desc };
    });
    const track = el(root, 'abs', { left: `${MX}px`, top: `${H - MY}px`, width: `${W - 2 * MX}px`, height: '2px', background: 'rgba(215,223,229,.22)' });
    const fill = el(track, 'abs', { inset: 0, background: COLORS.accent, transformOrigin: '0 50%' });
    const cut = el(root, 'layer', { background: '#fff', opacity: 0 });

    PILLARS.forEach((_, i) => { const t = i * SEG; ctx.cue(t, 'hit', { gain: 0.35 }); ctx.cue(t + 0.3, 'ping', { gain: 0.5 }); ctx.cue(t + 0.9, 'tick', { gain: 0.35 }); });

    return async lt => {
      const ci = clamp(Math.floor((lt + 1e-4) / SEG), 0, 5), local = lt - ci * SEG;
      slots.forEach((s, i) => { s.el.style.display = i === ci ? '' : 'none'; });
      await slots[ci].update(local);
      items.forEach((o, i) => {
        const on = i === ci;
        for (const e of [o.ic.el, o.cnt, o.desc]) e.style.display = on ? '' : 'none';
        o.title.box.style.display = on ? 'flex' : 'none';
        if (!on) return;
        const k = ease(prog(local, 0.15, 0.9)), fl = float(lt, i);
        o.ic.el.style.opacity = k.toFixed(3);
        o.ic.el.style.transform = `translate3d(0,${fl.dy.toFixed(1)}px,0) rotate(${fl.rot.toFixed(2)}deg) scale(${(0.85 + 0.15 * k).toFixed(4)})`;
        o.cnt.style.opacity = ease(prog(local, 0.3, 0.7)).toFixed(3);
        o.title.set(local, 0.4, 1e9, 0.1);
        o.desc.style.opacity = ease(prog(local, 0.95, 0.8)).toFixed(3);
        o.desc.style.transform = `translate3d(0,${((1 - ease(prog(local, 0.95, 0.8))) * 14).toFixed(1)}px,0)`;
      });
      fill.style.transform = `scaleX(${clamp(local / SEG).toFixed(4)})`;
      cut.style.opacity = ((1 - ease(prog(local, 0, 0.12))) * (lt < 0.1 ? 0 : 0.12)).toFixed(3);
    };
  },
};
