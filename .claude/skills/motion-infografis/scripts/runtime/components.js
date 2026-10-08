import { E, clamp, prog, lerp, h, place } from './engine.js';

// ---------------------------------------------------------------- icons (24×24 line icons, stroke = currentColor)
export const ICONS = {
  map: '<path d="M3 6.5l6-2.5 6 2.5 6-2.5v14l-6 2.5-6-2.5-6 2.5z"/><path d="M9 4v14M15 6.5v14"/>',
  alert: '<path d="M12 3.2l9.3 16.6H2.7z"/><path d="M12 9.5v4.6M12 17v.2"/>',
  route: '<circle cx="6" cy="18.5" r="2.3"/><circle cx="18" cy="5.5" r="2.3"/><path d="M8.3 18.5H14a3.4 3.4 0 0 0 0-6.8h-4a3.4 3.4 0 0 1 0-6.8h5.7"/>',
  backpack: '<path d="M6 10a6 6 0 0 1 12 0v9a2.2 2.2 0 0 1-2.2 2.2H8.2A2.2 2.2 0 0 1 6 19z"/><path d="M9.5 4.6V3h5v1.6M9 14h6v3.4H9z"/>',
  book: '<path d="M4 5.2A2.2 2.2 0 0 1 6.2 3H20v15.5H6.2A2.2 2.2 0 0 0 4 20.7z"/><path d="M4 20.7V5.2M8.5 7.5h7M8.5 11h5"/>',
  bolt: '<path d="M13.2 2.5L4.5 13.8h6.8l-1 7.7 8.7-11.3h-6.8z"/>',
  lifebuoy: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.8"/><path d="M5.6 5.6l3.7 3.7M14.7 14.7l3.7 3.7M18.4 5.6l-3.7 3.7M9.3 14.7l-3.7 3.7"/>',
  megaphone: '<path d="M3 10v4.2h3.2l7.3 4.3V5.7L6.2 10z"/><path d="M16.6 9.2a3.9 3.9 0 0 1 0 5.6M19.2 6.6a7.6 7.6 0 0 1 0 10.8"/>',
  rain: '<path d="M7 14.5a4.4 4.4 0 1 1 1.3-8.6A5.4 5.4 0 0 1 18.4 8a3.3 3.3 0 0 1-.4 6.5z"/><path d="M8.3 17.6l-1 2.8M12.3 17.6l-1 2.8M16.3 17.6l-1 2.8"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8.2-8 9.2-4.5-1-8-4.2-8-9.2V6z"/><path d="M8.5 12l2.5 2.5 4.6-5"/>',
  eye: '<path d="M2 12s3.6-6.8 10-6.8S22 12 22 12s-3.6 6.8-10 6.8S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  bell: '<path d="M6 16.2v-5a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  run: '<circle cx="14.5" cy="4.2" r="2"/><path d="M8.5 21l3-5.5 3 2.5V22M11.5 15.5l1.5-6.5 3.5 3.5 3.5 1M13 9l-4.5 1.5L6.5 14"/>',
  phone: '<path d="M5.2 3h3.9l1.9 4.8-2.4 1.5a11 11 0 0 0 6.1 6.1l1.5-2.4 4.8 1.9v3.9a2.2 2.2 0 0 1-2.3 2.2A16.7 16.7 0 0 1 3 5.3 2.2 2.2 0 0 1 5.2 3z"/>',
  check: '<path d="M5 12.8l4.4 4.4L19.2 7.4"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  users: '<circle cx="8" cy="8" r="3.2"/><circle cx="17.2" cy="9" r="2.6"/><path d="M2.5 20.5a5.5 5.5 0 0 1 11 0M13.2 20.5a4.5 4.5 0 0 1 8.6 0"/>',
  pin: '<path d="M12 21.5s7.2-6.3 7.2-12.3a7.2 7.2 0 0 0-14.4 0c0 6 7.2 12.3 7.2 12.3z"/><circle cx="12" cy="9.2" r="2.6"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  trend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  money: '<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><circle cx="12" cy="12" r="2.8"/><path d="M6 9.5v5M18 9.5v5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/>',
  idea: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 1 3.6 10.8c-.9.7-1.6 1.7-1.6 2.8v.4h-4v-.4c0-1.1-.7-2.1-1.6-2.8A6 6 0 0 1 12 3z"/>',
  star: '<path d="M12 3l2.8 5.8 6.2.9-4.5 4.4 1.1 6.3L12 17.4l-5.6 3 1.1-6.3L3 9.7l6.2-.9z"/>',
  arrow: '<path d="M4 12h15M13 6l6 6-6 6"/>',
  play: '<path d="M7 4.5v15l12.5-7.5z"/>',
  home: '<path d="M4 11l8-7 8 7v9.5H4z"/><path d="M9.5 20.5v-5h5v5"/>',
  building: '<path d="M4 21V8l8-5 8 5v13"/><path d="M2.5 21h19M9 21v-5h6v5M8 10.5h2M14 10.5h2"/>',
  heart: '<path d="M12 20s-7.5-4.6-9-9.6C2 6.9 4.3 4.5 7.1 4.5c2 0 3.6 1.1 4.9 3 1.3-1.9 2.9-3 4.9-3 2.8 0 5.1 2.4 4.1 5.9-1.5 5-9 9.6-9 9.6z"/>',
};

export function icon(name, size = 40, color = 'currentColor') {
  return `<span class="ico" style="width:${size}px;height:${size}px;color:${color};flex:0 0 ${size}px"><svg viewBox="0 0 24 24">${ICONS[name] || ICONS.star}</svg></span>`;
}

// ---------------------------------------------------------------- kinetic headline
// *word* → accent, _word_ → accent2, ~word~ → negative colour; markers may span several words.
export function headline(parent, text, { x = 0, y = 0, w, size = 80, color = 'var(--ink)', align = 'left', lh = 1.06, weight = 800, flow = false } = {}) {
  // flow: take part in normal layout (inside a flex/block container) instead of absolute placement
  const el = h('div', flow ? 'hl' : 'abs hl', parent);
  if (flow) { if (w) el.style.width = `${w}px`; } else place(el, x, y, w);
  Object.assign(el.style, { fontSize: `${size}px`, color, textAlign: align, lineHeight: lh, fontWeight: weight });
  const words = [];
  const ACC = { '*': 'acc-1', '_': 'acc-2', '~': 'acc-3', '^': 'acc-g', '|': 'acc-s' };
  let acc = '';
  String(text).split('\n').forEach((line, li) => {
    if (li) h('br', null, el);
    line.split(' ').filter(Boolean).forEach((tok, wi) => {
      let word = tok;
      while (word && ACC[word[0]]) { acc = acc === ACC[word[0]] ? '' : ACC[word[0]]; word = word.slice(1); }
      const cls = acc;
      const m = word.match(/^(.*?)([*_~^|])([.,:;!?—)"']*)$/);
      if (m) { word = m[1] + m[3]; acc = ''; }
      if (wi) el.appendChild(document.createTextNode(' '));
      const wrap = h('span', 'w', el);
      words.push(h('span', `wi ${cls}`, wrap, word));
    });
  });
  // ^gradient^ words share one gradient across the headline width (like the site's .text-gradient), not one per word
  const grads = words.filter(wi => wi.classList.contains('acc-g'));
  if (grads.length) {
    const er = el.getBoundingClientRect();
    grads.forEach(wi => {
      const r = wi.getBoundingClientRect();
      wi.style.backgroundSize = `${er.width.toFixed(1)}px ${r.height.toFixed(1)}px`;
      wi.style.backgroundPosition = `${(er.left - r.left).toFixed(1)}px 0`;
    });
  }
  return {
    el,
    update(t, tin, tout = null, { stagger = 0.055, dur = 0.8, dout = 0.4, exitDy = -30 } = {}) {
      words.forEach((wi, i) => {
        const k = E.outExpo(prog(t, tin + i * stagger, dur));
        wi.style.transform = `translate3d(0,${((1 - k) * 105).toFixed(2)}%,0)`;
      });
      const x = tout == null ? 0 : E.inCubic(prog(t, tout, dout));
      const started = t >= tin - 0.001;
      el.style.opacity = started ? (1 - x).toFixed(4) : '0';
      el.style.transform = `translate3d(0,${(exitDy * x).toFixed(2)}px,0)`;
      el.style.visibility = started && x < 0.999 ? 'visible' : 'hidden';
    },
  };
}

// ---------------------------------------------------------------- image / screenshot card with an inner camera
export function imageCard(parent, src, aspect, { w = 520, hgt = null, radius = 34, tag = null } = {}) {
  const H0 = Math.round(Math.min(hgt ?? Infinity, w * aspect));
  const el = h('div', 'shot', parent);
  Object.assign(el.style, { width: `${w}px`, height: `${H0}px`, borderRadius: `${radius}px` });
  const inner = h('div', 'inner', el);
  inner.style.width = `${w}px`;
  const img = h('img', null, inner);
  img.src = src;
  if (tag) {
    const tg = h('div', 'abs', el, tag);
    Object.assign(tg.style, { left: '50%', bottom: '16px', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontSize: '19px', fontWeight: '700',
      letterSpacing: '.08em', textTransform: 'uppercase', color: '#fff', background: 'var(--glass)', padding: '7px 14px', borderRadius: '999px' });
  }
  const api = {
    el, w, h: H0, aspect,
    setView(zoom = 1, fx = 0.5, fy = 0.5) {
      const iw = w * zoom, ih = w * aspect * zoom;
      const ox = clamp(w / 2 - fx * iw, w - iw, 0);
      const oy = clamp(H0 / 2 - fy * ih, Math.min(0, H0 - ih), 0);
      inner.style.transform = `translate3d(${ox.toFixed(2)}px,${oy.toFixed(2)}px,0) scale(${zoom.toFixed(4)})`;
    },
    ring(rx, ry, rw, rh) { // normalized image coords
      const r = h('div', 'ring', inner);
      place(r, rx * w, ry * w * aspect, rw * w, rh * w * aspect);
      return r;
    },
  };
  api.setView(1, 0.5, 0);
  return api;
}

// eased keyframe camera for imageCard: keys [{t, z, fx, fy, d}]
export function camera(card, t, keys) {
  if (!keys || !keys.length) return;
  let a = keys[0], b = keys[0], k = 0;
  for (let i = 0; i < keys.length - 1; i++) {
    if (t >= keys[i].t) { a = keys[i]; b = keys[i + 1]; const d = b.d ?? 1.2; k = E.inOutCubic(prog(t, b.t - d, d)); }
  }
  if (t >= keys[keys.length - 1].t) { a = b = keys[keys.length - 1]; k = 1; }
  card.setView(lerp(a.z ?? 1, b.z ?? 1, k), lerp(a.fx ?? 0.5, b.fx ?? 0.5, k), lerp(a.fy ?? 0.5, b.fy ?? 0.5, k));
}

export function formatNumber(v, { decimals = 0, locale = 'id-ID', prefix = '', suffix = '' } = {}) {
  return prefix + v.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
}
