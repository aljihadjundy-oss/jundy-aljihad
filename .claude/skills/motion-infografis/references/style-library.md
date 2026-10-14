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
3.10 S12 Landscape card switcher with pop-out (ref 6) · 3.5 S7 Newsroom ticker & glitch (ref 1) · 3.6 S8 Camera HUD & slab (ref 5) · 3.7 S9 Product UI demo (ref 2) · 3.8 S10 Engraving & accent word swap (ref 3) · 3.9 S11 Editorial type stack (ref 4)
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
| S7 | Newsroom ticker & glitch | ref 1 (Stockwise) | deep-indigo field, ticker tapes along the top and bottom edge, a word that lands split in red/cyan and snaps together, a violet second word, diagonal colour-panel wipes, a news card that floats in with a LIVE pill | `glitch` `ticker` `wipe` `image` |
| S8 | Camera HUD & slab | ref 5 (PLANE → CLAUDE) | black field, one orange slab that tilts in 3D and collapses to a hairline with a ruler and a glowing dot, then a glitched word; corner brackets, timecode, REC dots, tiny mono labels | `slab` `hud` `glitch` |
| S9 | Product UI demo | ref 2 (Frame by Frame) | light interface, an animated pointer that moves and clicks (ripple), a menu-bar app that springs open, an app logo with satellite chips that circle it | `cursor` `orbit` `image` |
| S10 | Engraving & accent word swap | ref 3 (Claude) | warm white paper, one bold serif word whose punctuation changes (ask? → task) in a single terracotta accent, vintage engravings cut out in grey with one accent shape | `roll` (`serif`) `glitch` `image` |
| S11 | Editorial type stack | ref 4 (Lightspark) | off-white grid paper, one neutral grotesque, lines that stack and dim as the next arrives, a huge number with a tiny caption, a slot-machine word, black bumper frames | `stack` `roll` `title` |
| S12 | Landscape card switcher (pop-out) | ref 6 (reels explainer, 62 s) | for LANDSCAPE raw: hard cuts between a full-portrait close-up and a bottom card with the graphic above; the speaker's cap breaks the card's top edge (two layers); graphics whip in with a motion blur | `layout.card` `mode: "card"` `backdrop` captions dark |

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
| `newsroom` | bg #070A1E, surface #10163A, ink #F4F6FF, accent #5B5BE8, accent2 #8C8CFF | S7 / ref 1 | the broadcast / ticker part |
| `hud` | bg #0A0A0A, ink #F5F2EC, accent #E8421C, accent2 #FF7A4D | S8 / ref 5 | the camera-HUD slab part |
| `ui` | bg #F7F8FB, surface #FFFFFF, ink #14213D, accent #2F6BFF, accent2 #22C1F5, accent3 #2BBF8E | S9 / ref 2 | a light product-UI part |
| `engrave` | bg #FBFAF8, ink #141414, accent #D9704F | S10 / ref 3 | the paper + one terracotta accent part |
| `editorial` | bg #F4F4F1, ink #111111, accent2 #8C8C88 (the dim grey) | S11 / ref 4 | the neutral type stack; pair it with a black bumper (`ink` palette) |

Project-wide: `brand.palette` (default `jundy`). Per part: `"palette": "maroon"` on a beat colours just that beat.

### Per-part decision rubric (how Jundy decides)
First filter by content type (`content-types.md`): the rubric only chooses among the styles that type allows.
Outcome first: every part has a job, and the style is whatever does that job best for retention and clarity.
1. **Name the job of the part**: hook · structure (list, steps, comparison, number) · proof (a screen, a document, a
   result) · punchline or idiom · "look at this" · section change · CTA.
2. **Map job → style**: hook → S1 (uppercase title + `zoom` punch) or S2 (one kinetic hook screen); structure → S0;
   proof → S1 split; punchline, idiom, words said fast → S2; "look at this" → S3 (or an S1 red box on a screen);
   section change → `transition` + the next part's style; CTA → S0 `cta` or an S1 callout, in the locked palette.
   Added with refs a–e: "how a system or product is built / how the pieces fit" → S4 `iso`; "a method with steps, a mind
   map, a content calendar, numbered chapters" → S5; "a detail of an object that needs naming" (a gadget, a UI part) → S6 `tag`;
   a repeated keyword that should loop around the shot → S2 `rings`.
   Added with the five 2026-10 references (S7–S11): a brand-word reveal, a bumper or a section opener on a piece without a speaker → S7 `glitch` (+ `ticker`, `wipe`) or S8 `slab` → `glitch`; a product or app shown in use → S9 `cursor` + `orbit`; a short phrase whose meaning turns on one word → S10 `roll` (`serif`); a stat or a sentence that builds line by line and ends on a number → S11 `stack`; a word that cycles through options (currencies, tools, names) → S11 `roll`.
   For LANDSCAPE raw footage the default carrier is S12: FULL (cover) on the hook and the personal lines, CARD (graphic on top, pop-out speaker) whenever a part is shown; the other styles' beats then run in card mode. These are mostly full-screen looks: on talking-head content use them as ≤ 5 s interludes (like S2 full-screen) with the speaker's voice running, never over the face. Never send the key word of a sentence to `behind`; keep it in front.
3. **Break ties with evidence, then novelty**: prefer the style that shows proof (a screen, a number, a real output)
   over one that only decorates; if still tied, pick the style used least recently. When the proof needs an asset the
   user has not sent, build the proof yourself as an illustration (see SKILL.md section 0 and "Proof over decoration"); the wishlist is retired.
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
  the scene behind the matted speaker (decoration only, see the rule in section 3.4); only `mode: "full"` hides the speaker, and then it counts toward the full-screen interlude budget
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
- **Only for landscape raw footage.** Ref e's format needs the speaker to be a wide window, which only works when the raw footage is landscape.
  On portrait raw footage (a close-up filling the frame) the wide window cuts the face badly: do not use it there. For portrait use `split`
  mode (graphic on top, you full size below) or the default top-right window, and the board parts (`mindmap`, `calendar`, `chapter` arc, graph paper)
  can still be used in those modes. The runtime ignores `layout.pip` bottom on portrait footage unless `force` is set.
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
**Rule (the user's note after trying it): `behind` is for decoration, never for the point.** Text that has to be emphasised must not sit behind the
speaker: it becomes background, the face and body cover it and the message weakens (tried on "pakai AI cuma buat yang SALAH" and "AI itu
INFRASTRUKTUR": it looked worse than the plain kinetic). Use `behind` only for texture or secondary material: a mood word that is not the
point, a scene around the speaker, an echo of a word that was already shown in front. Key words, numbers and claims stay in front
(`kinetic` full-screen for 1.5–5 s, or over the footage). Face cut-outs inside letters are not built.

## 3.10 S12 Landscape card switcher with pop-out (ref 6: a 62 s reels explainer, shot landscape, delivered 9:16)
What happens (measured on 720x1280 at 24 fps, about 20 switches in 62 s, each state lasting 2–10 s):
- **Two states of the same raw footage.** **FULL**: the landscape picture is cover-cropped so the speaker fills the 9:16 frame (face large, centred; white bold word caption with a dark outline at ≈ 0.66 H). **CARD**: the whole landscape picture is a rounded card at the bottom (≈ 87 % of the width, ≈ 4 % margin below, corner radius ≈ 3 % of the width, a soft shadow) and everything above it is a light grid-paper stage for a graphic or a UI mock-up; the caption moves to just above the card, in black bold words.
- **The transition is a hard cut**, not a fade or slide: the very next frame is the other state. Only the graphic whips in (it slides in from the right with a horizontal motion blur for ≈ 0.2 s, 4–5 frames); the exit is the cut back to FULL.
- **The double layer.** In CARD the top of the card is cropped a little (≈ 15–20 % of the picture's height, the empty background above the speaker) and the speaker is layered ABOVE the card (frame × person matte), so the cap and head break the card's top edge and stand in front of the graphic area. Hands and arms stay on the card.
- **Rhythm.** FULL for the hook and for the emotional or personal lines, CARD whenever a graphic or a demo is shown (a headline with a red underline, a prompt box that types, a document that fills in, a phone grid). A new graphic every 2–5 s inside a CARD stretch; the stretch lasts as long as the explanation.
**Card-stretch rules (learned the hard way; the runtime enforces what it can).**
1. **One persistent stage.** The whole CARD stretch has ONE grid-paper backdrop (`layout.card.palette`, default `frost`); card beats never paint their own. A gap between two card beats shows an empty stage, so card beats must be **contiguous** (end of one = start of the next, no gaps; a gap shorter than 1 s is merged into the stretch and reported as "empty stage"). A real return to FULL needs a gap of at least 1 s.
2. **Hard cuts only.** A card beat is visible exactly from `t` to `t + dur`; it has no exit fade, and the next beat in the stretch replaces it on the same frame. Nothing from the previous state may linger: a non-card beat (title, kinetic, glitch) that runs across the start of a card stretch is cut at the boundary (the runtime warns), and a beat that starts inside a card stretch is reported. Plan FULL overlays to end before the cut.
3. **Light palettes only** on the stage (`frost`, `graph`, `engrave`, `editorial`, `paper`): the card caption is dark. Data beats scale up automatically (1.6x) because the stage is large.
4. **Check every boundary** on the final MP4: frames at t−0.1, t+0.07 and t+0.25 around each beat start and end, looking for a leftover element, a flash of another colour, or an empty stage.

Recipe (only when the RAW footage is landscape): `prep_footage.py raw.mp4 proj --dual --focus-x 0.5` (writes the portrait cover frames AND `frames_land`), `matte.py proj --land` (the pop-out mask), then beats with `"mode": "card"` (any data beat, `custom`, `image`, `stack`…) plus `palette: "frost"` or `"graph"` and `backdrop: "grid"`; `layout.card: { w: 0.88, bottom: 0.04, top: 0.16, r: 28 }`. The runtime does the hard cuts (a card part starts and ends with a cut; adjacent card parts under 1 s apart stay in one CARD stretch), the whip-in, the dark caption above the card, and hides the progress bar. Parts not in card mode stay FULL (cover). Use a light palette on the stage: the card caption is dark. Not for portrait raw (the face is already large; use `split`).

## 3.5 S7 Newsroom ticker & glitch (ref 1, "Stockwise: NEVER SLEEPS")
Measured on an 11.7 s 16:9 piece that loops twice (a ~5.2 s cycle, indigo field #070A1E, violet #5B5BE8):
- **0.0–0.4 s** "NEVER" lands white with a strong red/cyan split that snaps together in ~0.4 s (chromatic aberration), a pale ticker tape runs along the bottom edge and a violet tape along the top, both slightly tilted.
- **0.4–0.9 s** the word swaps to "SLEEPS." in violet with the same landing. **~1.0 s** two diagonal colour panels (dark and bright violet) sweep across as a wipe.
- **1.3–2.0 s** "Headlines, as they break." in white and violet on the left, a news card (image + headline) floats in at the right with a small LIVE pill, a second small card slides in under it.
- **2.0–5.0 s** everything fades to a single glowing point, a ring pulses out, a logo mark built from five stacked bars assembles around it, and the wordmark appears with a mirrored reflection below. A final "THE MARKET" in white caps closes the loop.
Recipe: `glitch` words (palette `newsroom`), `ticker` over it (`bg: "none"`), `wipe` between parts, `image` for the card. Use for a brand/topic reveal on a speaker-less piece (T8) or a ≤ 5 s interlude. Set `chrome.progress: false`.

## 3.6 S8 Camera HUD & slab (ref 5, "PLANE → CLAUDE")
A 8.7 s 16:9 piece, black #0A0A0A with orange #E8421C, a ~4.3 s loop, with a constant camera-HUD overlay (corner brackets, tiny mono labels top left/right, a running timecode `T1 00:00:03:12`, blinking REC dots, "120 FPS"):
- **0–0.3 s** a flat orange slab with "PLANE" bottom-left and a mono size tag; **0.3–1.1 s** it tilts in 3D (about 60° back, 25° around) while a dot appears; **1.1–1.7 s** it falls to a hairline with a ruler (ticks and a "LINE · 1536 PX" label); **1.7–2.0 s** the line collapses into a glowing dot.
- **~1.7 s** "CLAUDE" lands white with a red/blue split and two thin concentric rings around it, then settles; the HUD stays on.
Recipe: `slab` (≈ 3.6 s) → `glitch` (palette `hud`), `hud` laid over both (`bg: "none"`). Use for a bumper or a title reveal on a speaker-less piece.

## 3.7 S9 Product UI demo (ref 2, "Frame by Frame")
A 13 s near-square piece (~6.3 s loop) on a light interface with soft blue gradients:
- an arrow pointer glides to a menu-bar icon and clicks; the app panel (logo, title, a pill, a course card) springs open from that point with a blur-to-sharp settle (0.3 s), the pointer keeps moving inside it;
- the interface zooms out to a single dark app logo with three satellite chips (blue, cyan, green) that spring out of it and circle slowly; the logo shrinks into the ring; then the loop resets.
Recipe: `cursor` (keys with `click: true`), `orbit` (palette `ui`), `image` cards for the panel. Use to show a tool or app in use (T7) with a drawn UI; never draw a real brand's UI as if it were real.

## 3.8 S10 Engraving & accent word swap (ref 3, "Claude")
A 13 s portrait piece (~6.5 s loop), warm paper white, black bold serif/grotesque words, **one** terracotta accent (#D9704F) used for the punctuation or one shape:
- the word changes by one letter or one mark ("ask?" → "task", a "?" that draws then becomes a dot); each change is a clean swap, no blur;
- vintage engravings (polyhedra, a writing hand, snowflakes, a Muybridge horse ring, a Vitruvian figure) appear as grey cut-outs, each with a single accent shape (a dot, a star) laid on it, sometimes on a black card;
- the wordmark "Claude" with its asterisk closes the loop.
Recipe: `roll` with `serif: true, align: "center"` and `^accent^` markup for the word swap; `image` for engravings (needs public-domain engraving images the user supplies or you generate as line drawings: do not use copyrighted art); one accent colour only.

## 3.9 S11 Editorial type stack (ref 4, "Lightspark: Money still moves like it's 1973")
A 17.7 s portrait piece (a ~4.4 s loop): off-white (#F4F4F1) with a fine grid, a header row (brand left, tagline right, a thin rule and a small label), one neutral grotesque (Inter-like, weight 500), black frames in between with a white asterisk mark and one line ("Not anymore."):
- the lines stack one by one ("Money" → "still moves" → "like it's"); **each earlier line dims to grey as the next arrives**, and the last element lands large ("1973." at ~230 px) with a tiny caption ("SWIFT launched in 1973.");
- a second sequence: "Pay anyone." / "Anywhere." (second line grey) and a word that rolls like a slot machine (USD → EUR) in a fixed window;
- black bumper frames cut the sequences (hard cuts, 0.4 s).
Recipe: `stack` (`header`, `lines`, `big`, `caption`), `roll` (`lines`, `values`), a black `kinetic` or `title` (palette `ink`) as the bumper. Use for statement-driven T6 pieces, or a ≤ 5 s interlude in a talking head. Numbers only when said or supplied.

## 3.11 Matching the motion to the topic (every part, not decoration)
A part's motion should *say* what the speaker says. Pick the metaphor first, then the style:
| the speaker says | motion that fits | style / beat |
|---|---|---|
| a person, an event, a quote | their photo as a card, a red ring on the face or the detail, a name tag, one researched fact with its source | S0 `image` (`rings`, `tag`, `caption`) |
| "naik dua kali lipat", growth, compounding | big multiplier + the source line; or bars that double step by step (derived arithmetic, labelled as illustration) | `stat` with `note`, `bars` |
| a small thing becomes a big thing (1 minute → 1 hour) | two solids, a small block and a tower, linked by a dashed arc | S4 `iso` |
| something fixed / static / "titik tetap" | a flat slab that collapses to a hairline and a dot | S8 `slab` |
| a word that flips meaning (berbulan-bulan → satu jam, statis → dinamis) | a serif word swap | S10 `roll` (`serif`) |
| a method with steps, a pile of parts, hub and spokes | a mind map or a flow that draws itself | S5 `mindmap`, S0 `flow` |
| predictable vs changing, order vs chaos | two clusters of solids: identical neat blocks vs different heights and positions | S4 `iso` |
| a tool in someone's hands, "AI cuma alat" | the human logo with small satellite chips (AI, tool) circling it | S9 `orbit` |
| a one-line verdict or a hard statement | the sentence on its own, dimming earlier lines, ending on a big word | S11 `stack` (≤ 5 s, full screen) |
| a first reaction, "salah besar" | a glitch word over the face's top margin | S7 `glitch` |
| a list of reasons | numbered list, each item landing on its word | S0 `list` |
Rules: at most one metaphor per part; never put a metaphor where the transcript has no matching moment; a researched fact (date, prize, study) needs a source line or a caveat on the card.

## 4. Which style when (talking-head founder content)
This table is for type T1/T2 in `content-types.md`; read that file first, because the type decides which of these rows are allowed (e.g. no wide bottom window on portrait raw).
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
| a method, a calendar, a mind map, numbered steps | S5 | `mindmap` `calendar` `chapter` (`arc`) with `backdrop: "grid"`; `layout.pip` bottom only if the raw footage is landscape, else `split` |
| naming a part of a product or a UI detail | S6 | `tag` (2–3 s), beside the detail |
| a keyword that should loop around the shot | S2 ext | `kinetic` with `rings` (decorative; the key word stays in front) |

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
