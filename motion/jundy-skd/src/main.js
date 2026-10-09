import { E, prog, clamp, lerp } from '/rt/engine.js';

const W = 1080, H = 1920, CX = 540, CY = 880, U = 62, C30 = 0.866, DUR = 30;
const NS = 'http://www.w3.org/2000/svg';
const stage = document.getElementById('stage');
const sv = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
const div = (cls, parent, html, style) => { const e = document.createElement('div'); e.className = cls; if (html != null) e.innerHTML = html; if (style) e.style.cssText = style; (parent || stage).appendChild(e); return e; };
const P = (x, y, z = 0) => [(x - y) * C30 * U, (x + y) * 0.5 * U - z * U];
const pts = a => a.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
const ph = (t, a, d, e = E.outExpo) => e(prog(t, a, d));
const win = (t, a, b, din = 0.7, dout = 0.5) => ph(t, a, din) * (1 - E.inCubic(prog(t, b, dout)));
const mixc = (c1, c2, k) => c1.map((v, i) => Math.round(lerp(v, c2[i], k)));
const rgb = c => `rgb(${c[0]},${c[1]},${c[2]})`;
const CYAN = '#7fd6ff', AMBER = '#ffb547', EDGE = 'rgba(120,190,255,.62)';

// ---------------------------------------------------------------- cues (sound)
const cues = [];
const cue = (t, type, gain = 1) => cues.push({ t, type, gain });

// ---------------------------------------------------------------- background
const bg = sv('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, stage);
const defs = sv('defs', {}, bg);
const lg = sv('linearGradient', { id: 'bgg', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
sv('stop', { offset: 0, 'stop-color': '#050b1a' }, lg); sv('stop', { offset: 0.55, 'stop-color': '#08173a' }, lg); sv('stop', { offset: 1, 'stop-color': '#050b1a' }, lg);
for (const [id, c] of [['gA', '#2563eb'], ['gB', '#38bdf8']]) {
  const rg = sv('radialGradient', { id }, defs);
  sv('stop', { offset: 0, 'stop-color': c, 'stop-opacity': 0.5 }, rg); sv('stop', { offset: 1, 'stop-color': c, 'stop-opacity': 0 }, rg);
}
const dots = sv('pattern', { id: 'dots', width: 54, height: 54, patternUnits: 'userSpaceOnUse' }, defs);
sv('circle', { cx: 1.5, cy: 1.5, r: 1.2, fill: 'rgba(130,180,255,.16)' }, dots);
sv('rect', { width: W, height: H, fill: 'url(#bgg)' }, bg);
const glowA = sv('circle', { r: 620, fill: 'url(#gA)' }, bg);
const glowB = sv('circle', { r: 480, fill: 'url(#gB)' }, bg);
sv('rect', { width: W, height: H, fill: 'url(#dots)' }, bg);

// ---------------------------------------------------------------- scene (iso)
const scene = sv('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, stage);
scene.style.overflow = 'visible';
const cam = sv('g', {}, scene);
const iso = sv('g', {}, cam);
iso.style.filter = 'drop-shadow(0 0 12px rgba(70,150,255,.28))';

const COL = { top: [30, 62, 122], left: [13, 33, 74], right: [9, 23, 55], gtop: [120, 205, 255], gleft: [50, 120, 200], gright: [34, 90, 160] };
function mkBox(parent, { x, y, w, d, z0, top = COL.top, left = COL.left, right = COL.right, sw = 1.4 }) {
  const g = sv('g', {}, parent);
  const fL = sv('polygon', {}, g), fR = sv('polygon', {}, g), fT = sv('polygon', {}, g);
  for (const f of [fL, fR, fT]) { f.setAttribute('stroke', EDGE); f.setAttribute('stroke-width', sw); f.setAttribute('stroke-linejoin', 'round'); }
  const set = (hgt, o = 1, glow = 0) => {
    if (hgt <= 0.002 || o <= 0.002) { g.style.display = 'none'; return; }
    g.style.display = ''; g.style.opacity = o;
    const zt = z0 + hgt;
    fT.setAttribute('points', pts([P(x, y, zt), P(x + w, y, zt), P(x + w, y + d, zt), P(x, y + d, zt)]));
    fL.setAttribute('points', pts([P(x, y + d, z0), P(x + w, y + d, z0), P(x + w, y + d, zt), P(x, y + d, zt)]));
    fR.setAttribute('points', pts([P(x + w, y, z0), P(x + w, y + d, z0), P(x + w, y + d, zt), P(x + w, y, zt)]));
    fT.setAttribute('fill', rgb(mixc(top, COL.gtop, glow)));
    fL.setAttribute('fill', rgb(mixc(left, COL.gleft, glow)));
    fR.setAttribute('fill', rgb(mixc(right, COL.gright, glow)));
  };
  return { g, set, key: x + w / 2 + y + d / 2 };
}

// platform tiers
const T0 = mkBox(iso, { x: -4, y: -4, w: 8, d: 8, z0: 0, top: [14, 30, 66], left: [9, 20, 46], right: [6, 15, 36] });
const T1 = mkBox(iso, { x: -3.2, y: -3.2, w: 6.4, d: 6.4, z0: 0.28, top: [18, 40, 86], left: [10, 25, 58], right: [7, 18, 44] });
const ZB = 0.48; // ground height for buildings

// outline of the plate (draws first)
const outline = sv('polyline', { points: pts([P(-4, -4, 0), P(4, -4, 0), P(4, 4, 0), P(-4, 4, 0), P(-4, -4, 0)]), fill: 'none', stroke: CYAN, 'stroke-width': 2.2, pathLength: 1 }, iso);
outline.style.strokeDasharray = '1';

// grid on T1 top
const gridG = sv('g', { stroke: 'rgba(120,190,255,.28)', 'stroke-width': 1 }, iso);
for (let i = -4; i <= 4; i++) {
  const v = i * 0.8;
  const a = P(v, -3.2, ZB), b = P(v, 3.2, ZB), c = P(-3.2, v, ZB), d = P(3.2, v, ZB);
  sv('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1] }, gridG); sv('line', { x1: c[0], y1: c[1], x2: d[0], y2: d[1] }, gridG);
}

// spark + horizon line
const spark = sv('circle', { r: 7, fill: '#bfeaff' }, iso);
const sparkGlow = sv('circle', { r: 40, fill: 'url(#gB)' }, iso);
const horiz = sv('line', { x1: -420, y1: 0, x2: 420, y2: 0, stroke: 'rgba(160,215,255,.6)', 'stroke-width': 1.5 }, iso);

// tower
const TW = [
  { s: 2.0, h: 1.1, a: 4.3, b: 5.1 }, { s: 1.5, h: 0.95, a: 5.0, b: 5.8 }, { s: 1.0, h: 0.8, a: 5.7, b: 6.5 }, { s: 0.4, h: 0.4, a: 6.4, b: 7.0 },
];
let zc = ZB; TW.forEach(L => { L.z0 = zc; zc += L.h; L.box = mkBox(iso, { x: -L.s / 2, y: -L.s / 2, w: L.s, d: L.s, z0: L.z0, top: [34, 72, 140], left: [16, 40, 90], right: [11, 28, 66] }); });
const TOWER_TOP = zc;

// units (7)
const UNITS = [
  ['Sinatif Agency', 'S', 1.1], ['Sinatif Academy', 'A', 0.8], ['Osiris Event', 'O', 1.4], ['Hexolution', 'H', 0.95],
  ['Bedadikit.id', 'B', 1.2], ['Politica Intelligence Lab', 'P', 0.7], ['Fama Public Affairs', 'F', 1.0],
].map(([name, ini, hgt], i) => {
  const ang = -Math.PI / 2 + (i * 2 * Math.PI) / 7 + 0.12;
  const x = 2.55 * Math.cos(ang), y = 2.55 * Math.sin(ang), t0 = 8.6 + i * 0.75;
  return { name, ini, hgt, x, y, t0, box: mkBox(iso, { x: x - 0.45, y: y - 0.45, w: 0.9, d: 0.9, z0: ZB }) };
});

// connection lines (ground) + ring
const sysG = sv('g', {}, iso);
const lines = UNITS.map(u => {
  const a = P(u.x, u.y, ZB), b = P(0, 0, ZB);
  const p = sv('path', { d: `M${a[0]},${a[1]} L${b[0]},${b[1]}`, fill: 'none', stroke: CYAN, 'stroke-width': 2, pathLength: 1, 'stroke-opacity': 0.8 }, sysG);
  p.style.strokeDasharray = '1';
  return p;
});
const ringPts = []; for (let i = 0; i <= 64; i++) { const a = (i / 64) * Math.PI * 2; ringPts.push(P(2.55 * Math.cos(a), 2.55 * Math.sin(a), ZB)); }
const ring = sv('polyline', { points: pts(ringPts), fill: 'none', stroke: CYAN, 'stroke-width': 1.6, 'stroke-opacity': 0.55, pathLength: 1 }, sysG);
ring.style.strokeDasharray = '1';
const pulses = UNITS.map(() => sv('circle', { r: 6, fill: '#e6f7ff' }, sysG));
// make sure ground lines sit under the boxes: reorder
iso.insertBefore(sysG, TW[0].box.g);

// depth sorted boxes
const solids = [...TW.map(L => L.box), ...UNITS.map(u => u.box)].sort((a, b) => a.key - b.key);
// units must paint before the tower when behind it; sort by key but the tower layers keep stacking order
const towerKeys = TW.map(L => L.box.g);
const ordered = [...UNITS.map(u => u.box)].filter(b => b.key < 0).concat(TW.map(L => L.box)).concat(UNITS.map(u => u.box).filter(b => b.key >= 0));
ordered.sort((a, b) => (towerKeys.includes(a.g) && towerKeys.includes(b.g) ? 0 : a.key - b.key));
ordered.forEach(b => iso.appendChild(b.g));

// globe + beams
const GR = 108, GY = P(0, 0, TOWER_TOP)[1] - 150;
const globe = sv('g', { transform: `translate(0,${GY})` }, iso);
const gCore = sv('circle', { r: GR * 1.5, fill: 'url(#gB)' }, globe);
const gOut = sv('circle', { r: GR, fill: 'rgba(20,60,130,.18)', stroke: CYAN, 'stroke-width': 2 }, globe);
const lats = [-60, -30, 0, 30, 60].map(d => sv('ellipse', { fill: 'none', stroke: 'rgba(127,214,255,.55)', 'stroke-width': 1.3 }, globe));
const lons = [0, 1, 2, 3, 4, 5].map(() => sv('ellipse', { fill: 'none', stroke: 'rgba(127,214,255,.55)', 'stroke-width': 1.3, ry: GR }, globe));
const orbit = sv('ellipse', { rx: GR * 1.55, ry: GR * 0.42, fill: 'none', stroke: AMBER, 'stroke-width': 2, 'stroke-opacity': 0.9, pathLength: 1 }, globe);
orbit.style.strokeDasharray = '1'; orbit.setAttribute('transform', 'rotate(-18)');
const sat = sv('circle', { r: 8, fill: AMBER }, globe);
const beamG = sv('g', {}, iso);
const beams = UNITS.map(u => {
  const t = P(u.x, u.y, ZB + u.hgt);
  const p = sv('path', { d: `M0,${GY} L${t[0]},${t[1]}`, fill: 'none', stroke: AMBER, 'stroke-width': 1.8, 'stroke-opacity': 0.75, pathLength: 1 }, beamG);
  p.style.strokeDasharray = '1';
  return { p, dot: sv('circle', { r: 5.5, fill: '#fff4de' }, beamG), t };
});

// ---------------------------------------------------------------- overlay (screen space)
const ov = sv('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, stage);
const camS = { s: 1, ox: 0, oy: 0 };
const toScr = (px, py) => [CX + camS.ox + camS.s * px, CY + camS.oy + camS.s * py];

// HUD
const hud = div('abs', stage, '', 'left:0;top:0;width:1080px;height:1920px');
const brk = (x, y, sx, sy) => sv('path', { d: `M${x},${y + sy * 38} L${x},${y} L${x + sx * 38},${y}`, fill: 'none', stroke: 'rgba(170,205,255,.55)', 'stroke-width': 2 }, ov);
brk(48, 60, 1, 1); brk(1032, 60, -1, 1); brk(48, 1860, 1, -1); brk(1032, 1860, -1, -1);
const hudL = div('abs hud', hud, 'PT SKD <span style="opacity:.55">· Holding</span>', 'left:72px;top:92px');
const hudR = div('abs hud', hud, '', 'right:72px;top:92px;text-align:right;font-variant-numeric:tabular-nums');
const bar = sv('rect', { x: 760, y: 142, width: 248, height: 3, rx: 1.5, fill: 'rgba(170,205,255,.22)' }, ov);
const barF = sv('rect', { x: 760, y: 142, width: 0, height: 3, rx: 1.5, fill: CYAN }, ov);

// kinetic text
function words(parent, html, { x, y, w, size = 64, weight = 800, lh = 1.08, align = 'left' }) {
  const box = div('abs', parent, '', `left:${x}px;top:${y}px;width:${w}px;font-size:${size}px;font-weight:${weight};line-height:${lh};letter-spacing:-.02em;text-align:${align}`);
  const spans = [];
  html.split(/(\*[^*]+\*[.,!?]?)|\s+/).filter(Boolean).forEach(tok => {
    const it = tok.startsWith('*');
    const m = it ? tok.match(/^\*([^*]+)\*(.*)$/) : null;
    const s = div('w' + (it ? ' it' : ''), box, (it ? m[1] : tok), it ? `font-size:${size * 1.12}px` : '');
    if (it && m[2]) { const pn = div('w', box, m[2]); pn.style.marginRight = (size * 0.24) + 'px'; pn.style.marginLeft = (-size * 0.2) + 'px'; spans.push(pn); s.style.marginRight = '0px'; spans.push(s); spans.splice(spans.length - 2, 2, s, pn); return; }
    s.style.marginRight = (size * 0.24) + 'px';
    spans.push(s);
  });
  return {
    box,
    update(t, tin, tout, dy = 34) {
      let any = 0;
      spans.forEach((s, i) => {
        const k = ph(t, tin + i * 0.06, 0.75), x = E.inCubic(prog(t, tout + i * 0.02, 0.4));
        const o = k * (1 - x); any = Math.max(any, o);
        s.style.opacity = o.toFixed(3);
        s.style.transform = `translateY(${(dy * (1 - k) - 18 * x).toFixed(1)}px)`;
      });
      box.style.visibility = any > 0.002 ? 'visible' : 'hidden';
    },
  };
}
const SUB = [
  { a: 0.6, b: 3.7, w: words(hud, 'Dari *Ambon*, anak ketiga dari tujuh.', { x: 72, y: 1440, w: 936 }) },
  { a: 4.3, b: 7.5, w: words(hud, '2021, merantau ke *Jakarta*.', { x: 72, y: 1440, w: 936 }) },
  { a: 8.3, b: 14.6, w: words(hud, 'Tujuh unit bisnis. *Satu* holding.', { x: 72, y: 1470, w: 936 }) },
  { a: 15.3, b: 20.6, w: words(hud, 'Bangun *sistem*, bukan bergantung ke satu orang.', { x: 72, y: 1440, w: 936 }) },
  { a: 21.3, b: 25.6, w: words(hud, 'AI buat gantiin yang nggak *reliable*.', { x: 72, y: 1440, w: 936 }) },
];
// final
const F1 = words(hud, 'Shipped,', { x: 0, y: 760, w: 1080, size: 170, align: 'center', lh: 1 });
const F2 = words(hud, '*bukan perfect.*', { x: 0, y: 940, w: 1080, size: 112, align: 'center', lh: 1 });
const badge = div('abs', hud, '<div style="font-weight:800;font-size:40px;letter-spacing:-.01em">Jundy Aljihad</div><div class="hud" style="margin-top:10px">COO · PT Sinar Kreatif Digitalia</div>', 'left:0;top:1230px;width:1080px;text-align:center');
const badgeLine = sv('line', { x1: 440, y1: 1205, x2: 640, y2: 1205, stroke: AMBER, 'stroke-width': 2.5, pathLength: 1 }, ov);
badgeLine.style.strokeDasharray = '1';

// unit pills (logo = placeholder initial)
const pills = UNITS.map((u, i) => {
  const col = i % 2, row = Math.floor(i / 2);
  return { u, el: div('pill', hud, `<i>${u.ini}</i><span>${u.name}</span>`, `left:${72 + col * 480}px;top:${1160 + row * 60}px`) };
});

// callouts
function callout({ az, ax = 0, ay = 0, dx, dy, tag, l1, l2, tin, tout, right = false, cw = 420 }) {
  const ln = sv('polyline', { fill: 'none', stroke: CYAN, 'stroke-width': 1.6, pathLength: 1 }, ov); ln.style.strokeDasharray = '1';
  const dot = sv('circle', { r: 5, fill: CYAN }, ov);
  const el = div('abs', hud, `<div class="hud" style="color:${CYAN}">${tag}</div><div style="font-weight:800;font-size:38px;letter-spacing:-.02em;margin-top:4px">${l1}</div><div class="hud" style="margin-top:6px">${l2}</div>`, `width:${cw}px;text-align:${right ? 'right' : 'left'}`);
  return t => {
    const k = ph(t, tin, 0.9), o = k * (1 - E.inCubic(prog(t, tout, 0.45)));
    const a = toScr(...P(ax, ay, az));
    const mid = [a[0] + dx * 0.45, a[1] + dy], end = [a[0] + dx, a[1] + dy];
    ln.setAttribute('points', pts([a, mid, end]));
    ln.style.strokeDashoffset = (1 - k).toFixed(3); ln.style.opacity = o;
    dot.setAttribute('cx', a[0]); dot.setAttribute('cy', a[1]); dot.style.opacity = o;
    el.style.left = (right ? end[0] - cw - 14 : end[0] + 14) + 'px'; el.style.top = (end[1] - 54) + 'px';
    el.style.opacity = ph(t, tin + 0.35, 0.6) * (1 - E.inCubic(prog(t, tout, 0.45)));
  };
}
const coAmbon = callout({ az: ZB, ax: -1.6, ay: 1.0, dx: -230, dy: -170, tag: '01 · Lahir', l1: 'Ambon', l2: 'Maluku', tin: 1.4, tout: 3.9 });
const coJkt = callout({ az: TW[1].z0 + TW[1].h, ax: 0, ay: 0, dx: 270, dy: -90, tag: '02 · Merantau', l1: '2021', l2: 'Jakarta · S1', tin: 5.6, tout: 7.9 });
const coAI = callout({ az: TOWER_TOP + 0.3, ax: 0, ay: 0, dx: 190, dy: -250, tag: '04 · Sistem', l1: 'AI', l2: 'gantiin yang nggak reliable', tin: 22.4, tout: 25.7, cw: 270 });

// siblings: 7 figures, #3 highlighted
const figG = sv('g', {}, ov);
const figs = [0.86, 0.94, 1.12, 0.82, 0.9, 0.78, 0.7].map((sc, i) => {
  const g = sv('g', {}, figG), hi = i === 2, col = hi ? AMBER : 'rgba(150,200,255,.75)';
  sv('circle', { cx: 0, cy: -52, r: 13, fill: col }, g);
  sv('path', { d: 'M-17,0 L-17,-22 Q-17,-34 0,-34 Q17,-34 17,-22 L17,0 Z', fill: col }, g);
  return { g, sc, hi, x: 540 - 3 * 92 + i * 92 };
});
const figLabel = div('abs hud', hud, '<span style="color:' + AMBER + '">Anak ke-3</span> dari 7 bersaudara', 'left:0;top:455px;width:1080px;text-align:center');

// unit chips (placeholder logo above each module)
const chips = UNITS.map(u => {
  const g = sv('g', {}, ov);
  sv('circle', { r: 21, fill: 'rgba(12,32,72,.92)', stroke: CYAN, 'stroke-width': 1.8 }, g);
  const tx = sv('text', { 'text-anchor': 'middle', y: 7, fill: CYAN, 'font-family': 'Sans', 'font-weight': 800, 'font-size': 19 }, g); tx.textContent = u.ini;
  return g;
});

// ---------------------------------------------------------------- cues
cue(0.3, 'soft', 0.9); [2.0, 2.25, 2.5, 2.75, 3.0, 3.25, 3.5].forEach((t, i) => cue(t, 'tick', 0.9 + (i === 2 ? 0.5 : 0)));
cue(2.9, 'pop', 1.5); cue(0.9, 'tick'); cue(1.5, 'swoosh', 0.8);
cue(4.1, 'whoosh', 1); cue(4.5, 'pop'); cue(5.3, 'pop'); cue(6.1, 'pop'); cue(6.8, 'pop', 1.2); cue(7.8, 'swoosh', 0.9);
UNITS.forEach(u => cue(u.t0 + 0.2, 'pop', 1.05));
cue(14.9, 'whoosh', 1); [15.6, 16.1, 16.6, 17.1, 17.6, 18.1, 18.6].forEach(t => cue(t, 'tick', 0.9)); cue(19.6, 'soft', 1);
cue(20.9, 'whoosh', 1.1); cue(21.5, 'pop', 1.4); cue(22.4, 'swoosh', 0.8); [22.8, 23.2, 23.6, 24.0, 24.4, 24.8, 25.2].forEach(t => cue(t, 'tick', 0.8));
cue(25.8, 'whoosh', 1.4); cue(26.5, 'pop', 1.6); cue(27.6, 'pop', 1.3); cue(28.5, 'soft', 1);

// ---------------------------------------------------------------- update
const pad2 = n => String(Math.floor(n)).padStart(2, '0');
function update(t) {
  // background drift
  glowA.setAttribute('cx', 300 + Math.sin(t * 0.35) * 90); glowA.setAttribute('cy', 700 + Math.cos(t * 0.3) * 80);
  glowB.setAttribute('cx', 820 + Math.cos(t * 0.28) * 70); glowB.setAttribute('cy', 1250 + Math.sin(t * 0.33) * 70);

  // camera
  const zi = E.inOutCubic(prog(t, 0, 8)), zo = E.inOutCubic(prog(t, 25.8, 1.4));
  camS.s = lerp(1.2, 1, zi) * lerp(1, 0.8, zo);
  camS.ox = 0; camS.oy = lerp(30, 0, zi) + lerp(0, -170, zo);
  cam.setAttribute('transform', `translate(${CX + camS.ox},${CY + camS.oy}) scale(${camS.s})`);
  const dim = ph(t, 25.9, 1.0, E.inOutCubic);
  scene.style.opacity = (1 - 0.74 * dim).toFixed(3);
  scene.style.filter = dim > 0.01 ? `blur(${(2.5 * dim).toFixed(2)}px)` : 'none';
  iso.style.opacity = 1;

  // spark -> plate
  const sp = ph(t, 0, 0.5) * (1 - ph(t, 1.2, 0.8, E.inCubic));
  spark.setAttribute('r', (7 * sp).toFixed(2)); sparkGlow.style.opacity = sp;
  horiz.style.opacity = (ph(t, 0.2, 0.7) * (1 - ph(t, 1.0, 0.7, E.inCubic)) * 0.9).toFixed(3);
  horiz.setAttribute('x1', -420 * ph(t, 0.2, 0.9)); horiz.setAttribute('x2', 420 * ph(t, 0.2, 0.9));
  outline.style.strokeDashoffset = (1 - ph(t, 0.7, 1.5, E.inOutCubic)).toFixed(3);
  outline.style.opacity = 1 - ph(t, 2.6, 0.8);
  T0.set(0.28 * ph(t, 1.7, 0.9), 1); T1.set(0.2 * ph(t, 2.1, 0.9), 1);
  gridG.style.opacity = (ph(t, 2.4, 1.0) * (1 - 0.0)).toFixed(3);

  // tower
  TW.forEach((L, i) => { const k = ph(t, L.a, L.b - L.a, E.outCubic); L.box.set(L.h * k, 1, i === 3 ? ph(t, 6.8, 0.4) * 0.9 : 0.0 + (t > 21.4 && t < 25.8 ? 0.18 * Math.sin(t * 5) + 0.18 : 0)); });

  // units
  UNITS.forEach((u, i) => {
    const k = ph(t, u.t0, 0.85, E.outBack), act = Math.exp(-Math.pow((t - (u.t0 + 0.5)) / 0.55, 2));
    let g = act * 0.85;
    // AI beams pulse sequentially
    if (t > 22.6 && t < 25.8) g = Math.max(g, 0.7 * Math.exp(-Math.pow(((t - 22.8 - i * 0.4) % 2.9) / 0.35, 2)));
    u.box.set(u.hgt * k, 1, g);
    const top = toScr(...P(u.x, u.y, ZB + u.hgt * k));
    const co = ph(t, u.t0 + 0.35, 0.6) * (1 - ph(t, 25.8, 0.5, E.inCubic));
    chips[i].setAttribute('transform', `translate(${top[0].toFixed(1)},${(top[1] - 42 * camS.s - (1 - co) * 14).toFixed(1)}) scale(${(0.9 + 0.1 * co).toFixed(3)})`);
    chips[i].style.opacity = co;
  });

  // pills
  pills.forEach((p, i) => {
    const k = ph(t, p.u.t0 + 0.1, 0.8), x = E.inCubic(prog(t, 14.6 + i * 0.05, 0.5));
    p.el.style.opacity = (k * (1 - x)).toFixed(3);
    p.el.style.transform = `translateX(${(-40 * (1 - k) - 30 * x).toFixed(1)}px)`;
    const act = Math.exp(-Math.pow((t - (p.u.t0 + 0.5)) / 0.6, 2));
    p.el.style.borderColor = act > 0.2 ? '#bfeaff' : 'rgba(120,190,255,.45)';
    p.el.style.boxShadow = act > 0.05 ? `0 0 ${24 * act}px rgba(110,190,255,${0.55 * act})` : 'none';
  });

  // system lines / ring / pulses
  const sk = ph(t, 15.2, 1.6, E.inOutCubic), sOut = ph(t, 25.8, 0.8, E.inCubic);
  sysG.style.opacity = ((t > 15.1 ? 1 : 0) * (1 - 0.5 * sOut)).toFixed(3);
  lines.forEach((p, i) => { p.style.strokeDashoffset = (1 - clamp(sk * 1.35 - i * 0.05)).toFixed(3); });
  ring.style.strokeDashoffset = (1 - ph(t, 16.4, 1.8, E.inOutCubic)).toFixed(3);
  UNITS.forEach((u, i) => {
    const a = P(u.x, u.y, ZB), b = P(0, 0, ZB);
    const live = ph(t, 17.4, 0.6) * (t < 25.9 ? 1 : 0);
    const f = ((t * 0.55 + i * 0.137) % 1);
    pulses[i].setAttribute('cx', lerp(b[0], a[0], f)); pulses[i].setAttribute('cy', lerp(b[1], a[1], f));
    pulses[i].style.opacity = live * Math.sin(f * Math.PI);
  });

  // globe
  const gk = ph(t, 21.3, 1.1, E.outBack), gOutK = 1 - ph(t, 25.8, 0.6, E.inCubic);
  globe.style.opacity = gk * gOutK;
  globe.setAttribute('transform', `translate(0,${GY + (1 - gk) * 90}) scale(${(0.4 + 0.6 * gk).toFixed(3)})`);
  lats.forEach((e, i) => { const d = [-60, -30, 0, 30, 60][i] * Math.PI / 180, rx = GR * Math.cos(d); e.setAttribute('rx', rx.toFixed(2)); e.setAttribute('ry', (rx * 0.26).toFixed(2)); e.setAttribute('cy', (GR * Math.sin(d)).toFixed(2)); });
  lons.forEach((e, i) => { const a = (i / 6) * Math.PI + t * 0.6; e.setAttribute('rx', (GR * Math.abs(Math.cos(a))).toFixed(2)); });
  orbit.style.strokeDashoffset = (1 - ph(t, 22.0, 1.2, E.inOutCubic)).toFixed(3);
  const sa = t * 1.5; sat.setAttribute('cx', (GR * 1.55 * Math.cos(sa) * Math.cos(-18 * Math.PI / 180) - GR * 0.42 * Math.sin(sa) * Math.sin(-18 * Math.PI / 180)).toFixed(2));
  sat.setAttribute('cy', (GR * 1.55 * Math.cos(sa) * Math.sin(-18 * Math.PI / 180) + GR * 0.42 * Math.sin(sa) * Math.cos(-18 * Math.PI / 180)).toFixed(2));
  sat.style.opacity = ph(t, 22.6, 0.4);
  beams.forEach((b, i) => {
    const k = ph(t, 22.5 + i * 0.12, 0.9, E.inOutCubic), o = (1 - ph(t, 25.8, 0.5, E.inCubic));
    b.p.style.strokeDashoffset = (1 - k).toFixed(3); b.p.style.opacity = o;
    const f = ((t * 0.7 + i * 0.19) % 1);
    b.dot.setAttribute('cx', lerp(0, b.t[0], f)); b.dot.setAttribute('cy', lerp(GY, b.t[1], f)); b.dot.style.opacity = k > 0.99 ? Math.sin(f * Math.PI) * o : 0;
  });

  // siblings
  const fo = win(t, 2.0, 4.1);
  figs.forEach((f, i) => {
    const k = ph(t, 2.0 + i * 0.25, 0.7, E.outBack) * (1 - E.inCubic(prog(t, 4.0 + i * 0.03, 0.4)));
    const y = 420 + (1 - k) * 30;
    f.g.setAttribute('transform', `translate(${f.x},${y.toFixed(1)}) scale(${(f.sc * (f.hi ? 1.18 : 1) * k).toFixed(3)})`);
    f.g.style.opacity = k;
  });
  figLabel.style.opacity = (ph(t, 3.3, 0.7) * (1 - E.inCubic(prog(t, 4.0, 0.4)))).toFixed(3);

  // callouts
  coAmbon(t); coJkt(t); coAI(t);

  // text
  SUB.forEach(s => s.w.update(t, s.a, s.b));
  F1.update(t, 26.6, 99, 60); F2.update(t, 27.5, 99, 50);
  badge.style.opacity = ph(t, 28.5, 0.8).toFixed(3); badge.style.transform = `translateY(${(24 * (1 - ph(t, 28.5, 0.8))).toFixed(1)}px)`;
  badgeLine.style.strokeDashoffset = (1 - ph(t, 28.2, 0.8)).toFixed(3);

  // HUD
  const pct = Math.round(clamp(t / 29.2) * 100);
  hudR.innerHTML = `T+00:${pad2(t)} <span style="opacity:.55">· Build ${String(pct).padStart(3, '0')}%</span>`;
  barF.setAttribute('width', (248 * clamp(t / 29.2)).toFixed(1));
}

window.__duration = DUR; window.__fps = 30; window.__cues = cues; window.__beats = [];
window.__ready = (async () => {
  await Promise.all([
    document.fonts.load('800 40px Sans'), document.fonts.load('600 20px Sans'), document.fonts.load('500 20px Sans'), document.fonts.load('italic 400 40px Serif'),
  ]);
  await document.fonts.ready;
  update(0);
})();
window.seek = t => { update(t); };
