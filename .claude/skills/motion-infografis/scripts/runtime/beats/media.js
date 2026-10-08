import { E, prog, lerp, pose } from '../engine.js';
import { imageCard, camera } from '../components.js';
import { div, appear } from './util.js';

// image — screenshot / photo / chart image as a floating card with an inner camera and highlight rings.
// camera: [{t, z, fx, fy, d}] (t = seconds from beat start); rings: [{x, y, w, h, t0, t1}] normalized to the image.
export const image = {
  defaults: { mode: 'insert', pos: 'center', glass: false },
  build(box, b, ctx) {
    const S = ctx.S;
    const aspect = ctx.aspect(b.src);
    const maxH = b.height ? b.height * S : ctx.zone.h - (b.caption ? 90 * S : 0);
    // width: px (>2), fraction of the zone (≤1), or a default per mode
    let w = b.width > 2 ? b.width * S : (b.width || (ctx.mode === 'overlay' ? 0.62 : 0.78)) * ctx.zone.w;
    // crop:true keeps the width and shows a window you pan with `camera`; otherwise shrink so the whole image fits
    if (!b.crop && w * aspect > maxH) w = maxH / aspect;
    const viewH = Math.min(maxH, w * aspect);
    const holder = div(box, { display: 'flex', justifyContent: 'center' });
    const inner = div(holder, { position: 'relative', width: `${w}px`, height: `${viewH}px` });
    const card = imageCard(inner, ctx.asset(b.src), aspect, { w, hgt: viewH, radius: (b.radius ?? 30) * S, tag: b.tag });
    card.el.style.left = '0'; card.el.style.top = '0';
    const rings = (b.rings || []).map(r => ({ ...r, el: card.ring(r.x, r.y, r.w, r.h) }));
    let cap = null;
    if (b.caption) cap = div(box, { marginTop: `${20 * S}px`, textAlign: 'center', fontSize: `${26 * S}px`, fontWeight: '600', lineHeight: '1.35', color: 'var(--ink-soft)' }, b.caption);
    ctx.cue(ctx.t0, 'soft');
    rings.forEach(r => ctx.cue(ctx.t0 + (r.t0 ?? 1), 'tick'));
    return lt => {
      appear(card.el, lt, ctx.t0, ctx.OUT, { dy: 90, s0: 0.92, din: 1.0 });
      card.el.style.transform += ` rotate(${((b.tilt ?? 0) * E.outExpo(prog(lt, ctx.t0, 1.0))).toFixed(2)}deg)`;
      camera(card, lt - ctx.t0, b.camera);
      rings.forEach(r => {
        const k = E.outBack(prog(lt, ctx.t0 + (r.t0 ?? 1), 0.5)) * (1 - E.inCubic(prog(lt, ctx.t0 + (r.t1 ?? 99), 0.35)));
        r.el.style.opacity = Math.min(1, k).toFixed(3);
        r.el.style.transform = `scale(${lerp(1.2, 1, Math.min(1, k)).toFixed(3)})`;
      });
      if (cap) appear(cap, lt, ctx.t0 + 0.4, ctx.OUT, { dy: 14 });
    };
  },
};

// custom — escape hatch: a project-local ES module (default export { build(box, beat, ctx) → update(lt) })
export const custom = {
  defaults: { mode: 'full', pos: 'center', glass: false },
  async: true,
  async load(b, ctx) { return (await import(ctx.asset(b.module))).default; },
  build(box, b, ctx, mod) { return mod.build(box, b, ctx); },
};
