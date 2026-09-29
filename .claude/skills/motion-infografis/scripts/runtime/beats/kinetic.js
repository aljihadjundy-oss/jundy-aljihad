import { E, prog, lerp, pose, h } from '../engine.js';
import { icon } from '../components.js';
import { PALETTES as LIB } from '../palettes.js';

// Palettes for the collage / voice-over explainer look. "brand" uses the project colours.
// "brand" follows the project palette (locked default: jundy); the others come from the palette library.
const PALETTES = Object.fromEntries(Object.entries(LIB).map(([k, p]) => [k, { bg: p.bg, ink: p.ink, accent: p.accent2 }]));
PALETTES.brand = { bg: 'var(--bg)', ink: 'var(--ink)', accent: 'var(--accent2)' };
const norm = w => String(w).toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}]/gu, '');

// kinetic — word-by-word typography: each word lands as it is spoken and the lines build up in place.
// words: ["Master", {w: "of", size: 44, br: true}, {w: "none", style: "serif", size: 130, br: true}, ...]
//   style: bold (default) · light · serif · outline · stamp (ransom-note box) · vert (vertical)
//   br: start a new line · at: seconds from beat start (otherwise matched to transcript/words.json) · color: accent/ink/hex
// stickers: [{src | icon, at, x, y, w, rot}] cut-out images with a white paper edge that pop in and float.
export const kinetic = {
  defaults: { mode: 'full', free: true },
  build(root, b, ctx) {
    const { W, H, S } = ctx;
    const pal = { ...(PALETTES[b.palette ?? 'brand'] ?? PALETTES.brand), ...(b.bg ? { bg: b.bg } : {}), ...(b.ink ? { ink: b.ink } : {}) };
    const bgEl = h('div', 'layer', root);
    bgEl.style.background = b.bg === 'none' || (ctx.mode === 'overlay' && !b.bg) ? 'transparent' : pal.bg;
    const box = h('div', 'kin', root);
    Object.assign(box.style, { width: `${W}px`, height: `${H}px`, color: pal.ink, gap: `${(b.lineGap ?? 6) * S}px`, transform: `translateY(${(((b.y ?? 0.5) - 0.5) * H).toFixed(1)}px)` });
    box.style.setProperty('--kink', pal.ink);
    const items = (b.words || []).map(x => (typeof x === 'string' ? { w: x } : { ...x }));

    // timing: explicit `at`, else walk the transcript from the beat start and match word by word
    const tr = (ctx.words || []).filter(w => w.s >= ctx.beatT - 0.4 && w.s <= ctx.beatT + b.dur);
    let ptr = 0, last = 0.15;
    items.forEach(it => {
      if (it.at == null && tr.length) {
        const target = norm(it.w);
        for (let j = ptr; j < Math.min(tr.length, ptr + 8); j++) {
          const n = norm(tr[j].w);
          if (target && (n === target || n.startsWith(target) || target.startsWith(n))) { it.at = Math.max(0, tr[j].s - ctx.beatT - 0.03); ptr = j + 1; break; }
        }
      }
      if (it.at == null) it.at = last + (b.every ?? 0.28);
      last = it.at;
    });

    let row = null;
    const els = items.map((it, i) => {
      if (!row || it.br) { row = h('div', 'row', box); row.style.gap = `${(b.wordGap ?? 20) * S}px`; }
      const st = it.style ?? 'bold';
      const el = h('span', `kw ${st}`, row, it.w);
      const size = (it.size ?? b.size ?? 96) * S;
      const col = it.color === 'accent' ? pal.accent : it.color === 'ink' || !it.color ? pal.ink : it.color;
      Object.assign(el.style, { fontSize: `${size}px`, fontWeight: st === 'light' ? '400' : st === 'serif' ? '400' : '800', color: col });
      if (st === 'stamp') Object.assign(el.style, { background: col, color: pal.bg === 'transparent' ? '#111' : pal.bg });
      if (b.sfx !== false) ctx.cue(it.at, 'pop', { gain: 0.35 });
      return { el, it, rot: it.rot ?? (st === 'stamp' ? -3 : st === 'vert' ? 0 : 0) };
    });

    const stickers = (b.stickers || []).map((sk, i) => {
      const el = h('div', 'sticker', root);
      const w = (sk.w ?? 0.26) * W;
      if (sk.src) { const img = h('img', null, el); img.src = ctx.asset(sk.src); }
      else el.innerHTML = icon(sk.icon ?? 'star', w, pal.accent);
      Object.assign(el.style, { width: `${w}px`, left: `${(sk.x ?? 0.5) * W - w / 2}px`, top: `${(sk.y ?? 0.5) * H - w / 2}px` });
      if (b.sfx !== false) ctx.cue(sk.at ?? 0.2, 'soft', { gain: 0.5 });
      return { el, sk, i };
    });

    const exitAt = b.dur - (b.exit === 'fade' ? 0.35 : 0);
    return lt => {
      const gone = lt >= exitAt;
      const x = b.exit === 'fade' ? E.inCubic(prog(lt, exitAt, 0.35)) : gone ? 1 : 0;
      const on = lt >= 0 ? 1 : 0;
      root.style.opacity = (on * (1 - x)).toFixed(3);
      els.forEach(({ el, it, rot }) => {
        const k = prog(lt, it.at, it.pop ?? 0.14);
        const shown = lt >= it.at;
        pose(el, { s: shown ? lerp(1.22, 1, E.outCubic(k)) : 1, r: rot, o: shown ? 1 : 0 });
      });
      stickers.forEach(({ el, sk, i }) => {
        const k = E.outBack(prog(lt, sk.at ?? 0.2, 0.4));
        const float = Math.sin((lt + i) * 2.1) * 6 * S;
        pose(el, { y: float, s: lerp(0.5, 1, k), r: (sk.rot ?? 0) + (1 - Math.min(1, k)) * -10, o: Math.min(1, k * 2) });
      });
    };
  },
};
