import { E, clamp, prog, lerp, el, mono, kin, vis, makeSlot, makeIcon, makeCanvas, float, ease, easeIO, drawDot, W, H, P, MX, MY, COLORS } from '../lib.js';
import { JOURNEY as J, EVENT as EV, PILLARS } from '../brand.js';

// S5 · JOURNEY, CLIMAX & CTA (46–60 s). Timeline 2026 → 2027 → the Expo; the date node becomes the logo; clean left-aligned lockup; fades back to the opening dot.
export default {
  id: 's5', name: 'JOURNEY + CTA', dur: 14.0,
  build(root, ctx) {
    const drone = makeSlot(root, 's5-drone', ctx, ctx.t0, 6.0, { dim: 0.74 });
    const { g } = makeCanvas(root);
    const fx = P ? [0.16, 0.5, 0.84] : [0.14, 0.5, 0.86], TY = P ? H * 0.36 : H * 0.4;
    const NX = fx.map(f => W * f);
    const years = [J.steps[0].year, J.steps[1].year, J.final];
    const yl = years.map((t, i) => mono(root, t, { x: NX[i] - 120, y: TY + 34, w: 240, align: 'center', size: P ? 22 : 18, ls: 0.14, color: COLORS.mist }));
    const bsz = P ? 78 : 64;
    const headWords = J.headline.map(t => t === J.highlight ? { t, c: 'acc' } : t);
    const head = kin(root, headWords, { size: bsz, x: MX, y: H - MY - bsz * 1.12 * (P ? 3 : 2), w: W - 2 * MX });
    const stepTxt = J.steps.map((s, i) => {
      const box = el(root, 'abs', { left: `${MX}px`, bottom: `${MY}px`, width: `${W - 2 * MX}px`, display: 'flex', flexDirection: 'column', rowGap: `${P ? 22 : 16}px` });
      const t = kin(box, s.title.split(' '), { flow: true, size: P ? 78 : 60, w: W - 2 * MX });
      const it = mono(box, s.items.join(P ? '<br>' : '  ·  '), { flow: true, size: P ? 22 : 17, ls: 0.14, color: COLORS.mist, wrap: true, lh: P ? 1.8 : 1.5 });
      return { box, t, it };
    });
    // lockup (flow layout; the logo is moved from the centre to its slot)
    const lw = P ? W - 2 * MX : 640, lh = lw * 1056 / 3044;
    const lock = el(root, 'abs', { left: `${MX}px`, top: '0px', height: `${H}px`, width: `${W - 2 * MX}px`, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', rowGap: `${P ? 30 : 20}px` });
    const L = {};
    L.rule = el(lock, '', { width: '72px', height: '4px', background: COLORS.accent, opacity: 0, transformOrigin: '0 50%' });
    L.logoSlot = el(lock, '', { width: `${lw}px`, height: `${lh}px` });
    L.tag = mono(lock, EV.tagline, { flow: true, size: P ? 24 : 20, ls: 0.2, color: COLORS.mist });
    L.date = mono(lock, `${EV.date} · ${EV.location}`, { flow: true, size: P ? 24 : 21, ls: 0.14, color: COLORS.white, wrap: true, w: W - 2 * MX });
    L.fmt = mono(lock, EV.format.join(' · '), { flow: true, size: P ? 21 : 17, ls: 0.22, color: COLORS.accent });
    L.cta = el(lock, '', { padding: P ? '26px 40px' : '20px 36px', background: COLORS.accent, color: COLORS.ink, fontWeight: 700, fontSize: `${P ? 32 : 28}px`, borderRadius: '999px', opacity: 0, marginTop: `${P ? 18 : 10}px`, whiteSpace: 'nowrap' }, `${EV.ctaPrimary} →`);
    L.url = mono(lock, EV.url, { flow: true, size: P ? 26 : 22, ls: 0.12, color: COLORS.white, w: 0 });
    L.row = el(lock, '', { display: 'flex', columnGap: `${P ? 22 : 18}px`, height: `${P ? 72 : 52}px`, width: `${(P ? 72 : 52) * 6 + (P ? 22 : 18) * 5}px`, position: 'relative', marginTop: '6px' });
    const rowIcons = PILLARS.map((p, i) => { const ic = makeIcon(L.row, p.key, ctx); const s = P ? 72 : 52; ic.el.style.position = 'relative'; ic.el.style.left = '0'; ic.el.style.top = '0'; ic.el.style.width = `${s}px`; ic.el.style.height = `${s}px`; return ic; });
    const scarcity = EV.scarcity ? mono(lock, EV.scarcity.toUpperCase(), { flow: true, size: P ? 20 : 15, color: COLORS.warm }) : null;
    // measure where the logo lands
    const slotRect = L.logoSlot.getBoundingClientRect(), tx = slotRect.left, ty = slotRect.top;
    const logo = el(root, 'abs', { left: '0', top: '0', width: `${lw}px`, opacity: 0, transformOrigin: '0 0' }, null, 'img'); logo.src = ctx.logo;
    const date2 = mono(root, EV.date, { x: 0, y: 0, w: W, align: 'center', size: P ? 26 : 22, ls: 0.3, color: COLORS.white });
    const ring = { x: NX[2], y: TY };
    const black = el(root, 'layer', { background: COLORS.ink, opacity: 0 });
    const dotC = makeCanvas(root);

    const CL = 6.0;   // climax (local) = 0:52
    ctx.cue(0.0, 'air', { gain: 0.5 }); ctx.cue(1.5, 'ping', { gain: 0.5 });
    ctx.cue(1.6, 'ping', { gain: 0.55 }); ctx.cue(3.6, 'ping', { gain: 0.6 });
    ctx.cue(4.2, 'swell', { dur: 1.8, gain: 0.8 }); ctx.cue(5.5, 'sweep', { gain: 0.5 });
    ctx.cue(CL, 'hit', { gain: 1.0 }); ctx.cue(CL + 0.1, 'ping', { gain: 0.7 }); ctx.cue(CL + 0.6, 'ping', { gain: 0.5 });
    [8.0, 8.3, 8.6, 8.9, 9.2, 9.6, 9.9].forEach(t => ctx.cue(t, 'tick', { gain: 0.3 }));
    ctx.cue(11.5, 'swell', { dur: 2.2, gain: 0.4 });

    return async lt => {
      g.clearRect(0, 0, W, H); dotC.g.clearRect(0, 0, W, H);
      // drone plate (0–6)
      const da = ease(prog(lt, 0, 0.6)) * (1 - ease(prog(lt, 5.6, 0.5)));
      drone.el.style.opacity = da.toFixed(3); await drone.update(lt);
      // timeline
      const line = ease(prog(lt, 0.3, 1.1)) * (1 - ease(prog(lt, CL, 0.5)));
      const x0 = NX[0], x1 = NX[2], race = lt < 5.5 ? (lt < 3.6 ? lerp(0, 0.5, easeIO(prog(lt, 1.6, 0.4))) : lerp(0.5, 0.5, 1)) : 1;
      const act = lt < 3.5 ? 0 : lt < 5.5 ? 1 : 2;
      const prog1 = lt < 1.5 ? 0 : lt < 3.5 ? easeIO(prog(lt, 1.5, 0.5)) * 0 : 0;
      void race; void prog1;
      g.strokeStyle = `rgba(215,223,229,${(0.3 * line).toFixed(3)})`; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, TY); g.lineTo(lerp(x0, x1, ease(prog(lt, 0.3, 1.1))), TY); g.stroke();
      // progress (accent) along the line: node 1 at 1.5, node 2 at 3.5, node 3 at 5.5 (race)
      const pgx = lt < 3.5 ? NX[0] : lt < 5.5 ? lerp(NX[0], NX[1], easeIO(prog(lt, 3.3, 0.7))) : lerp(NX[1], NX[2], easeIO(prog(lt, 5.0, 1.0)));
      if (lt > 1.4) { g.strokeStyle = `rgba(125,184,224,${(0.9 * line).toFixed(3)})`; g.lineWidth = 3; g.beginPath(); g.moveTo(NX[0], TY); g.lineTo(pgx, TY); g.stroke(); }
      const tn = [1.5, 3.5, 5.2];
      NX.forEach((x, i) => {
        const a = ease(prog(lt, 0.5 + i * 0.25, 0.6)) * (1 - ease(prog(lt, CL - 0.1, 0.5)));
        const active = lt >= tn[i] && (i === 2 || lt < tn[i + 1]);
        const dim = lt >= tn[i] && !active ? 0.35 : 1;
        const r = active ? 13 : 8, pulse = active ? ((lt - tn[i]) % 1.2) / 1.2 : 0;
        g.strokeStyle = `rgba(255,255,255,${(0.9 * a * dim).toFixed(3)})`; g.lineWidth = 2; g.fillStyle = `rgba(9,31,57,${a})`;
        g.beginPath(); g.arc(x, TY, i === 2 && lt > 5.5 ? r + 6 * ease(prog(lt, 5.5, 0.4)) : r, 0, 6.283); g.fill(); g.stroke();
        if (active) { g.fillStyle = `rgba(125,184,224,${a})`; g.beginPath(); g.arc(x, TY, 6, 0, 6.283); g.fill(); g.strokeStyle = `rgba(125,184,224,${((1 - pulse) * 0.6 * a).toFixed(3)})`; g.lineWidth = 1.5; g.beginPath(); g.arc(x, TY, r + 6 + pulse * 30, 0, 6.283); g.stroke(); }
        yl[i].style.opacity = (a * (active ? 1 : (lt >= tn[i] ? 0.35 : 0.7))).toFixed(3);
        yl[i].style.color = active ? COLORS.white : COLORS.mist; yl[i].style.fontWeight = active ? '700' : '500';
      });
      // text
      head.set(lt, 0.2, 1.5, 0.12);
      stepTxt.forEach((s, i) => {
        const t0 = i ? 3.5 : 1.5, t1 = i ? 5.4 : 3.4;
        s.t.set(lt, t0 + 0.05, t1, 0.12); s.it.style.opacity = (ease(prog(lt, t0 + 0.5, 0.6)) * (1 - ease(prog(lt, t1, 0.4)))).toFixed(3);
        s.box.style.visibility = lt > t0 - 0.2 && lt < t1 + 0.6 ? 'visible' : 'hidden';
      });
      // climax: the date node swells into the logo
      const cx = W / 2, cy = P ? H * 0.42 : H / 2 - 20;
      const mv = easeIO(prog(lt, CL, 0.7));                           // node → centre
      if (lt > 5.4 && lt < CL + 1.6) {
        const rr = lerp(19, 0, ease(prog(lt, CL + 0.1, 0.5)));
        const ex = lerp(NX[2], cx, mv), ey = lerp(TY, cy, mv);
        g.fillStyle = `rgba(255,255,255,${(0.95 * (1 - ease(prog(lt, CL + 0.5, 0.5)))).toFixed(3)})`; g.beginPath(); g.arc(ex, ey, Math.max(0, rr) + 4 * (1 - mv), 0, 6.283); g.fill();
      }
      // thin rays (soft, no blur) behind the logo
      const ra = ease(prog(lt, CL + 0.1, 0.4)) * (1 - ease(prog(lt, CL + 1.3, 0.8)));
      if (ra > 0) for (let i = 0; i < 40; i++) {
        const a = i / 40 * 6.283, r0 = 240 + ((i * 53) % 7) * 12, r1 = r0 + 140 * ease(prog(lt, CL + 0.1, 0.9)) + (i % 3) * 30;
        g.strokeStyle = `rgba(255,255,255,${(0.35 * ra).toFixed(3)})`; g.lineWidth = 1.2; g.beginPath(); g.moveTo(cx + Math.cos(a) * r0 * (P ? 0.6 : 1), cy + Math.sin(a) * r0 * (P ? 0.6 : 1)); g.lineTo(cx + Math.cos(a) * r1 * (P ? 0.6 : 1), cy + Math.sin(a) * r1 * (P ? 0.6 : 1)); g.stroke();
      }
      // logo: reveal at centre, then glide into the lockup slot
      const lk = ease(prog(lt, CL + 0.2, 0.9)), glide = easeIO(prog(lt, 7.5, 0.9));
      const cw = P ? W * 0.74 : 700, sc = lerp(cw / lw, 1, glide);
      const lx = lerp(cx - cw / 2, tx, glide), ly = lerp(cy - (cw * 1056 / 3044) / 2, ty, glide);
      logo.style.opacity = (lk > 0 ? 1 : 0).toString(); logo.style.clipPath = `inset(0 ${((1 - lk) * 100).toFixed(1)}% 0 0)`;
      logo.style.transform = `translate3d(${lx.toFixed(1)}px,${ly.toFixed(1)}px,0) scale(${sc.toFixed(4)})`;
      date2.style.top = `${cy + cw * 1056 / 3044 / 2 + 44}px`;
      date2.style.opacity = (ease(prog(lt, CL + 0.8, 0.6)) * (1 - ease(prog(lt, 7.4, 0.4)))).toFixed(3);
      // lockup items
      const T = [7.9, 8.2, 8.5, 8.8, 9.1, 9.5, 9.8], keys = ['rule', 'tag', 'date', 'fmt', 'cta', 'url', 'row'];
      const fade = 1 - ease(prog(lt, 13.0, 0.5));
      keys.forEach((k, i) => { const v = ease(prog(lt, T[i], 0.8)) * fade; L[k].style.opacity = v.toFixed(3); L[k].style.transform = `translate3d(0,${((1 - ease(prog(lt, T[i], 0.8))) * 18).toFixed(1)}px,0)`; });
      L.rule.style.transform += ` scaleX(${ease(prog(lt, T[0], 0.8)).toFixed(3)})`;
      if (scarcity) scarcity.style.opacity = (ease(prog(lt, 9.8, 0.8)) * fade).toFixed(3);
      rowIcons.forEach((ic, i) => { const s = P ? 72 : 52; ic.el.style.opacity = (ease(prog(lt, T[6] + i * 0.08, 0.6)) * fade).toFixed(3); void s; });
      logo.style.opacity = lk > 0 ? (fade).toFixed(3) : '0';
      // back to the opening frame: ink + the pulsing dot (loops cleanly)
      black.style.opacity = '0';
      drawDot(dotC.g, W / 2, H / 2, lt + 46, ease(prog(lt, 13.3, 0.5)), P ? 0.8 : 1);
    };
  },
};
