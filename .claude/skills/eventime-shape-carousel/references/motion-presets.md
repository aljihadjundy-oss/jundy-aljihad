# Motion presets

Motion per slide adalah nilai tambah yang user suka, tapi fungsinya bukan hiasan: motion mengarahkan mata dalam urutan baca (hook dulu, bukti kemudian, CTA terakhir), dan memberi alasan orang berhenti di slide. Karena itu setiap slide punya satu "koreografi" pendek, bukan semua elemen bergerak bersamaan.

## Preset (atribut `data-m` di template)

| Preset | Efek | Durasi | Dipakai untuk |
|---|---|---|---|
| `rise` | Naik 46px sambil fade-in | .8s | Headline, body, kotak teks (default) |
| `pop` | Skala .6 → 1 dengan membal | .8s | Ikon, logo, item kecil |
| `stamp` | Skala besar + putar → mendarat miring | .55s | Label pill, tag kategori, sticker tanggal, aksen merah |
| `wipe` | Terbuka dari kiri (clip) | .9s | Garis timeline, highlight yang "ditulis" |
| `slide-l` / `slide-r` | Masuk dari kiri / kanan 120px | .8s | Baris list, kartu compare, tag nama |
| `fade` | Fade | 1s | Latar samar (ghost word, numeral) |
| `scribble` | Garis tergambar dari kiri | .8s | Underline quote |
| `float` | Pop lalu melayang naik-turun terus | 4s loop | Objek hero (megaphone, jam, produk) |
| `pulse` | Membesar-mengecil halus terus | 1.6s loop | CTA pill, handle |
| `nudge` | Geser kanan-kiri 12px terus | 1.4s loop | Panah next (cue swipe) |
| bar grow | Batang tumbuh dari kiri | 1.1s | Pola `bars` |
| count-up | Angka naik dari 0 | 1.1s | Pola `stat` |
| typed | Teks diketik huruf demi huruf | 55ms/huruf | Pola `search` |

Easing default `cubic-bezier(.2,.8,.2,1)` (keluar cepat, berhenti lembut). `stamp` dan `pop` membal.

## Aturan koreografi

1. **Urutan = urutan baca.** Elemen pertama muncul di 0.1-0.3s, sisanya berjarak 0.2-0.4s. Total sampai elemen terakhir ≤ 1.8s; setelah itu hanya loop halus.
2. **Maksimal 1 elemen loop per slide** (float, pulse, atau nudge utama). Panah next boleh nudge sebagai tambahan karena bagian dari chrome.
3. **Kata kunci mendapat gerakan paling dramatis** (stamp). Itu juga tempat aksen merah, jadi mata dan makna jatuh di tempat yang sama.
4. **Slide formal B2B**: pakai `rise`, `fade`, `wipe`, `slide`, hindari `stamp` berlebihan dan `float`. Gerak tenang = kredibel.
5. **Slide playful**: `stamp`, `pop`, `scribble`, `pulse` boleh lebih banyak.
6. **Slide terakhir**: tidak ada panah. CTA `pulse`.
7. **Kondisi akhir = layout statis yang lengkap.** Setiap slide harus tetap benar kalau animasinya tidak diputar (screenshot, reduce-motion). Itu yang dipakai untuk PNG: `?final=1`.

## Menulis motion di design plan

Satu baris per slide, urutan eksplisit. Contoh:
`Ikon pop → kicker rise → headline rise, 'Reset' stamp merah menyusul → sub rise; panah next nudge`

## Dari preview ke file posting

Preview HTML adalah sumber kebenaran. Dari situ ada dua keluaran:

- **Slide statis (JPEG/PNG):** `python3 scripts/screenshot.py preview.html out/png` → PNG 1080×1350 keadaan akhir animasi. Untuk JPEG posting: `ffmpeg -i slide-01.png -q:v 10 slide-01.jpg`.
- **Slide bergerak (MP4):** `python3 scripts/render_video.py preview.html out/video --prefix C01` → satu MP4 H.264 1080×1350, 30fps, 5 detik per slide, tanpa audio. Animasi dipause lalu digeser frame demi frame, jadi hasilnya sama di komputer mana pun. Satu carousel 5 slide dirender ±1 menit.

Catatan penting:
- IG carousel boleh mencampur video dan gambar, jadi semua slide bisa diposting sebagai MP4 yang saling berurutan.
- Frame pertama tiap video = keadaan akhir slide (poster), supaya thumbnail grid tidak kosong. Ada kedipan 1 frame di awal; matikan dengan `--no-poster`.
- Pola `search` (diketik) dan `stat` (angka naik) tampil langsung dalam keadaan akhir di MP4; itu keterbatasan mode render.
- Loop (float/pulse/nudge) tidak dijahit mulus di titik ulang 5 detik. Kalau terasa, naikkan `--seconds` ke kelipatan durasi loop.
- Belum dites di aplikasi IG asli: cek durasi, ukuran, dan kualitas saat upload pertama.
