import { E, prog, lerp, clamp, h, s, draw, place } from '../engine.js';
import { headline } from '../components.js';

// iso — a small 3D scene that builds itself, block by block (refs a and b: "Everything starts from an idea… piece by piece it
// takes shape… from one idea to a living system"). A real (tiny) 3D renderer: an orbiting camera, flat-shaded faces with back-face
// culling and painter's sorting, extruded footprints. Use palette "frost" (light) or "blueprint" (dark), or any other.
//
//   { "type": "iso", "t": 0, "dur": 14, "palette": "frost", "grid": 8, "orbit": 4,
//     "blocks": [ { "id": "base", "kind": "slab", "x": 0, "y": 0, "w": 6, "d": 6, "h": 0.3, "at": 0.4 },
//                 { "id": "core", "kind": "box",  "x": 2, "y": 2, "w": 2, "d": 2, "h": 1.6, "z0": 0.3, "at": 2, "color": "accent",
//                   "label": { "text": "01 · CORE", "sub": "the first piece", "dx": 150, "dy": -120 } },
//                 { "id": "orb", "kind": "globe", "x": 3, "y": 3, "z0": 2, "r": 0.9, "at": 4 } ],
//     "links": [ { "from": "core", "to": "orb", "at": 5 } ],
//     "camera": [ { "t": 0, "yaw": 45, "pitch": 35, "zoom": 1.15 }, { "t": 12, "yaw": 80, "pitch": 28, "zoom": 0.9 } ],
//     "hud": { "tl": "LABS — PROJECT", "tr": "SCENE 01 / 03", "progress": "BUILD PROGRESS" },
//     "caption": [ { "text": "Everything starts from an |idea|.", "at": 0.6, "until": 4 } ] }
//
// WHERE IT GOES (so it never has to hide the speaker): the beat's mode decides the region it is drawn in.
//   "mode": "split"   (default with footage) the scene fills the top half, the speaker stays full size below it
//   "behind": true    the scene fills the frame BEHIND the speaker (needs scripts/matte.py masks): the face is never covered
//   "mode": "insert"  with layout.pip at the bottom, the scene fills the area above the speaker's window
//   "mode": "full"    the whole frame (hides the speaker; keep it short)
// Grid units: x, y on the ground, z up. kinds: slab/box (x, y, w, d, h, z0), prism (x, y, r, h, z0, sides = 20 → cylinder, 6 → hex),
// pyramid (x, y, r, h, z0, sides = 4), poly (points: [[x, y], …], h, z0: any footprint, extruded), globe (x, y, z0, r).
// color: soft (surface, default) · ink · accent · accent2 · glass (outline only). Times (at, until) are seconds from the beat start.
const FILL = { soft: 'var(--surface)', ink: 'var(--ink)', accent: 'var(--accent)', accent2: 'var(--accent2)', glass: 'transparent' };
const mix = (c, pct) => `color-mix(in srgb, ${c} ${pct.toFixed(1)}%, black)`;
const STROKE = 'color-mix(in srgb, var(--accent) 50%, transparent)';
const DEG = Math.PI / 180;
const LIGHT = (() => { const l = [0.35, 0.6, 1], n = Math.hypot(...l); return l.map(v => v / n); })();
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const norm = v => { const l = Math.hypot(...v) || 1; return v.map(x => x / l); };
const ease = E.inOutCubic;

// faces of a solid at growth g (0..1) → [{ pts: [[x,y,z]…] }], normals are computed outward from the solid's centre
function facesOf(bk, g) {
  const z0 = bk.z0, hh = bk.h * g, zt = z0 + hh;
  let ring, sidesN = 0;
  if (bk.kind === 'prism' || bk.kind === 'pyramid') {
    const n = bk.sides ?? (bk.kind === 'pyramid' ? 4 : 20), r = bk.r ?? (bk.w ?? 1) / 2;
    ring = Array.from({ length: n }, (_, i) => [bk.x + r * Math.cos((i / n) * Math.PI * 2 + (bk.kind === 'pyramid' ? Math.PI / 4 : 0)), bk.y + r * Math.sin((i / n) * Math.PI * 2 + (bk.kind === 'pyramid' ? Math.PI / 4 : 0))]);
  } else if (bk.kind === 'poly') ring = bk.points;
  else ring = [[bk.x, bk.y], [bk.x + bk.w, bk.y], [bk.x + bk.w, bk.y + bk.d], [bk.x, bk.y + bk.d]];
  const n = ring.length, apex = bk.kind === 'pyramid' ? [bk.x, bk.y, zt] : null;
  const faces = [];
  for (let i = 0; i < n; i++) {
    const a = ring[i], b = ring[(i + 1) % n];
    faces.push({ pts: apex ? [[a[0], a[1], z0], [b[0], b[1], z0], apex] : [[a[0], a[1], z0], [b[0], b[1], z0], [b[0], b[1], zt], [a[0], a[1], zt]] });
  }
  if (!apex) faces.push({ pts: ring.map(p => [p[0], p[1], zt]) });
  faces.push({ pts: ring.map(p => [p[0], p[1], z0]) });
  const c = [ring.reduce((t, p) => t + p[0], 0) / n, ring.reduce((t, p) => t + p[1], 0) / n, (z0 + zt) / 2];
  for (const f of faces) {
    const q = f.pts, ctr = [q.reduce((t, p) => t + p[0], 0) / q.length, q.reduce((t, p) => t + p[1], 0) / q.length, q.reduce((t, p) => t + p[2], 0) / q.length];
    let nv = norm(cross(sub(q[1], q[0]), sub(q[2], q[1])));
    if (dot(nv, sub(ctr, c)) < 0) nv = nv.map(x => -x);
    f.n = nv;
  }
  return faces;
}
const nFaces = bk => (bk.kind === 'poly' ? bk.points.length : bk.kind === 'box' || bk.kind === 'slab' ? 4 : bk.sides ?? (bk.kind === 'pyramid' ? 4 : 20)) + (bk.kind === 'pyramid' ? 1 : 2);

export const iso = {
  defaults: { mode: 'split', free: true },
  build(root, b, ctx) {
    const { W, H, S } = ctx;
    // the region this scene may use, by mode
    let R = { x: 0, y: 0, w: W, h: H };
    if (ctx.mode === 'split') R = { ...ctx.panel };
    else if (ctx.mode === 'insert' && ctx.pip?.bottom) R = { x: 0, y: 0, w: W, h: ctx.pip.y - 24 * S };
    const compact = R.h < 0.7 * H;
    const n = b.grid ?? 8, g0 = b.gridOrigin ?? [-1, -1];
    const auto = Math.min(0.95 * R.w / (1.732 * n), 0.74 * R.h / (n + 2.2));
    const u = (b.unit ? b.unit * W : auto) * (b.scale ?? (b.behind ? 1.55 : 1));   // behind the speaker the scene is larger so it spills out around the body
    const cx = R.x + R.w * (b.cx ?? 0.5), cy = R.y + R.h * (b.cy ?? (compact ? 0.47 : 0.4));
    const centre = b.target ?? [g0[0] + n / 2, g0[1] + n / 2, 0.6];

    // camera keys → camera at time lt
    const keys = (b.camera?.length ? b.camera : [{ t: 0 }]).map(k => ({ yaw: 45, pitch: 35.264, zoom: 1, target: centre, ...k }));
    const camAt = lt => {
      let a = keys[0], c = keys[0], k = 0;
      for (let i = 0; i < keys.length; i++) if (lt >= keys[i].t) { a = keys[i]; c = keys[Math.min(i + 1, keys.length - 1)]; }
      if (c !== a) k = ease(prog(lt, a.t, c.t - a.t));
      return { yaw: (lerp(a.yaw, c.yaw, k) + (b.orbit ?? 0) * lt) * DEG, pitch: lerp(a.pitch, c.pitch, k) * DEG, zoom: lerp(a.zoom, c.zoom, k),
        target: a.target.map((v, i) => lerp(v, c.target[i], k)) };
    };
    let cam = camAt(0);
    const setCam = lt => { cam = camAt(lt); cam.cy = Math.cos(cam.yaw); cam.sy = Math.sin(cam.yaw); cam.cp = Math.cos(cam.pitch); cam.sp = Math.sin(cam.pitch);
      cam.view = [cam.cp * cam.sy, cam.cp * cam.cy, cam.sp]; };
    const K = 1.2247 * u;                    // true isometric keeps the old look: 0.866 u across, 0.5 u down per grid step
    const P = (x, y, z) => {
      const dx = x - cam.target[0], dy = y - cam.target[1], dz = z - cam.target[2];
      const xr = dx * cam.cy - dy * cam.sy, yr = dx * cam.sy + dy * cam.cy;
      const k = K * cam.zoom;
      return [cx + xr * k, cy + (yr * cam.sp - dz * cam.cp * 0.95) * k, yr * cam.cp + dz * cam.sp];   // [sx, sy, depth]
    };
    const pts = a => a.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

    const scene = h('div', 'abs', root);
    place(scene, 0, 0, W, H);
    const svg = s('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, scene);
    svg.style.cssText = 'position:absolute;left:0;top:0;overflow:visible';
    if (R.h < H - 1) { // clip the scene to its region so it never spills over the speaker
      const cid = `isoclip${ctx.beatT}`.replace(/\./g, '_');
      const defs = s('defs', {}, svg), cp = s('clipPath', { id: cid }, defs);
      s('rect', { x: R.x, y: R.y, width: R.w, height: R.h }, cp);
      svg.setAttribute('clip-path', `url(#${cid})`);
    }

    // ground grid
    const gridLines = [];
    for (let i = 0; i <= n; i++) for (const dir of [0, 1]) gridLines.push({ dir, i, p: s('path', { pathLength: 1, fill: 'none', stroke: 'color-mix(in srgb, var(--accent) 22%, transparent)', 'stroke-width': 1.5 * S }, svg) });
    const gridD = (dir, i) => { const a = dir ? P(g0[0], g0[1] + i, 0) : P(g0[0] + i, g0[1], 0), c = dir ? P(g0[0] + n, g0[1] + i, 0) : P(g0[0] + i, g0[1] + n, 0); return `M${a[0].toFixed(1)} ${a[1].toFixed(1)} L${c[0].toFixed(1)} ${c[1].toFixed(1)}`; };

    // solids
    const blocks = (b.blocks || []).map((bk, i) => {
      const o = { z0: 0, w: 1, d: 1, h: 1, kind: 'box', color: 'soft', at: 0.4 + i * 0.5, ...bk, i };
      if (o.kind === 'cyl') { o.kind = 'prism'; o.r = o.w / 2; o.x += o.r; o.y += o.r; o.sides = o.sides ?? 24; } // v1 name for a cylinder (x, y = corner, w = diameter)
      return o;
    });
    const byId = {};
    const labelLayer = h('div', 'abs', scene);
    place(labelLayer, 0, 0, W, H);
    const lsvg = s('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, scene);
    lsvg.style.cssText = 'position:absolute;left:0;top:0;overflow:visible;pointer-events:none';
    const solidLayer = s('g', {}, svg);
    for (const bk of blocks) {
      if (bk.kind === 'slab') bk.kind = 'box';
      bk.g = s('g', {}, solidLayer);
      const base = FILL[bk.color] ?? bk.color;
      bk.base = base;
      if (bk.kind === 'globe') {
        const mk = () => s('polyline', { fill: 'none', 'stroke-width': 1.7 * S, 'stroke-linejoin': 'round' }, bk.g);
        bk.wire = [...Array(3)].map(() => ({ el: mk(), strong: false })).concat([...Array(4)].map(() => ({ el: mk(), strong: false })));
        bk.rim = s('circle', { fill: 'none', stroke: 'color-mix(in srgb, var(--ink) 70%, transparent)', 'stroke-width': 2 * S }, bk.g);
      } else {
        bk.polys = [...Array(nFaces(bk))].map(() => s('polygon', { 'stroke-width': 1.5 * S, 'stroke-linejoin': 'round', stroke: STROKE }, bk.g));
      }
      if (bk.id) byId[bk.id] = bk;
      if (bk.label) {
        const L = typeof bk.label === 'string' ? { text: bk.label } : bk.label;
        bk.L = { ...L, at: L.at ?? bk.at + 0.9 };
        bk.L.line = s('path', { fill: 'none', stroke: 'var(--ink)', 'stroke-width': 1.6 * S, pathLength: 1, opacity: 0.7 }, lsvg);
        bk.L.dot = s('circle', { r: 4.5 * S, fill: 'var(--accent)' }, lsvg);
        const el = h('div', 'abs mono', labelLayer, `<div style="font-weight:700;letter-spacing:.06em;font-size:${24 * S}px">${L.text}</div>${L.sub ? `<div style="opacity:.62;font-size:${19 * S}px;margin-top:${4 * S}px;letter-spacing:.02em">${L.sub}</div>` : ''}`);
        Object.assign(el.style, { padding: `${9 * S}px ${14 * S}px`, background: 'var(--glass)', border: '1.5px solid color-mix(in srgb, var(--ink) 30%, transparent)', borderRadius: `${4 * S}px`, whiteSpace: 'nowrap', color: 'var(--ink)', boxShadow: '0 12px 30px -16px rgba(0,0,0,.45)' });
        bk.L.el = el;
      }
    }
    const topOf = bk => bk.kind === 'globe' ? P(bk.x, bk.y, bk.z0 + bk.r * 2) : bk.kind === 'poly'
      ? P(bk.points.reduce((t, p) => t + p[0], 0) / bk.points.length, bk.points.reduce((t, p) => t + p[1], 0) / bk.points.length, bk.z0 + bk.h)
      : bk.kind === 'prism' || bk.kind === 'pyramid' ? P(bk.x, bk.y, bk.z0 + bk.h) : P(bk.x + bk.w / 2, bk.y + bk.d / 2, bk.z0 + bk.h);

    const links = (b.links || []).map(l => {
      const path = s('path', { fill: 'none', stroke: 'var(--accent)', 'stroke-width': 2 * S, 'stroke-dasharray': `${7 * S} ${9 * S}`, opacity: 0 }, lsvg);
      const d = s('circle', { r: 6 * S, fill: 'var(--accent2)', opacity: 0 }, lsvg);
      return { ...l, path, dot: d, at: l.at ?? 3 };
    });

    // HUD: corner marks, tiny labels, progress counter — inside the region
    const hud = b.hud ?? {};
    const mk = (x, y, dx, dy) => s('path', { d: `M${x} ${y + dy * 34 * S} L${x} ${y} L${x + dx * 34 * S} ${y}`, pathLength: 1, fill: 'none', stroke: 'color-mix(in srgb, var(--ink) 45%, transparent)', 'stroke-width': 2 * S }, svg);
    const inn = 38 * S;
    const marks = hud === false ? [] : [mk(R.x + inn, R.y + inn, 1, 1), mk(R.x + R.w - inn, R.y + inn, -1, 1), mk(R.x + inn, R.y + R.h - inn, 1, -1), mk(R.x + R.w - inn, R.y + R.h - inn, -1, -1)];
    const tiny = (txt, x, y, right) => { const el = h('div', 'abs mono', root, txt); Object.assign(el.style, { left: `${x}px`, top: `${y}px`, fontSize: `${21 * S}px`, letterSpacing: '.12em', textTransform: 'uppercase', color: 'color-mix(in srgb, var(--ink) 62%, transparent)', whiteSpace: 'nowrap', transform: right ? 'translateX(-100%)' : 'none' }); return el; };
    const tl = hud.tl ? tiny(hud.tl, R.x + inn + 14 * S, R.y + inn + 12 * S) : null;
    const tr = hud.tr ? tiny(hud.tr, R.x + R.w - inn - 14 * S, R.y + inn + 12 * S, true) : null;
    let cnt = null, cntBar = null;
    if (hud.progress) {
      cnt = h('div', 'abs mono', root, '');
      Object.assign(cnt.style, { right: `${W - (R.x + R.w) + inn + 14 * S}px`, top: `${R.y + R.h - inn - 14 * S - 72 * S}px`, textAlign: 'right', color: 'var(--ink)' });
      const bar = h('div', 'abs', root); place(bar, R.x + R.w - inn - 14 * S - 190 * S, R.y + R.h - inn - 14 * S + 8 * S, 190 * S, 3 * S);
      bar.style.background = 'color-mix(in srgb, var(--ink) 18%, transparent)';
      cntBar = h('i', 'abs', bar); Object.assign(cntBar.style, { inset: '0', background: 'var(--accent)', transformOrigin: '0 50%' });
    }

    // captions with |serif accent| words
    const capY = R.y + R.h * (b.captionY ?? (compact ? 0.8 : 0.71));
    const caps = (b.caption || []).map(c => ({ ...c, hl: headline(root, c.text, { x: ctx.m, y: capY, w: W - 2 * ctx.m, size: (b.captionSize ?? (compact ? 46 : 54)) * S, weight: 700, lh: 1.12 }), until: c.until ?? c.at + 3.2 }));

    ctx.cue(0.2, 'soft', { gain: 0.5 });
    blocks.forEach(bk => ctx.cue(bk.at + 0.25, 'pop', { gain: 0.45 }));
    links.forEach(l => ctx.cue(l.at + 0.3, 'tick', { gain: 0.5 }));

    return lt => {
      setCam(lt);
      const vis = E.outCubic(prog(lt, 0, 0.5)) * (1 - E.inCubic(prog(lt, ctx.OUT, 0.45)));
      scene.style.opacity = vis.toFixed(3);
      gridLines.forEach((g, i) => { g.p.setAttribute('d', gridD(g.dir, g.i)); draw(g.p, E.outCubic(prog(lt, 0.1 + i * 0.03, 0.9))); });

      // sort solids: lower base first, then far to near (convex solids cull their own back faces)
      for (const bk of blocks) {
        const mid = bk.kind === 'box' ? [bk.x + bk.w / 2, bk.y + bk.d / 2] : bk.kind === 'poly' ? [bk.points.reduce((t, p) => t + p[0], 0) / bk.points.length, bk.points.reduce((t, p) => t + p[1], 0) / bk.points.length] : [bk.x, bk.y];
        bk.key = P(mid[0], mid[1], bk.kind === 'globe' ? bk.z0 + bk.r : bk.z0)[2];
      }
      const order = [...blocks].sort((p, q) => (Math.abs(p.z0 - q.z0) > 1e-3 ? p.z0 - q.z0 : p.key - q.key) || p.i - q.i);
      order.forEach(bk => solidLayer.appendChild(bk.g));

      for (const bk of blocks) {
        const g = clamp(E.outBack(prog(lt, bk.at, 0.75)), 0, 1.06), o = Math.min(1, prog(lt, bk.at, 0.25));
        bk.g.setAttribute('opacity', o.toFixed(3));
        if (bk.kind === 'globe') {
          const R3 = bk.r * Math.min(1, g), spin = lt * 0.5, ctr = [bk.x, bk.y, bk.z0 + bk.r];
          const ring = (fn, steps = 56) => pts(Array.from({ length: steps + 1 }, (_, i) => { const p = fn((i / steps) * Math.PI * 2); return P(ctr[0] + p[0], ctr[1] + p[1], ctr[2] + p[2]); }));
          [-0.55, 0, 0.55].forEach((ph, i) => { const rr = R3 * Math.cos(Math.asin(ph)); bk.wire[i].el.setAttribute('points', ring(a => [rr * Math.cos(a), rr * Math.sin(a), R3 * ph])); });
          [0, 1, 2, 3].forEach(i => { const a0 = spin + (i * Math.PI) / 4; bk.wire[3 + i].el.setAttribute('points', ring(a => [R3 * Math.cos(a) * Math.cos(a0), R3 * Math.cos(a) * Math.sin(a0), R3 * Math.sin(a)])); });
          const c0 = P(...ctr);
          bk.wire.forEach(w => { w.el.setAttribute('stroke', 'color-mix(in srgb, var(--ink) 42%, transparent)'); });
          bk.rim.setAttribute('cx', c0[0].toFixed(1)); bk.rim.setAttribute('cy', c0[1].toFixed(1)); bk.rim.setAttribute('r', (R3 * K * cam.zoom).toFixed(1));
        } else {
          const faces = facesOf(bk, g).map(f => ({ ...f, p: f.pts.map(q => P(...q)) }));
          bk.polys.forEach((pg, i) => {
            const f = faces[i];
            if (!f || dot(f.n, cam.view) <= 0.001) { pg.setAttribute('display', 'none'); return; }
            const lit = clamp(dot(f.n, LIGHT), 0, 1);
            pg.setAttribute('display', 'inline');
            pg.setAttribute('points', pts(f.p));
            pg.setAttribute('fill', bk.color === 'glass' ? 'color-mix(in srgb, var(--accent) 8%, transparent)' : mix(bk.base, clamp(45 + 55 * lit / 0.82, 0, 100)));
          });
        }
        if (bk.L) {
          const [tx, ty] = topOf(bk), L = bk.L, k = E.outCubic(prog(lt, L.at, 0.6));
          const ex = tx + (L.dx ?? 130) * S, ey = ty + (L.dy ?? -110) * S;
          L.line.setAttribute('d', `M${tx.toFixed(1)} ${ty.toFixed(1)} L${ex.toFixed(1)} ${ey.toFixed(1)}`);
          draw(L.line, k); L.dot.setAttribute('cx', tx.toFixed(1)); L.dot.setAttribute('cy', ty.toFixed(1)); L.dot.setAttribute('opacity', Math.min(1, k * 2).toFixed(2));
          const w = L.el.offsetWidth, ax = (L.dx ?? 130) >= 0 ? ex : ex - w;
          L.el.style.left = `${ax.toFixed(1)}px`; L.el.style.top = `${(ey - L.el.offsetHeight / 2).toFixed(1)}px`;
          L.el.style.opacity = E.outCubic(prog(lt, L.at + 0.35, 0.4)).toFixed(3);
        }
      }
      links.forEach(l => {
        const a = byId[l.from], c = byId[l.to]; if (!a || !c) return;
        const [x1, y1] = topOf(a), [x2, y2] = topOf(c), my = Math.min(y1, y2) - 70 * S;
        l.path.setAttribute('d', `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${((x1 + x2) / 2).toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`);
        const on = prog(lt, l.at, 0.5);
        l.path.setAttribute('opacity', on.toFixed(2));
        const len = l.path.getTotalLength(), tt = ((lt - l.at) * 0.35) % 1;
        const pt = l.path.getPointAtLength(Math.max(0, tt * len));
        l.dot.setAttribute('cx', pt.x.toFixed(1)); l.dot.setAttribute('cy', pt.y.toFixed(1)); l.dot.setAttribute('opacity', (lt > l.at + 0.2 ? Math.min(1, on) : 0).toFixed(2));
      });
      const hk = E.outCubic(prog(lt, 0.15, 0.6)) * (1 - E.inCubic(prog(lt, ctx.OUT, 0.4)));
      marks.forEach(m => { draw(m, E.outCubic(prog(lt, 0.1, 0.8))); m.setAttribute('opacity', (1 - E.inCubic(prog(lt, ctx.OUT, 0.4))).toFixed(2)); });
      [tl, tr].forEach(el => { if (el) el.style.opacity = hk.toFixed(3); });
      if (cnt) {
        const v = clamp((lt - 0.3) / Math.max(1, ctx.OUT - 0.6 - 0.3));
        const pct = String(Math.round(ease(v) * 100)).padStart(3, '0');
        cnt.innerHTML = `<div style="font-size:${19 * S}px;letter-spacing:.14em;opacity:.6">${hud.progress}</div><div style="font-size:${40 * S}px;font-weight:700;margin-top:${2 * S}px">${pct}%</div>`;
        cnt.style.opacity = hk.toFixed(3); cntBar.style.transform = `scaleX(${ease(v).toFixed(4)})`;
      }
      caps.forEach(c => c.hl.update(lt, c.at, c.until));
    };
  },
};
