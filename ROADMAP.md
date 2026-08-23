# PoD Engine — Product Roadmap

Strategic roadmap for evolving PoD Engine from a polished prototype into a production-ready SaaS platform.

---

## Current State (v0.1 — Prototype)

**What works:**
- 20+ pages with polished UI, Framer Motion animations, and responsive design
- Onboarding wizard (6 steps) with Zustand store
- Landing Pages module with real CRUD via Prisma + SQLite + API routes
- Comprehensive mock data for experiments, leads, signals, insights, audiences
- Recharts visualizations across dashboard, signals, audiences, reports
- Marketing site (landing, pricing, sign-in, sign-up) with rich components
- 22/22 UI/UX bugs fixed
- Test suite: 10 files, 63 tests, 0 failures

**What's missing:**
- Only Landing Pages have real data persistence — everything else is mock data
- No authentication — sign-in/up redirect directly to dashboard
- No real AI integration — AI Analyst returns hardcoded responses
- No real export — PDF/CSV buttons call `window.print()`
- No notifications — bell icon shows hardcoded count
- No statistical rigor — conversion rates shown without significance testing

---

## Phase 1: Make It Real (Core Data Layer)

> **Goal:** Replace mock data with real database-backed CRUD operations across all modules.

### 1.1 Connect Onboarding Wizard to Database
- **Current:** Wizard collects data into Zustand but never persists it. "Create" on step 6 shows a toast but creates nothing.
- **Fix:** Add `POST /api/projects` that creates a `Project` + associated `Experiment` records in Prisma. Wire wizard's final step to call this API and redirect to the new experiment detail page.
- **Files:** `app/onboarding/page.tsx`, `lib/store.ts`, new `app/api/projects/route.ts`

### 1.2 API Routes for Experiments
- **Current:** `demoExperiments` is hardcoded mock data. No API routes exist.
- **Fix:** Create `app/api/experiments/route.ts` (GET, POST) and `app/api/experiments/[id]/route.ts` (GET, PATCH, DELETE). Expand Prisma schema with `Variant` model. Create Zustand experiment store.
- **Impact:** Experiments list, detail, and new experiment pages become functional.

### 1.3 API Routes for Leads
- **Current:** `demoLeads` is hardcoded. Lead status changes are local-only.
- **Fix:** Add `Lead` model to Prisma schema, create API routes, wire leads page to real data.

### 1.4 API Routes for Signals & Insights
- **Current:** `demoFunnel`, `demoSignalEvents`, `demoInsights` are all static.
- **Fix:** Add Prisma models for `SignalEvent` and `AIInsight`. Create API routes. Wire signals and AI analyst pages.

### 1.5 Zustand Stores for All Entities
- **Current:** Only `useLandingPageStore` has real API integration. `useWizardStore` and `useSidebarStore` are local-only.
- **Fix:** Create `useExperimentStore`, `useLeadStore`, `useInsightStore` following the same pattern as `useLandingPageStore`.

### 1.6 Wire All Dashboard Pages to Real Data
- **Current:** Experiments, leads, signals, audiences, AI analyst, reports, sprint, history — all use `demoX` imports from `mock-data.ts`.
- **Fix:** Replace all `demoX` imports with store hooks. Add loading states, error handling, and empty states.

---

## Phase 2: Authentication & Multi-Tenancy

> **Goal:** Secure the app with real authentication and support multiple workspaces.

### 2.1 Integrate NextAuth.js
- **Current:** Sign-in/up forms redirect to `/dashboard` with no auth. No session management.
- **Fix:** Integrate NextAuth.js with email/password credentials provider, OAuth providers (Google, GitHub), session provider, and User model in Prisma linked to Workspace.
- **Files:** New `app/api/auth/[...nextauth]/route.ts`, `lib/auth.ts`, `prisma/schema.prisma`

### 2.2 Protect Dashboard Routes
- **Current:** Anyone can access `/dashboard/*` without authentication.
- **Fix:** Add Next.js middleware to redirect unauthenticated users to `/sign-in`. Add `getServerSession` checks in API routes.

### 2.3 Multi-Workspace Support
- **Current:** Single hardcoded workspace (`demoWorkspace`).
- **Fix:** Add workspace creation, workspace switching (dropdown in header), and workspace-scoped data queries.

### 2.4 Role-Based Access Control
- **Current:** `Member` type has roles (`owner`, `admin`, `member`) but they're unused.
- **Fix:** Implement permission checks — only `owner`/`admin` can delete workspace, invite members, change settings. Members can only view and create experiments.

---

## Phase 3: Feature Enhancements

> **Goal:** Make the app genuinely useful with real AI, exports, and notifications.

### 3.1 Experiment Creation Wizard (Full Flow)
- **Current:** `experiments/new/page.tsx` has a form but "Create Experiment" shows a toast — doesn't persist.
- **Fix:** Wire to experiments API. Add variant configuration, traffic allocation sliders, channel selection, budget input, and redirect to detail page on success.

### 3.2 Landing Page Visual Editor
- **Current:** `landing-pages/new/page.tsx` exists but is basic. Detail page shows stats only.
- **Fix:** Add a visual editor with live preview, template selection (hero, problem, social-proof, pricing, minimal), headline/subheadline/CTA editing, and publish flow. Connect `/p/[slug]` to real DB data.

### 3.3 Statistical Significance Calculator
- **Current:** Conversion rates displayed without statistical context.
- **Fix:** Add Bayesian or frequentist significance calculator. Show confidence intervals, p-values, and "reached significance" badges on experiment cards. Add sample size calculator.

### 3.4 Real AI Integration
- **Current:** AI Analyst page returns the same hardcoded response for any input after 1 second.
- **Fix:** Integrate with OpenAI or Anthropic API. Pass experiment data + context as system prompt. Stream responses. Store conversation history in DB.

### 3.5 Real PDF Export
- **Current:** "Export PDF" calls `window.print()`.
- **Fix:** Implement real PDF generation using `@react-pdf/renderer` or server-side Puppeteer. Include charts, score breakdowns, verdict, and recommendations.

### 3.6 Real CSV Export
- **Current:** "CSV Data Export" calls `window.print()`.
- **Fix:** Generate CSV from experiment data, leads, or signals. Add export buttons to each data table.

### 3.7 Notifications System
- **Current:** Bell icon shows hardcoded count `7`. No actual notifications.
- **Fix:** Add `Notification` model in Prisma. Create notification triggers (experiment reaches significance, lead qualified, sprint ends, team invites). Add notification dropdown with read/unread state.

### 3.8 Global Search (Cmd+K)
- **Current:** Each page has its own local search. No cross-page search.
- **Fix:** Add a `Cmd+K` command palette (like Linear/Raycast) that searches across experiments, leads, landing pages, and history. Use keyboard navigation to select results.

---

## Phase 4: UX Polish & Advanced Features

> **Goal:** Make the app delightful to use and ready for paying customers.

### 4.1 Dark Mode Toggle
- **Current:** Dark class was removed (bug #2). App is light-only.
- **Fix:** Add theme toggle with `next-themes`. The CSS variables infrastructure is already in place — add dark variants for all `--dash-*` and `--text-*` tokens.

### 4.2 Keyboard Shortcuts
- **Fix:** Add keyboard navigation: `J/K` to move between list items, `Enter` to open, `Esc` to close modals, `N` to create new, `Cmd+K` for global search, `?` to show shortcut reference.

### 4.3 Experiment Templates
- **Fix:** Pre-built experiment templates that pre-fill the wizard: "Message Test" (3 variants testing different value props), "Pricing Test" (3 variants at different price points), "Audience Test" (same message to 3 segments), "Channel Test" (same message across LinkedIn, Meta, Google).

### 4.4 Cohort Analysis
- **Fix:** Add a cohort view showing how different audience segments perform over time. Track retention, conversion, and intent scores by cohort.

### 4.5 Experiment Comparison
- **Fix:** Allow side-by-side comparison of 2-3 experiments. Show variant performance, funnel stages, and AI insights in a split view.

### 4.6 Activity Audit Log
- **Fix:** Track all user actions (experiment created/paused/completed, landing page published/deleted, lead status changed, member invited/removed, settings changed). Display as a filterable timeline.

### 4.7 Stripe Billing Integration
- **Current:** Pricing page exists with 3 tiers but no payment flow.
- **Fix:** Integrate Stripe Checkout for Sprint ($99), Self-Serve ($299), and Studio ($999) tiers. Add billing portal in settings. Gate features by plan.

### 4.8 Webhook & Integration Support
- **Fix:** Allow users to configure webhooks for experiment events. Add Slack notifications, email digests, Zapier/Make connector, and FirstMileDevs API integration (currently mock).

---

## Test Coverage Expansion

**Current:** 10 test files, 63 tests, 0 failures.

| Priority | Test File | What It Covers |
|----------|-----------|----------------|
| 🔴 High | `tests/pages/experiments.test.tsx` | Experiments list, filtering, search, status badges |
| 🔴 High | `tests/pages/leads.test.tsx` | Leads page, filtering, detail panel, intent scores |
| 🔴 High | `tests/store/landing-page.test.ts` | Landing page store CRUD operations |
| 🟡 Medium | `tests/pages/signals.test.tsx` | Signals page rendering, funnel stages |
| 🟡 Medium | `tests/pages/ai-analyst.test.tsx` | AI Analyst chat UI, message sending |
| 🟡 Medium | `tests/pages/settings.test.tsx` | Settings form, notification toggles, confirm dialog |
| 🟡 Medium | `tests/api/landing-pages.test.ts` | API route integration tests |
| 🔵 Low | `tests/pages/dashboard.test.tsx` | Dashboard overview, stats, charts |
| 🔵 Low | `tests/pages/reports.test.tsx` | Reports page, verdict, score breakdown |
| 🔵 Low | `tests/pages/sprint.test.tsx` | Sprint page, active experiments |
| 🔵 Low | `tests/pages/team.test.tsx` | Team page, invite flow |
| 🔵 Low | `tests/e2e/onboarding-flow.spec.ts` | Full onboarding wizard E2E (Playwright) |
| 🔵 Low | `tests/e2e/experiment-crud.spec.ts` | Experiment create/read/update/delete E2E |

---

## Recommended Execution Order

```
Phase 1 (Make It Real)     ████████████░░░░░░░░░░░░  Highest impact
Phase 2 (Auth)             ██████████░░░░░░░░░░░░░░  Security
Phase 3 (Features)         ████████░░░░░░░░░░░░░░░░  Functionality
Phase 4 (Polish)           ██████░░░░░░░░░░░░░░░░░░  Delight
Test Expansion             ████░░░░░░░░░░░░░░░░░░░░  Reliability
```

---

## Tech Stack Reference

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 7 |
| Styling | Tailwind CSS 4 + CSS Variables |
| State | Zustand 5 |
| Database | SQLite via Prisma 7 (better-sqlite3 adapter) |
| Charts | Recharts 3 |
| Animation | Framer Motion 13 |
| Icons | Lucide React |
| Testing | Vitest + @testing-library/react + jsdom |
| Package Manager | npm |

---

## Notes

- **Antigravity.md** was referenced but does not exist in the repo. This roadmap serves as the strategic document going forward.
- All Phase 1 tasks can be worked on in parallel since they touch different modules.
- Phase 2 (Auth) should be done before any public deployment.
- Phase 3.4 (AI integration) requires an API key budget — consider starting with a single model (e.g., GPT-4o-mini) for cost efficiency.
- Phase 4.7 (Stripe) requires a Stripe account and webhook endpoint — plan for this early.
