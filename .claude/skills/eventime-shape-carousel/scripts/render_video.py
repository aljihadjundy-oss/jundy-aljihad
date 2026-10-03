#!/usr/bin/env python3
"""Render tiap slide preview jadi MP4 (H.264, 1080x1350) untuk carousel Instagram.

Pakai:  python3 render_video.py out/preview.html out/video [--seconds 5] [--fps 30] [--prefix C01] [--no-poster] [--slides 1,3]

Cara kerja: animasi CSS dipause lalu digeser frame demi frame lewat Web Animations API,
jadi hasilnya deterministik dan tidak bergantung kecepatan komputer. Tiap frame
di-screenshot lalu dirangkai ffmpeg. Pola `search` (teks diketik) dan `stat`
(angka naik) ditampilkan langsung dalam keadaan akhir di mode ini.

--poster (default): frame pertama video diisi keadaan akhir slide supaya thumbnail
carousel/grid IG tidak kosong. Konsekuensinya ada kedipan 1 frame di awal.
"""
import argparse, json, os, re, shutil, subprocess, tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument("html"); ap.add_argument("outdir")
ap.add_argument("--seconds", type=float, default=5.0)
ap.add_argument("--fps", type=int, default=30)
ap.add_argument("--prefix", default="slide")
ap.add_argument("--no-poster", action="store_true")
ap.add_argument("--slides", default="")
a = ap.parse_args()

src = Path(a.html).resolve(); out = Path(a.outdir); out.mkdir(parents=True, exist_ok=True)
n = len(json.loads(re.search(r'<script id="deck" type="application/json">(.*?)</script>', src.read_text(), re.S).group(1).replace("<\\/", "</"))["slides"])
todo = [int(x) for x in a.slides.split(",")] if a.slides else list(range(1, n + 1))
frames = int(a.seconds * a.fps)
SET = "t => document.getAnimations().forEach(x => { x.pause(); x.currentTime = t; })"

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=os.environ.get("CHROMIUM_PATH", "/opt/pw-browsers/chromium"), args=["--no-sandbox"])
    pg = b.new_page(viewport={"width": 1080, "height": 1350})
    for i in todo:
        tmp = Path(tempfile.mkdtemp())
        pg.goto(f"file://{src}?export=1&capture=1&slide={i}")
        pg.evaluate("document.fonts.ready")
        pg.wait_for_timeout(300)
        k = 0
        if not a.no_poster:
            pg.evaluate(SET, 4500)
            pg.screenshot(path=str(tmp / f"f{k:05d}.jpg"), type="jpeg", quality=95); k += 1
        for f in range(frames):
            pg.evaluate(SET, f * 1000 / a.fps)
            pg.screenshot(path=str(tmp / f"f{k:05d}.jpg"), type="jpeg", quality=95); k += 1
        dst = out / f"{a.prefix}-{i:02d}.mp4"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(a.fps), "-i", str(tmp / "f%05d.jpg"),
                        "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p",
                        "-profile:v", "high", "-movflags", "+faststart", "-an", str(dst)], check=True)
        shutil.rmtree(tmp)
        print("mp4", dst, f"{dst.stat().st_size // 1024}KB")
    b.close()
