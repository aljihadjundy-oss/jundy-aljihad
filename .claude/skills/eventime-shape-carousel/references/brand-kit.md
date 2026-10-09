# Brand kit — Shape Executive Forum carousel

Dua sumber digabung: (1) brand kit di content plan (warna hasil color-pick aset asli), (2) DNA visual dari 4 konten referensi Shape. Kalau bentrok, **kit plan menang di Base Blue; referensi menang di Expert Playful.**

## Dua gaya, satu sistem

| Gaya | Dipakai untuk | Ciri |
|---|---|---|
| **Base Blue** (default, = Template A) | Semua carousel edukasi, teaser sesi B2B, recap, spotlight partner, closing | Gradient biru + grid blueprint, highlight box, glass card, kotak teks biru. Tenang, rapi |
| **Expert Playful** | Hanya carousel speaker/event (mis. C03 Launch Expert Network) | Base Blue + sticker miring, tape, ikon bulat berwarna per pilar, scribble underline, sticker tanggal merah |

Alasan dipisah: edukasi harus gampang dibaca sambil swipe cepat, sementara carousel speaker tugasnya bikin orang penasaran dan FOMO, jadi boleh lebih ramai. Jangan campur: satu carousel = satu gaya.

## Design tokens

```
--navy-900:   #0B233D   gradient gelap (pojok kiri atas)
--blue-500:   #417697   gradient terang (pojok kanan bawah)
--hl:         #4B7B98   highlight box / kotak teks
--red:        #AB2224   aksen, MAKSIMAL 1x per carousel
--white:      #FFFFFF   teks utama
--grid:       rgba(173,216,255,.12)   garis grid blueprint (10-15%)
--glass-fill: rgba(255,255,255,.08)   kartu kaca
--glass-line: rgba(255,255,255,.55)   border kartu kaca
```

Background: file `assets/bg-grid.jpg` (rekonstruksi dari contoh template user): gradient horizontal #0B233D → #467FA3 dengan glow biru di bagian bawah, plus **grid miring -4.5°** (sel ±72×70 px, garis putih ±6-12% opacity yang memudar ke bawah). Grid sengaja miring, bukan lurus. Regenerasi dengan `scripts/make_background.py`.

### Warna pilar (hanya Expert Playful dan ikon pilar)

| Pilar | Warna | Hex |
|---|---|---|
| Mind (Mind Power) | ungu | `#8B6CF0` |
| Fitness | lime | `#C8F03C` |
| Nutrition | kuning-oranye | `#FFD23F` |
| Health | tosca | `#37D3C2` |
| Longevity & Biohacking | biru es | `#7CC7FF` |
| Aesthetics | pink lembut | `#FF9EC4` |

Tiga pilar pertama diambil dari referensi (sudah dipakai di konten Shape). Tiga lainnya saran, belum ada di referensi. Tandai ke user kalau dipakai pertama kali.

Teks di atas lime/kuning pakai navy `#0B233D`, bukan putih (kontras).

## Tipografi

- **Headline:** Poppins ExtraBold 800 (alternatif: Baloo 2 / Nunito Black), 60-80pt di kanvas 1080 → ±84-104px.
- **Subhead/label:** Poppins Bold 700, 32-40pt.
- **Body:** Poppins Regular/Medium, 24-28pt → minimal 34px di kanvas 1080 supaya kebaca di HP.
- Expert Playful: nama pembicara bold navy di tag putih, jabatan di tag biru muda; quote italic putih.
- Maksimal **2-3 baris per highlight box**. Lebih dari itu pecah jadi slide baru.

## Hirarki teks (dari plan)

| Level | Fungsi | Gaya |
|---|---|---|
| H1 | Hook utama, stop-scroll | Bold besar, di highlight box #4B7B98 atau putih polos |
| H2 / label | Penjelas / kategori ("Klaim:", "Fakta:", "Tanda #1") | Bold, pill putih teks navy atau highlight box kecil |
| Body | Isi | Regular, putih polos tanpa box |
| Accent | 1 istilah kunci | Box merah #AB2224. **Max 1x per carousel** |
| CTA | Ajakan aksi | Bold + ikon panah/lingkaran putih. Selalu di slide terakhir |

## Elemen tetap di semua slide

1. **Grid blueprint** full background.
2. **Logo Shape Indonesia** di tengah atas, 201×70 px di (442, 89), warna biru muda #D0E0E7 dengan tagline putih. File: `assets/logo-shape.png` (PNG transparan dari user). Hanya logo Shape, belum pakai logo Eventime (keputusan user).
3. **Tiga titik dekoratif** kiri atas: bulatan 31 px, #67A1C4, di x=46/92/139, y=77. Bukan pagination.
4. **Panah next**: cincin putih 118 px (garis 5 px) berpusat di (912, 1182), panah putih di dalamnya. Ada di semua slide kecuali terakhir (cue swipe yang logis).
5. Tidak ada dots pagination di bawah (tidak ada di contoh template; IG punya sendiri).
6. Slide pertama B2C: tag sticker "Tandai teman..." (opsional, kiri bawah).

## Elemen khas Expert Playful

- Ikon bulat berwarna per pilar + garis percik kecil di sampingnya.
- Tag kategori miring (-3°) warna pilar, teks navy ExtraBold, efek stabilo.
- Tag nama putih + tag jabatan biru muda, ditumpuk, miring tipis.
- Quote italic + scribble underline warna lime.
- Foto pembicara cutout besar (45-60% frame), fade gelap di bagian bawah.
- Sticker tanggal merah-pink miring (`27 SEPT` style) = pemakaian merah 1x di carousel itu.
- Footer: ikon kalender + "Shape Expert Network / Real Conversations for a Healthier, Happier You." + pill CTA lime.

## Ukuran

- Feed carousel: **1080 × 1350 (4:5)**. Aman: sisakan 64px dari tepi, logo tetap di 40-120px dari atas.
- Semua slide dalam satu carousel harus berukuran sama.

## Larangan visual

- Jangan pakai foto stock "terlalu sempurna" untuk konten relatable. Template B (foto hewan asli candid) hanya untuk B2C relatable, dan itu lebih banyak dipakai di Reels. Di carousel jarang.
- Jangan pakai kucing/meme di carousel B2B (plan eksplisit: "bukan kucing", "kurangi elemen meme").
- Jangan taruh lebih dari 1 aksen merah, jangan pakai merah buat dekorasi.
- Jangan campur dua gaya dalam satu carousel.
