#!/usr/bin/env python3
"""Probe a raw video and print what the intake needs to classify it (see references/content-types.md).

  python3 inspect.py raw.mp4

Prints size, orientation, fps, duration, audio, and the recommended prep_footage flags. Content type itself is a judgement
from the transcript (talking head, tutorial, podcast …); this only settles the format half: the raw orientation decides
between T1 (portrait) and T2 (landscape) and whether the wide bottom speaker window is allowed.
"""
import json, subprocess, sys

if len(sys.argv) < 2:
    sys.exit(__doc__)
r = subprocess.run(['ffprobe', '-v', 'error', '-print_format', 'json', '-show_streams', '-show_format', sys.argv[1]], capture_output=True, text=True)
if r.returncode:
    sys.exit(r.stderr)
d = json.loads(r.stdout)
v = next((s for s in d['streams'] if s['codec_type'] == 'video'), None)
if not v:
    sys.exit('no video stream (audio only? use from-scratch mode with the voice as the soundtrack)')
w, h = int(v['width']), int(v['height'])
rot = 0
for sd in v.get('side_data_list', []):
    rot = abs(int(sd.get('rotation', 0))) % 360
if int(v.get('tags', {}).get('rotate', 0) or 0):
    rot = int(v['tags']['rotate']) % 360
if rot in (90, 270):
    w, h = h, w
num, den = (v.get('r_frame_rate', '30/1').split('/') + ['1'])[:2]
fps = float(num) / float(den or 1)
dur = float(d['format'].get('duration', 0))
aud = any(s['codec_type'] == 'audio' for s in d['streams'])
ar = w / h
orient = 'portrait' if ar < 0.9 else 'landscape' if ar > 1.15 else 'square'
# a landscape video inside a portrait file (black bars above and below): detect it, the true format is landscape
crop = None
if orient == 'portrait':
    c = subprocess.run(['ffmpeg', '-hide_banner', '-ss', str(min(30, dur / 3)), '-i', sys.argv[1], '-frames:v', '12', '-vf', 'cropdetect=24:2:0', '-f', 'null', '-'], capture_output=True, text=True).stderr
    import re
    m = re.findall(r'crop=(\d+):(\d+):(\d+):(\d+)', c)
    if m:
        cw, ch, cx, cy = map(int, m[-1])
        if ch < h * 0.8 and cw / max(ch, 1) > 1.15:
            crop = (cw, ch, cx, cy)
            orient = 'landscape (letterboxed inside a portrait file)'
print(f'{w}x{h}  {orient}  {fps:.2f} fps  {dur:.1f} s  audio:{"yes" if aud else "no"}')
if crop:
    print(f'letterboxed: the real picture is {crop[0]}x{crop[1]} at y={crop[3]}. Crop it first: ffmpeg -i raw.mp4 -vf crop={crop[0]}:{crop[1]}:{crop[2]}:{crop[3]},fps=30 -c:v libx264 -crf 14 -c:a copy land.mp4, then prep_footage land.mp4 proj --fit blur. Two or more speakers: T5; one: T2')
elif orient == 'portrait':
    print('raw: portrait → type T1 (founder talking head) or T3/T7; NO wide bottom window; prep_footage default (--fit cover), --focus-x if the speaker is off-centre')
elif orient == 'landscape':
    print('raw: landscape → type T2 if one speaker (wide bottom window allowed, prep_footage --fit blur), T5 if two or more speakers, T3/T4 if a screen or slides')
else:
    print('raw: square → prep_footage --fit blur; treat as T2 for layout, no wide bottom window unless the speaker has room')
if not aud:
    print('no audio → T8 (system motion piece) or T7/mood; from-scratch ambient pad applies')
