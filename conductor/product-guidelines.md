# Product Guidelines

## Tone & Voice

**Professional & Approachable**

- UI copy uses warm, confident, and clear language — like a helpful career coach.
- Avoids jargon but maintains professionalism appropriate for a career-focused tool.
- Error messages are specific and actionable (e.g., "Could not reach the AI provider. Your CV data is safely saved." not "Error 500").
- Celebratory tone for milestones ("✅ All sections complete!"), instructive tone for guidance.

## Visual Identity

**Clean & Modern**

- Light, airy design with generous whitespace and subtle shadows.
- Rounded corners on cards and modals for approachability.
- Professional SaaS-like aesthetic befitting a career tool.
- Accent colors used sparingly for CTA buttons and status indicators.
- Dark sidebar for navigation contrast.
- Paper-proportion preview area (A4 ratio: 1:1.414) in the template view.

## UX Principles

Derived from analysis of the PRD, TDD, and SCREENS documents:

### 1. State Transparency
- Every background task shows progress: progress bars for sweep progress (found/embedded/matched), per-source status indicators (✅ done / 🔄 in progress / ⏳ queued / ❌ failed), loading skeletons for data-dependent screens.
- Streaming cursor animation during AI responses.
- Inline "Saved!" badge that auto-fades on CV save.
- Status bar at bottom showing provider connection status (● green / ⚠ yellow / ❌ red dot).

### 2. Progressive Disclosure
- First-run wizard reveals configuration in 2 deliberate steps (API Key + URL → Model ID), keeping setup manageable.
- Guided interview works through CV sections one at a time — the user never sees all 6 sections' questions at once.
- CV form uses 6 collapsible sections (all open by default), letting users focus on one area at a time.
- Settings modal groups configuration into logical sections (AI Provider / Data / About).

### 3. Forgiving Input
- Copy-on-write CV versioning: every save creates a new immutable version — users can never lose data.
- Skip sections freely during the interview; empty sections remain empty without breaking the flow.
- Manual edits after AI extraction are allowed and respected — AI never overrides manual form changes.
- Undo-friendly interactions: confirmation dialogs for destructive actions (clear cache, reset feedback).
- Auto-save context: inline save feedback ("Saved!" badge, auto-fades 2s).
- Offline mode preserves form data — edits are possible offline, save is disabled with tooltip.

### 4. Guidance, Not Automation
- AI interviews guide users through the process but never override manual edits.
- The form is the source of truth — chat history is transient and discarded on navigation.
- Extraction requires explicit user confirmation ("Done — extract this section" button).
- Returning users start a new chat session; the AI picks up from the form's current state.

## AI Interaction Pattern

**Guided & Structured**

- The AI acts as an executive resume writer leading the conversation section-by-section in a fixed order: Contact → Executive Summary → Experience → Education → Skills → Projects.
- One question at a time — the AI asks, user responds, AI asks adaptive follow-ups.
- Explicit extraction triggers: user clicks "Done — extract this section" to trigger structured data extraction via `generateObject()`.
- Users can say "skip [section]" to move on, or "go back to [section]" to revisit.
- No chat persistence: navigating away or closing the app discards the conversation. Only structured CV data persists.
- Returning users start a new chat; the AI detects which sections are already populated from the form and starts at the first incomplete section.

## Accessibility Guidelines

- All interactive elements must be keyboard-navigable (Tab, Enter, Escape).
- Form inputs have visible labels and focus states.
- Error messages are announced to screen readers.
- Color is not the sole indicator of state (e.g., status labels accompany colored dots).
- Touch targets are at least 44×44px for interactive controls.

## Writing Style

- Use sentence case for headings and labels (e.g., "Build your CV" not "Build Your CV").
- Button labels are action-oriented: "Start Building", "Save Changes", "Export PDF".
- Error messages follow the pattern: [what happened] + [what user can do].
- Placeholder text in inputs shows expected format or example (e.g., "john@example.com").
- Dates use "Month YYYY" format consistently.
