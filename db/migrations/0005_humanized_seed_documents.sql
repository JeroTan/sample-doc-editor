UPDATE documents
SET
  content_html = '<h1>Project Brief</h1><p><strong>Welcome to Doc-Me-In.</strong> Keep a clear project summary, capture decisions, and share next steps with your team.</p><ul><li>Draft clear notes</li><li>Review updates together</li><li>Keep action items organized</li></ul>',
  content_markdown = '# Project Brief

**Welcome to Doc-Me-In.** Keep a clear project summary, capture decisions, and share next steps with your team.

- Draft clear notes
- Review updates together
- Keep action items organized',
  content_text = 'Project Brief Welcome to Doc-Me-In. Keep a clear project summary, capture decisions, and share next steps with your team. Draft clear notes Review updates together Keep action items organized'
WHERE id = 'doc_alice_project_brief';

UPDATE documents
SET
  content_html = '<h1>Admin Workspace Brief</h1><p><strong>Welcome to Doc-Me-In.</strong> Use this workspace to prepare documents, organize shared work, and keep teammates aligned.</p><ul><li>Open your workspace</li><li>Write and format notes</li><li>Share work with teammates</li></ul>',
  content_markdown = '# Admin Workspace Brief

**Welcome to Doc-Me-In.** Use this workspace to prepare documents, organize shared work, and keep teammates aligned.

- Open your workspace
- Write and format notes
- Share work with teammates',
  content_text = 'Admin Workspace Brief Welcome to Doc-Me-In. Use this workspace to prepare documents, organize shared work, and keep teammates aligned. Open your workspace Write and format notes Share work with teammates'
WHERE id = 'doc_admin_welcome';
