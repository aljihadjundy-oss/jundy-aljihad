CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Topics',
  tags TEXT NOT NULL DEFAULT '[]',
  post_type TEXT NOT NULL DEFAULT 'article',
  external_url TEXT,
  external_platform TEXT,
  published INTEGER NOT NULL DEFAULT 1,
  date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_posts_published_date ON posts (published, date DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_slug ON posts (slug);
INSERT INTO posts (slug, title, excerpt, content, category, tags, post_type, published, date)
VALUES
(
  'kenapa-content-system-lebih-penting-dari-konten-viral',
  'Kenapa Content System Lebih Penting daripada Konten Viral',
  'Satu video viral bisa bikin bangga sehari. Content system yang bikin brand bertahan tahunan.',
  'Ini catatan random yang gue tulis abis rapat internal Keyratify. **[Placeholder — draft awal, tulisan lengkap menyusul.]**

Poin yang mau gue bahas nanti di sini:

- Kenapa "viral sekali" itu jebakan, bukan pencapaian
- Bedanya content calendar sama content system
- Cara Keyratify bangun sistem editorial buat brand kecil

Draft ini sengaja disimpan sebagai placeholder di struktur blog — nanti gue lengkapi isi lengkapnya di sini.',
  'Keiryuuzaki',
  '["content strategy","branding"]',
  'article',
  1,
  '2026-01-14'
),
(
  'curhatan-dari-lapangan-syuting-inframe',
  'Curhatan dari Lapangan Syuting Inframe',
  'Cerita di balik proses produksi dokumenter — yang gak keliatan di hasil akhir.',
  '**[Placeholder post — isi lengkap nyusul.]**

Ini rencananya cerita santai soal proses syuting salah satu project Inframe Storytelling — hal-hal receh dan berat yang gak masuk final cut, tapi ngebentuk cara gue mikirin cerita.

Nanti diisi lengkap ya.',
  'Curhatan',
  '["produksi video","inframe storytelling"]',
  'article',
  1,
  '2025-11-02'
),
(
  'quick-capture-tiga-pelajaran-jadi-komuniaktor',
  'Quick Capture: Tiga Pelajaran Jadi Komuniaktor',
  'Catatan cepat dari perjalanan sebagai brand strategist merangkap creative lead.',
  '**[Placeholder post — isi lengkap nyusul.]**

Rencana isi:

1. Kenapa istilah "Komuniaktor" gue pilih buat identitas
2. Pelajaran dari mimpin tim kecil di Sinatif
3. Kenapa evaluasi (Reflect) itu tahap paling sering dilewatin orang

Tulisan penuh menyusul.',
  'Quick Capture',
  '["personal branding","reflection"]',
  'article',
  1,
  '2025-08-20'
);
