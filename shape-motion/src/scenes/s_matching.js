import { E, clamp, prog, lerp, el, mono, statement, makeCanvas, W, H } from '../lib.js';

// 05 — supply meets demand: exhibitor categories on the left, buyer profiles on the right, connections form between them.
export default {
  id: 'matching', name: 'SUPPLY MEETS DEMAND', dur: 9.0,
  build(root, ctx) {
    const SUP = ctx.content.supply, DEM = ctx.content.demand;
    const { c, g } = makeCanvas(root);
    const kick = mono(root, 'THE MARKETPLACE', 0, 118, { size: 17, ls: 0.3, w: W, align: 'center' });
    const title = statement(root, [{ t: 'SUPPLY ' }, { t: 'meets', c: 'serif' }, { t: ' DEMAND.' }], 0, 150, { size: 72 });
    title.style.width = `${W}px`; title.style.textAlign = 'center';
    const LX = 150, RX = 1370, CW = 400, Y0 = 330, DY = 94;
    const hdrL = mono(root, 'EXHIBITORS · THE SUPPLY', LX, Y0 - 56, { size: 15, ls: 0.26, color: 'var(--ice)' });
    const hdrR = mono(root, 'BUYERS · THE DEMAND', RX, Y0 - 56, { size: 15, ls: 0.26, color: 'var(--ice)' });
    const mk = (txt, x, i, t) => {
      const e = mono(root, txt, x, Y0 + i * DY, { size: 17, ls: 0.1, color: 'var(--white)', w: CW - 36 });
      Object.assign(e.style, { padding: '20px 18px', border: '1px solid rgba(140,200,234,.4)', background: 'rgba(24,56,88,.5)', boxSizing: 'content-box' });
      return { e, t, y: Y0 + i * DY + 33 };
    };
    const L = SUP.map((t, i) => mk(t, LX, i, 0.9 + i * 0.22));
    const R = DEM.map((t, i) => mk(t, RX, i, 1.2 + i * 0.22));
    const core = el(root, 'abs', { left: `${W / 2 - 90}px`, top: `${Y0 + 2.5 * DY - 90}px`, width: '180px', height: '180px', borderRadius: '50%', border: '2px solid var(--ice)', background: 'rgba(8,40,56,.85)' });
    const coreT = mono(root, 'SHAPE', 0, Y0 + 2.5 * DY - 14, { size: 22, ls: 0.3, w: W, align: 'center', color: 'var(--white)' });
    const note = mono(root, 'VERIFIED PROFILES · BRIEF-BASED MATCHING · MEETINGS WITH PURPOSE', 0, 930, { size: 17, ls: 0.22, w: W, align: 'center', color: 'rgba(246,250,253,.85)' });
    // pairs that "light up" (fixed, deterministic): [left, right]
    const PAIRS = [[0, 3], [1, 0], [2, 1], [3, 5], [4, 2], [5, 4]];
    L.forEach((r, i) => ctx.cue(r.t, 'tick', { gain: 0.3 }));
    ctx.cue(0.4, 'swell', { dur: 2.0, gain: 0.5 });
    PAIRS.forEach((_, i) => ctx.cue(3.4 + i * 0.7, 'ping', { gain: 0.45 }));
    ctx.cue(7.6, 'hit', { gain: 0.4 });

    return lt => {
      g.clearRect(0, 0, W, H);
      const vis = (e, t, d = 20) => { const k = E.outExpo(prog(lt, t, 0.8)); e.style.opacity = k.toFixed(3); e.style.transform = `translate3d(0,${((1 - k) * d).toFixed(1)}px,0)`; };
      vis(kick, 0.1, 10); vis(title, 0.25, 30); vis(hdrL, 0.7, 10); vis(hdrR, 0.9, 10); vis(note, 5.4, 10);
      for (const r of L) vis(r.e, r.t, 14);
      for (const r of R) vis(r.e, r.t, 14);
      const ck = E.outBack(prog(lt, 2.4, 0.8));
      core.style.transform = `scale(${ck.toFixed(3)})`; core.style.opacity = clamp(ck).toFixed(3); coreT.style.opacity = clamp(ck).toFixed(3);
      const pulse = lt > 2.6 ? ((lt - 2.6) % 2.2) / 2.2 : 0;
      if (ck > 0) { g.strokeStyle = `rgba(140,200,234,${((1 - pulse) * 0.5).toFixed(3)})`; g.lineWidth = 1.5; g.beginPath(); g.arc(W / 2, Y0 + 2.5 * DY, 92 + pulse * 90, 0, 6.283); g.stroke(); }
      // faint lines from every card to the core, then bright matched pairs
      const cx = W / 2, cy = Y0 + 2.5 * DY;
      [...L.map(r => [LX + CW, r.y, r.t]), ...R.map(r => [RX, r.y, r.t])].forEach(([x, y, t]) => {
        const k = E.inOutCubic(prog(lt, t + 1.2, 0.9));
        if (k <= 0) return;
        g.strokeStyle = 'rgba(140,200,234,.22)'; g.lineWidth = 1;
        g.beginPath(); g.moveTo(x, y); g.lineTo(lerp(x, cx, k), lerp(y, cy, k)); g.stroke();
      });
      PAIRS.forEach(([a, b], i) => {
        const t = 3.4 + i * 0.7, k = E.inOutCubic(prog(lt, t, 0.7));
        if (k <= 0) return;
        const x0 = LX + CW, y0 = L[a].y, x1 = RX, y1 = R[b].y;
        const fade = 0.35 + 0.65 * (1 - E.outCubic(prog(lt, t + 0.7, 1.4)));
        g.strokeStyle = `rgba(246,250,253,${(0.9 * fade).toFixed(3)})`; g.lineWidth = 2.2;
        g.beginPath();
        for (let j = 0; j <= 40; j++) { const u = (j / 40) * k, x = lerp(x0, x1, u), y = lerp(y0, y1, u) + Math.sin(u * Math.PI) * (y0 < y1 ? -30 : 30) * 0 + (y0 + y1) * 0 ; j ? g.lineTo(x, y) : g.moveTo(x, y); }
        g.stroke();
        for (const [e, side] of [[L[a].e, 0], [R[b].e, 1]]) { const lit = clamp((k - (side ? 0.9 : 0)) * 3); e.style.borderColor = `rgba(246,250,253,${(0.4 + 0.6 * lit).toFixed(2)})`; }
      });
    };
  },
};
