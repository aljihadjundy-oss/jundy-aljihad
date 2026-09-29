import { E, clamp, lerp, h } from './engine.js';

// Raw footage as a layer: one pre-extracted, canvas-sized JPEG per output frame.
// States: normal (full frame) → insert (shrinks to a rounded picture-in-picture) → full (hidden behind a motion scene)
// → split (slides down so the face window sits in the bottom half; the top half is free for a screen or a graphic).
// zoom: {z, fx, fy} punch-in / slow push inside the frame (fx, fy = focus as fractions of the frame).
export function buildFootage(stage, W, H, meta, frameUrl, pip, split = { seam: H / 2, focus: 0.33, zoom: 1 }) {
  const wrap = h('div', 'abs', stage);
  Object.assign(wrap.style, { left: '0', top: '0', width: `${W}px`, height: `${H}px`, overflow: 'hidden', transformOrigin: '0 0' });
  const img = h('img', 'abs', wrap);
  Object.assign(img.style, { left: '0', top: '0', width: `${W}px`, height: `${H}px`, objectFit: 'cover' });
  const edge = h('div', 'layer', wrap); // thin border that only shows while in PiP
  const PH = H - split.seam; // height of the bottom panel in split mode
  const fy0 = clamp(split.focus * H - PH / 2, 0, H - PH); // top of the source window that lands in that panel
  let cur = -1;
  return {
    async update(T, insertK, fullK, splitK = 0, zoom = null) {
      const idx = clamp(Math.floor(T * meta.fps + 1e-6) + 1, 1, meta.count);
      if (idx !== cur) {
        img.src = frameUrl(idx);
        try { await img.decode(); } catch (e) { /* keep last frame */ }
        cur = idx;
      }
      const sk = E.inOutCubic(splitK);
      // zoom: punch-in beats, plus the optional split zoom around the face window
      const z = (zoom ? zoom.z : 1) * lerp(1, split.zoom ?? 1, sk);
      if (Math.abs(z - 1) > 1e-4) {
        const ox = lerp((zoom?.fx ?? 0.5) * W, W / 2, sk), oy = lerp((zoom?.fy ?? 0.4) * H, fy0 + PH / 2, sk);
        img.style.transformOrigin = `${ox.toFixed(1)}px ${oy.toFixed(1)}px`;
        img.style.transform = `scale(${z.toFixed(4)})`;
      } else img.style.transform = '';
      const k = E.inOutCubic(insertK);
      const sc = lerp(1, pip.w / W, k);
      const ty = lerp(0, pip.y, k) + sk * (split.seam - fy0);
      wrap.style.transform = `translate3d(${lerp(0, pip.x, k).toFixed(2)}px,${ty.toFixed(2)}px,0) scale(${sc.toFixed(4)})`;
      wrap.style.clipPath = sk > 0.001 ? `inset(${(sk * fy0).toFixed(1)}px 0 ${(sk * (H - fy0 - PH)).toFixed(1)}px 0)` : 'none';
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
