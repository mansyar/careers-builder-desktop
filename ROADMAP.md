# Development Roadmap

## Project: Careers Builder — Local AI-Powered CV Builder & Career Opportunity Searcher

**Stack:** Electron + Vite + React 19 + TypeScript + Tailwind CSS v4 + better-sqlite3 + sqlite-vec + @xenova/transformers + Vercel AI SDK

**Reference Documents:**
- `docs/PRD.md` — Product requirements
- `docs/TDD.md` — Technical design, IPC channels, database schema
- `docs/SCREENS.md` — Wireframes for every screen and state

---

## Setup & Commands

```bash
# Install dependencies
pnpm install

# Development (HMR for renderer, auto-restart for main)
pnpm dev

# Run tests
pnpm test              # Unit + integration (Vitest)
pnpm test:e2e          # E2E (Playwright + Electron)

# Build for production
pnpm build             # Production build
pnpm package           # Package into installer (.exe / .dmg / .AppImage)

# Type checking
pnpm typecheck
```

---

## Phase 1: 🏗️ Project Scaffold + Electron Shell

**Goal:** Launch the app, see the window, navigate between pages.

### What gets built

#### Project Setup
- [ ] Initialize electron-vite project with React 19 + TypeScript strict mode
- [ ] Configure Tailwind CSS v4
- [ ] Set up Electron main/renderer/preload process structure
- [ ] Configure electron-builder for cross-platform packaging (Windows NSIS, macOS dmg, Linux AppImage)
- [ ] Set up Vitest + @vitest/coverage-v8
- [ ] Set up ESLint + Prettier + Husky + lint-staged
- [ ] Create `.gitignore`, `tsconfig.json` for each process

#### Electron Shell
- [ ] Main process: create `BrowserWindow` (default size, min size, title)
- [ ] Preload script: empty `contextBridge.exposeInMainWorld('electronAPI', {})` shell
- [ ] Renderer: mount React app, apply Tailwind base styles
- [ ] Security: enable `contextIsolation`, disable `nodeIntegration`, enable `sandbox`
- [ ] Content Security Policy header

#### Navigation (React Router v7)
- [ ] Three routes: `/` (Home), `/cv-builder` (CV Builder), `/job-search` (Job Search)
- [ ] Persistent sidebar component with navigation links (Home, CV Builder, Job Search, Settings)
- [ ] Active route highlighting
- [ ] Responsive sidebar: collapses to hamburger toggle on viewports < 768px with slide animation + backdrop overlay
- [ ] Placeholder page content for each route

#### Settings Modal Shell
- [ ] Settings button in sidebar
- [ ] Dismissable modal component (will be populated in Phase 2)

#### Testing
- [ ] Write first Vitest test (e.g., sidebar renders)
- [ ] Verify test suite runs with `pnpm test`
- [ ] E2E: App launches, window appears with correct title

### Verification

```
User can:
✅ Run pnpm dev → Electron window opens
✅ See sidebar with Home, CV Builder, Job Search, Settings
✅ Click each nav item → route changes, active highlight updates
✅ Resize to < 768px → sidebar collapses to hamburger
✅ Click hamburger → sidebar slides in with backdrop
✅ Run pnpm test → tests pass
```

### Key decisions for AI agent

| Concern | Decision |
|---------|----------|
| Window size | Default 1200×800, min 900×600 |
| Title | "Careers Builder" |
| Main process entry | `src/main/index.ts` |
| Preload entry | `src/preload/index.ts` |
| Renderer entry | `src/renderer/index.tsx` |
| Router | React Router v7, `createBrowserRouter` |
| Package manager | pnpm v10+ |

---

## Phase 2: 💾 Database + Provider Setup + Manual CV Editor

**Goal:** Launch the app, configure AI provider, create and save a CV manually.

### What gets built

#### Database (Main Process)
- [ ] Install better-sqlite3 + sqlite-vec + @xenova/transformers (model downloads later)
- [ ] DatabaseManager singleton — configurable path, `:memory:` support for tests
- [ ] Migration system: idempotent DDL (`IF NOT EXISTS`) for all tables:
  - Structural: `users`, `cv_profiles`, `cv_profile_versions`, `job_postings`
  - Vector: `vec_cv_profile_versions`, `vec_job_postings`
- [ ] Initialize database on app boot (main process startup)
- [ ] Debug IPC channel: `debug:db-query` (test-only, SELECT only)

#### Provider Settings
- [ ] IPC channel: `settings:load` — load saved provider config
- [ ] IPC channel: `settings:save` — save provider config (encrypt API key with AES-256-GCM)
- [ ] IPC channel: `settings:test` — test connection via `GET {baseUrl}/models` (accepts optional `{ apiKey?, baseUrl? }` for unsaved credentials)
- [ ] First-run wizard (2 steps):
  - Step 1: API Key + Provider URL → Test Connection
  - Step 2: Model ID dropdown
  - Wizard is non-dismissable until valid settings saved
- [ ] Settings modal (reuses same form, dismissable):
  - Edit provider config
  - Test Connection button
  - Data section: database location, version/sweep/cache stats
  - Clear Job Cache button
  - Reset Job Feedback button
  - Export All Data button
  - About section (app version, tech stack)
- [ ] Default provider: `https://api.openai.com/v1`, model `gpt-4o`

#### CV Profile & Manual Editor
- [ ] IPC channel: `cv:create` — create CV profile + first empty version
- [ ] IPC channel: `cv:list-versions` — list versions for a profile
- [ ] IPC channel: `cv:get-version` — get single version with `full_cv_json`
- [ ] IPC channel: `cv:update-version` — deep merge patch, copy-on-write (active version → new row, historical → in-place)
- [ ] Auto-create CV profile on first visit to `/cv-builder`
- [ ] Manual CV editor form (6 collapsible sections, all open by default):
  - **Contact:** name (required), email, phone, location, LinkedIn URL, website URL
  - **Executive Summary:** textarea with 500-word counter + over-limit warning
  - **Experience:** repeatable entries — company, role, location, start/end dates, "Currently working here" checkbox (hides endDate), add/remove/reorder, description (one bullet per line)
  - **Education:** repeatable entries — institution, degree, field, start/end dates, GPA
  - **Skills:** tag input — type + Enter to add, click X to remove, case-insensitive duplicate prevention
  - **Projects:** repeatable entries — name, role, description, technologies (tag input), URL
- [ ] Save button: calls `cv:update-version` IPC → inline "Saved!" badge (auto-fades 2s)
- [ ] Offline: form fields editable, save disabled with "Come back online" tooltip when `navigator.onLine === false`
- [ ] Loading state: skeleton shimmer while data loads

#### Testing
- [ ] Unit tests: DB helpers, migration system, encryption, deep merge utility
- [ ] Integration tests: create profile → update version → get version → copy-on-write immutability
- [ ] Integration tests: settings save/load/test with mock LLM
- [ ] E2E: first-run wizard → save settings → dismiss → reopen settings → edit
- [ ] E2E: fill all 6 form sections → save → reload → verify data persists

### Verification

```
User can:
✅ Launch app → wizard appears (no API key)
✅ Enter API key + URL → Test Connection → succeeds
✅ Select model → Save & Continue → wizard dismisses → Home screen
✅ Navigate to CV Builder → empty form with 6 sections
✅ Fill Contact, Summary, Experience (add 2 roles), Education, Skills, Projects
✅ Click Save → "Saved!" badge appears
✅ Reload app → form shows saved data
✅ Go offline → form still editable, save disabled with tooltip
✅ Open Settings → edit provider, test connection, see DB stats
✅ Run pnpm test → all tests pass
```

### Key decisions for AI agent

| Concern | Decision |
|---------|----------|
| DB path (dev) | `./vault_data/local_vault.db` |
| DB path (production) | OS app data dir (see TDD §9) |
| Secret file | `{data_dir}/.secret` (64 random bytes, created on first run) |
| CV profile ID storage | `localStorage` in renderer |
| Version label | User-provided on save, or auto-generated "Version N" |

---

## Phase 3: 💬 AI Chat Interview

**Goal:** Have an AI-guided conversation that extracts CV sections into the form.

### What gets built

#### LLM Integration
- [ ] Install Vercel AI SDK (`ai` v6, `@ai-sdk/openai` v3, `@ai-sdk/react`)
- [ ] IPC channel: `chat:stream` — streaming chat via `streamText()`
  - Load provider settings from DB, construct OpenAI-compatible client
  - Stream tokens back through IPC event channel
  - Error handling: 400 `PROVIDER_NOT_CONFIGURED`, 502 `PROVIDER_UNAVAILABLE`
- [ ] IPC channel: `chat:extract` — structured section extraction via `generateObject()`
  - Zod schemas for each of the 6 sections (see TDD §4 for full schemas)
  - Insert extracted data as new CV version (copy-on-write)
  - Return parsed + persisted result

#### Chat UI
- [ ] Chat panel component (left side of split view on wide, top on narrow):
  - Scrollable message list (AI left-aligned, user right-aligned)
  - Streaming cursor animation during AI response
  - Auto-scroll to latest message
  - Input field: textarea, Enter to send, disabled during streaming
  - Empty state: welcome message ("I'll be your executive resume writer...")
- [ ] Error states:
  - Connection lost banner with Retry button
  - Missing provider placeholder with "Open Settings" button
- [ ] "Done — extract this section" button:
  - Disabled during active conversation
  - Enabled when AI confirms section readiness
  - Loading state during extraction (2-5 seconds)
  - Success → form populates + AI moves to next section

#### Interview Flow
- [ ] Section order: Contact → Executive Summary → Experience → Education → Skills → Projects
- [ ] System prompt: executive resume writer, guide section by section, one question at a time
- [ ] Returning user flow: AI checks form state, identifies first incomplete section, starts there
- [ ] Skip: user says "skip education" → AI acknowledges, moves on
- [ ] Go back: user says "add more to experience" → AI returns to that section
- [ ] All sections complete → chat shows "Your CV is complete!" with action buttons

#### Split Layout (CV Builder Edit Tab)
- [ ] Tab bar: `[ ✏️ Edit ]` | `[ 🎨 Preview ]` (Preview tab built in Phase 4)
- [ ] Edit tab: chat panel (left, 2/5 width) + CV form (right, 3/5 width)
- [ ] On narrow viewports: chat on top, form below (stacked)
- [ ] Form panel scrolls independently
- [ ] After interview completes, "Preview your CV" button activates Preview tab
- [ ] Chat does NOT persist — only CV data survives session restarts

#### No-Chat Persistence Rule
- [ ] Navigating away from CV Builder discards chat history
- [ ] Returning starts a new chat session
- [ ] AI detects completed sections from form state
- [ ] Rationale: "the form is your source of truth"

#### Testing
- [ ] Unit tests: chat handler — valid streaming, missing API key (400), LLM unreachable (502)
- [ ] Integration tests: chat:extract with each section schema
- [ ] Component tests: ChatPanel — empty state, messages, streaming, input, error retry, missing provider, extract button
- [ ] E2E: full interview flow — type answers → extract sections → verify form populated → verify DB saved

### Verification

```
User can:
✅ Navigate to CV Builder → chat starts with welcome message
✅ Type name, email, phone → AI responds naturally
✅ Click "Done — extract this section" → Contact form fills in
✅ Continue through Executive Summary, Experience, Education, Skills, Projects
✅ Say "skip education" → AI moves to Skills
✅ Say "add more to experience" → AI returns to Experience
✅ Complete all 6 sections → "Your CV is complete!" message appears
✅ Close app, reopen → form shows saved data, new chat starts fresh
✅ Disconnect internet → error banner with Retry button
✅ Click Open Settings → configure provider → back to chat
✅ Run pnpm test → all tests pass
```

### Key decisions for AI agent

| Concern | Decision |
|---------|----------|
| Chat persistence | None — only CV data persists |
| Extraction trigger | User clicks "Done — extract this section" |
| Extraction method | `generateObject()` with per-section Zod schema |
| Error retry | Exponential backoff, max 3 attempts |
| LLM adapter | `@ai-sdk/openai` (any OpenAI-compatible endpoint) |
| System prompt | "Executive resume writer, section by section, one question at a time" |

---

## Phase 4: 🎨 Template Preview + PDF Export

**Goal:** Preview your CV in multiple templates and export as a pixel-perfect PDF.

### What gets built

#### Template Rendering
- [ ] IPC channel: `cv:preview` — render template to HTML string via `renderToString`
  - Load CV data from DB by version ID
  - Inject CV JSON as props into the template React component
  - Wrap in minimal provider shell (no full router needed)
  - Inject template CSS
  - Return complete HTML string
- [ ] 3 template components (React):
  - **Modern Minimalist:** Clean, lots of whitespace, left-aligned, sans-serif
  - **Executive Traditional:** Two-column, serif fonts, formal layout
  - **Creative Tech:** Accent colors, skill bars, modern typography
- [ ] Each template renders: name, contact, summary, experience, education, skills, projects

#### Preview Tab
- [ ] Preview tab in CV Builder: `[ Edit ] [ 🎨 Preview ]`
- [ ] Template selector dropdown (3 templates)
- [ ] Live preview: switch template → re-renders instantly (< 500ms)
- [ ] Paper proportion display (A4 ratio: 1:1.414)
- [ ] "Back to Edit" button switches to Edit tab
- [ ] "Preview your CV" button in Edit tab after interview completes

#### PDF Export
- [ ] IPC channel: `cv:export-pdf` — generate PDF via `BrowserWindow.webContents.printToPDF()`
  - Render template to HTML (same as preview)
  - Create hidden `BrowserWindow`, load HTML via `data:` URI
  - Call `webContents.printToPDF({ format, printBackground: true })`
  - Return PDF buffer to renderer
- [ ] Paper size selector: A4 / Letter
- [ ] Native save dialog (`dialog.showSaveDialog`) for destination
- [ ] Error handling: retry button if PDF fails

#### Testing
- [ ] Unit tests: template rendering (each template with sample data)
- [ ] Integration tests: PDF output has expected text content and page count (via `pdf-parse`)
- [ ] E2E: complete CV → preview each template → switch instantly → export PDF → verify file saved

### Verification

```
User can:
✅ Complete a CV (or use manually entered data)
✅ Click Preview tab → CV renders in Modern Minimalist template
✅ Switch to Executive Traditional → re-renders instantly
✅ Switch to Creative Tech → re-renders instantly
✅ Select A4 → preview updates proportions
✅ Click Export PDF → save dialog appears → save → open PDF
✅ PDF has selectable text, multi-page if needed, ATS-compliant
✅ Click Back to Edit → returns to form
✅ Run pnpm test → all tests pass
```

### Key decisions for AI agent

| Concern | Decision |
|---------|----------|
| PDF engine | `BrowserWindow.webContents.printToPDF()` |
| HTML delivery | `data:text/html;charset=utf-8,...` URI |
| Paper sizes | A4 (210×297mm), Letter (216×279mm) |
| Templates are | React components, rendered via `renderToString` in main process |
| No Playwright | Electron's built-in Chromium handles everything |

---

## Phase 5: 🔍 Job Search — Scraping + Matching + Feedback

**Goal:** Scrape job boards, match against your CV, give feedback, and iterate.

### What gets built

#### Local Embeddings (Main Process)
- [ ] Initialize `@xenova/transformers` pipeline with `all-MiniLM-L6-v2` (singleton)
- [ ] On first use: download model from Hugging Face (~90 MB), cache at `{data_dir}/models/`
- [ ] Graceful degradation: if download fails, embedding features show unavailable state
- [ ] CV embedding: embed `full_cv_json` text → 384-dim vector → store in `vec_cv_profile_versions`
- [ ] Job embedding: embed `description_raw` → 384-dim vector → store in `vec_job_postings` (max 3 concurrent via `p-limit`)

#### Web Scraping (Main Process)
- [ ] Hidden `BrowserWindow` instances for scraping (one per source)
- [ ] Evasion defaults: user-agent masking, request spacing (500ms between requests per source)
- [ ] Per-source timeout: 30 seconds (configurable)
- [ ] Source definitions (example — configurable):
  - Remote OK: parse listing pages for title, company, location, description
  - We Work Remotely: similar structure
  - Hacker News "Who's Hiring": parse thread comments
- [ ] Error handling: failed sources → mark as unreachable, continue with remaining
- [ ] Rate-limit detection (HTTP 429) → skip source for remainder of sweep

#### Job Search UI
- [ ] IPC channel: `jobs:sweep` — start career sweep (background worker via `p-queue`)
- [ ] IPC channel: `jobs:poll` — poll sweep progress and results
- [ ] IPC channel: `jobs:last-sweep` — retrieve last sweep results (survives restarts)
- [ ] IPC channel: `jobs:feedback` — store thumbs up/down
- [ ] IPC channel: `data:export-results` — export results as CSV or JSON

#### Job Search Screens
- [ ] **Empty state:** "You need a CV first. Create one to start matching jobs." with redirect button
- [ ] **Initial state:** CV profile selector (dropdown of saved versions), source toggles (auto-selected based on CV), "Start Career Sweep" button
- [ ] **Sweep in progress:** progress bars (found/embedded/matched), per-source status (✅🔄⏳❌), partial results as they come in, Cancel button
- [ ] **Results view:**
  - Search & filter bar: keyword search, location filter, company filter (client-side, instant)
  - Result cards: title, company, location, match score (%), AI rationale, missing skills, salary range, posting date, thumbs up/down, "View Original" link
  - Pagination for large result sets
  - Action bar: [New Sweep] [Adjust CV 🎯] [Export Results]
- [ ] **Feedback re-sort:** clicking 👍/👎 instantly re-sorts results (liked up, disliked down) + stores for future sweeps

#### Adjust CV Flow
- [ ] "Adjust CV" button → opens CV Builder Edit tab
- [ ] New chat session starts with AI prompt: "I analyzed your top matches. Missing skills: [list]. Do you have experience with any of these?"
- [ ] User confirms → AI adds skills to Skills section and/or updates experience descriptions
- [ ] Saves as new CV version

#### Testing
- [ ] Unit tests: embedding adapter, vector query builder
- [ ] Integration tests: scraping against static HTML fixtures (no live URLs)
- [ ] Integration tests: full sweep flow — embed CV → scrape fixture → embed jobs → vector match → rank results
- [ ] E2E: mock IPC responses → verify results render with match scores and insights
- [ ] E2E: click thumbs up/down → verify re-sort and stored feedback

### Verification

```
User can:
✅ Navigate to Job Search without CV → see "Create CV first" message
✅ Create CV → go to Job Search → see profile selector with version
✅ Toggle sources on/off → click Start Sweep
✅ Watch progress: sources complete, results stream in
✅ See ranked results with match scores, rationale, missing skills, salary
✅ Search by keyword → results filter instantly
✅ Filter by location → results filter
✅ Click 👍 on a result → it moves up, 👎 → moves down
✅ Click View Original → opens in browser
✅ Click Adjust CV → chat starts with missing skills analysis
✅ Confirm a skill → AI updates CV → new version saved
✅ Export Results as CSV → file downloads
✅ Close app, reopen → Job Search shows last sweep results
✅ Run pnpm test → all tests pass
```

### Key decisions for AI agent

| Concern | Decision |
|---------|----------|
| Embedding model | `all-MiniLM-L6-v2` (384-dim) |
| Max concurrent embeddings | 3 |
| Vector engine | `sqlite-vec` `MATCH` (cosine distance) |
| Result ranking | Strictly by match score (lower cosine distance = better) |
| Feedback storage | Per job + per CV version, boolean liked/disliked |
| Search & filter | Client-side, instant, on existing result set |
| Sweep replaces old | Yes — new sweep replaces previous results |

---

## Phase 6: 🏠 Home Screen + Polish + Final Integration

**Goal:** A polished, complete desktop app experience.

### What gets built

#### Hybrid Home Screen
- [ ] **First-time user:** Two CTA cards (Build Your CV / Search Jobs), Search Jobs shows "Create CV First" when no profile exists, tip to start with CV
- [ ] **Returning user:**
  - Greeting with user's name (from CV)
  - Stats cards: CV progress (X/6 sections), saved version count, recent job match count
  - "Resume where you left off" card → last active section → [Continue Interview] [Edit CV Directly]
  - Recent job matches (top 3 from last sweep) with thumbs up/down
  - [View All Results →] links to Job Search
- [ ] Status bar at bottom: provider connection status (● green / ⚠ yellow / ❌ red dot) + app version

#### Error States (All Screens)
- [ ] Offline banner: "📡 You're offline. CV editing and PDF export still work."
- [ ] Connection lost banner (chat): retry + open settings buttons
- [ ] Missing provider banner (chat): "Set up your API key" + open settings button
- [ ] Loading skeletons: shimmer animation for data-dependent screens
- [ ] Error toast: generic failure notification with retry/action button

#### Settings Enhancements
- [ ] Clear Job Cache: deletes all job postings, vectors, sweep history
- [ ] Reset Job Feedback: clears all thumbs up/down history
- [ ] Export All Data: exports entire database as JSON

#### Final Integration & Testing
- [ ] All IPC channels wired end-to-end
- [ ] All error states connected and tested
- [ ] Responsive design verified at all breakpoints
- [ ] Offline mode verified (CV editing + PDF export)
- [ ] E2E: full user journey — first launch → wizard → interview → preview → export → job search → feedback → adjust CV
- [ ] E2E: all error states (offline, missing provider, connection lost, scrape failure)

### Verification

```
User can:
✅ First launch → see Home with two CTA cards → tip to start with CV
✅ Create CV + run interview → Home now shows dashboard:
   CV: X/6 sections, version count, recent matches, resume card
✅ Click Continue Interview → goes to CV Builder at correct section
✅ View All Results → goes to Job Search with last sweep
✅ Status bar shows provider connection status
✅ Disconnect internet → offline banner appears → edit CV works → save disabled
✅ Kill network during chat → error banner → Retry works
✅ Open Settings → Clear Cache → Reset Feedback → all work
✅ Run pnpm test → all tests pass
✅ Run pnpm build → builds successfully
```

---

## Summary

| Phase | Scope | Testable Outcome |
|-------|-------|------------------|
| **1. Scaffold + Shell** | electron-vite, sidebar, routing | Window opens, navigate between pages |
| **2. Data + CV Editor** | DB, wizard, 6-section form, save/load | Configure provider, create CV manually |
| **3. AI Chat Interview** | LLM streaming, extraction, form population | Chat with AI, extract sections into CV |
| **4. Templates + PDF** | 3 templates, preview tab, PDF export | Preview templates, export PDF |
| **5. Job Search** | Scraping, embeddings, matching, feedback, adjust | Sweep jobs, rank by match, give feedback |
| **6. Home + Polish** | Dashboard, error states, settings, E2E | Complete polished experience |

Each phase depends on the previous one. Build in order, verify the testable outcome before moving on.
