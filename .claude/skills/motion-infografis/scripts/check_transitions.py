#!/usr/bin/env python3
"""Transition QA: frames around every beat start and end of a finished video, on one contact sheet.

  python3 check_transitions.py myproject out/final.mp4 [sheet.png]

For each beat boundary it grabs t-0.1, t+0.07 and t+0.25 and labels them. Look for: an element of the previous part still on screen, a flash of another
colour (for example the dark stage showing between two card parts), an empty stage, a title running into the next state. Open the sheet and look at it.
"""
import json, os, subprocess, sys, glob, tempfile
from PIL import Image, ImageDraw

if len(sys.argv) < 3:
    sys.exit(__doc__)
proj, video = sys.argv[1], sys.argv[2]
out = sys.argv[3] if len(sys.argv) > 3 else os.path.join(proj, 'out', 'transitions.png')
beats = json.load(open(os.path.join(proj, 'project.json')))['beats']
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', video], capture_output=True, text=True).stdout)
ts = sorted({round(b['t'], 2) for b in beats} | {round(b['t'] + b['dur'], 2) for b in beats if b['t'] + b['dur'] < dur - 0.3})
d = tempfile.mkdtemp()
files = []
for n, t in enumerate(ts):
    for off in (-0.1, 0.07, 0.25):
        f = os.path.join(d, f'{n:03d}_{t:.2f}_{off:+.2f}.png')
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', f'{max(0, t + off):.3f}', '-i', video, '-frames:v', '1', '-vf', 'scale=180:-1', f], check=True)
        files.append(f)
w, h = Image.open(files[0]).size
cols = 9
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * w, rows * (h + 12)), (25, 25, 25))
dr = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    x, y = (i % cols) * w, (i // cols) * (h + 12)
    sheet.paste(Image.open(f), (x, y + 12))
    dr.text((x + 2, y), os.path.basename(f)[4:-4], fill=(255, 220, 0))
sheet.save(out)
print(f'{len(ts)} boundaries → {out}')
