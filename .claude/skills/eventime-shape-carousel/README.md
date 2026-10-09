# eventime-shape-carousel (paket skill)

Skill pembuat carousel Instagram Eventime × Shape Indonesia: dari satu baris content plan jadi script, design plan, daftar aset, dan PPTX yang bisa diedit dengan animasi per slide. Mulai baca dari `SKILL.md`.

## Cara memasukkan ke agent AI

1. **Agent yang mendukung "skills" (Claude Code, Claude.ai/Cowork, SDK):** taruh folder `eventime-shape-carousel/` ini di folder skills agent (mis. `~/.claude/skills/` atau `.claude/skills/` di proyek). Di Claude.ai: unggah zip ini lewat Settings > Capabilities > Skills.
2. **Agent tanpa fitur skills (GPT/Gemini/agent buatan sendiri):** masukkan isi `SKILL.md` ke system prompt atau instruksi proyek, lalu sediakan folder ini sebagai file/direktori kerja agent (agent harus bisa membaca `references/` dan menjalankan `python3 scripts/...`). Ganti `<SKILL_DIR>` di dokumen dengan path folder ini.
3. **Agent tanpa eksekusi kode:** agent tetap bisa menulis script dan design plan (langkah 1-3, 5 di `SKILL.md`) dari `references/`, tapi file PPTX harus dibangun di tempat lain dengan `scripts/build_pptx.py`.

## Syarat untuk membangun PPTX

- Python 3.9+ dan `pip install -r requirements.txt`.
- Font Poppins terpasang di komputer yang membuka PPTX (`assets/fonts-ttf/`).

## Isi folder

| Path | Fungsi |
|---|---|
| `SKILL.md` | Alur kerja dan aturan (titik masuk) |
| `references/` | Brand kit, aturan konten + fakta, kalender 17 carousel, pola slide, motion, aset |
| `scripts/` | `build_pptx.py` (utama), `deck_to_plan.py`, `build_preview.py` dan `screenshot.py`/`render_video.py` (opsional), `make_background.py` |
| `assets/` | Latar grid, logo Shape, font, template preview, contoh `deck.json` |

Catatan: logo Shape di `assets/logo-shape.png` dan semua data event berasal dari user (Eventime). Jangan dipakai untuk brand lain.
