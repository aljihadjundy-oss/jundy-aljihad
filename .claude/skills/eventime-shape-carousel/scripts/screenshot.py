#!/usr/bin/env python3
"""Screenshot tiap slide dari preview HTML jadi PNG 1080x1350 (keadaan akhir animasi).

Pakai:  python3 screenshot.py out/preview.html out/png
Butuh: pip install playwright; Chromium sudah ada di /opt/pw-browsers.
"""
import sys, json, re, os
from pathlib import Path
from playwright.sync_api import sync_playwright

src = Path(sys.argv[1]).resolve(); out = Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
n = len(json.loads(re.search(r'<script id="deck" type="application/json">(.*?)</script>', src.read_text(), re.S).group(1).replace("<\\/", "</"))["slides"])
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH', '/opt/pw-browsers/chromium'), args=['--no-sandbox'])
    pg = b.new_page(viewport={"width": 1080, "height": 1350})
    for i in range(1, n + 1):
        pg.goto(f"file://{src}?export=1&final=1&slide={i}")
        pg.wait_for_timeout(1800)
        pg.screenshot(path=str(out / f"slide-{i:02d}.png"))
        print("png", out / f"slide-{i:02d}.png")
    b.close()
