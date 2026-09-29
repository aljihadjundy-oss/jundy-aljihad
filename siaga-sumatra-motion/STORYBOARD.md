# SIAGA SUMATRA — Storyboard Motion Graphics (v1, sesuai render)

Format 1080×1920 (9:16) · 30 fps · H.264 + AAC · durasi **2:18 (138 detik)**.
Urutan scene mengikuti `scene_order_reference` di `data.json`. Semua angka dan label di layar diambil dari `data.json`,
sedangkan kalimat pendukung dari `narrasi_referensi.md`. Scene 02 dan 13 masing-masing dipecah jadi dua bagian.

| # | Waktu | Scene | Data (`data.json`) | Elemen bergerak |
|---|-------|-------|--------------------|-----------------|
| 01 | 0:00–0:06 | Judul & logo | — | Tile logo terbuka lewat mask lingkaran, judul kinetik per kata, 3 chip hazard stagger. Tile lalu "terbang" menjadi badge brand di pojok kiri atas. |
| 02a | 0:05–0:15 | Kenapa dibutuhkan | `disaster_context_note` | 3 foto masuk bergantian sebagai kartu miring dengan drift pelan. Tumpukan foto lalu mundur dan meredup, kartu konteks BNPB masuk (tanpa count-up, tanpa merah) lengkap dengan disclaimer dan sumber. |
| 02b | 0:15–0:25 | Fokus wilayah | `kancah_selection` | Peta Sumatra digambar garis demi garis, 3 provinsi terisi, lalu kamera zoom ke Kabupaten Agam (pulse ring). Chip "Sebelum → Sesudah" berganti, 3 alasan masuk dengan counter 13 pos. |
| 03 | 0:24–0:33 | Kenalan aplikasi | `app_features` | Kartu splash dan beranda naik. Counter 0→8 dan grid ikon 4×2 muncul dengan pop stagger. |
| 04 | 0:32–0:42 | Peta Risiko | `risk_status_levels`, `usage_flow[1]` | Kamera di dalam screenshot zoom ke legenda. 3 kartu status (Bahaya/Waspada/Relatif Aman) masuk dari kanan. |
| 05 | 0:42–0:55 | Detail Zona Risiko | `risk_framework` | Screenshot zona dan daftar 4 unsur. Nama unsur lalu "terbang" menjadi judul kartu 2×2, rumus risiko tersusun per suku dengan garis pecahan yang digambar. |
| 06 | 0:54–1:01 | Deteksi Dini | `usage_flow[2]` | Kamera menyusuri screenshot dengan highlight ring per bagian. |
| 07 | 1:00–1:07 | Jalur Evakuasi | `usage_flow[4]` | Rute dekoratif digambar dengan titik berjalan dari "Lokasi Anda" ke "Titik aman". Screenshot di-zoom dengan pulse di posisi pengguna dan tujuan. |
| 08 | 1:06–1:13 | Mode Siaga | `usage_flow[3]` | Centang digambar satu per satu di checkbox screenshot (aktif setelah file asli masuk). |
| 09 | 1:12–1:20 | Edukasi & Tips | `usage_flow[3]` | Dua kartu miring bergulir seperti feed. |
| 10 | 1:19–1:28 | Bantuan & Lapor | `usage_flow[5]`, `usage_flow[6]` | Screenshot bantuan dengan kamera + ring (nomor darurat, lalu posko), dan 2 blok teks dengan badge langkah. |
| 11 | 1:27–1:40 | Hasil evaluasi *(baru)* | `form_rater_scores` | Latar berganti ke terang lewat circle reveal. Grouped bar horizontal tumbuh dari 0 di skala ordinal Tidak Baik/Cukup/Baik, lalu 2 callout hasil hitung dari data. |
| 12 | 1:40–1:55 | 7 area perbaikan *(baru)* | `development_inputs_4_9` | Checklist: kotak dan centang digambar per item, item lama meredup, lalu semua terang lagi untuk dibaca ulang. |
| 13a | 1:54–2:03 | Peran bersama | `usage_flow` | Diagram alur vertikal 6 langkah dengan panah yang menggambar diri. |
| 13b | 2:03–2:12 | Roadmap | `development_roadmap` | Stepper 5 tahap. Garis progres mengisi tahap 1–2 (selesai), lalu penanda "Posisi saat ini" muncul. |
| 14 | 2:11–2:18 | Penutup | — | Logo kembali, tagline, dan kotak disclaimer "Prototipe — perlu validasi sebelum digunakan". |

Catatan adaptasi:
- `usage_flow` dan `development_roadmap` dibuat vertikal (bukan horizontal seperti di `chart_suggestion`) supaya detail tiap langkah terbaca di layar 9:16.
- Skor rater memakai `scale_to_number` (1–3) hanya untuk panjang bar. Label yang tampil tetap kata aslinya (Cukup/Baik).
- Tiap scene fitur diberi badge "Langkah n" dari `usage_flow` supaya fitur dan alur pemakaian terhubung.
