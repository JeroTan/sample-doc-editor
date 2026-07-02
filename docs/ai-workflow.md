# AI Workflow

Codex helped turn the assignment notes into a PRD, task list, implementation slices, tests, and reviewer documentation.

## Tools Used

- Codex: repo reading, PRD synthesis, implementation, tests, docs, and Cloudflare workflow.
- Product requirements skill: quick PRD from `docs/user-source-of-truth.md` and `docs/requirement.md`.
- TDD skill: validation/API/UI tests before or alongside risky changes.
- Browser/video automation: Playwright script records reviewer journey to `output/doc-me-in-user-journey.webm`.

## AI Output Changed Or Rejected

- Initial technical landing page copy was replaced with customer-facing copy.
- Seed credential text was removed from visible UI.
- Read-only view changed from editor-like display to Toast UI Viewer rendered Markdown.
- `.docx` upload changed to client-side conversion before API upload to keep Worker upload API simple and safe.

## Verification

- Unit tests cover title/upload/auth rules and UI permission affordances.
- API tests cover auth, CRUD, save/reopen, delete, sharing, upload import, R2 attachment writes, and reviewer journey.
- Markdown rendering test verifies view mode uses rendered HTML.
- Build check uses `astro check` and `astro build`.
- Manual QA checklist lives in `docs/manual-qa.md`.
