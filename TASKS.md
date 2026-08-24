# PoD Engine — Task List

All tracked improvements and feature tasks for the PoD Engine app. Check off each task as it is completed.

---

## ✅ Completed — UI/UX Bug Fixes (Tasks #1–#22)

| # | Task | Status |
|---|------|--------|
| 1 | Dashboard dropdown not rendered | ✅ |
| 2 | Remove stale `dark` class | ✅ |
| 3 | Experiment detail Recharts colors | ✅ |
| 4 | Audiences Recharts colors | ✅ |
| 5 | Dashboard overview theme tokens | ✅ |
| 6 | StatusPill theme tokens | ✅ |
| 7 | Settings page improvements | ✅ |
| 8 | Help page placeholder links | ✅ |
| 9 | Sign-in/up router navigation | ✅ |
| 10 | Landing pages menu click-outside | ✅ |
| 11 | Landing page detail race condition | ✅ |
| 12 | Signals hardcoded colors | ✅ |
| 13 | Onboarding audience fields | ✅ |
| 14 | Reports export button | ✅ |
| 15 | Sprint page animations | ✅ |
| 16 | History page data + detail | ✅ |
| 17 | New experiment form handler | ✅ |
| 18 | AI Analyst confidence badge | ✅ |
| 19 | FirstMileDevs connect button | ✅ |
| 20 | Team invite button | ✅ |
| 21 | Pricing scroll-to-top | ✅ |
| 22 | Custom 404 page | ✅ |

---

## Phase 1: Make It Real — Core Data Layer

### 23. Connect Onboarding Wizard to Prisma Database
- **File:** `app/onboarding/page.tsx`, `lib/store.ts`, new `app/api/projects/route.ts`
- **Issue:** Wizard collects data into Zustand but never persists it. "Create" on step 6 shows a toast but creates nothing in the database.
- **Fix:** Create `POST /api/projects` API route that creates a `Project` + associated `Experiment` records in Prisma. Wire the wizard's final step to call this API and redirect to `/dashboard/experiments/[newId]`.
- [x] **Status:** Done ✅ — `POST /api/projects` creates Project + Experiment in Prisma. Wizard step 6 calls API, shows loading spinner, redirects to `/dashboard/experiments/[id]`.

### 24. API Routes for Experiments (CRUD)
- **File:** New `app/api/experiments/route.ts`, new `app/api/experiments/[id]/route.ts`
- **Issue:** `demoExperiments` is hardcoded mock data. No API routes exist for experiments.
- **Fix:** Create GET/POST on `/api/experiments` and GET/PATCH/DELETE on `/api/experiments/[id]`. Expand Prisma schema with `Variant` model. Seed database with demo data.
- [x] **Status:** Done ✅ — `Variant` model added to Prisma schema. `GET/POST /api/experiments` and `GET/PATCH/DELETE /api/experiments/[id]` routes created. Seed file updated with 8 variants across 3 experiments.

### 25. API Routes for Leads (CRUD)
- **File:** New `app/api/leads/route.ts`, new `app/api/leads/[id]/route.ts`
- **Issue:** `demoLeads` is hardcoded. Lead status changes are local-only state.
- **Fix:** Add `Lead` model to Prisma schema. Create API routes for listing, creating, and updating leads. Add PATCH for status changes.
- [x] **Status:** Done ✅ — `Lead` model added to Prisma schema with `experiment` relation. `GET/POST /api/leads` and `GET/PATCH/DELETE /api/leads/[id]` routes created. Seed file updated with 8 leads.

### 26. API Routes for Signals & Insights
- **File:** New `app/api/signals/route.ts`, new `app/api/insights/route.ts`
- **Issue:** `demoFunnel`, `demoSignalEvents`, `demoInsights` are all static mock data.
- **Fix:** Add `SignalEvent` and `AIInsight` models to Prisma schema. Create read API routes. Wire signals and AI analyst pages.
- [x] **Status:** Done ✅ — `SignalEvent` and `AIInsight` models added to Prisma schema. `GET /api/signals` and `GET /api/insights` routes created with query param filtering. Seed file updated with 10 signal events and 4 AI insights.

### 27. Zustand Experiment Store
- **File:** New `lib/stores/experiment-store.ts` (or add to `lib/store.ts`)
- **Issue:** Only `useLandingPageStore` has real API integration. Experiments have no store.
- **Fix:** Create `useExperimentStore` following the same pattern as `useLandingPageStore` — with `fetchExperiments`, `addExperiment`, `updateExperiment`, `deleteExperiment`, loading/error states.
- [x] **Status:** Done ✅ — `useExperimentStore` added to `lib/store.ts` with `fetchExperiments`, `addExperiment`, `updateExperiment`, `deleteExperiment`, `updateExperimentStatus`, loading/error states. Follows same pattern as `useLandingPageStore`.

### 28. Zustand Leads Store
- **File:** New `lib/stores/lead-store.ts` (or add to `lib/store.ts`)
- **Issue:** Leads have no store — page uses local state with mock data.
- **Fix:** Create `useLeadStore` with `fetchLeads`, `updateLeadStatus`, loading/error states.
- [x] **Status:** Done ✅ — `useLeadStore` added to `lib/store.ts` with `fetchLeads`, `addLead`, `updateLead`, `deleteLead`, `updateLeadStatus`, loading/error states. Follows same pattern as `useLandingPageStore` and `useExperimentStore`.

### 29. Wire Experiments List Page to Real Data
- **File:** `app/dashboard/experiments/page.tsx`
- **Issue:** Page imports `demoExperiments` from `mock-data.ts`. All data is static.
- **Fix:** Replace `demoExperiments` with `useExperimentStore` hook. Add loading skeleton, error state, and empty state. Keep existing filter/search UI.
- [x] **Status:** Done ✅ — Replaced `demoExperiments` with `useExperimentStore` hook. Added `useEffect` to fetch on mount, `ExperimentsSkeleton` loading state, error card with retry button. Filter/search UI preserved.

### 30. Wire Experiment Detail Page to Real Data
- **File:** `app/dashboard/experiments/[id]/page.tsx`
- **Issue:** Page uses `demoExperiments[0]` hardcoded — always shows the same experiment regardless of URL `id`.
- **Fix:** Read `id` from `useParams()`, fetch experiment from store/API. Add loading state and 404 handling for invalid IDs.
- [x] **Status:** Done ✅ — Reads `id` from `useParams()`. Fetches experiment via `GET /api/experiments/{id}` and insights via `GET /api/insights?experimentId={id}` in parallel. Added `DetailSkeleton` loading state, 404 handling with "Experiment Not Found" card, generic error with retry button. Back-to-Experiments link added. Empty state for no variants. AI Insights now fetched from API instead of `demoInsights`.

### 31. Wire Leads Page to Real Data
- **File:** `app/dashboard/leads/page.tsx`
- **Issue:** Page imports `demoLeads` from `mock-data.ts`. Status changes don't persist.
- **Fix:** Replace `demoLeads` with `useLeadStore` hook. Wire status filter and search to store. Persist status changes via API.
- [ ] **Status:** Pending

### 32. Wire Signals Page to Real Data
- **File:** `app/dashboard/signals/page.tsx`
- **Issue:** Page imports `demoFunnel` and `demoSignalEvents` from `mock-data.ts`.
- **Fix:** Replace with store hooks. Add loading and empty states.
- [ ] **Status:** Pending

---

## Phase 2: Authentication & Multi-Tenancy

### 33. Integrate NextAuth.js
- **File:** New `app/api/auth/[...nextauth]/route.ts`, new `lib/auth.ts`, `prisma/schema.prisma`
- **Issue:** Sign-in/up forms redirect to `/dashboard` with no actual authentication. No session management, no user records.
- **Fix:** Install `next-auth`. Add `User` and `Account` models to Prisma. Configure credentials provider (email/password) and OAuth providers (Google, GitHub). Wrap app in `SessionProvider`.
- [ ] **Status:** Pending

### 34. Protect Dashboard Routes with Middleware
- **File:** New `middleware.ts` at project root
- **Issue:** Anyone can access `/dashboard/*` without authentication. No route protection.
- **Fix:** Add Next.js middleware that checks session on `/dashboard/*` routes. Redirect unauthenticated users to `/sign-in`. Add `getServerSession` checks in all API routes.
- [ ] **Status:** Pending

### 35. Multi-Workspace Support
- **File:** `prisma/schema.prisma`, `app/dashboard/layout.tsx`, new `app/api/workspaces/route.ts`
- **Issue:** Single hardcoded workspace (`demoWorkspace`). No ability to create or switch workspaces.
- **Fix:** Add `Workspace` model to Prisma with user relation. Add workspace switcher dropdown in dashboard header. Scope all queries by current workspace.
- [ ] **Status:** Pending

### 36. Role-Based Access Control
- **File:** `lib/auth.ts`, API routes, `app/dashboard/settings/page.tsx`, `app/dashboard/team/page.tsx`
- **Issue:** `Member` type has roles (`owner`, `admin`, `member`) but they're never checked. Any user can perform any action.
- **Fix:** Add permission middleware that checks user role before mutations. Owners can delete workspace and manage billing. Admins can invite members and change settings. Members can view and create experiments only.
- [ ] **Status:** Pending

---

## Phase 3: Feature Enhancements

### 37. Experiment Creation Wizard (Full Flow)
- **File:** `app/dashboard/experiments/new/page.tsx`
- **Issue:** "Create Experiment" button shows a toast but doesn't persist anything. No variant configuration, no channel selection.
- **Fix:** Wire form to experiments API (task #24). Add variant configuration step (name, headline, CTA per variant). Add traffic allocation sliders. Add channel selection checkboxes. Redirect to detail page on success.
- [ ] **Status:** Pending

### 38. Landing Page Visual Editor
- **File:** `app/dashboard/landing-pages/new/page.tsx`, `app/dashboard/landing-pages/[id]/page.tsx`
- **Issue:** New page form is basic. Detail page shows stats only — no editing capability. Public page `/p/[slug]` uses template data.
- **Fix:** Add visual editor with live preview panel. Template selector (hero, problem, social-proof, pricing, minimal). Edit headline, subheadline, CTA, positioning. Publish/unpublish toggle. Connect `/p/[slug]` to real DB data.
- [ ] **Status:** Pending

### 39. Statistical Significance Calculator
- **File:** New `lib/stats.ts`, `app/dashboard/experiments/[id]/page.tsx`, `app/dashboard/experiments/page.tsx`
- **Issue:** Conversion rates are displayed without any statistical context. No confidence intervals, no p-values, no significance indicators.
- **Fix:** Implement Bayesian significance calculator. Show confidence intervals on variant cards. Add "Reached Significance" badge on experiment cards. Add sample size calculator in experiment detail.
- [ ] **Status:** Pending

### 40. Real AI Integration (OpenAI/Anthropic)
- **File:** `app/dashboard/ai-analyst/page.tsx`, new `app/api/ai/route.ts`
- **Issue:** AI Analyst returns the same hardcoded response for any input after 1 second. No real AI processing.
- **Fix:** Create `/api/ai` route that calls OpenAI (GPT-4o-mini) or Anthropic (Claude) API. Pass experiment data as context in system prompt. Implement streaming responses. Store conversation history in DB.
- [ ] **Status:** Pending

### 41. Real PDF Export
- **File:** `app/dashboard/reports/page.tsx`, new `app/api/export/pdf/route.ts`
- **Issue:** "Export PDF" button calls `window.print()` — produces a browser print dialog, not a proper PDF.
- **Fix:** Implement server-side PDF generation using `@react-pdf/renderer` or Puppeteer. Include verdict card, score breakdown, insights, sprint history, and recommendations.
- [ ] **Status:** Pending

### 42. Real CSV Export
- **File:** `app/dashboard/reports/page.tsx`, `app/dashboard/experiments/page.tsx`, `app/dashboard/leads/page.tsx`
- **Issue:** "CSV Data Export" calls `window.print()`. No actual data export.
- **Fix:** Create utility function that converts data arrays to CSV strings. Add export buttons to experiments, leads, and signals tables. Trigger browser download of `.csv` file.
- [ ] **Status:** Pending

### 43. Notifications System
- **File:** `app/dashboard/layout.tsx`, new `app/api/notifications/route.ts`, `prisma/schema.prisma`
- **Issue:** Bell icon in header shows hardcoded count `7`. No actual notifications exist.
- **Fix:** Add `Notification` model to Prisma. Create notification triggers: experiment reaches significance, lead qualified, sprint ends, team member invited. Add notification dropdown panel with read/unread state and mark-all-as-read.
- [ ] **Status:** Pending

### 44. Global Search (Cmd+K)
- **File:** New `components/ui/command-palette.tsx`, `app/dashboard/layout.tsx`
- **Issue:** Each page has its own local search input. No way to search across the entire dashboard.
- **Fix:** Add `Cmd+K` command palette component (like Linear/Raycast). Search across experiments, leads, landing pages, and history. Keyboard navigation to select results. Register global keydown listener in dashboard layout.
- [ ] **Status:** Pending

---

## Phase 4: UX Polish & Advanced Features

### 45. Dark Mode Toggle
- **File:** `app/layout.tsx`, `app/globals.css`, new `components/ui/theme-toggle.tsx`
- **Issue:** Dark class was removed (bug #2). App is light-only with no way to switch themes.
- **Fix:** Install `next-themes`. Add theme toggle button in dashboard header. Add dark variants for all CSS custom properties. Persist preference in localStorage.
- [ ] **Status:** Pending

### 46. Keyboard Shortcuts
- **File:** New `hooks/use-keyboard-shortcuts.ts`, `app/dashboard/layout.tsx`
- **Issue:** No keyboard navigation anywhere in the app. All interactions require mouse clicks.
- **Fix:** Add global keyboard shortcuts: `J/K` navigate list items, `Enter` opens, `Esc` closes modals, `N` creates new, `Cmd+K` for search, `?` shows shortcut reference overlay.
- [ ] **Status:** Pending

### 47. Experiment Templates
- **File:** `app/dashboard/experiments/new/page.tsx`, new `lib/experiment-templates.ts`
- **Issue:** Creating an experiment requires filling out everything from scratch. No pre-built templates.
- **Fix:** Add template selector: "Message Test", "Pricing Test", "Audience Test", "Channel Test". Pre-fill wizard fields based on selection.
- [ ] **Status:** Pending

### 48. Cohort Analysis View
- **File:** New `app/dashboard/audiences/cohorts/page.tsx`
- **Issue:** Audiences page shows static segment data. No way to track segment performance over time.
- **Fix:** Add cohort analysis view showing conversion, retention, and intent scores by segment over time. Use Recharts line/area charts. Add date range selector.
- [ ] **Status:** Pending

### 49. Experiment Comparison View
- **File:** New `app/dashboard/experiments/compare/page.tsx`
- **Issue:** No way to compare experiments side-by-side. Each experiment is viewed in isolation.
- **Fix:** Add comparison page accepting 2-3 experiment IDs. Show variant performance, funnel stages, and AI insights in a split/grid view. Add "Compare" button with multi-select.
- [ ] **Status:** Pending

### 50. Activity Audit Log
- **File:** New `app/dashboard/history/activity/page.tsx`, new `app/api/activity/route.ts`, `prisma/schema.prisma`
- **Issue:** No record of user actions. No way to see what happened and when.
- **Fix:** Add `ActivityLog` model to Prisma. Track experiment/page/lead/member/settings changes. Display as a filterable timeline page.
- [ ] **Status:** Pending

### 51. Stripe Billing Integration
- **File:** `app/pricing/page.tsx`, `app/dashboard/settings/page.tsx`, new `app/api/billing/route.ts`
- **Issue:** Pricing page shows 3 tiers with CTA buttons that link to sign-up. No actual payment flow.
- **Fix:** Install `stripe` and `@stripe/stripe-js`. Create Stripe Checkout sessions for Sprint ($99), Self-Serve ($299), Studio ($999). Add billing portal in settings. Gate features by plan tier.
- [ ] **Status:** Pending

### 52. Webhook & Integration Support
- **File:** New `app/dashboard/settings/integrations/page.tsx`, new `app/api/webhooks/route.ts`
- **Issue:** No integration capabilities. FirstMileDevs "connect" button is a mock toggle.
- **Fix:** Add webhook configuration UI in settings. Allow users to add webhook URLs for experiment events. Add Slack integration, email digest configuration, and FirstMileDevs API integration.
- [ ] **Status:** Pending

---

## Test Coverage Expansion

### 53. High Priority Tests — Experiments, Leads, Landing Page Store
- **File:** New `tests/pages/experiments.test.tsx`, `tests/pages/leads.test.tsx`, `tests/store/landing-page.test.ts`
- **Issue:** Key pages like experiments and leads are untested. Landing page store has no dedicated tests.
- **Fix:** Add test files for: experiments list page (rendering, filtering, search, status badges), leads page (rendering, filtering, detail panel, intent scores), landing page store (CRUD operations, loading states, error handling).
- [ ] **Status:** Pending

### 54. Medium Priority Tests — Signals, AI Analyst, Settings, API
- **File:** New `tests/pages/signals.test.tsx`, `tests/pages/ai-analyst.test.tsx`, `tests/pages/settings.test.tsx`, `tests/api/landing-pages.test.ts`
- **Issue:** Signals, AI analyst, and settings pages are untested. No API route tests exist.
- **Fix:** Add test files for: signals page (funnel rendering, PoD score breakdown), AI analyst (chat UI, message sending, suggested questions), settings (form inputs, notification toggles, confirm dialog), landing pages API (GET, POST, PATCH, DELETE).
- [ ] **Status:** Pending

### 55. E2E Tests with Playwright
- **File:** New `tests/e2e/onboarding-flow.spec.ts`, `tests/e2e/experiment-crud.spec.ts`
- **Issue:** All current tests are unit/integration tests with jsdom. No end-to-end browser tests.
- **Fix:** Install Playwright. Add E2E test for full onboarding wizard flow (fill all steps, verify redirect). Add E2E test for experiment CRUD (create, view, edit, delete). Add to CI pipeline.
- [ ] **Status:** Pending

---

## Progress Tracker

| Phase | Tasks | Pending | Done |
|-------|-------|---------|------|
| UI/UX Fixes (#1–22) | 22 | 0 | 22 |
| Phase 1: Core Data (#23–32) | 10 | 2 | 8 |
| Phase 2: Auth (#33–36) | 4 | 4 | 0 |
| Phase 3: Features (#37–44) | 8 | 8 | 0 |
| Phase 4: Polish (#45–52) | 8 | 8 | 0 |
| Tests (#53–55) | 3 | 3 | 0 |
| **Total** | **55** | **25** | **30** |