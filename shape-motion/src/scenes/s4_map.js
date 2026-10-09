import { E, clamp, prog, lerp, el, mono, statement, typed, makeCanvas, rng, W, H } from '../lib.js';

// 04 — the hero scene: dot-matrix Southeast Asia lights up from the Jakarta hub, an arc reaches Bangkok, a radar sweeps the region.
const SC = 24, OX = 960, OY = 150, LON0 = 92, LAT0 = 21;
const pos = (lon, lat) => [OX + (lon - LON0) * SC, OY + (LAT0 - lat) * SC];
const JAK = pos(106.85, -6.2), BKK = pos(100.5, 13.75);
const CTRL = [1005, 560];

export default {
  id: 'map', name: 'SOUTHEAST ASIA PLATFORM', dur: 16.0,
  build(root, ctx) {
    const { dots } = ctx.seaDots;
    const r = rng(5);
    const D = dots.map(([lon, lat]) => {
      const [x, y] = pos(lon, lat);
      const d = Math.hypot(x - JAK[0], y - JAK[1]) / SC;
      return { x, y, t: 0.5 + d * 0.085 + r() * 0.35, ang: Math.atan2(y - JAK[1], x - JAK[0]), near: Math.min(Math.hypot(x - JAK[0], y - JAK[1]), Math.hypot(x - BKK[0], y - BKK[1])), ph: r() * 6.28 };
    });
    const { c, g } = makeCanvas(root);

    const kick = mono(root, 'SOUTHEAST ASIA PLATFORM', 116, 560, { size: 17, ls: 0.3 });
    const s1 = statement(root, 'TWO COUNTRIES.', 110, 600, { size: 88 });
    const s2 = statement(root, [{ t: 'ONE PLATFORM.', c: 'ice' }], 110, 700, { size: 88 });
    const radarNote = mono(root, '', 116, 830, { size: 17, ls: 0.24, color: 'rgba(246,250,253,.8)' });
    const labJ = mono(root, 'JAKARTA · NICE PIK 2 · EXPO HUB', JAK[0] + 26, JAK[1] - 12, { size: 15, color: 'var(--white)' });
    const labB = mono(root, 'BANGKOK · BITEC · THAILAND EDITION', BKK[0] + 26, BKK[1] - 12, { size: 15, color: 'var(--white)' });
    for (const l of [labJ, labB]) { l.style.padding = '5px 9px'; l.style.background = 'rgba(5,14,26,.78)'; l.style.border = '1px solid rgba(140,200,234,.4)'; }
    const attr = mono(root, 'MAP · GEOBOUNDARIES (CC BY 4.0)', OX, 960, { size: 11, ls: 0.2, color: 'rgba(140,200,234,.35)' });

    const venueK = mono(root, 'THE VENUE', 116, 520, { size: 17, ls: 0.3 });
    const venueT = statement(root, [{ t: '4,500', c: 'ice' }, { t: ' SQM', c: '' }], 110, 556, { size: 96 });
    const venueS = mono(root, 'EXHIBITION HALL · NICE PIK 2', 116, 668, { size: 17, ls: 0.24, color: 'rgba(246,250,253,.8)' });
    const chips = ctx.content.venueAreas.map((a, i) => {
      const e = mono(root, a, 116 + (i % 2) * 330, 730 + Math.floor(i / 2) * 62, { size: 15, color: 'var(--white)' });
      Object.assign(e.style, { padding: '12px 16px', border: '1px solid rgba(140,200,234,.4)', background: 'rgba(24,56,88,.45)', width: '300px' });
      return e;
    });

    ctx.cue(0.5, 'scatter', { dur: 3.6 });
    ctx.cue(1.4, 'ping', { gain: 0.9 });
    ctx.cue(4.6, 'sweep', { gain: 0.8 });
    ctx.cue(6.1, 'ping', { gain: 0.9 });
    ctx.cue(6.5, 'hit', { gain: 0.5 }); ctx.cue(7.7, 'hit', { gain: 0.5 });
    ctx.cue(9.4, 'radar'); ctx.cue(12.25, 'radar', { gain: 0.7 });
    chips.forEach((_, i) => ctx.cue(12.9 + i * 0.18, 'tick'));
    ctx.cue(12.5, 'hit', { gain: 0.6 });

    const arcPt = k => { const a = 1 - k; return [a * a * JAK[0] + 2 * a * k * CTRL[0] + k * k * BKK[0], a * a * JAK[1] + 2 * a * k * CTRL[1] + k * k * BKK[1]]; };
    const ring = (x, y, rr, a, w = 1.5) => { g.strokeStyle = `rgba(140,200,234,${a})`; g.lineWidth = w; g.beginPath(); g.arc(x, y, rr, 0, 6.283); g.stroke(); };

    return lt => {
      g.clearRect(0, 0, W, H);
      const radarOn = E.outCubic(prog(lt, 9.3, 0.6)) * (1 - E.inCubic(prog(lt, 12.3, 0.6)));
      const beam = (lt - 9.4) * 2.2;
      D.forEach(d => {
        const age = lt - d.t;
        if (age < 0) return;
        const k = E.outCubic(clamp(age / 0.5));
        let a = (0.46 + 0.14 * Math.sin(lt * 1.5 + d.ph)) * k;
        let rad = 2.1;
        const front = 1 - clamp(age / 0.45);                 // reveal wavefront glows
        a += front * 0.7; rad += front * 1.4;
        if (d.near < 26) { a = Math.max(a, 0.95); rad = 3.2; }
        if (radarOn > 0) {
          let da = ((beam - d.ang) % 6.283 + 6.283) % 6.283;  // radians since the beam passed this dot
          if (da < 1.1) { const b = (1 - da / 1.1) * radarOn; a += b * 0.8; rad += b * 1.3; }
        }
        g.fillStyle = `rgba(${d.near < 26 ? '246,250,253' : '140,200,234'},${Math.min(1, a).toFixed(3)})`;
        g.beginPath(); g.arc(d.x, d.y, rad, 0, 6.283); g.fill();
      });
      // nodes
      const nj = E.outExpo(prog(lt, 1.2, 0.8)), nb = E.outExpo(prog(lt, 6.0, 0.8));
      for (const [n, P, t0] of [[nj, JAK, 1.2], [nb, BKK, 6.0]]) {
        if (n <= 0) continue;
        const cyc = ((lt - t0) % 2.2) / 2.2;
        ring(P[0], P[1], 8 + n * 6, n, 2.5);
        ring(P[0], P[1], 14 + cyc * 60, (1 - cyc) * 0.7 * n);
        g.fillStyle = `rgba(246,250,253,${n})`; g.beginPath(); g.arc(P[0], P[1], 5.5, 0, 6.283); g.fill();
      }
      // arc Jakarta → Bangkok
      const ak = E.inOutCubic(prog(lt, 4.6, 1.5));
      if (ak > 0) {
        g.strokeStyle = 'rgba(140,200,234,.9)'; g.lineWidth = 2.2; g.beginPath();
        for (let i = 0; i <= 60; i++) { const p = arcPt((i / 60) * ak); i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }
        g.stroke();
        if (lt > 6.1) { const q = arcPt(((lt - 6.1) * 0.35) % 1); g.fillStyle = 'rgba(246,250,253,.95)'; g.beginPath(); g.arc(q[0], q[1], 4, 0, 6.283); g.fill(); }
      }
      // radar
      if (radarOn > 0) {
        for (const rr of [110, 220, 330, 440]) ring(JAK[0], JAK[1], rr, 0.22 * radarOn, 1);
        for (let i = 0; i < 28; i++) {
          const a0 = beam - i * 0.04, a1 = a0 - 0.04;
          g.fillStyle = `rgba(140,200,234,${((1 - i / 28) * 0.28 * radarOn).toFixed(3)})`;
          g.beginPath(); g.moveTo(JAK[0], JAK[1]); g.arc(JAK[0], JAK[1], 470, a1, a0); g.closePath(); g.fill();
        }
        g.strokeStyle = `rgba(246,250,253,${0.9 * radarOn})`; g.lineWidth = 2; g.beginPath(); g.moveTo(JAK[0], JAK[1]); g.lineTo(JAK[0] + Math.cos(beam) * 470, JAK[1] + Math.sin(beam) * 470); g.stroke();
      }
      // text
      const vis = (e, t0, t1, d = 24) => { const k = E.outExpo(prog(lt, t0, 0.8)) * (1 - E.inCubic(prog(lt, t1, 0.45))); e.style.opacity = k.toFixed(3); e.style.transform = `translate3d(0,${((1 - k) * d).toFixed(1)}px,0)`; };
      vis(labJ, 1.6, 99, 10); vis(labB, 6.3, 99, 10); vis(attr, 1, 99, 0);
      vis(kick, 6.2, 12.2); vis(s1, 6.4, 12.2, 40); vis(s2, 7.5, 12.2, 40);
      typed(radarNote, [{ t: 'B2B + B2C · INDUSTRY + CONSUMERS' }], prog(lt, 9.7, 1.4));
      radarNote.style.opacity = (1 - E.inCubic(prog(lt, 12.2, 0.4))).toFixed(3);
      vis(venueK, 12.5, 99, 14); vis(venueT, 12.6, 99, 40); vis(venueS, 12.9, 99, 14);
      chips.forEach((e, i) => vis(e, 13.0 + i * 0.18, 99, 16));
    };
  },
};
