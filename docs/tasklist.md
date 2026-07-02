# [x] Epic 0 PRD, Scope, and Delivery Guardrails for Doc-Me-In
## [x] Task Section 0.1 Quick PRD Skill Pass
> Use product-requirements PRD skill > produce concise PRD from `docs/requirement.md` and `docs/user-source-of-truth.md` > check this task list against PRD before implementation starts.

### [x] Task subsection 0.1.1 Confirm source priority
> Treat `docs/user-source-of-truth.md` as override > use `docs/requirement.md` as assignment source > use `docs/design.md` for UI tokens > note `docs/sample-ui.md` if still empty.

### [x] Task subsection 0.1.2 Lock MVP scope
> Target strongest 4-6 hour slice > prioritize document CRUD, rich-text editing, upload import, sharing, persistence, setup docs, deployed URL.

### [x] Task subsection 0.1.3 Record deliberate cuts
> Mark incomplete or deferred features in `README.md`, architecture note, and `SUBMISSION.md` > explain what would be built with another 2-4 hours.

## [x] Task Section 0.2 Project Setup Guardrails
> Scaffold Astro + Cloudflare Worker exactly as user source requires > keep implementation aligned with Cloudflare D1 deployment.

### [x] Task subsection 0.2.1 Scaffold exact versions
> Run `npm create astro@latest` > ensure Astro `6.1.9` > ensure TypeScript `5.9.3` > verify versions in `package.json`.

### [x] Task subsection 0.2.2 Add required frontend stack
> Add React 19 for interactive editor > follow bulletproof-react folder ideas > add Tailwind CSS > add shadcn components > add lucide icons > add Toast UI core editor with vanilla `useEffect` mount > add toastify notifications.

### [x] Task subsection 0.2.3 Add required platform stack
> Add `@astrojs/cloudflare` > add root-only Wrangler config with no development Worker env > set Worker entry at `src/cloudflare/worker.ts` > bind D1 as `DB` > database name `sample-doc-editor-database`.

### [x] Task subsection 0.2.4 Add required quality stack
> Add Vitest > add `astro check` > add scripts for `build`, `test`, `check`, `wrangler-types`, `wrangler-dev`, deploy.

### [x] Task subsection 0.2.5 Sync Cloudflare types
> After any `wrangler.jsonc` binding change > immediately run `npm run wrangler-types` > commit generated type updates if created.

### [x] Task subsection 0.2.6 Use safe helper locations
> Put atomic helpers in `src/lib` or `src/utils` > put dependency-free utilities near domain helpers > avoid duplicated inline logic.

### [x] Task subsection 0.2.7 Add R2 storage binding
> Add root-only R2 binding in `wrangler.jsonc` > binding name `STORAGE` > bucket name `sample-doc-editor-storage` > run `npm run wrangler-types` immediately after config change > keep no development Worker env.

# [x] Epic 1 Schema and Persistence
## [x] Task Section 1.1 D1 Database Plan
> Design schema first > support users, documents, shares, upload imports, and audit timestamps.

### [x] Task subsection 1.1.1 Create migration structure
> Create `db/migrations` or repo-standard D1 migration folder > name initial migration clearly > keep schema reproducible.

### [x] Task subsection 1.1.2 Define `users` table
> Fields: `id`, `email`, `display_name`, `avatar_initials`, `created_at`, `updated_at` > enforce unique normalized email.

### [x] Task subsection 1.1.3 Define `sessions` table if auth uses persistent sessions
> Fields: `id`, `user_id`, `token_hash`, `expires_at`, `created_at` > use Web Crypto hashing > no bcrypt.

### [x] Task subsection 1.1.4 Define `documents` table
> Fields: `id`, `owner_id`, `title`, `content_html`, `content_text`, `created_at`, `updated_at`, `last_opened_at` > store Toast UI output safely.

### [x] Task subsection 1.1.5 Define `document_shares` table
> Fields: `id`, `document_id`, `user_id`, `role`, `created_at`, `updated_at` > roles `viewer` and `editor` if scope allows > unique `(document_id, user_id)`.

### [x] Task subsection 1.1.6 Define `document_imports` table
> Fields: `id`, `document_id`, `user_id`, `file_name`, `file_type`, `file_size`, `status`, `error_message`, `created_at` > track upload workflow.

### [x] Task subsection 1.1.7 Define optional `document_attachments` table
> Leave unchecked unless attachment/original-file mode chosen > fields: `id`, `document_id`, `user_id`, `file_name`, `file_type`, `file_size`, `r2_key`, `content_text`, `created_at` > metadata in D1, binary/original file in R2 bucket `sample-doc-editor-storage`.

### [x] Task subsection 1.1.8 Add indexes
> Index `documents.owner_id` > index `document_shares.user_id` > index `document_shares.document_id` > index `document_imports.document_id`.

### [x] Task subsection 1.1.9 Add constraints
> Enforce foreign keys > cascade deletes where safe > prevent duplicate shares > prevent null owner > prevent empty user email.

## [x] Task Section 1.2 Seed Data
> Create reviewer-ready users and sample documents > make sharing demo obvious.

### [x] Task subsection 1.2.1 Seed accounts
> Add `alice@example.com`, `bob@example.com`, `reviewer@example.com` > include display names > document credentials or selector behavior in README.

### [x] Task subsection 1.2.2 Seed owned documents
> Add one document owned by Alice > add one document owned by Bob > include basic rich text HTML.

### [x] Task subsection 1.2.3 Seed shared document
> Share one Alice document with Bob > ensure dashboard can show owned vs shared distinction immediately.

## [x] Task Section 1.3 D1 Migration Execution
> Run migrations locally and remotely per user source > ask user only if Wrangler auth fails.

### [x] Task subsection 1.3.1 Run local migration
> Use Wrangler D1 local execute/migrations command > verify tables exist > verify seeds inserted.

### [x] Task subsection 1.3.2 Run remote migration
> Use configured root D1 database `sample-doc-editor-database` > run migration remote with no Wrangler env flag > verify no auth failure > ask user if login needed.

### [x] Task subsection 1.3.3 Record migration commands
> Add exact root Worker commands to README > include local reset/reseed command if implemented.

## [x] Task Section 1.4 Persistence Edge Cases
> Guard against malformed data before API and UI rely on database.

### [x] Task subsection 1.4.1 Title edge cases
> Empty title uses `Untitled document` > trim whitespace > cap title length > reject control characters.

### [x] Task subsection 1.4.2 Content edge cases
> Allow empty content > cap max content size > preserve headings, bold, italic, underline, lists > store sanitized HTML or safe editor format.

### [x] Task subsection 1.4.3 Sharing edge cases
> Prevent share with owner > prevent duplicate share rows > handle unknown email > handle deleted user > handle deleted document.

### [x] Task subsection 1.4.4 Upload import edge cases
> Reject unsupported type > reject oversized file > reject empty file > preserve line breaks > handle invalid encoding > show friendly error.

### [x] Task subsection 1.4.5 Timestamp edge cases
> Use consistent ISO/SQLite timestamps > update `updated_at` on rename/save/share changes > avoid client clock dependence.

# [x] Epic 2 API Layer
## [x] Task Section 2.1 API Folder Structure
> Implement routes < controllers < services < models > keep controllers thin > keep database SQL in models.

### [x] Task subsection 2.1.1 Create API folders
> Add `src/api/routes` > add `src/api/controllers` > add `src/api/services` > add `src/api/models` > add `_readme.md` where expected by setup skill.

### [x] Task subsection 2.1.2 Create shared API helpers
> Add JSON response helper > add error helper > add validation helper > add request body parser > add current user helper.

### [x] Task subsection 2.1.3 Create model types
> Define `User`, `Document`, `DocumentShare`, `DocumentImport` > keep DB row types separate from API DTOs if useful.

## [x] Task Section 2.2 Auth and User Simulation
> Keep auth lightweight but coherent > no bcrypt > Web Crypto only if tokens or password-like secrets exist.

### [x] Task subsection 2.2.1 Choose MVP auth mode
> Prefer seeded user selector for speed > persist selected user in signed or simple session cookie if implemented > document tradeoff.

### [x] Task subsection 2.2.2 Implement current user endpoint
> `GET /api/me` returns selected user > include owned/shared counts if cheap.

### [x] Task subsection 2.2.3 Implement switch user endpoint
> `POST /api/session` with user id or email > validate seeded user exists > set cookie or return session payload.

### [x] Task subsection 2.2.4 Implement logout endpoint if session cookie used
> `DELETE /api/session` clears cookie > UI returns to onboarding/login.

### [x] Task subsection 2.2.5 Auth edge cases
> Missing user returns 401 > invalid user returns 400/404 > expired session returns 401 > malformed cookie ignored safely.

## [x] Task Section 2.3 Documents API
> Provide full create, read, rename, edit, save, reopen behavior.

### [x] Task subsection 2.3.1 List documents
> `GET /api/documents` returns owned and shared docs > include owner name > include access role > sort by updated date.

### [x] Task subsection 2.3.2 Create document
> `POST /api/documents` creates owner document > default title `Untitled document` > default content empty.

### [x] Task subsection 2.3.3 Get document detail
> `GET /api/documents/:id` returns document if owner or shared user > include share metadata.

### [x] Task subsection 2.3.4 Rename document
> `PATCH /api/documents/:id/title` updates title > owners and editors only > validate title.

### [x] Task subsection 2.3.5 Save document content
> `PUT /api/documents/:id/content` stores rich text content > owners and editors only > preserve supported formatting.

### [x] Task subsection 2.3.6 Delete document optional
> Leave unchecked unless time allows > owner only > confirm in UI > cascade shares/imports.

### [x] Task subsection 2.3.7 Document API edge cases
> 404 if missing document > 403 if no access > 400 if invalid body > 413 if content too large > stale update warning if timestamp mismatch.

## [x] Task Section 2.4 Upload API
> Implement product-relevant file upload > MVP imports `.txt` and `.md` into editable document.

### [x] Task subsection 2.4.1 Upload new document
> `POST /api/uploads/import` accepts multipart file > parse `.txt` and `.md` > create document with imported content.

### [x] Task subsection 2.4.2 Upload into existing draft
> Optional if time allows > `POST /api/documents/:id/import` replaces or appends imported content > require owner/editor.

### [x] Task subsection 2.4.3 Store import metadata
> Insert `document_imports` row > file name > type > size > success or error > linked document id when created.

### [x] Task subsection 2.4.3a Store original upload in R2 when needed
> For attachment flow, `.docx`, images, or files kept as originals > write object to R2 bucket `sample-doc-editor-storage` > store `r2_key`, checksum if available, file name, MIME type, and size in D1 > never store large binary files in D1.

### [x] Task subsection 2.4.4 Markdown handling
> Minimum: preserve markdown as readable plain text > better: convert basic markdown headings/lists/bold to editor HTML if fast.

### [x] Task subsection 2.4.5 DOCX handling stretch
> Leave unchecked unless enough time > upload original `.docx` to R2 bucket `sample-doc-editor-storage` > extract editable text/markdown into D1 if parser implemented > otherwise state unsupported in UI and README.

### [x] Task subsection 2.4.6 Upload API edge cases
> Missing file > multiple files > unsupported extension > MIME mismatch > file too large > empty file > binary content > parse failure.

### [x] Task subsection 2.4.7 R2 upload edge cases
> R2 binding missing > bucket write fails > object key collision > failed DB write after R2 write > delete orphan object or mark failed import > file exceeds R2/MVP size limit > user lacks document access.

## [x] Task Section 2.5 Sharing API
> Allow one user to grant another user access > show owner/shared distinction.

### [x] Task subsection 2.5.1 List document shares
> `GET /api/documents/:id/shares` returns users with access > owner only or owner/editor if chosen.

### [x] Task subsection 2.5.2 Grant access
> `POST /api/documents/:id/shares` accepts email and role > owner only > validate target user.

### [x] Task subsection 2.5.3 Update share role optional
> `PATCH /api/documents/:id/shares/:shareId` changes viewer/editor > owner only.

### [x] Task subsection 2.5.4 Revoke share optional
> `DELETE /api/documents/:id/shares/:shareId` removes access > owner only > cannot revoke owner.

### [x] Task subsection 2.5.5 Sharing API edge cases
> Share with self > share with nonexistent email > duplicate share > invalid role > target already owner > target already shared > owner tries revoke self.

## [x] Task Section 2.6 API Error and Validation Contract
> Keep frontend simple by returning consistent response shapes.

### [x] Task subsection 2.6.1 Success response shape
> Use `{ data }` or direct JSON consistently > include enough metadata for UI state.

### [x] Task subsection 2.6.2 Error response shape
> Use `{ error: { code, message, details? } }` > map validation, auth, permission, not found, server errors.

### [x] Task subsection 2.6.3 Input validation
> Validate strings, IDs, roles, file sizes, file types > centralize reusable validators in `src/lib` or `src/utils`.

### [x] Task subsection 2.6.4 Security basics
> Escape unsafe content where rendered outside editor > avoid SQL injection by using prepared statements > avoid leaking private docs.

# [x] Epic 3 UI and Editor Experience
## [x] Task Section 3.1 Design System Setup
> Apply Lumina Productivity style from `docs/design.md` > keep app dense, clear, editor-focused.

### [x] Task subsection 3.1.1 Tailwind tokens
> Map colors from `docs/design.md` into global CSS/theme variables > use Inter > keep 4px spacing rhythm.

### [x] Task subsection 3.1.2 shadcn customization
> Customize base button, input, dialog, tabs, toast styles > use orange primary > warm neutral surfaces > 8-12px radius depending component.

### [x] Task subsection 3.1.3 Icons
> Use lucide icons for create, upload, save, share, rename, list, document, user, search, alert.

### [x] Task subsection 3.1.4 Toastify styling
> Use toastify for save success, upload success, share success, validation errors, API failures.

### [x] Task subsection 3.1.5 Responsive layout
> Desktop: sidebar document list + editor workspace > mobile: top user switcher + document list view + editor view.

## [x] Task Section 3.2 Onboarding and User Selection
> Make reviewer able to test sharing fast without real signup friction.

### [x] Task subsection 3.2.1 User selector screen
> Show seeded users > allow switching between Alice, Bob, Reviewer > show selected user in app shell.

### [x] Task subsection 3.2.2 Onboarding copy
> Keep concise > state supported upload types > state demo users > avoid feature tutorial clutter.

### [x] Task subsection 3.2.3 Onboarding edge cases
> No users from API > current session invalid > user switch fails > mobile layout.

## [x] Task Section 3.3 Dashboard and Document List
> Show owned and shared docs clearly > make creation and reopening obvious.

### [x] Task subsection 3.3.1 Document sections
> Add `Owned by me` section > add `Shared with me` section > show owner name for shared docs.

### [x] Task subsection 3.3.2 Document row
> Show title > owner > updated time > role badge > selected state > empty title fallback.

### [x] Task subsection 3.3.3 Create button
> Primary orange button with plus icon > creates new document > opens editor.

### [x] Task subsection 3.3.4 Upload/import button
> Upload icon button > opens file picker/dialog > supports `.txt` and `.md` > shows unsupported types clearly.

### [x] Task subsection 3.3.5 Empty states
> No owned docs > no shared docs > no search results if search added > API load failure.

### [x] Task subsection 3.3.6 List edge cases
> Long titles truncate cleanly > many docs scroll > duplicate titles allowed but distinguish by owner/date > loading skeleton.

## [x] Task Section 3.4 Rich Text Editor
> Use Toast UI editor > support required formatting > feel coherent and saveable.

### [x] Task subsection 3.4.1 Editor component
> Integrate Toast UI React wrapper or compatible client-only component > avoid SSR crash > load editor CSS.

### [x] Task subsection 3.4.2 Formatting support
> Bold > italic > underline if supported/configured > heading/text size variation > bulleted list > numbered list.

### [x] Task subsection 3.4.3 Title editor
> Inline title input > save title on blur or explicit save > show validation errors.

### [x] Task subsection 3.4.4 Save behavior
> Manual save button > optional autosave debounce if time allows > show dirty state > show saved timestamp.

### [x] Task subsection 3.4.5 Reopen behavior
> Select document from list > load content and title > preserve formatting > restore selected doc after refresh if possible.

### [x] Task subsection 3.4.6 Editor permissions
> Owner/editor can edit > viewer sees read-only editor > disabled toolbar in read-only mode > share button visible based on owner.

### [x] Task subsection 3.4.7 Editor edge cases
> New unsaved doc > save failure > network failure > switching docs with unsaved changes > empty content > very long content.

## [x] Task Section 3.5 Upload UI
> Product-relevant import flow > reviewer sees clear supported limits.

### [x] Task subsection 3.5.1 Import dialog
> Show supported formats `.txt`, `.md` > file size limit > selected file details > import action.

### [x] Task subsection 3.5.2 Import into new document
> Upload file > create document from file > title from file name > content from file text > open editor after success.

### [ ] Task subsection 3.5.3 Import history optional
> Show last imported file in document metadata if time allows > link to import row.

### [ ] Task subsection 3.5.3a Attachment/original-file UI optional
> Show attached/original upload file name if R2 storage is enabled > allow download link through authorized API route > hide R2 object keys from UI.

### [x] Task subsection 3.5.4 Upload UI edge cases
> Cancel file picker > unsupported type > oversize file > parse error > duplicate file name > mobile file picker.

## [x] Task Section 3.6 Sharing UI
> Owner can grant access by email > shared docs visible to other seeded user.

### [x] Task subsection 3.6.1 Share dialog
> Open from editor toolbar > input target email > choose role if editor/viewer supported > submit.

### [x] Task subsection 3.6.2 Existing shares list
> Show shared users > show role > show owner cannot be removed > optional revoke/update actions.

### [x] Task subsection 3.6.3 Shared state feedback
> Toast on success > inline error on invalid email > document list updates after share.

### [x] Task subsection 3.6.4 Sharing UI edge cases
> Share with current user > duplicate share > unknown email > not owner > shared user switches account and sees document.

## [x] Task Section 3.7 Navigation and App Shell
> Build first screen as usable app, not landing page.

### [x] Task subsection 3.7.1 App shell layout
> Header with product name, current user, user switch/logout > sidebar/list > editor surface.

### [x] Task subsection 3.7.2 Mobile navigation
> Compact list and editor views > back button from editor to docs > FAB create button if useful.

### [x] Task subsection 3.7.3 Accessibility basics
> Keyboard reachable buttons > labels for inputs > visible focus > sufficient color contrast > dialogs trap focus via shadcn.

### [x] Task subsection 3.7.4 Visual QA
> Check no text overlap > check mobile and desktop > check buttons fit text > check editor toolbar not clipped.

## [x] Task Section 3.8 Landing, Authentication, and URL-Aware Pages
> Extend Epic 3 so reviewer can see clear page intent from URL and authenticate with credential shared separately by project owner.

### [x] Task subsection 3.8.1 Landing page route
> Add `/` landing page > show product name, human workspace hero image, customer-facing easy/fast/organized benefit copy, and links to login/register/app.

### [x] Task subsection 3.8.2 Login page route
> Add `/login` > credential form > blank inputs with placeholders > no visible seed credential notice > redirect to requested app URL after login.

### [x] Task subsection 3.8.3 Registration page route
> Add `/register` > create user with display name/email/password > use Web Crypto password hashing > set session cookie after registration.

### [x] Task subsection 3.8.4 Credential auth API
> Add `POST /api/auth/login` > add `POST /api/auth/register` > keep no bcrypt > store PBKDF2 password hash and salt in D1.

### [x] Task subsection 3.8.5 URL-aware app pages
> Add `/app` document list route > add `/app/docs/:id/view` read-only route > add `/app/docs/:id/edit` edit route > sync editor navigation with browser history.

### [x] Task subsection 3.8.6 Page route documentation
> Document landing, login, register, app, view, and edit URLs > note seed credential is shared separately > do not display or prefill credential in UI.

# [ ] Epic 4 Integration and End-to-End Product Flow
## [ ] Task Section 4.1 Connect UI to API
> Wire fetch clients through small typed helpers > keep API calls reusable.

### [ ] Task subsection 4.1.1 API client helpers
> Create `src/lib/api-client` or feature-local client > handle JSON success/error > handle multipart upload.

### [ ] Task subsection 4.1.2 State management
> Use React state or lightweight store > track current user, docs list, selected doc, dirty editor, loading states.

### [ ] Task subsection 4.1.3 Refresh strategy
> After create/save/share/upload > refresh document list or update local cache > avoid stale owned/shared sections.

### [ ] Task subsection 4.1.4 Integration edge cases
> API unavailable > session expired mid-edit > slow save > repeated save clicks > upload while document loading.

## [ ] Task Section 4.2 User Journeys
> Verify each required journey works from browser.

### [ ] Task subsection 4.2.1 Onboarding journey
> Open app > choose seeded user > see dashboard > understand owned/shared docs.

### [ ] Task subsection 4.2.2 Creation journey
> Create document > rename > edit rich text > save > refresh > reopen > formatting remains.

### [ ] Task subsection 4.2.3 Viewing journey
> Switch to shared user > see shared document in shared section > open document > permission behavior correct.

### [ ] Task subsection 4.2.4 Updating/modification journey
> Edit existing document > save > switch away/back > reopen > changes persist > shared visibility updated if allowed.

### [ ] Task subsection 4.2.5 Upload journey
> Upload `.txt` or `.md` > new editable document opens > imported content persisted > import metadata stored.

### [ ] Task subsection 4.2.6 Sharing journey
> Owner opens share dialog > grants another seeded user access > switch to target user > target sees document.

## [ ] Task Section 4.3 Browser Verification
> Run app locally > inspect in browser > fix visible bugs before final.

### [ ] Task subsection 4.3.1 Start dev server
> Run local Astro dev or Wrangler dev > provide local URL > ensure no port conflict.

### [ ] Task subsection 4.3.2 Desktop browser check
> Check dashboard > editor > upload > share > refresh persistence > console errors.

### [ ] Task subsection 4.3.3 Mobile browser check
> Check small viewport > navigation > editor controls > dialogs > text fit.

### [ ] Task subsection 4.3.4 Worker preview check
> Run `wrangler-dev` or Worker preview path > verify D1 binding works > verify API routes work in Worker runtime.

# [ ] Epic 5 Testing
## [ ] Task Section 5.1 Unit Tests
> Add at least one meaningful automated test, preferably more for risky logic.

### [ ] Task subsection 5.1.1 Validation tests
> Test title validation > role validation > upload type validation > max size behavior.

### [ ] Task subsection 5.1.2 Permission tests
> Test owner access > shared user access > unauthorized user denied > owner cannot share with self.

### [ ] Task subsection 5.1.3 Content tests
> Test save payload preserves supported formatting > empty content allowed > oversized content rejected.

### [ ] Task subsection 5.1.4 Upload parser tests
> Test `.txt` import > `.md` import > unsupported extension rejected > empty file rejected.

## [ ] Task Section 5.2 API Integration Tests
> Add tests where D1/model abstraction can be mocked or local DB used quickly.

### [ ] Task subsection 5.2.1 Document service tests
> Create document > list owned/shared > rename > save content > get detail.

### [ ] Task subsection 5.2.2 Sharing service tests
> Grant share > duplicate share error > nonexistent email error > access appears in shared list.

### [ ] Task subsection 5.2.3 Upload service tests
> Import file creates document > import metadata recorded > parser errors recorded.

## [ ] Task Section 5.3 Manual QA Checklist
> Document what was manually verified for reviewer confidence.

### [ ] Task subsection 5.3.1 Required feature checklist
> Create, rename, edit, save, reopen > upload > share > owned/shared distinction > persistence.

### [ ] Task subsection 5.3.2 Error checklist
> Invalid title > unsupported upload > unknown share email > unauthorized open > API failure toast.

### [ ] Task subsection 5.3.3 Runtime checklist
> `npm run test` > `npm run check` > `npm run build` > Wrangler local/remote migration result.

# [ ] Epic 6 Documentation and Diagrams
## [ ] Task Section 6.1 README
> Make reviewer setup fast and unambiguous.

### [ ] Task subsection 6.1.1 Local setup
> Include install command > environment assumptions > local D1 migration command > dev command > test command.

### [ ] Task subsection 6.1.2 Reviewer credentials
> List seeded users > explain user switcher or login > show sharing test path.

### [ ] Task subsection 6.1.3 Supported upload types
> State `.txt` and `.md` supported > state `.docx` unsupported if not implemented > list file size limit > explain D1 stores document markdown/text/HTML and R2 bucket `sample-doc-editor-storage` stores original files or attachments.

### [ ] Task subsection 6.1.4 Deployment instructions
> Include root Cloudflare Worker deploy command > D1 remote migration command with no development env > R2 bucket binding `sample-doc-editor-storage` > live URL placeholder/result.

### [ ] Task subsection 6.1.5 Partial/incomplete section
> List working features > incomplete features > next 2-4 hour plan.

## [ ] Task Section 6.2 Architecture Note
> Explain product and engineering priorities concisely.

### [ ] Task subsection 6.2.1 Architecture overview
> Astro + React UI > Cloudflare Worker API > D1 persistence > Toast UI editor > API layering.

### [ ] Task subsection 6.2.2 Prioritization note
> Explain why MVP uses seeded users > why upload imports `.txt/.md` > why real-time collaboration deferred.

### [ ] Task subsection 6.2.3 Data model note
> Explain ownership, sharing, imports, content storage, R2 original/attachment storage, permission checks.

### [ ] Task subsection 6.2.4 Tradeoffs
> Document no Google Docs parity > no full auth if seeded user mode > no real-time multi-user editing unless stretch.

## [ ] Task Section 6.3 AI Workflow Note
> Meet AI-native workflow requirement.

### [ ] Task subsection 6.3.1 Tools used
> List Codex/ChatGPT or other AI tools used > include what each sped up.

### [ ] Task subsection 6.3.2 AI output changed or rejected
> Note any generated code/design rejected > explain manual judgment.

### [ ] Task subsection 6.3.3 Verification
> Explain tests, browser checks, build checks, migration checks, manual QA.

## [ ] Task Section 6.4 Mermaid Diagrams
> Add diagrams to docs or README > cover required user journeys and API-to-UI flow.

### [ ] Task subsection 6.4.1 Onboarding journey diagram
> Mermaid flowchart: app opens > user selects seeded account > dashboard loads > owned/shared docs display.

### [ ] Task subsection 6.4.2 Creation process journey diagram
> Mermaid flowchart: create > rename > edit > save > refresh > reopen.

### [ ] Task subsection 6.4.3 Viewing process journey diagram
> Mermaid flowchart: switch user > shared section > open shared doc > read/edit based on role.

### [ ] Task subsection 6.4.4 Updating/modification journey diagram
> Mermaid flowchart: open existing doc > modify title/content > save > D1 update > list timestamp changes.

### [ ] Task subsection 6.4.5 API-to-UI process flow diagram
> Mermaid sequence or flowchart: React UI > API route > controller > service > model > D1 > response > toast/UI state.

## [ ] Task Section 6.5 Submission Files
> Create final deliverables expected by assignment.

### [ ] Task subsection 6.5.1 `SUBMISSION.md`
> List source code > README > architecture note > AI workflow note > live URL > video URL file > screenshots/demo GIF if any.

### [ ] Task subsection 6.5.2 Walkthrough video URL file
> Add placeholder file if user records video later > include unchecked note if not created by Codex.

### [ ] Task subsection 6.5.3 Screenshots or demo GIF optional
> Capture key screens if time allows > dashboard > editor > share dialog > upload.

# [ ] Epic 7 Deployment
## [ ] Task Section 7.1 Cloudflare Worker Deployment
> Deploy working reviewer-accessible build via Cloudflare Worker.

### [ ] Task subsection 7.1.1 Verify Wrangler auth
> Run Wrangler command that needs auth > if not authenticated, ask user to login.

### [ ] Task subsection 7.1.2 Verify D1 binding
> Confirm `sample-doc-editor-database` binding id in root `wrangler.jsonc` > run `npm run wrangler-types` after config update.

### [ ] Task subsection 7.1.2a Verify R2 binding
> Confirm R2 bucket `sample-doc-editor-storage` exists > bind it in root `wrangler.jsonc` > run `npm run wrangler-types` after config update > smoke test authorized upload/download path when implemented.

### [ ] Task subsection 7.1.3 Run remote migration
> Apply schema and seed data to remote D1 > verify seeded users and docs exist.

### [ ] Task subsection 7.1.4 Deploy Worker
> Run deploy script > capture live URL > smoke test live URL.

### [ ] Task subsection 7.1.5 Deployment edge cases
> Missing D1 id > Wrangler not logged in > migration already applied > Worker build failure > environment mismatch.

## [ ] Task Section 7.2 Final Smoke Test
> Validate live product as reviewer would.

### [ ] Task subsection 7.2.1 Live creation test
> Create doc > save content > refresh > reopen.

### [ ] Task subsection 7.2.2 Live upload test
> Import `.txt` or `.md` > open created document > verify persisted.

### [ ] Task subsection 7.2.3 Live sharing test
> Share with seeded user > switch user > verify shared document appears.

### [ ] Task subsection 7.2.4 Live error test
> Try unsupported upload > try unknown share email > verify friendly errors.

# [ ] Epic 8 Stretch Work Only After Core Passes
## [ ] Task Section 8.1 Small Enhancements
> Add only if core MVP, tests, docs, and deploy are done.

### [ ] Task subsection 8.1.1 Autosave
> Debounced save > dirty indicator > last saved timestamp > conflict warning.

### [ ] Task subsection 8.1.2 Role-based sharing polish
> Viewer/editor roles fully enforced > role update > revoke share.

### [ ] Task subsection 8.1.3 Markdown export
> Export document content to `.md` > include filename from title.

### [ ] Task subsection 8.1.4 Version history
> Store document snapshots > show previous saves > restore snapshot.

### [ ] Task subsection 8.1.5 Real-time collaboration indicator
> Show fake or lightweight presence only if honest and documented > no true collaboration claim unless implemented.

### [ ] Task subsection 8.1.6 DOCX import
> Add `.docx` parser > preserve paragraphs/headings/lists if practical > document limitations.
