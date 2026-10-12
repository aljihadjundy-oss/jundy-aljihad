import { E, clamp, prog, lerp, el, mono, kin, vis, makeCanvas, isoProject, isoBox, isoFloor, s, ease, easeIO, W, H, MX, MY, COLORS } from '../lib.js';
import { NETWORK as NW, COUNTS } from '../brand.js';

// S4 · NETWORK (36–47 s). Two audiences meet at the SHAPE hub (radar sweep), then the formula in numbers on an isometric floor.
export default {
  id: 's4', name: 'NETWORK', dur: 11.0,
  build(root, ctx) {
    const { g } = makeCanvas(root);
    const hub = [W / 2, H * 0.47], HR = 104, NETT = 7.0;
    const nB = NW.b2b.length, nC = NW.b2c.length, colB = W * 0.34, colC = W * 0.66, lsz = 17;
    const yB = i => H * 0.2 + i * ((H * 0.58) / (nB - 1)) * 0.92, yC = i => H * 0.22 + i * ((H * 0.54) / (nC - 1)) * 0.92;
    const BN = NW.b2b.map((t, i) => ({ t, x: colB, y: yB(i), at: 0.5 + i * 0.3 })), CN = NW.b2c.map((t, i) => ({ t, x: colC, y: yC(i), at: 2.3 + i * 0.3 }));
    const labels = [...BN.map(n => ({ n, e: mono(root, n.t, { size: lsz, ls: 0.1, color: COLORS.white, x: n.x - 26 - 470, y: n.y - lsz * 0.75, w: 470, align: 'right' }) })),
                    ...CN.map(n => ({ n, e: mono(root, n.t, { size: lsz, ls: 0.1, color: COLORS.white, x: n.x + 28, y: n.y - lsz * 0.75 }) }))];
    const hdrB = mono(root, 'B2B AUDIENCE', { size: 18, color: COLORS.accent, x: colB - 26 - 470, y: H * 0.115, w: 470, align: 'right' });
    const hdrC = mono(root, 'B2C AUDIENCE', { size: 18, color: COLORS.warm, x: colC + 28, y: H * 0.115 });
    const lgW = HR * 1.8, lgH = lgW * 1056 / 3044;
    const hubLogo = el(root, 'abs', { left: `${hub[0] - lgW / 2}px`, top: `${hub[1] - lgH / 2}px`, width: `${lgW}px`, opacity: 0 }, null, 'img'); hubLogo.src = ctx.logo;
    const hsz = 64;
    const h1 = kin(root, ['Where', { t: 'business', c: 'acc' }, 'meets', { t: 'lifestyle.', c: 'serif warm big' }], { size: hsz, weight: 800, x: MX, y: H - MY - hsz * 1.25, w: 1100 });
    // counters on an isometric floor
    const svg = s('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}`, class: 'layer' }, root); svg.style.overflow = 'visible';
    const U = 80, Pj = isoProject(W / 2, 520, U);
    const floor = isoFloor(svg, Pj, { x0: -0.6, y0: -0.6, nx: 6, ny: 6, step: 1 });
    const pos = [[0.2, 3.9], [1.9, 2.2], [3.6, 0.5]], hts = [3.0, 1.3, 0.7];
    const bars = pos.map(([x, y], i) => isoBox(svg, Pj, { x, y, w: 1.15, d: 1.15, top: i === 0 ? '#bfe3f7' : '#7DB8E0', left: '#447CA0', right: '#2E5A7A' }));
    const nums = COUNTS.map((c, i) => el(root, 'abs hl', { fontSize: '150px', fontWeight: 800, color: COLORS.white, opacity: 0, whiteSpace: 'nowrap', textAlign: 'center', width: '400px', lineHeight: 1 }, '0'));
    const caps = COUNTS.map(c => mono(root, c.label + (c.sub ? '<br><span style="color:#D7DFE5;font-size:14px">' + c.sub + '</span>' : ''), { size: 18, ls: 0.22, color: COLORS.accent, align: 'center', w: 230, wrap: true }));
    const nk = mono(root, 'THE SHAPE FORMULA', { x: MX, y: 140, size: 18, ls: 0.3, color: COLORS.accent });
    const nh = el(root, 'abs serif', { left: `${MX}px`, top: `${H - MY - 130}px`, fontSize: '110px', color: COLORS.white, opacity: 0, whiteSpace: 'nowrap' }, 'one platform.');

    BN.forEach(n => ctx.cue(n.at, 'tick', { gain: 0.3 })); CN.forEach(n => ctx.cue(n.at, 'tick', { gain: 0.3 }));
    ctx.cue(0.0, 'swell', { dur: 1.6, gain: 0.5 }); ctx.cue(2.8, 'ping', { gain: 0.5 }); ctx.cue(3.9, 'sweep', { gain: 0.5 }); ctx.cue(4.4, 'radar', { gain: 0.5 }); ctx.cue(5.4, 'hit', { gain: 0.45 });
    ctx.cue(NETT, 'air', { gain: 0.5 }); COUNTS.forEach((_, i) => { ctx.cue(NETT + 0.8 + i * 0.7, 'ping', { gain: 0.55 }); ctx.cue(NETT + 0.7 + i * 0.7, 'count', { dur: 0.9, gain: 0.5 }); });

    return lt => {
      g.clearRect(0, 0, W, H);
      const netA = 1 - ease(prog(lt, NETT - 0.5, 0.5));
      if (netA > 0) {
        const draw = (n, col, k) => { const q = ease(prog(lt, 3.0 + k * 0.05, 1.5)); g.strokeStyle = col.replace('A', (0.35 * netA).toFixed(3)); g.lineWidth = 1.2; g.beginPath(); g.moveTo(n.x, n.y); g.lineTo(lerp(n.x, hub[0], q), lerp(n.y, hub[1], q)); g.stroke(); };
        BN.forEach((n, i) => draw(n, 'rgba(125,184,224,A)', i)); CN.forEach((n, i) => draw(n, 'rgba(227,197,139,A)', i));
        BN.forEach((b, i) => CN.forEach((c, j) => {
          if ((i + j) % 2) return; const q = ease(prog(lt, 3.6 + (i + j) * 0.05, 1.5)); if (q <= 0) return;
          const gr = g.createLinearGradient(b.x, b.y, c.x, c.y); gr.addColorStop(0, `rgba(125,184,224,${0.28 * netA})`); gr.addColorStop(1, `rgba(227,197,139,${0.28 * netA})`);
          g.strokeStyle = gr; g.lineWidth = 1; g.beginPath(); g.moveTo(b.x, b.y); g.quadraticCurveTo(hub[0], hub[1] + (i - j) * 12, lerp(b.x, c.x, q), lerp(b.y, c.y, q)); g.stroke();
        }));
        for (const [arr, col] of [[BN, [125, 184, 224]], [CN, [227, 197, 139]]]) arr.forEach(n => { const a = ease(prog(lt, n.at, 0.5)) * netA; if (a <= 0) return; g.fillStyle = `rgba(${col.join(',')},${a})`; g.beginPath(); g.arc(n.x, n.y, 7, 0, 6.283); g.fill(); });
        // radar sweep around the hub (GTFN)
        const ra = ease(prog(lt, 4.2, 0.5)) * (1 - ease(prog(lt, 6.2, 0.6))) * netA;
        if (ra > 0) {
          const beam = (lt - 4.2) * 2.1;
          for (const rr of [150, 260, 370, 480]) { g.strokeStyle = `rgba(125,184,224,${(0.2 * ra).toFixed(3)})`; g.lineWidth = 1; g.beginPath(); g.arc(hub[0], hub[1], rr, 0, 6.283); g.stroke(); }
          for (let i = 0; i < 26; i++) { const a0 = beam - i * 0.04; g.fillStyle = `rgba(125,184,224,${((1 - i / 26) * 0.2 * ra).toFixed(3)})`; g.beginPath(); g.moveTo(hub[0], hub[1]); g.arc(hub[0], hub[1], 480, a0 - 0.04, a0); g.closePath(); g.fill(); }
          g.strokeStyle = `rgba(255,255,255,${(0.8 * ra).toFixed(3)})`; g.lineWidth = 1.6; g.beginPath(); g.moveTo(hub[0], hub[1]); g.lineTo(hub[0] + Math.cos(beam) * 480, hub[1] + Math.sin(beam) * 480); g.stroke();
        }
        const hk = ease(prog(lt, 2.8, 0.8)) * netA;
        g.fillStyle = `rgba(9,31,57,${0.94 * hk})`; g.beginPath(); g.arc(hub[0], hub[1], HR * (0.8 + 0.2 * hk), 0, 6.283); g.fill();
        hubLogo.style.opacity = hk.toFixed(3); hubLogo.style.transform = `scale(${(0.9 + 0.1 * hk).toFixed(3)})`;
      } else hubLogo.style.opacity = '0';
      labels.forEach(({ n, e }) => { e.style.opacity = (ease(prog(lt, n.at, 0.6)) * netA).toFixed(3); });
      hdrB.style.opacity = (ease(prog(lt, 0.2, 0.6)) * netA).toFixed(3); hdrC.style.opacity = (ease(prog(lt, 2.0, 0.6)) * netA).toFixed(3);
      h1.set(lt, 1.0, NETT - 0.6);
      // counters
      const nl = lt - NETT;
      floor.set(ease(prog(nl, 0.0, 1.0)) * (nl < 0 ? 0 : 1) * (lt > 10.5 ? 1 : 1));
      svg.style.opacity = ease(prog(nl, -0.1, 0.5)).toFixed(3);
      bars.forEach((b, i) => {
        const k = ease(prog(nl, 0.6 + i * 0.7, 1.0)); b.set(hts[i] * k);
        const tc = b.topCenter(), base = Pj(pos[i][0] + 0.575, pos[i][1] + 0.575, 0);
        const cnt = COUNTS[i], v = Math.round(cnt.n * ease(prog(nl, 0.8 + i * 0.7, 0.9)));
        nums[i].textContent = String(v).padStart(2, '0');
        const a = ease(prog(nl, 0.8 + i * 0.7, 0.6));
        nums[i].style.left = `${tc[0] - 200}px`; nums[i].style.top = `${tc[1] - 190}px`; nums[i].style.opacity = a.toFixed(3);
        caps[i].style.left = `${base[0] - 115}px`; caps[i].style.top = `${base[1] + 78}px`; caps[i].style.opacity = a.toFixed(3);
      });
      vis(nk, nl, 0.1, { d: 10 }); vis(nh, nl, 0.5, { d: 26 });
      nk.style.opacity = (lt >= NETT ? nk.style.opacity : 0); nh.style.opacity = (lt >= NETT ? nh.style.opacity : 0);
    };
  },
};
