import { E, prog, lerp, clamp, pose, h, s, draw, rng } from '../engine.js';
import { icon } from '../components.js';

const SOLID = {
  blue: ['#1D6FE8', '#FFFFFF'], black: ['#0B0B0B', '#FFFFFF'], white: ['#FFFFFF', '#0B0B0B'],
  red: ['#E5322D', '#FFFFFF'], teal: ['var(--accent)', '#FFFFFF'], amber: ['var(--accent2)', 'var(--bg)'], violet: ['var(--accent)', 'var(--bg)'], gradient: ['linear-gradient(120deg, var(--accent), var(--accent3), var(--accent2))', '#FFFFFF'],
};

// callout — a short phrase on a solid box, placed anywhere (x, y = fractions of the canvas), optionally with an arrow.
// Tutorial style: blue box over a screen for the claim that matters, black box for a plain label.
export const callout = {
  defaults: { mode: 'overlay', free: true },
  build(root, b, ctx) {
    const S = ctx.S;
    const [bgc, fg] = SOLID[b.style ?? 'blue'] ?? [b.bg ?? '#1D6FE8', b.color ?? '#FFFFFF'];
    const size = (b.size ?? 40) * S;
    const el = h('div', 'callout', root, `${b.icon ? icon(b.icon, size * 0.95, fg) : ''}<span>${b.text}</span>`);
    Object.assign(el.style, { fontSize: `${size}px`, background: b.bg ?? bgc, color: b.color ?? fg });
    const w = el.offsetWidth, hh = el.offsetHeight;
    const ax = (b.x ?? 0.5) * ctx.W, ay = (b.y ?? 0.62) * ctx.H;
    const anchor = b.anchor ?? 'center';
    const left = anchor === 'left' ? ax : anchor === 'right' ? ax - w : ax - w / 2;
    el.style.left = `${Math.round(left)}px`;
    el.style.top = `${Math.round(ay - hh / 2)}px`;
    let arrow = null;
    if (b.arrow) {
      const to = [b.arrow[0] * ctx.W, b.arrow[1] * ctx.H];
      const from = [clamp(to[0], left, left + w), clamp(to[1], ay - hh / 2, ay + hh / 2)];
      const svg = s('svg', { width: ctx.W, height: ctx.H, class: 'layer' }, root);
      const col = b.arrowColor ?? '#E5322D', sw = 6 * S;
      const ang = Math.atan2(to[1] - from[1], to[0] - from[0]), hl = 26 * S;
      const line = s('path', { d: `M${from[0]} ${from[1]}L${to[0]} ${to[1]}`, stroke: col, 'stroke-width': sw, fill: 'none', 'stroke-linecap': 'round', pathLength: 1 }, svg);
      const head = s('path', { d: `M${to[0] - hl * Math.cos(ang - 0.5)} ${to[1] - hl * Math.sin(ang - 0.5)}L${to[0]} ${to[1]}L${to[0] - hl * Math.cos(ang + 0.5)} ${to[1] - hl * Math.sin(ang + 0.5)}`,
        stroke: col, 'stroke-width': sw, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
      arrow = { svg, line, head };
    }
    const tin = b.at ?? 0.12, OUT = ctx.dur - 0.3;
    ctx.cue(tin, 'pop', { gain: 0.7 });
    return lt => {
      const k = E.outBack(prog(lt, tin, 0.32)), x = E.inCubic(prog(lt, OUT, 0.28));
      pose(el, { y: 12 * S * (1 - Math.min(1, k)), s: lerp(0.72, 1, k), r: b.rot ?? 0, o: Math.min(1, k * 2) * (1 - x) });
      if (arrow) {
        const ak = E.outCubic(prog(lt, tin + 0.15, 0.35));
        draw(arrow.line, ak);
        arrow.head.style.opacity = ak > 0.97 ? '1' : '0';
        arrow.svg.style.opacity = (1 - x).toFixed(3);
      }
    };
  },
};

// annotate — hand-drawn marks over the footage or a screen: box, ellipse, arrow, line, cross, underline, text.
// Coordinates are fractions of the canvas. Each shape draws itself on at `at` (s from beat start); `keys` moves it
// over time (manual tracking); `boil` re-jitters the strokes a few times a second so they feel drawn by hand.
export const annotate = {
  defaults: { mode: 'overlay', free: true },
  build(root, b, ctx) {
    const { W, H, S } = ctx;
    const svg = s('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}`, class: 'layer' }, root);
    const boil = b.boil ?? true, bfps = b.boilFps ?? 10, amp = (b.boilAmp ?? 2.4) * S;
    const OUT = ctx.dur - 0.25;
    const shapes = (b.shapes || []).map((sh, i) => {
      const color = sh.color ?? b.color ?? '#FF2B2B', sw = (sh.width ?? b.width ?? 6) * S;
      const at = sh.at ?? 0.1 + i * 0.25, until = sh.until ?? OUT;
      const g = s('g', {}, svg);
      let path = null, head = null, text = null;
      if (sh.kind === 'text') {
        text = s('text', { fill: color, 'font-size': (sh.size ?? 56) * S, 'font-weight': sh.weight ?? 700, 'text-anchor': sh.align ?? 'middle', 'dominant-baseline': 'middle' }, g);
        text.style.fontFamily = sh.font === 'sans' ? 'var(--font), sans-serif' : '"SerifFont", "DejaVu Serif", Georgia, serif';
        if (sh.italic) text.style.fontStyle = 'italic';
        // dark halo behind the letters so red marks stay readable on busy footage (a patterned shirt, a bright wall)
        if ((sh.halo ?? b.halo) !== false) Object.assign(text.style, { paintOrder: 'stroke', stroke: sh.haloColor ?? 'rgba(8, 6, 14, 0.62)', strokeWidth: `${(sh.size ?? 56) * S * 0.09}px`, strokeLinejoin: 'round' });
      } else {
        path = s('path', { stroke: color, 'stroke-width': sw, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1 }, g);
        if (sh.kind === 'arrow') head = s('path', { stroke: color, 'stroke-width': sw, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
      }
      ctx.cue(at, sh.kind === 'text' ? 'soft' : 'tick', { gain: 0.45 });
      return { sh, g, path, head, text, at, until, i };
    });
    // geometry at beat-local time: base fields, overridden by linearly interpolated keys [{t, x, y, w, h, ...}]
    const geo = (sh, lt) => {
      const keys = sh.keys;
      if (!keys || !keys.length) return sh;
      let a = keys[0], c = keys[0], k = 0;
      for (let j = 0; j < keys.length - 1; j++) if (lt >= keys[j].t) { a = keys[j]; c = keys[j + 1]; k = clamp((lt - a.t) / Math.max(1e-3, c.t - a.t)); }
      if (lt >= keys[keys.length - 1].t) { a = c = keys[keys.length - 1]; k = 1; }
      const out = { ...sh };
      for (const f of ['x', 'y', 'w', 'h', 'r']) if (a[f] != null && c[f] != null) out[f] = lerp(a[f], c[f], k);
      for (const f of ['from', 'to']) if (a[f] && c[f]) out[f] = [lerp(a[f][0], c[f][0], k), lerp(a[f][1], c[f][1], k)];
      return out;
    };
    return lt => {
      const bucket = boil ? Math.floor((ctx.beatT + lt) * bfps) : 0;
      for (const S0 of shapes) {
        const { sh, g, path, head, text, at, until, i } = S0;
        const vis = lt >= at && lt < until + 0.2;
        g.style.display = vis ? '' : 'none';
        if (!vis) continue;
        const r = rng(1000 + i * 7919 + bucket * 131);
        const j = () => (r() * 2 - 1) * amp;
        const q = geo(sh, lt - at);
        const X = v => v * W, Y = v => v * H;
        const fade = 1 - E.inCubic(prog(lt, until, 0.2));
        g.style.opacity = fade.toFixed(3);
        const k = E.outCubic(prog(lt, at, sh.draw ?? 0.35));
        if (text) {
          const words = sh.cycle ? sh.cycle[Math.floor(Math.max(0, lt - at) / (sh.every ?? 0.25)) % sh.cycle.length] : null;
          const content = words != null ? String(sh.text ?? '{}').replace('{}', words) : sh.text;
          if (text.textContent !== content) text.textContent = content;
          text.setAttribute('x', (X(q.x) + j()).toFixed(1));
          text.setAttribute('y', (Y(q.y) + j()).toFixed(1));
          text.setAttribute('transform', `rotate(${(q.rot ?? 0) + (boil ? (r() - 0.5) * 1.2 : 0)} ${X(q.x)} ${Y(q.y)})`);
          text.style.opacity = Math.min(1, k * 3).toFixed(3);
          continue;
        }
        let d = '';
        if (sh.kind === 'box') {
          const x0 = X(q.x), y0 = Y(q.y), x1 = X(q.x + q.w), y1 = Y(q.y + q.h), o = 6 * ctx.S;
          d = `M${x0 + j() - o} ${y0 + j()}L${x1 + j() + o} ${y0 + j()}L${x1 + j()} ${y1 + j() + o}L${x0 + j()} ${y1 + j()}L${x0 + j()} ${y0 + j() - o}`;
        } else if (sh.kind === 'ellipse' || sh.kind === 'circle') {
          const cx = X(q.x), cy = Y(q.y), rx = sh.kind === 'circle' ? X(q.r) : X(q.w) / 2, ry = sh.kind === 'circle' ? X(q.r) : Y(q.h) / 2;
          const N = 36, turns = 1.12, ph = -2.2;
          for (let n = 0; n <= N; n++) {
            const a = ph + (n / N) * Math.PI * 2 * turns, grow = 1 + 0.06 * (n / N);
            d += `${n ? 'L' : 'M'}${(cx + Math.cos(a) * rx * grow + j()).toFixed(1)} ${(cy + Math.sin(a) * ry * grow + j()).toFixed(1)}`;
          }
        } else if (sh.kind === 'arrow' || sh.kind === 'line' || sh.kind === 'underline') {
          const pts = sh.kind === 'underline' ? [[q.x, q.y], [q.x + q.w, q.y]] : sh.kind === 'arrow' ? [q.from, q.to] : (q.points || []);
          d = pts.map((p, n) => `${n ? 'L' : 'M'}${(X(p[0]) + j()).toFixed(1)} ${(Y(p[1]) + j()).toFixed(1)}`).join('');
          if (head) {
            const [fx, fy] = [X(q.from[0]), Y(q.from[1])], [tx, ty] = [X(q.to[0]), Y(q.to[1])];
            const ang = Math.atan2(ty - fy, tx - fx), hl = (sh.head ?? 30) * ctx.S;
            head.setAttribute('d', `M${tx - hl * Math.cos(ang - 0.5) + j()} ${ty - hl * Math.sin(ang - 0.5) + j()}L${tx} ${ty}L${tx - hl * Math.cos(ang + 0.5) + j()} ${ty - hl * Math.sin(ang + 0.5) + j()}`);
            head.style.opacity = k > 0.95 ? '1' : '0';
          }
        } else if (sh.kind === 'cross') {
          const x0 = X(q.x), y0 = Y(q.y), x1 = X(q.x + q.w), y1 = Y(q.y + q.h);
          d = `M${x0 + j()} ${y0 + j()}L${x1 + j()} ${y1 + j()}M${x1 + j()} ${y0 + j()}L${x0 + j()} ${y1 + j()}`;
        }
        path.setAttribute('d', d);
        draw(path, k);
      }
    };
  },
};

// zoom — punch-in / push on the full-frame footage (handled by the footage layer; this beat draws nothing).
export const zoom = {
  defaults: { mode: 'overlay', free: true },
  build() { return () => {}; },
};

// transition — a short full-screen accent over a cut: "leak" (warm light leak), "flash" (white), "dip" (black).
// Centre it on the cut: t = cut − dur/2. Sits above captions and chrome.
export const transition = {
  defaults: { mode: 'overlay', free: true, onTop: true },
  build(root, b, ctx) {
    const { W, H } = ctx;
    const style = b.style ?? 'leak';
    const el = h('div', 'layer', root);
    let blobs = [];
    if (style === 'leak') {
      el.style.mixBlendMode = 'screen';
      blobs = [['#FFB14E', 1.5], ['#FF6A2B', 1.1], ['#FFF4DC', 0.9]].map(([c, sz]) => {
        const g = h('div', 'abs', el);
        Object.assign(g.style, { width: `${sz * W}px`, height: `${sz * W}px`, borderRadius: '50%', background: `radial-gradient(circle, ${c} 0%, ${c}cc 28%, rgba(0,0,0,0) 70%)` });
        return { g, sz };
      });
    } else el.style.background = style === 'dip' ? '#000' : '#fff';
    ctx.cue(0, 'whoosh', { gain: 0.5 });
    return lt => {
      const p = clamp(lt / b.dur), bell = Math.pow(Math.sin(Math.PI * p), 0.7);
      el.style.opacity = ((b.strength ?? 1) * bell).toFixed(3);
      blobs.forEach(({ g, sz }, i) => {
        const x = lerp(-0.6 * W, 0.9 * W, E.inOutCubic(p)) - (sz * W) / 2 + i * 0.18 * W;
        const y = (0.25 + 0.22 * i) * H - (sz * W) / 2;
        g.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
      });
    };
  },
};

// tag — a small monospace label with a hand-drawn curved arrow pointing at something in the shot (ref d: "Modular ↘", "handheld 15hr").
// The text types itself in, then the arrow draws. x, y = where the text starts (fractions of the canvas), `to` = [x, y] the arrow points at.
//   { "type": "tag", "t": 6, "dur": 3, "x": 0.58, "y": 0.4, "text": "Modular", "to": [0.62, 0.52], "sub": "handheld", "big": "15hr" }
// sub: tiny line above · big: larger value line · curve: -1..1 bend of the arrow · align: left (default) | right · color: css colour.
export const tag = {
  defaults: { mode: 'overlay', free: true },
  build(root, b, ctx) {
    const { W, H, S } = ctx;
    const size = (b.size ?? 38) * S, col = b.color ?? '#FFFFFF';
    const right = b.align === 'right';
    const el = h('div', 'abs mono', root);
    Object.assign(el.style, { left: `${(b.x ?? 0.5) * W}px`, top: `${(b.y ?? 0.4) * H}px`, color: col, whiteSpace: 'nowrap', lineHeight: 1.12, textShadow: '0 2px 10px rgba(0,0,0,.65), 0 0 2px rgba(0,0,0,.5)', textAlign: right ? 'right' : 'left', transform: right ? 'translateX(-100%)' : 'none' });
    const sub = b.sub ? h('div', null, el, b.sub) : null; if (sub) Object.assign(sub.style, { fontSize: `${size * 0.52}px`, opacity: 0.8, letterSpacing: '.04em', marginBottom: `${4 * S}px` });
    const main = h('div', null, el); Object.assign(main.style, { fontSize: `${size}px`, fontWeight: b.bold === false ? 400 : 700, letterSpacing: '-.01em' });
    const big = b.big ? h('div', null, el, b.big) : null; if (big) Object.assign(big.style, { fontSize: `${size * 1.5}px`, fontWeight: 700, marginTop: `${2 * S}px` });
    const chars = String(b.text ?? '');
    let arrow = null, head = null;
    if (b.to) {
      const svg = s('svg', { width: W, height: H, class: 'layer' }, root);
      const x0 = (b.x ?? 0.5) * W, y0 = (b.y ?? 0.4) * H;
      const w = (chars.length * 0.62 + 0.4) * size, hh = size * (1.2 + (b.sub ? 0.7 : 0) + (b.big ? 1.7 : 0));
      const fx = right ? x0 - w * 0.5 : x0 + w * 0.5, fy = y0 + hh + 10 * S;     // leave from under the text
      const tx = b.to[0] * W, ty = b.to[1] * H, bend = (b.curve ?? 0.35) * Math.hypot(tx - fx, ty - fy);
      const mx = (fx + tx) / 2 + (ty - fy) / Math.hypot(tx - fx, ty - fy || 1) * bend * -1, my = (fy + ty) / 2 + (tx - fx) / Math.hypot(tx - fx, ty - fy || 1) * bend;
      arrow = s('path', { d: `M${fx} ${fy} Q${mx} ${my} ${tx} ${ty}`, pathLength: 1, fill: 'none', stroke: col, 'stroke-width': 3 * S, 'stroke-linecap': 'round', style: 'filter:drop-shadow(0 2px 6px rgba(0,0,0,.6))' }, svg);
      const a = Math.atan2(ty - my, tx - mx), hl = 20 * S;
      head = s('path', { d: `M${tx - hl * Math.cos(a - 0.5)} ${ty - hl * Math.sin(a - 0.5)} L${tx} ${ty} L${tx - hl * Math.cos(a + 0.5)} ${ty - hl * Math.sin(a + 0.5)}`, pathLength: 1, fill: 'none', stroke: col, 'stroke-width': 3 * S, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', style: 'filter:drop-shadow(0 2px 6px rgba(0,0,0,.6))' }, svg);
    }
    const at = b.at ?? 0.1, cps = b.speed ?? 22, typeDur = chars.length / cps;
    ctx.cue(at, 'tick', { gain: 0.4 });
    return lt => {
      const out = E.inCubic(prog(lt, ctx.dur - 0.35, 0.3));
      const n = Math.floor(clamp((lt - at) * cps, 0, chars.length));
      main.textContent = chars.slice(0, n) + (n < chars.length && lt >= at ? '▍' : '');
      el.style.opacity = (lt >= at ? 1 - out : 0).toFixed(3);
      if (sub) sub.style.opacity = (0.8 * E.outCubic(prog(lt, at, 0.3))).toFixed(3);
      if (big) big.style.opacity = E.outCubic(prog(lt, at + typeDur * 0.6, 0.3)).toFixed(3);
      if (arrow) {
        const k = E.outCubic(prog(lt, at + typeDur + 0.05, 0.45));
        draw(arrow, k); draw(head, prog(lt, at + typeDur + 0.4, 0.2));
        arrow.setAttribute('opacity', (1 - out).toFixed(2)); head.setAttribute('opacity', (1 - out).toFixed(2));
      }
    };
  },
};

// letterbox — black bars slide in at the top and bottom of the frame, with a small line of text in the bar (ref d: "32bit float /
// internal recording"). Check that the bars do not cover the face: keep `bar` small on close-ups (default 0.11 of the height).
//   { "type": "letterbox", "t": 52, "dur": 6, "bar": 0.11, "text": "32bit float\ninternal recording", "textBottom": "" }
export const letterbox = {
  defaults: { mode: 'overlay', free: true },
  build(root, b, ctx) {
    const { W, H, S } = ctx;
    const bh = (b.bar ?? 0.11) * H;
    const mk = top => { const el = h('div', 'abs', root); Object.assign(el.style, { left: '0', width: `${W}px`, height: `${bh}px`, background: b.color ?? '#000', [top ? 'top' : 'bottom']: '0' }); return el; };
    const tb = mk(true), bb = mk(false);
    const label = (txt, top) => { if (!txt) return null; const el = h('div', 'abs mono', top ? tb : bb, String(txt).replace(/\n/g, '<br>')); Object.assign(el.style, { left: `${ctx.m}px`, top: '50%', transform: 'translateY(-50%)', color: b.textColor ?? '#fff', fontSize: `${(b.size ?? 30) * S}px`, lineHeight: 1.2, letterSpacing: '.02em' }); return el; };
    const t1 = label(b.text, true), t2 = label(b.textBottom, false);
    ctx.cue(0, 'whoosh', { gain: 0.35 });
    return lt => {
      const k = E.outCubic(prog(lt, 0, 0.4)) * (1 - E.inCubic(prog(lt, ctx.dur - 0.4, 0.35)));
      tb.style.transform = `translateY(${(-(1 - k) * bh).toFixed(1)}px)`;
      bb.style.transform = `translateY(${((1 - k) * bh).toFixed(1)}px)`;
      [t1, t2].forEach(t => { if (t) t.style.opacity = E.outCubic(prog(lt, 0.35, 0.3)).toFixed(3); });
    };
  },
};
