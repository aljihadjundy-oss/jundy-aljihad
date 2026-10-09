# Content types (each type of video gets its own motion style)

The style library (`style-library.md`) says what each look is. This file says **which looks belong to which kind of
video**. A reference sample is filed under a content type, and the type, not the whole library, decides the palette of
styles the agent may pick from. The user keeps sending samples; every new one is filed here (see "Filing a new sample").

Why: one rubric for every video was ineffective. Ref e's board only works when the raw footage is landscape, a tutorial
needs a screen on top, and a podcast has two faces. The format of the raw footage and the kind of content decide the look first;
the per-part rubric in `style-library.md` then picks inside that type.

## How to use (every motion plan, before the plan table)
1. **Classify** with two questions: *what kind of content* (founder talking head, tutorial, presentation, podcast,
   voice-over, product shot, mood clip …) and *what is the raw footage format* (`ffprobe`: portrait / landscape / square, one
   or more speakers, screen recording or not). Ask the user only if both cannot be inferred.
2. Take that type's row below: **default layout, style set, palettes, bans, pacing**.
3. Write `Type: T# name · raw: portrait|landscape` on top of the plan table, and set `"contentType": "T#"` in project.json
   (informational, the renderer ignores it). The style column of the plan may only use that type's "allowed" styles.
4. If a video fits two types (a founder talking head that has a tutorial section), the base type decides the default and
   the other type's styles may be borrowed only for the part that is that kind of content.
5. If nothing fits, say so, propose a new type (T-next) in the plan, and file it when the user approves the plan.

Status of each type: **measured** = built from a real reference sample; **provisional** = defaults derived from the
standing rules while no sample has arrived yet. Provisional types are upgraded the moment the user sends a sample.

## Type index
| id | content type | raw format | status | samples |
|---|---|---|---|---|
| T1 | Founder talking head, portrait | portrait 9:16, one speaker, face fills the frame | measured | "banyak jasa chaos", "hi kids", "lost spark", "bukan agency gapake AI", ref C moody mood |
| T2 | Talking head / explainer, landscape raw | landscape 16:9 (or 4:3), one speaker | measured (ref e rule) | ref e |
| T3 | Tutorial / screen demo | portrait or landscape, speaker + a screen | measured | ref A |
| T4 | Presentation / slides / keynote | landscape, speaker + slides, or slides only | provisional | none yet |
| T5 | Podcast / interview | landscape or split, two or more speakers | provisional | none yet |
| T6 | Voice-over explainer (no footage of a speaker) | any, audio only | measured | ref B, ref c |
| T7 | Product showcase / review | portrait, object in hand or on a table | measured | ref d |
| T8 | System / diagram motion piece (no speaker, no voice) | landscape or square | measured | refs a, b |

## T1 Founder talking head, portrait
- **Face rule.** The face fills the frame, so anything that shrinks or crops the speaker cuts the face. Never use `layout.pip` bottom
  (the runtime ignores it on portrait footage). Never use `behind` for key text.
- **Allowed styles.** S0 house (default carrier), S1 split (when a screen or an asset is shown, speaker stays full width below),
  S2 kinetic (only as `mode: overlay` + `bg: none` over the footage, or a full-screen interlude ≤ 5 s and ≤ 15 % of the runtime),
  S3 tracked annotation, S4 `iso` in `split` (only to explain how a system is built), S6 `tag` when an object is held up.
  S5 board only in `split` mode or with the default small top-right window, never the wide bottom window.
- **Palettes.** `jundy` locked; one or two parts may use navy/maroon/paper/ink/frost/blueprint/graph.
- **Captions.** Karaoke on the lower third (or the seam in split). Overlay titles stay in the top zone, above the head (`y` ≤ ~0.05–0.12 for big words).
- **Pacing.** Retention rules from `retention.md`; ~40 % clean footage; style rotation per the rubric (≥ 3 styles per 60 s).
- **Typical mix.** Hook S1/S2 → structure S0 → proof S1 split → punchline S2 overlay → CTA S0 (see "worked mix" in `style-library.md` §4).

## T2 Talking head / explainer, landscape raw
- **Why separate.** A landscape frame has empty space left and right of the speaker, so the speaker can be a wide window and the rest
  becomes a board. This is the only type where the wide bottom window (`layout.pip: {pos: "bottom"}`) is allowed.
- **Allowed styles.** S5 whiteboard on graph paper (`mindmap`, `calendar`, `chapter` `arc`, `backdrop: "grid"`, palette `graph`, captions `word`),
  S0 data beats on that board, S4 `iso` (split or full), S1 split for screens, S6 tags, `behind` as a decoration (matte works well on a
  centred speaker) but never for key text.
- **Palettes.** `graph` base for board parts, `jundy` for CTA and chrome, `frost`/`paper` as accents.
- **Pacing.** Board parts 3–8 s, the speaker takes the full frame between parts with one-word grey chips, then shrinks back.
- **prep_footage.** The default `--fit cover` crops a landscape frame to portrait and can cut the face. For T2 prefer `--fit blur` (the whole
  landscape frame centred on a blurred background) or `--fit contain`, or `--focus-x` to aim the crop; the bottom window reads the original
  landscape frame (`source` in footage.json). If the speaker is cropped to fill the portrait frame, the video is T1, not T2.

## T3 Tutorial / screen demo
- **Layout.** S1 split: screen (image or still) on top, speaker below, boxed seam captions, blue callouts, red UI boxes, uppercase hook,
  punch-in `zoom`, light-leak `transition` at every switch.
- **Allowed styles.** S1 (carrier), S3 on the screen (`annotate` red box/arrow), S0 `checklist`/`flow` for steps, S6 `tag` for UI parts.
- **Bans.** No `kinetic` full-screen (the screen is the proof). No `behind`. No bottom window.
- **Limit.** The top panel takes still images; a live screen recording as video is not supported (see Limits).

## T4 Presentation / slides / keynote (provisional)
- **Default until a sample arrives.** Speaker and slide are both content, so use `split` (slide top, speaker bottom) or a PiP; never
  cover the slide. Add only light motion on top of the slide: S1 callouts and red boxes, S3 annotation on the slide, `zoom` to a detail,
  S0 `stat` for a number the slide mentions. No kinetic interludes over the slide. Chapter cards at section changes (S5 `chapter`).
- **Open questions for the first sample.** Slides-only or with a speaker; landscape or portrait; animations the slides already have.

## T5 Podcast / interview (provisional)
- **Default until a sample arrives.** Two or more faces: never cover either, no shrinking of the active speaker. Motion goes to
  lower thirds with the name, short `quote`/`stat` cards in the gaps between faces, a topic `chapter` card at each new question, and S1 `callout`
  for a term. Captions word-timed, speaker colour per person. Keep graphics sparse (≥ 60 % clean) because the content is the conversation.
- **Open questions for the first sample.** Split-screen two-up or one frame; landscape or portrait; whether sound design is wanted.

## T6 Voice-over explainer (no speaker footage)
- **Allowed styles.** S2 kinetic collage (carrier: words land as spoken on solid colour, stickers, hard cuts), S2 ext `rings`, S0 data beats,
  S4 `iso` for a build, `motion backdrop` for continuity. Face rules do not apply, so full-screen is fine; keep palette changes deliberate.
- **Pacing.** A new visual every 0.25–0.5 s for kinetic; hard cuts, no long fades.

## T7 Product showcase / review
- **Allowed styles.** S6 spec tags (carrier: mono labels with curved arrows on a detail), S1 callout for a spec, S0 `stat` for a measured value
  said aloud, `zoom` into a detail. Keep the product visible: tags beside the detail, never over it.
- **Bans.** No full-screen kinetic. No numbers that were not said or supplied.

## T8 System / diagram motion piece (no speaker, no voice)
- **Allowed styles.** S4 blueprint / isometric (carrier: plates, blocks, wireframe globe, leader labels, dashed links, a progress counter), palettes
  `frost` (light) and `blueprint` (dark), mono labels, serif italic accent word.
- **Pacing.** One slow build, a phase caption per stage, a pull-back before the title.

## Cross-type matrix (what is allowed where; ✓ carrier, + allowed, – avoid, ✗ banned)
| style | T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 |
|---|---|---|---|---|---|---|---|---|
| S0 house infographic | ✓ | + | + | + | + | + | + | – |
| S1 tutorial split | + | + | ✓ | ✓ | – | – | + | – |
| S2 kinetic collage | + (overlay / ≤ 5 s) | – | ✗ | ✗ | ✗ | ✓ | ✗ | – |
| S3 tracked annotation | + | – | + | + | – | – | – | – |
| S4 blueprint / iso | + (split) | + | – | – | – | + | – | ✓ |
| S5 whiteboard (wide bottom window) | ✗ (split or small window only) | ✓ | ✗ | – | ✗ | ✗ | ✗ | ✗ |
| S6 spec tags | + | + | + | – | ✗ | – | ✓ | – |
| `behind` (decoration only) | – | + | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

The rubric still applies inside a type (no two consecutive parts in the same style, no style over 50 % of graphic time, face never covered,
words from the transcript, no invented numbers).

## Sample register (every video the user sent, filed under its type)
| sample | type | what it taught | style id |
|---|---|---|---|
| SIAGA SUMATRA (original) | T6/T1 hybrid | house infographic | S0 |
| ref A: "cara skripsi pake AI" (60 s tutorial) | T3 | split-screen, seam captions, callouts | S1 |
| ref B: "jack of all trades" (20 s voice-over) | T6 | kinetic collage on solid colour | S2 |
| ref C: night drive (8 s, 4:3, no voice) | T1 / mood | tracked red annotation | S3 |
| refs a, b: "Labs" intro pieces (light, dark) | T8 | isometric build, progress counter | S4 |
| ref c: kinetic collage with ring text (20 s) | T6 | rings | S2 ext |
| ref d: product review (101 s, portrait) | T7 | spec tags | S6 |
| ref e: marketing explainer (83 s, speaker in a dark room) | T2 | graph-paper board, wide speaker window | S5 |

## Filing a new sample
1. Probe it (see "Adding a new reference" in `style-library.md`): format, cuts, speakers, audio.
2. Decide its type with the two questions above. If an existing type fits, add the sample to the register and **refine that type's section**
   (never delete an earlier rule; add what is new). If it is a new kind of content, add the next id (T9 …) to the index, a section and a matrix column.
3. If it brings a new look, also add the style to `style-library.md` (S7 …) and to the matrix row.
4. If it was a provisional type, replace "provisional" with "measured" and the defaults with what was measured.
5. State in the reply which type the sample was filed under and what changed.
