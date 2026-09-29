#!/usr/bin/env python3
"""Prepare raw footage for a motion-infografis project.

Extracts one canvas-sized JPEG per output frame + the audio track, and writes footage.json.
Creates <project>/project.json if it does not exist yet.

  python3 prep_footage.py raw.mp4 myproject                      # 1080x1920, cover-crop, 30 fps
  python3 prep_footage.py raw.mov myproject --fit blur           # landscape clip inside a blurred 9:16 frame
  python3 prep_footage.py raw.mp4 myproject --start 3.2 --end 61 # trim
  python3 prep_footage.py raw.mp4 myproject --focus-x 0.4        # cover-crop centred slightly left
"""
import argparse, json, os, shutil, subprocess, sys

ap = argparse.ArgumentParser()
ap.add_argument('video')
ap.add_argument('project')
ap.add_argument('--w', type=int, default=1080)
ap.add_argument('--h', type=int, default=1920)
ap.add_argument('--fps', type=int, default=30)
ap.add_argument('--fit', choices=['cover', 'blur', 'contain'], default='cover')
ap.add_argument('--focus-x', type=float, default=0.5, help='cover crop horizontal focus 0..1')
ap.add_argument('--focus-y', type=float, default=0.5, help='cover crop vertical focus 0..1')
ap.add_argument('--start', type=float, default=0.0)
ap.add_argument('--end', type=float, default=None)
ap.add_argument('--quality', type=int, default=3, help='JPEG qscale (2 best … 31 worst)')
a = ap.parse_args()

def probe(path):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration:stream=codec_type,width,height,r_frame_rate:stream_tags=rotate:stream_side_data=rotation',
                        '-of', 'json', path], capture_output=True, text=True)
    if r.returncode:
        sys.exit(f'ffprobe failed: {r.stderr}')
    return json.loads(r.stdout)

info = probe(a.video)
v = next((s for s in info['streams'] if s.get('codec_type') == 'video'), None)
if not v:
    sys.exit('no video stream')
has_audio = any(s.get('codec_type') == 'audio' for s in info['streams'])
src_dur = float(info['format']['duration'])
end = min(a.end, src_dur) if a.end else src_dur
dur = end - a.start
W, H = a.w, a.h

if a.fit == 'cover':
    vf = (f"fps={a.fps},scale={W}:{H}:force_original_aspect_ratio=increase,"
          f"crop={W}:{H}:(iw-{W})*{a.focus_x}:(ih-{H})*{a.focus_y},setsar=1")
    fc = None
else:
    bg = 'boxblur=40:3,eq=brightness=-0.12' if a.fit == 'blur' else 'drawbox=c=black:t=fill'
    fc = (f"[0:v]fps={a.fps},split[a][b];[a]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},{bg}[bg];"
          f"[b]scale={W}:{H}:force_original_aspect_ratio=decrease[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,setsar=1[out]")

fdir = os.path.join(a.project, 'footage')
frames = os.path.join(fdir, 'frames')
shutil.rmtree(frames, ignore_errors=True)
os.makedirs(frames, exist_ok=True)
cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-ss', str(a.start), '-t', str(dur), '-i', a.video]
cmd += (['-vf', vf] if not fc else ['-filter_complex', fc, '-map', '[out]'])
cmd += ['-q:v', str(a.quality), os.path.join(frames, '%06d.jpg')]
print('extracting frames …', flush=True)
subprocess.run(cmd, check=True)
count = len([f for f in os.listdir(frames) if f.endswith('.jpg')])

wav = os.path.join(fdir, 'audio.wav')
if has_audio:
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', str(a.start), '-t', str(dur), '-i', a.video, '-vn', '-ac', '2', '-ar', '48000', wav], check=True)

meta = {'src': os.path.abspath(a.video), 'fps': a.fps, 'count': count, 'duration': round(count / a.fps, 3), 'w': W, 'h': H,
        'fit': a.fit, 'start': a.start, 'end': end, 'hasAudio': has_audio,
        'source': {'w': v.get('width'), 'h': v.get('height'), 'fps': v.get('r_frame_rate'), 'duration': src_dur}}
json.dump(meta, open(os.path.join(fdir, 'footage.json'), 'w'), indent=2)

pj = os.path.join(a.project, 'project.json')
if not os.path.exists(pj):
    json.dump({'canvas': {'w': W, 'h': H, 'fps': a.fps}, 'footage': True, 'duration': meta['duration'],
               'brand': {}, 'chrome': {'progress': True}, 'captions': {'enabled': True},
               'audio': {'voice': True, 'sfx': 1.0, 'pad': False, 'target_lufs': -14}, 'beats': []},
              open(pj, 'w'), indent=2, ensure_ascii=False)
    print('created', pj)
else:
    p = json.load(open(pj))
    p['footage'] = True
    p['duration'] = meta['duration']
    json.dump(p, open(pj, 'w'), indent=2, ensure_ascii=False)
print(f"footage: {count} frames @ {a.fps} fps = {meta['duration']}s · source {v.get('width')}x{v.get('height')} · fit {a.fit} · audio {'yes' if has_audio else 'no'}")
