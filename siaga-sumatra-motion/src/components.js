import { E, clamp, prog, lerp, pose, h, place } from './engine.js';

// ---------------------------------------------------------------- icons
// Simple 24×24 line icons, drawn for this project (stroke = currentColor).
const P = {
  map: '<path d="M3 6.5l6-2.5 6 2.5 6-2.5v14l-6 2.5-6-2.5-6 2.5z"/><path d="M9 4v14M15 6.5v14"/>',
  alert: '<path d="M12 3.2l9.3 16.6H2.7z"/><path d="M12 9.5v4.6M12 17v.2"/>',
  route: '<circle cx="6" cy="18.5" r="2.3"/><circle cx="18" cy="5.5" r="2.3"/><path d="M8.3 18.5H14a3.4 3.4 0 0 0 0-6.8h-4a3.4 3.4 0 0 1 0-6.8h5.7"/>',
  backpack: '<path d="M6 10a6 6 0 0 1 12 0v9a2.2 2.2 0 0 1-2.2 2.2H8.2A2.2 2.2 0 0 1 6 19z"/><path d="M9.5 4.6V3h5v1.6M9 14h6v3.4H9z"/>',
  book: '<path d="M4 5.2A2.2 2.2 0 0 1 6.2 3H20v15.5H6.2A2.2 2.2 0 0 0 4 20.7z"/><path d="M4 20.7V5.2M8.5 7.5h7M8.5 11h5"/>',
  bolt: '<path d="M13.2 2.5L4.5 13.8h6.8l-1 7.7 8.7-11.3h-6.8z"/>',
  lifebuoy: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.8"/><path d="M5.6 5.6l3.7 3.7M14.7 14.7l3.7 3.7M18.4 5.6l-3.7 3.7M9.3 14.7l-3.7 3.7"/>',
  megaphone: '<path d="M3 10v4.2h3.2l7.3 4.3V5.7L6.2 10z"/><path d="M16.6 9.2a3.9 3.9 0 0 1 0 5.6M19.2 6.6a7.6 7.6 0 0 1 0 10.8"/>',
  rain: '<path d="M7 14.5a4.4 4.4 0 1 1 1.3-8.6A5.4 5.4 0 0 1 18.4 8a3.3 3.3 0 0 1-.4 6.5z"/><path d="M8.3 17.6l-1 2.8M12.3 17.6l-1 2.8M16.3 17.6l-1 2.8"/>',
  flood: '<path d="M6 11.5l6-5.8 6 5.8M8 9.8v3.4h8V9.8"/><path d="M2 16.5c2.5 0 2.5-1.8 5-1.8s2.5 1.8 5 1.8 2.5-1.8 5-1.8 2.5 1.8 5 1.8"/><path d="M2 20.3c2.5 0 2.5-1.8 5-1.8s2.5 1.8 5 1.8 2.5-1.8 5-1.8 2.5 1.8 5 1.8"/>',
  flash: '<path d="M2 12.5c2.5 0 2.5-1.8 5-1.8s2.5 1.8 5 1.8 2.5-1.8 5-1.8 2.5 1.8 5 1.8"/><path d="M2 17.5c2.5 0 2.5-1.8 5-1.8s2.5 1.8 5 1.8 2.5-1.8 5-1.8 2.5 1.8 5 1.8"/><path d="M14.5 3.5h6v6M20.5 3.5l-6.3 6.3"/>',
  slide: '<path d="M2.5 20.5h19L9.5 6z"/><circle cx="16.5" cy="8.5" r="1.6"/><circle cx="19.6" cy="12.6" r="1.2"/><path d="M8 13.5l3.2 3"/>',
  exposure: '<path d="M4 11l8-7 8 7v9.5H4z"/><circle cx="12" cy="15" r="2.6"/><path d="M12 11.2v1.2M12 17.6v1.2M8.2 15h1.2M14.6 15h1.2"/>',
  vuln: '<circle cx="9.5" cy="4.6" r="2"/><path d="M9.5 7v6.5L7 21M9.5 13.5L12.5 21M6.5 10h6.3"/><path d="M16.5 11.5v9.5M16.5 11.5c0-1.2 1.8-1.2 1.8 0"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8.2-8 9.2-4.5-1-8-4.2-8-9.2V6z"/><path d="M8.5 12l2.5 2.5 4.6-5"/>',
  eye: '<path d="M2 12s3.6-6.8 10-6.8S22 12 22 12s-3.6 6.8-10 6.8S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  bell: '<path d="M6 16.2v-5a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  run: '<circle cx="14.5" cy="4.2" r="2"/><path d="M8.5 21l3-5.5 3 2.5V22M11.5 15.5l1.5-6.5 3.5 3.5 3.5 1M13 9l-4.5 1.5L6.5 14"/>',
  phone: '<path d="M5.2 3h3.9l1.9 4.8-2.4 1.5a11 11 0 0 0 6.1 6.1l1.5-2.4 4.8 1.9v3.9a2.2 2.2 0 0 1-2.3 2.2A16.7 16.7 0 0 1 3 5.3 2.2 2.2 0 0 1 5.2 3z"/>',
  check: '<path d="M5 12.8l4.4 4.4L19.2 7.4"/>',
  users: '<circle cx="8" cy="8" r="3.2"/><circle cx="17.2" cy="9" r="2.6"/><path d="M2.5 20.5a5.5 5.5 0 0 1 11 0M13.2 20.5a4.5 4.5 0 0 1 8.6 0"/>',
  pin: '<path d="M12 21.5s7.2-6.3 7.2-12.3a7.2 7.2 0 0 0-14.4 0c0 6 7.2 12.3 7.2 12.3z"/><circle cx="12" cy="9.2" r="2.6"/>',
  building: '<path d="M4 21V8l8-5 8 5v13"/><path d="M2.5 21h19M9 21v-5h6v5M8 10.5h2M14 10.5h2"/>',
};

export function icon(name, cls = '') {
  return `<span class="ico ${cls}"><svg viewBox="0 0 24 24">${P[name] || ''}</svg></span>`;
}

// ---------------------------------------------------------------- kinetic headline
// Words wrapped in masks; *word* → teal accent, _word_ → amber accent, ~word~ → blue accent.
export function headline(parent, text, { x, y, w, size = 88, color = '#fff', align = 'left', lh = 1.04, weight = 800, cls = '' } = {}) {
  const el = h('div', `abs hl ${cls}`, parent);
  place(el, x, y, w);
  el.style.fontSize = `${size}px`;
  el.style.color = color;
  el.style.textAlign = align;
  el.style.lineHeight = lh;
  el.style.fontWeight = weight;
  const words = [];
  const ACC = { '*': 'acc-teal', '_': 'acc-amber', '~': 'acc-blue' };
  let acc = ''; // accent state carries across words, so *two words* works
  text.split('\n').forEach((line, li) => {
    if (li) h('br', null, el);
    line.split(' ').filter(Boolean).forEach((tok, wi) => {
      let word = tok;
      while (word && ACC[word[0]]) { acc = acc === ACC[word[0]] ? '' : ACC[word[0]]; word = word.slice(1); }
      const cls = acc;
      const m = word.match(/^(.*?)([*_~])([.,:;!?—)]*)$/);
      if (m) { word = m[1] + m[3]; acc = ''; }
      if (wi) el.appendChild(document.createTextNode(' '));
      const wrap = h('span', 'w', el);
      words.push(h('span', `wi ${cls}`, wrap, word));
    });
  });
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

// ---------------------------------------------------------------- screenshot card
// A viewport onto one screenshot. setView(zoom, fx, fy) pans/zooms so the normalized
// image point (fx, fy) sits at the viewport centre (clamped to the image edges).
export function shotCard(parent, ctx, name, { w = 520, hgt = null, tag = 'Contoh tampilan rancangan', radius = 40 } = {}) {
  const asset = ctx.assets.shots[name];
  const aspect = asset.aspect;
  const H0 = Math.round(Math.min(hgt ?? Infinity, w * aspect));
  const el = h('div', 'shot', parent);
  el.style.width = `${w}px`;
  el.style.height = `${H0}px`;
  el.style.borderRadius = `${radius}px`;
  const inner = h('div', 'inner', el);
  inner.style.width = `${w}px`;
  if (asset.ok) {
    const img = h('img', null, inner);
    img.src = asset.src;
  } else {
    const ph = h('div', 'ph', inner);
    inner.style.height = `${Math.round(w * aspect)}px`;
    ph.innerHTML = `<div class="ph-bar" style="width:40%"></div><div class="ph-label">screenshot<br>${name}</div><div class="ph-sub">placeholder — file belum masuk</div><div class="ph-bar"></div><div class="ph-bar" style="width:55%"></div>`;
  }
  const rings = [];
  let tagEl = null;
  if (tag) tagEl = h('div', 'tag', el, tag);
  const api = {
    el, w, h: H0, aspect,
    setView(zoom = 1, fx = 0.5, fy = 0.5) {
      const iw = w * zoom, ih = w * aspect * zoom;
      let ox = w / 2 - fx * iw, oy = H0 / 2 - fy * ih;
      ox = clamp(ox, w - iw, 0);
      oy = clamp(oy, Math.min(0, H0 - ih), 0);
      inner.style.transform = `translate3d(${ox.toFixed(2)}px,${oy.toFixed(2)}px,0) scale(${zoom.toFixed(4)})`;
    },
    // highlight ring in normalized image coords
    ring(rx, ry, rw, rh) {
      const r = h('div', 'ring', inner);
      place(r, rx * w, ry * w * aspect, rw * w, rh * w * aspect);
      rings.push(r);
      return r;
    },
    tagOpacity(o) { if (tagEl) tagEl.style.opacity = o.toFixed(3); },
  };
  api.setView(1, 0.5, 0);
  return api;
}

// ---------------------------------------------------------------- misc
export function counter(el, t, tin, dur, to, { d = 0, from = 0, suffix = '' } = {}) {
  const k = E.outCubic(prog(t, tin, dur));
  const v = lerp(from, to, k);
  el.textContent = v.toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d }) + suffix;
}

export function brandLogo(parent, ctx, { w = 320 } = {}) {
  // crop of the logo (pin + wordmark) out of logo/cover.jpg: box (140,115)-(460,565) of 585×1041
  const box = { x: 140, y: 115, w: 320, h: 450 };
  const sc = w / box.w;
  const el = h('div', 'abs', parent);
  el.style.width = `${w}px`;
  el.style.height = `${Math.round(box.h * sc)}px`;
  el.style.overflow = 'hidden';
  const img = h('img', 'abs', el);
  img.src = ctx.assets.cover;
  img.style.width = `${585 * sc}px`;
  img.style.left = `${-box.x * sc}px`;
  img.style.top = `${-box.y * sc}px`;
  return el;
}

export { pose };
