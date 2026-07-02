# Doc-Me-In

Lightweight collaborative document editor MVP for the Ajaia full stack product engineering assessment.

## Stack

- Astro `6.1.9`
- TypeScript `5.9.3`
- React `19`
- Cloudflare Worker
- Cloudflare D1 database: `sample-doc-editor-database`
- Tailwind CSS v4
- shadcn-style component primitives
- lucide icons
- Toast UI core editor mounted from React with `useEffect`
- react-toastify
- Vitest

## Local Setup

```bash
npm install
npm run wrangler-types
npm run dev
```

## Checks

```bash
npm run check
npm run build-test
```

## Upload Support

MVP upload import supports `.txt` and `.md` files up to 1 MB. `.docx` is not supported in the MVP; original files or attachments belong in R2 through the `STORAGE` binding.

## Cloudflare

`wrangler.jsonc` defines one root Cloudflare Worker: `doc-me-in`.

No development Cloudflare Worker is configured. Local development uses Astro/Wrangler dev commands against root bindings, and deployment uses the root Worker.

The D1 binding is `DB` and targets `sample-doc-editor-database` (`3157d8e9-4a51-45e3-893a-e0dac3a21956`).

The R2 binding is `STORAGE` and targets `sample-doc-editor-storage`.

```bash
npm run db:migrate:local
npm run db:migrate:remote
npm run wrangler-dev
npm run deploy
```

`db/migrations/0001_initial_schema.sql` creates reviewer seed users:

- `alice@example.com`
- `bob@example.com`
- `reviewer@example.com`

Alice owns `Project Brief`, Bob owns `Bob Notes`, and Alice's brief is shared with Bob as `editor`.

`db/migrations/0002_markdown_and_r2_attachments.sql` adds Markdown-first document storage and attachment metadata:

- `documents.content_markdown` stores editable Markdown source.
- `document_attachments.r2_key` stores the R2 object pointer for original files or attachments.
- Original files belong in R2 bucket `sample-doc-editor-storage`; editable text/markdown/html stays in D1.

## Current Status

Epic 0 setup, Epic 1 schema/migration, and Epic 2 API slices are complete. Full UI, integration, documentation diagrams, and deployment remain in later epics from `docs/tasklist.md`.
