# project.json and beat reference

## Contents
1. project.json top level
2. Modes, positions and zones
3. Common beat fields
4. Beat types: title · lowerthird · stat · bars · compare · list · checklist · flow · stepper · image · quote · chapter · cta · custom
   · callout · annotate · zoom · transition · kinetic
5. Text markup
6. A complete example

## 1. project.json

```json
{
  "canvas": { "w": 1080, "h": 1920, "fps": 30 },
  "footage": true,
  "duration": 43.33,
  "locale": "id-ID",
  "brand": { "bg": "#0A1E36", "surface": "#12355B", "ink": "#FFFFFF", "accent": "#3FB6C4", "accent2": "#E0A100",
             "pos": "#5DBB63", "neg": "#F06A5F", "font": "plus-jakarta-sans" },
  "chrome": { "name": "SIAGA SUMATRA", "sub": "KABUPATEN AGAM", "logo": "assets/logo.png", "progress": true },
  "captions": { "enabled": true, "y": 0.775, "size": 56, "maxWords": 4, "upper": false, "style": "karaoke", "when": "always" },
  "layout": { "overlayBottom": null, "seam": 0.5, "splitFocus": 0.33, "splitZoom": 1 },
  "audio": { "voice": true, "sfx": 1.0, "pad": "auto", "music": null, "music_gain_db": -20, "target_lufs": -14 },
  "beats": [ ... ]
}
```
- `footage`: true when `prep_footage.py` was run (it fills `duration`). For from-scratch videos use false and set `duration`,
  or leave it out to end 0.6 s after the last beat.
- `brand`: every key is optional. `palette` picks a library palette (default `jundy`, the user's locked palette; also
  `navy`, `maroon`, `paper`, `ink`); `bg`, `surface`, `ink`, `accent` (structure), `accent2` (emphasis/numbers),
  `accent3` (gradient middle), `pos`, `neg`, `glass`, `glow` ([two hex colours for the backdrop]) override single tokens.
  `font` is an `@fontsource` package id installed via `setup.sh`; `serif` the display serif (default `dm-serif-display`).
- `chrome`: `false` hides it. `progressY` (fraction of height, default ≈ 0.11) moves the progress bar, e.g. `0.028` to sit at the very top above a title band. Omit `name` and `logo` for a bare progress bar. `logo` sits on a white rounded badge.
- `captions`: needs `transcript/words.json`. `y` is the fraction of height where the caption line starts.
  `style`: `karaoke` (spoken word highlighted, default), `plain` (white bold with a shadow), `box` (white on a black box).
  `style: "word"` shows one spoken word at a time in a grey chip (ref e). `enter: "smear"` makes each line blur in from the left and out to the right (ref d). `when`: `always` or `split` (only during split beats, e.g. to replace burned-in subtitles that the split crops away).
  In split mode captions sit on the seam as `splitStyle` (default `box`), `splitAlign` (default `left`), `splitSize` px.
- `layout.overlayBottom`: optional fraction of height that overlay cards must stay above, for footage that already has
  burned-in subtitles or on-screen text (e.g. `0.75` when the subtitles start at y ≈ 1460 of 1920). With `pos: "bottom"`
  the card then sits in the band between the chin and the subtitles. Insert and full content is not affected.
- `layout.overlayTop`: fraction of height where overlay titles and insert/full headers start (default about 0.135). Lower it
  (e.g. `0.07`) for a tight close-up whose hair starts near the top, so a title sits in the band above the head instead of on the forehead.
  The PiP moves up with it. Free-placed beats (`callout`, `annotate`) are not affected: give them their own `y`.
- `layout.pip`: `{ "pos": "bottom", "w": 0.88, "h": 0.22, "fy": 0.45, "bottom": 0.045 }` turns the `insert` window into a wide
  landscape cut-out of the speaker at the bottom of the frame (`fy` = where the face sits in the source, as a fraction of
  its height) and gives every `insert` beat the whole area above it. Captions step aside during insert beats then.
  The default is the small portrait window at the top right.
- **`behind: true` on any beat** (kinetic words, `iso`, a `title`, an `image`…) puts it BETWEEN the background footage and the speaker, so the speaker stays in
  front of the text or scene and the face is never covered (type behind the head, a scene behind the body). It needs a person matte: run
  `python3 $S/matte.py proj --range a,b` (only the seconds you need; about 18 frames per second of work) once before rendering. The beat is
  treated as a full-screen part for the background (the footage fades out), while the matted speaker stays on top. Without the masks it falls back to
  a full-screen part, so always run `matte.py` first.
- `layout.seam` / `splitFocus` / `splitZoom`: split mode geometry. `seam` is where the top panel ends (fraction of height,
  default 0.5). `splitFocus` is the vertical centre of the face in the footage (fraction of height, default 0.33); the
  bottom panel shows the window around it. `splitZoom` > 1 punches in on that window.
- `chrome.hideInSplit`: the progress bar and badge fade out during split beats (default true) and kinetic beats.
- `audio.music`: optional path to a licensed track, ducked under the voice. It is not looped, so use a track at least as long as the video.

## 2. Modes, positions, zones

| mode | footage | where content goes | good for |
|---|---|---|---|
| `overlay` | stays full-frame | a glass card (or plain text for `title`) in zone `pos`: `top`, `center`, `bottom` | one number, a short title, a quote, a name |
| `insert` | shrinks to a rounded PiP, top-right (30 % width) | header left of the PiP, content below it, centred vertically | lists, checklists, charts, flows, screenshots |
| `full` | fades out | header on top, content below (centred if there is no header) | chapter dividers, CTA, from-scratch videos |
| `split` | slides into the bottom half (face window, see `layout.splitFocus`) | top half: an `image` fills it edge to edge; other beats sit in it with their header | showing a screen, a document or a result while the speaker stays big |

Adjacent split beats merge like insert beats. Keep at least 1 s between a split window and an insert window.
Without footage every beat is treated as `full`, except `lowerthird` and the free-placed beats (`callout`, `annotate`, `zoom`, `transition`). Content never goes below the caption line.
Data beats render at 1.3× size in insert/full and 0.95× in overlay (override with `"scale": 1.1`). Sparse `list`,
`checklist`, `flow`, `stepper` and `bars` screens grow to fill about 75 % of their zone. Content taller than its zone is
shrunk automatically and the renderer prints a warning. Stat numbers shrink to fit their column.

## 3. Common fields (all beats)

| field | meaning |
|---|---|
| `t` | start time in seconds (clip time, same clock as transcript.md) |
| `dur` | seconds on screen, including the ~0.45 s exit. 3.5–8 s is typical |
| `type` | one of the types below |
| `mode` | `overlay` / `insert` / `full` / `split`; each type has a sensible default |
| `pos` | overlay zone: `top` / `center` / `bottom` |
| `kicker` | small uppercase label above the title (data beats) |
| `title` | kinetic headline for data beats (`titleSize` to override) |
| `glass` | overlay card background on/off |
| `scale` | content size multiplier |
| `align` | `"top"` to pin insert/full content to the top of its zone instead of centring |
| `backdrop` | `grid` / `dots` / `plain`: paints this part's own background in its palette under the footage window and fades it with the beat (graph paper for a whiteboard part; use with `palette`) |
| `palette` | colour just this beat with a library palette (`navy`, `maroon`, `paper`, `ink`, `jundy`) for variety |

## 4. Beat types

### title: kinetic headline
`upper: true` sets it in capitals, the hook look: `"text": "Cara skripsi\n*pake AI??*"` (line 2 in the accent colour).
`{ "type": "title", "t": 3.3, "dur": 4.5, "kicker": "Siaga banjir", "text": "*3 hal* yang wajib kamu tahu", "pos": "top" }`
Optional: `size` (px at 1080 wide, default 78 overlay / 96 full), `align`, `glass: true` for a card behind it.

### lowerthird: name tag
`{ "type": "lowerthird", "t": 0.6, "dur": 3.5, "name": "Jundy Aljihad", "role": "COO PT SKD" }`
Sits bottom-left just above the captions, whatever the mode.

### stat: big number(s)
```json
{ "type": "stat", "t": 30.6, "dur": 6, "value": 13, "label": "pos lapangan aktif di Agam", "source": "Laporan SIAGA SUMATRA" }
{ "type": "stat", "t": 12, "dur": 7, "mode": "insert", "title": "Hasil kuartal ini",
  "items": [ { "value": 128, "suffix": "%", "label": "kenaikan leads" }, { "value": 2.4, "decimals": 1, "suffix": " jt", "label": "views" } ] }
```
Fields: `value` (number → count-up; string → shown as is), `decimals`, `prefix`, `suffix`, `from`, `label`, `source`, `note`
(amber-bordered disclaimer line), `tone` (`accent2` default, `accent`, `pos`, `neg`, `neutral`),
`countUp: false` (sensitive data). Up to 4 `items` render as a 2-column grid.

### bars: horizontal bar chart
```json
{ "type": "bars", "t": 10, "dur": 7, "title": "Engagement per format",
  "items": [ { "label": "Reels", "value": 8.4 }, { "label": "Carousel", "value": 5.1 }, { "label": "Foto", "value": 2.2 } ],
  "unit": "%", "decimals": 1, "highlight": 0, "source": "Insight IG Mei 2026" }
```
Ordinal scales: `"ordinal": ["Tidak Baik", "Cukup", "Baik"]` with values 1..3. The labels become the axis and the value text.
Per-item `color` (`accent`, `accent2`, `pos`, `neg` or hex) and `display` (custom value text). `max` fixes the scale.

### compare: two columns
```json
{ "type": "compare", "t": 20, "dur": 7, "title": "Salah vs benar",
  "left": { "title": "Salah", "items": ["Nunggu air naik", "Cari info di grup"] },
  "right": { "title": "Benar", "items": ["Kenali jalur dulu", "Pantau info resmi"] } }
```
`leftTone` / `rightTone` default `neg` / `pos` (x and check icons). `rightAt`: seconds the right column waits after the
left one (default 0.9); raise it to land the right column on the spoken word.

### list: numbered points
`{ "type": "list", "t": 8.4, "dur": 7, "title": "Kenali status wilayah", "items": [ { "title": "Bahaya", "detail": "Risiko tinggi" }, "Waspada", "Relatif aman" ] }`
Items land one after another, spread over the beat (`every` = seconds between items, optional). Any item given as an
object can carry `at` (seconds from the beat start) to land on the word it names: `{ "title": "Ghosting", "at": 2.4 }`.
The same goes for `checklist` items and `flow` steps.

### checklist: items get checked one by one
`{ "type": "checklist", "t": 15.5, "dur": 7.5, "title": "Siapkan tas siaga", "items": ["Air minum", "Makanan tahan lama", "Obat-obatan"] }`
`every`, `size` (text px, default 31) optional. `mark: "x"` turns it into a list of what is wrong (red cross in place of the
green tick), e.g. for "orang yang nggak reliable, ghosting, nggak komit".

### flow: vertical process with drawn arrows
`{ "type": "flow", "t": 23.6, "dur": 6.5, "title": "Ikuti alurnya", "steps": [ { "label": "Kenali", "icon": "map", "detail": "Lihat peta risiko" }, { "label": "Waspada", "icon": "bell" } ] }`
Without `icon` the node shows its number.

### stepper: roadmap / progress
`{ "type": "stepper", "t": 50, "dur": 8, "title": "Roadmap", "stages": [ { "label": "Edukasi", "status": "done" }, { "label": "Evaluasi", "status": "done" }, { "label": "Prototipe", "status": "now" }, { "label": "Rilis", "status": "todo" } ] }`
The line fills up to the last `done` / the `now` stage. `now` pulses in accent2.

### image: screenshot or photo card with a camera
```json
{ "type": "image", "t": 12, "dur": 6, "src": "assets/app_home.png", "caption": "Contoh tampilan", "tag": "Prototipe",
  "crop": true, "camera": [ { "t": 0, "z": 1, "fy": 0 }, { "t": 3, "z": 1.3, "fx": 0.5, "fy": 0.45, "d": 1.2 } ],
  "rings": [ { "x": 0.05, "y": 0.4, "w": 0.9, "h": 0.12, "t0": 3, "t1": 5.5 } ] }
```
- `crop: true` keeps the card width and shows a window you pan with `camera`. Without it the whole image fits.
- `camera` keys: `t` (seconds from beat start), `z` zoom, `fx`/`fy` focus point 0..1, `d` move duration.
- `rings`: highlight boxes in image coordinates 0..1 (x, y, w, h), visible from `t0` to `t1`. Calibrate them on a still.
- `width` (fraction ≤ 1 or px), `height` (px), `tilt` (degrees), `radius`.
- In `split` mode the image fills the whole top panel, edge to edge, like a screen recording (`fill: false` keeps the card).
  The camera starts at the top of the image by default; pan down with `fy` to follow the content. `bg` sets the panel colour.

### quote
`{ "type": "quote", "t": 40, "dur": 5, "text": "Kenali jalur sebelum *panik*", "by": "Buku panduan SIAGA SUMATRA" }`

### chapter: section divider + chrome label
`{ "type": "chapter", "t": 8.2, "dur": 2.2, "num": "01", "name": "Status wilayah" }`
It updates the top-right chapter label until the next chapter. The default mode is `full`; use `"mode": "insert"` for a
lighter divider, or keep `dur` short (1.8–2.5 s).

### cta: end card
`{ "type": "cta", "t": 38, "dur": 5, "text": "Simpan & *bagikan*\nke keluarga", "handle": "@siagasumatra" }`

### custom: your own module
`{ "type": "custom", "t": 60, "dur": 8, "mode": "full", "module": "scenes/map_zoom.js", "anything": "passed through" }`
See `custom-scenes.md`.

### callout: a phrase on a solid box (tutorial highlight)
`{ "type": "callout", "t": 6, "dur": 2.4, "text": "keluar sebagai 0% AI generated", "style": "blue", "x": 0.5, "y": 0.4 }`
`style`: `blue` (default), `black`, `white`, `red`, `violet` / `teal` (both = the palette accent), `amber` (= accent2),
`gradient` (the site gradient), or `bg` + `color`. `x`, `y`: anchor point as fractions
of the canvas; `anchor`: `center` (default), `left`, `right`. `size` (px, default 40), `icon`, `rot` (degrees),
`arrow: [x, y]` draws a red arrow from the box to that point (`arrowColor`). `at`: seconds before it pops in (default 0.12).

### annotate: hand-drawn marks (tracked, boiling)
```json
{ "type": "annotate", "t": 10, "dur": 3, "color": "#FF2B2B", "width": 6, "boil": true, "shapes": [
  { "kind": "box", "x": 0.05, "y": 0.17, "w": 0.9, "h": 0.08, "at": 0.15 },
  { "kind": "ellipse", "x": 0.7, "y": 0.4, "w": 0.2, "h": 0.1, "keys": [ { "t": 0, "x": 0.7, "y": 0.4 }, { "t": 1.5, "x": 0.64, "y": 0.44 } ] },
  { "kind": "arrow", "from": [0.78, 0.44], "to": [0.62, 0.3], "at": 0.5 },
  { "kind": "text", "text": "{} are you scared to forget?", "cycle": ["who", "what", "why"], "every": 0.25, "x": 0.5, "y": 0.15, "size": 60, "italic": true } ] }
```
Kinds: `box` / `cross` (x, y, w, h), `ellipse` (x = centre, y = centre, w, h), `circle` (x, y, r as a fraction of width),
`arrow` (`from`, `to`, `head` px), `line` (`points`), `underline` (x, y, w), `text` (x, y, `size`, `italic`, `font`: serif
default or `sans`, `align`, `rot`; `{}` in `text` is replaced by the current `cycle` word every `every` s).
All coordinates are fractions of the canvas. Per shape: `at` (draw-on start, s from beat start), `draw` (draw-on length,
default 0.35), `until` (default: the beat end), `color`, `width`, `keys` ([{t, x, y, w, h, from, to}] relative to `at`, linear).
`boil` (default true) re-jitters strokes `boilFps` times a second (10) by `boilAmp` px (2.4); use `false` for clean UI boxes.
Text gets a dark `halo` so red stays readable on busy footage (`halo: false` to drop it, `haloColor` to change it).

### zoom: punch-in on the footage
`{ "type": "zoom", "t": 2.45, "dur": 0.9, "z": 1.16, "fx": 0.5, "fy": 0.33, "ease": "cut" }`
Scales the full-frame footage around the focus point (`fx`, `fy` as fractions of the frame; put `fy` on the face).
`ease`: `cut` (instant punch-in and out, default), `smooth` (0.45 s in and out; `in`/`out` override), `slow` (a push over
the whole beat). Use it on the key word of a sentence, 0.6–1.5 s long. It does not draw anything itself.

### transition: accent over a cut
`{ "type": "transition", "t": 8.6, "dur": 0.6, "style": "leak" }`
`style`: `leak` (warm light leak), `flash` (white), `dip` (black); `strength` 0..1. Centre it on the cut (t = cut − dur/2).
It sits above captions and the chrome. Use it on a change of layout (face → screen), not on every cut.

### chapter style "arc"
`{ "type": "chapter", "mode": "insert", "style": "arc", "num": 2, "name": "Formats", "palette": "graph", "backdrop": "grid" }`
A big arc draws, a dot lands on it, a large italic number and a light label slide in ("2  Formats"). `size` (number
px, default 230), `labelSize`, `height` optional. The top-right chapter label still updates as usual.

### mindmap: hub with boxes that draw themselves
`{ "type": "mindmap", "mode": "insert", "hub": "dentistry", "up": ["brushing", "flossing", "cavities"], "down": [{ "label": "gums", "at": 3.2 }, "veneers"] }`
Boxes above (`up`) and below (`down`) the hub, orthogonal connectors that draw, boxes that pop in one by one (`every`,
or `at` per child to land on the spoken word). `size` (px), `gap` optional. Use with palette `graph`.

### calendar: month grid that fills in
`{ "type": "calendar", "mode": "insert", "days": 30, "startDay": 3, "cells": { "6": "Chewing video" }, "circles": [6, 7], "circleAt": 2.4 }`
`startDay` = weekday of the 1st (0 = Sunday), `cells` = labels per day, `circles` = days that get a hand-drawn red circle.

### tag: monospace label with a curved arrow
`{ "type": "tag", "t": 6, "dur": 3, "x": 0.56, "y": 0.36, "text": "Modular", "sub": "handheld", "big": "15hr", "to": [0.68, 0.5] }`
A free-placed overlay (like `callout`). The text types in, then the arrow draws toward `to`. `curve` (-1..1) bends it, `align`
`left`/`right`, `color`, `size`, `speed` (characters per second), `at` (start inside the beat).

### iso: a small 3D scene that builds itself
`{ "type": "iso", "t": 0, "dur": 12, "palette": "frost", "grid": 8, "orbit": 4, "blocks": [ { "id": "base", "kind": "box", "x": 0, "y": 0, "w": 6, "d": 6, "h": 0.3, "at": 0.5 }, { "id": "core", "kind": "box", "x": 2, "y": 2, "w": 2, "d": 2, "h": 1.8, "z0": 0.3, "at": 2.8, "color": "accent", "label": { "text": "01 · CORE", "sub": "the first piece", "dx": 170, "dy": -130 } }, { "id": "orb", "kind": "globe", "x": 3, "y": 3, "z0": 2.1, "r": 0.85, "at": 5.4 } ], "links": [ { "from": "core", "to": "orb", "at": 6.6 } ], "camera": [ { "t": 0, "yaw": 30, "pitch": 38, "zoom": 1 }, { "t": 11, "yaw": 75, "pitch": 30, "zoom": 1.12 } ], "hud": { "tl": "LABS — PROJECT", "tr": "SCENE 01 / 03", "progress": "BUILD PROGRESS" }, "caption": [ { "text": "Everything starts from an |idea|.", "at": 0.8, "until": 4.5 } ] }`
A tiny real 3D renderer: an orbiting camera, flat-shaded faces lit from one side, back faces culled, solids sorted far to near.
- **Where it is drawn (it never has to hide you).** By mode: `"mode": "split"` (the default with footage) fills the top half while the
  speaker stays full size below; `"behind": true` fills the frame *behind* the speaker (needs `matte.py`, see below); `"mode": "insert"`
  with `layout.pip` at the bottom fills the area above the speaker's window; `"mode": "full"` takes the whole frame (hides the speaker, keep it short).
- **Grid units.** x and y on the ground, z up. `kind`: `box` (alias `slab`: x, y, w, d, h, z0), `prism` (x, y = centre, r, h, z0, `sides`: 20 round,
  6 hex), `pyramid` (x, y = centre, r, h, z0, `sides` 4), `poly` (`points`: [[x, y], …] any footprint, extruded by h: L-shapes, stairs, a plan view),
  `globe` (x, y = centre, z0, r; rotating wireframe), `cyl` (the old cylinder: x, y = corner, w = diameter). `color`: `soft` (default), `ink`,
  `accent`, `accent2`, `glass` (outline only), or any css colour.
- **Camera.** `camera`: keys `{ t, yaw, pitch, zoom, target: [x, y, z] }` with eased moves between them (default: true isometric, yaw 45°, pitch 35°);
  `orbit` adds a constant spin in degrees per second. `scale` enlarges the scene (default 1, 1.55 when `behind`), `cx` / `cy` move its centre (fractions of the region).
- **Parts.** Solids rise with a small overshoot at `at`, back to front (lower `z0` first). `label` pins a text box to the top with a leader line (`dx`, `dy` in px).
  `links` draw a dashed arc with a travelling dot between two ids. `hud` (corner marks, tiny text, counter; `false` hides it), `caption` lines with `|serif|` words.
  Use palette `frost` (light) or `blueprint` (dark).

### letterbox: black bars with a line of text
`{ "type": "letterbox", "t": 52, "dur": 6, "bar": 0.11, "text": "32bit float\ninternal recording" }`
Bars slide in at the top and bottom (ref d). `bar` = height of each bar as a fraction of the frame (check the face on close-ups, keep it small),
`textBottom`, `size`, `color`, `textColor` optional.

### kinetic: word-by-word typography scene
```json
{ "type": "kinetic", "t": 14.1, "dur": 4.6, "palette": "maroon",
  "words": [ { "w": "harapannya", "size": 44, "style": "light" },
             { "w": "three", "size": 118, "br": true }, { "w": "in", "style": "serif", "size": 96 }, { "w": "one", "size": 118, "color": "accent" },
             { "w": "seven", "size": 132, "style": "stamp", "br": true } ],
  "stickers": [ { "icon": "star", "at": 3.3, "x": 0.8, "y": 0.33, "w": 0.18, "rot": 12 } ] }
```
Words land one by one as they are spoken (matched in order against `transcript/words.json` from the beat start; `at`
overrides) and build lines in place (`br: true` starts a new line). Per word: `size` (px), `style` (`bold` default,
`light`, `serif`, `outline`, `stamp`, `vert`), `color` (`accent`, `ink` or a hex), `rot`. Beat fields: `palette`
(`brand` default = the project palette, or any library palette: `maroon`, `paper`, `ink`, `navy`, `jundy`), `bg` / `ink` overrides (`bg: "none"` to type over the footage with
`mode: "overlay"`), `y` (vertical centre, default 0.5), `wordGap`, `lineGap`, `every` (spacing for words with no match),
`exit` (`cut` default, or `fade`), `sfx` (false to mute the per-word ticks). Captions step aside during a kinetic beat
because it already shows the words (`captions: true` keeps them). `rings`: `[{ "text": "PACING", "x": 0.5, "y": 0.52, "r": 0.34, "size": 96, "spin": 16, "at": 0.1 }]` sets a keyword around a spinning circle. `stickers`: PNG cut-outs (`src`) with a
white paper edge, or a line `icon`; `at`, `x`, `y` (centre), `w` (fraction of width), `rot`, `outline: false` for
logos or cards that should keep their own edge (a soft shadow only).
The default mode is `full`, so the footage fades out behind it. Keep one phrase per beat (1.5–5 s) and cut to the next.

## 5. Text markup
In `title`, `text` and quotes: `*accent words*` (violet in `jundy`), `_accent2 words_` (orange), `~negative words~`,
`^gradient words^` (violet → pink → orange, the site's text gradient), `|serif words|` (serif italic in the accent colour, ref a/b); markers can span several words; `\n` for a line break.
Keep headlines ≤ ~7 words. Wrapping is automatic.

## 6. Complete example (footage mode, 43 s talking head)
```json
"beats": [
  { "t": 0.6, "dur": 3.4, "type": "lowerthird", "name": "Nama Pembicara", "role": "Peran" },
  { "t": 3.3, "dur": 4.8, "type": "title", "kicker": "Siaga banjir", "text": "*3 hal* yang wajib kamu tahu", "pos": "top" },
  { "t": 8.4, "dur": 6.9, "type": "list", "kicker": "01 · Status wilayah", "title": "Kenali status wilayah kamu",
    "items": [ { "title": "Bahaya", "detail": "Risiko tinggi" }, { "title": "Waspada", "detail": "Risiko sedang" }, { "title": "Relatif aman", "detail": "Risiko rendah" } ] },
  { "t": 15.5, "dur": 7.8, "type": "checklist", "kicker": "02 · Tas siaga", "title": "Siapkan tas siaga", "items": ["Air minum", "Makanan tahan lama", "Obat-obatan", "Dokumen penting"] },
  { "t": 23.6, "dur": 6.7, "type": "flow", "kicker": "03 · Alur", "title": "Ikuti alurnya",
    "steps": [ { "label": "Kenali", "icon": "map" }, { "label": "Waspada", "icon": "bell" }, { "label": "Siapkan", "icon": "backpack" }, { "label": "Evakuasi", "icon": "run" } ] },
  { "t": 30.6, "dur": 7.2, "type": "stat", "value": 13, "label": "pos lapangan aktif di Agam", "source": "Laporan SIAGA SUMATRA", "pos": "bottom" },
  { "t": 38.0, "dur": 5.3, "type": "cta", "text": "Simpan & *bagikan*\nke keluarga", "handle": "Bagikan sekarang" }
]
```
Icons available: map, alert, route, backpack, book, bolt, lifebuoy, megaphone, rain, shield, eye, bell, run, phone, check, x,
users, pin, chart, trend, money, clock, target, idea, star, arrow, play, home, building, heart.
