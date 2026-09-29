import { E, clamp, lerp, h } from './engine.js';

// Raw footage as a layer: one pre-extracted, canvas-sized JPEG per output frame.
// States: normal (full frame) → insert (shrinks to a rounded picture-in-picture) → full (hidden behind a motion scene).
export function buildFootage(stage, W, H, meta, frameUrl, pip) {
  const wrap = h('div', 'abs', stage);
  Object.assign(wrap.style, { left: '0', top: '0', width: `${W}px`, height: `${H}px`, overflow: 'hidden', transformOrigin: '0 0' });
  const img = h('img', 'abs', wrap);
  Object.assign(img.style, { left: '0', top: '0', width: `${W}px`, height: `${H}px`, objectFit: 'cover' });
  const edge = h('div', 'layer', wrap); // thin border that only shows while in PiP
  let cur = -1;
  return {
    async update(T, insertK, fullK) {
      const idx = clamp(Math.floor(T * meta.fps + 1e-6) + 1, 1, meta.count);
      if (idx !== cur) {
        img.src = frameUrl(idx);
        try { await img.decode(); } catch (e) { /* keep last frame */ }
        cur = idx;
      }
      const k = E.inOutCubic(insertK);
      const sc = lerp(1, pip.w / W, k);
      wrap.style.transform = `translate3d(${lerp(0, pip.x, k).toFixed(2)}px,${lerp(0, pip.y, k).toFixed(2)}px,0) scale(${sc.toFixed(4)})`;
      wrap.style.borderRadius = `${(k * pip.r / sc).toFixed(1)}px`;
      wrap.style.boxShadow = k > 0.01 ? `0 ${40 / sc}px ${80 / sc}px -${30 / sc}px rgba(0,0,0,${0.65 * k})` : 'none';
      edge.style.boxShadow = k > 0.01 ? `inset 0 0 0 ${(3 / sc).toFixed(1)}px rgba(255,255,255,${0.25 * k})` : 'none';
      edge.style.borderRadius = wrap.style.borderRadius;
      const f = E.inOutCubic(fullK);
      wrap.style.opacity = (1 - f).toFixed(3);
      wrap.style.visibility = f > 0.999 ? 'hidden' : 'visible';
    },
  };
}
