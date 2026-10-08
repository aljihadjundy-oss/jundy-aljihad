#!/usr/bin/env python3
"""Turn downloaded stock clips into frame sequences the film can use.

  python3 tools/prep_clip.py ~/Downloads/meditation.mp4 f01              # one clip → slot f01
  python3 tools/prep_clip.py ~/Downloads/footage/ --batch                # files named f01*.mp4 … f08*.mp4 → matching slots
  python3 tools/prep_clip.py clip.mp4 f03 --start 2.5                    # use the part of the clip starting at 2.5 s

Frames are 1920x1080 (cover-cropped), 30 fps, only as many as the slot needs. Re-render afterwards:
  node <skill>/scripts/render.mjs .      (placeholders are replaced automatically)
"""
import argparse, glob, json, os, re, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
content = json.load(open(os.path.join(ROOT, 'assets', 'content.json')))
FOOT = os.path.join(ROOT, 'assets', 'footage'); os.makedirs(FOOT, exist_ok=True)
MAN = os.path.join(FOOT, 'manifest.json')
manifest = json.load(open(MAN)) if os.path.exists(MAN) else {}

ap = argparse.ArgumentParser()
ap.add_argument('src'); ap.add_argument('slot', nargs='?'); ap.add_argument('--start', type=float, default=0.0); ap.add_argument('--batch', action='store_true')
a = ap.parse_args()

def probe_dur(p):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True)
    return float(r.stdout.strip() or 0)

def do(src, slot, start=0.0):
    if slot not in content['slots']:
        sys.exit(f'unknown slot {slot}; valid: {", ".join(content["slots"])}')
    need = content['slots'][slot]['dur']
    have = probe_dur(src) - start
    if have < need:
        print(f'  ! {slot}: clip has {have:.1f}s after start, slot needs {need:.1f}s — the last frame will be held')
    d = os.path.join(FOOT, slot); shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', str(start), '-t', str(need + 0.1), '-i', src,
                    '-vf', 'fps=30,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1', '-q:v', '3', os.path.join(d, '%06d.jpg')], check=True)
    n = len(glob.glob(os.path.join(d, '*.jpg')))
    manifest[slot] = {'count': n, 'fps': 30}
    print(f'  {slot}: {n} frames ← {os.path.basename(src)}')

if a.batch:
    for f in sorted(glob.glob(os.path.join(a.src, '*'))):
        m = re.match(r'(f0[1-9]|f[1-9]\d)', os.path.basename(f).lower())
        if m and os.path.splitext(f)[1].lower() in ('.mp4', '.mov', '.m4v', '.webm'):
            do(f, m.group(1))
else:
    if not a.slot: sys.exit('give a slot id, e.g. f01')
    do(a.src, a.slot, a.start)
json.dump(manifest, open(MAN, 'w'), indent=1)
print('slots ready:', ', '.join(sorted(manifest)), '| still placeholders:', ', '.join(s for s in content['slots'] if s not in manifest) or 'none')
