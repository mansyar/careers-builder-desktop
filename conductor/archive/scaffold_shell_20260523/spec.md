# Track Specification: Phase 1 — Project Scaffold + Electron Shell

## Overview

Set up the foundation for the Careers Builder desktop application. This track establishes the project structure, build pipeline, Electron shell, navigation framework, and testing infrastructure.

## Goals

1. Initialize the electron-vite project with React 19 + TypeScript strict mode
2. Configure Tailwind CSS v4 and development tooling (ESLint, Prettier, Husky)
3. Create the Electron main/renderer/preload process architecture with security hardening
4. Implement React Router v7 navigation with a responsive sidebar
5. Create a placeholder Settings Modal component
6. Set up Vitest + Playwright E2E testing and write initial tests
7. Verify the app launches, navigates, and responds correctly

## Tech Stack

- **Framework:** Electron (latest) + electron-vite
- **UI:** React 19 + TypeScript strict mode + Tailwind CSS v4
- **Routing:** React Router v7
- **Testing:** Vitest + @playwright/test
- **Packaging:** electron-builder (NSIS, dmg, AppImage)

## Key Decisions

| Concern              | Decision                               |
| -------------------- | -------------------------------------- |
| Window size          | Default 1200×800, min 900×600          |
| Title                | "Careers Builder"                      |
| Main process entry   | `src/main/index.ts`                    |
| Preload entry        | `src/preload/index.ts`                 |
| Renderer entry       | `src/renderer/index.tsx`               |
| Router               | React Router v7, `createBrowserRouter` |
| Package manager      | pnpm v10+                              |
| Test coverage target | >80%                                   |
