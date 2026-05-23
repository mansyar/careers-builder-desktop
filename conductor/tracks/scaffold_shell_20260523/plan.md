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

## Phase C: Navigation & Sidebar

- [ ] Task: Install and configure React Router v7
  - [ ] Install react-router-dom
  - [ ] Create router with `createBrowserRouter`
  - [ ] Define three routes: `/` (Home), `/cv-builder` (CV Builder), `/job-search` (Job Search)
- [ ] Task: Create persistent sidebar navigation component
  - [ ] Build sidebar with navigation links: Home, CV Builder, Job Search, Settings
  - [ ] Implement active route highlighting based on current route
  - [ ] Style sidebar with Tailwind CSS v4
- [ ] Task: Create placeholder page components for each route
  - [ ] Create HomePage, CVBuilderPage, JobSearchPage placeholder components
  - [ ] Each should display the route name as a heading
- [ ] Task: Implement responsive sidebar (collapsible on mobile)
  - [ ] Sidebar collapses to hamburger toggle on viewports < 768px
  - [ ] Add slide animation with backdrop overlay for expanded state
  - [ ] Ensure smooth transitions
- [ ] Task: Write first Vitest test (sidebar renders correctly)
  - [ ] Create test file for sidebar component
  - [ ] Test that all navigation links render
  - [ ] Test active route highlighting
  - [ ] Verify test suite runs with `pnpm test`
- [ ] Task: Conductor - User Manual Verification 'Phase C: Navigation & Sidebar' (Protocol in workflow.md)

## Phase D: Settings Modal Shell

- [ ] Task: Add Settings button to sidebar
  - [ ] Add Settings navigation item in sidebar
  - [ ] Wire it to open a modal (separate from routing)
- [ ] Task: Create dismissable modal component
  - [ ] Build reusable modal component with backdrop overlay
  - [ ] Add close button (X) and click-outside-to-dismiss behavior
  - [ ] Add keyboard Escape key to dismiss
  - [ ] Style with Tailwind CSS v4
- [ ] Task: Conductor - User Manual Verification 'Phase D: Settings Modal Shell' (Protocol in workflow.md)

## Phase E: Testing & Verification

- [ ] Task: Write comprehensive component tests
  - [ ] Test all navigation components
  - [ ] Test modal open/close behavior
  - [ ] Test responsive sidebar collapse/expand
  - [ ] Verify >80% coverage for new components
- [ ] Task: Write E2E test for app launch
  - [ ] Configure Playwright with Electron launcher
  - [ ] Test: App launches and window appears with correct title
  - [ ] Test: Sidebar navigation items are visible
- [ ] Task: Verify full test suite passes
  - [ ] Run `pnpm test` — all unit/integration tests pass
  - [ ] Run E2E tests — verify app launch and basic navigation
  - [ ] Check coverage thresholds are met
- [ ] Task: Conductor - User Manual Verification 'Phase E: Testing & Verification' (Protocol in workflow.md)
