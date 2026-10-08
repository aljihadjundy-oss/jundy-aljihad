#!/usr/bin/env python3
"""Per-frame person matte, computed once, so graphics can sit BEHIND the speaker (text behind head, a scene behind the body).

  python3 matte.py myproject                       # every frame
  python3 matte.py myproject --range 12.5,19       # only the seconds you need (much faster)
  python3 matte.py myproject --smooth 0.6          # temporal smoothing 0..1 (default 0.55): less flicker on hair edges

Writes myproject/footage/matte/000001.jpg … (grayscale, half size: white = person). The renderer stays deterministic: the
masks are plain files, produced here once. Beats with "behind": true then composite between the background footage and the
person. Needs: pip install mediapipe opencv-python-headless numpy (the selfie model, ~250 KB, is downloaded on first use).
On Linux also: apt-get install -y libegl1 libgles2 (mediapipe's runtime).
"""
import argparse, json, os, sys, urllib.request

ap = argparse.ArgumentParser()
ap.add_argument('project')
ap.add_argument('--range', help='start,end in seconds (default: whole video)')
ap.add_argument('--smooth', type=float, default=0.55)
ap.add_argument('--feather', type=float, default=1.6, help='edge blur in px at output size')
ap.add_argument('--lo', type=float, default=0.30, help='confidence below this is background')
ap.add_argument('--hi', type=float, default=0.72, help='confidence above this is fully person')
ap.add_argument('--holes', type=float, default=0.02, help='fill holes in the person up to this fraction of the frame (lenses, gaps in hair); 0 = off')
ap.add_argument('--model', default=None)
a = ap.parse_args()

try:
    import numpy as np, cv2
    import mediapipe as mp
    from mediapipe.tasks import python as mpt
    from mediapipe.tasks.python import vision
except Exception as e:
    sys.exit(f'matte.py needs mediapipe, opencv and numpy ({e}).\n  pip install mediapipe opencv-python-headless numpy\n  Linux also: apt-get install -y libegl1 libgles2')

P = a.project
meta = json.load(open(os.path.join(P, 'footage', 'footage.json')))
fps, count = meta['fps'], meta['count']
t0, t1 = (0.0, meta['duration']) if not a.range else [float(x) for x in a.range.split(',')]
i0, i1 = max(1, int(t0 * fps) + 1), min(count, int(t1 * fps) + 2)

cache = os.path.join(os.path.expanduser('~'), '.cache', 'motion-infografis', 'models')
os.makedirs(cache, exist_ok=True)
model = a.model or os.path.join(cache, 'selfie_segmenter.tflite')
if not os.path.exists(model):
    print('downloading the selfie segmentation model …')
    urllib.request.urlretrieve('https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite', model)

seg = vision.ImageSegmenter.create_from_options(vision.ImageSegmenterOptions(
    base_options=mpt.BaseOptions(model_asset_path=model), running_mode=vision.RunningMode.IMAGE,
    output_confidence_masks=True, output_category_mask=False))

out = os.path.join(P, 'footage', 'matte')
os.makedirs(out, exist_ok=True)
W, H = meta['w'], meta['h']
ow, oh = W // 2, H // 2
prev = None
for n, i in enumerate(range(i0, i1 + 1)):
    img = cv2.imread(os.path.join(P, 'footage', 'frames', f'{i:06d}.jpg'))
    if img is None:
        continue
    res = seg.segment(mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(img, cv2.COLOR_BGR2RGB)))
    m = np.squeeze(res.confidence_masks[0].numpy_view()).astype(np.float32)
    m = cv2.resize(m, (ow, oh), interpolation=cv2.INTER_CUBIC)
    m = np.clip((m - a.lo) / max(1e-3, a.hi - a.lo), 0, 1)
    m = m * m * (3 - 2 * m)                                  # smoothstep: crisp but not jagged
    if a.holes > 0:                                          # glasses lenses and hair gaps are not background: fill small holes
        solid = (m > 0.5).astype(np.uint8)
        cs, hier = cv2.findContours(solid, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
        fill = np.zeros_like(solid)
        if hier is not None:
            for c, hh in zip(cs, hier[0]):
                if hh[3] >= 0 and cv2.contourArea(c) < a.holes * ow * oh:   # an inner contour = a hole
                    cv2.drawContours(fill, [c], -1, 1, thickness=-1)
        if fill.any():
            m = np.maximum(m, cv2.GaussianBlur(fill.astype(np.float32), (0, 0), 1.2))
    if a.feather > 0:
        m = cv2.GaussianBlur(m, (0, 0), a.feather)
    if prev is not None and a.smooth > 0:
        m = (1 - a.smooth) * m + a.smooth * prev
    prev = m
    cv2.imwrite(os.path.join(out, f'{i:06d}.jpg'), (m * 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 90])
    if n % 100 == 0:
        print(f'  {i - i0 + 1}/{i1 - i0 + 1}', flush=True)
json.dump({'start': t0, 'end': t1, 'first': i0, 'last': i1, 'smooth': a.smooth}, open(os.path.join(out, 'matte.json'), 'w'))
print(f'matte → {out} ({i1 - i0 + 1} frames)')
sys.stdout.flush()
os._exit(0)   # skip mediapipe's noisy interpreter-shutdown cleanup
