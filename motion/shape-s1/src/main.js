import { E, prog, clamp, lerp } from '/rt/engine.js';

let __res; window.__ready = new Promise(r => { __res = r; });
window.__duration = 10; window.__fps = 30; window.__beats = [];
const W = 1080, H = 1350, DUR = 10;
const NS = 'http://www.w3.org/2000/svg';
const stage = document.getElementById('stage');
const sv = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
const el = (cls, html, style, parent) => { const e = document.createElement('div'); e.className = cls; if (html != null) e.innerHTML = html; if (style) e.style.cssText = style; (parent || stage).appendChild(e); return e; };
const ph = (t, a, d, e = E.outExpo) => e(prog(t, a, d));
const cues = [];
const cue = (t, type, gain = 1) => cues.push({ t, type, gain });

await Promise.all([400, 500, 600, 700].map(w => document.fonts.load(`${w} 40px Pop`)));
await document.fonts.ready;
const proj = await (await fetch('/p/project.json')).json();
const photos = proj.photos || [];

// ------------------------------------------------------------ background
const root = el('abs', '', `left:0;top:0;width:${W}px;height:${H}px;overflow:hidden`);
const bg = el('abs', '', `left:-30px;top:-30px;width:${W + 60}px;height:${H + 60}px;background:url(/p/assets/bg_clean.jpg) center/cover no-repeat;will-change:transform`, root);
const glow = el('abs', '', `width:700px;height:700px;border-radius:50%;background:radial-gradient(circle, rgba(140,205,255,.28), rgba(140,205,255,0) 65%)`, root);

// ------------------------------------------------------------ helpers
let measure;
function fit(node, targetW) { // set font-size so the text is exactly targetW wide
  node.style.fontSize = '100px';
  const w = node.getBoundingClientRect().width;
  node.style.fontSize = (100 * targetW / w).toFixed(2) + 'px';
}
function txt(str, { x, y, w, weight = 700, color = '#fff', ls = 0, parent }) { // centred at x,y, fitted to width w
  const n = el('abs c', str, `left:${x}px;top:${y}px;font-weight:${weight};color:${color};letter-spacing:${ls}em;line-height:1;transform:translate(-50%,-50%)`, parent);
  fit(n, w);
  return n;
}
const setT = (n, { x = 0, y = 0, s = 1, o = 1, r = 0 }) => {
  n.style.transform = `translate(-50%,-50%) translate(${x.toFixed(2)}px,${y.toFixed(2)}px) scale(${s.toFixed(4)}) rotate(${r.toFixed(3)}deg)`;
  n.style.opacity = o.toFixed(4);
};

// ------------------------------------------------------------ chrome: dots + logo
const dots = [62, 108, 154].map(x => { const d = el('abs', '', `left:${x}px;top:92px;width:30px;height:30px;border-radius:50%;background:#6aa8d3;transform:translate(-50%,-50%)`); return d; });
const logo = el('abs', '', `left:542px;top:124px;width:204px;height:71px;background:url(/p/assets/logo_clean.png) center/contain no-repeat;transform:translate(-50%,-50%)`);

// ------------------------------------------------------------ pillars
const PIL = [
  { key: 'mind', x: 284, y: 332, lx: 284, ly: 416, lw: 81, label: 'MIND', t0: 1.15 },
  { key: 'fitness', x: 516, y: 329, lx: 516, ly: 416, lw: 119, label: 'FITNESS', t0: 1.4 },
  { key: 'nutrition', x: 763, y: 328, lx: 766, ly: 418, lw: 165, label: 'NUTRITION', t0: 1.65 },
].map(p => {
  const ic = el('abs', '', `left:${p.x}px;top:${p.y}px;width:126px;height:126px;background:url(/p/assets/ico_${p.key}.png) center/contain no-repeat`);
  const lb = txt(p.label, { x: p.lx, y: p.ly, w: p.lw, weight: 400, ls: 0.02 });
  return { ...p, ic, lb };
});
const xsv = sv('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, stage);
const xmarks = [410, 649].map(cx => {
  const g = sv('g', { stroke: '#fff', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, xsv);
  const a = sv('line', { x1: cx - 16, y1: 316, x2: cx + 16, y2: 348, pathLength: 1 }, g), b = sv('line', { x1: cx + 16, y1: 316, x2: cx - 16, y2: 348, pathLength: 1 }, g);
  a.style.strokeDasharray = '1'; b.style.strokeDasharray = '1';
  return { a, b };
});

// ------------------------------------------------------------ pill
const pillSvg = sv('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, stage);
const pillRect = sv('rect', { x: 267, y: 467, width: 548, height: 56, rx: 28, fill: 'none', stroke: '#fff', 'stroke-width': 2.6, pathLength: 1 }, pillSvg);
pillRect.style.strokeDasharray = '1';
const pillT = txt('Shape Expert Network · Sesi 1', { x: 540, y: 496, w: 486, weight: 500 });

// ------------------------------------------------------------ title
const T1 = txt('Sesi Kickoff', { x: 540, y: 598, w: 420, weight: 700 });
const redBox = el('abs', '', 'left:393px;top:652px;width:295px;height:70px;border-radius:8px;background:#aa2421;transform-origin:0 50%');
const T2 = txt('Selesai', { x: 540, y: 686, w: 262, weight: 700 });
const L1 = txt('Triangle of Life: Mind, Fitness, Nutrition.', { x: 540, y: 790, w: 880, weight: 700 });
const L2 = txt('Terima kasih sudah hadir.', { x: 540, y: 851, w: 590, weight: 700 });
[T1, T2, L1, L2].forEach(n => { n.style.webkitTextStroke = '1.3px #fff'; });

// ------------------------------------------------------------ photo frame
const FR = { x: 80, y: 912, w: 920, h: 303 };
const frSvg = sv('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, stage);
const frRect = sv('rect', { x: FR.x, y: FR.y, width: FR.w, height: FR.h, rx: 40, fill: 'none', stroke: '#fff', 'stroke-width': 3, 'stroke-dasharray': '16 14' }, frSvg);
const frClip = el('abs', '', `left:${FR.x}px;top:${FR.y}px;width:${FR.w}px;height:${FR.h}px;border-radius:40px;overflow:hidden;background:rgba(8,30,60,.55)`);
const phEls = [];
for (const p of photos) {
  const d = el('abs', '', `left:0;top:0;width:${FR.w}px;height:${FR.h}px;overflow:hidden`, frClip);
  const tiles = [];
  for (const tl of p.tiles) {
    const [rx, ry, rw, rh] = tl.rect;
    const box = el('abs', '', `left:${rx}px;top:${ry}px;width:${rw}px;height:${rh}px;overflow:hidden;border-radius:${rx > 0 ? 26 : 0}px`, d);
    const img = new Image(); img.src = '/p/' + tl.src; await img.decode();
    const im = el('abs', '', `left:0;top:0;width:${img.naturalWidth}px;height:${img.naturalHeight}px;background:url(/p/${tl.src}) 0 0/100% 100% no-repeat;transform-origin:0 0`, box);
    tiles.push({ box, im, tl, rw, rh });
  }
  phEls.push({ d, tiles });
}
const phLabel = el('abs c', 'ASET<br><span style="font-weight:400">FOTO MOMEN SESI 1</span>', `left:${FR.x + FR.w / 2}px;top:${FR.y + FR.h / 2}px;font-size:30px;font-weight:600;line-height:1.4;letter-spacing:.02em;transform:translate(-50%,-50%)`);
const frameBorder = sv('rect', { x: FR.x, y: FR.y, width: FR.w, height: FR.h, rx: 40, fill: 'none', stroke: '#fff', 'stroke-width': 3, 'stroke-dasharray': '16 14' }, frSvg);

// arrow
const arSvg = sv('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, stage);
const arG = sv('g', {}, arSvg);
sv('circle', { cx: 912, cy: 1182, r: 57, fill: 'rgba(12,40,76,.35)', stroke: '#fff', 'stroke-width': 4.5 }, arG);
const arrow = sv('g', { stroke: '#fff', 'stroke-width': 4.5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, arG);
sv('line', { x1: 880, y1: 1182, x2: 942, y2: 1182 }, arrow); sv('polyline', { points: '918,1158 942,1182 918,1206' }, arrow);

// ------------------------------------------------------------ cues
cue(0.4, 'soft', 0.9); [0.25, 0.4, 0.55].forEach(t => cue(t, 'tick', 0.9));
PIL.forEach(p => cue(p.t0 + 0.05, 'pop', 1.2)); cue(1.5, 'tick', 0.8); cue(1.8, 'tick', 0.8);
cue(2.3, 'swoosh', 0.9);
cue(2.9, 'whoosh', 0.9); cue(3.62, 'whoosh', 1.0); cue(3.9, 'pop', 2.0);
cue(4.35, 'soft', 0.9); cue(4.6, 'tick', 0.7);
cue(5.1, 'swoosh', 1.0);
const NP = Math.max(photos.length, 5), PS = 5.5, PD = Math.min(1.1, 3.9 / NP);
for (let i = 0; i < NP; i++) cue(PS + i * PD, i === 0 ? 'pop' : 'tick', 1.0);
cue(8.9, 'pop', 1.1);

// ------------------------------------------------------------ update
function update(t) {
  // camera shake on "Selesai" stamp
  const sh = Math.max(0, 1 - prog(t, 3.88, 0.28)) * (t >= 3.88 ? 1 : 0);
  const shx = Math.sin(t * 110) * 7 * sh, shy = Math.cos(t * 97) * 5 * sh;
  stage.style.transform = `translate(${shx.toFixed(2)}px,${shy.toFixed(2)}px)`;

  // bg
  const gk = ph(t, 0, 1.3, E.inOutCubic);
  bg.style.clipPath = `inset(0 ${((1 - gk) * 100).toFixed(2)}% 0 0)`;
  bg.style.transform = `translate(${(Math.sin(t * 0.4) * 10).toFixed(2)}px,${(Math.cos(t * 0.33) * 8).toFixed(2)}px) scale(${(1 + 0.012 * t / 10 + 0.006 * Math.sin(t * 0.7)).toFixed(4)})`;
  glow.style.left = (760 + Math.sin(t * 0.5) * 80 - 350) + 'px'; glow.style.top = (330 + Math.cos(t * 0.4) * 60 - 350) + 'px';

  // chrome
  dots.forEach((d, i) => { const k = ph(t, 0.15 + i * 0.15, 0.6, E.outBack); d.style.transform = `translate(-50%,-50%) scale(${k.toFixed(3)})`; });
  const lk = ph(t, 0.45, 1.0);
  logo.style.opacity = lk; logo.style.transform = `translate(-50%,-50%) translateY(${(14 * (1 - lk)).toFixed(1)}px) scale(${(0.9 + 0.1 * lk).toFixed(3)})`;

  // pillars
  PIL.forEach((p, i) => {
    const k = ph(t, p.t0, 0.75, E.outBack), bob = Math.sin(t * 1.8 + i * 1.3) * 4 * ph(t, p.t0 + 0.8, 0.5);
    p.ic.style.transform = `translate(-50%,-50%) translateY(${bob.toFixed(2)}px) scale(${k.toFixed(3)}) rotate(${((1 - k) * -18).toFixed(2)}deg)`;
    p.ic.style.opacity = clamp(k * 2);
    const lk2 = ph(t, p.t0 + 0.2, 0.6);
    setT(p.lb, { y: 18 * (1 - lk2), o: lk2 });
  });
  xmarks.forEach((m, i) => { const k = ph(t, 1.35 + i * 0.25, 0.5, E.outCubic); m.a.style.strokeDashoffset = (1 - clamp(k * 2)).toFixed(3); m.b.style.strokeDashoffset = (1 - clamp(k * 2 - 1)).toFixed(3); });

  // pill
  pillRect.style.strokeDashoffset = (1 - ph(t, 2.1, 0.85, E.inOutCubic)).toFixed(3);
  const pk = ph(t, 2.55, 0.6);
  pillT.style.clipPath = `inset(0 ${((1 - pk) * 100).toFixed(1)}% 0 0)`; setT(pillT, { o: pk });

  // title
  const k1 = ph(t, 2.95, 0.75); setT(T1, { y: 44 * (1 - k1), o: k1 });
  T1.style.clipPath = 'none';
  const kb = ph(t, 3.5, 0.45, E.outCubic); redBox.style.transform = `scaleX(${kb.toFixed(4)})`; redBox.style.opacity = kb > 0.001 ? 1 : 0;
  const ks = ph(t, 3.7, 0.55, E.outBack); setT(T2, { s: 1.5 - 0.5 * ks, o: clamp(ks * 3) });
  const l1k = ph(t, 4.2, 0.8); setT(L1, { y: 40 * (1 - l1k), o: l1k });
  const l2k = ph(t, 4.5, 0.8); setT(L2, { y: 40 * (1 - l2k), o: l2k });

  // photo frame
  const fk = ph(t, 5.0, 0.8, E.outCubic);
  frRect.setAttribute('opacity', 0);
  frameBorder.setAttribute('stroke-dashoffset', (-t * 14).toFixed(2));
  frameBorder.setAttribute('opacity', fk.toFixed(3));
  frameBorder.setAttribute('transform', `translate(${FR.x + FR.w / 2},${FR.y + FR.h / 2}) scale(${(0.94 + 0.06 * fk).toFixed(4)}) translate(${-(FR.x + FR.w / 2)},${-(FR.y + FR.h / 2)})`);
  frClip.style.opacity = fk; frClip.style.transform = `scale(${(0.94 + 0.06 * fk).toFixed(4)})`;
  if (photos.length) {
    phLabel.style.opacity = 0;
    phEls.forEach((p, i) => {
      const a = PS + i * PD, last = i === phEls.length - 1;
      const kin = ph(t, a - 0.05, 0.4, E.outCubic), kout = last ? 0 : ph(t, a + PD - 0.05, 0.4, E.inOutCubic);
      p.d.style.opacity = kin * (1 - kout); p.d.style.visibility = p.d.style.opacity > 0.002 ? 'visible' : 'hidden';
      p.d.style.zIndex = i;
      const z = 1 + 0.06 * clamp((t - a) / (PD + 0.4));
      const u = clamp((t - a) / (PD + 0.3));
      p.tiles.forEach((T, ti) => {
        const [x0, y0, x1, y1] = T.tl.crop, cw = x1 - x0, ch = y1 - y0;
        const sc = Math.max(T.rw / cw, T.rh / ch) * z;
        const ovx = cw * sc - T.rw, ovy = ch * sc - T.rh;
        const [pa, pb] = T.tl.pan || [0.5, 0.5], pp = lerp(pa, pb, u);
        const ox = x0 * sc + ovx * (ovx > ovy ? pp : 0.5), oy = y0 * sc + ovy * (ovy >= ovx ? pp : 0.5);
        T.im.style.transform = `translate(${(-ox).toFixed(1)}px,${(-oy).toFixed(1)}px) scale(${sc.toFixed(4)})`;
        const kt = ph(t, a - 0.02 + ti * 0.1, 0.45, E.outCubic);
        T.box.style.opacity = kt.toFixed(3);
      });
      p.d.style.transform = `translateX(${(kin < 1 ? (1 - kin) * 50 : 0).toFixed(1)}px)`;
    });
  } else {
    const pulse = 0.78 + 0.22 * Math.sin(t * 3);
    phLabel.style.opacity = (fk * pulse).toFixed(3);
  }

  // arrow
  const ak = ph(t, 5.6, 0.7, E.outBack);
  arG.style.transformOrigin = '912px 1182px'; arG.style.transform = `scale(${ak.toFixed(3)})`; arG.style.opacity = clamp(ak * 2);
  const nud = t > 8.6 ? Math.abs(Math.sin((t - 8.6) * 4.5)) * 10 * (1 - prog(t, 9.6, 0.4)) : 0;
  arrow.setAttribute('transform', `translate(${nud.toFixed(2)},0)`);
}

window.__cues = cues;
window.seek = t => { update(t); };
update(0);
__res();
