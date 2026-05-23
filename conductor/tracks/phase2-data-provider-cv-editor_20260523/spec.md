# Track: Phase 2 — Database + Provider Setup + Manual CV Editor

## Overview

Build the data persistence layer, AI provider configuration system, and the manual CV editor form. This phase establishes the foundation for all subsequent phases: the database stores CV data, job postings, and settings; the provider setup configures the LLM connection; and the manual editor lets users create and edit CVs directly without the AI interview.

## Functional Requirements

### 1. Database (Main Process)

- **DatabaseManager singleton** with configurable path and `:memory:` support for tests
- **Migration system**: idempotent DDL (`IF NOT EXISTS`) for all tables:
  - Structural: `users`, `cv_profiles`, `cv_profile_versions`, `job_postings`
  - Virtual vector tables: `vec_cv_profile_versions`, `vec_job_postings` (schema defined, populated in Phase 5)
- Initialize database on app boot (main process startup)
- Debug IPC channel: `debug:db-query` (test-only, SELECT only, stripped from production builds)
- **File structure**: Nest modules under `src/main/db/`

### 2. Encryption Module (Main Process)

- AES-256-GCM encryption for LLM API keys via Node `crypto`
- Machine-local secret file at `{data_dir}/.secret` (64 random bytes, created on first run)
- Store encrypted key + IV + auth tag as JSON in `users.target_settings`

### 3. Provider Settings (Main Process + Renderer)

- **IPC channels:**
  - `settings:load` — load saved provider config (returns decrypted fields)
  - `settings:save` — encrypt API key and save provider config
  - `settings:test` — test connection via `GET {baseUrl}/models` with `Authorization: Bearer {apiKey}`
- **Default provider:** baseUrl=`https://api.openai.com/v1`, modelId=`gpt-4o`
- **First-run wizard** (full-screen React modal, non-dismissable):
  - Step 1: API Key (password-masked with show toggle) + Provider URL → "Test Connection" button
  - Step 2: Model ID dropdown (unlocked after successful test)
  - "Save & Continue" button (disabled until valid config saved)
- **Settings modal** (reuses same form, dismissable):
  - Edit provider config (API key, URL, model ID)
  - Test Connection button
  - Data section: database location path, CV version count, cache stats (static for now)
  - Clear Job Cache, Reset Job Feedback, Export All Data buttons (placeholder actions in Phase 2)
  - About section: app version, tech stack
  - Save / Cancel buttons

### 4. CV Profile & Manual Editor (Main Process + Renderer)

- **IPC channels:**
  - `cv:create` — create CV profile + first empty version entry
  - `cv:list-versions` — list versions for a profile
  - `cv:get-version` — get single version with `full_cv_json`
  - `cv:update-version` — deep merge patch, copy-on-write (active version → new row, historical → in-place)
- **Auto-create CV profile** on first visit to `/cv-builder`
- **CV profile ID stored** in `localStorage` in renderer
- **6-section editor form** using React Hook Form v11 + Zod v3 (install):
  - **Contact:** name (required), email, phone, location, LinkedIn URL, website URL
  - **Executive Summary:** textarea with 500-word counter + over-limit warning
  - **Experience:** repeatable — company, role, location, start/end dates, "Currently working here" checkbox, add/remove/reorder, description
  - **Education:** repeatable — institution, degree, field, start/end dates, GPA
  - **Skills:** tag input — type + Enter to add, click X to remove, case-insensitive dedup
  - **Projects:** repeatable — name, role, description, technologies (tag input), URL
- **Sections are collapsible** (all open by default)
- **Save button** → calls `cv:update-version` IPC → "Saved!" badge (auto-fades 2s)
- **Offline behavior:** form editable, save disabled with "Come back online" tooltip
- **Loading state:** skeleton shimmer while data loads

### 5. File Structure (src/main/)

```
src/main/
├── index.ts              # Window creation (existing, add DB init + IPC registration)
├── db/
│   ├── manager.ts        # DatabaseManager singleton
│   └── migrations.ts     # DDL migration functions
├── encryption/
│   └── index.ts          # AES-256-GCM encrypt/decrypt + secret file management
├── settings/
│   └── handlers.ts       # settings:load, settings:save, settings:test IPC handlers
├── cv/
│   └── handlers.ts       # cv:create, cv:list-versions, cv:get-version, cv:update-version IPC handlers
└── ipc/
    └── index.ts          # Central IPC handler registration
```

### 6. Dependencies to Install

- `better-sqlite3` — synchronous SQLite
- `sqlite-vec` — vector extension for SQLite
- `@xenova/transformers` — ONNX embedding pipeline (installed for later phases)
- `@ai-sdk/openai` — OpenAI-compatible LLM adapter (installed for Phase 3)
- `react-hook-form` + `@hookform/resolvers` — form state management
- `zod` — schema validation (shared between form and IPC handlers)
- `@types/better-sqlite3` — type definitions

## Non-Functional Requirements

- **Security:** API keys encrypted at rest with AES-256-GCM; key derivation from machine-local secret file
- **Privacy:** All data stored locally in SQLite database; no telemetry or cloud sync
- **Performance:** Database initialization completes within 500ms on app boot
- **Reliability:** Migration system is idempotent — safe to run multiple times
- **Maintainability:** Each IPC handler module is independently testable with mock DB

## Out of Scope (Phase 2)

- AI chat interview and structured extraction (Phase 3)
- Template rendering and PDF export (Phase 4)
- Job scraping, embeddings, and vector search (Phase 5)
- Home dashboard and status bar (Phase 6)
- ONNX model download (deferred until embedding is used in Phase 5)

## Acceptance Criteria

1. [ ] App launches and database initializes without errors
2. [ ] First-run wizard appears on fresh install (no saved settings)
3. [ ] User can enter API key + URL → Test Connection → succeeds → select model → save → wizard dismisses
4. [ ] Settings modal opens from sidebar, shows saved config, allows editing
5. [ ] CV Builder page shows empty 6-section form on first visit
6. [ ] User can fill all 6 sections and see live form state
7. [ ] Save button persists data via IPC → badge confirms save
8. [ ] App restart restores saved CV data
9. [ ] Offline mode: form editable, save shows disabled tooltip
10. [ ] All unit/integration tests pass with >80% coverage
