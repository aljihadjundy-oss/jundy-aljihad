# Pattern library slide

Setiap slide di `deck.json` memilih satu `pattern`. Pola menentukan layout dan motion default, jadi tugasmu memilih pola yang cocok dengan **peran slide**, bukan mendesain dari nol. Semua pola sudah diimplementasi di `assets/preview-template.html`.

## Memilih pola berdasarkan peran

| Peran slide | Pola | Kapan |
|---|---|---|
| Hook / cover | `cover` | Slide 1 hampir selalu. Headline besar + kicker + ikon + ghost word |
| Klaim / fakta / definisi | `claim` | Satu ide di glass card, label pill ("Klaim:", "Fakta:") + kotak teks biru |
| Daftar tanda / kebiasaan | `list` | 3-5 butir singkat, satu baris tiap butir (menggantikan 5 slide terpisah) |
| Satu poin penting, besar | `numbered` | Tanda #1, Langkah 2. Numeral besar samar di belakang |
| Perbandingan | `compare` | Niat vs realita, mitos vs fakta, 15 menit vs 1 jam |
| Tren / ilustrasi arah | `bars` | Batang animasi. **Ilustratif**, bukan data; jangan beri angka klaim |
| Satu angka bukti | `stat` | Hanya proof titik yang ada di tabel fakta (mis. 200+). Angka menghitung naik |
| Gaya pencarian | `search` | Pertanyaan diketik di search bar, jawaban muncul di kotak. Cocok untuk "Natural = lebih sehat?" |
| Pengumuman sesi webinar | `session` | Slide paling penting B2B. Opsi `bigLogo` |
| Kutipan | `quote` | Recap: kutipan singkat non-data dari pembicara |
| Logo partner | `logos` | Founding Circle spotlight/recap. Kotak logo placeholder sampai file logo ada |
| Spotlight satu partner | `partner` | Logo besar di tengah + nama + 1 kalimat bidang (hanya PPTX; belum ada di preview HTML) |
| Rangkaian waktu | `timeline` | Closing: mini timeline sesi 1-7 |
| Pembicara | `speaker` | **Hanya gaya playful.** Foto cutout + tag kategori + nama + jabatan + quote + sticker tanggal |
| Penutup + CTA | `cta` | Slide terakhir. Tidak ada panah next di slide ini |

## Field per pola

Teks mendukung markup: `{{kata}}` = highlight biru, `[[kata]]` = aksen merah (maks 1x per carousel), `\n` = baris baru.
Semua pola menerima `notes: {visual, element, motion, asset}` yang tampil di panel catatan preview dan jadi isi design plan.

| Pola | Field |
|---|---|
| `cover` | `kicker`, `title`, `sub`, `icon`, `ghost`, `asset`, `assetH` |
| `claim` | `label`, `body`, `size`, `asset`, `assetH` |
| `numbered` | `num`, `label`, `title`, `body`, `asset` |
| `compare` | `title`, `left{label,title,body}`, `right{label,title,body,red}`, `foot` |
| `bars` | `title`, `items[{label,value 0-100,text,red}]`, `caption` |
| `stat` | `kicker`, `number`, `suffix`, `label`, `body` |
| `list` | `title`, `items[]` (maks 5) |
| `search` | `query`, `body`, `asset` |
| `session` | `kicker`, `title`, `sub`, `date`, `bigLogo` |
| `quote` | `quote`, `who`, `role` |
| `logos` | `title`, `logos[]` (nama), `note` |
| `timeline` | `title`, `steps[{when,what}]` |
| `partner` | `kicker`, `name`, `logoName`, `desc`, `asset` |
| `speaker` | `pillar`, `icon`, `cat`, `name`, `role`, `quote`, `date`, `align` (`right`/`left` = sisi teks), `photo` (path PNG cutout) |
| `cta` | `icon`, `title`, `sub`, `handle`, `asset` |

`asset` menampilkan kotak placeholder bertuliskan aset yang dibutuhkan, jadi design plan terlihat di preview sebelum aset ada. Ganti dengan `<img>` setelah user mengirim file (lihat `asset-requests.md`).

Ikon bawaan: brain, dumbbell, bowl, heart, leaf, spark, clock, calendar, search, check, pulse, moon, drop, link, arrow.

## Resep alur per tipe konten

Pakai sebagai titik awal, sesuaikan dengan brief di kalender.

**Edukasi mitos vs fakta** (C02, C14): `cover` (pertanyaan, mis. "Detox: mitos atau fakta?") → `claim` (label "Klaim:") → `claim` (label "Fakta:", kata kunci `{{ }}`, merah 1x di istilah sains) → `cta` simpan.
Referensi: konten 4.

**Edukasi tips/tanda** (C01, C05, C09, C11, C15): `cover` (angka + janji) → `list` atau `numbered` ×2-3 → `cta` simpan. Satu ide per slide; kalau lebih dari 3 butir, gabung di `list`.

**Perbandingan** (C07 "15 menit vs 1 jam"): `cover` → `compare` → `bars` opsional (ilustratif) → `cta`.

**Teaser sesi B2B** (C06, C10, C13): `cover` (frasa peluang bisnis) → `claim`/`bars` konteks → `session` (bigLogo) → `cta` ("Cek LinkedIn Events di bio" + "200+ profesional terpilih"). Versi formal: tanpa emoji besar, tanpa meme.

**Launch/speaker** (C03, Expert Playful): `cover` (+megaphone) → `speaker` ×3 → `cta`/info sesi. Sticker tanggal merah di salah satu `speaker`, itu jatah merah carousel ini.

**Recap** (C04, C12): `cover` ("Sesi Kickoff Selesai") → `quote` ×1-2 → `logos` (Founding Circle) → ucapan terima kasih di `cta`.

**Partner spotlight** (C08, C17): `cover` → `logos` (1 besar atau grid 5) → `quote` alasan gabung → `cta` follow partner.

**Closing** (C16): `cover` → `timeline` (sesi 1-7) → `session` (Expo 2027, 8-10 Oktober, NICE PIK 2, tanggal di aksen merah) → `cta` early-bird via DM/link bio. Boleh 5 slide.

## Layout & keterbacaan

- Teks body minimal ±34px di kanvas 1080 supaya kebaca di HP. Judul 76-104px.
- Maksimal 2-3 baris per kotak teks, 5 baris `list`. Lebih dari itu pecah slide.
- Slide harus bisa di-screenshot dan berdiri sendiri: kalau slide 3 baru masuk akal setelah slide 2, tambahkan penanda konteks (label pill) di dalamnya.
- Area aman: 80px kiri-kanan, logo 56-150px dari atas, panah next 64px dari kanan-bawah. Jangan taruh teks di sana.
