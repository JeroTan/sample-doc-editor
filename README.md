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

## Cloudflare

`wrangler.jsonc` defines one root Cloudflare Worker: `doc-me-in`.

No development Cloudflare Worker is configured. Local development uses Astro/Wrangler dev commands against root bindings, and deployment uses the root Worker.

The D1 binding is `DB` and targets `sample-doc-editor-database` (`3157d8e9-4a51-45e3-893a-e0dac3a21956`).

```bash
npm run db:migrate:local
npm run db:migrate:remote
npm run wrangler-dev
npm run deploy
```

## Current Status

Epic 0 setup is the active slice. Schema, API, full UI, integration, tests, documentation diagrams, and deployment remain in later epics from `docs/tasklist.md`.
