import { E, clamp, prog, lerp, el, mono, kin, vis, makeIcon, makeCanvas, isoProject, isoBox, isoFloor, s, float, ease, easeIO, drawDot, W, H, MX, MY, COLORS } from '../lib.js';
import { JOURNEY as J, EVENT as EV, PILLARS } from '../brand.js';

// S5 · JOURNEY, CLIMAX & CTA (47–60 s). Three isometric blocks climb 2026 → 2027 → the Expo; the top block becomes the logo; clean lockup; collapse back to the opening dot.
export default {
  id: 's5', name: 'JOURNEY + CTA', dur: 13.0,
  build(root, ctx) {
    const iso = el(root, 'layer', {});
    const svg = s('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}`, class: 'layer' }, iso); svg.style.overflow = 'visible';
    const U = 88, Pj = isoProject(960, 430, U);
    const floor = isoFloor(svg, Pj, { x0: -0.4, y0: -0.4, nx: 6, ny: 6, step: 1.1 });
    const pos = [[0.0, 5.2], [2.6, 2.6], [5.2, 0.0]], hts = [0.9, 1.8, 2.9];
    const blocks = pos.map(([x, y], i) => isoBox(svg, Pj, { x, y, w: 1.3, d: 1.3, top: i === 2 ? '#e6f4fc' : '#7DB8E0', left: '#447CA0', right: '#2E5A7A' }));
    const callouts = [J.steps[0], J.steps[1], { year: J.final, title: 'Shape Indonesia Expo', items: [] }].map((st, i) => {
      const box = el(iso, 'abs', { width: '360px', display: 'flex', flexDirection: 'column', rowGap: '6px', alignItems: 'center', textAlign: 'center', opacity: 0 });
      const yr = el(box, 'hl', { fontSize: i === 2 ? '44px' : '58px', fontWeight: 800, color: i === 2 ? COLORS.white : COLORS.white, whiteSpace: 'nowrap' }, st.year);
      el(box, '', { fontSize: '27px', fontWeight: 700, color: COLORS.accent }, st.title);
      st.items.forEach(t => mono(box, t, { flow: true, size: 15, ls: 0.14, color: COLORS.mist }).style.opacity = '1');
      const stem = el(iso, 'abs', { width: '1px', background: 'rgba(125,184,224,.55)', transformOrigin: '50% 100%', opacity: 0 });
      return { box, stem, t: 1.0 + i * 1.4 };
    });
    const hsz = 58;
    const hd = kin(root, ['The', 'journey', 'starts', { t: 'before', c: 'acc' }, 'October', '2027.'], { size: hsz, weight: 800, x: MX, y: 150, w: 920 });
    const kk = mono(root, 'THE ROAD TO SHAPE', { x: MX, y: 118, size: 17, ls: 0.3, color: COLORS.accent });
    // lockup
    const lw = 640, lh = lw * 1056 / 3044;
    const lock = el(root, 'abs', { left: `${MX}px`, top: '0px', height: `${H}px`, width: `${W - 2 * MX}px`, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', rowGap: '20px' });
    const L = {};
    L.rule = el(lock, '', { width: '72px', height: '4px', background: COLORS.accent, opacity: 0, transformOrigin: '0 50%' });
    L.logoSlot = el(lock, '', { width: `${lw}px`, height: `${lh}px` });
    L.tag = mono(lock, EV.tagline, { flow: true, size: 20, ls: 0.2, color: COLORS.mist });
    L.date = mono(lock, `${EV.date} · ${EV.location}`, { flow: true, size: 21, ls: 0.14, color: COLORS.white });
    L.fmt = mono(lock, EV.format.join(' · '), { flow: true, size: 17, ls: 0.22, color: COLORS.accent });
    L.cta = el(lock, '', { padding: '20px 36px', background: COLORS.accent, color: COLORS.ink, fontWeight: 700, fontSize: '28px', borderRadius: '999px', opacity: 0, marginTop: '10px', whiteSpace: 'nowrap' }, `${EV.ctaPrimary} →`);
    L.url = mono(lock, EV.url, { flow: true, size: 22, ls: 0.12, color: COLORS.white });
    L.row = el(lock, '', { display: 'flex', columnGap: '18px', height: '52px', position: 'relative', marginTop: '6px' });
    const rowIcons = PILLARS.map(p => { const ic = makeIcon(L.row, p.key, ctx); Object.assign(ic.el.style, { position: 'relative', left: '0', top: '0', width: '52px', height: '52px' }); return ic; });
    const slotRect = L.logoSlot.getBoundingClientRect(), tx = slotRect.left, ty = slotRect.top;
    const { g } = makeCanvas(root);
    const logo = el(root, 'abs', { left: '0', top: '0', width: `${lw}px`, opacity: 0, transformOrigin: '0 0' }, null, 'img'); logo.src = ctx.logo;
    const dotC = makeCanvas(root);

    const CL = 5.2;
    ctx.cue(0.0, 'air', { gain: 0.5 }); ctx.cue(0.9, 'swell', { dur: 1.2, gain: 0.5 });
    callouts.forEach((c, i) => { ctx.cue(c.t + 0.5, 'rise', { gain: 0.45 }); ctx.cue(c.t + 0.9, 'ping', { gain: 0.55 }); });
    ctx.cue(3.6, 'swell', { dur: 1.6, gain: 0.8 }); ctx.cue(CL, 'hit', { gain: 1.0 }); ctx.cue(CL + 0.3, 'ping', { gain: 0.7 }); ctx.cue(CL + 0.9, 'ping', { gain: 0.5 });
    [6.8, 7.1, 7.4, 7.7, 8.0, 8.3, 8.6].forEach(t => ctx.cue(t, 'tick', { gain: 0.3 })); ctx.cue(10.8, 'swell', { dur: 2.0, gain: 0.4 });

    return lt => {
      g.clearRect(0, 0, W, H); dotC.g.clearRect(0, 0, W, H);
      const isoA = ease(prog(lt, 0, 0.6)) * (1 - ease(prog(lt, CL - 0.1, 0.4)));
      iso.style.opacity = isoA.toFixed(3);
      floor.set(ease(prog(lt, 0.2, 1.2)));
      blocks.forEach((b, i) => {
        const k = ease(prog(lt, callouts[i].t - 0.2, 1.0)); b.set(hts[i] * k);
        const tc = b.topCenter(), c = callouts[i], a = ease(prog(lt, c.t + 0.4, 0.7));
        const above = 58;
        c.box.style.left = `${tc[0] - 180}px`; c.box.style.opacity = a.toFixed(3);
        const bh = c.box.getBoundingClientRect().height || 170;
        c.box.style.top = `${tc[1] - above - bh}px`;
        Object.assign(c.stem.style, { left: `${tc[0]}px`, top: `${tc[1] - above}px`, height: `${above - 6}px`, opacity: a.toFixed(3), transform: `scaleY(${a.toFixed(3)})` });
        const act = lt >= c.t && (i === 2 || lt < callouts[i + 1].t); const dim = lt >= callouts[i + 1 > 2 ? 2 : i + 1].t && i < 2 ? 0.55 : 1;
        c.box.style.opacity = (a * dim).toFixed(3); void act;
      });
      hd.set(lt, 0.2, CL - 0.6, 0.12); vis(kk, lt, 0.1, { d: 8, t1: CL - 0.6, outDur: 0.4 });
      // climax: top block lights, a ring travels to the centre and becomes the logo
      const cx = W / 2, cy = H / 2 - 20;
      const top3 = blocks[2].topCenter();
      const mv = easeIO(prog(lt, CL - 0.2, 0.8));
      if (lt > CL - 0.6 && lt < CL + 1.8) {
        const ex = lerp(top3[0], cx, mv), ey = lerp(top3[1], cy, mv), rr = lerp(14, 22, ease(prog(lt, CL - 0.6, 0.4))) * (1 - ease(prog(lt, CL + 0.3, 0.5)));
        g.fillStyle = `rgba(255,255,255,${(0.95 * (1 - ease(prog(lt, CL + 0.4, 0.5)))).toFixed(3)})`; g.beginPath(); g.arc(ex, ey, Math.max(0, rr), 0, 6.283); g.fill();
      }
      const ra = ease(prog(lt, CL + 0.15, 0.4)) * (1 - ease(prog(lt, CL + 1.3, 0.8)));
      if (ra > 0) for (let i = 0; i < 40; i++) {
        const a = i / 40 * 6.283, r0 = 240 + ((i * 53) % 7) * 12, r1 = r0 + 140 * ease(prog(lt, CL + 0.15, 0.9)) + (i % 3) * 30;
        g.strokeStyle = `rgba(255,255,255,${(0.35 * ra).toFixed(3)})`; g.lineWidth = 1.2; g.beginPath(); g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); g.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); g.stroke();
      }
      const lk = ease(prog(lt, CL + 0.3, 0.9)), glide = easeIO(prog(lt, 6.6, 0.9));
      const cw = 700, sc = lerp(cw / lw, 1, glide);
      logo.style.opacity = lk > 0 ? (1 - ease(prog(lt, 12.0, 0.5))).toFixed(3) : '0'; logo.style.clipPath = `inset(0 ${((1 - lk) * 100).toFixed(1)}% 0 0)`;
      logo.style.transform = `translate3d(${lerp(cx - cw / 2, tx, glide).toFixed(1)}px,${lerp(cy - (cw * 1056 / 3044) / 2, ty, glide).toFixed(1)}px,0) scale(${sc.toFixed(4)})`;
      const T = [6.8, 7.1, 7.4, 7.7, 8.0, 8.4, 8.7], keys = ['rule', 'tag', 'date', 'fmt', 'cta', 'url', 'row'], fade = 1 - ease(prog(lt, 12.0, 0.5));
      keys.forEach((k, i) => { const a = ease(prog(lt, T[i], 0.8)); L[k].style.opacity = (a * fade).toFixed(3); L[k].style.transform = `translate3d(0,${((1 - a) * 18).toFixed(1)}px,0)${k === 'rule' ? ` scaleX(${a.toFixed(3)})` : ''}`; });
      rowIcons.forEach((ic, i) => { ic.el.style.opacity = (ease(prog(lt, T[6] + i * 0.08, 0.6)) * fade).toFixed(3); });
      drawDot(dotC.g, W / 2, H / 2, lt + 47, ease(prog(lt, 12.2, 0.5)), 1);
    };
  },
};
