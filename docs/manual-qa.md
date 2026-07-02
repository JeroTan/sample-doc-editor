# Manual QA Checklist

Use deployed Worker URL unless local behavior is being checked.

## Required Features

- Login with reviewer credential.
- Create document.
- Rename document.
- Edit rich text content.
- Save document.
- Refresh page and reopen saved document.
- Import `.txt`, `.md`, and `.docx`.
- Share document with another user.
- Login as shared user and confirm document appears under shared section.
- Open `/view` route and confirm rendered Markdown, not editor UI.
- Delete owned document and confirm list updates.

## Error Checks

- Empty title falls back to `Untitled document`.
- Title with control character fails.
- Unsupported upload such as `.png` shows friendly error.
- Oversized upload over 1 MB shows friendly error.
- Unknown share email shows friendly error.
- Viewer cannot edit, save, share, or delete.

## Runtime Checks

```bash
npm run test:run
npm run check
npm run build
npm run db:migrate:remote
npm run deploy
npm run record:journey
```
