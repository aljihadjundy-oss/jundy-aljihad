# SIAGA SUMATRA — video motion graphics (tanpa Remotion)

Video infografis vertikal 1080×1920 untuk program Manajemen Pengurangan Risiko Bencana SIAGA SUMATRA (Kabupaten Agam).
Semua dibangun dari nol: HTML/CSS/SVG + JavaScript, dirender frame demi frame dengan Chromium headless, lalu di-encode ffmpeg.

## Cara render

```bash
npm install                          # playwright-core + font Plus Jakarta Sans
sudo apt-get install -y ffmpeg       # butuh libx264
pip install numpy pillow             # sintesis audio + contact sheet
node render.mjs                      # → out/siaga_sumatra_motion.mp4
node render.mjs --range 42,55        # preview satu bagian → out/preview.mp4
node render.mjs --stills 10,47.5     # PNG → out/stills/
```

Aset **tidak** di-commit (repo ini publik). Taruh di `assets/` dengan susunan berikut:

```
assets/data.json
assets/narrasi_referensi.md
assets/logo/cover.jpg
assets/photos/foto1.jpg foto2.jpg foto3.jpg
assets/screenshots/home|peta|zona|deteksi|jalur|siaga|edukasi|tips|bantuan.jpg   (.png juga bisa)
```

Screenshot yang belum ada otomatis diganti placeholder berlabel "file belum masuk". Begitu file-nya ditaruh, cukup render ulang.

## Cara kerja

- `src/engine.js`: solver cubic-bezier (kurva sama dengan CSS), helper `io/enter/pose`, dan stroke-draw. Setiap visual adalah
  fungsi murni dari waktu `seek(t)`. Tidak memakai CSS animation atau requestAnimationFrame, jadi tiap frame deterministik.
- `src/main.js`: timeline. Scene berurutan dengan overlap 0,5 dtk. Isinya juga layer latar, chrome atas (badge, bab, progress bar), dan daftar cue audio.
- `src/scenes/*`: satu modul per scene (`dur`, `chapter`, `build(root, ctx) → update(t)`). Semua teks dan angka dibaca dari `assets/data.json`.
- `render.mjs`: server statis lokal ke Playwright-core (Chromium), `screenshot` JPEG q95 per frame, 3 worker paralel.
  Output diproses ffmpeg `libx264 -crf 16 -pix_fmt yuv420p`, di-concat, lalu di-mux dengan audio AAC 192k (`+faststart`).
- `tools/synth_audio.py`: soundtrack disintesis dengan numpy (pad ambient Cmaj7–Am7–Fmaj7–G6 dan whoosh/pop/tick per cue),
  lalu dinormalisasi ke sekitar −19 LUFS. Tanpa sampel pihak ketiga, jadi bebas lisensi.
- `tools/prep_geo.py`: membuat `src/geo.json` (path SVG Sumatra + Kabupaten Agam) dari geoBoundaries.

## Bahasa gerak yang dipakai

Riset gaya ke lumenkreatif.com **tidak bisa dilakukan**, karena domain itu diblokir kebijakan jaringan environment cloud.
Aturan di bawah ini keputusan desain sendiri, bukan tiruan referensi:

- **Easing:** masuk memakai out-expo `cubic-bezier(.16,1,.3,1)` 0,8 dtk (cepat lalu mendarat halus), keluar memakai in-cubic 0,45 dtk sambil naik 28 px.
  Gerak kamera memakai in-out-cubic/quart. Ikon dan node "pop" memakai out-back (overshoot kecil).
- **Stagger:** 55 ms per kata di judul, 120–150 ms per kartu/grid, dan 1–1,5 dtk per item checklist/alur supaya sempat dibaca.
- **Angka:** count-up out-cubic 1,1–1,2 dtk. Angka korban BNPB sengaja **tidak** di-count-up.
- **Chart:** bar tumbuh dari 0 (scaleX, out-cubic 1,1 dtk), gridline dan panah digambar dengan stroke-draw.
- **Warna:** `brand_colors` dari data.json. Bab naratif memakai latar navy gelap, bab evaluasi/roadmap memakai latar terang (circle reveal).
- **Tipografi:** Plus Jakarta Sans. Judul 800 dengan tracking −2%, kicker 700 kapital dengan tracking +16%, badan teks 500.
- **Dekorasi:** garis kontur topografi yang bernapas pelan (motif dari splash screen aplikasi), glow lembut yang drift, dan dither halus anti-banding.
- **Ritme:** scene 6,5–15 dtk, ada beat baru tiap 1–2 dtk, dengan transisi overlap 0,5 dtk (bukan hard cut).

## Atribusi

- Batas wilayah: geoBoundaries (gbOpen IDN ADM1/ADM2, CC BY 4.0). Atribusi ini tampil di layar pada scene peta.
- Foto udara di scene 02: ANTARA (watermark dibiarkan, kredit tampil di caption).
- Font: Plus Jakarta Sans (SIL OFL) via `@fontsource`.
