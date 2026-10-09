---
name: eventime-shape-carousel
description: Bikin carousel Instagram end-to-end untuk Eventime (@eventime.indonesia) yang mempromosikan Shape Indonesia Executive Forum / Shape Expert Network / Shape Indonesia Expo 2027. Dari content plan jadi script per slide, design plan (copy, visual, elemen seperti chart/timeline/tabel/mockup, motion), daftar aset + prompt GPT image, dan file PPTX yang bisa diedit (animasi masuk per slide). Pakai skill ini setiap kali user minta carousel, script carousel, design plan, slide, atau konten visual untuk Shape, Eventime, Founding Circle Partners, webinar Shape, atau menyebut kode kalender seperti C05 / "Okt minggu 2" — walau tidak bilang "skill" atau "carousel" secara eksplisit.
---

# Carousel Eventime × Shape Indonesia

Skill ini mengubah satu baris content plan jadi carousel yang siap dieksekusi: script, design plan, dan file PPTX yang bisa diedit dengan animasi per slide. Tujuannya konten yang **engaging, interaktif, worth to follow**, dengan estetika yang sejalan tren visual (glass card, grid blueprint, tipografi besar, motion kecil yang punya alasan).

Konteks bisnis: Eventime Creative Nusantara adalah organizer. Shape Indonesia adalah brand/klien. Carousel hidup di feed @eventime.indonesia dan sering di-cross-post ke @shape.indonesia/LinkedIn. Jangan menyamakan ini dengan Osiris Event, Sinatif, atau Hexolution; itu unit lain.

## Lokasi file dan setup

Semua path di dokumen ini relatif terhadap folder skill ini (`<SKILL_DIR>`, tempat `SKILL.md` berada). Jalankan skrip dari mana saja dengan path penuh, mis. `python3 <SKILL_DIR>/scripts/build_pptx.py ...`. Keluaran carousel disimpan di folder kerja user pada `carousel-output/<kode>-<slug>/`, bukan di dalam folder skill.

Dependensi Python: `pip install -r <SKILL_DIR>/requirements.txt` (python-pptx, pillow, lxml, svgpathtools). `make_background.py` juga butuh numpy dan opencv; preview/MP4 butuh playwright dan Chromium; cek visual butuh LibreOffice Impress dan poppler (`pdftoppm`). Semuanya opsional kecuali empat yang pertama.

## Keputusan yang sudah dikunci user (jangan ditanya ulang)

- Tanggal Expo 2027: **8-10 Oktober 2027** (ikuti content plan; proposal sponsorship tertulis 5-7 Okt, itu diabaikan).
- Penomoran sesi webinar: ikuti content plan (Sesi 1 Kickoff … Sesi 7 Closing).
- Logo di slide: **hanya logo Shape**. Logo Eventime belum dipakai.
- Gaya: **Base Blue** untuk semua carousel; **Expert Playful** hanya untuk carousel speaker/event.
- Deliverable utama: PPTX yang bisa diedit (bukan PNG/JPG/MP4). Preview HTML dan MP4 hanya kalau diminta.
- Bagi aset: user mencarikan foto pembicara/aset Google dan menjalankan prompt GPT image; skill menyiapkan daftar dan prompt.

## Cara kerja

Baca file referensi **sebelum** menulis apa pun, karena aturan keras (jatah merah, larangan B2B/B2C) ada di sana dan tidak bisa ditebak.

1. `references/brand-kit.md`: token warna, tipografi, elemen tetap, dua gaya.
2. `references/content-rules.md`: tabel fakta (satu-satunya sumber angka/tanggal), aturan B2C vs B2B, larangan.
3. `references/calendar-carousels.md`: 17 carousel Sep-Des 2026 dengan brief aslinya.
4. `references/slide-patterns.md`: pilih pola slide berdasarkan peran, plus resep per tipe konten.
5. `references/motion-presets.md`: preset motion dan aturan koreografi.
6. `references/asset-requests.md`: format daftar aset dan template prompt GPT image.

### Langkah

**1. Intake.** Tentukan carousel mana:
- User menyebut kode (C05), bulan+minggu, atau topik → cari di `calendar-carousels.md`.
- Brief bebas di luar kalender → tentukan sendiri segmen (B2C/B2B), pilar, gaya, funnel stage.

Dari baris kalender ambil: segmen, pilar, brief, hook caption, CTA, brief visual. Catat bentrokan antara kalender dan brand kit (mis. plan menulis "highlight box" sementara referensi memakai glass card; ikuti pola di `slide-patterns.md`).

Tanya user hanya kalau ada fakta yang tidak ada di tabel fakta (tanggal sesi, nama pembicara baru, angka). Jangan mengarang. Kalau data belum ada, pakai placeholder yang jelas dan masukkan ke daftar pertanyaan terbuka.

**2. Script.** Tulis copy per slide dalam bentuk tabel: no, peran slide (Hook / Development / Closing), copy persis, kata yang di-highlight. Prinsip yang sering terlupa:
- Satu ide per slide, 3-5 slide. Slide harus bisa berdiri sendiri kalau di-screenshot.
- Hook slide 1 maksimal 2 baris dan harus terbaca dalam 1 detik (pola: mitos vs fakta, angka + janji, niat vs realita, pertanyaan, reframe).
- B2C: santai, menertawakan diri bareng, CTA simpan/share, tanpa data dan tanpa "daftar webinar". B2B: profesional, kelangkaan lewat kata "terpilih", CTA LinkedIn Events/DM, tanpa kuota/harga sponsor.
- Aksen merah (`[[ ]]`) satu kali per carousel, pada istilah yang paling ingin diingat.
- Bukan klaim medis absolut.

**3. Design plan.** Untuk tiap slide tulis lima hal: **copy, visual, elemen visual, motion, aset**. Pilih pola dari `slide-patterns.md` berdasarkan peran slide. Pikirkan elemen yang membuat carousel "interaktif": search bar mockup yang mengetik, checklist yang muncul satu per satu, perbandingan dua kartu, batang yang tumbuh, timeline yang tergambar, sticker yang di-stamp. Pilih elemen yang menjelaskan isi, bukan yang paling ramai. Slide B2B: tenang dan formal.

**4. Bangun PPTX.** Deliverable utama adalah **file PPTX yang bisa diedit user** (bukan PNG/JPG/MP4). Tulis `deck.json` (skema di `slide-patterns.md`, contoh di `assets/examples/`), lalu:

```bash
python3 <SKILL_DIR>/scripts/build_pptx.py carousel-output/C05-slug/deck.json carousel-output/C05-slug/C05.pptx
```

Isi PPTX: semua teks/kotak/kartu/ikon adalah objek native (bisa digeser dan diganti), latar grid miring + logo Shape + 3 titik ada di Layout "Shape Carousel" (ganti sekali berlaku di semua slide), motion = animasi masuk bawaan PowerPoint yang jalan otomatis, dan catatan visual/elemen/motion/aset per slide ada di Speaker Notes. Ekspor ke video lewat File > Export > Create a Video. User perlu memasang font Poppins sekali: file TTF ada di `<SKILL_DIR>/assets/fonts-ttf/` (pilih semua > klik kanan > Install, lalu tutup dan buka lagi PowerPoint). Sertakan petunjuk ini saat menyerahkan PPTX. Alternatif tanpa instal: buka di Google Slides. Highlight kata ({{ }} dan [[ ]]) digambar sebagai shape rounded di belakang teks (bukan fitur highlight teks), jadi tampil sama di semua versi PowerPoint dan tetap bisa digeser.

`build_pptx.py` mengecek aturan keras (merah >1x, pola speaker di luar playful, kuota/harga di B2B, "daftar webinar" di B2C) dan keluar dengan error kalau dilanggar. Perbaiki sampai bersih. Peringatan (jumlah slide, slide terakhir bukan CTA) dipertimbangkan, bukan otomatis diabaikan.

**Lihat hasilnya sebelum melapor.** Render PPTX lewat LibreOffice (`soffice --headless --convert-to pdf`, lalu `pdftoppm -png`; paket `libreoffice-impress` harus terpasang) dan periksa gambarnya: teks tidak menabrak logo/panah, maksimal 2-3 baris per kotak, hirarki jelas, kontras cukup. Gambar render ini hanya untuk pengecekan sendiri, jangan disimpan ke folder carousel atau diserahkan ke user. Animasi tidak ikut terlihat di render; ia hanya terverifikasi terbaca oleh LibreOffice, belum diuji di PowerPoint/Keynote.

Opsional, hanya kalau user minta preview di browser atau MP4: `build_preview.py` (HTML bergerak), `screenshot.py` (PNG), `render_video.py` (MP4). Keluarannya tidak disimpan di folder carousel kecuali diminta.

**5. Aset.** Susun daftar aset sesuai `asset-requests.md`, plus prompt GPT image yang siap dicopas untuk yang perlu dibuat. Tandai yang harus dicari user (foto pembicara, logo).

**6. Serahkan.** Simpan semuanya di `carousel-output/<kode>-<slug>/`:

| File | Isi |
|---|---|
| `<kode>.pptx` | Carousel yang bisa diedit (deliverable utama) |
| `script.md` | Tabel script per slide + caption (hook dari kalender) + jam/hari posting |
| `design-plan.md` | Per slide: copy, visual, elemen, motion, aset. Tambah daftar aset & pertanyaan terbuka (`python3 <SKILL_DIR>/scripts/deck_to_plan.py deck.json design-plan.md "<baris header>"` membuat kerangkanya dari `deck.json`) |
| `caption.txt` | Caption siap copas |
| `deck.json` | Sumber PPTX |

Satu carousel = satu folder. Kalau di-revisi, **timpa** file yang ada dan hapus keluaran lama, supaya tidak menumpuk versi.

Lapor ke user singkat: apa yang dibuat, di mana, keputusan desain utama, dan **daftar apa yang masih dibutuhkan dari user**. Jangan menempel seluruh dokumen ke chat.

## Format design-plan.md

```markdown
# C05 · Okt W1 · B2C · Mind Power — "5 Tanda Butuh Reset"
Gaya: Base Blue · Funnel: Awareness · CTA: simpan & share · Posting: Minggu malam 18.00-21.00 WIB

## Slide 1 — Hook (pola: cover)
- Copy: …
- Visual: …
- Elemen: …
- Motion: A → B → C
- Aset: …

## Aset & pertanyaan terbuka
…
```

## Hal yang gampang salah

- Mengambil angka reach/sponsor dari proposal. Hanya pakai tabel fakta di `content-rules.md`.
- Menaruh foto/nama pembicara atau logo partner tanpa file dari user. Pakai placeholder.
- Menaruh dua gaya dalam satu carousel, atau merah lebih dari sekali.
- Menambah slide >5 tanpa bertanya.
- Motion yang terlalu ramai di konten B2B formal.
- Mengklaim sesuatu sudah dites di perangkat/IG asli atau di PowerPoint asli. Hasil hanya diverifikasi lewat render LibreOffice.
- Mengarang kutipan atas nama orang nyata (pembicara, partner). Selalu placeholder sampai ada kutipan asli.
- Jalur kalender butuh jawaban user: tanggal sesi, nama pembicara, kutipan, logo, foto. Kumpulkan sebagai daftar pertanyaan terbuka, jangan ditebak.

## Status

Sudah ada: brand kit, aturan, kalender 17 carousel, 15 pola slide, validator aturan keras, builder PPTX native dengan animasi bawaan PowerPoint, latar grid miring + logo Shape asli (dari contoh user), 3 contoh deck (`assets/examples/`). Preview HTML dan render MP4 tersedia sebagai opsi.
Belum ada: uji animasi di PowerPoint/Keynote/Google Slides, foto pembicara dan logo partner (harus dari user), uji upload ke akun IG nyata. Carousel referensi C02 (detox) dan C03 (launch) belum dibuat ulang sebagai PPTX.
