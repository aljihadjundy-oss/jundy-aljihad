import { E, clamp, prog, lerp, el, mono, statement, makeSlot, W, H } from '../lib.js';

// 08 — the offer: limited slots per tier, drawn as slot grids that light up (numbers straight from the sponsorship proposal).
export default {
  id: 'partners', name: 'PARTNERSHIP', dur: 9.0,
  build(root, ctx) {
    const P = ctx.content.partners;
    const slot = makeSlot(root, 'f07', ctx, ctx.t0, 9.0, { quiet: true });
    el(root, 'layer', { background: 'rgba(5,14,26,.72)' });

    const kick = mono(root, 'PARTNERSHIP OPPORTUNITIES', 116, 130, { size: 17, ls: 0.3 });
    const title = statement(root, [{ t: 'LIMITED ' }, { t: 'partnership slots.', c: 'serif' }], 110, 164, { size: 78 });

    const tiers = [
      { key: 'main', n: P.main.slots, cols: 5, sq: 34, tag: 'TIER 01', bullets: [P.main.space, 'Priority main-stage visibility', 'VIP networking access'], price: P.main.price },
      { key: 'co', n: P.co.slots, cols: 9, sq: 22, tag: 'TIER 02', bullets: [P.co.space, 'Logo exposure at supporting programs', 'Networking opportunity'], price: P.co.price },
      { key: 'exhibitor', n: 9, cols: 3, sq: 34, tag: 'TIER 03', bullets: ['Shell scheme or space only', 'Meet buyers, professionals & consumers', 'Minimum 9 sqm'], price: P.exhibitor.price, bigText: '9+ SQM' },
    ].map((t, i) => {
      const x = 110 + i * 580, y = 380, w = 540, h = 560, ti = 1.3 + i * 0.6;
      const card = el(root, 'abs', { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px`, border: '1px solid rgba(140,200,234,.4)', background: 'rgba(8,40,56,.72)', backdropFilter: 'blur(10px)' });
      const tag = mono(card, t.tag, 30, 28, { size: 14, ls: 0.28 });
      const name = el(card, 'abs', { left: '30px', top: '56px', fontSize: '44px', fontWeight: 900, letterSpacing: '-0.02em' }, P[t.key].name);
      const big = el(card, 'abs hl', { left: '30px', top: '116px', fontSize: '96px', color: 'var(--ice)' }, t.bigText ?? '0');
      const unit = mono(card, t.bigText ? 'EXHIBITION SPACE' : 'PARTNERS ONLY', 30, 226, { size: 14, ls: 0.24, color: 'rgba(246,250,253,.7)' });
      const grid = el(card, 'abs', { left: '30px', top: '262px', width: `${w - 60}px` });
      const sq = Array.from({ length: t.n }, (_, k) => el(grid, 'abs', {
        left: `${(k % t.cols) * (t.sq + 8)}px`, top: `${Math.floor(k / t.cols) * (t.sq + 8)}px`, width: `${t.sq}px`, height: `${t.sq}px`, border: '1.5px solid rgba(140,200,234,.7)', background: 'rgba(140,200,234,0)',
      }));
      const gridH = Math.ceil(t.n / t.cols) * (t.sq + 8);
      const bl = t.bullets.map((b, j) => mono(card, `— ${b}`, 30, 262 + Math.max(gridH, 150) + 24 + j * 36, { size: 16, ls: 0.06, color: 'rgba(246,250,253,.9)' }));
      if (P.showPrices) bl.push(mono(card, `${t.price} · ${P.vatNote}`, 30, 262 + Math.max(gridH, 150) + 28 + 3 * 30 + 8, { size: 16, ls: 0.06, color: 'var(--ice)' }));
      return { ...t, card, tag, name, big, unit, sq, bl, ti };
    });
    const foot = mono(root, 'A LIMITED STRATEGIC PARTNERSHIP OPPORTUNITY · MAIN SPONSOR · CO-SPONSOR · EXHIBITOR', 116, 975, { size: 13, ls: 0.24, color: 'rgba(246,250,253,.6)' });

    ctx.cue(0.3, 'whoosh', { gain: 0.5 });
    tiers.forEach(t => { ctx.cue(t.ti, 'hit', { gain: 0.5 }); ctx.cue(t.ti + 0.5, 'count', { dur: 1.0, gain: 0.7 }); });
    ctx.cue(5.0, 'scan', { dur: 3.0 });

    return async lt => {
      await slot.update(lt);
      const vis = (e, t, d = 20) => { const q = E.outExpo(prog(lt, t, 0.8)); e.style.opacity = q.toFixed(3); e.style.transform = `translate3d(0,${((1 - q) * d).toFixed(1)}px,0)`; };
      vis(kick, 0.2, 10); vis(title, 0.35, 36); vis(foot, 6, 0);
      tiers.forEach((t, i) => {
        vis(t.card, t.ti, 50);
        if (!t.bigText) t.big.textContent = String(Math.round(t.n * E.outCubic(prog(lt, t.ti + 0.4, 1.0))));
        // squares appear in a cascade, then a bright scanner sweeps through them
        t.sq.forEach((e, k) => {
          const tk = t.ti + 0.6 + k * (1.1 / t.sq.length);
          const a = E.outExpo(prog(lt, tk, 0.4));
          const scan = lt > 5 ? clamp(1 - Math.abs((lt - 5.0) * (t.sq.length / 2.6) - k) / 2.2) : 0;
          e.style.opacity = a.toFixed(3);
          e.style.background = `rgba(140,200,234,${(0.1 + scan * 0.7).toFixed(3)})`;
          e.style.transform = `scale(${(0.6 + 0.4 * a + scan * 0.12).toFixed(3)})`;
        });
        t.bl.forEach((e, j) => vis(e, t.ti + 1.2 + j * 0.2, 10));
      });
    };
  },
};
