# project.json and beat reference

## Contents
1. project.json top level
2. Modes, positions and zones
3. Common beat fields
4. Beat types: title · lowerthird · stat · bars · compare · list · checklist · flow · stepper · image · quote · chapter · cta · custom
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
  "captions": { "enabled": true, "y": 0.775, "size": 56, "maxWords": 4, "upper": false },
  "audio": { "voice": true, "sfx": 1.0, "pad": "auto", "music": null, "music_gain_db": -20, "target_lufs": -14 },
  "beats": [ ... ]
}
```
- `footage`: true when `prep_footage.py` was run (it fills `duration`). For from-scratch videos use false and set `duration`,
  or leave it out to end 0.6 s after the last beat.
- `brand`: every key is optional. `accent` is the main highlight, `accent2` the emphasis/number colour. `font` is an
  `@fontsource` package id installed via `setup.sh`.
- `chrome`: `false` hides it. Omit `name` and `logo` for a bare progress bar. `logo` sits on a white rounded badge.
- `captions`: needs `transcript/words.json`. `y` is the fraction of height where the caption line starts.
- `layout.overlayBottom`: optional fraction of height that overlay cards must stay above, for footage that already has
  burned-in subtitles or on-screen text (e.g. `0.75` when the subtitles start at y ≈ 1460 of 1920). With `pos: "bottom"`
  the card then sits in the band between the chin and the subtitles. Insert and full content is not affected.
- `audio.music`: optional path to a licensed track, ducked under the voice. It is not looped, so use a track at least as long as the video.

## 2. Modes, positions, zones

| mode | footage | where content goes | good for |
|---|---|---|---|
| `overlay` | stays full-frame | a glass card (or plain text for `title`) in zone `pos`: `top`, `center`, `bottom` | one number, a short title, a quote, a name |
| `insert` | shrinks to a rounded PiP, top-right (30 % width) | header left of the PiP, content below it, centred vertically | lists, checklists, charts, flows, screenshots |
| `full` | fades out | header on top, content below (centred if there is no header) | chapter dividers, CTA, from-scratch videos |

Without footage every beat is treated as `full`, except `lowerthird`. Content never goes below the caption line.
Data beats render at 1.3× size in insert/full and 0.95× in overlay (override with `"scale": 1.1`). Sparse `list`,
`checklist`, `flow`, `stepper` and `bars` screens grow to fill about 75 % of their zone. Content taller than its zone is
shrunk automatically and the renderer prints a warning. Stat numbers shrink to fit their column.

## 3. Common fields (all beats)

| field | meaning |
|---|---|
| `t` | start time in seconds (clip time, same clock as transcript.md) |
| `dur` | seconds on screen, including the ~0.45 s exit. 3.5–8 s is typical |
| `type` | one of the types below |
| `mode` | `overlay` / `insert` / `full`; each type has a sensible default |
| `pos` | overlay zone: `top` / `center` / `bottom` |
| `kicker` | small uppercase label above the title (data beats) |
| `title` | kinetic headline for data beats (`titleSize` to override) |
| `glass` | overlay card background on/off |
| `scale` | content size multiplier |
| `align` | `"top"` to pin insert/full content to the top of its zone instead of centring |

## 4. Beat types

### title: kinetic headline
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
`leftTone` / `rightTone` default `neg` / `pos` (x and check icons).

### list: numbered points
`{ "type": "list", "t": 8.4, "dur": 7, "title": "Kenali status wilayah", "items": [ { "title": "Bahaya", "detail": "Risiko tinggi" }, "Waspada", "Relatif aman" ] }`
Items land one after another, spread over the beat (`every` = seconds between items, optional).

### checklist: items get checked one by one
`{ "type": "checklist", "t": 15.5, "dur": 7.5, "title": "Siapkan tas siaga", "items": ["Air minum", "Makanan tahan lama", "Obat-obatan"] }`
`every`, `size` (text px, default 31) optional.

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

## 5. Text markup
In `title`, `text` and quotes: `*teal words*`, `_amber words_`, `~red words~` (markers can span several words), `\n` for a line break.
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
