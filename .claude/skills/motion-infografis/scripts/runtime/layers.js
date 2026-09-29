import { E, clamp, prog, lerp, h, s, draw, rng } from './engine.js';

// Topographic contour loops that breathe slowly — the signature backdrop of this style.
function loopPath(cx, cy, r, ph, i, squash = 0.82) {
  const N = 110;
  let d = '';
  for (let j = 0; j <= N; j++) {
    const a = (j / N) * Math.PI * 2;
    const rr = r * (1 + 0.085 * Math.sin(3 * a + ph + i * 0.35) + 0.05 * Math.sin(5 * a - ph * 1.3 + i * 0.21) + 0.035 * Math.sin(2 * a + ph * 0.7 - i * 0.5));
    d += (j ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ',' + (cy + rr * Math.sin(a) * squash).toFixed(1);
  }
  return d + 'Z';
}

function hexToRgba(hex, a) {
  const m = hex.replace('#', '');
  const n = parseInt(m.length === 3 ? m.split('').map(c => c + c).join('') : m, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

export function buildBackground(stage, W, H, brand) {
  const bg = h('div', 'layer', stage);
  bg.style.background = 'var(--bg)';
  const glows = [[brand.surface || '#1D5FD1', 0.55, 1.4 * W], [brand.accent || '#1B7F8C', 0.3, 1.2 * W]].map(([c, a, size]) => {
    const g = h('div', 'abs', bg);
    Object.assign(g.style, { width: `${size}px`, height: `${size}px`, borderRadius: '50%', background: `radial-gradient(circle, ${hexToRgba(c, a)} 0%, rgba(0,0,0,0) 68%)` });
    return g;
  });
  const svg = s('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}`, class: 'layer' }, bg);
  const clusters = [{ x: W * 0.94, y: H * 0.13, r0: 70, step: 58, n: 13 }, { x: W * 0.04, y: H * 0.92, r0: 90, step: 62, n: 12 }];
  const loops = [];
  clusters.forEach((c, ci) => { for (let i = 0; i < c.n; i++) loops.push({ p: s('path', { fill: 'none', stroke: 'rgba(255,255,255,0.075)', 'stroke-width': 1.6, pathLength: 1 }, svg), c, i, ci }); });
  // static dither against gradient banding in H.264
  const cv = document.createElement('canvas');
  cv.width = cv.height = 256;
  const g = cv.getContext('2d'), im = g.createImageData(256, 256), r = rng(7);
  for (let i = 0; i < im.data.length; i += 4) { const v = Math.floor(r() * 255); im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
  g.putImageData(im, 0, 0);
  const dither = h('div', 'layer', bg);
  Object.assign(dither.style, { backgroundImage: `url(${cv.toDataURL()})`, opacity: '0.035', mixBlendMode: 'overlay' });
  return {
    el: bg,
    update(T) {
      glows[0].style.transform = `translate3d(${(-0.4 * W + Math.sin(T * 0.11) * 160).toFixed(1)}px,${(-0.27 * H + Math.cos(T * 0.08) * 200).toFixed(1)}px,0)`;
      glows[1].style.transform = `translate3d(${(0.24 * W + Math.cos(T * 0.09) * 180).toFixed(1)}px,${(0.54 * H + Math.sin(T * 0.07) * 180).toFixed(1)}px,0)`;
      loops.forEach(({ p, c, i, ci }) => {
        p.setAttribute('d', loopPath(c.x + Math.sin(T * 0.05 + ci) * 18, c.y + Math.cos(T * 0.04 + ci) * 14, c.r0 + i * c.step, T * 0.09 + ci * 2.1, i));
        draw(p, clamp(prog(T, 0.1, 2.6) * 1.6 - i * 0.06));
      });
    },
  };
}

// top chrome: brand badge + name, chapter label, overall progress bar
export function buildChrome(stage, W, H, cfg, assetUrl, total) {
  const root = h('div', 'layer', stage);
  const m = Math.round(W * 0.0667), top = Math.round(H * 0.061);
  let brand = null;
  if (cfg.name || cfg.logo) {
    brand = h('div', 'brand', root);
    brand.style.left = `${m}px`;
    brand.style.top = `${top}px`;
    if (cfg.logo) { const b = h('div', 'badge', brand); const img = h('img', null, b); img.src = assetUrl(cfg.logo); }
    if (cfg.name) h('div', 'name', brand, `${cfg.name}${cfg.sub ? `<span>${cfg.sub}</span>` : ''}`);
  }
  const chap = h('div', 'chapter', root);
  chap.style.right = `${m}px`;
  chap.style.top = `${top + 6}px`;
  let fill = null;
  if (cfg.progress !== false) {
    const pbar = h('div', 'pbar', root);
    Object.assign(pbar.style, { left: `${m}px`, top: `${top + 96}px`, width: `${W - 2 * m}px` });
    fill = h('i', null, pbar);
  }
  let last = '';
  return {
    update(T, chapterInfo, hideK = 0) {
      if (fill) fill.style.transform = `scaleX(${clamp(T / total).toFixed(4)})`;
      const label = chapterInfo ? `${chapterInfo.num ? `${chapterInfo.num}` : ''}<b>${chapterInfo.name}</b>` : '';
      if (label !== last) { chap.innerHTML = label; last = label; }
      const k = chapterInfo ? E.outExpo(prog(T, chapterInfo.start, 0.7)) : 0;
      chap.style.opacity = k.toFixed(3);
      chap.style.transform = `translate3d(0,${((1 - k) * 16).toFixed(1)}px,0)`;
      const vis = E.outExpo(prog(T, cfg.showAt ?? 0.4, 0.8));
      root.style.opacity = (vis * (1 - hideK)).toFixed(3);
    },
  };
}
