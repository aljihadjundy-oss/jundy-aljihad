#!/usr/bin/env python3
"""Bangun preview HTML bergerak dari deck.json + cek aturan brand.

Pakai:  python3 build_preview.py deck.json out/preview.html
Exit code 1 kalau ada pelanggaran aturan keras (agar tidak lolos diam-diam).
"""
import json, re, sys, shutil
from pathlib import Path

HERE = Path(__file__).resolve().parent
TEMPLATE = HERE.parent / "assets" / "preview-template.html"
LOGO = HERE.parent / "assets" / "logo-shape.png"
PATTERNS = {"cover","claim","numbered","compare","bars","stat","list","search",
            "session","quote","logos","timeline","speaker","cta","partner"}
PILLARS = {"mind","fitness","nutrition","health","longevity","aesthetics"}

def texts(node):
    if isinstance(node, str):
        yield node
    elif isinstance(node, dict):
        for k, v in node.items():
            if k in ("notes", "pattern", "asset", "photo", "icon", "pillar", "align"):
                continue
            yield from texts(v)
    elif isinstance(node, list):
        for v in node:
            yield from texts(v)

def check(deck):
    errs, warns = [], []
    slides = deck.get("slides", [])
    meta = deck.get("meta", {})
    n = len(slides)
    if not 3 <= n <= 5:
        warns.append(f"Jumlah slide {n}: plan menyarankan 3-5. Konfirmasi ke user kalau sengaja lebih.")
    red = 0
    for i, s in enumerate(slides, 1):
        p = s.get("pattern")
        if p not in PATTERNS:
            errs.append(f"Slide {i}: pattern '{p}' tidak dikenal ({sorted(PATTERNS)})")
        blob = " ".join(texts(s))
        red += len(re.findall(r"\[\[.+?\]\]", blob))
        if p == "speaker" and s.get("date"):
            red += 1  # sticker tanggal = aksen merah
        if p == "session" and s.get("dateRed"):
            red += 1  # kotak tanggal merah
        if p == "speaker" and meta.get("style") != "playful":
            errs.append(f"Slide {i}: pattern speaker hanya untuk gaya playful")
        if p == "speaker" and s.get("pillar") not in PILLARS:
            errs.append(f"Slide {i}: pillar harus salah satu {sorted(PILLARS)}")
        for field in ("title", "body", "sub"):
            v = s.get(field)
            if isinstance(v, str) and v.count("\n") >= 3:
                warns.append(f"Slide {i}: '{field}' >3 baris, pecah jadi slide baru")
        if not s.get("notes"):
            warns.append(f"Slide {i}: notes (visual/elemen/motion/aset) kosong")
    if red > 1:
        errs.append(f"Aksen merah [[...]] dipakai {red}x, batas 1x per carousel")
    if meta.get("segment") == "b2b":
        blob = " ".join(texts(slides)).lower()
        for bad in ("36 co-sponsor", "10 main", "idr", "rp ", "juta"):
            if bad in blob:
                errs.append(f"B2B feed publik tidak boleh memuat kuota/harga sponsor: '{bad}'")
    if meta.get("segment") == "b2c":
        blob = " ".join(texts(slides)).lower()
        if "daftar webinar" in blob or "daftar sesi" in blob:
            errs.append("B2C tidak boleh hard CTA daftar webinar")
    if slides and slides[-1].get("pattern") not in ("cta", "session", "logos", "timeline", "quote", "speaker"):
        warns.append("Slide terakhir sebaiknya closing + CTA (pattern cta)")
    return errs, warns

def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    deck = json.loads(Path(sys.argv[1]).read_text())
    errs, warns = check(deck)
    for w in warns: print("WARN ", w)
    for e in errs: print("ERROR", e)
    out = Path(sys.argv[2]); out.parent.mkdir(parents=True, exist_ok=True)
    html = TEMPLATE.read_text().replace("__DECK__", json.dumps(deck, ensure_ascii=False).replace("</", "<\\/"))
    out.write_text(html)
    shutil.copytree(HERE.parent / "assets" / "fonts", out.parent / "fonts", dirs_exist_ok=True)
    shutil.copy(HERE.parent / "assets" / "bg-grid.jpg", out.parent / "bg-grid.jpg")
    if LOGO.exists():
        shutil.copy(LOGO, out.parent / "logo-shape.png")
    print(f"OK  {out} ({len(deck.get('slides', []))} slide)")
    sys.exit(1 if errs else 0)

if __name__ == "__main__":
    main()
