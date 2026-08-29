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
