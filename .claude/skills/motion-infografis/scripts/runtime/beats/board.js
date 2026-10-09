import { E, prog, lerp, clamp, pose, h, s, draw, place } from '../engine.js';
import { div, appear, pop, sequence } from './util.js';

// Whiteboard-style beats (ref e: graph paper behind, the speaker as a small window at the bottom). Use with palette "graph" (or "frost" /
// "paper"), `backdrop: "grid"` and `layout.pip: { "pos": "bottom" }` so the graphic gets the whole upper area.

const MONO = '"MonoFont", "DejaVu Sans Mono", Menlo, monospace';

// mindmap — one hub, boxes above and/or below it, orthogonal connectors that draw themselves, boxes that pop in one by one.
//   { "type": "mindmap", "mode": "insert", "hub": "dentistry", "up": ["brushing", "flossing", "cavities"],
//     "down": ["mouth guards", "gums", "veneers"], "every": 0.5 }
// Children are strings or { label, at } (at = seconds from the beat start, to land on the spoken word).
export const mindmap = {
  defaults: { mode: 'insert', pos: 'center', glass: false },
  build(box, b, ctx) {
    const S = ctx.S, Wz = ctx.zone.w;
    const up = (b.up || []).map(v => (typeof v === 'string' ? { label: v } : v)), down = (b.down || []).map(v => (typeof v === 'string' ? { label: v } : v));
    const fs = (b.size ?? 36) * S, bh = fs * 2.1, gap = (b.gap ?? 150) * S, hubH = bh * 1.25;
    const rows = [up.length ? 'up' : null, 'hub', down.length ? 'down' : null].filter(Boolean);
    const Ht = (up.length ? bh + gap : 0) + hubH + (down.length ? gap + bh : 0);
    box.style.height = `${Ht}px`;
    const svg = s('svg', { width: Wz, height: Ht, viewBox: `0 0 ${Wz} ${Ht}` }, box);
    svg.style.cssText = 'position:absolute;left:0;top:0;overflow:visible';
    const yUp = 0, yHub = up.length ? bh + gap : 0, yDown = yHub + hubH + gap;
    const node = (label, cx, y, _w, hh, strong) => { // sized by its text, then centred on cx
      const el = div(box, { position: 'absolute', top: `${y}px`, height: `${hh}px`, padding: `0 ${fs * 0.6}px`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: `${strong ? fs * 1.12 : fs}px`, fontWeight: strong ? '800' : '600', background: 'var(--surface)', border: `${2.5 * S}px solid var(--ink)`, borderRadius: `${6 * S}px`, color: 'var(--ink)', whiteSpace: 'nowrap', boxShadow: `0 ${6 * S}px 0 -${2 * S}px color-mix(in srgb, var(--ink) 18%, transparent)` }, label);
      el.style.left = `${cx - el.offsetWidth / 2}px`;
      return el;
    };
    const hubEl = node(b.hub, Wz / 2, yHub, 0, hubH, true);
    const place_row = (items, y, dir) => {
      const n = items.length, cw = Math.min(Wz * 0.3, Wz / (n + 0.4));
      const xs = items.map((_, i) => (Wz / n) * (i + 0.5));
      const times = sequence(n, ctx.t0 + 0.6, ctx.OUT, b.every, items);
      return items.map((it, i) => {
        const el = node(it.label, xs[i], y, 0, bh, false);
        const yh = dir < 0 ? yHub : yHub + hubH, yc = dir < 0 ? y + bh : y, ym = (yh + yc) / 2;
        const path = s('path', { d: `M${Wz / 2} ${yh} L${Wz / 2} ${ym} L${xs[i]} ${ym} L${xs[i]} ${yc}`, pathLength: 1, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 2.5 * S, 'stroke-linejoin': 'round' }, svg);
        ctx.cue(times[i] + 0.25, 'pop', { gain: 0.5 });
        return { el, path, at: times[i] };
      });
    };
    const kids = [...(up.length ? place_row(up, yUp, -1) : []), ...(down.length ? place_row(down, yDown, 1) : [])].sort((p, q) => p.at - q.at);
    ctx.cue(ctx.t0, 'pop', { gain: 0.6 });
    return lt => {
      pop(hubEl, lt, ctx.t0, ctx.OUT, { s0: 0.7 });
      for (const k of kids) {
        draw(k.path, E.outCubic(prog(lt, k.at - 0.05, 0.45)));
        k.path.setAttribute('opacity', (Math.min(1, prog(lt, k.at - 0.05, 0.1)) * (1 - E.inCubic(prog(lt, ctx.OUT, 0.45)))).toFixed(2));
        pop(k.el, lt, k.at + 0.2, ctx.OUT, { s0: 0.7 });
      }
    };
  },
};

// calendar — a month grid whose days fill in, with optional labels and hand-drawn red circles ("30 days of content").
//   { "type": "calendar", "mode": "insert", "days": 30, "startDay": 3, "cells": { "6": "Chewing video" }, "circles": [6, 7], "circleAt": 2.4 }
// startDay: weekday of the 1st (0 = Sunday). Cells can carry a label; circles go around the listed days.
export const calendar = {
  defaults: { mode: 'insert', pos: 'center', glass: false },
  build(box, b, ctx) {
    const S = ctx.S, Wz = ctx.zone.w, n = b.days ?? 30, start = b.startDay ?? 0, cells = b.cells || {};
    const wk = b.weekdays ?? ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const cw = Wz / 7, ch = cw * (Object.keys(cells).length ? 1.0 : 0.72), headH = cw * 0.55;
    const rowsN = Math.ceil((start + n) / 7), Ht = headH + rowsN * ch;
    box.style.height = `${Ht}px`;
    const frame = div(box, { position: 'absolute', inset: '0', border: `${2.5 * S}px solid var(--ink)`, borderRadius: `${10 * S}px`, background: 'var(--surface)', overflow: 'hidden' });
    wk.forEach((d, i) => div(box, { position: 'absolute', left: `${i * cw}px`, top: '0', width: `${cw}px`, height: `${headH}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: `${cw * 0.3}px`, fontWeight: '700', color: 'color-mix(in srgb, var(--ink) 60%, transparent)' }, d));
    const svg = s('svg', { width: Wz, height: Ht, viewBox: `0 0 ${Wz} ${Ht}` }, box);
    svg.style.cssText = 'position:absolute;left:0;top:0;overflow:visible';
    for (let r = 0; r <= rowsN; r++) s('path', { d: `M0 ${headH + r * ch} L${Wz} ${headH + r * ch}`, stroke: 'color-mix(in srgb, var(--ink) 22%, transparent)', 'stroke-width': 1.5 * S }, svg);
    for (let c = 1; c < 7; c++) s('path', { d: `M${c * cw} ${headH} L${c * cw} ${Ht}`, stroke: 'color-mix(in srgb, var(--ink) 22%, transparent)', 'stroke-width': 1.5 * S }, svg);
    const days = [];
    const step = Math.min(0.06, 1.6 / n);
    for (let d = 1; d <= n; d++) {
      const i = start + d - 1, x = (i % 7) * cw, y = headH + Math.floor(i / 7) * ch, lab = cells[d];
      const el = div(box, { position: 'absolute', left: `${x}px`, top: `${y}px`, width: `${cw}px`, height: `${ch}px`, padding: `${cw * 0.08}px`, fontSize: `${cw * 0.26}px`, fontWeight: '600', lineHeight: '1.05', color: 'var(--ink)', textAlign: lab ? 'center' : 'left' },
        `<div style="text-align:left">${d}</div>${lab ? `<div style="margin-top:${cw * 0.04}px;font-weight:800;font-size:${cw * 0.2}px">${lab}</div>` : ''}`);
      days.push({ el, at: ctx.t0 + 0.2 + (d - 1) * step, d });
    }
    const circles = (b.circles || []).map((d, k) => {
      const i = start + d - 1, x = (i % 7) * cw + cw / 2, y = headH + Math.floor(i / 7) * ch + ch / 2;
      const p = s('path', { d: `M${x - cw * 0.46} ${y + 4} C${x - cw * 0.5} ${y - ch * 0.5}, ${x + cw * 0.48} ${y - ch * 0.5}, ${x + cw * 0.46} ${y} C${x + cw * 0.44} ${y + ch * 0.5}, ${x - cw * 0.46} ${y + ch * 0.52}, ${x - cw * 0.44} ${y - ch * 0.12}`, pathLength: 1, fill: 'none', stroke: 'var(--neg)', 'stroke-width': 5 * S, 'stroke-linecap': 'round' }, svg);
      return { p, at: (b.circleAt ?? 2.4) + k * 0.35 };
    });
    circles.forEach(c => ctx.cue(c.at, 'tick', { gain: 0.6 }));
    ctx.cue(ctx.t0, 'soft', { gain: 0.5 });
    return lt => {
      appear(frame, lt, ctx.t0, ctx.OUT, { dy: 30 });
      days.forEach(d => { const k = E.outCubic(prog(lt, d.at, 0.35)) * (1 - E.inCubic(prog(lt, ctx.OUT, 0.45))); d.el.style.opacity = k.toFixed(3); });
      circles.forEach(c => { draw(c.p, E.outCubic(prog(lt, c.at, 0.5))); c.p.setAttribute('opacity', (1 - E.inCubic(prog(lt, ctx.OUT, 0.45))).toFixed(2)); });
    };
  },
};
