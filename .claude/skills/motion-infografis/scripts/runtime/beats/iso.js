import { E, prog, lerp, clamp, pose, h, s, draw, place } from '../engine.js';
import { headline } from '../components.js';

// iso — an isometric diagram that builds itself, block by block (refs a and b: "Everything starts from an idea… piece by piece it
// takes shape… from one idea to a living system"). Works with palette "frost" (light) or "blueprint" (dark), or any other.
//
//   { "type": "iso", "t": 0, "dur": 14, "palette": "frost", "grid": 8,
//     "blocks": [ { "id": "base", "kind": "slab", "x": 0, "y": 0, "w": 6, "d": 6, "h": 0.3, "at": 0.4 },
//                 { "id": "core", "kind": "box",  "x": 2, "y": 2, "w": 2, "d": 2, "h": 1.6, "z0": 0.3, "at": 2, "color": "accent",
//                   "label": { "text": "01 · CORE", "sub": "the first piece", "dx": 150, "dy": -120 } },
//                 { "id": "orb", "kind": "globe", "x": 3, "y": 3, "z0": 2, "r": 0.9, "at": 4 } ],
//     "links": [ { "from": "core", "to": "orb", "at": 5 } ],
//     "hud": { "tl": "LABS — PROJECT", "tr": "SCENE 01 / 03", "progress": "BUILD PROGRESS" },
//     "caption": [ { "text": "Everything starts from an |idea|.", "at": 0.6, "until": 4 } ] }
//
// Grid units: x runs right-down, y runs left-down, z up. kinds: slab/box (x, y, w, d, h, z0), cyl (x, y, w, h, z0), globe (x, y, z0, r).
// color: soft (surface, default) · ink · accent · accent2 · glass (outline only). Times (at, until) are seconds from the beat start.
const MONO = '"MonoFont", "DejaVu Sans Mono", Menlo, monospace';
const FILL = { soft: 'var(--surface)', ink: 'var(--ink)', accent: 'var(--accent)', accent2: 'var(--accent2)', glass: 'transparent' };
const shade = (c, pct) => `color-mix(in srgb, ${c} ${pct}%, black)`;
const STROKE = 'color-mix(in srgb, var(--accent) 50%, transparent)';

export const iso = {
  defaults: { mode: 'full', free: true },
  build(root, b, ctx) {
    const { W, H, S } = ctx;
    const u = (b.unit ?? 0.0785) * W, A = u * 0.866, B = u * 0.5, C = u * 0.95;
    const cx = (b.cx ?? 0.5) * W, cy = (b.cy ?? 0.4) * H;
    const P = (x, y, z) => [cx + (x - y) * A, cy + (x + y) * B - z * C];
    const pts = a => a.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

    const scene = h('div', 'abs', root);
    place(scene, 0, 0, W, H);
    scene.style.transformOrigin = `${cx}px ${cy}px`;
    const svg = s('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, scene);
    svg.style.cssText = 'position:absolute;left:0;top:0;overflow:visible';

    // ground grid
    const n = b.grid ?? 8, g0 = b.gridOrigin ?? [-1, -1];
    const gridLines = [];
    for (let i = 0; i <= n; i++) {
      gridLines.push(s('path', { d: `M${P(g0[0] + i, g0[1], 0).join(' ')} L${P(g0[0] + i, g0[1] + n, 0).join(' ')}`, pathLength: 1, fill: 'none', stroke: 'color-mix(in srgb, var(--accent) 22%, transparent)', 'stroke-width': 1.5 * S }, svg));
      gridLines.push(s('path', { d: `M${P(g0[0], g0[1] + i, 0).join(' ')} L${P(g0[0] + n, g0[1] + i, 0).join(' ')}`, pathLength: 1, fill: 'none', stroke: 'color-mix(in srgb, var(--accent) 22%, transparent)', 'stroke-width': 1.5 * S }, svg));
    }

    // blocks, drawn back to front (lower z0 first, then by x + y)
    const blocks = (b.blocks || []).map((bk, i) => ({ z0: 0, w: 1, d: 1, h: 1, kind: 'box', color: 'soft', at: 0.4 + i * 0.5, ...bk, i }));
    blocks.sort((p, q) => (p.z0 - q.z0) || ((p.x + p.y) - (q.x + q.y)) || (p.i - q.i));
    const byId = {};
    const labelLayer = h('div', 'abs', scene);
    place(labelLayer, 0, 0, W, H);
    const lsvg = s('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, scene);
    lsvg.style.cssText = 'position:absolute;left:0;top:0;overflow:visible';

    for (const bk of blocks) {
      const base = FILL[bk.color] ?? bk.color;
      const faceAttrs = (pct) => ({ fill: bk.color === 'glass' ? 'color-mix(in srgb, var(--accent) 8%, transparent)' : shade(base, pct), stroke: STROKE, 'stroke-width': 1.6 * S, 'stroke-linejoin': 'round' });
      if (bk.kind === 'globe') {
        bk.parts = { circle: s('circle', { fill: 'none', stroke: 'color-mix(in srgb, var(--ink) 70%, transparent)', 'stroke-width': 2 * S }, svg), lat: [-0.55, 0, 0.55].map(() => s('ellipse', { fill: 'none', stroke: 'color-mix(in srgb, var(--ink) 40%, transparent)', 'stroke-width': 1.6 * S }, svg)),
          mer: [0, 1, 2, 3].map(() => s('ellipse', { fill: 'none', stroke: 'color-mix(in srgb, var(--ink) 40%, transparent)', 'stroke-width': 1.6 * S }, svg)) };
      } else if (bk.kind === 'cyl') {
        bk.parts = { side: s('path', faceAttrs(78), svg), top: s('ellipse', faceAttrs(100), svg) };
      } else {
        bk.parts = { left: s('polygon', faceAttrs(80), svg), right: s('polygon', faceAttrs(62), svg), top: s('polygon', faceAttrs(100), svg) };
      }
      if (bk.id) byId[bk.id] = bk;
      // label with a leader line from the top of the block
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
    const topOf = bk => bk.kind === 'globe' ? P(bk.x, bk.y, bk.z0 + bk.r * 2) : P(bk.x + (bk.w ?? 1) / 2, bk.y + (bk.d ?? bk.w ?? 1) / 2, bk.z0 + bk.h);

    // links between blocks: dashed arc with a travelling dot
    const links = (b.links || []).map(l => {
      const path = s('path', { fill: 'none', stroke: 'var(--accent)', 'stroke-width': 2 * S, 'stroke-dasharray': `${7 * S} ${9 * S}`, opacity: 0 }, lsvg);
      const dot = s('circle', { r: 6 * S, fill: 'var(--accent2)', opacity: 0 }, lsvg);
      return { ...l, path, dot, at: l.at ?? 3 };
    });

    // HUD: corner marks, tiny labels, progress counter
    const hud = b.hud ?? {};
    const mk = (x, y, dx, dy) => s('path', { d: `M${x} ${y + dy * 34 * S} L${x} ${y} L${x + dx * 34 * S} ${y}`, pathLength: 1, fill: 'none', stroke: 'color-mix(in srgb, var(--ink) 45%, transparent)', 'stroke-width': 2 * S }, svg);
    const in_ = 38 * S;
    const marks = hud === false ? [] : [mk(in_, in_, 1, 1), mk(W - in_, in_, -1, 1), mk(in_, H - in_, 1, -1), mk(W - in_, H - in_, -1, -1)];
    const tiny = (txt, x, y, align = 'left') => { const el = h('div', 'abs mono', root, txt); Object.assign(el.style, { left: `${x}px`, top: `${y}px`, fontSize: `${21 * S}px`, letterSpacing: '.12em', textTransform: 'uppercase', color: 'color-mix(in srgb, var(--ink) 62%, transparent)', whiteSpace: 'nowrap' }); if (align === 'right') el.style.transform = 'translateX(-100%)'; el.dataset.align = align; return el; };
    const tl = hud.tl ? tiny(hud.tl, in_ + 14 * S, in_ + 12 * S) : null;
    const tr = hud.tr ? tiny(hud.tr, W - in_ - 14 * S, in_ + 12 * S, 'right') : null;
    let cnt = null, cntBar = null;
    if (hud.progress) {
      cnt = h('div', 'abs mono', root, '');
      Object.assign(cnt.style, { right: `${in_ + 14 * S}px`, bottom: `${in_ + 14 * S}px`, textAlign: 'right', color: 'var(--ink)' });
      const bar = h('div', 'abs', root); place(bar, W - in_ - 14 * S - 190 * S, H - in_ - 14 * S + 8 * S, 190 * S, 3 * S);
      bar.style.background = 'color-mix(in srgb, var(--ink) 18%, transparent)';
      cntBar = h('i', 'abs', bar); Object.assign(cntBar.style, { inset: '0', background: 'var(--accent)', transformOrigin: '0 50%' });
    }

    // captions with |serif accent| words
    const caps = (b.caption || []).map(c => {
      const hl = headline(root, c.text, { x: ctx.m, y: (b.captionY ?? 0.71) * H, w: W - 2 * ctx.m, size: (b.captionSize ?? 54) * S, weight: 700, lh: 1.12 });
      return { ...c, hl, until: c.until ?? c.at + 3.2 };
    });

    ctx.cue(0.2, 'soft', { gain: 0.5 });
    blocks.forEach(bk => ctx.cue(bk.at + 0.25, 'pop', { gain: 0.45 }));
    links.forEach(l => ctx.cue(l.at + 0.3, 'tick', { gain: 0.5 }));

    return lt => {
      const vis = E.outCubic(prog(lt, 0, 0.5)) * (1 - E.inCubic(prog(lt, ctx.OUT, 0.45)));
      scene.style.opacity = vis.toFixed(3);
      const drift = lerp(1, b.drift ?? 1.07, E.inOutCubic(prog(lt, 0, ctx.dur)));
      scene.style.transform = `scale(${drift.toFixed(4)})`;
      gridLines.forEach((p, i) => { draw(p, E.outCubic(prog(lt, 0.1 + i * 0.03, 0.9))); });
      for (const bk of blocks) {
        const g = clamp(E.outBack(prog(lt, bk.at, 0.75)), 0, 1.06), o = Math.min(1, prog(lt, bk.at, 0.25));
        const hh = (bk.kind === 'globe' ? 1 : bk.h) * g;
        const { x, y, z0 } = bk;
        if (bk.kind === 'globe') {
          const R = bk.r * u * 1.0 * Math.min(1, g), [gx, gy] = P(x, y, z0 + bk.r);
          const { circle, lat, mer } = bk.parts;
          circle.setAttribute('cx', gx); circle.setAttribute('cy', gy); circle.setAttribute('r', R.toFixed(1)); circle.setAttribute('opacity', o);
          lat.forEach((e, i) => { const ph = [-0.55, 0, 0.55][i], rx = R * Math.cos(Math.asin(ph)); e.setAttribute('cx', gx); e.setAttribute('cy', (gy + R * ph).toFixed(1)); e.setAttribute('rx', rx.toFixed(1)); e.setAttribute('ry', (rx * 0.3).toFixed(1)); e.setAttribute('opacity', o); });
          mer.forEach((e, i) => { const a = lt * 0.5 + i * Math.PI / 4; e.setAttribute('cx', gx); e.setAttribute('cy', gy); e.setAttribute('rx', Math.max(0.5, R * Math.abs(Math.cos(a))).toFixed(1)); e.setAttribute('ry', R.toFixed(1)); e.setAttribute('opacity', o); });
        } else if (bk.kind === 'cyl') {
          const r = (bk.w ?? 1) / 2, [px, py] = P(x + r, y + r, z0 + hh), [bx, by] = P(x + r, y + r, z0);
          const rx = r * u * 1.2247, ry = r * u * 0.7071;
          bk.parts.top.setAttribute('cx', px); bk.parts.top.setAttribute('cy', py); bk.parts.top.setAttribute('rx', rx.toFixed(1)); bk.parts.top.setAttribute('ry', ry.toFixed(1));
          bk.parts.side.setAttribute('d', `M${(px - rx).toFixed(1)} ${py.toFixed(1)} L${(bx - rx).toFixed(1)} ${by.toFixed(1)} A${rx.toFixed(1)} ${ry.toFixed(1)} 0 0 0 ${(bx + rx).toFixed(1)} ${by.toFixed(1)} L${(px + rx).toFixed(1)} ${py.toFixed(1)} Z`);
          bk.parts.top.setAttribute('opacity', o); bk.parts.side.setAttribute('opacity', o);
        } else {
          const { w, d } = bk, zt = z0 + hh;
          bk.parts.top.setAttribute('points', pts([P(x, y, zt), P(x + w, y, zt), P(x + w, y + d, zt), P(x, y + d, zt)]));
          bk.parts.left.setAttribute('points', pts([P(x, y + d, zt), P(x + w, y + d, zt), P(x + w, y + d, z0), P(x, y + d, z0)]));
          bk.parts.right.setAttribute('points', pts([P(x + w, y, zt), P(x + w, y + d, zt), P(x + w, y + d, z0), P(x + w, y, z0)]));
          for (const k of ['top', 'left', 'right']) bk.parts[k].setAttribute('opacity', o);
        }
        if (bk.L) {
          const [tx, ty] = topOf({ ...bk, h: bk.h ?? 0 }), L = bk.L, k = E.outCubic(prog(lt, L.at, 0.6));
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
        const pct = String(Math.round(E.inOutCubic(v) * 100)).padStart(3, '0');
        cnt.innerHTML = `<div style="font-size:${19 * S}px;letter-spacing:.14em;opacity:.6">${hud.progress}</div><div style="font-size:${40 * S}px;font-weight:700;margin-top:${2 * S}px">${pct}%</div>`;
        cnt.style.opacity = hk.toFixed(3); cntBar.style.transform = `scaleX(${E.inOutCubic(v).toFixed(4)})`;
      }
      caps.forEach(c => c.hl.update(lt, c.at, c.until));
    };
  },
};
