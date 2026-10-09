import { E, prog, clamp, lerp, enter } from '/rt/engine.js';

let __res; window.__ready = new Promise(r => { __res = r; });
const W = 1920, H = 1080, M = 120, DUR = 131;
window.__duration = DUR; window.__fps = 30; window.__beats = [];
const NS = 'http://www.w3.org/2000/svg';
const TEAL = '#3FB6C4', AMBER = '#E0A100', GREEN = '#16B67A', CORAL = '#F2603F', BLUE = '#2F6BF0', NAVY = '#0A1E36', SURF = '#12355B';
const stage = document.getElementById('stage');
const sv = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
const div = (cls, parent, html, style) => { const e = document.createElement('div'); e.className = cls; if (html != null) e.innerHTML = html; if (style) e.style.cssText = style; (parent || stage).appendChild(e); return e; };
const ph = (t, a, d, e = E.outExpo) => e(prog(t, a, d));
const OUTD = 0.45;
const fade = (t, out) => 1 - E.inCubic(prog(t, out, OUTD));
const cues = []; const cue = (t, type, gain = 1) => cues.push({ t, type, gain });
const pad2 = n => String(Math.floor(n)).padStart(2, '0');

await Promise.all([500, 600, 800].map(w => document.fonts.load(`${w} 40px Sans`)).concat([document.fonts.load('italic 400 40px Serif')]));
await document.fonts.ready;

// ------------------------------------------------------------ text
function kin(parent, text, { x, y, w, size = 100, weight = 800, color = '#fff', lh = 1.04, align = 'left', mid = true, acc = {} }) {
  const A = { star: TEAL, under: AMBER, tilde: color, ...acc };
  const box = div('abs', parent, '', `left:${x}px;top:${y}px;width:${w}px;font-size:${size}px;font-weight:${weight};line-height:${lh};letter-spacing:-.02em;text-align:${align};color:${color};${mid ? 'transform:translateY(-50%)' : ''}`);
  const spans = [];
  text.split('\n').forEach(line => {
    const row = div('', box, '');
    line.split(/(\*[^*]+\*[.,!?:;]?|_[^_]+_[.,!?:;]?|~[^~]+~[.,!?:;]?)|\s+/).filter(Boolean).forEach(tok => {
      const mk = '*_~'.includes(tok[0]) && tok.length > 2 ? tok[0] : null;
      let html = tok, st = '';
      if (mk) { const m = tok.match(/^.(.+?)\1([.,!?:;]?)$/) || [null, tok.slice(1, -1), '']; html = m[1] + m[2]; st = mk === '~' ? `font-family:Serif;font-style:italic;font-weight:400;font-size:${size * 1.1}px;letter-spacing:-.01em;color:${A.tilde}` : `color:${mk === '*' ? A.star : A.under}`; }
      const s = div('w', row, html, st); s.style.marginRight = (size * 0.24) + 'px'; spans.push(s);
    });
  });
  return {
    box, update(t, a, out, dy = 40) {
      let any = 0;
      spans.forEach((s, i) => {
        const k = ph(t, a + i * 0.07, 0.8), x = E.inCubic(prog(t, out, 0.45)), o = k * (1 - x); any = Math.max(any, o);
        s.style.opacity = o.toFixed(3); s.style.transform = `translateY(${(dy * (1 - k) - 26 * x).toFixed(1)}px)`;
      });
      box.style.visibility = any > 0.002 ? 'visible' : 'hidden';
    },
  };
}
const place = (el, t, a, out, o = {}) => enter(el, t, a, out, o);
const IC = {
  users: '<circle cx="9" cy="8" r="3.2"/><circle cx="17" cy="9" r="2.6"/><path d="M3 20c0-3.6 2.7-6 6-6s6 2.4 6 6M15 14.6c3 0 6 1.6 6 5.4"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  building: '<path d="M4 21V8l8-5 8 5v13M9 21v-6h6v6M8 11h2M14 11h2"/>', shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5L16 9.5"/>',
  pulse: '<path d="M3 12h4l2-6 4 12 2-6h6"/>',
};
const icon = (n, s, c = '#fff', sw = 1.8) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" style="position:static">${IC[n]}</svg>`;
const brackets = (parent, col, inset = 48, len = 44, sw = 2) => {
  const s = sv('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, parent);
  [[inset, inset, 1, 1], [W - inset, inset, -1, 1], [inset, H - inset, 1, -1], [W - inset, H - inset, -1, -1]].forEach(([x, y, sx, sy]) => sv('path', { d: `M${x},${y + sy * len} L${x},${y} L${x + sx * len},${y}`, fill: 'none', stroke: col, 'stroke-width': sw }, s));
  return s;
};
const hudLabel = (parent, html, style, col) => div('abs', parent, html, `font-size:20px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:${col};${style}`);

// media (image or deterministic video)
const videos = [];
function media(parent, src, w, h) {
  const inner = div('abs', parent, '', `left:0;top:0;width:${w}px;height:${h}px;transform-origin:50% 50%`);
  let vid = null;
  if (/\.(mp4|mov|webm)$/i.test(src)) { vid = document.createElement('video'); vid.src = '/p/' + src; vid.muted = true; vid.preload = 'auto'; vid.playsInline = true; vid.style.cssText = `position:absolute;left:0;top:0;width:${w}px;height:${h}px;object-fit:cover`; inner.appendChild(vid); }
  else inner.style.cssText += `;background:url(/p/${src}) center/cover no-repeat`;
  return { inner, vid };
}

// ------------------------------------------------------------ isometric kit
const C30 = 0.866;
const lerpc = (c1, c2, k) => c1.map((v, i) => Math.round(lerp(v, c2[i], k)));
const rgb = c => `rgb(${c[0]},${c[1]},${c[2]})`;
function isoKit(parent, U) {
  const P = (x, y, z = 0) => [(x - y) * C30 * U, (x + y) * 0.5 * U - z * U];
  const pts = a => a.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  function box(g, { x, y, w, d, z0, top, left, right, edge, gtop = [255, 255, 255], gleft = gtop, gright = gtop, sw = 1.4 }) {
    const gg = sv('g', {}, g), fL = sv('polygon', {}, gg), fR = sv('polygon', {}, gg), fT = sv('polygon', {}, gg);
    for (const f of [fL, fR, fT]) { f.setAttribute('stroke', edge); f.setAttribute('stroke-width', sw); f.setAttribute('stroke-linejoin', 'round'); }
    return {
      g: gg, key: x + w / 2 + y + d / 2,
      set(hgt, glow = 0, o = 1) {
        if (hgt <= 0.002 || o <= 0.002) { gg.style.display = 'none'; return; }
        gg.style.display = ''; gg.style.opacity = o; const zt = z0 + hgt;
        fT.setAttribute('points', pts([P(x, y, zt), P(x + w, y, zt), P(x + w, y + d, zt), P(x, y + d, zt)]));
        fL.setAttribute('points', pts([P(x, y + d, z0), P(x + w, y + d, z0), P(x + w, y + d, zt), P(x, y + d, zt)]));
        fR.setAttribute('points', pts([P(x + w, y, z0), P(x + w, y + d, z0), P(x + w, y + d, zt), P(x + w, y, zt)]));
        fT.setAttribute('fill', rgb(lerpc(top, gtop, glow))); fL.setAttribute('fill', rgb(lerpc(left, gleft, glow))); fR.setAttribute('fill', rgb(lerpc(right, gright, glow)));
      },
    };
  }
  return { P, pts, box };
}
const PAL_L = { slab0: [[232, 239, 252], [196, 209, 238], [172, 188, 224]], slab1: [[246, 249, 255], [208, 220, 244], [184, 199, 232]], tw: [[44, 66, 130], [26, 44, 100], [19, 33, 78]], sat: [[255, 255, 255], [214, 225, 246], [190, 204, 236]], edge: 'rgba(86,110,188,.6)', glow: [[120, 205, 255], [70, 140, 220], [50, 110, 190]] };
function makeCity(root, cx, cy, U, pal) {
  const svg = sv('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, root);
  const cam = sv('g', {}, svg), g = sv('g', {}, cam), K = isoKit(g, U), ZB = 0.5;
  g.style.filter = 'drop-shadow(0 18px 24px rgba(40,70,140,.18))';
  const mk = (o, c) => K.box(g, { ...o, top: c[0], left: c[1], right: c[2], edge: pal.edge, gtop: pal.glow[0], gleft: pal.glow[1], gright: pal.glow[2] });
  const s0 = mk({ x: -4, y: -4, w: 8, d: 8, z0: 0 }, pal.slab0), s1 = mk({ x: -3.2, y: -3.2, w: 6.4, d: 6.4, z0: 0.3 }, pal.slab1);
  const outline = sv('polyline', { points: K.pts([K.P(-4, -4), K.P(4, -4), K.P(4, 4), K.P(-4, 4), K.P(-4, -4)]), fill: 'none', stroke: '#5b7be0', 'stroke-width': 2.4, pathLength: 1 }, g); outline.style.strokeDasharray = '1';
  const grid = sv('g', { stroke: 'rgba(86,110,188,.25)', 'stroke-width': 1 }, g);
  for (let i = -4; i <= 4; i++) { const v = i * 0.8, a = K.P(v, -3.2, ZB), b = K.P(v, 3.2, ZB), c = K.P(-3.2, v, ZB), d = K.P(3.2, v, ZB); sv('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1] }, grid); sv('line', { x1: c[0], y1: c[1], x2: d[0], y2: d[1] }, grid); }
  const TW = [[2.0, 1.1], [1.5, 0.95], [1.0, 0.8], [0.4, 0.45]]; let z = ZB;
  const tower = TW.map(([s, h]) => { const b = mk({ x: -s / 2, y: -s / 2, w: s, d: s, z0: z }, pal.tw); b.h = h; z += h; return b; });
  const top = z;
  const HS = [1.1, 0.8, 1.4, 0.9, 1.2, 0.7];
  const sats = HS.map((h, i) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 6 + 0.35, x = 2.5 * Math.cos(a), y = 2.5 * Math.sin(a); const b = mk({ x: x - 0.45, y: y - 0.45, w: 0.9, d: 0.9, z0: ZB }, pal.sat); b.h = h; b.px = x; b.py = y; return b; });
  [...sats.filter(b => b.key < 0), ...tower, ...sats.filter(b => b.key >= 0).sort((a, b) => a.key - b.key)].forEach(b => g.appendChild(b.g));
  return {
    svg, cam, g, P: K.P, top, sats, tower, ZB,
    place(x, y, s) { cam.setAttribute('transform', `translate(${x},${y}) scale(${s})`); this.x = x; this.y = y; this.s = s; },
    scr(px, py, pz) { const p = K.P(px, py, pz); return [this.x + p[0] * this.s, this.y + p[1] * this.s]; },
    set({ slab = 1, tw = [1, 1, 1, 1], st = [1, 1, 1, 1, 1, 1], glow = [], line = 1 }) {
      outline.style.strokeDashoffset = (1 - line).toFixed(3); outline.style.opacity = 1 - clamp((slab - 0.5) * 2);
      s0.set(0.3 * clamp(slab * 1.4)); s1.set(0.2 * clamp(slab * 1.4 - 0.4)); grid.style.opacity = clamp(slab * 1.5 - 0.5).toFixed(3);
      tower.forEach((b, i) => b.set(b.h * tw[i], (glow[10 + i] || 0)));
      sats.forEach((b, i) => b.set(b.h * st[i], glow[i] || 0));
    },
  };
}

// ------------------------------------------------------------ parts + wipes
const parts = [];
const Part = (t0, t1, build) => parts.push({ t0, t1, build });
const WIPES = [[9.2, '#8fb0ff', '#ffffff'], [32.6, '#ffffff', '#0b0b0b'], [55.6, BLUE, '#ffffff'], [80.4, TEAL, '#050b1a'], [95.8, AMBER, '#050b1a'], [119.2, '#8fb0ff', '#ffffff']];

// ============================================================ P1 · HOOK (monochrome HUD)
Part(0, 9.2, (root, p0) => {
  root.style.background = '#060606';
  const gs = sv('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, root);
  for (let x = 0; x <= W; x += 120) sv('line', { x1: x, y1: 0, x2: x, y2: H, stroke: 'rgba(255,255,255,.035)' }, gs);
  for (let y = 0; y <= H; y += 120) sv('line', { x1: 0, y1: y, x2: W, y2: y, stroke: 'rgba(255,255,255,.035)' }, gs);
  brackets(root, 'rgba(255,255,255,.4)');
  const tl = hudLabel(root, 'Pancasila · Dinamika Sejarah Indonesia', `left:${M}px;top:78px`, 'rgba(255,255,255,.55)');
  const tr = hudLabel(root, '', `right:${M}px;top:78px;text-align:right`, 'rgba(255,255,255,.55)');
  const tc = hudLabel(root, '', `left:${M}px;bottom:70px;font-variant-numeric:tabular-nums`, 'rgba(255,255,255,.4)');
  const scan = div('abs', root, '', `left:0;top:0;width:${W}px;height:2px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent)`);
  const rule = div('abs', root, '', `left:${M}px;top:900px;width:260px;height:5px;border-radius:3px;background:${AMBER};transform-origin:0 50%`);
  const B = [[0.3, 3.4, 'Pancasila\n~dihafal.~', 'HOOK · 01'], [3.4, 6.2, 'Ditatar.\n~Jadi syarat.~', 'HOOK · 02'], [6.2, 9.0, 'Dihafal ≠\n~dihayati?~', 'ORDE BARU']].map(([a, b, tx, lab]) => {
    const k = kin(root, tx, { x: M, y: 500, w: 1700, size: 245, lh: 0.98, acc: { tilde: lab === 'ORDE BARU' ? AMBER : 'rgba(255,255,255,.88)' } });
    cue(a + 0.15, 'soft'); cue(a + 0.55, 'pop', 0.9); return { a, b: b - OUTD, k, lab };
  });
  cue(0.1, 'tick', 0.7); cue(9.0, 'whoosh', 0.8);
  return t => {
    scan.style.top = ((t * 160) % H).toFixed(1) + 'px';
    B.forEach(o => { o.k.update(t, o.a + 0.1, o.b); if (t >= o.a && t < o.b + 0.5) tr.textContent = o.lab; });
    rule.style.transform = `scaleX(${(ph(t, 0.9, 1) * (t < 3.4 ? 1 : 0.55 + 0.45 * ph(t, 3.4, 0.6))).toFixed(3)})`;
    tc.textContent = `T+00:${pad2(t)}`;
  };
});

// ============================================================ P2 · KONTEKS (light isometric build)
Part(9.2, 32.6, (root, p0) => {
  root.style.background = 'linear-gradient(160deg,#f6f8fd 0%,#e4ebf8 100%)';
  const dg = sv('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, root);
  for (let x = 60; x < W; x += 60) for (let y = 60; y < H; y += 60) sv('circle', { cx: x, cy: y, r: 1.3, fill: 'rgba(80,105,180,.16)' }, dg);
  const city = makeCity(root, 0, 0, 64, PAL_L); city.place(1340, 640, 1);
  const ink = '#14234a', mu = 'rgba(20,35,74,.55)';
  brackets(root, 'rgba(20,35,74,.25)');
  hudLabel(root, 'Bagian 01 · Orde Baru 1966–1998', `left:${M}px;top:78px`, mu);
  const prog1 = hudLabel(root, '', `right:${M}px;top:78px;text-align:right;font-variant-numeric:tabular-nums`, mu);
  const chips = city.sats.slice(0, 3).map((b, i) => { const g = sv('g', {}, root.querySelector('svg:last-of-type')); return g; });
  // chip layer
  const cs = sv('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, root);
  const chipNames = ['Sekolah', 'Kantor', 'Upacara'];
  const chipEls = chipNames.map(n => { const g = sv('g', {}, cs); sv('rect', { x: -90, y: -26, width: 180, height: 52, rx: 26, fill: '#14234a' }, g); const tx = sv('text', { 'text-anchor': 'middle', y: 9, fill: '#fff', 'font-family': 'Sans', 'font-weight': 800, 'font-size': 26 }, g); tx.textContent = n; return g; });
  // photo cards
  const PW = 720, PH = 470, PX = M, PY = 150;
  const card = (src, tag, cap, a, b, cam) => {
    const f = div('abs', root, '', `left:${PX}px;top:${PY}px;width:${PW}px;height:${PH}px;border-radius:26px;overflow:hidden;background:#fff;box-shadow:0 26px 60px rgba(30,50,110,.28);border:8px solid #fff;box-sizing:border-box`);
    const m = media(f, src, PW - 16, PH - 16); if (m.vid) videos.push({ vid: m.vid, t0: a, dur: b - a, start: 0 });
    const tg = div('abs', root, tag, `left:${PX + 26}px;top:${PY + 26}px;padding:8px 20px;border-radius:999px;background:#14234a;color:#fff;font-size:22px;font-weight:800;letter-spacing:.1em;text-transform:uppercase`);
    const cp = div('abs', root, `${cap}<br><span style="font-size:20px;font-weight:500;opacity:.6">Sumber: (isi arsip/fotografer, lisensi)</span>`, `left:${PX}px;top:${PY + PH + 22}px;width:${PW}px;font-size:28px;font-weight:600;color:${ink};line-height:1.35`);
    cue(a + 0.1, 'swoosh', 0.9);
    return t => { place(f, t, a, b - OUTD, { dx: -70, dy: 0, s0: 0.96 }); place(tg, t, a + 0.5, b - OUTD, { dy: 14 }); place(cp, t, a + 0.7, b - OUTD, { dy: 18 }); const k = E.inOutCubic(prog(t, a, b - a)); m.inner.style.transform = `scale(${lerp(cam[0], cam[1], k).toFixed(4)})`; };
  };
  const c1 = card('assets/ph_F2.png', '1966–1998', 'Presiden Soeharto, era Orde Baru', 11.4, 16.6, [1.02, 1.14]);
  const c2 = card('assets/ph_F3.png', '1 Oktober', 'Hari Kesaktian Pancasila, Monumen Pancasila Sakti', 16.6, 21.9, [1.14, 1.02]);
  const SUB = [[9.5, 11.3, 'Orde Baru, ~1966–1998.~'], [11.6, 16.5, 'Di bawah ~Presiden Soeharto.~'], [16.8, 21.8, '1 Oktober, ~Hari Kesaktian Pancasila.~'], [22.0, 26.0, 'Fondasi ~stabilitas~ dan pembangunan.'], [26.3, 32.3, 'Hadir di sekolah, kantor, ~dan upacara.~']].map(([a, b, tx]) => ({ a, b: b - 0.0, k: kin(root, tx, { x: M, y: 905, w: 1100, size: 66, weight: 800, color: ink, acc: { tilde: '#2f55c8', star: '#2f55c8' } }) }));
  const T = [[11.5, 0], [14.5, 1], [17.2, 2], [21.0, 3]];
  [9.4, 11.4, 14.5, 17.2, 21.0].forEach((t, i) => cue(t + 0.2, i ? 'pop' : 'whoosh', 0.9)); [26.6, 28.4, 30.2].forEach(t => cue(t, 'pop', 1));
  const bp = hudLabel(root, '', `right:${M}px;bottom:70px;text-align:right;font-variant-numeric:tabular-nums`, mu);
  return t => {
    const lt = (t - 9.2) / 23.4;
    const tw = [0, 1, 2, 3].map(i => ph(t, T[i][0], 1.6, E.outCubic));
    const sa = [26.4, 28.2, 30.0].map(a => ph(t, a, 0.8, E.outBack));
    const glow = [];
    sa.forEach((k, i) => { glow[i] = Math.exp(-Math.pow((t - ([26.4, 28.2, 30.0][i] + 0.6)) / 0.5, 2)) * 0.9; });
    city.set({ slab: ph(t, 9.5, 1.8, E.outCubic), line: ph(t, 9.4, 1.6, E.inOutCubic), tw, st: [sa[0], sa[1], sa[2], 0, 0, 0], glow });
    const z = lerp(1.18, 1, E.inOutCubic(prog(t, 9.2, 8))); city.place(1340 + (1 - z) * -40, 640 - (z - 1) * 0, z);
    city.cam.setAttribute('transform', `translate(${1340},${640 + (z - 1) * 120}) scale(${z.toFixed(4)})`); city.x = 1340; city.y = 640 + (z - 1) * 120; city.s = z;
    chipEls.forEach((g, i) => { const b = city.sats[i], [x, y] = city.scr(b.px, b.py, city.ZB + b.h * sa[i] + 0.55), k = sa[i]; g.setAttribute('transform', `translate(${x.toFixed(1)},${(y - (1 - k) * 20).toFixed(1)}) scale(${(0.6 + 0.4 * k).toFixed(3)})`); g.style.opacity = clamp(k * 1.6) * fade(t, 32.1); });
    c1(t); c2(t);
    SUB.forEach(s => s.k.update(t, s.a, s.b - OUTD));
    const pc = Math.round(clamp((t - 9.2) / 22) * 100); bp.innerHTML = `Build progress <span style="color:${ink}">${String(pc).padStart(3, '0')}%</span>`;
    prog1.textContent = `T+00:${pad2(t)}`;
    root.style.opacity = 1;
  };
});

// ============================================================ P3 · MENU + PREVIEW (monochrome editorial)
Part(32.6, 55.6, (root, p0) => {
  root.style.background = '#0b0b0b';
  brackets(root, 'rgba(255,255,255,.35)');
  hudLabel(root, 'Menu · Bagian 02', `left:${M}px;top:78px`, 'rgba(255,255,255,.5)');
  const tr = hudLabel(root, '', `right:${M}px;top:78px;text-align:right`, 'rgba(255,255,255,.5)');
  const title = kin(root, 'Dua langkah\n~besar.~', { x: M, y: 520, w: 1500, size: 200, lh: 0.98, acc: { tilde: 'rgba(255,255,255,.88)' } });
  cue(32.9, 'whoosh', 0.9);
  const items = [
    { a: 35.0, b: 41.5, yr: '1978', t: 'P4 · Ekaprasetya Pancakarsa', s: 'Tap MPR II/MPR/1978', src: 'assets/ph_F4.png', cap: 'Pedoman Penghayatan dan Pengamalan Pancasila' },
    { a: 41.5, b: 47.4, yr: '1979', t: 'BP7 dan penataran', s: 'Keppres 10/1979', src: 'assets/ph_F1.png', cap: 'Penataran Pancasila' },
    { a: 47.4, b: 55.2, yr: '1985', t: 'Asas tunggal', s: 'UU 3 dan UU 8 Tahun 1985', src: 'assets/ph_F7.png', cap: 'Partai politik dan ormas wajib berasas Pancasila' },
  ];
  const menu = items.map((it, i) => {
    const y = 330 + i * 150;
    const row = div('abs', root, `<span style="color:${AMBER};font-weight:800;margin-right:26px">0${i + 1}</span>${it.t}<div style="font-size:24px;font-weight:500;letter-spacing:.04em;margin:8px 0 0 66px;opacity:.7">${it.s}</div>`, `left:${M}px;top:${y}px;width:760px;font-size:44px;font-weight:800;letter-spacing:-.01em;line-height:1.1`);
    const mark = div('abs', root, '', `left:${M - 34}px;top:${y + 8}px;width:6px;height:46px;border-radius:3px;background:${AMBER};transform-origin:50% 0`);
    const PWd = 860, PHt = 560, PXx = 960, PYy = 150;
    const f = div('abs', root, '', `left:${PXx}px;top:${PYy}px;width:${PWd}px;height:${PHt}px;overflow:hidden;background:#161616;border:1.5px solid rgba(255,255,255,.18)`);
    const m = media(f, it.src, PWd, PHt); if (m.vid) videos.push({ vid: m.vid, t0: it.a, dur: it.b - it.a, start: 0 });
    const yr = div('abs', root, it.yr, `left:${PXx + 28}px;top:${PYy + PHt - 150}px;font-size:130px;font-weight:800;letter-spacing:-.04em;color:#fff;text-shadow:0 4px 30px rgba(0,0,0,.6)`);
    const cp = div('abs', root, `${it.cap}<br><span style="font-size:20px;opacity:.5;font-weight:500">Sumber: (isi arsip/fotografer, lisensi)</span>`, `left:${PXx}px;top:${PYy + PHt + 24}px;width:${PWd}px;font-size:28px;font-weight:600;color:rgba(255,255,255,.8);line-height:1.35`);
    cue(it.a + 0.1, 'swoosh', 0.9); cue(it.a + 0.6, 'tick', 1);
    return { it, row, mark, f, m, yr, cp };
  });
  return t => {
    title.update(t, 32.9, 34.7);
    tr.textContent = t > 34.8 ? 'Preview' : '';
    menu.forEach(o => {
      const on = t >= o.it.a && t < o.it.b, vis = prog(t, o.it.a - 0.1, 0.6) * (t < 34.8 ? 0 : 1);
      const enterK = ph(t, 34.9, 0.8) * fade(t, 54.9), act = on ? 1 : 0.34;
      o.row.style.opacity = (enterK * act).toFixed(3); o.row.style.transform = `translateX(${((1 - enterK) * -60).toFixed(1)}px)`;
      o.mark.style.transform = `scaleY(${on ? ph(t, o.it.a, 0.4).toFixed(3) : 0})`;
      const fo = on ? 1 - E.inCubic(prog(t, o.it.b - 0.35, 0.35)) : 0, fi = ph(t, o.it.a, 0.7);
      const k = on ? fi * fo : 0;
      [o.f, o.yr, o.cp].forEach(e => { e.style.opacity = k.toFixed(3); e.style.visibility = k > 0.002 ? 'visible' : 'hidden'; });
      o.f.style.transform = `translateX(${((1 - fi) * 80).toFixed(1)}px)`;
      o.m.inner.style.transform = `scale(${lerp(1.0, 1.12, prog(t, o.it.a, o.it.b - o.it.a)).toFixed(4)})`;
      o.yr.style.transform = `translateY(${((1 - fi) * 30).toFixed(1)}px)`; o.cp.style.transform = `translateY(${((1 - fi) * 20).toFixed(1)}px)`;
    });
  };
});

// ============================================================ P4 · COLOR SLIDES (flat colour + circle icon + chips)
Part(55.6, 80.4, (root, p0) => {
  const slides = [
    { a: 55.6, b: 58.4, bg: BLUE, ic: 'pulse', title: 'Dinamika', sub: 'Penerapan dan tantangan', chips: [], dark: false },
    { a: 58.4, b: 64.2, bg: GREEN, ic: 'check', title: 'Penerapan', sub: 'Bahasa bersama di negara yang beragam', chips: ['Sekolah', 'Kantor', 'Upacara'], dark: false },
    { a: 64.2, b: 74.4, bg: CORAL, ic: 'x', title: 'Tantangan', sub: '', chips: ['Tafsir resmi datang dari negara', 'Penataran dinilai doktrinatif dan mahal', 'Ruang beda pendapat menyempit'], dark: false, stag: [65.4, 68.2, 71.0] },
    { a: 74.4, b: 80.4, bg: '#f7f5ef', ic: null, title: '', sub: '', chips: [], dark: true },
  ];
  const CXs = 430, CYs = 540;
  const layers = slides.map((s, i) => {
    const L = div('abs', root, '', `left:0;top:0;width:${W}px;height:${H}px;background:${s.bg}`);
    const ink = s.dark ? '#111' : '#fff';
    hudLabel(L, `Dinamika · ${i + 1}/4`, `left:${M}px;top:78px`, s.dark ? 'rgba(0,0,0,.45)' : 'rgba(255,255,255,.75)');
    let circ = null, tt = null, sb = null, ch = [];
    if (s.ic) {
      circ = div('abs', L, icon(s.ic, 230, '#fff', 1.6), `left:${CXs - 250}px;top:${CYs - 250}px;width:500px;height:500px;border-radius:50%;background:rgba(255,255,255,.2);border:3px solid rgba(255,255,255,.45);display:flex;align-items:center;justify-content:center;box-sizing:border-box`);
      tt = kin(L, s.title, { x: 840, y: s.chips.length > 1 ? 300 : 470, w: 1000, size: 170, color: '#fff' });
      if (s.sub) sb = div('abs', L, s.sub, `left:840px;top:${s.chips.length ? 400 : 590}px;width:900px;font-size:52px;font-weight:600;color:#fff;line-height:1.2`);
      ch = s.chips.map((c, ci) => {
        const wide = s.chips.length === 3 && s.stag;
        const el = wide ? div('abs', L, c, `left:840px;top:${430 + ci * 150}px;width:900px;padding:26px 36px;border-radius:30px;background:rgba(255,255,255,.2);border:2px solid rgba(255,255,255,.55);font-size:44px;font-weight:800;letter-spacing:-.01em;box-sizing:border-box`) : div('abs', L, c, `left:${840 + ci * 210}px;top:560px;padding:16px 34px;border-radius:999px;background:#fff;color:${s.bg};font-size:34px;font-weight:800`);
        return { el, a: wide ? s.stag[ci] : s.a + 1.6 + ci * 0.5 };
      });
    } else {
      tt = kin(L, 'Dihafal ≠\n~dijalankan.~', { x: M + 80, y: 520, w: 1600, size: 230, lh: 0.98, color: '#111', acc: { tilde: '#2f55c8' } });
    }
    const dots = [0, 1, 2, 3].map(d => div('abs', L, '', `left:${W / 2 - 66 + d * 44}px;bottom:70px;width:14px;height:14px;border-radius:50%;background:${s.dark ? '#111' : '#fff'};opacity:${d === i ? 1 : 0.35}`));
    cue(s.a + 0.1, i ? 'whoosh' : 'soft', 0.9); ch.forEach(c => cue(c.a, 'pop', 0.9));
    if (i === 3) cue(s.a + 0.5, 'pop', 1.3);
    return { s, L, circ, tt, sb, ch, i };
  });
  return t => {
    layers.forEach(o => {
      const { s, L } = o;
      const on = t >= s.a - 0.01 && t < (o.i === 3 ? 80.4 : slides[o.i + 1].a + 0.7);
      L.style.display = on ? '' : 'none'; if (!on) return;
      const rk = o.i === 0 ? 1 : E.inOutCubic(prog(t, s.a, 0.8));
      L.style.clipPath = `circle(${(rk * 2300).toFixed(0)}px at ${o.i === 3 ? '960px 540px' : CXs + 'px ' + CYs + 'px'})`;
      if (o.circ) { const k = ph(t, s.a + 0.2, 0.9, E.outBack); o.circ.style.transform = `scale(${k.toFixed(3)}) rotate(${((1 - k) * -25).toFixed(1)}deg)`; }
      const out = (o.i < 3 ? slides[o.i + 1].a : 99) - 0.0;
      o.tt.update(t, s.a + 0.3, out + 0.3 - 0.45 + 0.0, 40);
      if (o.sb) place(o.sb, t, s.a + 0.7, out - 0.0, { dy: 24 });
      o.ch.forEach(c => place(c.el, t, c.a, out, { dx: 60, dy: 0 }));
    });
  };
});

// ============================================================ P5 · HUD BLUE (wireframe globe + callouts)
Part(80.4, 95.8, (root, p0) => {
  root.style.background = 'linear-gradient(180deg,#040a18 0%,#08173a 55%,#050b1a 100%)';
  const gl = sv('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, root);
  const defs = sv('defs', {}, gl); const rg = sv('radialGradient', { id: 'g5' }, defs); sv('stop', { offset: 0, 'stop-color': '#3a7bff', 'stop-opacity': 0.5 }, rg); sv('stop', { offset: 1, 'stop-color': '#3a7bff', 'stop-opacity': 0 }, rg);
  const glow = sv('circle', { cx: 1300, cy: 560, r: 520, fill: 'url(#g5)' }, gl);
  brackets(root, 'rgba(120,180,255,.5)');
  hudLabel(root, 'Pancasila · Setelah Reformasi', `left:${M}px;top:78px`, 'rgba(150,200,255,.7)');
  const tr = hudLabel(root, '', `right:${M}px;top:78px;text-align:right;font-variant-numeric:tabular-nums`, 'rgba(150,200,255,.7)');
  const title = kin(root, 'Setelah\n~1998.~', { x: M, y: 520, w: 1500, size: 230, lh: 0.98, acc: { tilde: '#9fd2ff' } });
  const GX = 1330, GY = 560, GR = 250;
  const svg = sv('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, root);
  const globe = sv('g', {}, svg);
  const core = sv('circle', { cx: GX, cy: GY, r: GR, fill: 'rgba(30,80,170,.18)', stroke: '#9fd2ff', 'stroke-width': 2.4 }, globe);
  const lats = [-60, -30, 0, 30, 60].map(() => sv('ellipse', { cx: GX, fill: 'none', stroke: 'rgba(159,210,255,.5)', 'stroke-width': 1.4 }, globe));
  const lons = [0, 1, 2, 3, 4, 5].map(() => sv('ellipse', { cx: GX, cy: GY, ry: GR, fill: 'none', stroke: 'rgba(159,210,255,.5)', 'stroke-width': 1.4 }, globe));
  const orbit = sv('ellipse', { cx: GX, cy: GY, rx: GR * 1.4, ry: GR * 0.36, fill: 'none', stroke: AMBER, 'stroke-width': 2.4, transform: `rotate(-16 ${GX} ${GY})` }, globe);
  const sat = sv('circle', { r: 10, fill: AMBER }, globe);
  const steps = [
    { a: 83.4, tag: '01', lab: 'Reformasi 1998', sub: '', ang: -2.3 },
    { a: 85.0, tag: '02', lab: 'P4 dicabut', sub: 'Tap MPR XVIII/MPR/1998', ang: -2.9 },
    { a: 86.7, tag: '03', lab: 'BP7 dibubarkan', sub: 'Keppres 27/1999', ang: 2.9 },
    { a: 88.4, tag: '04', lab: 'Pancasila tetap\ndasar negara', sub: '', ang: 2.3, hi: true },
  ].map((s, i) => {
    const y = 300 + i * 180;
    const el = div('abs', root, `<div class="" style="font-size:20px;font-weight:800;letter-spacing:.18em;color:${s.hi ? AMBER : '#7fc4ff'}">${s.tag}</div><div style="font-size:52px;font-weight:800;letter-spacing:-.01em;line-height:1.05;margin-top:4px;white-space:pre-line">${s.lab}</div>${s.sub ? `<div style="font-size:26px;font-weight:500;opacity:.65;margin-top:6px">${s.sub}</div>` : ''}`, `left:${M}px;top:${y}px;width:640px;color:#fff`);
    const px = GX + GR * Math.cos(s.ang), py = GY + GR * Math.sin(s.ang) * 0.9;
    const ln = sv('polyline', { points: `${M + 600},${y + 40} ${M + 700},${y + 40} ${px.toFixed(0)},${py.toFixed(0)}`, fill: 'none', stroke: s.hi ? AMBER : '#7fc4ff', 'stroke-width': 1.8, pathLength: 1 }, svg); ln.style.strokeDasharray = '1';
    const dot = sv('circle', { cx: px, cy: py, r: 8, fill: s.hi ? AMBER : '#7fc4ff' }, svg);
    cue(s.a, 'pop', 1); cue(s.a - 0.4, 'swoosh', 0.6);
    return { s, el, ln, dot };
  });
  // photo (HUD frame)
  const FX = 940, FY = 190, FW = 840, FH = 560;
  const fr = div('abs', root, '', `left:${FX}px;top:${FY}px;width:${FW}px;height:${FH}px;overflow:hidden;background:#07122b;border:1.5px solid rgba(127,196,255,.5)`);
  const fm = media(fr, 'assets/ph_F5.png', FW, FH); if (fm.vid) videos.push({ vid: fm.vid, t0: 91.4, dur: 4.2, start: 0 });
  const fbr = brackets(root, '#7fc4ff', 0, 0); fbr.remove();
  const ftag = div('abs', root, 'Mei 1998 · Reformasi', `left:${FX + 22}px;top:${FY + 20}px;padding:8px 20px;background:rgba(5,12,30,.85);border:1.5px solid ${AMBER};color:${AMBER};font-size:22px;font-weight:800;letter-spacing:.1em;text-transform:uppercase`);
  const fcap = div('abs', root, 'Mahasiswa di gedung DPR/MPR<br><span style="font-size:20px;opacity:.5;font-weight:500">Sumber: (isi arsip/fotografer, lisensi)</span>', `left:${FX}px;top:${FY + FH + 24}px;width:${FW}px;font-size:28px;font-weight:600;color:rgba(255,255,255,.85);line-height:1.35`);
  cue(91.5, 'swoosh', 1);
  return t => {
    title.update(t, 80.7, 82.7);
    tr.textContent = `T+00:${pad2(t)}`;
    const gk = ph(t, 82.6, 1.2, E.outBack) * (1 - E.inCubic(prog(t, 91.0, 0.5)));
    globe.style.opacity = gk.toFixed(3); globe.style.transformOrigin = `${GX}px ${GY}px`; globe.style.transform = `scale(${(0.6 + 0.4 * gk).toFixed(3)})`;
    lats.forEach((e, i) => { const d = [-60, -30, 0, 30, 60][i] * Math.PI / 180, rx = GR * Math.cos(d); e.setAttribute('rx', rx.toFixed(2)); e.setAttribute('ry', (rx * 0.26).toFixed(2)); e.setAttribute('cy', (GY + GR * Math.sin(d)).toFixed(2)); });
    lons.forEach((e, i) => e.setAttribute('rx', (GR * Math.abs(Math.cos((i / 6) * Math.PI + t * 0.5))).toFixed(2)));
    const sa = t * 1.4, c = Math.cos(-16 * Math.PI / 180), sn = Math.sin(-16 * Math.PI / 180);
    sat.setAttribute('cx', (GX + GR * 1.4 * Math.cos(sa) * c - GR * 0.36 * Math.sin(sa) * sn).toFixed(1)); sat.setAttribute('cy', (GY + GR * 1.4 * Math.cos(sa) * sn + GR * 0.36 * Math.sin(sa) * c).toFixed(1));
    const amb = ph(t, 88.8, 0.8); core.setAttribute('fill', `rgba(${Math.round(lerp(30, 224, amb * 0.55))},${Math.round(lerp(80, 161, amb * 0.55))},${Math.round(lerp(170, 0, amb * 0.55))},${(0.18 + 0.14 * amb).toFixed(3)})`);
    steps.forEach(o => {
      place(o.el, t, o.s.a, 999, { dx: -50, dy: 0 });
      const lk = ph(t, o.s.a, 0.9, E.inOutCubic) * fade(t, 91.0) * (1 - 0);
      o.ln.style.strokeDashoffset = (1 - ph(t, o.s.a, 0.9, E.inOutCubic)).toFixed(3); o.ln.style.opacity = fade(t, 91.0); o.dot.style.opacity = lk;
    });
    const pk = ph(t, 91.4, 0.8); fr.style.opacity = pk; fr.style.transform = `translateX(${((1 - pk) * 70).toFixed(1)}px)`; ftag.style.opacity = ph(t, 92.0, 0.5); fcap.style.opacity = ph(t, 92.1, 0.5);
    fm.inner.style.transform = `scale(${lerp(1.06, 1.16, prog(t, 91.4, 4.2)).toFixed(4)})`;
    const tail = fade(t, 95.35); [fr, ftag, fcap].forEach(e => { e.style.opacity = (parseFloat(e.style.opacity || 0) * tail).toFixed(3); });
  };
});

// ============================================================ P6 · BARS (dark blue isometric bars) + white reflection slide
Part(95.8, 119.2, (root, p0) => {
  root.style.background = 'linear-gradient(180deg,#050b1a 0%,#091a40 100%)';
  const gl = sv('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, root);
  const defs = sv('defs', {}, gl); const rg = sv('radialGradient', { id: 'g6' }, defs); sv('stop', { offset: 0, 'stop-color': '#2f6fe0', 'stop-opacity': 0.45 }, rg); sv('stop', { offset: 1, 'stop-color': '#2f6fe0', 'stop-opacity': 0 }, rg);
  sv('circle', { cx: 1350, cy: 700, r: 560, fill: 'url(#g6)' }, gl);
  brackets(root, 'rgba(120,180,255,.45)');
  hudLabel(root, 'Bagian 05 · Untuk generasi muda', `left:${M}px;top:78px`, 'rgba(150,200,255,.7)');
  const intro = kin(root, 'Untuk generasi\n~muda.~', { x: M, y: 500, w: 1500, size: 190, lh: 0.98, acc: { tilde: '#9fd2ff' } });
  cue(96.0, 'whoosh', 0.9);
  const svg = sv('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, root);
  const cam = sv('g', { transform: 'translate(1330,820)' }, svg), g = sv('g', {}, cam); const U = 74, K = isoKit(g, U);
  const pal = { top: [30, 62, 122], left: [13, 33, 74], right: [9, 23, 55], edge: 'rgba(120,190,255,.7)', gt: [140, 215, 255], gl: [60, 130, 215], gr: [40, 100, 180] };
  const floor = K.box(g, { x: -4.6, y: -2, w: 9.2, d: 4, z0: 0, top: [14, 30, 66], left: [9, 20, 46], right: [6, 15, 36], edge: pal.edge, gtop: [30, 60, 110] }); floor.set(0.25);
  const bars = [[2.4, 0.1], [3.9, 0.2], [5.6, 0.3]].map(([h], i) => { const b = K.box(g, { x: -3.6 + i * 2.6, y: -0.8, w: 1.6, d: 1.6, z0: 0.25, top: pal.top, left: pal.left, right: pal.right, edge: pal.edge, gtop: pal.gt, gleft: pal.gl, gright: pal.gr }); b.h = h; b.gx = -3.6 + i * 2.6 + 0.8; return b; });
  [...bars].sort((a, b) => a.key - b.key).forEach(b => g.appendChild(b.g));
  const nums = bars.map((b, i) => div('abs', root, `0${i + 1}`, `width:200px;text-align:center;font-size:96px;font-weight:800;letter-spacing:-.03em;color:${i === 2 ? AMBER : '#fff'};transform:translate(-50%,-50%)`));
  const items = [
    { a: 98.6, t: 'Hafal ≠ hayati' }, { a: 103.0, t: 'Hidup lewat dialog, bukan satu tafsir' }, { a: 107.4, t: 'Diuji di keseharian: adil, hargai beda, bermusyawarah' },
  ].map((o, i) => {
    const el = div('abs', root, `<span style="color:${AMBER};font-weight:800;margin-right:22px">0${i + 1}</span>${o.t}`, `left:${M}px;top:${430 + i * 170}px;width:760px;font-size:50px;font-weight:800;letter-spacing:-.01em;line-height:1.15`);
    cue(o.a, 'pop', 1); cue(o.a + 0.4, 'tick', 0.8); return { el, a: o.a };
  });
  const head = kin(root, 'Tiga ~pelajaran.~', { x: M, y: 300, w: 900, size: 110, acc: { tilde: '#9fd2ff' } });
  // white reflection slide
  const WH = div('abs', root, '', `left:0;top:0;width:${W}px;height:${H}px;background:#f7f5ef`);
  hudLabel(WH, 'Refleksi', `left:${M}px;top:78px`, 'rgba(0,0,0,.45)');
  const wt = kin(WH, 'Bukan siapa yang paling ~Pancasilais,~\ntapi siapa yang menjalankan.', { x: M + 40, y: 540, w: 1700, size: 128, lh: 1.04, color: '#101010', acc: { tilde: '#2f55c8' } });
  cue(112.7, 'whoosh', 1); cue(113.4, 'pop', 1.1);
  return t => {
    intro.update(t, 96.1, 98.0);
    const bk = [0, 1, 2].map(i => ph(t, items[i].a, 1.3, E.outCubic));
    const rise = ph(t, 96.3, 1.2);
    bars.forEach((b, i) => {
      const act = Math.exp(-Math.pow((t - (items[i].a + 0.9)) / 0.7, 2)) * 0.9;
      b.set(b.h * bk[i], act);
      const top = [1330 + K.P(b.gx, 0, 0.25 + b.h * bk[i] + 0.8)[0], 820 + K.P(b.gx, 0, 0.25 + b.h * bk[i] + 0.8)[1]];
      nums[i].style.left = top[0] + 'px'; nums[i].style.top = (top[1] - 10) + 'px'; nums[i].style.opacity = (clamp(bk[i] * 2) * (t < 112.2 ? 1 : fade(t, 112.5))).toFixed(3);
    });
    floor.set(0.25 * rise);
    head.update(t, 98.2, 112.0);
    items.forEach(o => place(o.el, t, o.a, 112.0, { dx: -40, dy: 0 }));
    const rk = E.inOutCubic(prog(t, 112.6, 0.9));
    WH.style.clipPath = `circle(${(rk * 1500).toFixed(0)}px at 960px 540px)`; WH.style.visibility = rk > 0.001 ? 'visible' : 'hidden';
    wt.update(t, 113.4, 118.7, 50);
  };
});

// ============================================================ P7 · CLOSE (light isometric city complete)
Part(119.2, 131, (root, p0) => {
  root.style.background = 'linear-gradient(160deg,#f6f8fd 0%,#e4ebf8 100%)';
  const dg = sv('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, root);
  for (let x = 60; x < W; x += 60) for (let y = 60; y < H; y += 60) sv('circle', { cx: x, cy: y, r: 1.3, fill: 'rgba(80,105,180,.16)' }, dg);
  const city = makeCity(root, 0, 0, 70, PAL_L);
  const ink = '#14234a', mu = 'rgba(20,35,74,.55)';
  brackets(root, 'rgba(20,35,74,.25)');
  hudLabel(root, 'Pancasila · Orde Baru', `left:${M}px;top:78px`, mu);
  const tr = hudLabel(root, '', `right:${M}px;top:78px;text-align:right;font-variant-numeric:tabular-nums`, mu);
  const q = kin(root, 'Pancasila hidup karena\n~dipraktikkan,~ bukan dihafal.', { x: M, y: 540, w: 980, size: 88, color: ink, lh: 1.08, acc: { tilde: '#2f55c8' } });
  const e1 = kin(root, 'Terima\n~kasih.~', { x: M, y: 480, w: 900, size: 200, color: ink, lh: 0.98, acc: { tilde: '#2f55c8' } });
  const pill = div('abs', root, 'Sumber foto dan referensi ada di deskripsi', `left:${M}px;top:710px;padding:20px 40px;border-radius:999px;background:${ink};color:#fff;font-size:32px;font-weight:800`);
  cue(119.6, 'soft', 1); [120.2, 120.8, 121.4, 122.0, 122.6, 123.2].forEach(t => cue(t, 'pop', 0.8)); cue(125.7, 'whoosh', 0.9); cue(126.4, 'pop', 1.2); cue(128.6, 'soft', 0.8);
  return t => {
    const st = [0, 1, 2, 3, 4, 5].map(i => ph(t, 120.0 + i * 0.6, 0.9, E.outBack));
    city.set({ slab: 1, line: 1, tw: [1, 1, 1, 1], st, glow: [] });
    const z = lerp(1, 0.9, E.inOutCubic(prog(t, 119.2, 11)));
    city.place(1380, 620, z);
    q.update(t, 119.6, 125.2);
    e1.update(t, 125.9, 999, 50); place(pill, t, 127.0, 999, { dy: 30 });
    tr.textContent = `T+00:${pad2(t)}`;
  };
});

// ------------------------------------------------------------ mount + wipes + progress
parts.forEach(p => { p.root = div('abs', stage, '', `left:0;top:0;width:${W}px;height:${H}px;overflow:hidden`); p.update = p.build(p.root, p.t0); p.root.style.display = 'none'; });
const wipeEls = WIPES.map(([b, c1, c2]) => ({ b, a: div('abs', stage, '', `left:0;top:0;width:${W}px;height:${H}px;background:${c1};display:none`), c: div('abs', stage, '', `left:0;top:0;width:${W}px;height:${H}px;background:${c2};display:none`) }));
WIPES.forEach(([b]) => cue(b - 0.35, 'whoosh', 1.1));
const pf = div('abs', stage, '', `left:0;bottom:0;height:6px;width:0;background:linear-gradient(90deg,${TEAL},${AMBER})`);
cues.sort((a, b) => a.t - b.t); window.__cues = cues;

function update(t) {
  for (const p of parts) { const on = t >= p.t0 && t < p.t1; p.root.style.display = on ? '' : 'none'; if (on) p.update(t); }
  for (const w of wipeEls) {
    const k = prog(t, w.b - 0.45, 0.9), on = k > 0 && k < 1;
    w.a.style.display = w.c.style.display = on ? '' : 'none';
    if (on) { const e = E.inOutQuart(k); w.a.style.transform = `translateX(${lerp(-W, W, e).toFixed(1)}px)`; w.c.style.transform = `translateX(${lerp(-W * 1.35, W * 0.65, E.inOutQuart(clamp(k * 1.0))).toFixed(1)}px)`; w.c.style.zIndex = 1; w.a.style.zIndex = 2; }
  }
  pf.style.width = (clamp(t / DUR) * 100).toFixed(2) + '%';
}
window.seek = async t => {
  update(t);
  for (const v of videos) {
    const lt = t - v.t0; if (lt < -0.05 || lt > v.dur + 0.05) continue;
    const target = v.start + clamp(lt, 0, v.dur);
    if (Math.abs(v.vid.currentTime - target) > 0.001) await new Promise(res => { v.vid.onseeked = res; v.vid.currentTime = Math.min(target, (v.vid.duration || target) - 0.01); });
  }
};
update(0);
__res();
