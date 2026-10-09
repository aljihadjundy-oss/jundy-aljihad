// Spec-tag illustration for the top zone (S6 on a drawn, brand-free device): a generic laptop or CPU chip with monospace labels
// whose arrows draw to the part they name. Everything shown comes from the transcript (b.name, b.tags[].text). Deterministic in lt.
import { E, prog, lerp, pose, h, s, place, draw } from '/rt/engine.js';

const css = (el, o) => Object.assign(el.style, o);
const MONO = '"MonoFont","DejaVu Sans Mono",Menlo,monospace';
const PARTS = { screen: [0.5, 0.3], os: [0.5, 0.36], keyboard: [0.5, 0.74], touchpad: [0.5, 0.88], cpu: [0.4, 0.66], ram: [0.62, 0.66], body: [0.8, 0.8], ssd: [0.7, 0.7],
  chip: [0.5, 0.5], core1: [0.4, 0.4], core2: [0.6, 0.6] };

export default {
  build(box, b, ctx) {
    const S = ctx.S, X0 = 40 * S, Y0 = 70 * S, W = 1000 * S, H = 560 * S;
    const root = h('div', 'abs', ctx.root); place(root, X0, Y0, W, H);
    css(root, { borderRadius: `${30 * S}px`, background: 'linear-gradient(160deg, rgba(20,16,36,.92), rgba(8,7,14,.94))', border: `${2 * S}px solid rgba(167,139,250,.35)`, overflow: 'hidden' });
    const glow = h('div', 'abs', root); place(glow, W * 0.2, -H * 0.5, W * 0.7, W * 0.7);
    css(glow, { borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,.28), rgba(0,0,0,0) 62%)' });
    const name = h('div', 'abs', root, b.name);
    place(name, 36 * S, 22 * S, W - 72 * S, 70 * S);
    css(name, { fontSize: `${(b.nameSize ?? 52) * S}px`, fontWeight: '800', letterSpacing: '-.02em', color: '#F5F3FF', whiteSpace: 'nowrap' });
    const kick = b.kicker ? h('div', 'abs', root, b.kicker) : null;
    if (kick) { place(kick, 36 * S, 4 * S, 700 * S, 24 * S); css(kick, { fontSize: `${16 * S}px`, fontWeight: '800', letterSpacing: '.2em', color: '#FB923C' }); }

    // the device, centred, drawn in an SVG of the same size
    const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H }, root); css(svg, { position: 'absolute', left: 0, top: 0, overflow: 'visible' });
    const dw = (b.kind === 'chip' ? 250 : 350) * S, dh = (b.kind === 'chip' ? 250 : 270) * S, dx = (W - dw) / 2, dy = 150 * S + (b.kind === 'chip' ? 20 * S : 0);
    const pt = ([fx, fy]) => [dx + fx * dw, dy + fy * dh];
    const strokes = [], fills = [];
    const P = (d, o = {}) => { const el = s('path', { d, pathLength: 1, fill: o.fill || 'none', stroke: o.stroke || '#C4B5FD', 'stroke-width': (o.w ?? 3) * S, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, svg); strokes.push(el); return el; };
    const R = (x, y, w, hh, r, o = {}) => P(`M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + hh - r}Q${x + w} ${y + hh} ${x + w - r} ${y + hh}H${x + r}Q${x} ${y + hh} ${x} ${y + hh - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`, o);
    if (b.kind === 'chip') {
      R(dx, dy, dw, dh, 18 * S, { fill: 'rgba(124,58,237,.14)' });
      for (let i = 1; i <= 6; i++) { const t = dx + (dw / 7) * i, u = dy + (dh / 7) * i; P(`M${t} ${dy}v${-22 * S}`, { w: 4 }); P(`M${t} ${dy + dh}v${22 * S}`, { w: 4 }); P(`M${dx} ${u}h${-22 * S}`, { w: 4 }); P(`M${dx + dw} ${u}h${22 * S}`, { w: 4 }); }
      R(dx + dw * 0.14, dy + dh * 0.14, dw * 0.34, dh * 0.72, 10 * S, { stroke: '#FB923C', fill: 'rgba(251,146,60,.2)' });
      R(dx + dw * 0.52, dy + dh * 0.14, dw * 0.34, dh * 0.72, 10 * S, { stroke: '#FB923C', fill: 'rgba(251,146,60,.2)' });
    } else {
      const sw = dw * 0.82, sh = dh * 0.66, sx = dx + (dw - sw) / 2;
      R(sx, dy, sw, sh, 16 * S, { fill: 'rgba(10,8,18,.9)', stroke: b.kind === 'thinkpad' ? '#E2E8F0' : '#C4B5FD' });
      R(sx + 12 * S, dy + 12 * S, sw - 24 * S, sh - 24 * S, 6 * S, { stroke: 'rgba(167,139,250,.5)', w: 2, fill: 'rgba(124,58,237,.12)' });
      const by = dy + sh + 4 * S;   // base: a flat trapezoid with a keyboard and a touchpad
      P(`M${dx - 14 * S} ${by + dh * 0.3}L${dx + 10 * S} ${by}H${dx + dw - 10 * S}L${dx + dw + 14 * S} ${by + dh * 0.3}Q${dx + dw / 2} ${by + dh * 0.36} ${dx - 14 * S} ${by + dh * 0.3}Z`, { fill: 'rgba(30,24,52,.9)' });
      for (let r = 0; r < 3; r++) P(`M${dx + 40 * S + r * 6 * S} ${by + 14 * S + r * 14 * S}H${dx + dw - 40 * S - r * 6 * S}`, { w: 3, stroke: 'rgba(196,181,253,.55)' });
      P(`M${dx + dw / 2 - 34 * S} ${by + dh * 0.27}h${68 * S}`, { w: 3, stroke: 'rgba(196,181,253,.55)' });
    }
    const tags = (b.tags || []).map((t, i) => {
      const side = t.side ?? (i % 2 === 0 ? 'l' : 'r'), n = (b.tags || []).filter((u, k) => k < i && (u.side ?? (k % 2 === 0 ? 'l' : 'r')) === side).length;
      const ty = (t.y ?? (200 + n * 125)) * S, tw = 290 * S, tx = side === 'l' ? 28 * S : W - tw - 28 * S;
      const el = h('div', 'abs', root); place(el, tx, ty, tw, 90 * S);
      css(el, { textAlign: side === 'l' ? 'left' : 'right', fontFamily: MONO, color: '#F5F3FF', lineHeight: '1.1' });
      el.innerHTML = `<div style="font-size:${(t.big ? 46 : 34) * S}px;font-weight:${t.big ? 800 : 600};color:${t.big ? '#FB923C' : '#F5F3FF'}">${t.text}</div>${t.sub ? `<div style="margin-top:${4 * S}px;font-size:${22 * S}px;color:#A78BFA">${t.sub}</div>` : ''}`;
      const [px, py] = pt(PARTS[t.part || 'body'] || PARTS.body), sx = side === 'l' ? tx + tw * 0.5 + 40 * S : tx + tw * 0.5 - 40 * S, sy = ty + (t.big ? 66 : 44) * S;
      const arrow = s('path', { d: `M${sx} ${sy}C${(sx + px) / 2} ${sy + 8 * S}, ${(sx + px) / 2} ${py - 6 * S}, ${px} ${py}`, pathLength: 1, fill: 'none', stroke: '#FB923C', 'stroke-width': 2.6 * S, 'stroke-linecap': 'round' }, svg);
      const dot = s('circle', { cx: px, cy: py, r: 6 * S, fill: '#FB923C' }, svg);
      ctx.cue(t.at, 'tick', { gain: 0.5 });
      return { el, arrow, dot, at: t.at };
    });
    ctx.cue(ctx.t0, 'soft', { gain: 0.5 });
    return lt => {
      const k = E.outCubic(prog(lt, ctx.t0 - 0.2, 0.5)), x = E.inCubic(prog(lt, ctx.OUT, 0.45)), vis = k * (1 - x);
      pose(root, { y: lerp(-30 * S, 0, k), o: vis });
      strokes.forEach((p, i) => draw(p, E.outCubic(prog(lt, ctx.t0 + 0.05 + i * 0.04, 0.6))));
      tags.forEach(t => {
        const a = E.outBack(prog(lt, t.at, 0.45));
        pose(t.el, { s: lerp(0.8, 1, a), o: Math.min(1, E.outCubic(prog(lt, t.at, 0.25)) * 1.2) });
        draw(t.arrow, E.outCubic(prog(lt, t.at + 0.05, 0.45)));
        t.dot.setAttribute('opacity', E.outCubic(prog(lt, t.at + 0.35, 0.15)).toFixed(2));
      });
    };
  },
};
