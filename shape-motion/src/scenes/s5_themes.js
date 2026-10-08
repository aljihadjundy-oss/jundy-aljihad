import { E, clamp, prog, lerp, el, mono, statement, s, isoProject, isoBox, isoFloor, pad2, W, H } from '../lib.js';

// 05 — six themes rise on an isometric platform; the active one lights up and its description appears in the index on the right.
export default {
  id: 'themes', name: 'ONE PLATFORM CONNECTING', dur: 11.0,
  build(root, ctx) {
    const T = ctx.content.themes;
    const svg = s('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}`, class: 'layer' }, root);
    svg.style.overflow = 'visible';
    const U = 72, P = isoProject(922, 404, U);
    const floor = isoFloor(svg, P, { x0: -1, y0: -1, nx: 9, ny: 7, step: 1 });
    const slab = isoBox(svg, P, { x: -0.6, y: -0.6, w: 7.9, d: 5.4, top: '#183858', left: '#0c2236', right: '#08182a', edge: 'rgba(140,200,234,.35)' });
    const H3 = [1.2, 1.6, 1.4, 1.9, 1.3, 1.1];
    const PITCH = 2.5, BW = 1.7, gx = i => (i % 3) * PITCH, gy = i => Math.floor(i / 3) * PITCH;
    // paint back-to-front (by x+y) so nearer boxes correctly cover farther ones
    const order = T.map((_, i) => i).sort((a, b) => (gx(a) + gy(a)) - (gx(b) + gy(b)));
    const boxes = [];
    order.forEach(i => { boxes[i] = isoBox(svg, P, { x: gx(i), y: gy(i), w: BW, d: BW, top: '#6FA6C8', left: '#386888', right: '#1d4466' }); });
    
    const links = s('g', {}, svg);
    const lines = boxes.map(() => s('path', { fill: 'none', stroke: 'rgba(140,200,234,.8)', 'stroke-width': 1.6, 'stroke-dasharray': '4 6', pathLength: 1 }, links));
    const node = s('circle', { fill: 'var(--white)', r: 7 }, svg);
    const nodeRing = s('circle', { fill: 'none', stroke: 'var(--ice)', 'stroke-width': 1.5 }, svg);

    const kick = mono(root, 'THE SIX SHAPE THEMES', 116, 400, { size: 17, ls: 0.3 });
    const s1 = statement(root, 'SIX THEMES.', 110, 440, { size: 88 });
    const s2 = statement(root, [{ t: 'one ' , c: 'serif' }, { t: 'platform.', c: 'serif' }], 110, 548, { size: 96, color: 'var(--ice)' });
    const cap = mono(root, 'FROM MIND POWER TO AESTHETICS — CONNECTED BY ONE EXPO', 116, 690, { size: 14, ls: 0.22, color: 'rgba(246,250,253,.7)' });

    const rows = T.map((t, i) => {
      const y = 292 + i * 100;
      const bar = el(root, 'abs', { left: '1480px', top: `${y}px`, width: '3px', height: '70px', background: 'var(--ice)', transformOrigin: '50% 0' });
      const num = mono(root, pad2(i + 1), 1500, y + 2, { size: 15, ls: 0.2, color: 'var(--ice)' });
      const name = el(root, 'abs', { left: '1500px', top: `${y + 24}px`, fontSize: '28px', fontWeight: 800, whiteSpace: 'nowrap', letterSpacing: '-0.01em' }, t.name);
      const desc = mono(root, t.desc, 1500, y + 58, { size: 15, ls: 0.05, color: 'rgba(246,250,253,.75)' });
      return { bar, num, name, desc };
    });

    const t0 = 1.3, gap = 1.0;
    T.forEach((_, i) => { ctx.cue(t0 + i * gap, 'rise'); ctx.cue(t0 + i * gap + 0.55, 'ping', { gain: 0.45 }); });
    ctx.cue(0.3, 'whoosh', { gain: 0.5 });
    ctx.cue(8.0, 'sweep', { gain: 0.8 }); ctx.cue(8.9, 'hit', { gain: 0.7 });

    return lt => {
      floor.set(E.outCubic(prog(lt, 0.2, 1.3)));
      slab.set(E.outExpo(prog(lt, 0.3, 1.0)) * 14 / U, { alpha: 0.95 });
      const act = Math.floor((lt - t0) / gap);
      boxes.forEach((b, i) => {
        const ti = t0 + i * gap;
        const k = E.outBack(prog(lt, ti, 0.9));
        const hot = lt >= ti && lt < ti + gap ? 1 : 0;
        b.set(H3[i] * k, { topFill: hot ? '#d9f0fb' : '#6FA6C8' });
        // link to hub
        const tp = P(gx(i) + BW / 2, gy(i) + BW / 2, H3[i] * Math.min(1, k));
        const hp = P(3.35, 2.1, 3.3);
        const lk = E.inOutCubic(prog(lt, 7.5 + i * 0.12, 0.8));
        lines[i].setAttribute('d', `M${tp[0].toFixed(1)},${tp[1].toFixed(1)} C${tp[0].toFixed(1)},${(tp[1] - 120).toFixed(1)} ${hp[0].toFixed(1)},${(hp[1] + 90).toFixed(1)} ${hp[0].toFixed(1)},${hp[1].toFixed(1)}`);
        lines[i].style.strokeDasharray = '3 7';
        lines[i].style.opacity = lk.toFixed(3);
        lines[i].style.strokeDashoffset = (-lt * 14).toFixed(1);
      });
      const hp = P(3.35, 2.1, 3.3), nk = E.outBack(prog(lt, 7.9, 0.6));
      node.setAttribute('cx', hp[0]); node.setAttribute('cy', hp[1]); node.setAttribute('r', 7 * nk);
      const cyc = lt > 8 ? ((lt - 8) % 1.8) / 1.8 : 0;
      nodeRing.setAttribute('cx', hp[0]); nodeRing.setAttribute('cy', hp[1]); nodeRing.setAttribute('r', 10 + cyc * 70);
      nodeRing.style.opacity = (nk > 0 ? (1 - cyc) * 0.8 : 0).toFixed(3);
      // text
      const vis = (e, t, d = 24) => { const k = E.outExpo(prog(lt, t, 0.8)); e.style.opacity = k.toFixed(3); e.style.transform = `translate3d(0,${((1 - k) * d).toFixed(1)}px,0)`; };
      vis(kick, 0.4, 12); vis(s1, 0.6, 40); vis(s2, 1.1, 40); vis(cap, 8.2, 12);
      rows.forEach((r, i) => {
        const ti = t0 + i * gap, shown = E.outExpo(prog(lt, ti, 0.7));
        const hot = clamp(1 - Math.abs(lt - (ti + gap / 2)) / (gap * 0.75)) > 0 && lt >= ti && lt < ti + gap ? 1 : 0;
        const dim = lt >= t0 + 6 * gap ? 0.85 : 0.4;
        const o = shown * (hot ? 1 : dim);
        r.num.style.opacity = r.name.style.opacity = o.toFixed(3);
        r.desc.style.opacity = (shown * (hot ? 1 : (lt >= t0 + 6 * gap ? 0.55 : 0))).toFixed(3);
        r.bar.style.transform = `scaleY(${(hot ? E.outExpo(prog(lt, ti, 0.3)) : 0).toFixed(3)})`;
        r.name.style.transform = `translate3d(${((1 - shown) * 30 + (hot ? 10 : 0)).toFixed(1)}px,0,0)`;
      });
    };
  },
};
