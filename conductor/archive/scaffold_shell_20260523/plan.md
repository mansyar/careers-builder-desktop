# Implementation Plan: Phase 1 — Project Scaffold + Electron Shell

## Phase A: Project Setup & Configuration [checkpoint: 7a9680f]

- [x] Task: Initialize electron-vite project with React 19 + TypeScript strict mode [a0edf1d]
  - [ ] Run pnpm create @quick-start/electron with React + TypeScript template
  - [ ] Update package.json with correct project name, version, and description
  - [ ] Configure TypeScript strict mode in tsconfig files (main, preload, renderer)
  - [ ] Install pnpm v10+ if not present
- [x] Task: Configure Tailwind CSS v4
  - [x] Install tailwindcss v4 and @tailwindcss/vite
  - [x] Add Tailwind to Vite config
  - [x] Create CSS entry file with Tailwind directives
  - [x] Verify Tailwind classes render in sample component
- [x] Task: Set up ESLint + Prettier + Husky + lint-staged [3787fae]
  - [x] Install and configure ESLint with TypeScript rules
  - [x] Install and configure Prettier
  - [x] Set up Husky for git hooks
  - [x] Configure lint-staged for pre-commit checks
- [x] Task: Set up Vitest + @vitest/coverage-v8 [ecbc109]
  - [x] Install Vitest and configure in vite config
  - [x] Set up coverage reporter
  - [x] Verify test runner works with `pnpm test`
- [x] Task: Create .gitignore with Electron-specific patterns [a0edf1d]
  - [x] Add node_modules, dist, out, .env patterns
- [x] Task: Configure electron-builder for cross-platform packaging [a0edf1d]
  - [x] Add electron-builder config to package.json
  - [x] Configure Windows (NSIS), macOS (dmg), Linux (AppImage) targets
- [x] Task: Conductor - User Manual Verification 'Phase A: Project Setup & Configuration' (Protocol in workflow.md) [7a9680f]

## Phase B: Electron Shell & Security [checkpoint: 0d37ed4]

- [x] Task: Create main process BrowserWindow [a0edf1d]
  - [x] Configure default size 1200×800, min size 900×600
  - [x] Set window title to "Careers Builder"
  - [x] Wire up dev load URL (Vite dev server) vs production file load
- [x] Task: Create preload script with empty contextBridge shell [a0edf1d]
  - [x] Set up `contextBridge.exposeInMainWorld('electronAPI', {})`
  - [x] Prepare typed window.electronAPI declarations
- [x] Task: Mount React app in renderer with Tailwind base styles [a0edf1d]
  - [x] Create renderer entry point (src/renderer/index.tsx)
  - [x] Mount React app into DOM
  - [x] Apply Tailwind preflight/base styles
- [x] Task: Enable Electron security best practices [a0edf1d]
  - [x] Enable contextIsolation
  - [x] Disable nodeIntegration
  - [x] Enable sandbox mode
  - [x] Set strict Content Security Policy header
- [x] Task: Conductor - User Manual Verification 'Phase B: Electron Shell & Security' (Protocol in workflow.md) [0d37ed4]

## Phase C: Navigation & Sidebar [checkpoint: 990a3a5]

- [x] Task: Install and configure React Router v7 [a0edf1d]
  - [x] Install react-router-dom
  - [x] Create router with `createBrowserRouter`
  - [x] Define three routes: `/` (Home), `/cv-builder` (CV Builder), `/job-search` (Job Search)
- [x] Task: Create persistent sidebar navigation component [a0edf1d]
  - [x] Build sidebar with navigation links: Home, CV Builder, Job Search, Settings
  - [x] Implement active route highlighting based on current route
  - [x] Style sidebar with Tailwind CSS v4
- [x] Task: Create placeholder page components for each route [a0edf1d]
  - [x] Create HomePage, CVBuilderPage, JobSearchPage placeholder components
  - [x] Each should display the route name as a heading
- [x] Task: Implement responsive sidebar (collapsible on mobile) [a0edf1d]
  - [x] Sidebar collapses to hamburger toggle on viewports < 768px
  - [x] Add slide animation with backdrop overlay for expanded state
  - [x] Ensure smooth transitions
- [x] Task: Write first Vitest test (sidebar renders correctly) [07f90ce]
  - [x] Create test file for sidebar component
  - [x] Test that all navigation links render
  - [x] Test active route highlighting
  - [x] Verify test suite runs with `pnpm test`
- [x] Task: Conductor - User Manual Verification 'Phase C: Navigation & Sidebar' (Protocol in workflow.md) [990a3a5]

## Phase D: Settings Modal Shell [checkpoint: db4b65f]

- [x] Task: Add Settings button to sidebar [273c086]
  - [x] Add Settings navigation item in sidebar
  - [x] Wire it to open a modal (separate from routing)
- [x] Task: Create dismissable modal component [273c086]
  - [x] Build reusable modal component with backdrop overlay
  - [x] Add close button (X) and click-outside-to-dismiss behavior
  - [x] Add keyboard Escape key to dismiss
  - [x] Style with Tailwind CSS v4
- [x] Task: Conductor - User Manual Verification 'Phase D: Settings Modal Shell' (Protocol in workflow.md) [db4b65f]

## Phase E: Testing & Verification [checkpoint: c40a37f]

- [x] Task: Write comprehensive component tests [f519570]
  - [x] Test all navigation components
  - [x] Test modal open/close behavior
  - [x] Test responsive sidebar collapse/expand
  - [x] Verify >80% coverage for new components
- [x] Task: Write E2E test for app launch [f519570]
  - [x] Configure Playwright with Electron launcher
  - [x] Test: App launches and window appears with correct title
  - [x] Test: Sidebar navigation items are visible
- [x] Task: Verify full test suite passes [f519570]
  - [x] Run `pnpm test` — all unit/integration tests pass
  - [x] Run E2E tests — verify app launch and basic navigation
  - [x] Check coverage thresholds are met
- [x] Task: Conductor - User Manual Verification 'Phase E: Testing & Verification' (Protocol in workflow.md) [c40a37f]

## Phase: Review Fixes

- [x] Task: Apply review suggestions from code review [2b2f58a]
