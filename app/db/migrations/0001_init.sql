PRAGMA foreign_keys = ON;

-- Content lives in git (src/content/pages/*.md), NOT in D1. D1 holds only
-- IDENTITY: who may sign in (users), what groups exist (groups), and who is in
-- them (user_groups). A page's allowed groups live in its markdown frontmatter.

-- ---------- identity ----------
CREATE TABLE users (
  email       TEXT PRIMARY KEY,                   -- Google email, ALWAYS lowercased on write
  role        TEXT NOT NULL DEFAULT 'reader'
                CHECK (role IN ('editor','reader')),
  name        TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  last_login  TEXT
);

CREATE TABLE groups (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  key         TEXT NOT NULL UNIQUE,               -- e.g. 'leadership'
  label       TEXT NOT NULL
);

-- manual membership for POC (pre-prod: synced from Google Groups)
CREATE TABLE user_groups (
  email       TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  group_id    INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  PRIMARY KEY (email, group_id)
);
CREATE INDEX idx_user_groups_email ON user_groups(email);
