#!/usr/bin/env python3
"""Extract the frame sequences used by src/main.js from the two source videos (assets/drive/*.mp4).
Run from this folder:  python3 prep_clips.py
(Frames are used instead of <video> because the headless Chromium used for rendering has no H.264 and the static server has no Range support.)"""
import subprocess, json, os, glob
D = 'assets/drive/'
R = D + 'D_Randy_video_no_watermark.mp4'; S = D + 'Jenderal_TNI_Soeharto_-_Arsip_video_no_watermark.mp4'
clips = {'soe_oath': (S, 2.0, 5.6), 'ref_march': (R, 17.0, 4.8), 'ref_dome': (R, 25.2, 4.4), 'ref_aerial': (R, 40.2, 4.4),
         'ref_student': (R, 0.3, 2.4), 'ref_clap': (R, 5.2, 2.2), 'ref_dialog': (R, 62.2, 4.4)}
man = {}
for n, (src, ss, d) in clips.items():
    os.makedirs('assets/frames/' + n, exist_ok=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(ss), '-t', str(d), '-i', src, '-vf', 'fps=30', '-q:v', '3', 'assets/frames/%s/%%05d.jpg' % n], check=True)
    man[n] = len(glob.glob('assets/frames/%s/*.jpg' % n))
json.dump(man, open('assets/frames/manifest.json', 'w')); print(man)
