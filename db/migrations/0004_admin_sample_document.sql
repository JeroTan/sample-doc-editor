PRAGMA foreign_keys = ON;

INSERT OR IGNORE INTO documents (
  id,
  owner_id,
  title,
  content_html,
  content_markdown,
  content_text,
  created_at,
  updated_at,
  last_opened_at
) VALUES (
  'doc_admin_welcome',
  'usr_admin',
  'Admin Workspace Brief',
  '<h1>Admin Workspace Brief</h1><p><strong>Welcome to Doc-Me-In.</strong> Use this seeded admin document to verify landing, login, edit URLs, view URLs, save, import, and sharing.</p><ul><li>Open /app</li><li>Switch between /view and /edit</li><li>Save document content</li></ul>',
  '# Admin Workspace Brief

**Welcome to Doc-Me-In.** Use this seeded admin document to verify landing, login, edit URLs, view URLs, save, import, and sharing.

- Open /app
- Switch between /view and /edit
- Save document content',
  'Admin Workspace Brief Welcome to Doc-Me-In. Use this seeded admin document to verify landing, login, edit URLs, view URLs, save, import, and sharing. Open /app Switch between /view and /edit Save document content',
  '2026-07-02T00:00:00.000Z',
  '2026-07-02T00:00:00.000Z',
  NULL
);
