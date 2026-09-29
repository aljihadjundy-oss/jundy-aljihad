"""Contact sheet of out/stills/*.png → out/contact.png (labels = timestamps)."""
import sys, glob, os
from PIL import Image, ImageDraw
files = sorted(glob.glob(os.path.join(sys.argv[1] if len(sys.argv) > 1 else 'out/stills', '*.png')))
cols = int(sys.argv[2]) if len(sys.argv) > 2 else 5
w, h = 360, 640
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * w, rows * (h + 30)), (40, 40, 40))
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((w, h), Image.LANCZOS)
    x, y = (i % cols) * w, (i // cols) * (h + 30)
    sheet.paste(im, (x, y + 30))
    d.text((x + 8, y + 8), os.path.basename(f), fill=(255, 255, 0))
out = sys.argv[3] if len(sys.argv) > 3 else 'out/contact.png'
sheet.save(out)
print(out, sheet.size)
