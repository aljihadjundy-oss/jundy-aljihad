# Style library (grows with every reference, nothing is ever removed)

Every benchmark video the user sends becomes a new style in this library. Earlier styles and palettes stay, so a
video can combine them part by part and the audience never sees the same look twice in a row. The agent decides which
style each part uses (the user asked for this: "Jundy decide tiap part pake style yang mana") and shows the choice in
the motion plan. The numbers below were measured on the references (time in seconds, positions as fractions of the frame).

## Contents
0. Standing rules, style index, palette library, per-part decision rubric, adding a new reference
1. S1 Tutorial split-screen (ref A): screen on top, speaker below
2. S2 Kinetic collage typography (ref B): voice-over words that build on a solid colour
3. S3 Tracked hand-drawn annotation (ref C): red marks that follow things in the shot
3.1 S4 Blueprint / isometric build (refs a, b): a diagram that builds itself, block by block
3.2 S5 Whiteboard on graph paper (ref e): mind map, calendar, numbered chapters, the speaker as a small window
3.3 S6 Spec tags (ref d): mono labels with curved arrows on a product shot
3.4 Ring text (ref c, an extension of S2)
4. Which style when, for talking-head founder content
5. Limits

## 0. Standing rules
- **Additive only.** A new reference adds a style (and its palette) to this file. Never delete, rename away or
  "replace" an earlier style or palette, even if the new one feels better. Combining is the point.
- **The agent decides per part.** Do not ask the user which style to use. Pick one per part with the rubric below and
  write it in the plan table (`style` column + a few words of why). The user approves or corrects the plan.
- **Palette: one locked base, library accents.** `jundy` (the user's site, jundy-aljihad.vercel.app) is the locked base:
  chrome, captions and most beats use it. Library palettes (navy, maroon, paper, ink, and any future ones) may colour
  individual parts for variety, at most 1–2 parts per video, so the identity stays recognisable.
- **Pacing beats style.** Whatever the styles, the opening follows `retention.md` (a visual in the first 0.5 s, the key
  message on screen by 3 s, ≥ 3 visual events in the first 10 s, the second beat no later than ~1 s after the first).

### Style index
| id | style | source | signature | beats |
|---|---|---|---|---|
| S0 | House infographic | SIAGA SUMATRA (original) | glass cards, count-ups, checklists, flows, PiP insert, contour backdrop | `title` `stat` `bars` `compare` `list` `checklist` `flow` `stepper` `image` `quote` `chapter` `cta` |
| S1 | Tutorial split-screen | ref A | screen on top, face below, boxed seam captions, blue callouts, red UI boxes, uppercase hook, punch-in, light leak | `image` (split) `callout` `annotate` (boil false) `zoom` `transition` `title` (upper) |
| S2 | Kinetic collage typography | ref B | words land as spoken on a solid colour, mixed type, stamps, paper stickers, hard cuts | `kinetic` |
| S3 | Tracked hand-drawn annotation | ref C | boiling red marks on objects, tracked, cycling words | `annotate` |
| S4 | Blueprint / isometric build | refs a, b | isometric blocks that rise one by one, leader-line labels, HUD corners, a build-progress counter, serif-italic accent words, a wireframe globe | `iso` `title`/captions with `\|serif\|` |
| S5 | Whiteboard on graph paper | ref e | graph-paper backdrop, big black type, mind map and calendar that draw themselves, numbered chapters on an arc, the speaker as a wide window at the bottom, one-word grey caption chips | `mindmap` `calendar` `chapter` (`arc`) `layout.pip` `backdrop` captions `word` |
| S6 | Spec tags | ref d | small monospace labels typed in with a hand-drawn curved arrow pointing at a detail of a product shot | `tag` |

Accents that work inside any style: `zoom` punch on the key word, `transition` leak on a layout change, `callout` for
one claim, `^gradient^` headline words in the locked palette.

### Palette library
| id | colours | origin | use |
|---|---|---|---|
| `jundy` (locked default) | bg #06050A, ink #F5F3FF, accent violet #A78BFA, accent2 orange #FB923C, accent3 pink #F472B6, pos #34D399, neg #FB7185, glows #7C3AED / #DB2777 | the user's site | everything by default |
| `navy` | bg #0A1E36, accent teal #3FB6C4, accent2 amber #E0A100 | S0 / SIAGA | a data-heavy part, a calm explainer part |
| `maroon` | bg #4E1A26, ink #EFDCCB, accent #F2B45A | S2 / ref B | a kinetic interlude |
| `paper` | bg #EFE6D8, ink #1F1B18, accent #C23B22 | S2 variant | a light kinetic or quote card |
| `ink` | bg #111111, ink #F4F1EA, accent #F2C94C | S2 variant | a stark kinetic punchline |
| `frost` | bg #EEF1F7, surface #FFFFFF, ink #0B1220, accent #2B3FD6, accent2 #FF5A36 | S4 / refs a | the light isometric explainer |
| `blueprint` | bg #03050D, surface #0A1230, ink #E8EEFF, accent #4C6BFF, accent2 #9DB4FF | S4 / ref b | the dark isometric explainer |
| `graph` | bg #EDEDEA, surface #FFFFFF, ink #0F0F0F, accent and accent2 #D32F2F | S5 / ref e | whiteboard parts on graph paper |

Project-wide: `brand.palette` (default `jundy`). Per part: `"palette": "maroon"` on a beat colours just that beat.

### Per-part decision rubric (how Jundy decides)
Outcome first: every part has a job, and the style is whatever does that job best for retention and clarity.
1. **Name the job of the part**: hook · structure (list, steps, comparison, number) · proof (a screen, a document, a
   result) · punchline or idiom · "look at this" · section change · CTA.
2. **Map job → style**: hook → S1 (uppercase title + `zoom` punch) or S2 (one kinetic hook screen); structure → S0;
   proof → S1 split; punchline, idiom, words said fast → S2; "look at this" → S3 (or an S1 red box on a screen);
   section change → `transition` + the next part's style; CTA → S0 `cta` or an S1 callout, in the locked palette.
   Added with refs a–e: "how a system or product is built / how the pieces fit" → S4 `iso`; "a method with steps, a mind
   map, a content calendar, numbered chapters" → S5; "a detail of an object that needs naming" (a gadget, a UI part) → S6 `tag`;
   a repeated keyword that should loop around the shot → S2 `rings`.
3. **Break ties with evidence, then novelty**: prefer the style that shows proof (a screen, a number, a real output)
   over one that only decorates; if still tied, pick the style used least recently. When the proof needs an asset the
   user has not sent, plan the fallback style and put the asset on the wishlist (see SKILL.md, "Proof over decoration").
4. **Anti-monotony checks**: no two consecutive graphic parts in the same style unless they are one continuous idea;
   a 60 s video uses at least 3 styles and a 2-minute video at least 3–4; no single style takes more than half of the
   graphic time; at most 1–2 parts in a non-base palette.
5. **House rules still win**: never cover the face (S2 full-screen interludes ≤ 5 s each and ≤ 15 % of the runtime),
   on-screen words come from the transcript, numbers only if said or supplied.

### Adding a new reference
1. Probe it (`ffprobe`), detect cuts (`ffmpeg -vf "select='gt(scene,0.25)',showinfo"`), build contact sheets at 1–4 fps
   and 10 fps around cuts, and look at a spectrogram for music, SFX and voice.
2. Write a new section here: the next id (S4, S5 …), what happens moment by moment with measured timings, positions,
   colours and fonts, the audio, and a project.json recipe. Add its palette to the palette library (and to
   `scripts/runtime/palettes.js`) if it brings one.
3. If it needs something the engine cannot draw, add or extend a beat (keep old behaviour identical; re-render an old
   project's stills and compare) and document it in `beats.md`.
4. Add the style to the index and the rubric mapping. Leave every earlier entry as it is.

## 1. S1 Tutorial split-screen (ref A)
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

## 2. S2 Kinetic collage typography (ref B)
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

## 3. S3 Tracked hand-drawn annotation (ref C)
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

## 3.1 S4 Blueprint / isometric build (refs a and b)
Measured on two 25–29 s motion pieces without a speaker (a light one and a dark one, both a "Labs" project introduction):
- **Structure.** A flat plate appears at 0:00–0:02, a small glowing point marks the centre, then plates stack (0:04–0:09),
  blocks and a wireframe globe rise one by one (0:09–0:15), floating labels with leader lines pin to them, dashed links
  with a travelling dot join the parts (0:13–0:17), and the whole city of blocks pulls back (0:18–0:23) before the title
  lands. A counter in a corner runs 000 → 100 % ("BUILD PROGRESS") for the whole piece.
- **Type.** A small sentence at the bottom left that changes with each phase, with one accent word in serif italic
  ("Everything starts from an *idea*.", "Piece by piece, it takes *shape*.", "From one idea to a living *system*.").
  Tiny monospace HUD text in the corners ("LABS — PROJECT INTRODUCTION", "SCENE 01 / 03"). The dark version adds a big
  "Labs." title with a glitch-in and a 3D bar chart whose columns carry numbers (07, 03, 12).
- **Colour.** Light: near-white background, white blocks, one saturated blue core. Dark: near-black navy, wireframes and
  one electric-blue core.
- **Recipe.** `{ "type": "iso", "palette": "frost" | "blueprint", "backdrop": "plain", "blocks": [...], "links": [...],
  "hud": {...}, "caption": [{ "text": "Everything starts from an |idea|.", "at": 0.8, "until": 4.5 }] }`. Use it as a
  full-screen part (8–14 s) when the speaker explains how something is built or how pieces fit together, or as the
  opening of a no-footage explainer. Keep the sentence at the bottom in step with what the voice says.
- **Never hide the speaker with it.** The default mode is `split` (the scene fills the top half, you stay full size below); `behind: true` puts
  the scene behind the matted speaker; only `mode: "full"` hides the speaker, and then it counts toward the full-screen interlude budget
  in the rubric (≤ 15 % of the runtime in total).
- **It is a small real 3D renderer** now: an orbiting camera (`camera` keys, `orbit`), flat shading, `box`, `prism`, `pyramid`, `poly` (any
  extruded footprint) and a rotating wireframe `globe`. Still not a modelling tool: no textures, no free-form meshes.

## 3.2 S5 Whiteboard on graph paper (ref e)
Measured on an 83 s marketing explainer (portrait, a speaker in a dark room):
- **Layout.** Light graph-paper backdrop over the whole frame, the speaker shrinks to a wide rounded window at the bottom
  (about 88 % wide, 22 % high) and the whole area above is the board. Between board parts the speaker takes the full frame
  with one-word grey caption chips in the centre, then shrinks back. Each board part is 3–8 s.
- **Board parts.** A calendar ("30 days of content") whose days fill in; a plain grid ("6/5 method"); a big number on a
  curved line with a dot ("1 Find", "2 Formats"); a mind map (hub "dentistry" with brushing, flossing, cavities above and
  mouth guards, gums, veneers below) whose connectors draw; a phone mockup with a red hand-drawn circle; a database
  poster; grey chips with one word ("Then", "get the picture.").
- **Recipe.** `layout.pip: { "pos": "bottom", "w": 0.88, "h": 0.22, "fy": 0.45 }`, `captions: { "style": "word" }`, and per
  board part `"mode": "insert", "palette": "graph", "backdrop": "grid"` with `mindmap`, `calendar`, `chapter` (`style: "arc"`),
  `stat`, `checklist` or `image`. Captions step aside automatically while a board part is on.
- **Why it works.** The speaker never disappears (retention), and the board gives a method a visible shape.

## 3.3 S6 Spec tags (ref d)
Measured on a 101 s product review (portrait, warm low-key light): short monospace lines ("Modular", "handheld", "15hr",
"plug & play") with a thin hand-drawn curved arrow that points at the part of the product being named, typed in over
0.3–0.6 s; a spec title card top left ("Sennheiser / Profile Wireless 2-Channel"); words sliding in with a horizontal
smear at the bottom; black letterbox bars with a line of small text in the top bar. The grade is warm and dark.
- **Built.** The smear is `captions.enter: "smear"` (each line blurs in from the left and out to the right); the bars are the `letterbox` beat.
- **Recipe.** `{ "type": "tag", "x": 0.56, "y": 0.36, "text": "Modular", "sub": "handheld", "big": "15hr", "to": [0.68, 0.5] }`
  over footage, 2–3 s each, placed beside the detail (never on the face). Use for gadget reviews, UI walk-throughs and any
  "this part does that" moment. Add `letterbox` for the black bars with a spec line, and `captions.enter: "smear"` for the sliding words.

## 3.4 Ring text (ref c, an extension of S2)
Ref c is a 20 s kinetic collage (red, white, blue and black blocks, huge type, face cut-outs inside letters, type
that wraps around a circle). The existing S2 `kinetic` covers the word-by-word part. Added: `rings` on a kinetic beat
puts a keyword around a circle that spins, with the shot (or a sticker) in the middle: `"rings": [{ "text": "PACING",
"x": 0.5, "y": 0.52, "r": 0.34, "size": 96, "spin": 16 }]`. Not built: type that sits *behind* the speaker (it needs a
cut-out of the person). Now built: `behind: true` on a beat puts it between the background footage and the matted speaker (see `beats.md`).
The matte is computed once by `matte.py` (a segmentation model, run offline, then plain files), so the render stays deterministic.
Recipe for ref c's look: `{ "type": "kinetic", "behind": true, "palette": "maroon", "words": [{ "w": "NOBODY", "size": 330, "color": "accent" }] }`
with the speaker in front; face cut-outs inside letters are not built.

## 4. Which style when (talking-head founder content)
| moment in the video | style | beats |
|---|---|---|
| hook in the first 3 s | S1 or S2 | `title` with `upper: true` + `zoom` punch on the key word, or one `kinetic` hook screen |
| a data point or a structured list | S0 | `stat`, `checklist`, `flow`, `compare`, `list` |
| you show a tool, a document, a dashboard, a result | S1 | `image` in `split` + `callout` + `annotate` box, `captions.when: "split"` |
| a switch of section or from face to screen | S1 accent | `transition` leak (0.5–0.6 s, centred on the cut) |
| a punchline, an idiom, a list of words said fast | S2 | `kinetic` 2–5 s, `palette` brand (locked) or a library palette for variety |
| "look at this" on something in the shot | S3 | `annotate` with boil, tracked `keys` |
| the CTA | S0 | `cta` in the locked palette, held to the last frame |
| how a system is built, how the pieces fit | S4 | `iso` (8–14 s, `frost` or `blueprint`), short and sparing |
| a method, a calendar, a mind map, numbered steps | S5 | `mindmap` `calendar` `chapter` (`arc`) with `layout.pip` at the bottom, `backdrop: "grid"` |
| naming a part of a product or a UI detail | S6 | `tag` (2–3 s), beside the detail |
| a keyword that should loop around the shot | S2 ext | `kinetic` with `rings` |

A worked mix for the 2-minute talking head "banyak jasa chaos" (times follow the transcript; beats always sync to speech):
0:00 S1 uppercase hook "Nambah service bukan growth" + 0:02.5 `zoom` punch on "itu bullshit" → 0:04.7 S1 callout
"bukan yang paling banyak nawarin jasa" → 0:07.8 S3 scrawl "justru kebalikannya" on the footage → 0:14.3 S2 kinetic
"three in one / five in one / seven in one" → 0:20 S0 checklist of services → 0:40 S3 red "CHAOS" → 0:50 S0 flow of the
domino effect → 1:05 S0 compare + checklist → 1:16 S1 callout "operational precision" + zoom → 1:22 S0 stat "6 lini
bisnis" → 1:31 S1 split with a screenshot of a price list (only if the user supplies one; otherwise S0 checklist) →
1:48 S2 kinetic "stop dulu." in the maroon palette → 1:56 S0 CTA in the locked palette.
The first cut of that video had plain footage from 0:03 to 0:15; this mix fills it with three light interrupts.

Keep the house rules: one idea per beat, clean footage in the body (30–50 %), never cover the face. Split mode is the
friendliest way to show a screen without hiding the speaker. If the footage has burned-in subtitles, they are cropped
in split mode, so turn on `captions` with `when: "split"` to replace them on the seam.

## 5. Limits
- `iso` is a small 3D renderer (orbiting camera, flat shading, back-face culling, depth sort by solid): no textures, no shadows, no free-form
  meshes, and two solids that interpenetrate can sort wrongly. For a richer scene use a `custom` beat.
- `behind` depends on the person matte: it follows the speaker well in a talking-head shot, struggles with fast hands in front of the face, and
  needs `pip install mediapipe` (the model is ~250 KB). Face cut-outs inside letters (ref c) are not built.
- The top panel takes still images (screenshots) with camera pans and zooms. A screen *recording* as video is not
  supported yet; export 2–4 key screenshots and cut between them with camera moves instead.
- 3D icon props and collage stickers need PNG files with transparency in `assets/`. Built-in line icons work as simple
  stickers (`"icon": "star"`).
- Tracking in `annotate` is manual (keyframes), so keep tracked marks short (1–3 s) or on slow-moving objects.
