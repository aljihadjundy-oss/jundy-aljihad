import glob, os, sys
from PIL import Image, ImageDraw
d = sys.argv[1]; cols = int(sys.argv[2]); out = sys.argv[3]; w = int(sys.argv[4]) if len(sys.argv) > 4 else 640
fs = sorted(glob.glob(os.path.join(d, '*.png')))
ims = [Image.open(f).convert('RGB') for f in fs]; h = round(w * ims[0].height / ims[0].width)
rows = (len(ims) + cols - 1) // cols
s = Image.new('RGB', (cols * w, rows * (h + 18)), (30, 30, 30)); dr = ImageDraw.Draw(s)
for i, (f, im) in enumerate(zip(fs, ims)):
    x, y = (i % cols) * w, (i // cols) * (h + 18); s.paste(im.resize((w, h), Image.LANCZOS), (x, y + 18)); dr.text((x + 4, y + 3), os.path.basename(f), fill=(255, 220, 0))
s.save(out); print(out, s.size)
