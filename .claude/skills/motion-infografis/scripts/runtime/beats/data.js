import { E, prog, lerp, pose } from '../engine.js';
import { icon, formatNumber } from '../components.js';
import { div, appear, tone, text } from './util.js';

// stat — one big number (or up to 4 in a grid) with label and source.
// countUp:false for sensitive figures (casualties etc.): the number simply fades in, no "scoreboard" feel.
export const stat = {
  defaults: { mode: 'overlay', pos: 'bottom', glass: true },
  build(box, b, ctx) {
    const S = ctx.S;
    const items = b.items || [b];
    const many = items.length > 1;
    const grid = div(box, { display: 'grid', gridTemplateColumns: many ? '1fr 1fr' : '1fr', gap: `${28 * S}px ${24 * S}px` });
    const colW = many ? (ctx.zone.w - 24 * S) / 2 : ctx.zone.w;
    const fmtOf = it => (typeof it.value === 'number' ? formatNumber(it.value, { decimals: it.decimals ?? 0, prefix: it.prefix ?? '', suffix: it.suffix ?? '', locale: ctx.locale }) : String(it.value));
    const longest = Math.max(...items.map(it => fmtOf(it).length));
    // as big as the design wants, but never wider than its column (≈0.62 em per glyph at weight 800)
    const big = Math.min((many ? 88 : (ctx.mode === 'overlay' ? 132 : 170)) * S, colW / (0.62 * longest));
    const cells = items.map(it => {
      const c = div(grid, { minWidth: '0' });
      // final value up front so the card is measured at its real size
      const n = div(c, { fontSize: `${big}px`, fontWeight: '800', lineHeight: '1', letterSpacing: '-0.03em', whiteSpace: 'nowrap', color: tone(it.tone ?? b.tone, 'var(--accent2)') }, fmtOf(it));
      const l = div(c, { marginTop: `${10 * S}px`, fontSize: `${(many ? 26 : 34) * S}px`, fontWeight: '600', lineHeight: '1.3', color: 'var(--ink-soft)' }, it.label || '');
      return { c, n, l, it };
    });
    let src = null;
    if (b.source) src = div(box, { marginTop: `${20 * S}px`, fontSize: `${20 * S}px`, fontWeight: '600', color: 'var(--ink-mute)' }, `Sumber: ${b.source}`);
    let note = null;
    if (b.note) note = div(box, { marginTop: `${16 * S}px`, fontSize: `${25 * S}px`, fontWeight: '700', lineHeight: '1.3', padding: `${12 * S}px ${18 * S}px`, borderLeft: `${6 * S}px solid var(--accent2)`, background: 'rgba(224,161,0,.14)', borderRadius: '6px' }, b.note);
    const countUp = b.countUp !== false;
    cells.forEach((_, i) => ctx.cue(ctx.t0 + i * 0.25, countUp ? 'pop' : 'soft', { gain: countUp ? 1 : 0.5 }));
    return lt => {
      cells.forEach(({ c, n, l, it }, i) => {
        const tin = ctx.t0 + i * 0.25;
        appear(c, lt, tin, ctx.OUT, { dy: 30 });
        const fmt = { decimals: it.decimals ?? 0, prefix: it.prefix ?? '', suffix: it.suffix ?? '', locale: ctx.locale };
        if (typeof it.value === 'number') {
          const k = countUp ? E.outCubic(prog(lt, tin, 1.2)) : 1;
          n.textContent = formatNumber(lerp(it.from ?? 0, it.value, k), fmt);
        } else n.textContent = it.value;
        appear(l, lt, tin + 0.3, ctx.OUT, { dy: 14 });
      });
      if (src) appear(src, lt, ctx.t0 + 0.8, ctx.OUT, { dy: 0 });
      if (note) appear(note, lt, ctx.t0 + 0.6, ctx.OUT, { dy: 12 });
    };
  },
};

// bars — horizontal bars that grow from zero. ordinal: ['Rendah','Sedang','Tinggi'] turns the axis into word levels.
export const bars = {
  defaults: { mode: 'insert', pos: 'bottom', glass: true },
  build(box, b, ctx) {
    const S = ctx.S;
    const items = b.items || [];
    const max = b.max ?? (b.ordinal ? b.ordinal.length : Math.max(...items.map(i => i.value)));
    const W0 = ctx.zone.w;
    const valueText = it => it.display ?? (b.ordinal ? b.ordinal[Math.round(it.value) - 1] : formatNumber(it.value, { decimals: b.decimals ?? 0, suffix: b.unit ?? '', prefix: b.prefix ?? '', locale: ctx.locale }));
    // leave just enough room on the right for the longest value label
    const trackW = W0 - (Math.max(...items.map(it => String(valueText(it)).length)) * 0.62 * 26 * S + 22 * S);
    let axis = null;
    if (b.ordinal) {
      axis = div(box, { position: 'relative', height: `${34 * S}px`, marginBottom: `${6 * S}px` });
      b.ordinal.forEach((lab, i) => div(axis, { position: 'absolute', left: `${((i + 1) / b.ordinal.length) * trackW - 90 * S}px`, width: `${180 * S}px`, textAlign: 'center',
        fontSize: `${20 * S}px`, fontWeight: '700', letterSpacing: '.04em', color: 'var(--ink-mute)' }, lab));
    }
    const rows = items.map((it, i) => {
      const r = div(box, { marginTop: `${(i ? 18 : 4) * S}px` });
      const lab = div(r, { fontSize: `${27 * S}px`, fontWeight: '700', marginBottom: `${8 * S}px` }, it.label);
      const line = div(r, { position: 'relative', height: `${36 * S}px` });
      div(line, { position: 'absolute', left: '0', top: '0', width: `${trackW}px`, height: '100%', borderRadius: `${8 * S}px`, background: 'rgba(255,255,255,.08)' });
      const w = Math.max(0.02, it.value / max) * trackW;
      const hi = b.highlight === i || b.highlight === it.label;
      const fill = div(line, { position: 'absolute', left: '0', top: '0', width: `${w}px`, height: '100%', borderRadius: `${8 * S}px`, transformOrigin: '0 50%',
        background: tone(it.color ?? (hi ? 'accent2' : 'accent')) });
      const valTxt = valueText(it);
      const val = div(line, { position: 'absolute', left: `${w + 14 * S}px`, top: '0', lineHeight: `${36 * S}px`, fontSize: `${26 * S}px`, fontWeight: '800', whiteSpace: 'nowrap', color: hi ? 'var(--accent2)' : 'var(--ink)' }, valTxt);
      return { r, lab, fill, val };
    });
    let src = null;
    if (b.source) src = div(box, { marginTop: `${22 * S}px`, fontSize: `${20 * S}px`, fontWeight: '600', color: 'var(--ink-mute)' }, `Sumber: ${b.source}`);
    rows.forEach((_, i) => ctx.cue(ctx.t0 + i * 0.14, 'pop', { gain: 0.6 }));
    return lt => {
      if (axis) appear(axis, lt, ctx.t0 - 0.1, ctx.OUT, { dy: 10 });
      const x = E.inCubic(prog(lt, ctx.OUT, 0.45));
      rows.forEach(({ r, lab, fill, val }, i) => {
        const tin = ctx.t0 + i * 0.14;
        appear(lab, lt, tin, ctx.OUT, { dx: -30, dy: 0 });
        fill.style.transform = `scaleX(${E.outCubic(prog(lt, tin + 0.1, 1.1)).toFixed(4)})`;
        fill.style.opacity = (1 - x).toFixed(3);
        appear(val, lt, tin + 0.9, ctx.OUT, { dx: -16, dy: 0 });
      });
      if (src) appear(src, lt, ctx.t0 + 1.2, ctx.OUT, { dy: 0 });
    };
  },
};

// compare — two columns (wrong vs right, before vs after, myth vs fact)
export const compare = {
  defaults: { mode: 'insert', pos: 'bottom', glass: true },
  build(box, b, ctx) {
    const S = ctx.S;
    const grid = div(box, { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${22 * S}px` });
    const sides = [[b.left, b.leftTone ?? 'neg', 'x'], [b.right, b.rightTone ?? 'pos', 'check']].map(([side, tn, ic], si) => {
      const col = div(grid, { borderRadius: `${24 * S}px`, padding: `${24 * S}px`, background: 'rgba(255,255,255,.06)', border: `2px solid ${tone(tn)}` });
      const head = div(col, { display: 'inline-block', fontSize: `${24 * S}px`, fontWeight: '800', letterSpacing: '.1em', textTransform: 'uppercase', padding: `${6 * S}px ${14 * S}px`,
        borderRadius: '999px', background: tone(tn), color: 'var(--bg)', marginBottom: `${18 * S}px` }, side.title);
      const rows = (side.items || []).map(t => {
        const r = div(col, { display: 'flex', gap: `${12 * S}px`, alignItems: 'flex-start', marginTop: `${14 * S}px`, fontSize: `${26 * S}px`, fontWeight: '600', lineHeight: '1.3' });
        div(r, { marginTop: `${2 * S}px` }, icon(ic, 30 * S, tone(tn)));
        div(r, {}, t);
        return r;
      });
      return { col, head, rows, si };
    });
    const at = (si) => ctx.t0 + (si ? (b.rightAt ?? 0.9) : 0); // rightAt: seconds the right column waits
    sides.forEach(sd => ctx.cue(at(sd.si), 'pop'));
    return lt => {
      sides.forEach(({ col, head, rows, si }) => {
        const t = at(si);
        appear(col, lt, t, ctx.OUT, { dy: 50 });
        rows.forEach((r, i) => appear(r, lt, t + 0.3 + i * 0.18, ctx.OUT, { dx: -20, dy: 0 }));
      });
    };
  },
};
