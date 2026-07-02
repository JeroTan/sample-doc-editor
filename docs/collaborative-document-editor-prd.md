# Product Requirements Document: Collaborative Document Editor MVP

**Version**: 1.0
**Date**: 2026-07-02
**Author**: Sarah (Product Owner)
**Quality Score**: 94/100

---

## Executive Summary

Build a lightweight collaborative document editor for Ajaia's internal productivity tooling assessment. The product should let reviewers create, edit, persist, upload, and share documents through a coherent full stack MVP inspired by Google Docs, without attempting full Google Docs parity.

The MVP prioritizes a narrow but complete product slice: rich-text document editing, file import, seeded-user sharing, D1 persistence, Cloudflare Worker deployment, automated tests, and clear submission documentation. Success depends on reviewer speed: they should understand, run, and verify the product quickly.

---

## Requirements Quality Score

- Business Value & Goals: 27/30
- Functional Requirements: 24/25
- User Experience: 19/20
- Technical Constraints: 15/15
- Scope & Priorities: 9/10

Total: 94/100

---

## Problem Statement

**Current Situation**: The assignment asks for a realistic full stack product slice with ambiguous scope, tight delivery time, multiple surfaces, and explicit judgment around tradeoffs.

**Proposed Solution**: Build a Cloudflare Worker-hosted Astro app with a React editor experience, D1 persistence, simple seeded-user sharing, and upload import into editable documents.

**Business Impact**: Reviewers can assess product judgment, full stack delivery, persistence design, access logic, UI usability, and AI-assisted engineering discipline in one focused workflow.

---

## Success Metrics

**Primary KPIs:**
- Core flow completion: Reviewer can create, edit, save, refresh, and reopen a document successfully.
- Sharing completion: Reviewer can share a document from one seeded user to another and see owned vs shared documents.
- Upload completion: Reviewer can upload a supported file and turn it into an editable document.
- Reliability: `npm run test`, `npm run check`, and `npm run build` pass before submission.
- Reviewer readiness: README, architecture note, AI workflow note, `SUBMISSION.md`, live URL, and video URL file exist.

**Validation**: Use automated tests, browser smoke tests, local D1 migration checks, remote D1 migration checks, and live deployment smoke tests.

---

## User Personas

### Primary: Assignment Reviewer

- **Role**: Technical evaluator
- **Goals**: Verify product slice quickly, inspect code quality, assess tradeoffs, test deployed app
- **Pain Points**: Incomplete setup docs, vague scope, broken persistence, unclear demo users
- **Technical Level**: Advanced

### Secondary: Internal Knowledge Worker

- **Role**: User creating shared notes or drafts
- **Goals**: Create, edit, import, and share lightweight documents
- **Pain Points**: Losing edits, unclear access, clumsy upload flow
- **Technical Level**: Intermediate

---

## User Stories & Acceptance Criteria

### Story 1: Create and Edit Document

**As a** knowledge worker  
**I want to** create, rename, edit, save, and reopen a document  
**So that** I can maintain lightweight shared work in one place.

**Acceptance Criteria:**
- [ ] User can create a new document with default title.
- [ ] User can rename a document.
- [ ] User can edit content in a browser editor.
- [ ] Editor supports bold, italic, underline, headings or size variation, bulleted lists, and numbered lists.
- [ ] Saved content persists after refresh and reopen.
- [ ] Empty documents are allowed.
- [ ] Invalid or too-long titles show clear validation errors.

### Story 2: Import File Into Product Workflow

**As a** knowledge worker  
**I want to** upload a supported file and create an editable document from it  
**So that** existing notes can enter the editor workflow quickly.

**Acceptance Criteria:**
- [ ] User can upload `.txt` or `.md` files.
- [ ] Imported file creates a new document with title based on file name.
- [ ] Imported content is editable after upload.
- [ ] Unsupported file types show clear UI and API errors.
- [ ] Upload limitations are stated in UI and README.
- [ ] Import metadata is persisted for traceability.

### Story 3: Share Document With Another User

**As a** document owner  
**I want to** grant another seeded user access to my document  
**So that** shared work can be demonstrated without enterprise auth.

**Acceptance Criteria:**
- [ ] Each document has an owner.
- [ ] Owner can share by seeded user email.
- [ ] Duplicate shares are prevented.
- [ ] Owner cannot share document with self.
- [ ] Shared user sees document in a distinct "Shared with me" section.
- [ ] Unauthorized users cannot open private documents.

### Story 4: Review and Run Submission

**As an** assignment reviewer  
**I want to** run, inspect, and test the submission quickly  
**So that** evaluation is fast and fair.

**Acceptance Criteria:**
- [ ] README includes setup, run, test, migration, seeded users, and deploy instructions.
- [ ] Architecture note explains priorities and tradeoffs.
- [ ] AI workflow note explains tools, edits, rejected output, and verification.
- [ ] `SUBMISSION.md` lists included deliverables.
- [ ] Live product URL is available if Cloudflare auth/deploy succeeds.
- [ ] Video URL file exists, with placeholder if user records video later.

---

## Functional Requirements

### Core Feature 1: Document Creation and Editing

- Description: Users create documents, rename them, edit rich text, save, refresh, and reopen.
- User flow: Choose seeded user > create document > edit title/content > save > refresh > reopen.
- Edge cases: Empty content, empty title, long title, save failure, switching documents with unsaved changes.
- Error handling: Toast and inline validation for invalid title, failed save, unauthorized access, and missing document.

### Core Feature 2: File Upload Import

- Description: Users upload `.txt` or `.md` files and convert them into editable documents.
- User flow: Open upload dialog > choose file > import > new document opens in editor.
- Edge cases: Unsupported type, empty file, oversized file, invalid encoding, repeated file name.
- Error handling: Friendly messages in dialog and toast; API returns structured error shape.

### Core Feature 3: Sharing

- Description: Document owners grant access to seeded users.
- User flow: Owner opens share dialog > enters user email > grants access > target user switches account > shared document appears.
- Edge cases: Unknown email, duplicate share, share with owner, target already has access, unauthorized grant.
- Error handling: Clear validation errors; permission failures return 403.

### Core Feature 4: Persistence

- Description: Store users, documents, shares, and upload import metadata in Cloudflare D1.
- User flow: All create, update, upload, and share operations write to D1.
- Edge cases: Missing records, deleted user/document, malformed IDs, conflicting updates.
- Error handling: Use prepared statements, consistent API error shape, and safe 404/403 responses.

---

## Technical Constraints

### Required Stack

- Astro `6.1.9`
- TypeScript `5.9.3`
- Cloudflare Worker deployment
- Cloudflare D1 database: `sample-doc-editor-database`
- React for interactive UI
- Tailwind CSS
- shadcn components with global customization from `docs/design.md`
- lucide icons
- Toast UI editor
- toastify notifications
- Vitest

### Architecture

- API must be layered as routes > controllers > services > models.
- Atomic helpers belong in `src/lib` or `src/utility`.
- No dependency injection required for MVP.
- Use bulletproof-react-inspired feature structure where practical.
- Run D1 migrations locally and remotely. If Wrangler auth fails, ask user.

### Security

- Do not use bcrypt.
- Use Web Crypto or Cloudflare-compatible crypto helper for token/hash needs.
- Use prepared SQL statements.
- Enforce owner/shared access on every document endpoint.
- Sanitize or safely render editor content outside editor surfaces.

### Performance

- UI should feel responsive for assessment-scale datasets.
- API operations should avoid unnecessary multi-query loops.
- Document list should load quickly with owned/shared grouping.

---

## MVP Scope & Phasing

### Phase 1: MVP

- Seeded user selection or lightweight session flow.
- Document create, rename, edit, save, reopen.
- Rich text editor with required formatting.
- `.txt` and `.md` upload import into new document.
- Simple sharing from owner to seeded user.
- Owned vs shared dashboard.
- D1 schema, local migration, remote migration.
- Vitest coverage for validation, permissions, or service logic.
- Browser verification.
- README, architecture note, AI workflow note, diagrams, `SUBMISSION.md`.
- Cloudflare Worker deployment if Wrangler auth is available.

**MVP Definition**: A reviewer can open the app, choose Alice, create/edit/save a document, upload a text/markdown file, share with Bob, switch to Bob, and verify the document appears as shared.

### Phase 2: Enhancements

- Full viewer/editor role management.
- Share revoke and role update.
- Autosave with dirty state and conflict warning.
- Markdown export.
- Import history UI.

### Future Considerations

- Real-time collaboration indicators.
- Comments or suggestions.
- Document version history.
- DOCX import.
- Full authentication and account management.

---

## Out of Scope

- Full Google Docs parity.
- Real-time multi-user editing.
- Enterprise-grade access control.
- Paid third-party services.
- Full password auth unless time permits.
- DOCX import unless core scope is complete.
- Walkthrough video recording by Codex; user may record and add URL.

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| Toast UI SSR issues in Astro | Medium | High | Load editor as client-only React component and verify in browser. |
| Cloudflare D1 remote auth/config issue | Medium | High | Run local first, then remote; ask user if Wrangler auth fails. |
| Scope creep from Google Docs comparison | High | Medium | Keep MVP to create/edit/upload/share/persist; document cuts clearly. |
| Upload parsing complexity | Medium | Medium | Support `.txt` and `.md` first; state limitations. |
| Rich-text preservation mismatch | Medium | High | Store editor HTML or supported editor output; smoke test reopen formatting. |

---

## Dependencies & Blockers

**Dependencies:**
- Wrangler configured for Cloudflare account.
- D1 database `sample-doc-editor-database`.
- Network access for npm package installation.
- User-provided Loom/YouTube video URL if final walkthrough is outside Codex scope.

**Known Blockers:**
- Remote migration and deployment require Wrangler authentication. If auth fails, implementation must pause for user login.

---

## Required Diagrams

Add Mermaid diagrams during documentation pass:

- Onboarding journey.
- Creation process journey.
- Viewing process journey.
- Updating/modification journey.
- API-to-UI process flow.

---

## References

- `docs/user-source-of-truth.md`
- `docs/requirement.md`
- `docs/design.md`
- `docs/tasklist.md`
- Astro Cloudflare Worker setup skill
- bulletproof-react reference: https://github.com/alan2207/bulletproof-react

---

*This PRD was created through fast requirements synthesis with quality scoring. It is intentionally concise because detailed execution work lives in `docs/tasklist.md`.*
