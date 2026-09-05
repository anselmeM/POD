# Proof of Demand (PoD) — Product Feature Roadmap

This document outlines the strategic product vision, feature specifications, technical architecture, and implementation phases to scale **Proof of Demand (PoD)** into an end-to-end idea validation platform for founders, startup studios, and product teams.

---

## Strategic Vision

> **"Never spend 6 months building something nobody wants. Prove demand in 7 days."**

While current validation tools stop at basic landing page builders or isolated survey forms, PoD combines:
1. **Real behavioral signal tracking** (clicks, scrolls, pricing engagement, fake-door checkouts).
2. **Quantitative demand scoring** (PoD Score: 0–100, Willingness-to-Pay Index).
3. **AI-driven synthesis** (AI Validation Analyst generating actionable verdicts).

The following 6 feature pillars represent the next evolutionary stage of PoD.

---

## Core Product Principles & Explicit Non-Goals

To maintain high speed, rock-solid reliability, and product focus, PoD adheres to these architectural boundaries:

> [!IMPORTANT]
> **PoD is an Idea Validation Engine, NOT an Ad Agency / AdTech Tool**
>
> ❌ **Explicit Non-Goals (DO NOT BUILD)**:
> - **No Direct Campaign Creators or Ad Account Managers**: Do not build Meta, Google, or LinkedIn campaign creators inside PoD.
> - **No Bidding Algorithms / Budget Management**: Do not attempt to manage ad spend, CPC bidding, or ad delivery status.
> - **No Third-Party Ad Billing**: Do not handle ad spend payments or credit card processing for external ad platforms.
>
> Doing so would clutter the dashboard, create high-maintenance API dependencies, trigger lengthy compliance audits, and distract from PoD's core purpose.
>
> ✅ **The Right Approach (Attribution & Insights Only)**:
> - **Lightweight Pixel & Tag Injection**: Allow founders to paste their Meta Pixel ID, Google Tag, or LinkedIn Partner ID in Settings so conversion events (`Lead`, `HighIntentAction`) fire automatically.
> - **First-Party UTM Capture**: Automatically extract `utm_source`, `utm_campaign`, `gclid`, and `fbclid` from landing page traffic to attribute signups and calculate channel conversion rates.
> - **AI Ad Copy Generator**: Provide ready-to-copy headlines, descriptions, and pre-tagged UTM links for founders to paste into their own Ad Managers in 30 seconds.

---

## Feature 1: Instant AI Smoke Test & Copy Generator

### Overview
Enable founders to go from raw idea to a published, multi-variant smoke test experiment in under 60 seconds without writing code or copy.

### Capabilities
- **Prompt-to-Variants**: Input: *"AI contract review for solo general counsels"*. Output: 2 distinct positioning angles (e.g. Angle A: "Cut 10 hours of busywork" vs. Angle B: "Never miss a liability clause").
- **Full Landing Page Generation**:
  - Hero headline & subheadline
  - 3 concrete pain-point objection handlers
  - Value proposition feature grid
  - Tiered pricing table with fake-door triggers
  - Social proof placeholder testimonials
- **Built-in Live Preview & Visual Customizer**: In-browser inline editing for headlines, CTA button labels, and accent colors before publishing.
- **Auto-Provisioned Tracking**: Tracking pixel (`/api/track`) and event listeners (`page_view`, `scroll`, `cta_click`, `pricing_view`, `checkout_initiate`) are automatically injected.

### Technical Architecture
- **API**: `POST /api/ai/generate-test` powered by Anthropic Claude 3.5 Sonnet / OpenAI GPT-4o.
- **Database**: Automatically creates a `Project`, `Experiment`, 2 `Variant` records, and 2 `LandingPage` records in SQLite / Postgres.
- **Route**: Exposed at `/dashboard/experiments/new/ai-wizard`.

---

## Feature 2: High-Intent Micro-Surveys on Fake-Door Clicks

### Overview
Capture qualitative insights at the exact moment of highest user intent—when a visitor clicks a fake-door CTA (e.g., *"Start Free Pilot"*, *"Pre-Order Now"*, *"Join Beta"*).

### Capabilities
- **Non-Intrusive 2-Step Modal**:
  - **Step 1 — Core Problem**: *"What is the single biggest bottleneck you were hoping this solves?"* (Select from 3 common options or type custom).
  - **Step 2 — Willingness to Pay**: *"What monthly price would make this an absolute no-brainer for your team?"* (Segmented price pills, e.g. `$29`, `$79`, `$199`, `Custom`).
  - **Step 3 — Lead Capture**: Optional email input for early access invitation.
- **AI Thematic Clustering**: The AI Analyst groups text answers into recurring themes, feature requests, and price elasticity curves.
- **Signals Feed Integration**: Micro-survey submissions flow directly into `/dashboard/signals` and `/dashboard/leads`.

### Technical Architecture
- **Component**: `<MicroSurveyModal isOpen={...} onComplete={...} variantId={...} />` embedded into public landing pages (`/p/[slug]`).
- **Endpoint**: `POST /api/signals/survey` recording response metadata into `SignalEvent`.

---

## Feature 3: Stripe Pre-Order & Card Reservation (Skin-in-the-Game Validation)

### Overview
Elevate validation from soft intent (email submissions) to hard intent (financial commitment with payment details on file).

### Capabilities
- **Card-on-File Pre-Authorization (SetupIntent)**:
  - Collects customer credit card via Stripe Elements with $0 immediate charge.
  - Guarantees authentic purchase intent without taking unearned customer revenue.
- **Refundable Micro-Deposits**:
  - Optional $1 or $5 refundable reservation fee to hold a spot in the private beta.
- **Paid Intent Rate (PIR) Metric**:
  - Displays alongside PoD Score: `PIR = (Paid Reservations / Unique Visitors) * 100`.
  - Serves as proof for venture capital pitches, accelerators, and internal studio approval gates.

### Technical Architecture
- **Stripe Integration**: `@stripe/stripe-js` with `stripe.setupIntents.create` and webhook listeners (`setup_intent.succeeded`).
- **Safety**: Automated 30-day auto-cancel or refund triggers if the experiment concludes without launch.

---

## Feature 4: Traffic & Multi-Channel Ad Campaign Kit

### Overview
Solve the #1 barrier founders face during validation: driving qualified, targeted traffic to their experiment.

### Capabilities
- **Ad Creative & Copy Generator**:
  - Generates 3 targeted ad copy variations per audience segment for Meta Ads, LinkedIn Ads, and Google Search.
  - Produces headline (30 chars), description (90 chars), and primary text tailored to the experiment's positioning.
- **Smart UTM Link Builder**:
  - 1-click generation of tracked links:
    `https://pod.engine/p/legal-ai?utm_source=linkedin&utm_medium=cpc&utm_campaign=beta_v1`
- **Multi-Channel Attribution Dashboard**:
  - Compare conversion rates and cost-per-signal by channel (Meta vs. LinkedIn vs. Organic vs. Reddit).

### Technical Architecture
- **Route**: New tab under `/dashboard/experiments/[id]/traffic`.
- **API**: `GET /api/experiments/[id]/traffic-attribution` grouping `SignalEvent` by `metadata.utm_source`.

---

## Feature 5: Startup Studio Portfolio & Idea Leaderboard

### Overview
A centralized command center designed for Startup Studios, Venture Builders, and Incubators running 10+ concurrent validation sprints.

### Capabilities
- **Comparative Leaderboard**:
  - Live ranking table of all studio concepts sorted by PoD Score, CVR, and High-Intent Actions.
- **Automated Stage-Gate Decision Matrix**:
  - **Kill**: PoD Score < 40 after 200 visitors.
  - **Iterate**: PoD Score 40–65 (message resonance weak, audience fit strong).
  - **Build / Seed**: PoD Score > 75 with statistical significance reached (p < 0.05).
- **Executive Export**: 1-click PDF portfolio report for investment committee meetings.

### Technical Architecture
- **Route**: `/dashboard/studio/portfolio`.
- **Database**: Aggregation queries across all projects within an organization workspace.

---

## Feature 6: Automated Slack & Email Sprint Digests

### Overview
Keep founders, product managers, and team members motivated and informed throughout the 7-day validation countdown.

### Capabilities
- **Daily Slack Pulse**:
  - Sends a morning webhook card to `#validation` or `#product`:
    > *"☀️ Day 4 Sprint Pulse: 192 visitors (+18%), 14 high-intent clicks. Variant B is leading with 8.4% CVR. PoD Score: 73/100 (Promising)."*
- **Milestone Alerts**:
  - Instant alert when statistical significance is achieved (`p < 0.05`).
  - Alert when high-value lead (enterprise email domain) submits interest.
- **User Notification Drawer**:
  - In-app actionable notifications with direct links to the relevant experiment or lead.

---

## Prioritization Matrix

| Feature | Impact | Effort | Status |
| :--- | :--- | :--- | :--- |
| **Instant AI Smoke Test Generator** | Critical | Medium | **✅ Shipped** |
| **Stripe Pre-Order & Card Reservation** | High | Medium | **✅ Shipped** |
| **Functional Notification System** | High | Low | **✅ Shipped** |
| **High-Intent Micro-Surveys** | High | Low | **✅ Shipped** |
| **Traffic & Ad Campaign Kit** | High | Medium | **Sprint 2** |
| **Studio Portfolio & Leaderboard** | Medium | Medium | **Sprint 3** |
| **Slack / Email Sprint Digests** | Medium | Low | **Sprint 4** |

---

## Implementation Next Steps

1. **Active Notifications (Now)**: Make in-app notifications interactive, dispatch real-time alerts on key events (lead captured, experiment created, significance reached), and allow individual mark-as-read/delete actions.
2. **Micro-Surveys (Next)**: Implement the 2-step intent modal on landing pages.
3. **AI Smoke Test Generator**: Implement prompt-to-experiment wizard.
