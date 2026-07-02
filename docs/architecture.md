# Doc-Me-In Architecture

Doc-Me-In is an Astro 6 app with React islands for authentication and document editing. Astro serves pages and static assets through a Cloudflare Worker. The Worker routes `/api/*` requests through thin controllers, service modules, model modules, and Cloudflare D1.

## Overview

- UI: Astro pages, React 19 app shell, Toast UI editor/viewer, Tailwind v4, lucide icons.
- API: `src/api/routes/router.ts` dispatches to controllers, services, and model functions.
- Storage: D1 stores users, credentials, documents, shares, imports, and attachment metadata.
- R2: `sample-doc-editor-storage` stores original uploaded files. D1 stores editable Markdown/HTML/text and R2 object pointers.
- Auth: Seeded credential login plus registration. Password hashes use Web Crypto PBKDF2, not bcrypt.

## Data Model

- `users`: account identity and display info.
- `auth_credentials`: email, salt, PBKDF2 hash.
- `documents`: owner, title, Markdown, HTML, text, timestamps.
- `document_shares`: shared user, document, role.
- `document_imports`: import status, file name, file type, size.
- `document_attachments`: original upload metadata and R2 key.

## Priorities

- Make reviewer journey fast: login, create/import, edit, save, share, view, delete.
- Keep each page URL meaningful: landing, login, register, app list, view, edit.
- Store editable content in D1; store binaries/original uploads in R2.
- Prefer manual save and clear state over hidden autosave complexity.

## Tradeoffs

- No real-time co-editing yet. Sharing is permission-based, not live cursor collaboration.
- Legacy `.doc` is unsupported. `.docx` converts client-side to Markdown with Mammoth before upload.
- Seed credentials exist for reviewer speed; registration is available for new users.
- Version history and autosave remain stretch work.

## Onboarding Journey

```mermaid
flowchart LR
  A[Open landing page] --> B[Login]
  B --> C[Session cookie]
  C --> D[Workspace]
  D --> E[Owned documents]
  D --> F[Shared documents]
```

## Creation Journey

```mermaid
flowchart LR
  A[Click New] --> B[Create document API]
  B --> C[Open edit URL]
  C --> D[Rename and write]
  D --> E[Save]
  E --> F[D1 document update]
  F --> G[Refresh and reopen]
```

## Viewing Journey

```mermaid
flowchart LR
  A[Owner shares document] --> B[Reviewer logs in]
  B --> C[Shared with me]
  C --> D[Open view URL]
  D --> E[Toast UI Viewer renders Markdown]
```

## Update Journey

```mermaid
flowchart LR
  A[Open existing document] --> B[Edit title/content]
  B --> C[Save button]
  C --> D[API validates permissions]
  D --> E[D1 updates content and timestamp]
  E --> F[List shows new timestamp]
```

## API To UI Flow

```mermaid
sequenceDiagram
  participant UI as React UI
  participant API as Worker API Route
  participant C as Controller
  participant S as Service
  participant M as Model
  participant D1 as Cloudflare D1
  UI->>API: fetch /api/documents/:id/content
  API->>C: route request
  C->>S: validate request and user
  S->>M: save document content
  M->>D1: prepared statement
  D1-->>M: updated row
  M-->>S: document DTO
  S-->>C: result
  C-->>UI: { data }
  UI->>UI: toast + refresh state
```
