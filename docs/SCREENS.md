# Screen Wireframes

---

## 1. First-Run Wizard (App Launch — No API Key Configured)

```
┌──────────────────────────────────────────────────────────┐
│  Careers Builder Setup                           _ ☐ ✕  │
│                                                           │
│                                                           │
│              ┌──────────────────────────────────┐          │
│              │  Configure AI Provider            │          │
│              │                                  │          │
│              │  ── Step 1: Provider ──────────── │          │
│              │                                  │          │
│              │  API Key:                        │          │
│              │  ┌──────────────────────────────┐│          │
│              │  │ ●●●●●●●●●●●●●●●       [👁]  ││          │
│              │  └──────────────────────────────┘│          │
│              │                                  │          │
│              │  Provider URL:                   │          │
│              │  ┌──────────────────────────────┐│          │
│              │  │ https://api.openai.com/v1    ││          │
│              │  └──────────────────────────────┘│          │
│              │                                  │          │
│              │  [ Test Connection ]     ✅ OK!  │          │
│              │                                  │          │
│              │  ── Step 2: Model ────────────── │          │
│              │                                  │          │
│              │  Model ID:                       │          │
│              │  ┌──────────────────────────────┐│          │
│              │  │ gpt-4o                   ▼   ││          │
│              │  └──────────────────────────────┘│          │
│              │                                  │          │
│              │  [     Save & Continue      ]    │          │
│              └──────────────────────────────────┘          │
│                                                           │
│  ⚠ Test Connection must succeed before saving              │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### States

| State | Behavior |
|-------|----------|
| **Initial** | API key field empty, password-masked. URL pre-filled with `https://api.openai.com/v1`. "Save & Continue" disabled. |
| **Test succeeds** | ✅ green checkmark appears. Step 2 unlocks (Model ID editable). "Save & Continue" enables. |
| **Test fails** | ❌ red error message below button explaining the issue (invalid key, unreachable host, etc.). Stays on Step 1. |
| **Key entered** | User can toggle visibility with 👁 button. |
| **Already configured** | Wizard never shows — app goes straight to Home. |

---

## 2. Home Screen

### 2A. First-Time User (No CV Profile)

```
┌─────────────┬────────────────────────────────────────────┐
│             │                                            │
│  🏠 Home    │           Welcome to Careers Builder        │
│             │                                            │
│  📝 CV      │    ┌──────────────────┐  ┌──────────────┐  │
│    Builder  │    │                  │  │              │  │
│             │    │  📝 Build Your   │  │  🔍 Search   │  │
│  🔍 Job     │    │     CV           │  │     Jobs     │  │
│    Search   │    │                  │  │              │  │
│             │    │  AI-guided chat  │  │  Create a CV │  │
│  ⚙ Settings │    │  → multi-        │  │  first to    │  │
│             │    │    template      │  │  match       │  │
│             │    │    resume        │  │  against     │  │
│             │    │                  │  │  jobs        │  │
│             │    │  [ Start         │  │              │  │
│             │    │    Building ]    │  │  [ Create    │  │
│             │    │                  │  │    CV → ]    │  │
│             │    └──────────────────┘  └──────────────┘  │
│             │                                            │
│             │  💡 Tip: Start with your CV first — the     │
│             │     job search needs a completed profile    │
│             │     to match against.                       │
│             │                                            │
│             ├────────────────────────────────────────────┤
│             │  Provider: OpenAI (gpt-4o)  ● Connected    │
│             │                                   v1.0.0  │
└─────────────┴────────────────────────────────────────────┘
```

### 2B. Returning User (CV Data Exists)

```
┌─────────────┬────────────────────────────────────────────┐
│             │                                            │
│  🏠 Home    │           Good morning, John               │
│             │                                            │
│  📝 CV      │  ┌──────────┐  ┌──────────┐  ┌─────────┐  │
│    Builder  │  │ CV: 4/6  │  │ 3 saved  │  │ 8 new   │  │
│             │  │ sections │  │ versions │  │ matches │  │
│  🔍 Job     │  └──────────┘  └──────────┘  └─────────┘  │
│    Search   │                                            │
│             │  ┌──────────────────────────────────────┐  │
│  ⚙ Settings │  │ Resume where you left off            │  │
│             │  │ 📝 You were working on your           │  │
│             │  │    Executive Summary                  │  │
│             │  │                                      │  │
│             │  │  [ Continue Interview ]              │  │
│             │  │  [ Edit CV Directly    ]             │  │
│             │  └──────────────────────────────────────┘  │
│             │                                            │
│             │  Recent Job Matches:                       │
│             │  ┌──────────────────────────────────────┐  │
│             │  │ Sr Frontend Engineer @ Acme Corp     │  │
│             │  │ Remote · Match: 92%          👍  👎  │  │
│             │  │                                      │  │
│             │  │ Software Engineer II @ Beta Inc      │  │
│             │  │ San Francisco, CA · Match: 85% 👍 👎 │  │
│             │  │                                      │  │
│             │  │  [ View All 8 Results → ]            │  │
│             │  └──────────────────────────────────────┘  │
│             │                                            │
│             ├────────────────────────────────────────────┤
│             │  OpenAI (gpt-4o)  ● Connected    v1.0.0   │
└─────────────┴────────────────────────────────────────────┘
```

---

## 3. CV Builder

The CV Builder has two tabs at the top of the content area. Switching is instant — no route change.

```
┌─────────────┬────────────────────────────────────────────┐
│             │  CV Builder                                 │
│  🏠 Home    │                                             │
│             │     [ ✏️ Edit ]     [ 🎨 Preview ]           │
│  📝 CV      │  ─────────────────────────────────────────  │
│    Builder  │                                             │
│             │        (content changes per tab)            │
│  🔍 Job     │                                             │
│    Search   │                                             │
│             │                                             │
│  ⚙ Settings │                                             │
└─────────────┴────────────────────────────────────────────┘
```

### 3A. Edit Tab — Active Interview (Chat + Form Side-by-Side)

```
┌─────────────┬───────────────────────┬────────────────────┐
│             │  CV Builder [Edit] [Preview]               │
│  🏠 Home    │  ───────────────────────────────────────── │
│             │                       │                    │
│  📝 CV      │  Chat Interview      │  CV Form (3/5)     │
│    Builder  │                       │                    │
│             │  ┌─────────────────┐  │  ┌──────────────┐  │
│  🔍 Job     │  │ AI: Welcome     │  │  │ Contact      ▼│  │
│    Search   │  │ back! I see you │  │  │              │  │
│             │  │ have Contact,   │  │  │ Name: John   │  │
│  ⚙ Settings │  │ Summary, and    │  │  │ Email: ...   │  │
│             │  │ Experience done. │  │  │              │  │
│             │  │ Let's work on   │  │  │ Summary    ▼ │  │
│             │  │ Education next. │  │  │ (filled)     │  │
│             │  │                 │  │  │              │  │
│             │  │ What's your     │  │  │ Experience ▼ │  │
│             │  │ highest level   │  │  │ (filled)     │  │
│             │  │ of education?   │  │  │              │  │
│             │  │                 │  │  │ Education  ▼ │  │
│             │  │                 │  │  │ (pending...) │  │
│             │  │                 │  │  │              │  │
│             │  └─────────────────┘  │  │ [Preview ▸]  │  │
│             │                       │  └──────────────┘  │
└─────────────┴───────────────────────┴────────────────────┘
```

### 3B. Preview Tab — Template View

Reached by clicking the "Preview" tab or the "Preview" button in the form's action bar.

```
┌─────────────┬────────────────────────────────────────────┐
│             │  CV Builder [Edit] [🎨 Preview]             │
│  🏠 Home    │  ───────────────────────────────────────── │
│             │                                             │
│  📝 CV      │  Template: [Modern Minimalist     ▼]       │
│    Builder  │                                             │
│             │  ┌────────────────────────────────────────┐ │
│  🔍 Job     │  │                                        │ │
│    Search   │  │         JOHN DOE                        │ │
│             │  │    Senior Frontend Engineer            │ │
│  ⚙ Settings │  │    San Francisco, CA                   │ │
│             │  │    john@example.com                    │ │
│             │  │                                        │ │
│             │  │  ─── Professional Summary ───          │ │
│             │  │  Experienced software engineer with    │ │
│             │  │  5+ years building scalable web...     │ │
│             │  │                                        │ │
│             │  │  ─── Experience ──────────────────     │ │
│             │  │  Sr Frontend Engineer                  │ │
│             │  │  Acme Corp · Jan 2020 — Present        │ │
│             │  │  • Led frontend team of 5...           │ │
│             │  │  • Migrated legacy app to React...     │ │
│             │  │                                        │ │
│             │  │                        (A4 preview)    │ │
│             │  └────────────────────────────────────────┘ │
│             │                                             │
│             │          [ Export PDF ]  [ ◀ Back to Edit ] │
└─────────────┴────────────────────────────────────────────┘
```

### 3C. Chat Panel — All States

**State 1: Empty / Starting Fresh**

```
┌─────────────────────────────────────┐
│  ┌───────────────────────────────┐  │
│  │  I'll be your executive       │  │
│  │  resume writer. I'll guide    │  │
│  │  you through each section.    │  │
│  │                               │  │
│  │  Let's start with your        │  │
│  │  contact information.         │  │
│  │  What's your full name?       │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 💬 AI is typing...            │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────┐       │
│  │ [_____________________] │       │
│  └──────────────────────────┘       │
└─────────────────────────────────────┘
```

**State 2: Active Conversation**

```
┌─────────────────────────────────────┐
│  AI: What's your full name?         │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 👤 John Doe                  │    │
│  └─────────────────────────────┘    │
│                                     │
│  AI: Great! What's your email       │
│      address?                       │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 👤 john@example.com          │    │
│  └─────────────────────────────┘    │
│                                     │
│  AI: And your phone number?         │
│                                     │
│  💬 AI is typing...                 │
│                                     │
│  ┌──────────────────────────┐       │
│  │ [_____________________] │       │
│  └──────────────────────────┘       │
│                                     │
│  [ Done — extract this section ]    │
│  (disabled until AI confirms)       │
└─────────────────────────────────────┘
```

**State 3: Ready to Extract**

```
┌─────────────────────────────────────┐
│  ... (conversation history)         │
│                                     │
│  AI: I have enough detail for       │
│      Contact. Ready to extract or   │
│      would you like to add more?    │
│                                     │
│  ┌──────────────────────────┐       │
│  │ [_____________________] │       │
│  └──────────────────────────┘       │
│                                     │
│  [ ✅ Done — extract this section ] │
│  (enabled, pulsing glow)            │
└─────────────────────────────────────┘
```

**State 4: Extracting (Loading)**

```
┌─────────────────────────────────────┐
│  ┌───────────────────────────────┐  │
│  │  Extracting Contact section   │  │
│  │                               │  │
│  │  ⏳ Processing your info...   │  │
│  │                               │  │
│  │  (usually takes 2-5 seconds)  │  │
│  └───────────────────────────────┘  │
│                                     │
│  (input disabled during extraction) │
└─────────────────────────────────────┘
```

**State 5: Extraction Complete → Form Populated**

```
┌─────────────────────────────────────┐
│  ✅ Contact extracted successfully! │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  Contact information has been  │  │
│  │  added to your CV. Review it  │  │
│  │  in the form panel on the     │  │
│  │  right.                        │  │
│  │                               │  │
│  │  Now let's talk about your    │  │
│  │  professional background.     │  │
│  │                               │  │
│  │  What would you say is your   │  │
│  │  defining professional        │  │
│  │  summary?                      │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────┐       │
│  │ [_____________________] │       │
│  └──────────────────────────┘       │
└─────────────────────────────────────┘
```

**State 6: Error (Connection Lost)**

```
┌─────────────────────────────────────┐
│  ⚠ Connection lost                  │
│                                     │
│  Could not reach the AI provider.   │
│  Your CV data is safely saved.      │
│                                     │
│  ┌──────────────────────────────┐   │
│  │  [  Retry  ]  [ Open Settings ]│ │
│  └──────────────────────────────┘   │
│                                     │
│  (input disabled until retry)       │
└─────────────────────────────────────┘
```

### 3D. CV Builder — All Sections Complete

```
┌─────────────┬────────────────────────────────────────────┐
│             │                                            │
│  🏠 Home    │  ✅ All sections complete!                 │
│             │                                            │
│  📝 CV      │  ┌─ Contact ────────────────────────────┐  │
│    Builder  │  │ John Doe · john@example.com          │  │
│             │  │ San Francisco, CA                     │  │
│  🔍 Job     │  └────────────────────────────────────┘  │
│    Search   │                                            │
│             │  ┌─ Executive Summary ──────────────────┐  │
│  ⚙ Settings │  │ Experienced engineer...              │  │
│             │  └────────────────────────────────────┘  │
│             │                                            │
│             │  ┌─ Experience ──────────────────────────┐  │
│             │  │ Sr Frontend Engineer @ Acme   (2020-) │  │
│             │  │ Jr Developer @ Beta           (2018-) │  │
│             │  └────────────────────────────────────┘  │
│             │                                            │
│             │  ┌─ Education ───────────────────────────┐  │
│             │  │ B.S. Computer Science — Stanford      │  │
│             │  └────────────────────────────────────┘  │
│             │                                            │
│             │  ┌─ Skills ─────────────────────────────┐  │
│             │  │ React · TypeScript · Node.js · AWS   │  │
│             │  └────────────────────────────────────┘  │
│             │                                            │
│             │  ┌─ Projects ────────────────────────────┐  │
│             │  │ E-commerce Platform (React)           │  │
│             │  │ CI/CD Pipeline (Docker)               │  │
│             │  └────────────────────────────────────┘  │
│             │                                            │
│             │  [ Save Version ]  [ Preview ]  [ Export ] │
└─────────────┴────────────────────────────────────────────┘
```

### 3E. Edit Tab — Manual Edit Mode (No Active Interview)

```
┌─────────────┬────────────────────────────────────────────┐
│             │                                            │
│  🏠 Home    │  CV Builder                    [Save]      │
│             │                                            │
│  📝 CV      │  ┌─ Contact ────────────────────────────┐  │
│    Builder  │  │ Name:    [John Doe              ]    │  │
│             │  │ Email:   [john@example.com      ]    │  │
│  🔍 Job     │  │ Phone:   [+1 555-0100           ]    │  │
│    Search   │  │ Location:[San Francisco, CA     ]    │  │
│             │  │ LinkedIn:[/in/johndoe           ]    │  │
│  ⚙ Settings │  │ Website: [johndoe.dev           ]    │  │
│             │  └────────────────────────────────────┘  │
│             │                                            │
│             │  ┌─ Executive Summary ──────────────────┐  │
│             │  │ ┌──────────────────────────────────┐ │  │
│             │  │ │Experienced software engineer...  │ │  │
│             │  │ │                                  │ │  │
│             │  │ │                         312/500  │ │  │
│             │  │ └──────────────────────────────────┘ │  │
│             │  └────────────────────────────────────┘  │
│             │                                            │
│             │  ┌─ Experience ──────────────────────────┐  │
│             │  │ ┌────────────────────────────────────┐│  │
│             │  │ │ Company: Acme Corp                 ││  │
│             │  │ │ Role:    Sr. Engineer              ││  │
│             │  │ │ Dates:   Jan 2020 — Present [✓]   ││  │
│             │  │ │ ┌────────────────────────────────┐ ││  │
│             │  │ │ │• Led frontend team of 5...     │ ││  │
│             │  │ │ │• Migrated to React...          │ ││  │
│             │  │ │ └────────────────────────────────┘ ││  │
│             │  │ │                         [✕]  [↑↓] ││  │
│             │  │ └────────────────────────────────────┘│  │
│             │  │                         [ + Add Role ] │  │
│             │  └────────────────────────────────────┘  │
│             │                                            │
│             │  ┌─ Skills ─────────────────────────────┐  │
│             │  │ [React] [TypeScript] [Node.js] [✕]  │  │
│             │  │ [Python] [AWS] [Docker] [✕]         │  │
│             │  │ [______] ⏎ to add                     │  │
│             │  └────────────────────────────────────┘  │
│             │                                            │
│             │  ┌─ Projects ────────────────────────────┐  │
│             │  │ (empty — add from chat or manually)   │  │
│             │  │                         [ + Add ]     │  │
│             │  └────────────────────────────────────┘  │
│             │                                            │
│             │  [  Save Changes  ]       Last saved: 2m  │
└─────────────┴────────────────────────────────────────────┘
```

---

## 4. Job Search

### 4A. Empty State (No CV Profile)

Shown when the user navigates to Job Search but hasn't created a CV yet.

```
┌─────────────┬────────────────────────────────────────────┐
│             │                                            │
│  🏠 Home    │  Job Search Matrix                         │
│             │                                            │
│  📝 CV      │         ┌──────────────────────┐          │
│    Builder  │         │  📝 No CV yet         │          │
│             │         │                       │          │
│  🔍 Job     │         │  You need a CV first.  │          │
│    Search   │         │  Create one to start  │          │
│             │         │  matching jobs.        │          │
│  ⚙ Settings │         │                       │          │
│             │         │  [  Create CV →  ]    │          │
│             │         └──────────────────────┘          │
└─────────────┴────────────────────────────────────────────┘
```

### 4B. Initial State (Before Sweep)

```
┌─────────────┬────────────────────────────────────────────┐
│             │                                            │
│  🏠 Home    │  Job Search Matrix                         │
│             │                                            │
│  📝 CV      │  ── Step 1: Select Target Profile ────    │
│    Builder  │                                            │
│             │  Active CV:                                │
│  🔍 Job     │  ┌──────────────────────────────────────┐  │
│    Search   │  │  Software Engineer — V2         ▼    │  │
│             │  │  (Last updated: May 23, 2026)        │  │
│  ⚙ Settings │  └──────────────────────────────────────┘  │
│             │                                            │
│             │  ── Step 2: Sources ────────────────────  │
│             │  (auto-selected based on your CV)          │
│             │                                            │
│             │  ✅ Remote OK                              │
│             │  ✅ We Work Remotely                       │
│             │  ✅ HN Who's Hiring                        │
│             │  ☐ Built In                                │
│             │  ☐ AngelList                               │
│             │                                            │
│             │  Estimated coverage: 3 of 8 sources        │
│             │  ⚠ Results vary by industry & location     │
│             │                                            │
│             │  [  Start Career Sweep  ]                  │
└─────────────┴────────────────────────────────────────────┘
```

### 4C. Sweep In Progress (Live Results Streaming)

```
┌─────────────┬────────────────────────────────────────────┐
│             │                                            │
│  🏠 Home    │  Job Search Matrix                         │
│             │                                            │
│  📝 CV      │  Career Sweep in progress...               │
│    Builder  │                                            │
│             │  ┌──────────────────────────────────────┐  │
│  🔍 Job     │  │  Progress                             │  │
│    Search   │  │  ████████░░░░ 32/45 postings found   │  │
│             │  │  ████████░░░░ 28/45 embedded          │  │
│  ⚙ Settings │  │  ████████░░░░ 22/45 matched          │  │
│             │  │                                      │  │
│             │  │  By source:                           │  │
│             │  │  ✅ Remote OK         12 postings     │  │
│             │  │  🔄 We Work Remotely   8/15          │  │
│             │  │  ⏳ HN Who's Hiring   queued          │  │
│             │  │  ❌ Built In          unreachable     │  │
│             │  └──────────────────────────────────────┘  │
│             │                                            │
│             │  Live results (partial — 5 shown so far):  │
│             │                                            │
│             │  ┌──────────────────────────────────────┐  │
│             │  │  Sr Frontend @ Acme    92%  👍  👎   │  │
│             │  │  SWE II @ Beta         85%  👍  👎   │  │
│             │  │  (3 more loading...)                  │  │
│             │  └──────────────────────────────────────┘  │
│             │                                            │
│             │  [  Cancel Sweep  ]                        │
└─────────────┴────────────────────────────────────────────┘
```

### 4D. Results View (Sweep Complete)

```
┌─────────────┬────────────────────────────────────────────┐
│             │                                            │
│  🏠 Home    │  Job Search Matrix                         │
│             │                                            │
│  📝 CV      │  Found 12 matching positions  ✅ Complete  │
│    Builder  │                                            │
│             │  ┌─ Search & Filter ────────────────────┐  │
│  🔍 Job     │  │ [Search by keyword...         🔍]   │  │
│    Search   │  │ Location: [All ▼]  Company: [All ▼] │  │
│             │  └──────────────────────────────────────┘  │
│  ⚙ Settings │                                            │
│             │  ┌──────────────────────────────────────┐  │
│             │  │  Sr Frontend Engineer                 │  │
│             │  │  Acme Corp · Remote, US               │  │
│             │  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  │
│             │  │  Match: 92%                  👍  👎  │  │
│             │  │                                      │  │
│             │  │  🔍 Your 5+ years React experience,  │  │
│             │  │     team leadership, and TypeScript  │  │
│             │  │     expertise align well.             │  │
│             │  │                                      │  │
│             │  │  📋 Missing: GraphQL, Playwright     │  │
│             │  │  💰 Est. Range: $140k–$180k          │  │
│             │  │  📅 Posted: 2 days ago               │  │
│             │  │                                      │  │
│             │  │  [ 🔗 View Original ]               │  │
│             │  └──────────────────────────────────────┘  │
│             │                                            │
│             │  ┌──────────────────────────────────────┐  │
│             │  │  Software Engineer II                 │  │
│             │  │  Beta Inc · San Francisco, CA         │  │
│             │  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  │
│             │  │  Match: 85%                  👍  👎  │  │
│             │  │                                      │  │
│             │  │  🔍 Entry-level role with growth...  │  │
│             │  │  💰 Est. Range: $110k–$140k          │  │
│             │  │  📅 Posted: 5 days ago               │  │
│             │  │                                      │  │
│             │  │  [ 🔗 View Original ]               │  │
│             │  └──────────────────────────────────────┘  │
│             │                                            │
│             │                     [ 1 | 2 | 3 → ]       │
│             │                                            │
│             │  ┌──────────────────────────────────────┐  │
│             │  │  [ New Sweep ]  [ Adjust CV 🎯 ]    │  │
│             │  │  [ Export Results ]                   │  │
│             │  └──────────────────────────────────────┘  │
└─────────────┴────────────────────────────────────────────┘
```

### 4E. Adjust CV Flow (Post-Sweep)

Triggered by clicking "Adjust CV" in the results view.

```
┌─────────────┬───────────────────────┬────────────────────┐
│             │  CV Builder [Edit] [Preview]              │
│  🏠 Home    │  ─────────────────────────────────────────│
│             │                       │                    │
│  📝 CV      │  Chat (new session)  │  Skills Section     │
│    Builder  │                       │                    │
│             │  ┌─────────────────┐  │  [React]           │
│  🔍 Job     │  │ AI: Great sweep!│  │  [TypeScript]      │
│    Search   │  │ I noticed your  │  │  [Node.js]         │
│             │  │ top job matches │  │  [Python]          │
│  ⚙ Settings │  │ commonly ask    │  │                    │
│             │  │ for:            │  │   💡 Suggested:     │
│             │  │                 │  │   GraphQL          │
│             │  │ • GraphQL       │  │   Playwright       │
│             │  │ • Playwright    │  │                    │
│             │  │                 │  │                    │
│             │  │ Do you have     │  │  ┌──────────────┐  │
│             │  │ experience with │  │  │ [Add to CV]  │  │
│             │  │ either?         │  │  └──────────────┘  │
│             │  │                 │  │                    │
│             │  │ ┌─────────────┐ │  │  (AI will update   │
│             │  │ │ Yes, I used │ │  │   Skills section   │
│             │  │ │ GraphQL at  │ │  │   + Acme Corp      │
│             │  │ │ Acme Corp   │ │  │   description)     │
│             │  │ └─────────────┘ │  │                    │
│             │  └─────────────────┘  └────────────────────┘
└─────────────┴───────────────────────┴────────────────────┘
```

### 4F. Feedback Re-Sort (Thumbs Up/Down)

After user clicks 👍 or 👎 on a result:

```
Before:                           After (instant re-sort):

1. Sr Frontend @ Acme    92%     1. Sr Frontend @ Acme    92%  👍
2. SWE II @ Beta         85%     2. Fullstack @ TechCo    78%  (moved up)
3. Fullstack @ TechCo    78%     3. SWE II @ Beta         85%  👎
4. Junior Dev @ Startup  62%     4. Junior Dev @ Startup  62%

👍 moves liked jobs up
👎 drops disliked jobs down
Feedback saved for future sweeps too
```
```

---

## 5. Settings Modal

```
┌──────────────────────────────────────────────────────────┐
│  Settings                                         [✕]   │
│                                                           │
│  ── AI Provider ──────────────────────────────────────    │
│                                                           │
│  API Key:                                                 │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ ●●●●●●●●●●●●●●●●●●                          [👁]   │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                           │
│  Provider URL:                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ https://api.openai.com/v1                           │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                           │
│  Model ID:                                                │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ gpt-4o                                         ▼    │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                           │
│  [ Test Connection ]                        ✅ Connected  │
│                                                           │
│  ── Data ─────────────────────────────────────────────    │
│                                                           │
│  Database location: ~/Library/Application Support/         │
│  careers-builder/data/                                     │
│                                                           │
│  CV Versions: 3  |  Saved Searches: 2  |  Cache: 120 MB  │
│                                                           │
│  [  Clear Job Cache  ]    [  Reset Job Feedback  ]        │
│  [  Export All Data  ]                                    │
│                                                           │
│  ── About ─────────────────────────────────────────────    │
│                                                           │
│  Careers Builder v1.0.0                                   │
│  Electron + React + TypeScript                            │
│                                                           │
│  [  Save  ]                          [  Cancel  ]         │
└──────────────────────────────────────────────────────────┘
```

---

## 6. Loading & Error States

### 6A. Loading State (Skeleton)

```
┌─────────────┬────────────────────────────────────────────┐
│             │                                            │
│  🏠 Home    │  ┌──────────────────────────────────────┐  │
│             │  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │  │
│  📝 CV      │  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │  │
│    Builder  │  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │  │
│             │  │                                        │  │
│  🔍 Job     │  │  ▓▓▓▓▓▓▓▓   ▓▓▓▓▓▓▓▓   ▓▓▓▓▓▓▓▓     │  │
│    Search   │  │  ▓▓▓▓▓▓▓▓   ▓▓▓▓▓▓▓▓   ▓▓▓▓▓▓▓▓     │  │
│             │  └──────────────────────────────────────┘  │
│  ⚙ Settings │                                            │
└─────────────┴────────────────────────────────────────────┘
```

### 6B. Error Banner (LLM Connection Lost)

```
┌─────────────┬────────────────────────────────────────────┐
│             │  ⚠ Connection lost                         │
│  🏠 Home    │  Could not reach the AI provider.          │
│             │  ┌──────────────────────────────────────┐  │
│  📝 CV      │  │  [ Retry ]          [ Open Settings ] │  │
│    Builder  │  └──────────────────────────────────────┘  │
│             │                                            │
│  🔍 Job     │  (chat area dimmed, input disabled)        │
│    Search   │                                            │
│             │                                            │
│  ⚙ Settings │                                            │
└─────────────┴────────────────────────────────────────────┘
```

### 6C. Offline Banner

```
┌─────────────┬────────────────────────────────────────────┐
│             │  📡 You're offline                          │
│  🏠 Home    │  CV editing and PDF export still work.     │
│             │  Chat and job search require internet.     │
│  📝 CV      │                                            │
│    Builder  │  (CV form fully editable,                  │
│             │   chat input disabled)                      │
│  🔍 Job     │                                            │
│    Search   │                                            │
│             │                                            │
│  ⚙ Settings │                                            │
└─────────────┴────────────────────────────────────────────┘
```

### 6D. Missing Provider Banner

```
┌─────────────┬────────────────────────────────────────────┐
│             │  ⚙ AI provider not configured               │
│  🏠 Home    │  Set up your API key to use the chat        │
│             │  interview feature.                         │
│  📝 CV      │                                            │
│    Builder  │  ┌──────────────────────────────────────┐  │
│             │  │  [ Open Settings ]                   │  │
│  🔍 Job     │  └──────────────────────────────────────┘  │
│    Search   │                                            │
│             │  (chat panel shows this banner              │
│  ⚙ Settings │   instead of the conversation view)         │
└─────────────┴────────────────────────────────────────────┘
```
