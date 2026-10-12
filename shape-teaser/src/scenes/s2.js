import { E, clamp, prog, lerp, el, mono, kin, vis, makeSlot, makeCanvas, ease, easeIO, W, H, P, MX, MY, COLORS } from '../lib.js';
import { CONVERGENCE as CV } from '../brand.js';

// S2 · CONVERGENCE (8–18 s). Two audiences meet in framed footage; venue footage carries the idea; then the tricolon lands on the beat.
export default {
  id: 's2', name: 'CONVERGENCE', dur: 10.0, hardOut: true,
  build(root, ctx) {
    // panels: B2B buyers | end-consumers
    const pw = P ? W - 2 * MX : (W - 2 * MX - 90) / 2, ph = P ? H * 0.2 : H * 0.46;
    const PN = P ? [{ x: MX, y: H * 0.17 }, { x: MX, y: H * 0.17 + ph + H * 0.12 }] : [{ x: MX, y: H * 0.2 }, { x: W - MX - pw, y: H * 0.2 }];
    const bB = makeSlot(root, 's2-b2b', ctx, ctx.t0, 3.0, { x: PN[0].x, y: PN[0].y, w: pw, h: ph, kb: [1, 0] });
    const bC = makeSlot(root, 's2-community', ctx, ctx.t0, 3.0, { x: PN[1].x, y: PN[1].y, w: pw, h: ph, kb: [-1, 0] });
    for (const b of [bB, bC]) b.el.style.outline = '1px solid rgba(125,184,224,.4)';
    const { g } = makeCanvas(root);
    const lab1 = mono(root, 'B2B BUYERS', { x: PN[0].x, y: PN[0].y + ph + 18, size: P ? 22 : 18, color: COLORS.accent });
    const lab2 = mono(root, 'END-CONSUMERS', { x: PN[1].x, y: PN[1].y + ph + 18, size: P ? 22 : 18, color: COLORS.warm, w: pw, align: P ? 'left' : 'right' });
    const NB = [[.16, .3], [.3, .6], [.14, .82]], NC = [[.72, .26], [.84, .62], [.62, .84]];
    const pt = (pn, f) => [pn.x + f[0] * pw, pn.y + f[1] * ph];
    const mid = P ? [W / 2, (PN[0].y + ph + PN[1].y) / 2] : [W / 2, PN[0].y + ph / 2];
    // venue footage + text
    const venue = makeSlot(root, 's2-venue', ctx, ctx.t0 + 2.4, 4.0, { kb: [0, -1], dim: 0.25 });
    const size = P ? 80 : 66;
    const wrap = el(root, 'abs', { left: `${MX}px`, bottom: `${MY}px`, width: `${W - 2 * MX}px`, display: 'flex', flexDirection: 'column', rowGap: `${size * 0.1}px` });
    const lA = kin(wrap, ['Where', 'connections', 'become', 'visible,'], { flow: true, size, w: W - 2 * MX });
    const lB = kin(wrap, ['useful,', 'and', { t: 'commercially', c: 'acc' }, { t: 'meaningful.', c: 'acc' }], { flow: true, size, w: W - 2 * MX });
    // tricolon
    const tsz = P ? 112 : 124, TT = [6.0, 7.0, 8.0];
    const tri = CV.trio.map((w, i) => kin(root, i ? [{ t: '×', c: 'warm' }, w] : [w], { size: tsz, weight: 800, x: MX, y: (P ? H * 0.34 : H * 0.5 - tsz * 1.6) + i * tsz * 1.2, w: W - 2 * MX }));

    ctx.cue(0.0, 'hit', { gain: 0.4 });
    ctx.cue(0.8, 'ping', { gain: 0.45 }); ctx.cue(1.4, 'ping', { gain: 0.35 });
    ctx.cue(2.4, 'air', { gain: 0.5 });
    ctx.cue(2.8, 'ping', { gain: 0.5 }); ctx.cue(4.0, 'ping', { gain: 0.5 });
    TT.forEach(t => ctx.cue(t, 'ping', { gain: 0.6 }));
    ctx.cue(6.0, 'hit', { gain: 0.35 });

    return async lt => {
      g.clearRect(0, 0, W, H);
      // panels (0–2.6)
      const pa = ease(prog(lt, 0.0, 0.8)) * (1 - ease(prog(lt, 2.3, 0.5)));
      for (const [b, o] of [[bB, 0], [bC, 1]]) { b.el.style.opacity = pa.toFixed(3); b.el.style.transform = `scale(${(0.94 + 0.06 * pa).toFixed(4)})`; }
      await Promise.all([bB.update(lt), bC.update(lt)]);
      lab1.style.opacity = lab2.style.opacity = pa.toFixed(3);
      if (pa > 0) {
        const grow = ease(prog(lt, 0.6, 1.6));
        NB.forEach((a, i) => NC.forEach((c, j) => {
          if ((i + j) % 3 === 2) return;
          const p0 = pt(PN[0], a), p1 = pt(PN[1], c);
          const q = k => [lerp(p0[0], p1[0], k), lerp(p0[1], p1[1], k)];
          const gr = g.createLinearGradient(p0[0], p0[1], p1[0], p1[1]); gr.addColorStop(0, `rgba(125,184,224,${0.5 * pa})`); gr.addColorStop(1, `rgba(227,197,139,${0.5 * pa})`);
          g.strokeStyle = gr; g.lineWidth = 1.2; g.beginPath(); g.moveTo(p0[0], p0[1]); const e = q(grow); g.lineTo(e[0], e[1]); g.stroke();
        }));
        NB.forEach(f => { const p = pt(PN[0], f); g.fillStyle = `rgba(125,184,224,${pa})`; g.beginPath(); g.arc(p[0], p[1], 7, 0, 6.283); g.fill(); });
        NC.forEach(f => { const p = pt(PN[1], f); g.fillStyle = `rgba(227,197,139,${pa})`; g.beginPath(); g.arc(p[0], p[1], 7, 0, 6.283); g.fill(); });
        g.fillStyle = `rgba(255,255,255,${pa * ease(prog(lt, 1.4, 0.6))})`; g.beginPath(); g.arc(mid[0], mid[1], 9, 0, 6.283); g.fill();
      }
      // venue + phrases (2.4–5.9)
      const va = ease(prog(lt, 2.4, 0.5)) * (1 - ease(prog(lt, 5.4, 0.5)));
      venue.el.style.opacity = va.toFixed(3);
      await venue.update(lt - 2.4);
      lA.set(lt, 2.8, 5.5); lB.set(lt, 4.0, 5.5);
      // tricolon (6–10)
      tri.forEach((k, i) => k.set(lt, TT[i], 9.5));
    };
  },
};
