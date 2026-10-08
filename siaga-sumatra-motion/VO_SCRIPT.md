# Naskah VO — SIAGA SUMATRA (motion graphics v1)

Video v1 dirender **tanpa VO**. Semua info sudah ada sebagai teks di layar, ditambah pad ambient dan efek suara hasil sintesis.
Naskah ini disiapkan untuk rekaman suara asli (atau TTS nanti). Timecode mengikuti `out/meta.json`.
Kecepatan baca yang diasumsikan sekitar 2,3 kata/detik (santai, jelas).

Sumber kalimat: `narrasi_referensi.md` (direvisi) + `data.json`. Tidak ada angka di luar `data.json`.

| # | Timecode | Scene | Naskah VO |
|---|----------|-------|-----------|
| 01 | 0:00.0 – 0:06.0 | Pembuka | SIAGA SUMATRA. Sistem Informasi dan Aksi Siaga Bencana Sumatra. |
| 02a | 0:05.5 – 0:15.5 | Kenapa dibutuhkan | Banjir, banjir bandang, dan tanah longsor mengancam warga Kabupaten Agam. Data BNPB akhir 2025 adalah angka gabungan tiga provinsi, bukan khusus Agam. |
| 02b | 0:15.0 – 0:25.0 | Fokus wilayah | Karena itu fokusnya dipersempit, dari tiga provinsi ke satu kabupaten. Agam punya tiga belas pos lapangan aktif, dan topografinya mewakili dataran rendah hingga pegunungan. |
| 03 | 0:24.5 – 0:33.0 | Mengenal aplikasi | SIAGA SUMATRA menghubungkan informasi resmi dengan warga, lewat delapan fitur utama. |
| 04 | 0:32.5 – 0:42.5 | Peta Risiko | Peta Risiko menunjukkan wilayah rawan di sekitar Anda, dengan tiga status: bahaya, waspada, dan relatif aman. |
| 05 | 0:42.0 – 0:55.0 | Detail Zona Risiko | Besar kecilnya risiko ditentukan empat unsur: bahaya, keterpaparan, kerentanan, dan kapasitas. Makin besar kapasitas kita, makin kecil risikonya. |
| 06 | 0:54.5 – 1:01.0 | Deteksi Dini | Deteksi Dini membantu warga mengenali tanda bahaya lebih awal. |
| 07 | 1:00.5 – 1:07.0 | Jalur Evakuasi | Jalur Evakuasi menunjukkan rute menuju titik aman terdekat. |
| 08 | 1:06.5 – 1:13.0 | Mode Siaga | Mode Siaga membantu menyiapkan kebutuhan dasar sebelum bencana datang. |
| 09 | 1:12.5 – 1:20.0 | Edukasi & Tips Cepat | Edukasi Kebencanaan dan Tips Cepat memberi panduan singkat yang mudah dipahami. |
| 10 | 1:19.5 – 1:28.0 | Pusat Bantuan & Lapor | Pusat Bantuan menghubungkan warga dengan nomor darurat dan posko terdekat. Lapor Bencana memudahkan warga melaporkan kondisi di lapangan. |
| 11 | 1:27.5 – 1:40.5 | Hasil evaluasi | Rancangan ini dinilai tiga rater: akademisi, praktisi BPBD Agam, dan perwakilan masyarakat. Tidak ada penilaian Tidak Baik, tapi kesesuaian dengan tujuan baru dinilai Cukup oleh ketiganya. |
| 12 | 1:40.0 – 1:55.0 | 7 area perbaikan | Dari evaluasi itu muncul tujuh area perbaikan: bahasa data yang lebih membumi, validasi bersama BPBD, jalur evakuasi alternatif, prioritas laporan, jalur informasi non-digital, pendampingan kelompok rentan, dan keseimbangan materi kerentanan dan kapasitas. |
| 13a | 1:54.5 – 2:03.5 | Peran bersama | Keberhasilannya butuh kerja sama warga dan pemerintah Agam. Kenali, waspada, siapkan, evakuasi, bantu, dan hubungi. |
| 13b | 2:03.0 – 2:12.0 | Roadmap | Tahap edukasi dan evaluasi sudah selesai. Berikutnya prototipe digital, pengembangan, lalu implementasi. |
| 14 | 2:11.5 – 2:18.0 | Penutup | Tampilan ini masih prototipe. SIAGA SUMATRA: kenali risiko, siap menghadapi bencana. |

## Kalau VO direkam
- Rekam per baris (satu file per scene). Saya bisa menyesuaikan durasi scene ke panjang rekaman, karena semua timing ada di `src/scenes/*` (`dur`) dan hanya perlu render ulang.
- Saat VO masuk, pad ambient diturunkan (ducking) sekitar −8 dB, dan efek suara tetap dipakai.
