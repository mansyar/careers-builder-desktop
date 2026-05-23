# Implementation Plan: Phase 2 — Database + Provider Setup + Manual CV Editor

## Phase A: Dependencies & Database Setup

- [ ] Task: Install npm dependencies
  - [ ] Install `better-sqlite3`, `@types/better-sqlite3`
  - [ ] Install `sqlite-vec`
  - [ ] Install `@xenova/transformers`, `@ai-sdk/openai`
  - [ ] Install `zod`
  - [ ] Install `react-hook-form`, `@hookform/resolvers`
  - [ ] Run `pnpm install` and verify no build errors
- [ ] Task: Write tests — DatabaseManager & migration system
  - [ ] Write test: DB opens in-memory with correct path
  - [ ] Write test: migration creates all 6 tables idempotently
  - [ ] Write test: debug:db-query rejects non-SELECT queries
  - [ ] Run tests and confirm they fail (Red phase)
- [ ] Task: Implement DatabaseManager singleton
  - [ ] Create `src/main/db/manager.ts` — configurable path, `:memory:` support
  - [ ] Create `src/main/db/migrations.ts` — idempotent DDL for all tables
  - [ ] Wire DB initialization into `src/main/index.ts` on app boot
  - [ ] Implement `debug:db-query` IPC handler (SELECT only, dev/test builds only)
  - [ ] Run tests and confirm they pass (Green phase)
- [ ] Task: Conductor — User Manual Verification 'Phase A: Dependencies & Database Setup' (Protocol in workflow.md)

## Phase B: Encryption Module

- [ ] Task: Write tests — AES-256-GCM encryption
  - [ ] Write test: encrypt and decrypt round-trip with correct key
  - [ ] Write test: wrong key returns error / fails to decrypt
  - [ ] Write test: secret file is created on first access with 64 random bytes
  - [ ] Write test: secret file persists across module reloads
  - [ ] Run tests and confirm they fail (Red phase)
- [ ] Task: Implement encryption module
  - [ ] Create `src/main/encryption/index.ts` — `encrypt()`, `decrypt()`, `ensureSecret()`
  - [ ] Implement machine-local secret file at `{data_dir}/.secret`
  - [ ] Implement AES-256-GCM encrypt/decrypt with random 12-byte IV
  - [ ] Export typed interface for encrypted payload
  - [ ] Run tests and confirm they pass (Green phase)
- [ ] Task: Conductor — User Manual Verification 'Phase B: Encryption Module' (Protocol in workflow.md)

## Phase C: Provider Settings — Backend (IPC Handlers)

- [ ] Task: Write tests — settings IPC handlers
  - [ ] Write test: settings:save encrypts and stores provider config
  - [ ] Write test: settings:load returns decrypted provider config
  - [ ] Write test: settings:test hits GET {baseUrl}/models and returns success/failure
  - [ ] Write test: settings:save with missing required fields returns error
  - [ ] Run tests and confirm they fail (Red phase)
- [ ] Task: Implement settings IPC handlers
  - [ ] Create `src/main/settings/handlers.ts` — load, save, test
  - [ ] Implement `settings:save`: encrypt API key, store in `users.target_settings`
  - [ ] Implement `settings:load`: read from DB, decrypt API key, return config
  - [ ] Implement `settings:test`: HTTP GET to `{baseUrl}/models` with Bearer auth
  - [ ] Register all handlers in `src/main/ipc/index.ts`
  - [ ] Run tests and confirm they pass (Green phase)
- [ ] Task: Update preload bridge with settings channels
  - [ ] Update `src/preload/index.ts` to expose typed settings API
  - [ ] Add TypeScript types for settings channel payloads
- [ ] Task: Conductor — User Manual Verification 'Phase C: Provider Settings Backend' (Protocol in workflow.md)

## Phase D: Provider Settings — Frontend (Wizard + Settings Modal)

- [ ] Task: Write tests — wizard and settings modal components
  - [ ] Write test: wizard renders full-screen overlay when provider not configured
  - [ ] Write test: wizard "Save & Continue" is disabled until test succeeds
  - [ ] Write test: settings modal opens from sidebar, shows saved config
  - [ ] Write test: API key input is password-masked with show toggle
  - [ ] Run tests and confirm they fail (Red phase)
- [ ] Task: Implement first-run wizard page
  - [ ] Create `src/renderer/src/components/Wizard.tsx` — full-screen modal overlay
  - [ ] Step 1: API key input (password-masked, show toggle) + Provider URL input
  - [ ] "Test Connection" button → calls `settings:test` IPC → shows result
  - [ ] Step 2: Model ID dropdown (unlocked after test success)
  - [ ] "Save & Continue" button → calls `settings:save` → dismisses wizard
  - [ ] Integrate into `App.tsx` — check `settings:is-configured` on mount
  - [ ] Run tests and confirm they pass (Green phase)
- [ ] Task: Implement enhanced Settings modal
  - [ ] Update `src/renderer/src/components/Modal.tsx` to support Settings content
  - [ ] Reuse wizard forms for provider config editing
  - [ ] Add Data section: DB location (static display), version stats
  - [ ] Add placeholder buttons: Clear Cache, Reset Feedback, Export Data
  - [ ] Add About section: app version, tech stack
  - [ ] Save / Cancel buttons
  - [ ] Run tests and confirm they pass (Green phase)
- [ ] Task: Conductor — User Manual Verification 'Phase D: Provider Settings Frontend' (Protocol in workflow.md)

## Phase E: CV Profile & Editor — Backend (IPC Handlers)

- [ ] Task: Write tests — CV IPC handlers
  - [ ] Write test: cv:create creates profile + first empty version
  - [ ] Write test: cv:update-version deep-merges patch and saves new row
  - [ ] Write test: copy-on-write creates new version for active version edits
  - [ ] Write test: copy-on-write mutates in-place for historical version edits
  - [ ] Write test: cv:list-versions returns all versions for a profile
  - [ ] Write test: cv:get-version returns full CV JSON
  - [ ] Run tests and confirm they fail (Red phase)
- [ ] Task: Implement deep merge utility
  - [ ] Create `src/main/utils/deep-merge.ts` — recursive patch merge
  - [ ] Write tests for deep merge (separate from CV handlers)
- [ ] Task: Implement CV IPC handlers
  - [ ] Create `src/main/cv/handlers.ts` — create, list, get, update
  - [ ] Implement `cv:create`: insert profile row, insert first version row
  - [ ] Implement `cv:update-version`: load existing, deep merge patch, save (copy-on-write for active)
  - [ ] Implement `cv:list-versions`: query all versions for profile
  - [ ] Implement `cv:get-version`: fetch single version by ID
  - [ ] Register handlers in `src/main/ipc/index.ts`
  - [ ] Run tests and confirm they pass (Green phase)
- [ ] Task: Update preload bridge with CV channels
  - [ ] Update `src/preload/index.ts` to expose typed CV API
  - [ ] Add TypeScript types for CV channel payloads
- [ ] Task: Conductor — User Manual Verification 'Phase E: CV Profile Backend' (Protocol in workflow.md)

## Phase F: CV Editor — Frontend (6-Section Form)

- [ ] Task: Define Zod schemas for CV sections
  - [ ] Create shared Zod schemas in `src/renderer/src/schemas/cv.ts`
  - [ ] Contact, Executive Summary, Experience, Education, Skills, Projects schemas
- [ ] Task: Write tests — CV editor form components
  - [ ] Write test: all 6 sections render on CV Builder page
  - [ ] Write test: Contact section — name required, email validated
  - [ ] Write test: Experience — add/remove reorderable entries
  - [ ] Write test: Education — add/remove entries
  - [ ] Write test: Skills — tag input add/remove with dedup
  - [ ] Write test: Projects — add/remove entries with technologies tag input
  - [ ] Write test: Save button calls cv:update-version IPC
  - [ ] Write test: "Saved!" badge appears and auto-fades
  - [ ] Write test: offline — save disabled with tooltip
  - [ ] Write test: loading skeleton shows while data loads
  - [ ] Run tests and confirm they fail (Red phase)
- [ ] Task: Implement shared CV schemas
  - [ ] Create `src/renderer/src/schemas/cv.ts` with Zod schemas for all 6 sections
  - [ ] Create combined `fullCVSchema` for form validation
- [ ] Task: Implement CV editor form components
  - [ ] Create `src/renderer/src/components/CVSection.tsx` — collapsible section wrapper
  - [ ] Create `src/renderer/src/components/ContactSection.tsx`
  - [ ] Create `src/renderer/src/components/SummarySection.tsx` — textarea with word counter
  - [ ] Create `src/renderer/src/components/ExperienceSection.tsx` — repeatable entries with reorder
  - [ ] Create `src/renderer/src/components/EducationSection.tsx` — repeatable entries
  - [ ] Create `src/renderer/src/components/SkillsSection.tsx` — tag input with dedup
  - [ ] Create `src/renderer/src/components/ProjectsSection.tsx` — repeatable with technologies
  - [ ] Create `src/renderer/src/components/TagInput.tsx` — shared tag input component
  - [ ] Create `src/renderer/src/components/SkeletonLoader.tsx` — shimmer animation
- [ ] Task: Integrate CV editor into CVBuilderPage
  - [ ] Update `src/renderer/src/pages/CVBuilderPage.tsx` with full form
  - [ ] Auto-create CV profile on first visit (IPC call + localStorage)
  - [ ] Load saved CV data on mount (IPC call)
  - [ ] Save button wired to cv:update-version
  - [ ] Offline detection with navigator.onLine
  - [ ] Loading skeleton while data loads
  - [ ] Run tests and confirm they pass (Green phase)
- [ ] Task: Conductor — User Manual Verification 'Phase F: CV Editor Frontend' (Protocol in workflow.md)

## Phase G: Integration, E2E & Final Verification

- [ ] Task: Write E2E tests — wizard flow
  - [ ] E2E: first-run wizard → enter API key → Test Connection → select model → Save → dismiss
  - [ ] E2E: open Settings → edit provider → save → reopen → verify persistence
- [ ] Task: Write E2E tests — CV editor persistence
  - [ ] E2E: fill all 6 form sections → save → reload app → verify data restored
- [ ] Task: Run full test suite and verify coverage
  - [ ] Run `pnpm test` — all unit + integration tests pass
  - [ ] Run `pnpm test:coverage` — coverage >= 80%
  - [ ] Run `pnpm typecheck` — no TS errors
  - [ ] Run `pnpm lint` — no lint errors
- [ ] Task: Conductor — Phase Completion Verification and Checkpoint
  - [ ] Execute Phase Completion Verification and Checkpointing Protocol per workflow.md
