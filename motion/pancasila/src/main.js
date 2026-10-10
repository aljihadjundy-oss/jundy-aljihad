import { E, prog, clamp, lerp, enter } from '/rt/engine.js';

let __res; window.__ready = new Promise(r => { __res = r; });
const W = 1920, H = 1080, M = 120, DUR = 161;
window.__duration = DUR; window.__fps = 30; window.__beats = [];
const NS = 'http://www.w3.org/2000/svg';
const TEAL = '#3FB6C4', AMBER = '#E0A100', GREEN = '#16B67A', CORAL = '#F2603F', BLUE = '#2F6BF0', PURPLE = '#6A3FE0', INK = '#14234a';
const stage = document.getElementById('stage');
const sv = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
const div = (cls, parent, html, style) => { const e = document.createElement('div'); e.className = cls; if (html != null) e.innerHTML = html; if (style) e.style.cssText = style; (parent || stage).appendChild(e); return e; };
const ph = (t, a, d, e = E.outExpo) => e(prog(t, a, d));
const OUTD = 0.45;
const fade = (t, out) => 1 - E.inCubic(prog(t, out, OUTD));
const cues = []; const cue = (t, type, gain = 1) => cues.push({ t, type, gain });
const pad2 = n => String(Math.floor(n)).padStart(2, '0');
const place = (el, t, a, out, o = {}) => enter(el, t, a, out, o);

await Promise.all([500, 600, 800].map(w => document.fonts.load(`${w} 40px Sans`)).concat([document.fonts.load('italic 400 40px Serif')]));
await document.fonts.ready;

// ------------------------------------------------------------ text (markers: *teal* _amber_ ~serif italic~)
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
    box, spans, update(t, a, out, dy = 40) {
      let any = 0;
      spans.forEach((s, i) => {
        const k = ph(t, a + i * 0.07, 0.8), x = E.inCubic(prog(t, out, 0.45)), o = k * (1 - x); any = Math.max(any, o);
        s.style.opacity = o.toFixed(3); s.style.transform = `translateY(${(dy * (1 - k) - 26 * x).toFixed(1)}px)`;
      });
      box.style.visibility = any > 0.002 ? 'visible' : 'hidden';
    },
  };
}
const IC = {
  users: '<circle cx="9" cy="8" r="3.2"/><circle cx="17" cy="9" r="2.6"/><path d="M3 20c0-3.6 2.7-6 6-6s6 2.4 6 6M15 14.6c3 0 6 1.6 6 5.4"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  pulse: '<path d="M3 12h4l2-6 4 12 2-6h6"/>', map: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14"/>',
};
const icon = (n, s, c = '#fff', sw = 1.8) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" style="position:static">${IC[n]}</svg>`;
const brackets = (parent, col, inset = 48, len = 44, sw = 2) => {
  const s = sv('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, parent);
  [[inset, inset, 1, 1], [W - inset, inset, -1, 1], [inset, H - inset, 1, -1], [W - inset, H - inset, -1, -1]].forEach(([x, y, sx, sy]) => sv('path', { d: `M${x},${y + sy * len} L${x},${y} L${x + sx * len},${y}`, fill: 'none', stroke: col, 'stroke-width': sw }, s));
  return s;
};
const hudLabel = (parent, html, style, col) => div('abs', parent, html, `font-size:20px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:${col};${style}`);

// ------------------------------------------------------------ media: image or video clip (deterministic seek)
const vids = [];
const PRELOAD = [];
const MAN = await (await fetch('/p/assets/frames/manifest.json')).json();
const fpath = (clip, i) => `/p/assets/frames/${clip}/${String(i + 1).padStart(5, '0')}.jpg`;
function mediaIn(parent, m, w, h, gray) {
  const inner = div('abs', parent, '', `left:0;top:0;width:${w}px;height:${h}px;transform-origin:${m.ox || '50%'} ${m.oy || '50%'}${gray ? ';filter:grayscale(1) contrast(1.08)' : ''}`);
  let vid = null;
  if (m.clip) { vid = document.createElement('img'); vid.src = fpath(m.clip, 0); vid.style.cssText = `position:absolute;left:0;top:0;width:${w}px;height:${h}px;object-fit:cover`; inner.appendChild(vid); PRELOAD.push(vid); vid.clip = m.clip; vid.cur = 0; }
  else { const im = document.createElement('img'); im.src = '/p/' + m.src; im.style.cssText = `position:absolute;left:0;top:0;width:${w}px;height:${h}px;object-fit:${m.fit || 'cover'};object-position:${m.pos || 'center'}`; inner.appendChild(im); PRELOAD.push(im); }
  return { inner, vid };
}
// a framed media card with enter/exit, slow camera, tag + caption + credit; times are part-local
function card(parent, P0, o) {
  const { x, y, w, h, a, b, radius = 24, border = '8px solid #fff', shadow = '0 26px 60px rgba(30,50,110,.28)', bg = '#fff', capColor = INK, tagCol = INK, tagTxt = '#fff', gray = false, dx = -70 } = o;
  const f = div('abs', parent, '', `left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:${radius}px;overflow:hidden;background:${bg};box-shadow:${shadow};border:${border};box-sizing:border-box`);
  const bw = parseFloat(border) || 0;
  const m = mediaIn(f, o.media, w - bw * 2, h - bw * 2, gray);
  if (m.vid) vids.push({ vid: m.vid, abs0: P0 + a, dur: b - a });
  const tg = o.tag ? div('abs', parent, o.tag, `left:${x + 26}px;top:${y + 26}px;padding:8px 20px;border-radius:999px;background:${tagCol};color:${tagTxt};font-size:22px;font-weight:800;letter-spacing:.1em;text-transform:uppercase`) : null;
  const cp = o.cap ? div('abs', parent, `${o.cap}<br><span style="font-size:20px;font-weight:500;opacity:.6">Sumber: ${o.credit || '(isi arsip/fotografer, lisensi)'}</span>`, `left:${x}px;top:${y + h + 20}px;width:${w}px;font-size:28px;font-weight:600;color:${capColor};line-height:1.35`) : null;
  cue(P0 + a + 0.1, 'swoosh', 0.8);
  const cam = o.cam || [1.02, 1.12];
  return lt => {
    const on = lt > a - 0.1 && lt < b + 0.1;
    [f, tg, cp].forEach(e => { if (e) e.style.display = on ? '' : 'none'; });
    if (!on) return;
    place(f, lt, a, b - OUTD, { dx, dy: 0, s0: 0.96 }); if (tg) place(tg, lt, a + 0.5, b - OUTD, { dy: 14 }); if (cp) place(cp, lt, a + 0.7, b - OUTD, { dy: 18 });
    const k = E.inOutCubic(prog(lt, a, b - a)), z = lerp(cam[0], cam[1], k), fx = o.fx ?? 0.5, fy = o.fy ?? 0.5;
    m.inner.style.transform = `translate(${((0.5 - fx) * (z - 1) * (w - bw * 2)).toFixed(1)}px,${((0.5 - fy) * (z - 1) * (h - bw * 2)).toFixed(1)}px) scale(${z.toFixed(4)})`;
  };
}

// ------------------------------------------------------------ isometric kit
const C30 = 0.866;
const lerpc = (c1, c2, k) => c1.map((v, i) => Math.round(lerp(v, c2[i], k)));
const rgb = c => `rgb(${c[0]},${c[1]},${c[2]})`;
function isoKit(U) {
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
function makeCity(root, U, pal) {
  const svg = sv('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, root), cam = sv('g', {}, svg), g = sv('g', {}, cam), K = isoKit(U), ZB = 0.5;
  g.style.filter = 'drop-shadow(0 18px 24px rgba(40,70,140,.18))';
  const mk = (o, c) => K.box(g, { ...o, top: c[0], left: c[1], right: c[2], edge: pal.edge, gtop: pal.glow[0], gleft: pal.glow[1], gright: pal.glow[2] });
  const s0 = mk({ x: -4, y: -4, w: 8, d: 8, z0: 0 }, pal.slab0), s1 = mk({ x: -3.2, y: -3.2, w: 6.4, d: 6.4, z0: 0.3 }, pal.slab1);
  const outline = sv('polyline', { points: K.pts([K.P(-4, -4), K.P(4, -4), K.P(4, 4), K.P(-4, 4), K.P(-4, -4)]), fill: 'none', stroke: '#5b7be0', 'stroke-width': 2.4, pathLength: 1 }, g); outline.style.strokeDasharray = '1';
  const grid = sv('g', { stroke: 'rgba(86,110,188,.25)', 'stroke-width': 1 }, g);
  for (let i = -4; i <= 4; i++) { const v = i * 0.8, a = K.P(v, -3.2, ZB), b = K.P(v, 3.2, ZB), c = K.P(-3.2, v, ZB), d = K.P(3.2, v, ZB); sv('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1] }, grid); sv('line', { x1: c[0], y1: c[1], x2: d[0], y2: d[1] }, grid); }
  let z = ZB;
  const tower = [[2.0, 1.1], [1.5, 0.95], [1.0, 0.8], [0.4, 0.45]].map(([s, h]) => { const b = mk({ x: -s / 2, y: -s / 2, w: s, d: s, z0: z }, pal.tw); b.h = h; z += h; return b; });
  const sats = [1.1, 0.8, 1.4, 0.9, 1.2, 0.7].map((h, i) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 6 + 0.35, x = 2.5 * Math.cos(a), y = 2.5 * Math.sin(a); const b = mk({ x: x - 0.45, y: y - 0.45, w: 0.9, d: 0.9, z0: ZB }, pal.sat); b.h = h; b.px = x; b.py = y; return b; });
  [...sats.filter(b => b.key < 0), ...tower, ...sats.filter(b => b.key >= 0).sort((a, b) => a.key - b.key)].forEach(b => g.appendChild(b.g));
  return {
    sats, ZB,
    place(x, y, s) { cam.setAttribute('transform', `translate(${x},${y}) scale(${s})`); this.x = x; this.y = y; this.s = s; },
    scr(px, py, pz) { const p = K.P(px, py, pz); return [this.x + p[0] * this.s, this.y + p[1] * this.s]; },
    set({ slab = 1, tw = [1, 1, 1, 1], st = [1, 1, 1, 1, 1, 1], glow = [], line = 1 }) {
      outline.style.strokeDashoffset = (1 - line).toFixed(3); outline.style.opacity = 1 - clamp((slab - 0.5) * 2);
      s0.set(0.3 * clamp(slab * 1.4)); s1.set(0.2 * clamp(slab * 1.4 - 0.4)); grid.style.opacity = clamp(slab * 1.5 - 0.5).toFixed(3);
      tower.forEach((b, i) => b.set(b.h * tw[i], glow[10 + i] || 0)); sats.forEach((b, i) => b.set(b.h * st[i], glow[i] || 0));
    },
  };
}

// ------------------------------------------------------------ parts (local time `lt`) + wipes
const parts = [];
const Part = (t0, t1, build) => parts.push({ t0, t1, build });
const B = [15.2, 37.0, 63.2, 106.8, 122.8, 150.8];
const WIPES = [[B[0], '#8fb0ff', '#ffffff'], [B[1], '#ffffff', '#0b0b0b'], [B[2], BLUE, '#ffffff'], [B[3], TEAL, '#050b1a'], [B[4], AMBER, '#050b1a'], [B[5], '#8fb0ff', '#ffffff']];

// ============================================================ P1 · HOOK (monochrome HUD, B&W archive cut-ins)
Part(0, B[0], (root, P0) => {
  root.style.background = '#060606';
  const gs = sv('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, root);
  for (let x = 0; x <= W; x += 120) sv('line', { x1: x, y1: 0, x2: x, y2: H, stroke: 'rgba(255,255,255,.035)' }, gs);
  for (let y = 0; y <= H; y += 120) sv('line', { x1: 0, y1: y, x2: W, y2: y, stroke: 'rgba(255,255,255,.035)' }, gs);
  brackets(root, 'rgba(255,255,255,.4)');
  hudLabel(root, 'Pancasila · Dinamika Sejarah Indonesia', `left:${M}px;top:78px`, 'rgba(255,255,255,.55)');
  const tr = hudLabel(root, 'Hook', `right:${M}px;top:78px;text-align:right`, 'rgba(255,255,255,.55)');
  const tc = hudLabel(root, '', `left:${M}px;bottom:70px;font-variant-numeric:tabular-nums`, 'rgba(255,255,255,.4)');
  const scan = div('abs', root, '', `left:0;top:0;width:${W}px;height:2px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent)`);
  const rule = div('abs', root, '', `left:${M}px;top:930px;width:260px;height:5px;border-radius:3px;background:${AMBER};transform-origin:0 50%`);
  const mk = (txt, x, y, size, a, out, acc) => { const k = kin(root, txt, { x, y, w: 1700 - x + M, size, lh: 1.0, acc: { tilde: acc || 'rgba(255,255,255,.88)' } }); return { k, a, out }; };
  const T = [
    mk('Menghafal Pancasila\nbelum tentu bikin kita\n~Pancasilais.~', M, 520, 128, 0.15, 3.0),
    mk('Kedengarannya\n~salah?~', M, 520, 230, 3.2, 4.1),
    mk('dihafal.', M, 330, 150, 4.7, 9.2), mk('ditatar.', M, 520, 150, 5.8, 9.2), mk('jadi syarat\n~berorganisasi.~', M, 760, 130, 7.0, 9.2),
    mk('Dihafal ≠\n~dihayati?~', M, 520, 230, 9.6, 11.7, AMBER),
    mk('Untuk menjawabnya,\n~Orde Baru.~', M, 520, 170, 11.9, 15.2, AMBER),
  ];
  const c1 = card(root, P0, { x: 1040, y: 190, w: 740, h: 520, a: 5.6, b: 7.7, radius: 0, border: '2px solid rgba(255,255,255,.3)', shadow: 'none', bg: '#111', gray: true, dx: 60, tag: 'Penataran P4', tagCol: 'rgba(0,0,0,.8)', tagTxt: '#fff', cap: 'Arsip penataran P4', capColor: 'rgba(255,255,255,.8)', media: { src: 'assets/img/img_penataran_pwi.png' }, cam: [1.02, 1.12] });
  const c2 = card(root, P0, { x: 1040, y: 190, w: 740, h: 520, a: 7.7, b: 9.5, radius: 0, border: '2px solid rgba(255,255,255,.3)', shadow: 'none', bg: '#111', gray: true, dx: 60, tag: 'SMP 3 Magelang', tagCol: 'rgba(0,0,0,.8)', tagTxt: '#fff', cap: 'Penataran P4 siswa baru 1991/1992', capColor: 'rgba(255,255,255,.8)', media: { src: 'assets/img/img_penataran_smp3_magelang.jpg' }, cam: [1.02, 1.12] });
  [0.2, 3.3, 4.8, 5.9, 7.1, 9.7, 12.0].forEach((t, i) => { cue(P0 + t, 'soft', 0.8); cue(P0 + t + 0.4, 'pop', 0.8); });
  return t => {
    const lt = t - P0; scan.style.top = ((lt * 160) % H).toFixed(1) + 'px';
    T.forEach(o => o.k.update(lt, o.a, o.out)); c1(lt); c2(lt);
    rule.style.transform = `scaleX(${(ph(lt, 0.9, 1) * (lt < 11.7 ? 1 : 1)).toFixed(3)})`;
    tc.textContent = `T+00:${pad2(t)}`; tr.textContent = lt < 3.1 ? 'Hook · 01' : lt < 9.5 ? 'Hook · 02' : 'Orde Baru';
  };
});

// ============================================================ P2 · KONTEKS (light isometric build + archive cards)
Part(B[0], B[1], (root, P0) => {
  root.style.background = 'linear-gradient(160deg,#f6f8fd 0%,#e4ebf8 100%)';
  const dg = sv('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, root);
  for (let x = 60; x < W; x += 60) for (let y = 60; y < H; y += 60) sv('circle', { cx: x, cy: y, r: 1.3, fill: 'rgba(80,105,180,.16)' }, dg);
  const city = makeCity(root, 64, PAL_L), mu = 'rgba(20,35,74,.55)';
  brackets(root, 'rgba(20,35,74,.25)');
  hudLabel(root, 'Bagian 01 · Orde Baru 1966–1998', `left:${M}px;top:78px`, mu);
  const tcl = hudLabel(root, '', `right:${M}px;top:78px;text-align:right;font-variant-numeric:tabular-nums`, mu);
  const bp = hudLabel(root, '', `right:${M}px;bottom:70px;text-align:right;font-variant-numeric:tabular-nums`, mu);
  const cs = sv('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, root);
  const chipEls = ['Sekolah', 'Kantor', 'Upacara'].map(n => { const g = sv('g', {}, cs); sv('rect', { x: -90, y: -26, width: 180, height: 52, rx: 26, fill: INK }, g); const tx = sv('text', { 'text-anchor': 'middle', y: 9, fill: '#fff', 'font-family': 'Sans', 'font-weight': 800, 'font-size': 26 }, g); tx.textContent = n; return g; });
  const CX = 120, CY = 140, CW = 740, CH = 480;
  const c1 = card(root, P0, { x: CX, y: CY, w: CW, h: CH, a: 0.3, b: 5.3, tag: 'Arsip video', cap: 'Presiden Soeharto, arsip video', media: { clip: 'soe_oath' }, cam: [1.02, 1.1] });
  const c2 = card(root, P0, { x: CX, y: CY, w: CW, h: CH, a: 5.6, b: 13.0, tag: '1 Oktober', cap: 'Monumen Pancasila Sakti, Lubang Buaya', media: { src: 'assets/img/img_monumen_garuda.jpg', pos: 'center 25%' }, cam: [1.1, 1.0] });
  const c3 = card(root, P0, { x: CX, y: CY, w: CW, h: CH, a: 17.4, b: 21.6, tag: 'Sekolah', cap: 'Buku Pendidikan Moral Pancasila (PMP)', media: { src: 'assets/img/img_buku_pmp.jpg' }, cam: [1.0, 1.1] });
  const SUB = [[0.3, 2.7, 'Orde Baru, ~1966–1998.~'], [2.7, 5.4, 'Di bawah ~Presiden Soeharto.~'], [5.7, 13.0, '1 Oktober, ~Hari Kesaktian Pancasila.~'], [13.2, 17.3, 'Fondasi ~stabilitas~ dan pembangunan.'], [17.5, 21.6, 'Hadir di sekolah, kantor, ~dan upacara.~']].map(([a, b, tx]) => ({ a, b, k: kin(root, tx, { x: M, y: 905, w: 1100, size: 66, color: INK, acc: { tilde: '#2f55c8', star: '#2f55c8' } }) }));
  [0.4, 2.2, 5.9, 8.0, 12.2].forEach((t, i) => cue(P0 + t, i ? 'pop' : 'whoosh', 0.9)); [17.9, 18.9, 19.9].forEach(t => cue(P0 + t, 'pop', 1));
  return t => {
    const lt = t - P0, tw = [2.0, 5.0, 8.5, 12.4].map(a => ph(lt, a, 1.8, E.outCubic)), sa = [17.8, 18.8, 19.8].map(a => ph(lt, a, 0.8, E.outBack));
    const glow = []; [17.8, 18.8, 19.8].forEach((a, i) => { glow[i] = Math.exp(-Math.pow((lt - (a + 0.5)) / 0.5, 2)) * 0.9; });
    city.set({ slab: ph(lt, 0.4, 1.8, E.outCubic), line: ph(lt, 0.3, 1.6, E.inOutCubic), tw, st: [sa[0], sa[1], sa[2], 0, 0, 0], glow });
    const z = lerp(1.15, 1, E.inOutCubic(prog(lt, 0, 10))); city.place(1360, 640 + (z - 1) * 120, z);
    chipEls.forEach((g, i) => { const b = city.sats[i], [x, y] = city.scr(b.px, b.py, city.ZB + b.h * sa[i] + 0.55), k = sa[i]; g.setAttribute('transform', `translate(${x.toFixed(1)},${(y - (1 - k) * 20).toFixed(1)}) scale(${(0.6 + 0.4 * k).toFixed(3)})`); g.style.opacity = clamp(k * 1.6) * fade(lt, 21.4); });
    c1(lt); c2(lt); c3(lt); SUB.forEach(s => s.k.update(lt, s.a, s.b - OUTD));
    bp.innerHTML = `Build progress <span style="color:${INK}">${String(Math.round(clamp(lt / 21) * 100)).padStart(3, '0')}%</span>`; tcl.textContent = `T+00:${pad2(t)}`;
  };
});

// ============================================================ P3 · MENU + PREVIEW (monochrome editorial)
Part(B[1], B[2], (root, P0) => {
  root.style.background = '#0b0b0b';
  brackets(root, 'rgba(255,255,255,.35)');
  hudLabel(root, 'Menu · Bagian 02', `left:${M}px;top:78px`, 'rgba(255,255,255,.5)');
  const tr = hudLabel(root, '', `right:${M}px;top:78px;text-align:right`, 'rgba(255,255,255,.5)');
  const title = kin(root, 'Dua langkah\n~besar.~', { x: M, y: 520, w: 1500, size: 200, lh: 0.98, acc: { tilde: 'rgba(255,255,255,.88)' } });
  const trip = ['Pedomannya satu.', 'Pelaksananya satu.', 'Asasnya ~juga satu.~'].map((tx, i) => kin(root, tx, { x: M, y: 330 + i * 190, w: 1700, size: 150, lh: 1.0, acc: { tilde: AMBER } }));
  const items = [
    { a: 2.0, b: 7.8, yr: '1978', t: 'P4 · Ekaprasetya Pancakarsa', s: 'Tap MPR II/MPR/1978', media: [{ a: 2.0, b: 5.0, src: 'assets/img/img_buku_p4.jpg', cap: 'Penjabaran Pedoman Penghayatan dan Pengamalan Pancasila', fit: 'contain' }, { a: 5.0, b: 7.8, src: 'assets/img/img_bahan_penataran.jpg', cap: 'Bahan referensi penataran P4', fit: 'contain' }] },
    { a: 7.8, b: 14.3, yr: '1979', t: 'BP7 dan penataran', s: 'Keppres 10/1979', media: [{ a: 7.8, b: 11.0, src: 'assets/img/img_penataran_pwi.png', cap: 'Penataran P4' }, { a: 11.0, b: 14.3, src: 'assets/img/img_penataran_smp3_magelang.jpg', cap: 'Penataran P4 siswa baru, SMP 3 Magelang, 1991/1992' }] },
    { a: 14.3, b: 22.6, yr: '1985', t: 'Asas tunggal', s: 'UU 3 dan UU 8 Tahun 1985', media: [{ a: 14.3, b: 22.6, src: 'assets/img/img_garuda_bendera.jpg', cap: 'Pancasila sebagai satu-satunya asas partai dan ormas' }] },
  ];
  const PXx = 960, PYy = 150, PWd = 860, PHt = 560;
  const menu = items.map((it, i) => {
    const y = 330 + i * 150;
    const row = div('abs', root, `<span style="color:${AMBER};font-weight:800;margin-right:26px">0${i + 1}</span>${it.t}<div style="font-size:24px;font-weight:500;letter-spacing:.04em;margin:8px 0 0 66px;opacity:.7">${it.s}</div>`, `left:${M}px;top:${y}px;width:760px;font-size:44px;font-weight:800;letter-spacing:-.01em;line-height:1.1;color:#fff`);
    const mark = div('abs', root, '', `left:${M - 34}px;top:${y + 8}px;width:6px;height:46px;border-radius:3px;background:${AMBER};transform-origin:50% 0`);
    const yr = div('abs', root, it.yr, `left:${PXx + 28}px;top:${PYy + PHt - 150}px;font-size:130px;font-weight:800;letter-spacing:-.04em;color:#fff;text-shadow:0 4px 30px rgba(0,0,0,.7)`);
    const meds = it.media.map(md => {
      const f = div('abs', root, '', `left:${PXx}px;top:${PYy}px;width:${PWd}px;height:${PHt}px;overflow:hidden;background:#161616;border:1.5px solid rgba(255,255,255,.18)`);
      const m = mediaIn(f, md, PWd, PHt, false);
      const cp = div('abs', root, `${md.cap}<br><span style="font-size:20px;opacity:.5;font-weight:500">Sumber: (isi arsip/fotografer, lisensi)</span>`, `left:${PXx}px;top:${PYy + PHt + 24}px;width:${PWd}px;font-size:28px;font-weight:600;color:rgba(255,255,255,.8);line-height:1.35`);
      cue(P0 + md.a + 0.1, 'swoosh', 0.9); return { md, f, m, cp };
    });
    cue(P0 + it.a + 0.5, 'tick', 1);
    return { it, row, mark, yr, meds };
  });
  cue(P0 + 0.3, 'whoosh', 0.9); cue(P0 + 22.9, 'pop', 1); cue(P0 + 23.9, 'pop', 1); cue(P0 + 24.9, 'pop', 1.2);
  return t => {
    const lt = t - P0;
    title.update(lt, 0.3, 1.8); tr.textContent = lt > 1.9 && lt < 22.6 ? 'Preview' : '';
    trip.forEach((k, i) => k.update(lt, 22.9 + i * 1.0, 99));
    menu.forEach(o => {
      const on = lt >= o.it.a && lt < o.it.b, enterK = ph(lt, 1.9, 0.8) * fade(lt, 22.3), act = on ? 1 : 0.34;
      o.row.style.opacity = (enterK * act).toFixed(3); o.row.style.transform = `translateX(${((1 - enterK) * -60).toFixed(1)}px)`;
      o.mark.style.transform = `scaleY(${on ? ph(lt, o.it.a, 0.4).toFixed(3) : 0})`;
      const yo = on ? ph(lt, o.it.a, 0.7) * (1 - E.inCubic(prog(lt, o.it.b - 0.35, 0.35))) : 0;
      o.yr.style.opacity = yo.toFixed(3); o.yr.style.visibility = yo > 0.002 ? 'visible' : 'hidden'; o.yr.style.transform = `translateY(${((1 - yo) * 30).toFixed(1)}px)`;
      o.meds.forEach(md => {
        const mon = lt >= md.md.a && lt < md.md.b, fi = ph(lt, md.md.a, 0.6), fo = 1 - E.inCubic(prog(lt, md.md.b - 0.3, 0.3)), k = mon ? fi * fo : 0;
        [md.f, md.cp].forEach(e => { e.style.opacity = k.toFixed(3); e.style.visibility = k > 0.002 ? 'visible' : 'hidden'; });
        md.f.style.transform = `translateX(${((1 - fi) * 70).toFixed(1)}px)`; md.cp.style.transform = `translateY(${((1 - fi) * 16).toFixed(1)}px)`;
        md.m.inner.style.transform = `scale(${lerp(1.0, 1.1, prog(lt, md.md.a, md.md.b - md.md.a)).toFixed(4)})`;
      });
    });
  };
});

// ============================================================ P4 · COLOUR SLIDES (+ map analogy)
Part(B[2], B[3], (root, P0) => {
  const S = [
    { a: 0, b: 2.0, bg: BLUE, ic: 'pulse', title: 'Dinamika', sub: 'Lalu, bagaimana hasilnya?' },
    { a: 2.0, b: 7.0, bg: GREEN, ic: 'check', title: 'Penerapan', sub: 'Bahasa bersama di negara yang beragam', chips: ['Sekolah', 'Kantor', 'Upacara'] },
    { a: 7.0, b: 14.9, bg: PURPLE, ic: null },
    { a: 14.9, b: 21.8, bg: CORAL, ic: 'x', title: 'Tantangan', chips: ['Tafsir resmi datang dari negara', 'Penataran P4: doktrinatif dan memakan biaya besar'], stag: [15.3, 18.0] },
    { a: 21.8, b: 43.6, bg: '#f7f5ef', ic: null },
  ];
  const CXs = 430, CYs = 540;
  const L = S.map((s, i) => {
    const el = div('abs', root, '', `left:0;top:0;width:${W}px;height:${H}px;background:${s.bg};overflow:hidden`);
    const dark = i === 4, ink = dark ? '#111' : '#fff', o = { s, el, i, upd: [] };
    hudLabel(el, `Dinamika · ${i + 1}/5`, `left:${M}px;top:78px`, dark ? 'rgba(0,0,0,.45)' : 'rgba(255,255,255,.75)');
    [0, 1, 2, 3, 4].forEach(d => div('abs', el, '', `left:${W / 2 - 88 + d * 44}px;bottom:62px;width:14px;height:14px;border-radius:50%;background:${dark ? '#111' : '#fff'};opacity:${d === i ? 1 : 0.35}`));
    if (i === 0 || i === 1 || i === 3) {
      o.circ = div('abs', el, icon(s.ic, 230, '#fff', 1.6), `left:${CXs - 250}px;top:${CYs - 250}px;width:500px;height:500px;border-radius:50%;background:rgba(255,255,255,.2);border:3px solid rgba(255,255,255,.45);display:flex;align-items:center;justify-content:center;box-sizing:border-box`);
      o.tt = kin(el, s.title, { x: 840, y: i === 0 ? 480 : 250, w: 1000, size: 170, color: '#fff' });
      if (s.sub) o.sb = div('abs', el, s.sub, `left:840px;top:${i === 0 ? 590 : 350}px;width:980px;font-size:52px;font-weight:600;color:#fff;line-height:1.2`);
      o.ch = (s.chips || []).map((c, ci) => {
        const wide = !!s.stag;
        const e = wide ? div('abs', el, c, `left:840px;top:${400 + ci * 150}px;width:900px;padding:26px 36px;border-radius:30px;background:rgba(255,255,255,.2);border:2px solid rgba(255,255,255,.55);font-size:42px;font-weight:800;letter-spacing:-.01em;box-sizing:border-box;line-height:1.15`) : div('abs', el, c, `left:${840 + ci * 215}px;top:520px;padding:16px 34px;border-radius:999px;background:#fff;color:${s.bg};font-size:34px;font-weight:800`);
        return { e, a: wide ? s.stag[ci] : s.a + 1.8 + ci * 0.5 };
      });
    }
    if (i === 1) o.img = card(el, P0, { x: 1180, y: 620, w: 620, h: 390, a: 3.4, b: 7.0, radius: 20, border: '6px solid #fff', shadow: '0 20px 50px rgba(0,0,0,.25)', media: { src: 'assets/img/img_infografis_sila.jpg', fit: 'contain' }, cap: '', dx: 60, cam: [1.0, 1.05], bg: '#fff' });
    if (i === 3) o.img = card(el, P0, { x: 1300, y: 710, w: 500, h: 310, a: 19.0, b: 21.8, radius: 20, border: '6px solid #fff', shadow: '0 20px 50px rgba(0,0,0,.25)', media: { src: 'assets/img/img_buku_pmp2.jpg' }, cap: '', dx: 60, cam: [1.0, 1.08] });
    if (i === 2) {
      o.lines = [['Bukan di lima silanya.', 7.2, 9.7, 270], ['Bukan juga di nilai-nilainya.', 9.9, 11.8, 520], ['Di siapa yang memegang ~tafsir.~', 11.9, 14.9, 790]].map(([tx, a, st, y], k) => {
        const kk = kin(el, tx, { x: 200, y, w: 1600, size: 118, color: '#fff', acc: { tilde: '#ffd36b' } });
        const strike = div('abs', el, '', `left:200px;top:${y - 4}px;height:8px;border-radius:4px;background:#fff;width:${k === 0 ? 1040 : 1330}px;transform-origin:0 50%;transform:scaleX(0)`);
        return { kk, a, st, k, strike, y };
      });
      o.und = div('abs', el, '', `left:200px;top:900px;width:560px;height:8px;border-radius:4px;background:#ffd36b;transform-origin:0 50%`);
    }
    if (i === 4) {
      const ms = sv('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, el);
      const roads = [['M980,330 L1820,330'], ['M980,520 L1820,520'], ['M980,710 L1820,710'], ['M1120,210 L1120,830'], ['M1380,210 L1380,830'], ['M1640,210 L1640,830'], ['M980,210 L1820,830']].map((d, ri) => sv('path', { d: d[0], fill: 'none', stroke: '#c9ccd6', 'stroke-width': ri === 6 ? 10 : 18, 'stroke-linecap': 'round', pathLength: 1 }, ms));
      roads.forEach(r => { r.style.strokeDasharray = '1'; });
      const labels = [['Jl. Hafalan', 1010, 305], ['Jl. Pedoman', 1010, 495], ['Jl. Penataran', 1010, 685], ['Jl. Tafsir', 1135, 250]].map(([tx, x, y]) => div('abs', el, tx, `left:${x}px;top:${y}px;font-size:24px;font-weight:800;letter-spacing:.06em;color:#6b7080;text-transform:uppercase`));
      const foot = [0, 1, 2, 3, 4].map(k => sv('ellipse', { cx: 1660 - k * 70, cy: 940 - k * 8, rx: 16, ry: 26, fill: 'rgba(20,35,74,.18)', transform: `rotate(${k % 2 ? 10 : -10} ${1660 - k * 70} ${940 - k * 8})` }, ms));
      const dotA = sv('circle', { cx: 1020, cy: 330, r: 20, fill: AMBER }, ms), dotB = sv('circle', { cx: 1640, cy: 710, r: 20, fill: '#2f55c8' }, ms);
      const gap = sv('line', { x1: 1020, y1: 330, x2: 1640, y2: 710, stroke: AMBER, 'stroke-width': 6, 'stroke-dasharray': '2 14', 'stroke-linecap': 'round' }, ms);
      const gapLab = div('abs', el, 'jarak penghayatan', `left:1180px;top:455px;font-family:Serif;font-style:italic;font-size:70px;color:${INK};background:#f7f5ef;padding:0 18px;transform:rotate(30deg);transform-origin:0 50%`);
      const sq = [div('abs', el, '', `left:980px;top:190px;width:0;height:660px;background:${INK};opacity:0`), div('abs', el, '', `left:1820px;top:190px;width:0;height:660px;background:${INK};opacity:0`)];
      o.map = { roads, labels, foot, dotA, dotB, gap, gapLab, sq };
      o.txt = [['Hafal sebuah ~peta~\nkota.', 21.9, 26.4], ['Tahu semua nama jalan,\ntapi belum pernah\n~berjalan~ di sana.', 26.7, 32.5], ['Satu peta dianggap\npaling benar:\n~ruang beda pendapat~\n~menyempit.~', 32.8, 37.7], ['~jarak penghayatan.~', 38.0, 43.6]].map(([tx, a, b]) => ({ k: kin(el, tx, { x: M + 40, y: 540, w: 800, size: tx.startsWith('~jarak') ? 120 : 84, color: '#111', acc: { tilde: '#2f55c8' } }), a, b }));
    }
    cue(P0 + s.a + 0.1, i ? 'whoosh' : 'soft', 0.9); (o.ch || []).forEach(c => cue(P0 + c.a, 'pop', 0.9));
    return o;
  });
  [7.4, 10.0, 12.2].forEach(t => cue(P0 + t, 'tick', 1)); [22.4, 26.9, 33.0, 38.2].forEach(t => cue(P0 + t, 'pop', 0.9));
  return t => {
    const lt = t - P0;
    L.forEach(o => {
      const { s, el } = o, nxt = o.i < 4 ? S[o.i + 1].a : 99;
      const on = lt >= s.a - 0.01 && lt < (o.i === 4 ? 99 : nxt + 0.75); el.style.display = on ? '' : 'none'; if (!on) return;
      const rk = o.i === 0 ? 1 : E.inOutCubic(prog(lt, s.a, 0.8));
      el.style.clipPath = `circle(${(rk * 2300).toFixed(0)}px at ${o.i === 4 ? '960px 540px' : CXs + 'px ' + CYs + 'px'})`;
      const out = nxt;
      if (o.circ) { const k = ph(lt, s.a + 0.2, 0.9, E.outBack); o.circ.style.transform = `scale(${k.toFixed(3)}) rotate(${((1 - k) * -25).toFixed(1)}deg)`; }
      if (o.tt) o.tt.update(lt, s.a + 0.3, out - 0.2); if (o.sb) place(o.sb, lt, s.a + 0.7, out);
      (o.ch || []).forEach(c => place(c.e, lt, c.a, out, { dx: 60, dy: 0 })); if (o.img) o.img(lt);
      if (o.lines) {
        o.lines.forEach(l => { l.kk.update(lt, l.a, out - 0.1); const sk = ph(lt, l.st - (l.k === 2 ? 99 : 0), 0.5, E.inOutCubic); l.strike.style.transform = `scaleX(${l.k === 2 ? 0 : sk.toFixed(3)})`; l.strike.style.opacity = fade(lt, out - 0.1); if (l.k < 2) l.kk.box.style.opacity = (1 - 0.55 * sk).toFixed(3); });
        o.und.style.transform = `scaleX(${ph(lt, 13.2, 0.8).toFixed(3)})`; o.und.style.opacity = fade(lt, out - 0.1);
      }
      if (o.map) {
        const m = o.map, u = lt - 21.8;
        m.roads.forEach((r, ri) => { r.style.strokeDashoffset = (1 - ph(lt, 22.0 + ri * 0.25, 1.2, E.inOutCubic)).toFixed(3); r.setAttribute('stroke', lt > 33.5 && ri !== 0 && ri !== 5 ? '#e6e7ee' : '#c9ccd6'); });
        m.labels.forEach((l, li) => { l.style.opacity = (ph(lt, 24 + li * 0.4, 0.8) * (lt > 33.2 ? 0.3 : 1)).toFixed(3); });
        m.foot.forEach((f, fi) => { f.style.opacity = (ph(lt, 29.5 + fi * 0.35, 0.5) * (lt > 33.2 ? 0 : 1)).toFixed(3); });
        m.sq.forEach((q, qi) => { const k = ph(lt, 33.2, 3.2, E.inOutCubic), wd = lerp(0, 330, k) * (lt > 37.8 ? 1 - ph(lt, 37.8, 0.6) : 1); q.style.opacity = (0.92 * clamp(k * 3)).toFixed(3); q.style.width = wd.toFixed(0) + 'px'; q.style.left = (qi ? 1820 - wd : 980).toFixed(0) + 'px'; });
        const dk = ph(lt, 38.0, 0.8); m.dotA.setAttribute('r', (20 * dk).toFixed(1)); m.dotB.setAttribute('r', (20 * dk).toFixed(1)); m.gap.style.opacity = dk.toFixed(3); m.gapLab.style.opacity = ph(lt, 38.6, 0.8).toFixed(3);
        o.txt.forEach(tx => tx.k.update(lt, tx.a, tx.b - 0.3));
      }
    });
  };
});

// ============================================================ P5 · HUD BLUE (video frame + callouts)
Part(B[3], B[4], (root, P0) => {
  root.style.background = 'linear-gradient(180deg,#040a18 0%,#08173a 55%,#050b1a 100%)';
  const gl = sv('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, root);
  const defs = sv('defs', {}, gl); const rg = sv('radialGradient', { id: 'g5' }, defs); sv('stop', { offset: 0, 'stop-color': '#3a7bff', 'stop-opacity': 0.5 }, rg); sv('stop', { offset: 1, 'stop-color': '#3a7bff', 'stop-opacity': 0 }, rg);
  sv('circle', { cx: 1330, cy: 560, r: 540, fill: 'url(#g5)' }, gl);
  brackets(root, 'rgba(120,180,255,.5)');
  hudLabel(root, 'Bagian 04 · Setelah 1998', `left:${M}px;top:78px`, 'rgba(150,200,255,.7)');
  const tr = hudLabel(root, '', `right:${M}px;top:78px;text-align:right;font-variant-numeric:tabular-nums`, 'rgba(150,200,255,.7)');
  const svg = sv('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, root);
  const GX = 1360, GY = 440, GR = 210, globe = sv('g', {}, svg);
  const core = sv('circle', { cx: GX, cy: GY, r: GR, fill: 'rgba(30,80,170,.14)', stroke: 'rgba(159,210,255,.55)', 'stroke-width': 2 }, globe);
  const lats = [-60, -30, 0, 30, 60].map(() => sv('ellipse', { cx: GX, fill: 'none', stroke: 'rgba(159,210,255,.3)', 'stroke-width': 1.3 }, globe));
  const lons = [0, 1, 2, 3, 4, 5].map(() => sv('ellipse', { cx: GX, cy: GY, ry: GR, fill: 'none', stroke: 'rgba(159,210,255,.3)', 'stroke-width': 1.3 }, globe));
  const steps = [
    { a: 0.5, tag: '01', lab: 'Reformasi 1998', sub: '' }, { a: 2.0, tag: '02', lab: 'P4 dicabut', sub: 'Tap MPR XVIII/MPR/1998' },
    { a: 4.9, tag: '03', lab: 'BP7 dibubarkan', sub: 'Tahun 1999' }, { a: 9.0, tag: '04', lab: 'Pancasila tetap\ndasar negara', sub: '', hi: true },
  ].map((s, i) => {
    const y = 260 + i * 190;
    const el = div('abs', root, `<div style="font-size:20px;font-weight:800;letter-spacing:.18em;color:${s.hi ? AMBER : '#7fc4ff'}">${s.tag}</div><div style="font-size:54px;font-weight:800;letter-spacing:-.01em;line-height:1.05;margin-top:4px;white-space:pre-line;color:#fff">${s.lab}</div>${s.sub ? `<div style="font-size:26px;font-weight:500;opacity:.65;margin-top:6px;color:#fff">${s.sub}</div>` : ''}`, `left:${M}px;top:${y}px;width:640px`);
    const bar = div('abs', root, '', `left:${M - 30}px;top:${y + 4}px;width:6px;height:96px;border-radius:3px;background:${s.hi ? AMBER : '#7fc4ff'};transform-origin:50% 0`);
    cue(P0 + s.a, 'pop', 1); return { s, el, bar };
  });
  const FX = 940, FY = 170, FW = 840, FH = 560;
  const clips = [
    { a: 0.2, b: 4.7, media: { clip: 'ref_march' }, tag: 'Mei 1998', cap: 'Aksi mahasiswa menuntut reformasi' },
    { a: 4.7, b: 8.8, media: { clip: 'ref_dome' }, tag: 'Gedung DPR/MPR', cap: 'Mahasiswa di gedung DPR/MPR' },
    { a: 8.8, b: 12.9, media: { clip: 'ref_aerial' }, tag: 'Gedung DPR/MPR', cap: 'Lautan massa di halaman gedung MPR' },
    { a: 12.9, b: 16.0, media: { src: 'assets/img/img_garuda_bendera.jpg' }, tag: 'Dasar negara', cap: 'Garuda Pancasila' },
  ].map(c => card(root, P0, { x: FX, y: FY, w: FW, h: FH, a: c.a, b: c.b, radius: 0, border: '2px solid rgba(127,196,255,.5)', shadow: 'none', bg: '#07122b', tag: c.tag, tagCol: 'rgba(5,12,30,.88)', tagTxt: AMBER, cap: c.cap, capColor: 'rgba(255,255,255,.85)', media: c.media, cam: [1.04, 1.14], dx: 60 }));
  cue(P0 + 9.1, 'pop', 1.3);
  return t => {
    const lt = t - P0; tr.textContent = `T+00:${pad2(t)}`;
    const gk = ph(lt, 0.2, 1.2, E.outBack); globe.style.opacity = (gk * 0.8).toFixed(3);
    lats.forEach((e, i) => { const d = [-60, -30, 0, 30, 60][i] * Math.PI / 180, rx = GR * Math.cos(d); e.setAttribute('rx', rx.toFixed(2)); e.setAttribute('ry', (rx * 0.26).toFixed(2)); e.setAttribute('cy', (GY + GR * Math.sin(d)).toFixed(2)); });
    lons.forEach((e, i) => e.setAttribute('rx', (GR * Math.abs(Math.cos((i / 6) * Math.PI + lt * 0.5))).toFixed(2)));
    const amb = ph(lt, 9.0, 0.8); core.setAttribute('fill', `rgba(${Math.round(lerp(30, 224, amb * 0.55))},${Math.round(lerp(80, 161, amb * 0.55))},${Math.round(lerp(170, 0, amb * 0.55))},${(0.14 + 0.16 * amb).toFixed(3)})`);
    steps.forEach(o => { place(o.el, lt, o.s.a, 99, { dx: -50, dy: 0 }); o.bar.style.transform = `scaleY(${ph(lt, o.s.a + 0.2, 0.6).toFixed(3)})`; });
    clips.forEach(c => c(lt));
  };
});

// ============================================================ P6 · BARS (video intro, isometric bars, white question slide)
Part(B[4], B[5], (root, P0) => {
  root.style.background = 'linear-gradient(180deg,#050b1a 0%,#091a40 100%)';
  const gl = sv('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, root);
  const defs = sv('defs', {}, gl); const rg = sv('radialGradient', { id: 'g6' }, defs); sv('stop', { offset: 0, 'stop-color': '#2f6fe0', 'stop-opacity': 0.45 }, rg); sv('stop', { offset: 1, 'stop-color': '#2f6fe0', 'stop-opacity': 0 }, rg);
  sv('circle', { cx: 1350, cy: 760, r: 560, fill: 'url(#g6)' }, gl);
  brackets(root, 'rgba(120,180,255,.45)');
  hudLabel(root, 'Bagian 05 · Untuk generasi muda', `left:${M}px;top:78px`, 'rgba(150,200,255,.7)');
  const intro = kin(root, 'Untuk generasi\n~muda.~', { x: M, y: 500, w: 800, size: 150, lh: 0.98, acc: { tilde: '#9fd2ff' } });
  const svg = sv('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, root), g = sv('g', { transform: 'translate(1340,930)' }, svg), K = isoKit(60);
  const pal = { top: [30, 62, 122], left: [13, 33, 74], right: [9, 23, 55], edge: 'rgba(120,190,255,.7)', gt: [140, 215, 255], gl: [60, 130, 215], gr: [40, 100, 180] };
  const floor = K.box(g, { x: -4.6, y: -2, w: 9.2, d: 4, z0: 0, top: [14, 30, 66], left: [9, 20, 46], right: [6, 15, 36], edge: pal.edge, gtop: [30, 60, 110] });
  const items = [{ a: 4.3, t: 'Hafal ≠ hayati' }, { a: 7.2, t: 'Hidup lewat dialog,\nbukan satu tafsir' }, { a: 11.5, t: 'Diuji di keseharian:\nadil, hargai beda,\nbermusyawarah' }];
  const bars = [2.2, 3.7, 5.2].map((h, i) => { const b = K.box(g, { x: -3.6 + i * 2.6, y: -0.8, w: 1.6, d: 1.6, z0: 0.25, top: pal.top, left: pal.left, right: pal.right, edge: pal.edge, gtop: pal.gt, gleft: pal.gl, gright: pal.gr }); b.h = h; b.gx = -3.6 + i * 2.6 + 0.8; return b; });
  [...bars].sort((a, b) => a.key - b.key).forEach(b => g.appendChild(b.g));
  const nums = bars.map((b, i) => div('abs', root, `0${i + 1}`, `width:200px;text-align:center;font-size:88px;font-weight:800;letter-spacing:-.03em;color:${i === 2 ? AMBER : '#fff'};transform:translate(-50%,-50%)`));
  const rows = items.map((o, i) => { const el = div('abs', root, `<span style="color:${AMBER};font-weight:800;margin-right:22px">0${i + 1}</span><span style="white-space:pre-line">${o.t}</span>`, `left:${M}px;top:${300 + i * 230}px;width:820px;font-size:50px;font-weight:800;letter-spacing:-.01em;line-height:1.15;color:#fff`); cue(P0 + o.a, 'pop', 1); cue(P0 + o.a + 0.4, 'tick', 0.8); return { el, a: o.a }; });
  const head = kin(root, 'Tiga ~pelajaran.~', { x: M, y: 200, w: 1000, size: 100, acc: { tilde: '#9fd2ff' } });
  const FR = { x: 940, y: 150, w: 840, h: 560 };
  const f1 = card(root, P0, { ...FR, a: 0.2, b: 2.3, radius: 0, border: '2px solid rgba(127,196,255,.5)', shadow: 'none', bg: '#07122b', tag: 'Mahasiswa 1998', tagCol: 'rgba(5,12,30,.88)', tagTxt: AMBER, cap: '', media: { clip: 'ref_student' }, cam: [1.03, 1.1], dx: 60 });
  const f2 = card(root, P0, { ...FR, a: 2.3, b: 4.2, radius: 0, border: '2px solid rgba(127,196,255,.5)', shadow: 'none', bg: '#07122b', tag: 'Generasi muda', tagCol: 'rgba(5,12,30,.88)', tagTxt: AMBER, cap: '', media: { clip: 'ref_clap' }, cam: [1.03, 1.1], dx: 0 });
  const f3 = card(root, P0, { x: 1260, y: 120, w: 540, h: 340, a: 7.3, b: 11.3, radius: 0, border: '2px solid rgba(127,196,255,.5)', shadow: 'none', bg: '#07122b', tag: 'Dialog', tagCol: 'rgba(5,12,30,.88)', tagTxt: AMBER, cap: '', media: { clip: 'ref_dialog' }, cam: [1.03, 1.1], dx: 60 });
  // white question slide
  const WH = div('abs', root, '', `left:0;top:0;width:${W}px;height:${H}px;background:#f7f5ef`);
  hudLabel(WH, 'Refleksi', `left:${M}px;top:78px`, 'rgba(0,0,0,.45)');
  const q0 = kin(WH, 'Saya mau tanya\n~satu hal.~', { x: M + 40, y: 400, w: 1700, size: 140, lh: 1.0, color: '#101010', acc: { tilde: '#2f55c8' } });
  const q1 = kin(WH, 'Ketika media sosial penuh klaim\nsiapa yang paling ~Pancasilais,~\nkita sedang menghafal,\natau sedang ~menjalankan?~', { x: M + 40, y: 580, w: 1700, size: 100, lh: 1.04, color: '#101010', acc: { tilde: '#2f55c8' } });
  cue(P0 + 19.0, 'whoosh', 1); cue(P0 + 21.2, 'pop', 1.1); cue(P0 + 25.2, 'pop', 1.2);
  return t => {
    const lt = t - P0;
    intro.update(lt, 0.3, 4.0);
    const bk = items.map(o => ph(lt, o.a, 1.3, E.outCubic)), rise = ph(lt, 1.0, 1.2), BX = 1340, BY = 930;
    bars.forEach((b, i) => {
      const act = Math.exp(-Math.pow((lt - (items[i].a + 0.9)) / 0.7, 2)) * 0.9; b.set(b.h * bk[i], act);
      const p = K.P(b.gx, 0, 0.25 + b.h * bk[i] + 0.9); nums[i].style.left = (BX + p[0]) + 'px'; nums[i].style.top = (BY + p[1]) + 'px'; nums[i].style.opacity = (clamp(bk[i] * 2) * fade(lt, 18.8)).toFixed(3);
    });
    floor.set(0.25 * rise); g.style.opacity = (ph(lt, 1.0, 0.8) * fade(lt, 18.8)).toFixed(3);
    head.update(lt, 3.9, 18.8); rows.forEach(r => place(r.el, lt, r.a, 18.8, { dx: -40, dy: 0 }));
    f1(lt); f2(lt); f3(lt);
    const rk = E.inOutCubic(prog(lt, 19.0, 0.9)); WH.style.clipPath = `circle(${(rk * 1500).toFixed(0)}px at 960px 540px)`; WH.style.visibility = rk > 0.001 ? 'visible' : 'hidden';
    q0.update(lt, 19.8, 21.6); q1.update(lt, 21.8, 99, 50);
  };
});

// ============================================================ P7 · CLOSE (light isometric city complete)
Part(B[5], DUR, (root, P0) => {
  root.style.background = 'linear-gradient(160deg,#f6f8fd 0%,#e4ebf8 100%)';
  const dg = sv('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, root);
  for (let x = 60; x < W; x += 60) for (let y = 60; y < H; y += 60) sv('circle', { cx: x, cy: y, r: 1.3, fill: 'rgba(80,105,180,.16)' }, dg);
  const city = makeCity(root, 70, PAL_L), mu = 'rgba(20,35,74,.55)';
  brackets(root, 'rgba(20,35,74,.25)');
  hudLabel(root, 'Pancasila · Orde Baru', `left:${M}px;top:78px`, mu);
  const tr = hudLabel(root, '', `right:${M}px;top:78px;text-align:right;font-variant-numeric:tabular-nums`, mu);
  const q1 = kin(root, 'Pancasila hidup\nbukan karena dihafal,\ntapi karena ~dipraktikkan.~', { x: M, y: 520, w: 900, size: 78, color: INK, lh: 1.08, acc: { tilde: '#2f55c8' } });
  const q2 = kin(root, 'Itu pelajaran\ndari Orde Baru,\ndan itu ~tugas kita~\nsekarang.', { x: M, y: 520, w: 900, size: 78, color: INK, lh: 1.08, acc: { tilde: '#2f55c8' } });
  const e1 = kin(root, 'Terima\n~kasih.~', { x: M, y: 470, w: 900, size: 200, color: INK, lh: 0.98, acc: { tilde: '#2f55c8' } });
  const pill = div('abs', root, 'Sumber foto dan referensi ada di deskripsi', `left:${M}px;top:700px;padding:20px 40px;border-radius:999px;background:${INK};color:#fff;font-size:32px;font-weight:800`);
  cue(P0 + 0.3, 'soft', 1); [0.5, 1.1, 1.7, 2.3, 2.9, 3.5].forEach(t => cue(P0 + t, 'pop', 0.8)); cue(P0 + 3.7, 'swoosh', 0.9); cue(P0 + 8.2, 'pop', 1.2); cue(P0 + 9.0, 'soft', 0.8);
  return t => {
    const lt = t - P0, st = [0, 1, 2, 3, 4, 5].map(i => ph(lt, 0.4 + i * 0.6, 0.9, E.outBack));
    city.set({ slab: 1, line: 1, tw: [1, 1, 1, 1], st, glow: [] });
    city.place(1470, 640, lerp(1.0, 0.9, E.inOutCubic(prog(lt, 0, 10))));
    q1.update(lt, 0.3, 3.5); q2.update(lt, 3.8, 7.9); e1.update(lt, 8.2, 99, 50); place(pill, lt, 8.9, 99, { dy: 30 });
    tr.textContent = `T+00:${pad2(t)}`;
  };
});

// ------------------------------------------------------------ mount + wipes + progress
await Promise.all(PRELOAD.map(im => im.decode().catch(() => {})));
parts.forEach(p => { p.root = div('abs', stage, '', `left:0;top:0;width:${W}px;height:${H}px;overflow:hidden`); p.update = p.build(p.root, p.t0); p.root.style.display = 'none'; });
const wipeEls = WIPES.map(([b, c1, c2]) => ({ b, a: div('abs', stage, '', `left:0;top:0;width:${W}px;height:${H}px;background:${c1};display:none`), c: div('abs', stage, '', `left:0;top:0;width:${W}px;height:${H}px;background:${c2};display:none`) }));
WIPES.forEach(([b]) => cue(b - 0.35, 'whoosh', 1.1));
const pf = div('abs', stage, '', `left:0;bottom:0;height:6px;width:0;background:linear-gradient(90deg,${TEAL},${AMBER});z-index:5`);
cues.sort((a, b) => a.t - b.t); window.__cues = cues;

function update(t) {
  for (const p of parts) { const on = t >= p.t0 && t < p.t1; p.root.style.display = on ? '' : 'none'; if (on) p.update(t); }
  for (const w of wipeEls) {
    const k = prog(t, w.b - 0.45, 0.9), on = k > 0 && k < 1;
    w.a.style.display = w.c.style.display = on ? '' : 'none';
    if (on) { w.a.style.transform = `translateX(${lerp(-W, W, E.inOutQuart(k)).toFixed(1)}px)`; w.c.style.transform = `translateX(${lerp(-W * 1.35, W * 0.65, E.inOutQuart(clamp(k))).toFixed(1)}px)`; w.c.style.zIndex = 1; w.a.style.zIndex = 2; }
  }
  pf.style.width = (clamp(t / DUR) * 100).toFixed(2) + '%';
}
window.seek = async t => {
  update(t);
  for (const v of vids) {
    const lt = t - v.abs0; if (lt < -0.1 || lt > v.dur + 0.1) continue;
    const idx = clamp(Math.floor(lt * 30 + 0.0001), 0, MAN[v.vid.clip] - 1);
    if (v.vid.cur !== idx) { v.vid.cur = idx; v.vid.src = fpath(v.vid.clip, idx); await v.vid.decode().catch(() => {}); }
  }
};
update(0);
__res();
