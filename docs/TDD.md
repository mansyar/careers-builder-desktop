# Technical Design Document (TDD)
## Project: Local AI-Powered CV Builder & Career Opportunity Searcher

---

## 1. System Architecture

A native Electron desktop application using a two-process model: a **main process** (Node.js) for data, AI, and I/O operations, and a **renderer process** (Chromium) for the React UI. Inter-Process Communication (IPC) via Electron's `contextBridge` + `ipcMain`/`ipcRenderer` bridges typed channels between the two.

Conversational logic is dispatched via secure TLS to external cloud LLM providers through the Vercel AI SDK. Data orchestration, state persistence, vector embeddings, and web parsing are executed entirely in the main process.

```
┌─────────────────────────────────────────────────────────┐
│                    Electron App                          │
│                                                          │
│  ┌─────────────────────────┐  ┌──────────────────────┐  │
│  │     Main Process         │  │   Renderer Process   │  │
│  │     (Node.js)            │  │   (Chromium)         │  │
│  │                          │  │                      │  │
│  │  better-sqlite3          │  │  React (Vite HMR)    │  │
│  │  sqlite-vec              │  │  React Router v7     │  │
│  │  @xenova/transformers    │  │  Vercel AI SDK UI    │  │
│  │  Vercel AI SDK Core      │  │                      │  │
│  │  @ai-sdk/openai          │  │                      │  │
│  │  LLM client              │  │                      │  │
│  │  PDF export (Chromium)   │  │                      │  │
│  │  Web scraping (Chromium) │  │                      │  │
│  └──────────┬──────────────┘  └──────────┬───────────┘  │
│             │                            │              │
│             └────────── IPC ─────────────┘              │
│                  (preload bridge)                       │
└─────────────────────────────────────────────────────────┘
```

---

## 2. System Component Specifications

### Build & Packaging Layer
- **App Framework:** Electron (latest stable). Main + renderer + preload processes.
- **Build Tool:** electron-vite — purpose-built Vite integration for Electron. Handles main process TypeScript compilation, renderer HMR, and preload script bundling.
- **Packaging:** electron-builder — produces `.exe` (NSIS), `.dmg`, `.AppImage` per-platform installers.
- **UI Framework:** React 19 with TypeScript strict mode.
- **Routing:** React Router v7 (client-side only, no SSR).
- **Styling:** Tailwind CSS v4.

### Main Process (Node.js backend)
- **AI Coordination (LLM):** Vercel AI SDK Core (`ai` v6) — `streamText` for streaming chat, `generateObject` for structured extraction. Adapter: `@ai-sdk/openai` (v3) for OpenAI-compatible endpoints.
- **Relational Engine:** `better-sqlite3` embedded in the main process.
- **Vector Engine:** `sqlite-vec` extension loaded dynamically into SQLite at boot.
- **Embeddings Processor:** `@xenova/transformers` running `all-MiniLM-L6-v2` (unquantized) in-memory via ONNX. Maps text into 384-dimensional vector space.
- **Model Lifecycle:** The ONNX model (~90 MB) auto-downloads from Hugging Face Hub on first `pipeline()` call, cached at `{app_data}/models/all-MiniLM-L6-v2/`. Download failure gracefully degrades — embedding-dependent features show an unavailable state rather than crashing.
- **Embedding Pipeline:** Singleton to avoid reloading the model per batch. Jobs embedded with controlled concurrency (max 3 concurrent via `p-limit`, configurable in settings).

### Renderer Process (React UI)
- **Chat UI:** Vercel AI SDK UI (`@ai-sdk/react`) — `useChat` hook for streaming conversation. Stream received via custom data channel bridged over IPC.
- **CV Editor:** Split-pane layout with chat panel (left/top) and manual CV form (right/bottom). React Router drives view navigation.
- **Template Preview:** React components rendered to DOM, styled with Tailwind CSS. For PDF export, the same template is serialized to HTML string and sent to the main process via IPC.

### PDF Export
- Uses `BrowserWindow.webContents.printToPDF()` — Electron's built-in Chromium renders the template HTML directly. No Playwright dependency required.
- Flow: renderer sends HTML string + template CSS + paper size via IPC → main process creates a hidden `BrowserWindow`, loads the HTML via `loadURL` with a `data:` URI, calls `webContents.printToPDF()`, returns the PDF buffer to the renderer for save dialog.

### Web Scraping
- Uses a hidden `BrowserWindow` in the main process. Loads job page URLs, waits for content, extracts data via `webContents.executeJavaScript()`.
- No Playwright dependency — Electron's own Chromium handles all rendering.
- Evasion defaults: user-agent masking, request spacing, per-source timeouts.

---

## 3. Database Schema (SQLite Dialect)

Identical to the original design. Runs in the Electron main process only.

### Structural Tables

#### `users` Table
| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP |
| `target_settings` | TEXT | JSON: API keys, target locations, remote flags |

#### `cv_profiles` Table
| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| `user_id` | INTEGER | FK REFERENCES users(id) |
| `active_version_id` | INTEGER | FK REFERENCES cv_profile_versions(id), NULLABLE |

#### `cv_profile_versions` Table
| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| `cv_profile_id` | INTEGER | FK REFERENCES cv_profiles(id) |
| `version_number` | INTEGER | Sequential per profile |
| `version_label` | TEXT | e.g., "Software Engineer - Core V2" |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP |
| `full_cv_json` | TEXT | Structured JSON: personal, experience, education, skills |

#### `job_postings` Table
| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| `source_url` | TEXT | UNIQUE |
| `title` | TEXT | |
| `company` | TEXT | |
| `location` | TEXT | |
| `description_raw` | TEXT | |
| `scraped_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP |

### Virtual Vector Tables

#### `vec_cv_profile_versions` (`USING vec0`)
| Column | Type | Notes |
|--------|------|-------|
| `cv_version_id` | INTEGER PRIMARY KEY | FK REFERENCES cv_profile_versions(id) |
| `biography_embedding` | float[384] | |

#### `vec_job_postings` (`USING vec0`)
| Column | Type | Notes |
|--------|------|-------|
| `job_id` | INTEGER PRIMARY KEY | |
| `description_embedding` | float[384] | |

---

## 4. IPC Channel Specifications

All main↔renderer communication uses typed IPC channels defined in a shared schema. The renderer accesses these through a preload script that exposes a `window.electronAPI` object via `contextBridge`.

### Channel Catalog

| Channel | Direction | Payload (Renderer→Main) | Response (Main→Renderer) |
|---------|-----------|------------------------|--------------------------|
| `chat:stream` | renderer→main (streaming) | `{ messages: UIMessage[] }` | Stream of `UIMessage` chunks |
| `chat:extract` | renderer→main | `{ messages, section, cvProfileId }` | `{ section, data, cvProfileId }` |
| `cv:create` | renderer→main | `{}` | `{ id, activeVersionId }` |
| `cv:list-versions` | renderer→main | `{ cvProfileId }` | `{ versions, activeVersionId }` |
| `cv:get-version` | renderer→main | `{ cvProfileId, versionId }` | `{ id, versionNumber, versionLabel, createdAt, full_cv_json }` |
| `cv:update-version` | renderer→main | `{ cvProfileId, versionId, patch, versionLabel? }` | `{ id, versionNumber, versionLabel, createdAt, full_cv_json }` |
| `cv:preview` | renderer→main | `{ cvVersionId, templateId }` | HTML string (SSR-rendered template) |
| `cv:export-pdf` | renderer→main | `{ cvVersionId, templateId, paperSize }` | `Uint8Array` (PDF buffer) |
| `settings:load` | renderer→main | `{}` | `{ provider: { apiKey?, baseUrl?, modelId? } }` |
| `settings:save` | renderer→main | `{ provider: { apiKey, baseUrl, modelId } }` | `{ success: true }` |
| `settings:test` | renderer→main | `{ apiKey?, baseUrl? }` | `{ success: boolean, error?: string }` |
| `jobs:sweep` | renderer→main | `{ cvVersionId }` | `{ sweepId, status: "started" }` |
| `jobs:poll` | renderer→main | `{ sweepId }` | `{ status, progress, results? }` |
| `jobs:last-sweep` | renderer→main | `{ cvVersionId }` | `{ sweepId, status, progress, results? }` or `null` |
| `jobs:feedback` | renderer→main | `{ jobId, cvVersionId, liked: boolean }` | `{ success: true }` |
| `data:export-results` | renderer→main | `{ sweepId, format: "csv" \| "json" }` | `Uint8Array` (file buffer) |
| `data:clear-cache` | renderer→main | `{ cacheType: "jobs" \| "all" }` | `{ success: true, freedBytes: number }` |
| `debug:db-query` | renderer→main (test only) | `{ sql: string }` | `{ rows: unknown[] }` |

### Detailed Channel Specifications

#### `chat:stream` — Conversational Interview
```
Renderer sends:  { messages: UIMessage[] }
Main responds:   Stream of text delta chunks (progressively building a UIMessage)
```
- Main process calls `streamText()` with the conversation history via `@ai-sdk/openai`.
- Streams text deltas back to the renderer using `response.write()` on the IPC event.
- Error cases: `PROVIDER_NOT_CONFIGURED` (no API key saved), `PROVIDER_UNAVAILABLE` (LLM unreachable).

#### `chat:extract` — Structured Section Extraction
```
Renderer sends:  { messages: UIMessage[], section: string, cvProfileId: number }
Main responds:   { section: string, data: Record<string, unknown>, cvProfileId: number }
```
- Main process calls `generateObject()` with a Zod output schema matching the target section.
- Validated data is inserted as a new `cv_profile_versions` row with copy-on-write semantics.
- Returns the parsed and persisted result.

#### `cv:update-version` — Manual CV Edit
```
Renderer sends:  { cvProfileId: number, versionId: number, patch: Record<string, unknown>, versionLabel?: string }
Main responds:   { id: number, versionNumber: number, versionLabel: string | null, createdAt: string, full_cv_json: Record<string, unknown> }
```
- Applies deep merge of `patch` into the existing `full_cv_json`.
- Copy-on-write: editing the active version creates a new version row (immutability). Editing a historical version mutates in-place.
- Error codes: `NOT_FOUND`, `BAD_REQUEST`, `CONFLICT`.

#### `cv:export-pdf` — PDF Generation
```
Renderer sends:  { cvVersionId: number, templateId: string, paperSize: "A4" | "Letter" }
Main responds:   Uint8Array (PDF buffer)
```
- Main process renders the template React component to HTML via `renderToString`.
- Creates a hidden `BrowserWindow`, loads the HTML with template CSS via `data:` URI.
- Calls `webContents.printToPDF({ format: paperSize, printBackground: true })`.
- Returns the resulting PDF buffer to the renderer, which triggers a save dialog.

#### `jobs:sweep` / `jobs:poll` — Career Sweep
```
Sweep send:    { cvVersionId: number }
Sweep respond: { sweepId: string, status: "started" }

Poll send:     { sweepId: string }
Poll respond:  { status: "running" | "complete" | "failed", progress: { scraped, embedded, matched }, results?: Array<{...}> }
```
- Main process enqueues a sweep job using an in-process `p-queue` worker.
- Embeds the active CV via `@xenova/transformers`, spawns hidden `BrowserWindow` instances for scraping, embeds each job posting (max 3 concurrent), runs `sqlite-vec` `MATCH` query, and produces ranked results with AI-generated insights.

#### `jobs:last-sweep` — Retrieve Last Sweep Results
```
Renderer sends:  { cvVersionId: number }
Main responds:   { sweepId, status, progress, results } | null
```
- Returns the most recent sweep for the given CV version, or `null` if no sweep has been run yet.
- Used when the user returns to Job Search to restore the last session's results.
- Same response shape as `jobs:poll` — renderer can use the same display logic.

#### `jobs:feedback` — Job Result Feedback
```
Renderer sends:  { jobId: number, cvVersionId: number, liked: boolean }
Main responds:   { success: true }
```
- Stores user thumbs up/down in the database, linked to both the job posting and the CV version used.
- Affects current sweep ranking (instant re-sort) and future sweep weighting.

#### `data:export-results` — Export Sweep Results
```
Renderer sends:  { sweepId: string, format: "csv" | "json" }
Main responds:   Uint8Array (file buffer)
```
- Main process queries the sweep results from the database, formats them, and returns the file buffer.
- Renderer triggers a native save dialog via Electron's `dialog.showSaveDialog()`.

#### `data:clear-cache` — Clear Cached Data
```
Renderer sends:  { cacheType: "jobs" | "all" }
Main responds:   { success: true, freedBytes: number }
```
- `"jobs"`: Deletes all job postings, vectors, and sweep history. Preserves CV data and settings.
- `"all"`: Deletes everything except settings (CV versions, jobs, sweeps, feedback).

#### `debug:db-query` — Read-Only SQL Query (Test Only)
```
Renderer sends:  { sql: string }
Main responds:   { rows: unknown[] }
```
- Only available in dev/test builds. Stripped from production builds at compile time.
- Used by E2E tests to verify database state without exposing a full debug endpoint.
- Only accepts `SELECT` queries — rejects any DML/DDL.

### Extraction Schemas (Per-Section Zod)

Each section extraction uses a dedicated Zod schema passed to `generateObject()`:

**Contact:**
```typescript
z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedinUrl: z.string().url().optional(),
  websiteUrl: z.string().url().optional(),
})
```

**Executive Summary:**
```typescript
z.object({
  summary: z.string().min(1).max(1500), // 1-3 paragraphs
})
```

**Experience (repeatable):**
```typescript
z.object({
  entries: z.array(z.object({
    company: z.string().min(1),
    role: z.string().min(1),
    location: z.string().optional(),
    startDate: z.string(),       // "Month YYYY"
    endDate: z.string().optional(),
    current: z.boolean().optional(),
    description: z.string(),     // bullet points separated by newlines
  })),
})
```

**Education (repeatable):**
```typescript
z.object({
  entries: z.array(z.object({
    institution: z.string().min(1),
    degree: z.string().min(1),
    field: z.string().min(1),
    startDate: z.string(),
    endDate: z.string(),
    gpa: z.string().optional(),
  })),
})
```

**Skills:**
```typescript
z.object({
  skills: z.array(z.string().min(1)).transform(arr => [...new Set(arr.map(s => s.trim()))]),
})
```

**Projects (repeatable):**
```typescript
z.object({
  entries: z.array(z.object({
    name: z.string().min(1),
    role: z.string().optional(),
    description: z.string().optional(),
    technologies: z.array(z.string()).optional(),
    url: z.string().url().optional(),
  })),
})
```

---

## 5. Key Data Flows

### A. Conversational CV Extraction Loop
1. User input → `useChat` hook → `chat:stream` IPC → main process.
2. Main process calls `streamText()` via `@ai-sdk/openai`, routing to the cloud OpenAI-compatible endpoint.
3. Stream tokens flow back through IPC → `useChat` updates the message list.
4. User clicks "Done — extract this section" → `chat:extract` IPC.
5. Main process calls `generateObject()` with a Zod output schema → validated data inserted as a new `cv_profile_versions` row (copy-on-write).
6. Updated CV JSON sent back to renderer → React template components re-render.
7. User can pause at any time, edit parsed data via the manual form, and resume the conversation.

### B. One-Click Vector Job Sweep & Local Scoring
1. User selects a target CV version and clicks search → `jobs:sweep` IPC.
2. Main process embeds the CV text via `@xenova/transformers` → 384-dim vector stored in `vec_cv_profile_versions`.
3. Hidden `BrowserWindow` instances crawl job pages → `job_postings` table.
4. Each posting embedded (max 3 concurrent) → `vec_job_postings`.
5. Native `sqlite-vec` `MATCH` (cosine distance) compares vectors.
6. Results below threshold enriched with LLM-generated insights and returned via `jobs:poll`.

### C. PDF Export Pipeline
1. User selects template and clicks export → `cv:export-pdf` IPC.
2. Main process renders the React template component to HTML via `renderToString`.
3. Creates a hidden `BrowserWindow`, loads `data:text/html;charset=utf-8,...` with template CSS.
4. `webContents.printToPDF({ format: 'A4', printBackground: true })` produces the PDF.
5. PDF buffer returned to renderer → native save dialog.

---

## 6. Error Handling Strategy

### LLM Calls
- **Stream interruptions:** `useChat` reports error state → UI shows "Connection lost" banner with retry button.
- **Structured extraction failures:** If `generateObject` throws, retry once. If that also fails, fall back to prompting the model for plain-text JSON and attempt `JSON.parse`. If both approaches fail, surface the raw model output in a textarea for manual correction.
- **API key errors:** Detect `401`/`403` from provider → show inline setup guide and disable interview until resolved.

### Scraping (Electron BrowserWindow)
- Per-source timeout: 30 seconds max per page (configurable). Timeouts logged with source URL.
- Non-blocking architecture: failed sources are omitted from results, not retried automatically.
- Rate-limit detection: if a source returns `429` or blocks the request, mark it as `rate_limited` and skip for the remainder of the sweep.

### Database
- `better-sqlite3` is synchronous and single-connection — all write operations wrapped in try-catch with transaction rollback on failure.
- Vector match query failures (e.g., empty `vec_job_postings`) return empty results instead of throwing.

### PDF Export
- `webContents.printToPDF` failures show a "Retry export" button with error details.
- Missing fonts or template assets log a warning and fall back to system fonts.

### IPC Errors
- All `ipcMain.handle` callbacks wrapped in try-catch. Errors serialized as `{ error: string, code: string }` and thrown back to the renderer as rejected promises.
- Renderer-side handlers in the preload bridge return typed error objects so the UI can display appropriate recovery actions.

---

## 7. Testing Strategy

### Unit Tests (Vitest)
- **Scope:** Database helpers, embedding adapter, vector query builder, Zod schema validation, IPC handler logic.
- **Mocking:** LLM calls mocked via `vi.mock('ai')`; file system calls via `memfs`; Electron APIs mocked via `vi.mock('electron')`.
- **IPC Handlers:** Test `ipcMain.handle` callbacks directly by calling the handler function with mock `IpcMainInvokeEvent` objects. Assert return values and error cases.

### Integration Tests
- **Chat flow:** Test `chat:stream` handler with mock messages. Assert streaming response structure and error handling (missing API key, LLM unreachable).
- **CV persistence:** Test `cv:create` → `cv:update-version` → `cv:get-version` → copy-on-write immutability in a full integration flow against an in-memory SQLite database.
- **PDF generation:** Test `cv:export-pdf` with a known template. Assert PDF output has expected text content and page count using `pdf-parse`.
- **Scraping:** Test against static HTML fixtures (no live URLs).

### E2E Tests (Playwright + Electron)
- **Framework:** `@playwright/test` with the Electron launcher (`_electron.launch()`). Reuses Electron's Chromium — no extra browser download.
- **Scenarios:**
  1. App launch — verify main window renders with sidebar navigation.
  2. Full interview flow — type answers via `page.keyboard`, verify structured CV saves to DB.
  3. Template switching — select each template, verify preview re-renders.
  4. Job sweep — mock IPC responses, verify results render correctly.
  5. PDF export — trigger export, verify file is saved with selectable text.
- **DB verification in E2E:** Expose a `debug:db-query` IPC channel (disabled in production builds) to read saved data during tests.

### CI
- Run Vitest unit + integration tests on every commit.
- Run Electron E2E tests nightly and on PR merge to main.
- Target: ≥ 80% code coverage for database and embedding layers.
- Pre-commit gates: ESLint + Prettier via Husky + lint-staged.
- Pre-push gates: TypeScript type check + coverage threshold (≥ 80%).

---

## 8. Performance Benchmarks

Benchmarks target a reference machine: Apple M1 MacBook Air, 8 GB RAM, macOS 14.

| Operation | Target | Measurement Method |
|-----------|--------|-------------------|
| LLM first-token latency | ≤ 2s | `performance.now()` around `streamText` call |
| Structured extraction (per section) | ≤ 5s | `performance.now()` around `generateObject` |
| Local embedding (500-word CV) | ≤ 3s | `process.hrtime.bigint()` wrapper |
| Local embedding per job posting | ≤ 150ms | Batch benchmark of 100 postings |
| Vector match (1,000 vectors) | ≤ 500ms | `console.time('vector-match')` wrapping the SQLite query |
| Template render to HTML string | ≤ 200ms | Main process `console.time` |
| PDF export (1 page) | ≤ 3s | `webContents.printToPDF()` wall time |
| App cold start (first-ever, w/ downloads) | ≤ 2 min | Launch to ready log line (includes ONNX model download) |
| App cold start (subsequent, cached) | ≤ 5s | Launch to ready log line |
| Installer package size | ≤ 200 MB | `electron-builder` output |

---

## 9. Security & Data Protection

### Electron Security Model
- **Context Isolation:** Enabled. Renderer has no direct access to Node.js APIs or Electron internals.
- **Preload Bridge:** A single preload script exposes a typed `window.electronAPI` object via `contextBridge.exposeInMainWorld()`. Only the specific IPC channels listed in §4 are exposed.
- **Node Integration:** Disabled in the renderer (`nodeIntegration: false`). All Node.js operations happen in the main process.
- **Sandbox:** Enabled for the renderer process (`sandbox: true`).
- **Content Security Policy:** Strict CSP header set on all loaded content, restricting script sources to the app's own bundle.
- **No Remote Content:** All windows load local content (built Vite output). No `loadURL` to external sites except controlled scraping windows.

### Data Storage
- Database file stored at OS-standard application data directory:
  - Windows: `%APPDATA%/careers-builder/data/`
  - macOS: `~/Library/Application Support/careers-builder/data/`
  - Linux: `~/.config/careers-builder/data/`
- ONNX model cache stored alongside the database at `{data_dir}/models/`.
- No telemetry, no cloud sync, no analytics.

### API Key Encryption
- LLM API keys are encrypted via Node `crypto.createCipheriv('aes-256-gcm', key, iv)` with random 12-byte IV per encryption operation.
- The auth tag is stored alongside the ciphertext and IV. All three components (encrypted, iv, tag) are hex-encoded and stored as a JSON object under `provider.apiKey` in the `users.target_settings` column.
- The encryption key is derived from a machine-local secret file at `{data_dir}/.secret` (64 random bytes generated on first run). If this file is deleted, all encrypted data becomes unrecoverable — the user must re-enter API keys through the first-run wizard.

### Networking
- All outbound LLM requests must use TLS 1.3.
- Scraping windows are restricted to job source domains. No credential storage, no form auto-fill, no CAPTCHA bypass.
- Standard Electron `net` module for LLM API calls (no `BrowserWindow` — avoids rendering overhead).
- No exfiltration possible — scraping windows execute read-only JavaScript to extract text content only.

### Code Signing (Production)
- Windows: Signed with an EV code signing certificate.
- macOS: Notarized by Apple. Hardened runtime enabled.
- Linux: AppImage with GPG signature.

---

## 10. Provider Configuration

Stored in `users.target_settings` as JSON. Configured via the first-run wizard UI.

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `provider.apiKey` | `string` | Yes | — | Encrypted at rest via AES-256-GCM |
| `provider.baseUrl` | `string` | No | `https://api.openai.com/v1` | For custom OpenAI-compatible endpoints |
| `provider.modelId` | `string` | No | `gpt-4o` | Passed as the model argument to `streamText()` / `generateObject()` |

Missing or invalid API key renders all chat/extract channels inoperable — the UI shows the first-run wizard instead of the interview view.

### Connection Testing

The `settings:test` IPC channel validates credentials **without requiring a model name**, making it provider-agnostic. The channel accepts optional credentials in the payload — if provided, those are tested (first-run wizard). If empty, the currently saved config is tested (Settings modal).

```
Main process:  GET {baseUrl}/models
               Authorization: Bearer {apiKey}
               Timeout: 10 seconds

Payload: { apiKey?: string, baseUrl?: string }
         If apiKey omitted → use currently saved key
         If baseUrl omitted → use currently saved URL
```

1. Issues a `GET` request to the provider's `/models` endpoint with the API key in the `Authorization` header.
2. **HTTP 200** → credentials are valid. Returns `{ success: true }`.
3. **HTTP 401** → invalid or expired key. Returns `{ success: false, error: "..." }`.
4. **HTTP 403** → key lacks permissions. Returns appropriate error message.
5. **Timeout / unreachable** → bad URL or network issue. Returns connection error.
6. **HTTP 404** (rare — some providers don't expose `/models`) → falls back to a minimal chat completion using the model the user selected in the wizard. If that also fails, the user can proceed — actual usage during the interview will surface any model-specific issues.

This approach works with OpenAI, LiteLLM (proxying any backend), Ollama (OpenAI-compatible mode), Azure OpenAI, Together AI, Groq, DeepSeek, and any other OpenAI-compatible provider without hardcoding a model name into the test.

