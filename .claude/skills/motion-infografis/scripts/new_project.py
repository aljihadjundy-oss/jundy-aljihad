#!/usr/bin/env python3
"""Scaffold a project without footage (data-driven motion video from scratch).

  python3 new_project.py myproject [--w 1080 --h 1920 --fps 30]

For raw-footage projects use prep_footage.py instead (it creates project.json too).
"""
import argparse, json, os

ap = argparse.ArgumentParser()
ap.add_argument('project')
ap.add_argument('--w', type=int, default=1080)
ap.add_argument('--h', type=int, default=1920)
ap.add_argument('--fps', type=int, default=30)
a = ap.parse_args()
os.makedirs(os.path.join(a.project, 'assets'), exist_ok=True)
pj = os.path.join(a.project, 'project.json')
if os.path.exists(pj):
    raise SystemExit(f'{pj} already exists')
json.dump({
    'canvas': {'w': a.w, 'h': a.h, 'fps': a.fps},
    'footage': False,
    'brand': {},
    'chrome': {'name': '', 'sub': '', 'logo': None, 'progress': True},
    'audio': {'pad': 'auto', 'sfx': 1.0, 'target_lufs': -16},
    'beats': [],
}, open(pj, 'w'), indent=2, ensure_ascii=False)
print('created', pj)
