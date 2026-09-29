# Reference styles (learned from the user's benchmark videos)

Three short-form edits the user sent as benchmarks, broken down frame by frame. Each one maps to beats this skill can
render. Use them as recipes: pick the style that fits the moment, not a single style for a whole video. The numbers
below were measured on the references (time in seconds, positions as fractions of the frame).

## Contents
1. Tutorial split-screen (ref A): screen on top, speaker below
2. Kinetic collage typography (ref B): voice-over words that build on a solid colour
3. Tracked hand-drawn annotation (ref C): red marks that follow things in the shot
4. Which style when, for talking-head founder content
5. Limits

## 1. Tutorial split-screen (ref A)
A 60 s Indonesian talking-head tutorial ("cara skripsi pake AI"). About 9 layout changes in 60 s. The face is never
off screen for more than about 3 s, because the split keeps it in the bottom half while the screen is shown.

| moment | what happens | measured |
|---|---|---|
| hook, 0–4.7 | full-frame face, two-line uppercase title at chest height: line 1 white, line 2 blue | line 1 fades in 0.1→0.5, line 2 rises 0.6→1.0; y ≈ 0.62 |
| hook props | small 3D icons (folders, "100% AI → 0% AI" document) float over the head with a dashed link | 2.3–4.6 |
| first cut | warm light-leak wash from face to screen | ≈ 0.25 s peak, 4.7 |
| body | split: screen recording in the top half (zoomed on the input box as text is typed), face in the bottom half | seam at y ≈ 0.50 |
| captions in split | 2–4 words, white bold on a solid black box, left-aligned, sitting on the seam | x ≈ 0.04, ≈ 3.5 % of width tall |
| captions full-frame | plain white bold with shadow, no box, centred at y ≈ 0.60 | |
| emphasis | a claim in a blue box over the screen ("keluar sebagai 0% AI generated") | blue ≈ #1D6FE8 |
| pointing | red rectangles around UI elements (a menu item, a command, a result line) | stroke ≈ 4–6 px |
| concept slides | full-screen white slides: a bullet list, a side-by-side "robotic vs natural" | 1–2 s each |
| outro | face with a small profile screenshot and a red circle ("link-nya ada di bio") | last 2 s |

Audio: voice-led, a quiet bed, UI clicks from the recording. Rhythm: a new visual every 2–4 s inside a section.

Recipe (split + screenshot + seam captions + blue callout + red box):
```json
"layout": { "seam": 0.5, "splitFocus": 0.32 },
"captions": { "enabled": true, "when": "split" },
"beats": [
  { "t": 0.0, "dur": 4.4, "type": "title", "upper": true, "text": "Cara skripsi\n*pake AI??*", "pos": "bottom", "size": 88 },
  { "t": 4.4, "dur": 0.6, "type": "transition", "style": "leak" },
  { "t": 4.7, "dur": 9.0, "type": "image", "mode": "split", "src": "assets/claude_chat.png",
    "camera": [ { "t": 0, "z": 1, "fy": 0 }, { "t": 6, "z": 1.35, "fx": 0.3, "fy": 0.7, "d": 1.4 } ] },
  { "t": 6.0, "dur": 2.4, "type": "callout", "text": "keluar sebagai 0% AI generated", "style": "blue", "x": 0.5, "y": 0.4 },
  { "t": 9.0, "dur": 3.0, "type": "annotate", "shapes": [ { "kind": "box", "x": 0.06, "y": 0.18, "w": 0.6, "h": 0.05 } ], "boil": false }
]
```
Set `splitFocus` to where the face is (fraction of frame height; 0.3 for a head in the upper half). Check a still: the
chin and the top of the hair should both be inside the bottom panel.

## 2. Kinetic collage typography (ref B)
A 20 s voice-over explainer ("jack of all trades…") with no footage. Solid maroon (#4E1A26) with cream type (#EFDCCB).

- **Words land as they are spoken**, one every 0.25–0.5 s, and build a stacked phrase in place. The layout is fixed from
  the start (space is reserved), so words never push each other around.
- **Phrase screens hard-cut** every 1–3 s. No exit animation.
- **Mixed type** for hierarchy: heavy geometric sans for most words, small connectors ("of", "that") at 40 % size, one
  thin display-serif word for the idea ("none", "Quote"), a ransom-note stamp for the loaded word ("INSULT"), vertical
  words for the idiom ("ALL", "TRADES").
- **Collage stickers**: paper-edged cut-outs (playing card, dove, sun, magnifier, statue) pop in beside the words and
  stay until the cut.
- **Sound**: a small tick per word; the music bed enters at the turn of the argument ("but oftentimes better…").

Recipe (one phrase screen; add a beat per screen):
```json
{ "t": 12.9, "dur": 2.2, "type": "kinetic", "palette": "maroon",
  "words": [ { "w": "Jack", "size": 150 }, { "w": "of", "size": 50, "br": true }, { "w": "all", "size": 90 },
             { "w": "trades", "style": "vert", "size": 44 } ],
  "stickers": [ { "src": "assets/card_jack.png", "at": 0.5, "x": 0.52, "y": 0.62, "w": 0.18, "rot": -4 } ] }
```
Timing comes from `transcript/words.json` automatically (each word is matched in order from the beat start); give
`at` only to override. For a talking-head video, use a kinetic screen as a 2–5 s interlude on a punchline or an idiom.

## 3. Tracked hand-drawn annotation (ref C)
An 8 s moody clip (night drive, 4:3) with red marks drawn over the footage and no voice.

- Red (#FF2B2B) boxes, circles, arrows, question marks and labels ("EYES!!!") sit on objects and **move with them**
  (tracked by hand: position keys every 0.5–1 s).
- A condensed red serif question at the top, whose first word **cycles** who → what → when → where → why every ≈ 0.25 s.
- Strokes **boil**: redrawn about 10–12 times a second with a 2–3 px jitter, so they read as hand-made.
- Blue marks are a secondary colour for small details.
- Sound: an ambient drone only.

Recipe:
```json
{ "t": 20.3, "dur": 5.8, "type": "annotate", "shapes": [
  { "kind": "text", "text": "{} ada.", "cycle": ["desain", "media", "event", "IT"], "every": 1.2, "x": 0.5, "y": 0.6, "size": 92, "italic": true },
  { "kind": "ellipse", "x": 0.72, "y": 0.4, "w": 0.2, "h": 0.1, "at": 0.4,
    "keys": [ { "t": 0, "x": 0.72, "y": 0.4 }, { "t": 1.5, "x": 0.66, "y": 0.43 } ] },
  { "kind": "arrow", "from": [0.9, 0.55], "to": [0.78, 0.45], "at": 0.7 } ] }
```
Calibrate positions on stills (`render.mjs --stills`), then add `keys` where the object moves.

## 4. Which style when (talking-head founder content)
| moment in the video | style | beats |
|---|---|---|
| you show a tool, a document, a dashboard, a result | A | `image` in `split` + `callout` + `annotate` box, `captions.when: "split"` |
| hook in the first 3 s | A | `title` with `upper: true`, optional `zoom` punch on the key word |
| a switch of section or from face to screen | A | `transition` leak (0.5–0.6 s, centred on the cut) |
| a punchline, an idiom, a list of words said fast | B | `kinetic` 2–5 s, `palette` maroon/paper/ink/brand |
| "look at this" on something in the shot | C | `annotate` with boil, tracked `keys` |
| a data point or a structured list | house style | `stat`, `checklist`, `flow`, `compare` (unchanged) |

Keep the house rules: one idea per beat, leave clean footage (30–50 %), never cover the face. Split mode is the
friendliest way to show a screen without hiding the speaker. If the footage has burned-in subtitles, they are cropped
in split mode, so turn on `captions` with `when: "split"` to replace them on the seam.

## 5. Limits
- The top panel takes still images (screenshots) with camera pans and zooms. A screen *recording* as video is not
  supported yet; export 2–4 key screenshots and cut between them with camera moves instead.
- 3D icon props and collage stickers need PNG files with transparency in `assets/`. Built-in line icons work as simple
  stickers (`"icon": "star"`).
- Tracking in `annotate` is manual (keyframes), so keep tracked marks short (1–3 s) or on slow-moving objects.
