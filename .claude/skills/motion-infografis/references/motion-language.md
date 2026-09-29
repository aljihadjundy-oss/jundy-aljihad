# Motion language (the house style)

These rules make every video feel like the same studio made it. Change them deliberately, not by accident.

## Timing & easing
- **Enter**: out-expo `cubic-bezier(.16,1,.3,1)` over 0.8 s, rising 40–56 px. Fast start, long soft landing. It reads as confident, not bouncy.
- **Exit**: in-cubic over 0.45 s, drifting up 24–28 px while fading. Exits are quicker than entrances so the next idea is not blocked.
- **Camera / PiP / morphs**: in-out-cubic (or in-out-quart for big moves). Anything that travels needs to accelerate and brake.
- **Pops** (icons, nodes, checkboxes): out-back with a small overshoot (c1 = 1.4). Use it for small objects only; big panels never overshoot.
- **Stagger**: 55 ms per word in headlines, 120–150 ms between cards, 0.9–1.5 s between list or checklist items so each can be read.
- **Counters**: out-cubic count-up over 1.1–1.2 s, tabular numerals, thousands separators in the video's locale.
  Sensitive figures (casualties, disease, loss) never count up. They fade in.
- **Charts**: bars grow from 0 with scaleX out-cubic over 1.1 s. Value labels appear after the bar lands. Lines and arrows use stroke-draw.
- **Scene rhythm**: a new beat every 1–2 s *inside* a graphic, with graphics lasting 3.5–8 s, and clean footage between them.

## Colour
- Default palette: bg `#0A1E36`, surface `#12355B`, accent teal `#3FB6C4`, emphasis amber `#E0A100`, positive `#5DBB63`, negative `#F06A5F`.
- Teal marks structure (kickers, nodes, bars). Amber marks *the one thing to look at* (a number, the highlighted bar, the active caption word).
  Using amber everywhere removes its meaning.
- Over footage, text is white with a strong shadow, or sits on a glass card (`rgba(10,30,54,.84)` + blur). Never place thin text on bright footage.
- Red is for danger or negatives only, and never for disaster casualty numbers (use neutral white).

## Typography
- Plus Jakarta Sans by default. Headlines 800 weight, −2 % tracking, 1.06 line height. Kickers 700, uppercase, +16 % tracking.
  Body 500–600.
- Minimum sizes at 1080 px width: body 24 px, labels 20 px, captions ≈ 56 px. Phones are small.
- Headline sizes: overlay titles 78, insert headers 58, full headers 70, full titles 96, CTA 84.

## Backdrop & decoration
- Topographic contour loops that "breathe" (slow sine perturbation), two soft drifting glows, and a 3.5 % dither against banding.
- The backdrop shows only where the footage is not: behind the PiP in insert mode, and in full mode.
- No particles, lens flares or glitch effects. The data is the decoration.

## Layout (9:16)
- 72 px side margins; nothing important above ~250 px (top chrome and platform UI) or below the caption line (~1490 px).
- In insert mode the PiP is 30 % wide at the top-right; the header sits to its left and the content below.
- Right edge x > 960 and y 1100–1650 is where TikTok/Reels buttons sit. Keep key text out of it.

## Sound
- Synthesized only (licence-free): whoosh for PiP/scene transitions, soft air for titles, pop for items and numbers, tick for checks.
- Under a voice, effects sit about 9 dB lower. Target −14 LUFS for voice videos, −16 to −19 for ambient-only explainers.
- An ambient pad (Cmaj7–Am7–Fmaj7–G6, 8 s per chord) is used only when there is no voice.
