# Panduan: SKD Video Studio di disk D: dan jalan menuju agent kantor virtual

Tujuan akhir: studio video motion graphic berbasis agent AI dengan tiga jalur (founder, lini bisnis internal, klien eksternal) yang bisa dipanggil dari kantor virtual PT SKD.

Panduan ini dibagi dua. **Bagian A** selesai dalam sekitar 30 menit dan hasilnya skill berjalan di D:. **Bagian B** adalah rancangan studio agent, dikerjakan bertahap setelah Bagian A lolos tes.

---

## Bagian A: clone skill ke D:

### A0. Yang perlu kamu tahu dulu
- Skill-nya (`motion-infografis`) hidup di repo GitHub `aljihadjundy-oss/jundy-aljihad`, branch `claude/compassionate-bardeen-4wo5cn`. Branch ini belum digabung ke branch lain, jadi **harus menyebut nama branch saat clone**.
- File `motion-infografis.skill` yang ada di repo adalah versi lama (29 September). Versi terbaru (mode `entry`, audio kustom, dan render.mjs yang baru) hanya ada di repo. Pakai clone, jangan pakai file `.skill`.
- Repo itu juga berisi website Next.js. Kamu tidak butuh itu, jadi kita clone sebagian saja (sparse checkout).
- Folder `assets/`, `out/`, dan `*.mp4` sengaja tidak masuk git (logo, ikon, footage, hasil render). Itu harus dipindah manual (lihat A5).
- Rendering memakai CPU. Video 60 detik 1080p butuh sekitar 6 menit. Jangan jalankan banyak render bersamaan.

### A1. Pasang prasyarat (sekali saja)
Buka PowerShell dan jalankan satu per satu. Lewati yang sudah terpasang.

```powershell
winget install Git.Git
winget install OpenJS.NodeJS.LTS
winget install Python.Python.3.12
winget install Gyan.FFmpeg
winget install Google.Chrome
npm install -g @anthropic-ai/claude-code
```
Lalu **tutup dan buka lagi PowerShell** supaya perintah baru dikenali. Cek:
```powershell
git --version; node --version; python --version; ffmpeg -version | Select-Object -First 1
```
Node harus 18 atau lebih baru. ffmpeg harus muncul tanpa error.

### A2. Jalankan script setup
Script `setup-d-drive.ps1` melakukan semuanya: clone ke `D:\SKD-Video-Studio`, pasang playwright dan font di `D:` (bukan di C:), pasang numpy/scipy/pillow, lalu membuat struktur folder kerja.

Karena repo belum ada di D:, ambil script-nya dulu. Cara paling mudah: buka halaman repo di browser, buka file `video-studio/setup-d-drive.ps1` (branch `claude/compassionate-bardeen-4wo5cn`), klik **Raw**, simpan ke `D:\setup-d-drive.ps1`. Lalu:

```powershell
powershell -ExecutionPolicy Bypass -File D:\setup-d-drive.ps1
```
Saat clone, Windows akan meminta login GitHub (repo ini privat). Login dengan akun `aljihadjundy-oss`.

Kalau mau manual, isi script-nya setara dengan:
```powershell
git clone --filter=blob:none --no-checkout --branch claude/compassionate-bardeen-4wo5cn https://github.com/aljihadjundy-oss/jundy-aljihad.git D:\SKD-Video-Studio
cd D:\SKD-Video-Studio
git sparse-checkout init --cone
git sparse-checkout set .claude/skills/motion-infografis shape-teaser shape-teaser-v2 shape-motion siaga-sumatra-motion motion video-studio
git checkout
```

### A3. Tes cepat
```powershell
cd D:\SKD-Video-Studio
node .claude\skills\motion-infografis\scripts\render.mjs shape-teaser --stills 5,25
```
Berhasil kalau muncul `shape-teaser\out\stills\t0005.00.png` dan `t0025.00.png`. Buka keduanya. Tanpa aset, bagian footage dan logo akan berupa placeholder, itu normal.

Kalau gagal:
| Pesan | Penyebab dan solusi |
|---|---|
| `No Chrome/Chromium found` | Pasang Google Chrome, atau `setx CHROME_PATH "C:\Program Files\Google\Chrome\Application\chrome.exe"` |
| `playwright-core not found` | `MOTION_CACHE` belum terbaca. Tutup dan buka PowerShell, atau jalankan ulang `setup.sh` lewat Git Bash |
| `ffmpeg failed` | ffmpeg belum ada di PATH. Buka PowerShell baru |
| `python3` tidak dikenali | Di Windows gunakan `python`, bukan `python3` |
| Folder `assets` hanya berupa file teks di `shape-teaser-v2` | Git Windows tidak membuat symlink. Hapus file itu, lalu `mklink /J shape-teaser-v2\assets shape-teaser\assets` (di cmd) |

### A4. Buka Claude Code di folder itu
```powershell
cd D:\SKD-Video-Studio
claude
```
Claude Code otomatis menemukan skill di `.claude\skills\motion-infografis`. Tes dengan: "pakai skill motion-infografis, buatkan project kosong 16:9 di projects\internal\tes".

### A5. Pindahkan aset yang tidak ikut git
Salin manual ke D:. Folder Drive yang sudah ada:
- Ikon enam tema, footage 17 klip, dan foto venue: dari folder Google Drive yang kamu kirim sebelumnya.
- Logo SHAPE: `shape-teaser\assets\logo.png`.

Susunan yang disarankan:
```
D:\SKD-Video-Studio\
  .claude\skills\motion-infografis\     mesin render (skill)
  video-studio\                         panduan ini, jobs, lanes
  brand-kits\                           jundy, shape, sinatif-agency, osiris-event, hexolution, sinatif-academy, client-<nama>
  projects\founder | internal | client\
  queue\inbox | running | done | failed
  shape-teaser\assets\                  logo.png, icons\, footage\, stills\   (isi dari Drive)
  .cache\                               playwright dan font
```

**Gerbang lulus Bagian A:** (1) stills tampil, (2) satu render penuh `shape-teaser` selesai tanpa error dalam kira-kira 6 menit, (3) MP4-nya terbuka di pemutar.

---

## Bagian B: rancangan studio agent

### B1. Prinsip
1. **Satu mesin, tiga jalur.** Mesin render sama (skill `motion-infografis`). Yang berbeda per jalur: suara/brand, bahan wajib, gerbang persetujuan, dan aturan keras. Isi masing-masing ada di `lanes/founder.md`, `lanes/internal.md`, `lanes/client.md`.
2. **Gerbang persetujuan manusia.** Storyboard, still, dan final selalu berhenti menunggu orang yang tertulis di job. Render penuh mahal, jadi tidak boleh jalan sebelum storyboard disetujui.
3. **Tanpa angka karangan.** Setiap angka di layar harus punya sumber di job. Target diberi label TARGET.
4. **Deterministik.** Setiap frame adalah fungsi waktu, jadi hasil bisa dirender ulang persis sama dan bisa dikoreksi per scene.
5. **Agent tidak memposting apa pun ke luar.** Output berhenti di `queue/done`. Orang yang mengunggah.

### B2. Susunan agent
| Agent | Tugas | Masukan | Keluaran |
|---|---|---|---|
| **Dispatcher** | Membaca job, memilih jalur, memeriksa kelengkapan, memberi nomor revisi | `job.json` | Job tervalidasi, atau pertanyaan balik |
| **Scriptwriter** | Menulis naskah dan VO (EN + ID, bertimecode). Di jalur founder memakai skill `jundy-content-writer` dan `jundy-persona` | Brief, sumber | `script.md`, `vo_script.md` |
| **Storyboarder** | Menyusun storyboard beat demi beat dan memetakan referensi | Naskah, brand kit | `storyboard.md` (menunggu gerbang 1) |
| **Motion Builder** | Menulis scene dan `project.json` lewat skill `motion-infografis`, merender still | Storyboard yang disetujui | Scene, still, contact sheet (gerbang 2) |
| **Sound Designer** | Sintesis suara: pad mayor, lonceng, udara halus, tanpa dentuman | Storyboard, `sound` di job | `audio.py`, `mix.wav` |
| **Footage Librarian** | Daftar footage (jumlah, konteks, detik, kata kunci), mengolah klip jadi frame | Storyboard | `FOOTAGE_LIST.md`, frame |
| **QC** | `ffprobe`, loudness, loop, contact sheet, cek teks keluar zona, cek dokumen rahasia | Render | Laporan lulus atau gagal beserta alasannya |
| **Delivery** | Salinan ukuran kirim (≤ 28 MB), penamaan, paket, catatan revisi | Render yang lulus QC | Paket di `queue/done` |

Di tahap awal, semua agent ini bisa berupa **satu sesi Claude Code dengan peran berbeda** (subagent atau skill terpisah), belum perlu proses terpisah.

### B3. Kontrak job
Setiap permintaan dari kantor virtual berupa satu file JSON (skema: `jobs/job.schema.json`, contoh tiga jalur: `jobs/example-*.json`). Isinya: jalur, brand, tujuan satu kalimat, format, bahan, batasan, dan **siapa yang menyetujui tiap gerbang**.

Aliran folder:
```
queue/inbox/<id>.json  ->  queue/running/<id>/  ->  queue/done/<id>/   (atau queue/failed/<id>/ + alasan)
```
Setiap folder `done` berisi: `final.mp4`, `final_share.mp4`, `storyboard.md`, `VO_SCRIPT.md`, `FOOTAGE_LIST.md`, `qc.md`, dan `job.json`.

Antrian satu per satu (maksimal 1–2 render bersamaan) karena render memakai CPU.

### B4. Brand kit
Satu folder per merek di `brand-kits\<nama>\` berisi `brand.json` (warna, font, aturan logo, area aman, palet suara), `logo.png`, dan ikon. Token awal bisa dipanen dari skill carousel yang sudah ada (Hexolution, Osiris Event, Sinatif Academy, Sinatif Agency) dan dari `shape-teaser\src\brand.js`. Semua teks, tanggal, dan lokasi dibaca dari satu file sumber, bukan ditulis di scene.

### B5. Cara menyambung ke kantor virtual
Pilih satu, urut dari paling mudah:
1. **Antrian folder.** Kantor virtual cukup menaruh `job.json` ke `queue/inbox` dan membaca hasil dari `queue/done`. Bekerja dengan platform apa pun yang bisa menulis file atau memanggil perintah.
2. **Perintah shell.** Satu perintah `node video-studio/studio.mjs run <job.json>` yang dipanggil agent (belum ada, dibuat di Fase 2).
3. **Server MCP.** Membungkus perintah di atas sebagai tool (`submit_job`, `get_status`, `approve_gate`, `list_outputs`) supaya agent di kantor virtual memanggilnya langsung. Dibuat di Fase 3 setelah kita tahu platform kantor virtualnya.

### B6. Fase
| Fase | Isi | Selesai kalau |
|---|---|---|
| **0** (hari ini) | Bagian A | Satu render penuh berhasil di D: |
| **1** | Brand kit enam merek, `lanes/*.md` dijadikan brief agent, template scene yang sering dipakai dipisah (lower-third, count-up, roadmap, jaringan, isometrik, globe) | Satu video per jalur, dibuat dari brand kit, lolos QC |
| **2** | `studio.mjs`: validasi job, antrian, gerbang persetujuan, QC otomatis, paket keluaran | 3 job contoh jalan dari `inbox` sampai `done` tanpa campur tangan |
| **3** | Wrapper (MCP atau webhook) ke kantor virtual, notifikasi gerbang persetujuan | Agent di kantor virtual memesan video dan mendapat hasilnya |
| **4** | Pelajaran dan metrik: waktu per video, jumlah revisi, penyebab QC gagal | Tiap bulan ada daftar perbaikan |

### B7. Risiko yang sudah kelihatan
- **Render lambat.** 6 menit untuk 60 detik. Cukup untuk puluhan video per hari bila diantrekan, tapi bukan real time.
- **Fakta saling bertentangan di dokumen klien** (tanggal, luas hall). Agent tidak boleh memilih sendiri, harus bertanya.
- **Footage dan musik berlisensi.** Footage stok dicatat sumbernya. Foto dengan orang atau simbol negara dicek dulu.
- **Aset besar tidak ada di git.** Footage dan hasil render hidup di disk D:. Perlu cadangan terpisah (Drive atau disk lain).
- **Windows.** Script ini belum diuji di mesinmu. Jalankan Bagian A dulu dan kirim pesan error apa adanya.

### B8. Pertanyaan yang menentukan Fase 3
1. Kantor virtual PT SKD itu platform apa (buatan sendiri, Gather, platform agent tertentu)? Apakah agent di sana bisa menjalankan perintah shell atau memanggil MCP/webhook?
2. Mesin render itu berjalan di komputermu sendiri (D:) atau di server yang menyala terus?
3. Siapa penyetuju tiap lini bisnis untuk gerbang storyboard dan final?
4. Untuk jalur klien, siapa yang boleh mengirim hasil ke klien: Account Manager, atau Jundy?
