#!/usr/bin/env python3
"""Contact sheet for quick visual review.

  python3 contact.py project/out/stills [cols] [out.png]        # from rendered stills
  python3 contact.py --video project/out/final.mp4 3,12,20,31    # grab frames from a finished video first
"""
import glob, os, subprocess, sys, tempfile
from PIL import Image, ImageDraw

args = sys.argv[1:]
if args and args[0] == '--video':
    video, times = args[1], args[2].split(',')
    d = tempfile.mkdtemp()
    for t in times:
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', t, '-i', video, '-frames:v', '1', os.path.join(d, f't{float(t):07.2f}.png')], check=True)
    src, cols, out = d, int(args[3]) if len(args) > 3 else 6, args[4] if len(args) > 4 else os.path.join(os.path.dirname(video), 'contact.png')
else:
    src = args[0] if args else 'out/stills'
    cols = int(args[1]) if len(args) > 1 else 6
    out = args[2] if len(args) > 2 else os.path.join(os.path.dirname(src.rstrip('/')), 'contact.png')
files = sorted(glob.glob(os.path.join(src, '*.png')))
if not files:
    sys.exit('no stills found')
im0 = Image.open(files[0])
w = 360
h = round(w * im0.height / im0.width)
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * w, rows * (h + 28)), (40, 40, 40))
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    x, y = (i % cols) * w, (i // cols) * (h + 28)
    sheet.paste(Image.open(f).convert('RGB').resize((w, h), Image.LANCZOS), (x, y + 28))
    d.text((x + 8, y + 7), os.path.basename(f), fill=(255, 220, 0))
sheet.save(out)
print(out, sheet.size)
