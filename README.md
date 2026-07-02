# Doc-Me-In

Collaborative document editor MVP for the Ajaia full stack product engineering assessment.

## Stack

- Astro `6.1.9`
- React `19`
- TypeScript `5.9.3`
- Cloudflare Worker
- Cloudflare D1 database: `sample-doc-editor-database`
- Cloudflare R2 bucket: `sample-doc-editor-storage`
- Tailwind CSS v4
- Toast UI editor/viewer
- Mammoth client-side `.docx` conversion
- Vitest and Playwright

## Local Setup

```bash
npm install
npm run wrangler-types
npm run db:migrate:local
npm run dev
```

Open:

- Landing: `http://localhost:4321/`
- Login: `http://localhost:4321/login`
- Register: `http://localhost:4321/register`
- Workspace: `http://localhost:4321/app`

Seed credentials are shared separately by the project owner. Login UI intentionally does not display or prefill them.

## Checks

```bash
npm run test:run
npm run check
npm run build
```

## Upload Support

Doc-Me-In imports `.txt`, `.md`, and `.docx` files up to 1 MB.

- `.txt` and `.md` upload directly to the Worker.
- `.docx` converts in the browser with Mammoth, then uploads generated Markdown.
- Editable Markdown/HTML/text stays in D1.
- Original uploaded files are written to R2 through the `STORAGE` binding.
- Legacy `.doc` is unsupported.

## Cloudflare

`wrangler.jsonc` defines one root Cloudflare Worker: `doc-me-in`.

No development Cloudflare Worker is configured. Local development uses Astro/Wrangler dev commands against root bindings, and deployment uses the root Worker.

The D1 binding is `DB` and targets `sample-doc-editor-database` (`3157d8e9-4a51-45e3-893a-e0dac3a21956`).

The R2 binding is `STORAGE` and targets `sample-doc-editor-storage`.

```bash
npm run db:migrate:remote
npm run deploy
```

Live Worker:

```text
https://doc-me-in.jerowe-tan99.workers.dev
```

## Page Routes

- `/` landing page
- `/login` login form
- `/register` registration form
- `/app` document list/workspace shell
- `/app/docs/:id/view` read-only document page rendered with Toast UI Viewer
- `/app/docs/:id/edit` editable document page

## Main Features

- Create, open, rename, edit, save, reopen, and delete documents.
- Separate owned and shared document sections.
- Owner/editor/viewer permissions.
- Share, update role, and revoke access.
- Import `.txt`, `.md`, and `.docx`.
- Customer landing page plus URL-aware app pages.
- Manual save with dirty/saved state.

## Reviewer Video

```bash
npm run record:journey
```

Output:

```text
output/doc-me-in-user-journey.webm
```

## Docs

- PRD: `docs/collaborative-document-editor-prd.md`
- Task list: `docs/tasklist.md`
- Page routes: `docs/page-routes.md`
- Architecture: `docs/architecture.md`
- AI workflow: `docs/ai-workflow.md`
- Manual QA: `docs/manual-qa.md`
- Submission summary: `SUBMISSION.md`

## Deferred Stretch

- Autosave.
- Version history.
- Real-time collaboration/presence.
- Markdown export.
