PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS auth_credentials (
  user_id TEXT PRIMARY KEY,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  password_salt TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CHECK (email = lower(trim(email))),
  CHECK (length(trim(email)) > 0),
  CHECK (length(trim(password_salt)) >= 12),
  CHECK (length(trim(password_hash)) >= 32)
);

CREATE INDEX IF NOT EXISTS idx_auth_credentials_email ON auth_credentials(email);

CREATE TRIGGER IF NOT EXISTS set_auth_credentials_updated_at
AFTER UPDATE ON auth_credentials
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE auth_credentials SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE user_id = NEW.user_id;
END;

INSERT OR IGNORE INTO users (id, email, display_name, avatar_initials, created_at, updated_at) VALUES
  ('usr_admin', 'admin@mail.com', 'Admin', 'AD', '2026-07-02T00:00:00.000Z', '2026-07-02T00:00:00.000Z');

INSERT OR IGNORE INTO auth_credentials (user_id, email, password_salt, password_hash, created_at, updated_at) VALUES
  (
    'usr_admin',
    'admin@mail.com',
    'doc-me-in-admin-seed-v1',
    'y7C34dj96FWowV30b8VEXHLR24MR5m10TQrwp50xApI=',
    '2026-07-02T00:00:00.000Z',
    '2026-07-02T00:00:00.000Z'
  );
