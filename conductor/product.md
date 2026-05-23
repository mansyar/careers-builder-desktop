# Initial Concept

Careers Builder — Local AI-Powered CV Builder & Career Opportunity Searcher

A desktop application built with Electron + Vite + React 19 + TypeScript + Tailwind CSS v4 that helps users create professional CVs through an AI-guided interview process, preview them in multiple templates, export as PDF, and search for matching job opportunities — all running locally with privacy-first design.

---

# Product Guide

## Product Overview

**Careers Builder** is a private, local-first desktop application that serves two core functions:

1. **CV Builder Mode:** An AI-guided conversational interview that extracts professional details, structures them into a unified schema, and renders them across multiple design templates with pixel-perfect PDF export.
2. **Job Search Mode:** A semantic search engine that reads a CV, scrapes live job postings from public sources, and ranks them by contextual relevance using local vector embeddings.

**Design Philosophy:** Local-first data security. All personal data is stored and processed on the user's machine. Conversational AI features send text to a cloud LLM provider under no-retention terms. No cloud storage, no telemetry, no data harvesting.

## Target Audience

- **Primary Persona:** Professionals who want data sovereignty, protection from third-party resume trackers, and context-aware job listings without data harvesting.
- **Secondary Persona:** Career changers and job seekers who need guidance building an effective CV and discovering relevant opportunities.

## Core Features

### 1. AI-Powered CV Builder

- **Guided Chat Interview:** A linear, conversational experience where the AI acts as an executive resume writer, working through sections in order: Contact → Executive Summary → Experience → Education → Skills → Projects.
- **Structured Extraction:** User responses are extracted into structured JSON via LLM `generateObject()` with Zod schemas, then populated into a manual editor form.
- **Per-Section Loop:** AI asks opening questions → user responds naturally → AI asks adaptive follow-ups → user confirms readiness → one-click extraction.
- **Navigation Flexibility:** Skip sections, revisit past sections, or manually edit any field after extraction.
- **No Chat Persistence:** Chat history is transient. Only structured CV data persists. Returning users start fresh with the AI detecting incomplete sections from the form.
- **Streaming Responses:** Token-by-token streaming with cursor animation. Users can type ahead during AI responses.

### 2. Multi-Template Visual Engine

- **3 Pre-Built Templates:** Modern Minimalist, Executive Traditional, Creative Tech.
- **Instant Switching:** Template changes re-render in under 500ms without data mutation.
- **PDF Export:** Pixel-perfect, multi-page, ATS-compliant PDF (selectable text) via Electron's `printToPDF()`.
- **Paper Size Selection:** A4 or Letter.

### 3. Smart Job Opportunity Searcher

- **Profile Selection:** Pick any saved CV version as the targeting profile.
- **Source Configuration:** Auto-selected sources based on CV keywords, with manual toggle and per-source progress indicators.
- **Career Sweep:** Background process that scrapes public job boards, generates local embeddings (384-dim via `all-MiniLM-L6-v2`), and ranks results by cosine similarity.
- **Live Results Streaming:** Results appear as each source finishes processing, ordered by match score.
- **Search & Filter:** Client-side keyword, location, and company filtering on the results set.
- **Result Cards:** Title, company, location, match score (0-100%), AI rationale, missing skills, salary range, posting date, thumbs up/down, "View Original" link.
- **Result Persistence:** Last sweep results survive app restarts. New sweeps replace previous results.

### 4. Feedback & Iteration Loop

- **Thumbs Up/Down:** Inline feedback on each job result. Liked jobs rank higher, disliked jobs rank lower (current + future sweeps).
- **Adjust CV Flow:** After a sweep, the AI reviews missing skills from top matches and offers to update the CV — creating a new version.

### 5. Home Dashboard

- **First-time Users:** Two CTA cards (Build Your CV / Search Jobs) with guidance to start with the CV.
- **Returning Users:** Contextual dashboard showing CV progress, saved versions, recent matches, and "Resume where you left off" card.
- **Status Bar:** Provider connection status (green/yellow/red dot) and app version.

### 6. Settings & Configuration

- **First-Run Wizard:** 2-step setup (API Key + Provider URL → Model ID) with "Test Connection" button. Non-dismissable until valid settings saved.
- **Settings Modal:** Edit provider config, test connection, view database stats, clear job cache, reset feedback, export all data, about section.
- **Encryption:** API keys encrypted with AES-256-GCM, stored in main process database.

## Design Philosophy

- **Privacy First:** Zero telemetry, zero cloud sync, all data on the local machine.
- **Local-First:** Core features (CV editing, template preview, PDF export) work fully offline.
- **Guidance, Not Automation:** AI interviews guide users through the process but never override manual edits.
- **Transparency:** State visibility for background tasks (embedding progress, scrape status, network requests).

## Non-Functional Requirements

### Performance
- Chat streaming begins within 2 seconds of user input (excluding network latency).
- Template switching under 500ms.
- Local embedding of a 500-word CV in under 3 seconds.
- Vector query across 1,000 job postings in under 1 second.
- PDF export within 3 seconds for a single-page CV.

### Security & Privacy
- All personal data stored locally only.
- LLM API keys never exposed to renderer process.
- All outbound LLM requests use TLS 1.3.
- Scraping is read-only, limited to job search domains, no data exfiltration.

### Reliability
- Offline mode: CV editing, template switching, PDF export work without network.
- Scraping failures don't block UI — partial results with error indicators.
- LLM streaming interruptions: exponential backoff retry (max 3), then manual retry button.

### Usability
- First-run wizard: non-dismissable until configured, password-masked API key with show toggle, "Test Connection" validation.
- Guided interview requires no prior chatbot experience.
- Job search must surface at least 5 relevant results per sweep.

## Constraints

- **Platforms:** Windows (NSIS), macOS (.dmg), Linux (AppImage).
- **RAM:** Minimum 4 GB recommended.
- **Disk:** Max 200 MB package; data directory grows organically.
- **Network:** Public, unauthenticated job listings only. No CAPTCHA bypass.
- **LLM:** Requires internet + valid API key for interview. CV editing/PDF export work fully offline.
- **GPU:** No GPU acceleration — all local ML on CPU via ONNX runtime.
- **Packaging:** Uses Electron's built-in Chromium for PDF export and scraping.

## Out of Scope
- Multi-user or team collaboration.
- Native mobile apps.
- Direct job applications through the platform.
- User-customizable template editor.
- AI-powered cover letter generation.
- Resume grammar scoring or ATS keyword optimization.
- Cloud-hosted or SaaS version.
