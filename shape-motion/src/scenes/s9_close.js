import { E, clamp, prog, lerp, el, mono, makeSlot, wipe, typed, W, H } from '../lib.js';

// 09 — close: logo, the ask, where and when; fade to black.
export default {
  id: 'close', name: 'JOIN SHAPE', dur: 7.5,
  build(root, ctx) {
    const E0 = ctx.content.event;
    const slot = makeSlot(root, 'f08', ctx, ctx.t0, 7.5, { quiet: true });
    el(root, 'layer', { background: 'rgba(5,14,26,.66)' });
    const lw = 640, lh = lw * 1056 / 3044;
    const logo = el(root, 'abs', { left: `${W / 2 - lw / 2}px`, top: '190px', width: `${lw}px` }, null, 'img');
    logo.src = ctx.logo;
    const l1 = el(root, 'abs hl', { left: 0, top: '190px', width: `${W}px`, textAlign: 'center', fontSize: '60px' });
    const l1y = 190 + lh + 70;
    Object.assign(l1.style, { top: `${l1y}px` });
    l1.innerHTML = 'JOIN SHAPE INDONESIA <span class="serif" style="font-size:1.08em;font-weight:400;color:var(--ice)">expo 2027.</span>';
    const where = mono(root, `${E0.venue} · ${E0.city.split(',')[0]} · ${E0.when}`, 0, l1y + 96, { size: 20, ls: 0.3, w: W, align: 'center', color: 'var(--white)' });
    const cta = el(root, 'abs', { left: `${W / 2 - 330}px`, top: `${l1y + 160}px`, width: '660px', height: '78px', border: '2px solid var(--ice)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(140,200,234,.14)' });
    mono(cta, 'BECOME A PARTNER · EXHIBITOR · SPONSOR', 0, 0, { size: 17, ls: 0.22, w: 660, align: 'center', color: 'var(--white)' }).style.position = 'relative';
    const contact = mono(root, `${E0.site}   ·   ${E0.email}`, 0, l1y + 276, { size: 22, ls: 0.16, w: W, align: 'center', color: 'var(--ice)' });
    const org = mono(root, 'ORGANIZED BY EVENTIME · CO-ORGANIZED BY GEARRA · AFFILIATE OF EXPOSASIA', 0, 985, { size: 12, ls: 0.24, w: W, align: 'center', color: 'rgba(246,250,253,.5)' });
    const black = el(root, 'layer', { background: '#000', opacity: 0 });

    ctx.cue(0.2, 'whoosh', { gain: 0.6 });
    ctx.cue(0.5, 'hit', { gain: 0.9 });
    ctx.cue(1.0, 'breath', { gain: 0.8 });
    ctx.cue(2.4, 'ping', { gain: 0.6 });
    ctx.cue(3.6, 'swell', { dur: 3.0 });

    return async lt => {
      await slot.update(lt);
      const lk = E.outExpo(prog(lt, 0.4, 1.1));
      logo.style.opacity = lk > 0 ? 1 : 0; wipe(logo, lk);
      logo.style.filter = `blur(${((1 - lk) * 14).toFixed(1)}px)`;
      const vis = (e, t, d = 20) => { const q = E.outExpo(prog(lt, t, 0.8)); e.style.opacity = q.toFixed(3); e.style.transform = `translate3d(0,${((1 - q) * d).toFixed(1)}px,0)`; };
      vis(l1, 1.3, 36); vis(where, 1.9, 12); vis(cta, 2.4, 20); vis(contact, 2.9, 12); vis(org, 3.2, 0);
      black.style.opacity = E.inOutCubic(prog(lt, 6.1, 1.4)).toFixed(3);
    };
  },
};
