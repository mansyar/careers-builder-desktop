# Product Requirement Document (PRD)
## Project: Local AI-Powered CV Builder & Career Opportunity Searcher

---

## 1. Executive Summary & Goals

A private desktop application running on the user's machine (Windows, macOS, Linux), serving two core functions:

- **CV Builder Mode:** AI-guided conversational interview that extracts professional details, structures them, and maps onto multiple design templates.
- **Job Search Mode:** Semantic search engine that reads a CV, scrapes live job postings via automated scrapers/APIs, and ranks them by contextual relevance.

**Design philosophy:** local-first data security. All personal data is stored and processed on the user's machine. Conversational AI features send text to a cloud LLM provider — that text is never stored or trained on by the provider per their API terms.

---

## 2. Target Audience & Core Value Proposition

- **User Persona:** Professionals who want data sovereignty, protection from third-party resume trackers, and context-aware job listings without data harvesting.
- **Value Proposition:** Minimal data exposure — only conversation text reaches the LLM provider under no-retention terms. No cloud storage costs, multi-template design from a single data source, AI-driven filtering that acts as a private career recruiter.

---

## 3. Functional Requirements

### Mode 1: AI-Powered CV Builder

#### Step 1: Guided Chat Interview

The interview is a **linear, guided conversation** where the AI acts as an executive resume writer working through sections in order. The user controls the pace — skip, revisit, or stop at any time.

##### Section Order (Default)

| # | Section | AI Prompts For | Extraction Schema |
|---|---------|----------------|-------------------|
| 1 | **Contact** | Name, email, phone, location, LinkedIn, website | Name, email, phone?, location?, linkedinUrl?, websiteUrl? |
| 2 | **Executive Summary** | Professional background, top achievements, career goals | Summary (1-3 paragraphs) |
| 3 | **Experience** | Each role: company, title, dates, responsibilities, metrics (repeatable) | Entry[]: company, role, location?, startDate, endDate?, current?, description |
| 4 | **Education** | Each degree: institution, field, dates, GPA (repeatable) | Entry[]: institution, degree, field, startDate, endDate, gpa? |
| 5 | **Skills** | Technical skills, tools, languages, certifications | Skills: string[] (deduplicated) |
| 6 | **Projects** | Each project: name, role, description, tech, URL (repeatable) | Entry[]: name, role?, description?, technologies?, url? |

##### Per-Section Loop

```
1. AI asks opening question for the section
2. User responds naturally (free text)
3. AI asks adaptive follow-ups to fill gaps
4. User provides more detail
5. AI confirms: "I have enough for [Section]. Extract or add more?"
6. User clicks "Done — extract this section"
7. generateObject() with Zod schema → structured JSON
8. Form panel populates with extracted data
9. AI moves to next section
```

##### Navigation Rules

- **Skip:** User says "Let's skip education" → AI acknowledges, moves on. Section stays empty in the form.
- **Go back:** User says "I want to add more to my experience" → AI returns to that section's context.
- **Manual edit after extraction:** User can edit any form field directly. Extracted data is guidance, not final.
- **AI doesn't override manual edits.** If user corrects the form and then keeps chatting, the AI works from conversation context, not form state.

##### Pause / Resume (No Chat Persistence)

| Action | Behavior |
|--------|----------|
| User navigates away | Conversation is discarded. Only extracted CV data persists in the database. |
| User closes app | Same — CV versions saved, chat history lost. |
| User returns later | Form shows last saved CV data (partially complete). A new chat session starts fresh. |
| User wants to continue | New chat picks up from the form's state. The AI sees whatever sections are already populated and picks the first incomplete section. |

Rationale: Chat history is transient. The permanent artifact is the structured CV data. This avoids complexity of serializing/restoring message state and keeps the mental model simple — "the form is your source of truth."

##### Streaming & Interaction

- Responses stream token-by-token with a cursor animation.
- User input is not blocked during streaming — they can type ahead.
- AI maintains an encouraging, professional tone. One question at a time.
- Visual indicator highlights which section is currently being discussed.
- Error banner with "Retry" button appears if LLM connection drops.

#### Step 2: Multi-Template Visual Engine
- User data serializes into a unified, version-controlled schema decoupled from presentation layers (each save creates a new version entry with full history preserved).
- Multi-column visual toggle for template selection (e.g., *Modern Minimalist, Executive Traditional, Creative Tech*).
- Template switching re-renders instantly without data mutation or re-typing.
- PDF export must be pixel-perfect, multi-page, and ATS-compliant (selectable text, no locked shapes).

### Mode 2: Smart Job Opportunity Searcher

A multi-step process: select a CV profile → configure sources → initiate sweep → browse live results → iterate based on insights.

**Empty state:** If no CV profile exists when the user navigates to Job Search, a message is shown: "You need a CV first. Create one to start matching jobs." with a button that navigates to CV Builder.

**Result persistence:** The last sweep's results are shown when the user returns to Job Search (survives app restarts). Running a new sweep replaces previous results.

#### Step 1: Select Target Profile

- User picks any saved CV version from a dropdown (labeled by `versionLabel` and date).
- The selected version is used as the "Active Targeting Profile" for this sweep.
- Defaults to the most recently saved version.
- User can change the selection at any time before starting a sweep.

#### Step 2: Source Configuration

- Sources are **auto-selected by default** based on the CV's industry keywords, location, and remote eligibility flag.
- User can toggle individual sources on/off.
- Display shows estimated coverage ("3 of 8 sources") and a caveat that results are best-effort.
- Authenticated/protected job sites (LinkedIn, Indeed, Glassdoor) are explicitly excluded.
- Source preferences persist globally across sessions (not per-profile).

#### Step 3: Initiate Career Sweep

- "Start Career Sweep" button triggers the background process:
  1. Main process embeds the CV text via `@xenova/transformers` → 384-dim vector stored in `vec_cv_profile_versions`.
  2. Hidden `BrowserWindow` instances scrape selected job boards in parallel.
  3. Each discovered posting is embedded (max 3 concurrent) and stored in `vec_job_postings`.
  4. `sqlite-vec` `MATCH` (cosine distance) compares CV vector against job posting vectors.
  5. Top matches are enriched with LLM-generated insights (match rationale, missing skills, salary range).
- User can cancel the sweep at any time. Partial results already collected are preserved.

#### Step 4: Live Results Streaming

- Results appear **as each source finishes processing** — no need to wait for all sources.
- Progress indicators per source: ✅ done, 🔄 in progress, ⏳ queued, ❌ failed/unreachable.
- Overall progress bar: postings found → postings embedded → postings matched.
- Results are ordered strictly by match score (cosine distance, lower = better).
- **Search & filter bar** above the results list:
  - **Keyword search** — filters by title, company, and description text (client-side, instant).
  - **Location filter** — narrows by location field.
  - **Company filter** — narrows by company name.
  - All filters combine with the match score sort (filtered results remain ordered by score).
- Each result card shows:
  - Title, company, location
  - Match score (percentage, 0-100%)
  - AI-generated match rationale ("Your 5+ years React experience aligns...")
  - Missing skills detected (e.g., "GraphQL, Playwright")
  - Estimated salary range
  - Posting date
  - 👍 / 👎 inline feedback buttons
  - "View Original" link — opens in the user's default browser via `shell.openExternal()`
- Paginated for large result sets.

#### Step 5: Post-Sweep Actions

After the sweep completes, the user can:

| Action | Behavior |
|--------|----------|
| **New Sweep** | Reset and start a fresh sweep (same or different CV/sources). Replaces current results. |
| **Adjust CV** | Opens CV Builder on the Edit tab. A new chat session starts where the AI proactively reviews missing skills from the top matches and offers to add them to the user's CV (Skills section, experience descriptions, etc.). |
| **Export Results** | Saves the current result set to a file (CSV or JSON) via native save dialog. |

#### Step 6: Feedback Loop

- User's 👍 / 👎 feedback is stored locally linked to the job posting and the CV version used.
- Feedback affects **current and future** sweeps:
  - **Current sweep:** Liked jobs move up in rank, disliked jobs move down (instant re-sort).
  - **Future sweeps:** The ranking algorithm weights postings similar to liked jobs higher and avoids patterns from disliked jobs.
- Feedback can be reset from Settings.

---

## 4. UI/UX Requirements

### 4.1 Home Screen
- **Hybrid dashboard** adapting to user state:
  - **First-time users:** Two large call-to-action cards (Build Your CV / Search Jobs) with a tip to start with the CV first. Search Jobs card shows "Create CV First" state when no profile exists.
  - **Returning users:** Contextual dashboard showing CV completion progress (X/6 sections), saved version count, and recent job match count. "Resume where you left off" card linking to the last active section. Recent job matches with inline thumbs up/down feedback.
  - **Status bar** at bottom showing provider connection status (green/yellow/red dot) and app version.

### 4.2 Layout & Navigation
- **Persistent sidebar** navigation with links: Home, CV Builder, Job Search, and Settings.
- Sidebar collapses to hamburger on narrow viewports (< 768px).
- Active route highlighted via route state.
- **CV Builder has two sub-views** toggled via a tab bar at the top of the content area:
  - `[ ✏️ Edit ]` — Split view: Chat panel (left) + Manual CV form (right). This is where the interview and manual edits happen.
  - `[ 🎨 Preview ]` — Full-width template preview with template selector (dropdown) and PDF export button. Reflects the latest saved CV data.
  - Tab switch is instant — no route change. User can switch freely at any time, even mid-interview.
  - After interview completes, chat panel shows a "Preview your CV" button that activates the Preview tab.

### 4.3 State & Feedback
- **State Transparency:** Visual indicator for CPU/memory during local embedding, network request tally during web crawling.
- **Result Feedback:** Inline thumbs up/down on each job result row. Feedback stored locally and used to adjust future result ranking.
- **Printing Fidelity:** Real-time preview matching paper proportions (`A4`/`Letter`) with printable CSS masking interface chrome during export.

---

## 5. Non-Functional Requirements

### 5.1 Performance
- Chat response streaming must begin within 2 seconds of user input (excluding network latency to LLM provider).
- Template switching must re-render in under 500ms.
- Local embedding generation must process a CV (avg 500 words) in under 3 seconds.
- Vector similarity query across 1,000 job postings must return in under 1 second.
- PDF export must complete within 3 seconds for a single-page CV.

### 5.2 Security & Privacy
- All personal data stored exclusively on the local machine — zero telemetry, zero cloud sync.
- LLM API keys stored in the main process database, never exposed to the renderer process.
- All outbound LLM requests must use TLS 1.3.
- Scraping subsystem must not exfiltrate user data — network requests are read-only and limited to job search domains.

### 5.3 Reliability
- Offline mode covers: viewing and editing saved CV data, switching templates, and PDF export. The guided interview and job search require network access.
- Scraping failures must not block the UI — results return with whatever data was collected, with clear error indicators per source.
- LLM streaming interruptions must gracefully degrade: retry with exponential backoff (max 3 attempts), then surface a manual re-try button.

### 5.4 Usability
- First-run wizard: 2-step setup (API Key + Provider URL → Model ID). API key is password-masked with show toggle. "Test Connection" button validates credentials using the entered URL. Wizard is non-dismissable until valid settings are saved. After configuration, settings are editable via a dismissable modal from the sidebar "Configure AI Provider" button.
- Guided interview must require no prior AI/chatbot experience.
- Job search must surface at least 5 results per sweep when public sources contain relevant listings for the user's industry and location.

---

## 6. Success Metrics & KPIs

| Metric | Target | How Measured |
|--------|--------|-------------|
| CV export ATS pass rate | ≥ 95% | Parsed against open-source ATS simulators |
| Interview-to-completion rate | ≥ 80% | Users who finish all CV sections across any number of sessions |
| Avg interview duration | ≤ 12 min | Time from first prompt to completed CV |
| Job search result relevance (top 5) | ≥ 70% user-satisfied | In-app thumbs up/down per result |
| Template switch latency | ≤ 500ms | Browser performance measurement |
| Local embedding throughput | ≥ 50 jobs/sec | Benchmark on reference hardware (M1 MacBook Air) |
| API key misconfiguration recovery | ≤ 30s | From error detection to displaying the first-run wizard with the API key field pre-focused |

---

## 7. Constraints

- **Environment:** Packaged as a native desktop application for Windows (NSIS), macOS (.dmg), and Linux (AppImage). No OS-specific code paths in shared logic.
- **RAM budget:** Minimum 4 GB system memory recommended for smooth operation of ONNX embeddings and Chromium-based scraping.
- **Disk budget:** Maximum 200 MB for the application package; data directory grows organically (SQLite database + cached ONNX model ~90 MB + scraped job data).
- **Network:** Scraping targets only public, unauthenticated job listing pages. No CAPTCHA bypass, no credential stuffing.
- **LLM dependency:** Application requires an active internet connection and a valid API key for the conversational interview. CV editing and PDF export work fully offline.
- **GPU:** No GPU acceleration assumed — all local ML runs on CPU via ONNX runtime.
- **Packaging:** Uses Electron's built-in Chromium for PDF export and web scraping — no separate browser engine bundling required.

---

## 8. Out-of-Scope

- Multi-user or team collaboration features.
- Native mobile apps (iOS/Android) — web-only.
- Direct apply / application submission through the platform.
- Company career page account creation or login automation.
- User-customizable template editor. Templates are pre-built by the developer.
- AI-powered cover letter or thank-you note generation.
- Resume grammar scoring or ATS-specific keyword optimization beyond context matching.
- Cloud-hosted or SaaS version of the application.

## 9. Glossary

| Term | Definition |
|------|-----------|
| **ATS** | Applicant Tracking System — software used by employers to parse and store resumes. |
| **Embedding** | A numerical vector representation of text in a multi-dimensional space. |
| **LLM** | Large Language Model — the cloud AI model powering the conversational interview. |
| **ONNX** | Open Neural Network Exchange — cross-platform format for ML models. |
| **Main Process** | The Node.js backend process in Electron that handles database access, LLM calls, and file I/O. |
| **Renderer Process** | The Chromium window in Electron that renders the React UI. Communicates with the main process via IPC. |
| **IPC** | Inter-Process Communication — the mechanism for the renderer to request data from the main process. |
| **Cosine Distance** | A metric measuring similarity between two vectors (0 = identical, 1 = opposite). Used for ranking job matches. |
| **Post-Processing Agent** | An async LLM call that analyzes top job matches to extract insights (missing skills, salary range, match rationale). |
| **Semantic Search** | Search by meaning rather than exact keywords, powered by vector embeddings and similarity scoring. |
| **Vector Match** | A similarity search comparing embeddings using cosine distance. |
| **Vec0** | The virtual vector table engine provided by the `sqlite-vec` extension. |
