#!/usr/bin/env python3
"""Make a share-sized copy of a render (two-pass H.264, same resolution).

  python3 deliver.py project/out/final.mp4 project/out/final_28mb.mp4 --max-mb 28

Used when a chat/file tool has an upload limit (e.g. 30 MB). Keeps the master untouched.
"""
import argparse, json, os, shutil, subprocess, tempfile

ap = argparse.ArgumentParser()
ap.add_argument('src')
ap.add_argument('dst')
ap.add_argument('--max-mb', type=float, default=28)
ap.add_argument('--audio-kbps', type=int, default=128)
a = ap.parse_args()

size = os.path.getsize(a.src) / 2 ** 20
if size <= a.max_mb:
    shutil.copy(a.src, a.dst)
    print(f'already {size:.1f} MB ≤ {a.max_mb} MB → copied')
    raise SystemExit
dur = float(json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'json', a.src], capture_output=True, text=True).stdout)['format']['duration'])
kbps = int((a.max_mb * 0.96 * 8 * 1024 * 1024 / dur) / 1000) - a.audio_kbps
kbps = max(400, kbps)
log = os.path.join(tempfile.mkdtemp(), 'x264')
common = ['-c:v', 'libx264', '-preset', 'slow', '-tune', 'animation', '-b:v', f'{kbps}k', '-maxrate', f'{kbps * 2}k', '-bufsize', f'{kbps * 4}k', '-passlogfile', log]
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', a.src, *common, '-pass', '1', '-an', '-f', 'mp4', os.devnull], check=True)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', a.src, *common, '-pass', '2', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', f'{a.audio_kbps}k', '-movflags', '+faststart', a.dst], check=True)
print(f'{a.dst}: {os.path.getsize(a.dst) / 2 ** 20:.1f} MB (video {kbps} kbps)')
