import { E, W, H, clamp, prog, lerp, h, s, draw, rng } from './engine.js';

// Topographic contour loops — echoes the contour-line motif on the app's splash screen.
function loopPath(cx, cy, r, ph, i, squash = 0.82) {
  const N = 110;
  let d = '';
  for (let j = 0; j <= N; j++) {
    const a = (j / N) * Math.PI * 2;
    const rr = r * (1
      + 0.085 * Math.sin(3 * a + ph + i * 0.35)
      + 0.05 * Math.sin(5 * a - ph * 1.3 + i * 0.21)
      + 0.035 * Math.sin(2 * a + ph * 0.7 - i * 0.5));
    d += (j ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ',' + (cy + rr * Math.sin(a) * squash).toFixed(1);
  }
  return d + 'Z';
}

function contourSet(parent, stroke, clusters) {
  const svg = s('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}`, class: 'layer' }, parent);
  const loops = [];
  clusters.forEach((c, ci) => {
    for (let i = 0; i < c.n; i++) {
      const p = s('path', { fill: 'none', stroke, 'stroke-width': 1.6, pathLength: 1 }, svg);
      loops.push({ p, c, i, ci });
    }
  });
  return {
    svg,
    update(T, drawK = 1) {
      loops.forEach(({ p, c, i, ci }) => {
        const ph = T * 0.09 + ci * 2.1;
        p.setAttribute('d', loopPath(c.x + Math.sin(T * 0.05 + ci) * 18, c.y + Math.cos(T * 0.04 + ci) * 14, c.r0 + i * c.step, ph, i));
        draw(p, clamp(drawK * 1.6 - i * 0.06));
      });
    },
  };
}

function ditherURL() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const img = g.createImageData(256, 256);
  const r = rng(7);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.floor(r() * 255);
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return c.toDataURL('image/png');
}

export function buildBackground(stage, timeline) {
  const bg = h('div', 'layer', stage);
  bg.style.background = 'var(--navy-dark)';
  const glowA = h('div', 'abs', bg);
  const glowB = h('div', 'abs', bg);
  for (const [g, col, size] of [[glowA, 'rgba(29,95,209,0.42)', 1500], [glowB, 'rgba(27,127,140,0.38)', 1300]]) {
    g.style.width = g.style.height = `${size}px`;
    g.style.borderRadius = '50%';
    g.style.background = `radial-gradient(circle, ${col} 0%, rgba(10,30,54,0) 68%)`;
  }
  const darkContours = contourSet(bg, 'rgba(255,255,255,0.075)', [
    { x: 1010, y: 250, r0: 70, step: 58, n: 13 },
    { x: 40, y: 1760, r0: 90, step: 62, n: 12 },
  ]);

  // light "paper" chapter, revealed with an expanding circle
  const light = h('div', 'layer', stage);
  light.style.background = 'var(--paper)';
  const lightContours = contourSet(light, 'rgba(18,53,91,0.07)', [
    { x: 980, y: 1650, r0: 80, step: 60, n: 12 },
    { x: 60, y: 300, r0: 60, step: 55, n: 10 },
  ]);

  const dither = h('div', 'layer', stage);
  dither.style.backgroundImage = `url(${ditherURL()})`;
  dither.style.opacity = '0.035';
  dither.style.mixBlendMode = 'overlay';

  const R = Math.hypot(W, H);
  return {
    // lightK: 0 = dark, 1 = paper fully revealed
    lightK(T) {
      const { lightIn, lightOut } = timeline;
      const kin = E.inOutQuart(prog(T, lightIn, 0.9));
      const kout = E.inOutQuart(prog(T, lightOut, 0.9));
      return kin * (1 - kout);
    },
    update(T) {
      glowA.style.transform = `translate3d(${(-420 + Math.sin(T * 0.11) * 160).toFixed(1)}px,${(-520 + Math.cos(T * 0.08) * 200).toFixed(1)}px,0)`;
      glowB.style.transform = `translate3d(${(260 + Math.cos(T * 0.09) * 180).toFixed(1)}px,${(1040 + Math.sin(T * 0.07) * 180).toFixed(1)}px,0)`;
      darkContours.update(T, prog(T, 0.1, 2.6));
      const { lightIn, lightOut } = timeline;
      const kin = E.inOutQuart(prog(T, lightIn, 0.9));
      const kout = E.inOutQuart(prog(T, lightOut, 0.9));
      if (kin <= 0 || kout >= 1) {
        light.style.display = 'none';
      } else {
        light.style.display = '';
        // in: grows from the top-left (headline side first); out: shrinks toward the top-right
        const r = kout > 0 ? R * (1 - kout) : R * kin;
        const cx = kout > 0 ? W * 0.9 : W * 0.08, cy = kout > 0 ? H * 0.1 : H * 0.1;
        light.style.clipPath = `circle(${r.toFixed(1)}px at ${cx}px ${cy}px)`;
        lightContours.update(T, 1);
      }
    },
  };
}

// persistent top chrome: brand mark, chapter label, overall progress
export function buildChrome(stage, ctx, total) {
  const root = h('div', 'layer', stage);
  const brand = h('div', 'brand', root);
  const badge = h('div', 'badge', brand);
  const img = h('img', null, badge);
  img.src = ctx.assets.cover;
  const name = h('div', 'name', brand, 'SIAGA SUMATRA<span>KABUPATEN AGAM</span>');
  const chap = h('div', 'chapter', root);
  const pbar = h('div', 'pbar', root);
  const fill = h('i', null, pbar);
  let lastLabel = '';
  return {
    update(T, info, lightK, visK) {
      root.style.opacity = visK.toFixed(3);
      root.style.visibility = visK > 0.001 ? 'visible' : 'hidden';
      const c = (a, b) => `rgb(${Math.round(lerp(a[0], b[0], lightK))},${Math.round(lerp(a[1], b[1], lightK))},${Math.round(lerp(a[2], b[2], lightK))})`;
      name.style.color = c([255, 255, 255], [18, 53, 91]);
      chap.style.color = lightK > 0.5 ? 'rgba(18,53,91,0.55)' : 'rgba(255,255,255,0.5)';
      pbar.style.background = lightK > 0.5 ? 'rgba(18,53,91,0.12)' : 'rgba(255,255,255,0.12)';
      fill.style.transform = `scaleX(${clamp(T / total).toFixed(4)})`;
      const label = info ? `${info.num} / 14<b>${info.name}</b>` : '';
      if (label !== lastLabel) { chap.innerHTML = label; lastLabel = label; }
      const b = chap.querySelector('b');
      if (b) b.style.color = lightK > 0.5 ? '#12355B' : '#fff';
      // chapter label swap: slide/fade in over the first 0.6 s of a chapter
      const k = info ? E.outExpo(prog(T, info.start, 0.7)) : 0;
      chap.style.opacity = k.toFixed(3);
      chap.style.transform = `translate3d(0,${((1 - k) * 16).toFixed(1)}px,0)`;
    },
  };
}
