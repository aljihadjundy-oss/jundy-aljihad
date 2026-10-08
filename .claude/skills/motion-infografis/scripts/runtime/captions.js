import { E, prog, h } from './engine.js';

// Word-timed captions ("karaoke"): short phrases, the spoken word is highlighted.
// words: [{w, s, e}] in seconds.
export function buildCaptions(stage, W, H, words, cfg = {}) {
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

  const shade = h('div', 'layer', stage);
  shade.style.background = `linear-gradient(180deg, rgba(0,0,0,0) 58%, rgba(0,0,0,${cfg.shade ?? 0.42}) 100%)`;
  const el = h('div', 'cap', stage);
  el.style.top = `${Math.round((cfg.y ?? 0.775) * H)}px`;
  el.style.fontSize = `${cfg.size ?? Math.round(W * 0.052)}px`;
  el.style.padding = `0 ${Math.round(W * 0.07)}px`;
  if (cfg.upper) el.style.textTransform = 'uppercase';
  let shown = -1, spans = [];
  return {
    phrases,
    update(T, hideK = 0) {
      let idx = -1;
      for (let i = 0; i < phrases.length; i++) {
        if (T >= phrases[i].start && T < phrases[i].end) { idx = i; break; }
        if (phrases[i].start > T) break;
      }
      if (idx !== shown) {
        shown = idx;
        el.innerHTML = '';
        spans = idx < 0 ? [] : phrases[idx].map(w => h('span', 'cw', el, w.w));
      }
      if (idx < 0) { el.style.opacity = '0'; return; }
      const p = phrases[idx];
      const k = E.outBack(prog(T, p.start, 0.22));
      el.style.opacity = ((1 - hideK) * Math.min(1, k * 1.5)).toFixed(3);
      el.style.transform = `scale(${(0.9 + 0.1 * k).toFixed(4)})`;
      p.forEach((w, i) => spans[i].classList.toggle('on', T >= w.s && T < (p[i + 1] ? p[i + 1].s : p.end)));
    },
  };
}
