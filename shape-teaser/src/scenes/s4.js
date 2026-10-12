import { E, clamp, prog, lerp, el, mono, kin, vis, makeSlot, makeCanvas, ease, easeIO, W, H, P, MX, MY, COLORS } from '../lib.js';
import { NETWORK as NW } from '../brand.js';

// S4 · NETWORK & ECOSYSTEM (34–46 s). Two audiences meet at the SHAPE hub (34–40), then three words on footage (40–46).
export default {
  id: 's4', name: 'NETWORK', dur: 12.0,
  build(root, ctx) {
    const { g } = makeCanvas(root);
    const hub = P ? [W / 2, 940] : [W / 2, H * 0.47], HR = P ? 70 : 74;
    const lsz = P ? 21 : 16;
    const nB = NW.b2b.length, nC = NW.b2c.length;
    const colB = P ? MX + 14 : W * 0.34, colC = P ? MX + 14 : W * 0.66;
    const yB = i => P ? 470 + i * 70 : H * 0.2 + i * ((H * 0.58) / (nB - 1)) * 0.92;
    const yC = i => P ? 1100 + i * 70 : H * 0.22 + i * ((H * 0.54) / (nC - 1)) * 0.92;
    const BN = NW.b2b.map((t, i) => ({ t, x: colB, y: yB(i), at: 0.5 + i * 0.3 }));
    const CN = NW.b2c.map((t, i) => ({ t, x: colC, y: yC(i), at: 2.3 + i * 0.3 }));
    const labels = [...BN.map(n => ({ n, e: mono(root, n.t, { size: lsz, ls: 0.1, color: COLORS.white, ...(P ? { x: n.x + 28, y: n.y - lsz * 0.75 } : { x: n.x - 26 - 460, y: n.y - lsz * 0.75, w: 460, align: 'right' }) }) })),
                    ...CN.map(n => ({ n, e: mono(root, n.t, { size: lsz, ls: 0.1, color: COLORS.white, x: n.x + 28, y: n.y - lsz * 0.75 }) }))];
    const hdrB = mono(root, 'B2B AUDIENCE', { size: P ? 22 : 17, color: COLORS.accent, ...(P ? { x: MX, y: 415 } : { x: colB - 26 - 460, y: H * 0.115, w: 460, align: 'right' }) });
    const hdrC = mono(root, 'B2C AUDIENCE', { size: P ? 22 : 17, color: COLORS.warm, ...(P ? { x: MX, y: 1034 } : { x: colC + 28, y: H * 0.115 }) });
    const hubT = el(root, 'abs', { left: `${hub[0] - HR}px`, top: `${hub[1] - 26}px`, width: `${HR * 2}px`, textAlign: 'center', fontWeight: 800, fontSize: `${P ? 26 : 25}px`, lineHeight: 1.05, opacity: 0 }, 'SHAPE');
    const hubS = mono(root, 'INDONESIA<br>EXPO 2027', { x: hub[0] - HR, y: hub[1] + 2, w: HR * 2, align: 'center', size: P ? 11 : 10, ls: 0.14, color: COLORS.mist });
    const hsz = P ? 66 : 58;
    const head = kin(root, NW.headline.map(t => NW.accent.includes(t) ? { t, c: t === 'lifestyle.' ? 'warm' : 'acc' } : t), { size: hsz, x: MX, y: H - MY - hsz * 1.12 * (P ? 2 : 1), w: W - 2 * MX });
    // tricolon
    const tsz = P ? 150 : 128;
    const slots = NW.trio.map((tr, i) => makeSlot(root, tr.slot, ctx, ctx.t0 + 6 + i * 2, 2.1, { dim: 0.2, kb: [i - 1, 0] }));
    const words = NW.trio.map(tr => kin(root, [tr.w], { size: tsz, weight: 800, x: MX, y: H - MY - tsz * 1.12 - 56, w: W - 2 * MX }));
    const subs = NW.trio.map(tr => mono(root, tr.sub, { x: MX, y: H - MY - 26, size: P ? 24 : 19, color: COLORS.mist, ls: 0.22 }));
    const dots = [0, 1, 2].map(i => el(root, 'abs', { left: `${W - MX - 70 + i * 28}px`, top: `${MY}px`, width: '12px', height: '12px', borderRadius: '50%', background: COLORS.mist, opacity: 0 }));

    BN.forEach(n => ctx.cue(n.at, 'tick', { gain: 0.3 })); CN.forEach(n => ctx.cue(n.at, 'tick', { gain: 0.3 }));
    ctx.cue(0.0, 'swell', { dur: 1.6, gain: 0.5 }); ctx.cue(3.9, 'sweep', { gain: 0.45 }); ctx.cue(4.8, 'hit', { gain: 0.5 }); ctx.cue(4.8, 'ping', { gain: 0.5 });
    [6, 8, 10].forEach(t => { ctx.cue(t, 'ping', { gain: 0.6 }); ctx.cue(t, 'air', { gain: 0.4 }); });

    return async lt => {
      g.clearRect(0, 0, W, H);
      const netA = 1 - ease(prog(lt, 5.5, 0.5));
      const gp = ease(prog(lt, 3.2, 1.8)), mixk = ease(prog(lt, 4.6, 1.0));
      if (netA > 0) {
        // lines: audience → hub, then crossing B2B ↔ B2C through the hub
        const draw = (n, col, k) => {
          const q = ease(prog(lt, 3.0 + k * 0.05, 1.5));
          g.strokeStyle = col.replace('A', (0.35 * netA).toFixed(3)); g.lineWidth = 1.2;
          g.beginPath(); g.moveTo(n.x, n.y); g.lineTo(lerp(n.x, hub[0], q), lerp(n.y, hub[1], q)); g.stroke();
        };
        BN.forEach((n, i) => draw(n, 'rgba(125,184,224,A)', i)); CN.forEach((n, i) => draw(n, 'rgba(227,197,139,A)', i));
        BN.forEach((b, i) => CN.forEach((c, j) => {
          if ((i + j) % 2) return;
          const q = ease(prog(lt, 3.6 + (i + j) * 0.05, 1.5)); if (q <= 0) return;
          const gr = g.createLinearGradient(b.x, b.y, c.x, c.y); gr.addColorStop(0, `rgba(125,184,224,${0.28 * netA})`); gr.addColorStop(1, `rgba(227,197,139,${0.28 * netA})`);
          g.strokeStyle = gr; g.lineWidth = 1; g.beginPath(); g.moveTo(b.x, b.y); g.quadraticCurveTo(hub[0], hub[1] + (i - j) * 12, lerp(b.x, c.x, q), lerp(b.y, c.y, q)); g.stroke();
        }));
        // nodes
        for (const [arr, col] of [[BN, [125, 184, 224]], [CN, [227, 197, 139]]]) arr.forEach(n => {
          const a = ease(prog(lt, n.at, 0.5)) * netA; if (a <= 0) return;
          const c2 = col.map((v, i) => Math.round(lerp(v, [185, 190, 181][i], mixk * 0.6)));
          g.fillStyle = `rgba(${c2.join(',')},${a})`; g.beginPath(); g.arc(n.x, n.y, 7, 0, 6.283); g.fill();
        });
        // hub
        const hk = ease(prog(lt, 2.8, 0.8)) * netA;
        g.fillStyle = `rgba(9,31,57,${0.92 * hk})`; g.strokeStyle = `rgba(255,255,255,${0.85 * hk})`; g.lineWidth = 2;
        g.beginPath(); g.arc(hub[0], hub[1], HR * (0.8 + 0.2 * hk), 0, 6.283); g.fill(); g.stroke();
        hubT.style.opacity = hubS.style.opacity = hk.toFixed(3);
      } else hubT.style.opacity = hubS.style.opacity = '0';
      labels.forEach(({ n, e }) => { e.style.opacity = (ease(prog(lt, n.at, 0.6)) * netA).toFixed(3); });
      hdrB.style.opacity = (ease(prog(lt, 0.2, 0.6)) * netA).toFixed(3); hdrC.style.opacity = (ease(prog(lt, 2.0, 0.6)) * netA).toFixed(3);
      head.set(lt, 1.0, 5.6);
      // tricolon
      for (let i = 0; i < 3; i++) {
        const t0 = 6 + i * 2, loc = lt - t0, on = loc > -0.5 && loc < 2.5;
        slots[i].el.style.display = on ? '' : 'none';
        if (on) await slots[i].update(loc);
        slots[i].el.style.opacity = (ease(prog(loc, 0, 0.3))).toFixed(3);
        words[i].set(lt, t0 + 0.1, t0 + 1.85, 0.1);
        subs[i].style.opacity = (ease(prog(lt, t0 + 0.5, 0.6)) * (1 - ease(prog(lt, t0 + 1.85, 0.3)))).toFixed(3);
      }
      const di = clamp(Math.floor((lt - 6) / 2), 0, 2), da = ease(prog(lt, 6, 0.5)) * (lt < 11.9 ? 1 : 0);
      dots.forEach((d, i) => { d.style.opacity = da.toFixed(3); d.style.background = i === di ? COLORS.accent : COLORS.mist; d.style.transform = `scale(${i === di ? 1.3 : 0.8})`; });
    };
  },
};
