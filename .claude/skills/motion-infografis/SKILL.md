---
name: motion-infografis
description: Add infographic motion graphics to a video, or build a motion-infographic video from data. Kinetic titles, count-up numbers, bar charts, checklists, numbered lists, flow diagrams, roadmaps, before/after comparisons, lower thirds, screenshot cards with camera moves and word-timed karaoke captions, rendered frame by frame (HTML + headless Chromium + ffmpeg, no Remotion) to MP4. Use whenever the user uploads or points to raw content footage (talking head, vlog, reels, TikTok, podcast clip, screen recording) and wants motion added, e.g. "tambahin motion", "kasih animasi/infografis", "bikin kayak motion graphics", "kasih chart atau angka di video", "subtitle yang nyala per kata", or wants a vertical explainer or infographic video built from a report, data or app screenshots, even if they only say "bikin video kayak SIAGA SUMATRA kemarin". Not for cut-only editing of raw footage; do the cuts first (editing-style skill), then use this for the motion layer.
---

# motion-infografis

Turns footage + a transcript (or pure data) into a vertical motion-graphics video in one consistent house style:
navy/teal/amber by default, topographic contour backdrop, kinetic type, charts that grow, lists that land one by one.
Everything on screen is a pure function of time, so renders are deterministic and any frame can be previewed.

Two modes, one engine:
- **Footage mode**: the raw video is the base layer. Motion "beats" float over it (`overlay`), shrink the speaker into a
  picture-in-picture while a chart or list takes the screen (`insert`), or briefly take over the whole frame (`full`).
  The original voice is kept; soft UI sound effects are mixed under it; captions are generated from the transcript.
- **From-scratch mode**: no footage. The same beats play on the motion backdrop, with a quiet synthesized ambient pad.
  For bespoke visuals (maps, custom diagrams), write a `custom` beat module (see `references/custom-scenes.md`).

## 1. Intake: confirm before doing anything heavy

Collect, and ask only for what you cannot infer:
- **Video file** (path). Has it already been cut? This skill does not cut. If the user wants cuts, do those first.
  In a cloud session, chat attachments usually cannot carry video. Ask for the file via a git repo or cloud drive, or
  suggest running the skill in Claude Code on their own machine, where local paths just work.
- **Transcript source**: an SRT/VTT they already have (CapCut, Descript, YouTube) is best. Otherwise auto-transcribe
  if `faster-whisper` works in this environment. Failing that, ask for an SRT or for key moments with timestamps.
- **Canvas**: default 1080×1920 at 30 fps. Other sizes work (layout scales with the short side), but 9:16 is the tuned one.
- **Brand**: colours, logo, and a name for the top-left badge. If none are given, use the default palette and no badge.
- **Numbers and claims** they want shown, with their source. On-screen facts must come from the transcript or from
  material the user supplied. Never invent statistics. If a number sounds important but has no source, ask.
- **Captions** on or off (default on when there is speech).

## 2. Setup (once per machine)

```bash
bash <skill>/scripts/setup.sh            # playwright-core + font into ~/.cache/motion-infografis; checks ffmpeg, python, Chrome
bash <skill>/scripts/setup.sh inter      # also install another @fontsource font (then brand.font = "inter")
```
Needs Node 18+, Python 3 with numpy + pillow, ffmpeg with libx264, and Chrome/Chromium (`CHROME_PATH` overrides detection).

## 3. Footage workflow

```bash
S=<skill>/scripts
python3 $S/prep_footage.py raw.mp4 proj                  # frames + audio + project.json (cover-crop to 9:16)
python3 $S/prep_footage.py raw.mov proj --fit blur       # landscape/screen recording inside a blurred 9:16 frame
python3 $S/transcribe.py proj --srt subs.srt             # or: python3 $S/transcribe.py proj   (whisper, if installed)
```
`--focus-x 0.35` moves the cover crop toward the speaker if they are not centred. `--start/--end` trim.

Then:
1. **Read `proj/transcript/transcript.md`** end to end. Understand the argument before placing anything.
2. **Draft a motion plan** as a short table: time, beat type, mode, on-screen text or data, and why. Show it to the user and
   **wait for approval** before the full render. This user explicitly prefers approval gates, and a full render costs
   minutes. Stills are cheap, so offer a few preview frames with the plan if helpful.
3. **Write the beats** into `proj/project.json` (schema and every type: `references/beats.md`).
4. **Preview**: `node $S/render.mjs proj --stills 3,9.5,17,...` (one or two stills per beat, mid-beat), then
   `python3 $S/contact.py proj/out/stills 6` and look at the sheet. Check that nothing covers the face, nothing collides with
   captions, text is readable at phone size, and the PiP never hides a chart. Fix and re-preview.
5. **Render**: `node $S/render.mjs proj` → `proj/out/final.mp4`. Takes roughly 1 minute per 10–15 s of video with 3 workers.
   Console warnings like "content … taller than its zone" mean a beat was auto-shrunk; consider fewer items.
6. **Verify**: `ffprobe` (size, fps, duration), then `python3 $S/contact.py --video proj/out/final.mp4 2,8,15,…` to eyeball
   the real encode. The loudness target is −14 LUFS for voice videos.
7. **Deliver**: if the file must go through a tool with an upload limit (e.g. 30 MB),
   `python3 $S/deliver.py proj/out/final.mp4 proj/out/final_share.mp4 --max-mb 28`. Keep the master.

## 4. From-scratch workflow

`python3 $S/new_project.py proj`, put images in `proj/assets/`, write beats (all become `full` mode automatically),
then preview, render and verify as above. The ambient pad turns on automatically when there is no voice.
For a whole data-driven explainer with bespoke scenes (maps, formula builds, stepped reveals tied to a data.json),
use `custom` beats. The SIAGA SUMATRA video is the worked example of that level of custom work; its code lives in
the `siaga-sumatra-motion/` project if it is available.

## 5. Directing the motion (the part that makes it good)

Motion should explain, not decorate. Guidelines, with the reasoning:
- **One beat = one idea the speaker is saying right now.** Start a beat about 0.2–0.4 s *before* the phrase it illustrates,
  because the eye needs a moment to land. End it when the speaker moves on.
- **Leave clean footage.** Aim for roughly 30–50 % of the runtime with no beat except captions. Constant graphics tire
  viewers and bury the person, who is usually the reason people watch.
- **Pick the lightest mode that works.** `overlay` for a single word, number or name (the speaker stays full-frame);
  `insert` when there are ≥ 3 items, a chart, or a screenshot (it needs room); `full` only for chapter dividers, the CTA,
  or when the footage has nothing to show. Adjacent insert beats merge, so the PiP does not bounce.
- **Keep text short.** Titles up to about 7 words, list items up to about 8 words, and a maximum of 5 list or checklist items
  and 6 flow steps. Every item needs time to be read: allow at least 1 s per item plus 2 s for the whole group.
- **Use the words of the video.** On-screen text should echo the speaker's words (tightened), in the video's language.
  Numbers must be exactly what was said or supplied. Show a `source` when a number comes from an outside document.
- **Sensitive figures** (casualties, illness, money lost): use `countUp: false`, `tone: "neutral"`, a small card, and a
  `note` with any disclaimer. Skip the dramatic sound effects.
- **Faces**: overlay beats default to `top` or `bottom` zones. For a centred talking head, `bottom` is usually safe,
  and `top` is safe if the head sits low. Check stills.
- **Chapters**: for videos with numbered sections, a `chapter` beat per section updates the top-right chapter label.

## 6. Tell the user at the end

- What was added: a short list of beats with timecodes.
- Anything assumed or estimated: word timings estimated from SRT, a number you could not verify, a crop that may clip.
- The file (and the master's location if a share-size copy was sent), duration and size.
- Offer the next tweaks in one line (timing, density, colours).

## Reference files
- `references/beats.md`: project.json schema, every beat type with fields and examples, modes and zones, camera and rings.
- `references/motion-language.md`: easing, stagger, typography, colour and sound rules behind the look. Read it before
  changing styles or writing custom scenes.
- `references/custom-scenes.md`: engine API and a template for `custom` beat modules.

## Troubleshooting
- *Blank or black frames*: frames missing in `proj/footage/frames`. Re-run `prep_footage.py`.
- *Captions out of sync*: the SRT was made from a different cut. If the clip was trimmed, `transcribe.py` subtracts `--start`
  automatically; pass `--clip-relative` if the SRT already matches the trimmed clip.
- *Fonts look wrong*: run `setup.sh <font>` and set `brand.font` to the @fontsource package id (e.g. `inter`).
- *Audio too loud or quiet*: set `audio.target_lufs` (−14 social, −16 to −19 for calm explainers) and `audio.sfx` (0 disables effects).
