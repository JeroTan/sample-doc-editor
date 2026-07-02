PRAGMA foreign_keys = ON;

INSERT OR IGNORE INTO users (id, email, display_name, avatar_initials, created_at, updated_at) VALUES
  ('usr_robert', 'robert@mail.com', 'Robert Reviewer', 'RR', '2026-07-02T00:00:00.000Z', '2026-07-02T00:00:00.000Z');

INSERT OR IGNORE INTO auth_credentials (user_id, email, password_salt, password_hash, created_at, updated_at) VALUES
  (
    'usr_robert',
    'robert@mail.com',
    'doc-me-in-robert-seed-v1',
    'ys1ibkij2EB+nAopGIebqY//yuYAU66LruQezv+HVho=',
    '2026-07-02T00:00:00.000Z',
    '2026-07-02T00:00:00.000Z'
  );
