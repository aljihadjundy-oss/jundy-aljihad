import { E, prog, h } from './engine.js';

// Word-timed captions. words: [{w, s, e}] in seconds.
// style: "karaoke" (spoken word highlighted, default) · "plain" (white bold with shadow) · "box" (white on a black box)
//        · "word" (one word at a time in a grey chip).
// when: "always" (default) · "split" (only while the footage is in split mode, e.g. when burned-in subtitles get cropped).
// In split mode the caption line moves to the seam and uses splitStyle (default "box"), left-aligned by default.
export function buildCaptions(stage, W, H, words, cfg = {}, split = null) {
  const maxWords = cfg.maxWords ?? 4, maxChars = cfg.maxChars ?? 22, gapBreak = cfg.gapBreak ?? 0.55;
  const phrases = [];
  let cur = [];
  const flush = () => { if (cur.length) phrases.push(cur); cur = []; };
  for (const w of words) {
    const chars = cur.reduce((n, x) => n + x.w.length + 1, 0) + w.w.length;
    if (cur.length && (w.s - cur[cur.length - 1].e > gapBreak || cur.length >= maxWords || chars > maxChars || /[.!?]$/.test(cur[cur.length - 1].w))) flush();
    cur.push(w);
  }
  flush();
  phrases.forEach((p, i) => {
    p.start = p[0].s - 0.05;
    const next = phrases[i + 1];
    p.end = Math.min(p[p.length - 1].e + 0.35, next ? next[0].s - 0.05 : Infinity);
  });

  const style = cfg.style ?? 'karaoke', splitStyle = cfg.splitStyle ?? 'box';
  const when = cfg.when ?? 'always';
  const size = cfg.size ?? (style === 'karaoke' ? Math.round(W * 0.052) : Math.round(W * 0.04));
  const splitSize = cfg.splitSize ?? Math.round(W * 0.037);
  const m = Math.round(W * 0.0667);
  const shade = h('div', 'layer', stage);
  shade.style.background = `linear-gradient(180deg, rgba(0,0,0,0) 58%, rgba(0,0,0,${cfg.shade ?? (style === 'karaoke' ? 0.42 : 0)}) 100%)`;
  const el = h('div', 'cap', stage);
  const line = h('span', 'cb', el);
  if (cfg.upper) el.style.textTransform = 'uppercase';
  const normalY = Math.round((cfg.y ?? 0.775) * H);
  let shown = -1, spans = [], mode = '';
  const setMode = inSplit => {
    const st = inSplit ? splitStyle : style;
    const md = `${inSplit ? 'split-' : ''}${st}`;
    if (md === mode) return;
    mode = md;
    el.className = `cap cap-${st}`;
    const fs = inSplit ? splitSize : size;
    el.style.fontSize = `${fs}px`;
    const align = inSplit ? (cfg.splitAlign ?? 'left') : (cfg.align ?? 'center');
    el.style.textAlign = align;
    el.style.padding = `0 ${align === 'center' ? Math.round(W * 0.07) : m}px`;
    // in split mode the box straddles the seam
    el.style.top = `${inSplit ? Math.round(split.seam - fs * 0.72) : normalY}px`;
  };
  return {
    phrases,
    update(T, hideK = 0, splitK = 0) {
      const inSplit = !!split && splitK > 0.5;
      setMode(inSplit);
      shade.style.opacity = inSplit || when === 'split' ? '0' : '1';
      let idx = -1;
      for (let i = 0; i < phrases.length; i++) {
        if (T >= phrases[i].start && T < phrases[i].end) { idx = i; break; }
        if (phrases[i].start > T) break;
      }
      if (idx !== shown) {
        shown = idx;
        line.innerHTML = '';
        spans = idx < 0 ? [] : phrases[idx].map(w => h('span', 'cw', line, w.w));
      }
      const visible = when !== 'split' || inSplit;
      if (idx < 0 || !visible) { el.style.opacity = '0'; return; }
      const p = phrases[idx];
      const k = E.outBack(prog(T, p.start, 0.22));
      el.style.opacity = ((1 - hideK) * Math.min(1, k * 1.5)).toFixed(3);
      el.style.transform = `scale(${(0.9 + 0.1 * k).toFixed(4)})`;
      el.style.transformOrigin = el.style.textAlign === 'left' ? '0 50%' : '50% 50%';
      if (mode === 'word' || mode === 'split-word') {
        let a = 0;
        p.forEach((w, i) => { if (T >= w.s - 0.02) a = i; });
        spans.forEach((sp, i) => { sp.style.display = i === a ? '' : 'none'; });
      }
      const karaoke = mode === 'karaoke';
      p.forEach((w, i) => spans[i].classList.toggle('on', karaoke && T >= w.s && T < (p[i + 1] ? p[i + 1].s : p.end)));
    },
  };
}
