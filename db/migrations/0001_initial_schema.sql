PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  display_name TEXT NOT NULL,
  avatar_initials TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  CHECK (length(trim(id)) > 0),
  CHECK (email = lower(trim(email))),
  CHECK (length(trim(email)) > 0),
  CHECK (length(trim(display_name)) > 0),
  CHECK (length(trim(avatar_initials)) BETWEEN 1 AND 4)
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CHECK (length(trim(id)) > 0),
  CHECK (length(trim(token_hash)) >= 32)
);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled document',
  content_html TEXT NOT NULL DEFAULT '',
  content_text TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  last_opened_at TEXT,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  CHECK (length(trim(id)) > 0),
  CHECK (length(trim(title)) BETWEEN 1 AND 120),
  CHECK (length(content_html) <= 1000000),
  CHECK (length(content_text) <= 1000000)
);

CREATE TABLE IF NOT EXISTS document_shares (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (document_id, user_id),
  CHECK (length(trim(id)) > 0),
  CHECK (role IN ('viewer', 'editor'))
);

CREATE TABLE IF NOT EXISTS document_imports (
  id TEXT PRIMARY KEY,
  document_id TEXT,
  user_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  status TEXT NOT NULL,
  error_message TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CHECK (length(trim(id)) > 0),
  CHECK (length(trim(file_name)) > 0),
  CHECK (length(trim(file_type)) > 0),
  CHECK (file_size >= 0 AND file_size <= 1048576),
  CHECK (status IN ('success', 'failed')),
  CHECK ((status = 'success' AND document_id IS NOT NULL) OR (status = 'failed' AND error_message IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_documents_owner_id ON documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON documents(updated_at);
CREATE INDEX IF NOT EXISTS idx_document_shares_user_id ON document_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_document_id ON document_shares(document_id);
CREATE INDEX IF NOT EXISTS idx_document_imports_document_id ON document_imports(document_id);
CREATE INDEX IF NOT EXISTS idx_document_imports_user_id ON document_imports(user_id);

CREATE TRIGGER IF NOT EXISTS prevent_document_owner_share_insert
BEFORE INSERT ON document_shares
FOR EACH ROW
WHEN EXISTS (
  SELECT 1
  FROM documents
  WHERE documents.id = NEW.document_id
    AND documents.owner_id = NEW.user_id
)
BEGIN
  SELECT RAISE(ABORT, 'document owner cannot be shared user');
END;

CREATE TRIGGER IF NOT EXISTS prevent_document_owner_share_update
BEFORE UPDATE OF document_id, user_id ON document_shares
FOR EACH ROW
WHEN EXISTS (
  SELECT 1
  FROM documents
  WHERE documents.id = NEW.document_id
    AND documents.owner_id = NEW.user_id
)
BEGIN
  SELECT RAISE(ABORT, 'document owner cannot be shared user');
END;

CREATE TRIGGER IF NOT EXISTS set_users_updated_at
AFTER UPDATE ON users
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE users SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS set_documents_updated_at
AFTER UPDATE ON documents
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE documents SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS set_document_shares_updated_at
AFTER UPDATE ON document_shares
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE document_shares SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = NEW.id;
END;

INSERT OR IGNORE INTO users (id, email, display_name, avatar_initials, created_at, updated_at) VALUES
  ('usr_alice', 'alice@example.com', 'Alice Vale', 'AV', '2026-07-02T00:00:00.000Z', '2026-07-02T00:00:00.000Z'),
  ('usr_bob', 'bob@example.com', 'Bob Chen', 'BC', '2026-07-02T00:00:00.000Z', '2026-07-02T00:00:00.000Z'),
  ('usr_reviewer', 'reviewer@example.com', 'Reviewer', 'RV', '2026-07-02T00:00:00.000Z', '2026-07-02T00:00:00.000Z');

INSERT OR IGNORE INTO documents (id, owner_id, title, content_html, content_text, created_at, updated_at, last_opened_at) VALUES
  (
    'doc_alice_project_brief',
    'usr_alice',
    'Project Brief',
    '<h1>Project Brief</h1><p><strong>Welcome to Doc-Me-In.</strong> Use this seeded document to verify editing, saving, and sharing.</p><ul><li>Create</li><li>Edit</li><li>Share</li></ul>',
    'Project Brief Welcome to Doc-Me-In. Use this seeded document to verify editing, saving, and sharing. Create Edit Share',
    '2026-07-02T00:00:00.000Z',
    '2026-07-02T00:00:00.000Z',
    NULL
  ),
  (
    'doc_bob_notes',
    'usr_bob',
    'Bob Notes',
    '<h2>Bob Notes</h2><p>This document demonstrates a separate owner workspace.</p><ol><li>Open dashboard</li><li>Review owned documents</li></ol>',
    'Bob Notes This document demonstrates a separate owner workspace. Open dashboard Review owned documents',
    '2026-07-02T00:00:00.000Z',
    '2026-07-02T00:00:00.000Z',
    NULL
  );

INSERT OR IGNORE INTO document_shares (id, document_id, user_id, role, created_at, updated_at) VALUES
  ('share_alice_project_brief_bob', 'doc_alice_project_brief', 'usr_bob', 'editor', '2026-07-02T00:00:00.000Z', '2026-07-02T00:00:00.000Z');
