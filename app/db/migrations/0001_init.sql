PRAGMA foreign_keys = ON;

-- ---------- content ----------
CREATE TABLE pages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  section     TEXT NOT NULL,
  nav_label   TEXT NOT NULL DEFAULT '',
  sort        INTEGER NOT NULL DEFAULT 0,
  visibility  TEXT NOT NULL DEFAULT 'internal'
                CHECK (visibility IN ('public','internal','restricted')),
  status      TEXT NOT NULL DEFAULT 'draft'
                CHECK (status IN ('draft','published')),
  body        TEXT NOT NULL DEFAULT '',          -- markdown VERBATIM (source of truth)
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_by  TEXT                                -- email of last editor (audit)
);
CREATE INDEX idx_pages_status_section_sort ON pages(status, section, sort);

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

-- which groups grant read on a restricted page (zero rows => unreachable => fail closed)
CREATE TABLE page_groups (
  page_id     INTEGER NOT NULL REFERENCES pages(id)  ON DELETE CASCADE,
  group_id    INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  PRIMARY KEY (page_id, group_id)
);

-- manual membership for POC (pre-prod: synced from Google Groups)
CREATE TABLE user_groups (
  email       TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  group_id    INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  PRIMARY KEY (email, group_id)
);
CREATE INDEX idx_user_groups_email ON user_groups(email);
