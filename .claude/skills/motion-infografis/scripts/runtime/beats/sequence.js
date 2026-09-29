import { E, prog, lerp, pose, clamp, draw } from '../engine.js';
import { icon } from '../components.js';
import { div, appear, pop, sequence, text } from './util.js';

const NS = 'http://www.w3.org/2000/svg';

// checklist — items land one per beat; box + check are "written" in
export const checklist = {
  defaults: { mode: 'insert', pos: 'bottom', glass: true },
  build(box, b, ctx) {
    const S = ctx.S;
    const items = b.items || [];
    const times = sequence(items.length, ctx.t0, ctx.OUT, b.every);
    const rows = items.map((it, i) => {
      const r = div(box, { display: 'flex', gap: `${22 * S}px`, alignItems: 'flex-start', marginTop: `${(i ? 22 : 0) * S}px` });
      const bx = div(r, { flex: `0 0 ${50 * S}px`, height: `${50 * S}px` });
      bx.innerHTML = `<svg viewBox="0 0 56 56" style="width:100%;height:100%;overflow:visible">
        <rect x="2" y="2" width="52" height="52" rx="14" fill="none" stroke="currentColor" stroke-width="3.5" pathLength="1"/>
        <rect x="2" y="2" width="52" height="52" rx="14" fill="var(--pos)"/>
        <path d="M14 29l9 9 19-20" fill="none" stroke="#fff" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" pathLength="1"/></svg>`;
      const [outline, fill, check] = bx.querySelectorAll('rect, path');
      const tx = div(r, { fontSize: `${(b.size ?? 31) * S}px`, fontWeight: '700', lineHeight: '1.3', paddingTop: `${6 * S}px` }, typeof it === 'string' ? it : it.title);
      ctx.cue(times[i] + 0.4, 'tick');
      return { bx, outline, fill, check, tx, tin: times[i] };
    });
    return lt => {
      const x = E.inCubic(prog(lt, ctx.OUT, 0.45));
      rows.forEach(r => {
        pose(r.bx, { s: lerp(0.6, 1, E.outBack(prog(lt, r.tin, 0.5))), o: Math.min(1, E.outExpo(prog(lt, r.tin, 0.8)) * 2) * (1 - x) });
        draw(r.outline, E.outCubic(prog(lt, r.tin, 0.35)));
        r.fill.style.opacity = E.linear(prog(lt, r.tin + 0.35, 0.15)).toFixed(3);
        draw(r.check, E.outCubic(prog(lt, r.tin + 0.4, 0.35)));
        appear(r.tx, lt, r.tin, ctx.OUT, { dx: 50, dy: 0 });
      });
    };
  },
};

// list — numbered points with big ghost numerals ("3 hal yang…")
export const list = {
  defaults: { mode: 'insert', pos: 'bottom', glass: true },
  build(box, b, ctx) {
    const S = ctx.S;
    const items = (b.items || []).map(text);
    const times = sequence(items.length, ctx.t0, ctx.OUT, b.every);
    const rows = items.map((it, i) => {
      const r = div(box, { display: 'flex', gap: `${24 * S}px`, alignItems: 'flex-start', marginTop: `${(i ? 26 : 0) * S}px` });
      const n = div(r, { flex: `0 0 ${96 * S}px`, fontSize: `${78 * S}px`, fontWeight: '800', lineHeight: '0.9', color: 'var(--accent2)', letterSpacing: '-0.04em' }, String(i + 1).padStart(2, '0'));
      const col = div(r, {});
      const t1 = div(col, { fontSize: `${36 * S}px`, fontWeight: '800', lineHeight: '1.2' }, it.title);
      let t2 = null;
      if (it.detail) t2 = div(col, { marginTop: `${6 * S}px`, fontSize: `${26 * S}px`, fontWeight: '500', lineHeight: '1.35', color: 'var(--ink-soft)' }, it.detail);
      ctx.cue(times[i], 'pop', { gain: 0.8 });
      return { n, t1, t2, tin: times[i] };
    });
    return lt => rows.forEach(r => {
      pop(r.n, lt, r.tin, ctx.OUT, { s0: 0.5 });
      appear(r.t1, lt, r.tin + 0.08, ctx.OUT, { dx: 40, dy: 0 });
      if (r.t2) appear(r.t2, lt, r.tin + 0.2, ctx.OUT, { dx: 40, dy: 0 });
    });
  },
};

// flow — vertical process with arrows that draw themselves between nodes
export const flow = {
  defaults: { mode: 'insert', pos: 'bottom', glass: true },
  build(box, b, ctx) {
    const S = ctx.S;
    const steps = (b.steps || []).map(text);
    const times = sequence(steps.length, ctx.t0, ctx.OUT, b.every);
    const N = 76 * S;
    box.style.position = box.style.position || 'absolute';
    const svg = document.createElementNS(NS, 'svg');
    Object.assign(svg.style, { position: 'absolute', left: '0', top: '0', overflow: 'visible', pointerEvents: 'none' });
    svg.setAttribute('width', '10'); svg.setAttribute('height', '10');
    const rows = steps.map((st, i) => {
      const r = div(box, { display: 'flex', gap: `${24 * S}px`, alignItems: 'flex-start', marginTop: `${(i ? 46 : 0) * S}px` });
      const node = div(r, { flex: `0 0 ${N}px`, height: `${N}px`, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: `${30 * S}px`, fontWeight: '800', boxShadow: '0 12px 24px -12px rgba(0,0,0,.6)' }, st.icon ? icon(st.icon, 40 * S, '#fff') : String(i + 1));
      const col = div(r, { paddingTop: `${6 * S}px` });
      const t1 = div(col, { fontSize: `${36 * S}px`, fontWeight: '800', lineHeight: '1.15' }, st.label ?? st.title);
      let t2 = null;
      if (st.detail) t2 = div(col, { marginTop: `${6 * S}px`, fontSize: `${25 * S}px`, fontWeight: '500', lineHeight: '1.3', color: 'var(--ink-soft)' }, st.detail);
      ctx.cue(times[i], 'pop', { gain: 0.7 });
      return { node, t1, t2, tin: times[i] };
    });
    box.appendChild(svg);
    let arrows = null;
    const measure = () => {
      const bb = box.getBoundingClientRect();
      arrows = rows.slice(1).map((r, i) => {
        const a = rows[i].node.getBoundingClientRect(), c = r.node.getBoundingClientRect();
        const x = a.left - bb.left + a.width / 2, y1 = a.bottom - bb.top + 8 * S, y2 = c.top - bb.top - 8 * S;
        const g = document.createElementNS(NS, 'g');
        const p = document.createElementNS(NS, 'path');
        Object.entries({ d: `M${x} ${y1}V${y2}`, stroke: 'var(--accent)', 'stroke-width': 4 * S, fill: 'none', pathLength: 1, 'stroke-linecap': 'round' }).forEach(([k, v]) => p.setAttribute(k, v));
        const hd = document.createElementNS(NS, 'path');
        Object.entries({ d: `M${x - 10 * S} ${y2 - 11 * S}L${x} ${y2}L${x + 10 * S} ${y2 - 11 * S}`, stroke: 'var(--accent)', 'stroke-width': 4 * S, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }).forEach(([k, v]) => hd.setAttribute(k, v));
        g.appendChild(p); g.appendChild(hd); svg.appendChild(g);
        return { p, hd, g };
      });
    };
    return lt => {
      if (!arrows) measure();
      const x = E.inCubic(prog(lt, ctx.OUT, 0.45));
      rows.forEach((r, i) => {
        pop(r.node, lt, r.tin, ctx.OUT, { s0: 0.4 });
        appear(r.t1, lt, r.tin + 0.1, ctx.OUT, { dx: 40, dy: 0 });
        if (r.t2) appear(r.t2, lt, r.tin + 0.2, ctx.OUT, { dx: 40, dy: 0 });
      });
      arrows.forEach((a, i) => {
        const k = E.inOutCubic(prog(lt, rows[i].tin + 0.35, Math.min(0.55, (rows[i + 1].tin - rows[i].tin) * 0.8)));
        draw(a.p, k);
        a.hd.style.opacity = k >= 0.98 ? '1' : '0';
        a.g.style.opacity = (1 - x).toFixed(3);
      });
    };
  },
};

// stepper — roadmap: done → now → todo, with a progress line that fills up to "now"
export const stepper = {
  defaults: { mode: 'insert', pos: 'bottom', glass: true },
  build(box, b, ctx) {
    const S = ctx.S;
    const st = b.stages || [];
    const N = 64 * S;
    const times = sequence(st.length, ctx.t0, Math.min(ctx.OUT, ctx.t0 + 2.2), 0.3);
    const rows = st.map((x, i) => {
      const r = div(box, { display: 'flex', gap: `${24 * S}px`, alignItems: 'flex-start', marginTop: `${(i ? 30 : 0) * S}px`, position: 'relative', zIndex: '1' });
      const node = div(r, { flex: `0 0 ${N}px`, height: `${N}px`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: `${26 * S}px`, fontWeight: '800' });
      const col = div(r, {});
      const t1 = div(col, { fontSize: `${34 * S}px`, fontWeight: '800' }, x.label);
      let t2 = null;
      if (x.detail) t2 = div(col, { marginTop: `${4 * S}px`, fontSize: `${24 * S}px`, fontWeight: '500', lineHeight: '1.3', color: 'var(--ink-soft)' }, x.detail);
      return { node, t1, t2, status: x.status || 'todo', tin: times[i], i };
    });
    const nowIdx = Math.max(rows.findIndex(r => r.status === 'now'), rows.map(r => r.status).lastIndexOf('done'));
    const track = div(box, { position: 'absolute', left: `${N / 2 - 3 * S}px`, top: `${N / 2}px`, width: `${6 * S}px`, borderRadius: '3px', background: 'rgba(255,255,255,.14)', transformOrigin: '50% 0' });
    const fill = div(box, { position: 'absolute', left: `${N / 2 - 3 * S}px`, top: `${N / 2}px`, width: `${6 * S}px`, borderRadius: '3px', background: 'var(--accent)', transformOrigin: '50% 0' });
    let geo = null;
    const FILL = ctx.t0 + 1.6;
    ctx.cue(FILL, 'whoosh', { gain: 0.4 });
    rows.forEach(r => { if (r.i <= nowIdx) ctx.cue(FILL + 1.2 * (r.i / Math.max(1, nowIdx)), 'pop', { gain: 0.8 }); });
    return lt => {
      if (!geo) {
        const bb = box.getBoundingClientRect();
        const ys = rows.map(r => r.node.getBoundingClientRect().top - bb.top + N / 2);
        track.style.top = fill.style.top = `${ys[0]}px`;
        track.style.height = `${ys[ys.length - 1] - ys[0]}px`;
        fill.style.height = `${(ys[Math.max(0, nowIdx)] ?? ys[0]) - ys[0]}px`;
        geo = ys;
      }
      const x = E.inCubic(prog(lt, ctx.OUT, 0.45));
      track.style.transform = `scaleY(${E.inOutCubic(prog(lt, ctx.t0, 1.2)).toFixed(4)})`;
      track.style.opacity = fill.style.opacity = (1 - x).toFixed(3);
      const fk = E.inOutCubic(prog(lt, FILL, 1.2));
      fill.style.transform = `scaleY(${fk.toFixed(4)})`;
      rows.forEach(r => {
        const reached = r.i <= nowIdx && lt >= FILL + 1.2 * (r.i / Math.max(1, nowIdx));
        const isNow = r.status === 'now' && reached;
        Object.assign(r.node.style, {
          background: reached ? (isNow ? 'var(--accent2)' : 'var(--accent)') : 'transparent',
          border: `${4 * S}px solid ${reached ? (isNow ? 'var(--accent2)' : 'var(--accent)') : 'rgba(255,255,255,.3)'}`,
          color: reached ? 'var(--bg)' : 'var(--ink-mute)',
        });
        const html = reached && r.status === 'done' ? icon('check', 32 * S, '#fff') : String(r.i + 1);
        if (r.node.dataset.h !== html) { r.node.innerHTML = html; r.node.dataset.h = html; }
        const pulse = isNow ? 1 + 0.08 * Math.sin(lt * 5) : 1;
        pose(r.node, { s: lerp(0.4, 1, E.outBack(prog(lt, r.tin, 0.6))) * pulse, o: E.linear(prog(lt, r.tin, 0.2)) * (1 - x), y: -24 * x });
        appear(r.t1, lt, r.tin + 0.1, ctx.OUT, { dx: 40, dy: 0 });
        if (r.t2) appear(r.t2, lt, r.tin + 0.2, ctx.OUT, { dx: 40, dy: 0 });
      });
    };
  },
};
