#!/usr/bin/env python3
"""Bangun ulang latar grid miring dari contoh template user (tanpa logo/titik/panah).

Pakai:  python3 make_background.py contoh-template.png out/bg-grid.jpg [--scale 2]

Cara kerja: elemen "chrome" (titik, logo, panah) dihapus lewat inpaint, gradient halus diambil
dengan blur besar, lalu grid digambar ulang secara vektor (rotasi -4.5 derajat, sel ±72x70 px)
dengan kekuatan garis yang diukur dari contoh. Hasilnya bersih, tajam di resolusi 2x,
dan bisa dipakai sebagai latar semua slide.
"""
import sys, argparse, math
import numpy as np, cv2
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument("src"); ap.add_argument("out")
ap.add_argument("--scale", type=int, default=2)
ap.add_argument("--angle", type=float, default=-4.5)
ap.add_argument("--sx", type=float, default=72.7)
ap.add_argument("--sy", type=float, default=70.5)
ap.add_argument("--ox", type=float, default=3.0)
ap.add_argument("--oy", type=float, default=25.5)
a = ap.parse_args()

rgb = np.array(Image.open(a.src).convert("RGB"))
H, W = rgb.shape[:2]

# 1) hapus chrome (titik kiri-atas, logo tengah-atas, panah kanan-bawah) -> gradient halus
mask = np.zeros((H, W), np.uint8)
for x0, y0, x1, y1 in [(30, 60, 190, 125), (420, 70, 665, 175), (835, 1105, 995, 1260)]:
    mask[y0:y1, x0:x1] = 255
clean = cv2.inpaint(rgb, mask, 9, cv2.INPAINT_TELEA)
smooth = cv2.GaussianBlur(clean, (0, 0), 28).astype(np.float32)

# 2) kekuatan garis grid diukur terhadap gradient halus (per pita vertikal)
def grid_mask(w, h, s=1.0, thick=2.0):
    """Jarak tiap piksel ke garis grid terdekat (dalam px asli). Fase dicocokkan ke contoh user."""
    ang = math.radians(a.angle)
    ca, sa = math.cos(ang), math.sin(ang)
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
    x, y = xs / s, ys / s
    u = x * ca + y * sa - a.ox
    v = -x * sa + y * ca - a.oy
    du = np.abs(((u + a.sx / 2) % a.sx) - a.sx / 2)
    dv = np.abs(((v + a.sy / 2) % a.sy) - a.sy / 2)
    d = np.minimum(du, dv)
    # anti-alias: garis selebar `thick` px asli
    return np.clip((thick / 2 + 0.5 - d) / 1.0, 0, 1), d

THICK = 3.0
m1, d1 = grid_mask(W, H, 1.0, THICK)
line = d1 < 1.0
diff = (rgb.astype(np.float32) - smooth).mean(2)
alphas = []
for y0 in range(0, H, 150):
    sel = line[y0:y0 + 150] & ~(mask[y0:y0 + 150] > 0)
    d = diff[y0:y0 + 150][sel]
    bg = smooth[y0:y0 + 150].mean(2)[sel]
    alphas.append(float(np.clip((d / (255 - bg)).mean(), 0, 1)))
print("alpha garis per pita 150px (mentah):", [round(x, 3) for x in alphas])

# kalibrasi: samakan kontras garis hasil render dengan contoh (ukur di tengah, bebas chrome)
valid = mask == 0
band = np.zeros((H, W), bool); band[200:1000] = True
sel = valid & band
def contrast(img_f):
    d = (img_f - smooth).mean(2)
    on = line & sel
    return d[on].mean() - d[~line & sel].mean()
target = contrast(rgb.astype(np.float32))
ay0 = np.interp(np.arange(H), np.arange(0, H, 150) + 75, alphas)[:, None]
test = smooth + (255 - smooth) * (grid_mask(W, H, 1.0, THICK)[0] * ay0)[..., None]
gain = target / max(contrast(test), 1e-6)
alphas = [min(x * gain * 1.2, 0.5) for x in alphas]
print("gain kalibrasi:", round(gain, 2))

# 3) render ulang di resolusi 2x
s = a.scale
big = cv2.resize(smooth, (W * s, H * s), interpolation=cv2.INTER_CUBIC)
ys = (np.arange(H * s) / s)
alpha_y = np.interp(ys, np.arange(0, H, 150) + 75, alphas)[:, None]
gm, _ = grid_mask(W * s, H * s, float(s), THICK)
out = big + (255 - big) * (gm * alpha_y)[..., None]
Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(a.out, quality=95, subsampling=0)
print("tersimpan", a.out, (W * s, H * s))
