# SIAGA SUMATRA — Storyboard Motion Graphics (draf v0, untuk approval)

Format: 1080×1920 (9:16) · 30 fps · MP4 H.264 · target durasi **± 2:08 (128 detik)**

> **Status draf ini.** `data.json`, `narrasi_referensi.md`, screenshot, foto, dan logo
> belum ada di environment cloud ini (masih di laptop, `C:\Users\USER\Downloads\...`).
> Struktur scene di bawah saya susun dari **laporan revisi di Google Drive**
> ("Revisi Paper MPRP", Bab II–IV + Lampiran B), yang tampaknya jadi sumber `data.json`.
> Setelah `data.json` masuk: urutan scene disesuaikan ke `scene_order_reference`,
> jenis chart ke `chart_suggestion`, dan **semua angka/label di layar diambil dari
> `data.json`, bukan dari laporan.** Angka laporan yang disebut di sini hanya
> untuk konteks review.

---

## Ringkasan alur

| # | Waktu | Scene | Data (dari data.json) | Elemen visual utama |
|---|-------|-------|-----------------------|---------------------|
| 1 | 0:00–0:06 | Pembuka | logo, nama program | Logo reveal + kinetic title + 3 chip hazard |
| 2 | 0:06–0:16 | Kondisi akhir 2025 | 3 foto | Kolase kartu foto bergerak (parallax/mask) |
| 3 | 0:16–0:24 | Catatan data BNPB *(sensitif)* | `disaster_context_note` | Kartu data kecil & tenang + sumber + disclaimer |
| 4 | 0:24–0:32 | Kenapa Agam | hulu–hilir, pos lapangan *(jika ada di data.json)* | Diagram penampang hulu→hilir + counter |
| 5 | 0:32–0:44 | Kerangka risiko | 4 unsur (H/E/V/C) | Grid 2×2 yang terbangun satu-satu → menyatu |
| 6 | 0:44–0:50 | Masalahnya | kesenjangan info resmi ↔ warga | Diagram dua node dengan garis putus |
| 7 | 0:50–0:56 | Solusi: aplikasi | nama & peran aplikasi | Mockup ponsel + screenshot home masuk |
| 8 | 0:56–1:14 | 8 fitur | 8 fitur + 8 screenshot | Ponsel tengah, layar berganti, label & counter 1/8…8/8 |
| 9 | 1:14–1:26 | Alur 6 langkah | 6 langkah pemakaian | Diagram alur vertikal, panah menggambar diri |
| 10 | 1:26–1:38 | Hasil evaluasi | skor 3 rater × 3 aspek | Bar tersegmentasi yang tumbuh (skala ordinal) |
| 11 | 1:38–1:52 | 7 masukan | 7 poin perbaikan | Checklist muncul satu-satu, centang tergambar |
| 12 | 1:52–2:02 | Roadmap | 5 tahap | Progress stepper vertikal, garis progres mengisi |
| 13 | 2:02–2:08 | Penutup | tagline & pesan keselamatan | Logo + tagline, fade ke brand navy |

Total ± 128 dtk. Kalau scene 4 tidak punya data di `data.json`, scene itu dibuang → ± 120 dtk.

---

## Detail per scene

### 1 · Pembuka (6 dtk)
- Background navy; garis grid tipis menggambar diri dari tengah.
- `logo/cover.jpg` masuk lewat mask lingkaran/persegi membesar (bukan zoom foto).
- Judul "SIAGA SUMATRA" kinetic (per huruf/kata, stagger), subjudul
  "Manajemen Pengurangan Risiko Bencana · Kabupaten Agam".
- 3 chip muncul berurutan: **Banjir · Banjir Bandang · Tanah Longsor**.

### 2 · Kondisi akhir 2025 (10 dtk)
- 3 foto `photos/` sebagai kartu bertumpuk agak miring; masuk bergantian dengan mask
  wipe; di dalam kartu ada drift pelan (parallax), bukan zoom full-screen.
- Caption kecil tetap di layar: *"Dokumentasi kondisi bencana Sumatra, akhir 2025.
  Lokasi spesifik tiap foto tidak disebutkan dalam sumber."*
- Tidak ada efek shake, flash merah, atau musik dramatis.

### 3 · Catatan data BNPB — sensitif (8 dtk)
- **Bukan chart besar.** Satu kartu kecil di sepertiga bawah layar, warna netral
  (putih/abu di atas navy, tanpa merah), angka **muncul dengan fade biasa, tanpa
  animasi hitung naik** (count-up untuk korban jiwa terasa "gamified").
- Isi: angka rekap dari `disaster_context_note` (laporan menyebut rekap BNPB
  28 Des 2025: korban meninggal, hilang, mengungsi, rumah rusak).
- Label sumber selalu terlihat: *"Sumber: Dashboard BNPB, rekap 28 Des 2025"*.
- Disclaimer dengan ukuran terbaca (bukan footnote kecil):
  **"Data gabungan 3 provinsi (Aceh, Sumut, Sumbar) — bukan angka khusus Agam."**
- Durasi tahan cukup lama untuk dibaca; transisi keluar pelan.

### 4 · Kenapa Agam (8 dtk) — *opsional, tergantung data.json*
- Diagram penampang topografi (garis): pegunungan/hulu → sungai → dataran rendah/hilir.
  Tetes hujan di hulu → panah longsor → gelombang banjir bandang di hilir (garis animasi).
- Counter pos lapangan yang diaktifkan di Agam (laporan: 13) — hanya jika ada di data.json.

### 5 · Kerangka risiko 4 unsur (12 dtk)
- Grid 2×2: **Hazard · Exposure · Vulnerability · Capacity**; tiap tile masuk
  bergantian (stagger), ikon garis menggambar diri, 1 baris penjelasan konteks Agam.
- Akhir scene: 4 tile menyusut & bergerak ke tengah, menyatu jadi satu node "RISIKO"
  → node ini jadi elemen transisi ke scene 6.

### 6 · Masalahnya (6 dtk)
- Node kiri "Data resmi (BNPB/BPBD)" ↔ node kanan "Warga Agam", garis putus-putus
  dengan celah di tengah. Teks: kesenjangan pemahaman zona risiko, peringatan,
  jalur evakuasi, pelaporan.
- Celah kemudian diisi ikon ponsel → match-cut ke scene 7.

### 7 · Solusi: SIAGA SUMATRA (6 dtk)
- Mockup ponsel (frame digambar dengan CSS, bukan stock mockup) naik dari bawah,
  `screenshots/home` tampil di dalamnya.
- Label: "Sistem Informasi dan Aksi Siaga Bencana Sumatra" + pesan kunci
  "penghubung informasi resmi ↔ masyarakat, tidak menggantikan sistem pemerintah".

### 8 · 8 fitur aplikasi (18 dtk, ± 2 dtk per fitur)
- Ponsel tetap di tengah; layar berganti antar-screenshot dengan slide/mask
  (peta → zona → deteksi → jalur → siaga → edukasi → tips → bantuan).
- Nama fitur + 1 baris fungsi muncul di atas ponsel; indikator progres 8 titik /
  counter "3/8".
- Di layar Peta: chip legenda warna risiko (merah tinggi, oranye sedang, hijau rendah)
  pop-in di samping ponsel — overlay, screenshot aslinya tidak diubah.
- Catatan: urutan & nama 8 fitur ikut data.json. (Laporan Bab 3.4 menyebut 6 poin,
  buku panduan memuat 8 layar + Lapor Bencana — data.json yang jadi acuan.)

### 9 · Alur 6 langkah pemakaian (12 dtk)
- Diagram vertikal zig-zag: **Kenali → Waspada → Siapkan → Evakuasi → Bantu → Hubungi**.
- Panah menggambar diri (stroke draw), titik kecil berjalan di sepanjang jalur;
  tiap node pop-in dengan ikon + thumbnail screenshot fitur terkait.

### 10 · Hasil evaluasi 3 rater (12 dtk)
- Laporan memberi skor **kualitatif** (Tidak Baik / Cukup / Baik), bukan angka.
  Jadi saya pakai **bar tersegmentasi 3 tingkat** per rater per aspek
  (3 aspek × 3 rater), bar tumbuh sampai level nilainya. Tidak ada angka 1–5 yang dikarang.
  Kalau data.json menyediakan skor numerik, saya pakai itu (bar/radar sesuai `chart_suggestion`).
- Rater ditampilkan **berdasarkan peran** (Akademisi · Praktisi BPBD · Masyarakat).
  Mau pakai nama lengkap juga? (lihat pertanyaan di bawah)
- Callout akhir yang diturunkan langsung dari data: mis. "Tidak ada penilaian Tidak Baik",
  "Kesesuaian dengan Tujuan: Cukup dari ketiga rater".

### 11 · 7 masukan perbaikan (14 dtk)
- Checklist vertikal; tiap poin ± 1,6 dtk: kotak tergambar → centang tergambar →
  teks slide-in. Poin lama meredup sedikit saat poin baru masuk.
- Label pendek (≤ 7 kata) dari data.json. Tema di laporan: bahasa data yang
  lebih membumi, validasi bersama BPBD, rute evakuasi alternatif, prioritas laporan,
  jalur info non-digital, dukungan kelompok rentan, keseimbangan V & C.

### 12 · Roadmap 5 tahap (10 dtk)
- Stepper vertikal: **Edukasi → Evaluasi → Prototipe Digital → Pengembangan → Implementasi**.
- Garis progres mengisi dari atas; tiap node menyala + 1 baris output tahap.
- Penanda "posisi saat ini" hanya jika data.json menyebutkannya.

### 13 · Penutup (6 dtk)
- Logo kembali (match dari scene 1), tagline diringkas dari penutup buku panduan:
  "Kenali risiko, bersiap, bertindak, dan saling membantu."
- Baris keselamatan (diringkas dari buku panduan): "Dalam keadaan darurat, keselamatan
  jiwa dan arahan resmi tetap prioritas."

---

## Narasi / VO — keputusan

**Render pertama: tanpa VO.** Narasi dibawa oleh teks kinetik di layar + sound design
ringan (tick/whoosh halus yang saya sintesis sendiri → bebas lisensi). Timing scene
disisakan ruang untuk VO.

Alasan:
1. Environment cloud ini tidak bisa mengakses layanan TTS neural (Edge/Azure TTS,
   ElevenLabs, OpenAI diblokir jaringan; Hugging Face juga diblokir sehingga model TTS
   lokal tidak bisa diunduh). TTS offline yang tersedia (eSpeak) lebih robotik dari
   versi pertama — itu kemunduran.
2. Video vertikal infografis mayoritas ditonton tanpa suara, jadi teks di layar tetap
   wajib walaupun nanti ada VO.
3. Saya sertakan naskah VO bertimecode per scene supaya bisa direkam suara asli,
   lalu saya sinkronkan.

Opsi upgrade: **Google Cloud Text-to-Speech (id-ID)** bisa dijangkau dari environment ini.
Kalau kamu menambahkan API key-nya sebagai secret environment, saya bisa generate VO
yang jauh lebih natural lalu menyesuaikan durasi scene ke VO.

---

## Pendekatan teknis (sudah diuji)

- Tiap scene = HTML/CSS/SVG + JS. Semua gerak adalah fungsi murni dari waktu `seek(t)`
  (tanpa bergantung pada CSS animation/requestAnimationFrame), jadi setiap frame
  deterministik dan tidak ada frame drop.
- Easing: solver cubic-bezier sendiri (kurva sama persis dengan definisi CSS).
- Render: Playwright-core + Chromium headless, screenshot per frame →
  pipe ke ffmpeg → `libx264`, CRF 18, `yuv420p`, `+faststart`.
- Uji 4 detik (`spike/`): 120 frame dalam ± 15 dtk. Video ± 128 dtk (3.840 frame)
  diperkirakan ± 8 menit render.
- Font dari npm `@fontsource` (tidak butuh Google Fonts CDN saat render).
- Tanpa Remotion, tanpa library animasi pihak ketiga.

---

## Catatan gaya dari lumenkreatif.com — BELUM BISA DILAKUKAN

`lumenkreatif.com` ditolak oleh kebijakan jaringan environment cloud ini (HTTP 403 dari
egress proxy). Yang bisa saya pastikan hanya dari hasil pencarian: Lumen Kreatif adalah
agensi digital marketing (influencer marketing, personal branding, social media management
untuk Instagram/TikTok). Saya **tidak** menulis catatan easing/tipografi/ritme "dari
referensi" karena itu akan jadi tebakan.

Keputusan gaya yang bergantung pada referensi (kurva easing, kecepatan counter,
pola stagger, tipografi, ritme antar-scene, elemen dekoratif) dikunci **setelah** riset.
Struktur scene & pemetaan data→chart di atas tidak bergantung pada itu.
