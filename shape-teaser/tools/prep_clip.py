#!/usr/bin/env python3
"""Turn downloaded stock clips into frame sequences for the teaser (both 16:9 and 9:16).

  python3 tools/prep_clip.py ~/Downloads/clip.mp4 s3-fitness              # one clip -> slot s3-fitness
  python3 tools/prep_clip.py ~/Downloads/footage/ --batch                 # files named like the slot id (s3-fitness*.mp4 ...) -> matching slots
  python3 tools/prep_clip.py clip.mp4 s5-drone --start 2.5                # use the part starting at 2.5 s

Writes assets/footage/<id>/ (1920x1080) and assets/footage/<id>_v/ (1080x1920, centre crop; --posx 0..1 moves the crop), 30 fps, as many frames as the slot needs.
"""
import argparse, glob, json, os, re, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(os.path.realpath(__file__))); ROOT = os.path.dirname(HERE)
SLOTS = json.load(open(os.path.join(ROOT, 'src', 'footage.json')))['slots']
FOOT = os.path.join(ROOT, 'assets', 'footage'); os.makedirs(FOOT, exist_ok=True)
MAN = os.path.join(FOOT, 'manifest.json')
manifest = json.load(open(MAN)) if os.path.exists(MAN) else {}

ap = argparse.ArgumentParser()
ap.add_argument('src'); ap.add_argument('slot', nargs='?'); ap.add_argument('--start', type=float, default=0.0)
ap.add_argument('--posx', type=float, default=0.5); ap.add_argument('--batch', action='store_true')
a = ap.parse_args()

def probe_dur(p):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True)
    return float(r.stdout.strip() or 0)

def do(src, slot, start=0.0):
    if slot not in SLOTS:
        sys.exit(f'unknown slot {slot}; valid: {", ".join(SLOTS)}')
    need = SLOTS[slot]['dur'] + 0.7
    have = probe_dur(src) - start
    if have < need:
        print(f'  ! {slot}: clip has {have:.1f}s after start, slot needs {need:.1f}s; the last frame will be held')
    for suffix, w, h, crop in (('', 1920, 1080, 'crop=1920:1080'), ('_v', 1080, 1920, f'crop=1080:1920:(iw-1080)*{a.posx}:0')):
        d = os.path.join(FOOT, slot + suffix); shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', str(start), '-t', str(need), '-i', src,
                        '-vf', f'fps=30,scale={w}:{h}:force_original_aspect_ratio=increase,{crop},setsar=1', '-q:v', '3', os.path.join(d, '%06d.jpg')], check=True)
        manifest[slot + suffix] = {'count': len(glob.glob(os.path.join(d, '*.jpg'))), 'fps': 30}
    print(f'  {slot}: {manifest[slot]["count"]} frames <- {os.path.basename(src)}')

if a.batch:
    for f in sorted(glob.glob(os.path.join(a.src, '*'))):
        b = os.path.basename(f).lower()
        m = next((s for s in sorted(SLOTS, key=len, reverse=True) if b.startswith(s)), None)
        if m and os.path.splitext(f)[1].lower() in ('.mp4', '.mov', '.m4v', '.webm'):
            do(f, m)
else:
    if not a.slot: sys.exit('give a slot id, e.g. s3-fitness')
    do(a.src, a.slot, a.start)
json.dump(manifest, open(MAN, 'w'), indent=1)
print('slots ready:', ', '.join(s for s in SLOTS if s in manifest) or 'none', '| still placeholders:', ', '.join(s for s in SLOTS if s not in manifest) or 'none')
