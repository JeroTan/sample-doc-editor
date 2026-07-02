PRAGMA foreign_keys = ON;

ALTER TABLE documents
ADD COLUMN content_markdown TEXT NOT NULL DEFAULT '';

UPDATE documents
SET content_markdown = CASE
  WHEN id = 'doc_alice_project_brief' THEN '# Project Brief

**Welcome to Doc-Me-In.** Use this seeded document to verify editing, saving, and sharing.

- Create
- Edit
- Share'
  WHEN id = 'doc_bob_notes' THEN '## Bob Notes

This document demonstrates a separate owner workspace.

1. Open dashboard
2. Review owned documents'
  ELSE content_text
END
WHERE content_markdown = '';

CREATE TABLE IF NOT EXISTS document_attachments (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  r2_key TEXT NOT NULL UNIQUE,
  content_text TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CHECK (length(trim(id)) > 0),
  CHECK (length(trim(file_name)) > 0),
  CHECK (length(trim(file_type)) > 0),
  CHECK (length(trim(r2_key)) > 0),
  CHECK (file_size > 0 AND file_size <= 10485760)
);

CREATE INDEX IF NOT EXISTS idx_document_attachments_document_id ON document_attachments(document_id);
CREATE INDEX IF NOT EXISTS idx_document_attachments_user_id ON document_attachments(user_id);
CREATE INDEX IF NOT EXISTS idx_document_attachments_r2_key ON document_attachments(r2_key);
