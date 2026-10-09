# Permintaan aset

Pembagian kerja dengan user: **user** mencari foto pembicara, aset dari Google, dan menjalankan prompt di GPT image; **skill** menyiapkan daftar aset yang jelas dan prompt yang bisa langsung dicopas. Jangan membuat aset sendiri secara diam-diam dan jangan pakai foto orang yang belum dikonfirmasi.

## Format daftar aset (taruh di akhir design plan)

```
ASET DIBUTUHKAN — C05 · 5 Tanda Butuh Reset
| # | Slide | Aset | Sumber | Spesifikasi | Status |
|---|-------|------|--------|-------------|--------|
| 1 | 1 | Logo Shape putih | User kirim | PNG transparan, ≥600px lebar, simpan di assets/logo-shape.png | Belum ada |
| 2 | 3 | Foto speaker X | User cari | Cutout PNG, setengah badan, latar bersih | Menunggu |
| 3 | 1 | Ilustrasi megaphone | Prompt GPT | lihat prompt A | Siap dicopas |
```

Aset yang tidak diperlukan jangan diminta. Banyak carousel Base Blue cukup dari tipografi + ikon bawaan.

## Aset yang selalu perlu dari user

- Logo Shape Indonesia putih (PNG transparan). Sampai ada, template memakai wordmark teks sementara. **Logo Eventime tidak dipakai di v1** (keputusan user).
- Foto pembicara (cutout atau headshot yang akan di-cutout) untuk carousel speaker.
- Logo Founding Circle Partners (Fit4Go, PPYNI, Bisa Gerak, Lux Entertainment, Dreya) untuk recap/spotlight.
- Foto dokumentasi asli untuk recap dan closing (kolase momen). Tidak boleh stock.

## Menulis prompt untuk GPT image

Prompt harus bisa dicopas tanpa konteks, jadi satukan semua yang menentukan hasil: subjek, gaya, palet, sudut, latar, rasio, dan larangan. Tulis dalam bahasa Inggris (hasil model gambar lebih stabil), dengan catatan pemakaian dalam bahasa Indonesia di luar blok prompt.

Template:

```
[Subjek + aksi], [gaya: clean 3D render / flat vector / realistic photo],
color palette: deep navy #0B233D, mid blue #417697, white accents[, pillar accent color],
[sudut & komposisi], isolated on transparent background (or plain navy gradient),
soft studio lighting, no text, no logos, no watermark, [rasio: 4:5 / 1:1 / 16:9]
```

Contoh siap pakai:

**A. Megaphone untuk cover speaker (C03)**
```
A white megaphone held by a human hand, bright yellow accent on the handle, clean realistic 3D render, 3/4 angle pointing to upper left, soft studio lighting, isolated on transparent background, no text, no logos, 4:5
```
Pakai: PNG transparan di kanan-bawah cover, motion float.

**B. Peralatan recovery generik untuk teaser Longevity (C10)**
```
Minimal flat-lay of recovery tools (foam roller, massage ball, resistance band), clean realistic photo, top-down, deep navy #0B233D background with subtle blue gradient to #417697, soft shadow, no text, no brand marks, 4:5
```

**C. Bahan skincare/lab generik untuk teaser Aesthetics (C13)**
```
Generic skincare ingredients and glass dropper bottles without labels on a clean lab bench, soft pastel highlights, realistic photo, shallow depth of field, navy-blue tinted background, no text, no brand marks, 4:5
```

**D. Ikon/ilustrasi pendukung (jam, tidur, jalan kaki)**
```
Simple flat vector icon set: [daftar objek], thick rounded white outlines, solid fill accent #4B7B98, transparent background, consistent stroke width, no text
```

## Aturan aset

- **Hewan candid asli** hanya untuk konten relatable B2C (Template B), dan itu terutama Reels. Prompt GPT **tidak boleh** dipakai untuk menghasilkan foto hewan "candid": plan mewajibkan footage asli. Kalau carousel B2C butuh foto hewan, minta user mencari/foto sendiri.
- Foto orang nyata (pembicara, tim) selalu dari user.
- Tidak ada aset yang mengandung merek pihak ketiga, logo palsu, atau teks yang dihasilkan AI. Teks selalu dipasang oleh template.
- Rasio 4:5 untuk aset yang mengisi frame penuh; transparan PNG untuk cutout.
- Simpan aset di folder kerja carousel (`out/<kode>/assets/`) dan rujuk lewat path relatif di `deck.json` (`photo`, atau ganti `asset` placeholder dengan elemen gambar).
