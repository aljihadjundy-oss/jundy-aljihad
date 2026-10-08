# Custom beat modules

Use a `custom` beat when none of the built-in types fits. Examples: a map that zooms from a province to a district, a formula
that assembles term by term, an app screenshot with checkmarks drawn onto its UI, a before/after slider.

## Contract
`project.json`: `{ "type": "custom", "t": 12, "dur": 8, "mode": "full", "module": "scenes/my_scene.js", ...your fields }`

`proj/scenes/my_scene.js` (ES module, served at `/p/scenes/my_scene.js`):
```js
import { E, prog, lerp, pose, enter, h, s, place, draw } from '/rt/engine.js';
import { headline, icon, imageCard, camera, formatNumber } from '/rt/components.js';

export default {
  // box: an empty, relatively positioned div at the content zone (x = left margin, width = ctx.zone.w)
  // b: the beat object from project.json      ctx: see below
  build(box, b, ctx) {
    const S = ctx.S;                                  // size factor (1 at 1080 px wide)
    box.style.height = `${ctx.zone.h}px`;             // claim the whole zone if you place things absolutely
    const hl = headline(box, b.text, { x: 0, y: 0, w: ctx.zone.w, size: 72 * S });
    const dot = h('div', 'abs', box);
    place(dot, 0, 300 * S, 40 * S, 40 * S);
    dot.style.borderRadius = '50%';
    dot.style.background = 'var(--accent2)';
    ctx.cue(ctx.t0 + 1, 'pop');                       // sound effect at beat-local time
    return lt => {                                    // lt = seconds since beat start (may be slightly negative)
      hl.update(lt, ctx.t0, ctx.OUT);
      enter(dot, lt, ctx.t0 + 1, ctx.OUT, { dy: 0, s0: 0.3 });
    };
  },
};
```

## ctx
| key | meaning |
|---|---|
| `W`, `H`, `S`, `m` | canvas size, size factor, side margin |
| `mode`, `zone` | `{x, y, w, h}` of the content area for this mode |
| `t0`, `OUT`, `dur` | when content should start entering, when to start exiting (`dur − 0.45`), beat length |
| `cue(lt, type, {gain})` | schedule a sound: `whoosh`, `swoosh`, `soft`, `pop`, `tick` |
| `asset(path)`, `aspect(path)` | URL for a project file; h/w ratio of preloaded images (only images used by `image` beats or the chrome logo are preloaded; load others yourself and await `img.decode()`) |
| `captionsY`, `brand`, `locale` | caption line y, brand colours, number locale |

## Rules that keep custom scenes deterministic
- The update function must depend only on `lt`. No `Date.now()`, no CSS transitions or animations, no `requestAnimationFrame`, no unseeded randomness (use `rng(seed)` from engine.js).
- Build DOM once in `build`; in the update, only change transforms, opacity, text and SVG attributes.
- Use `pathLength="1"` on SVG paths and `draw(path, k)` for stroke-draw.
- Use the easing presets in `E` (`outExpo`, `inCubic`, `inOutCubic`, `outBack`, `outCubic`) so custom scenes match the house motion.
- Preview with `render.mjs --stills` at a few `t` values inside the beat before rendering the full video.

## Engine cheatsheet (`/rt/engine.js`)
`E.*` easings · `prog(t, start, dur)` → 0..1 · `io(t, tin, tout)` → {k, x} · `enter(el, t, tin, tout, {dy, dx, s0, r0})`
· `pose(el, {x, y, s, r, o})` · `h(tag, cls, parent, html)` · `s(svgTag, attrs, parent)` · `place(el, x, y, w, h)` · `draw(path, k)` · `lerp`, `clamp`, `rng`.
`/rt/components.js`: `headline(parent, text, {x, y, w, size, align, flow})` → `{el, update(t, tin, tout)}` · `icon(name, size, color)` → HTML
· `imageCard(parent, src, aspect, {w, hgt, radius, tag})` → `{el, setView(z, fx, fy), ring(x, y, w, h)}` · `camera(card, t, keys)` · `formatNumber(v, opts)`.

The SIAGA SUMATRA project (`siaga-sumatra-motion/src/scenes/*.js`) has larger examples: a geoBoundaries map with camera zoom,
names that fly into card titles, a formula assembled term by term, and checkmarks drawn onto a screenshot.

## Whole-film projects with their own page (`entry`)
When the film is mostly bespoke scenes (maps, isometric builds, radar, a HUD), skip the beat framework: set
`"entry": "src/index.html"` in `project.json`. `render.mjs` then serves that page at `/` instead of the built-in runtime and still
exposes `/rt/engine.js` (easing + helpers), `/p/…` (the project) and `/fonts/…` (installed @fontsource packages). The page only has to provide
`window.__ready` (a promise), `window.seek(t)` (may be async), `window.__duration`, `window.__fps`, `window.__cues` (`[{t, type, …}]`),
and optionally `window.__beats` / `window.__extra` (copied into `out/meta.json`).
Set `"audio": {"script": "tools/my_audio.py"}` to replace the generic mixer with a project-specific synth (called as `script <project> <out.wav> [start end]`).
Worked example: the Shape Indonesia sponsor film (9 scenes, dot-matrix map, isometric builds, custom sound design).
