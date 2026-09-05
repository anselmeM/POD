/**
 * ============================================================================
 * PROOF OF DEMAND (PoD) — CORE DOMAIN TYPE SYSTEM
 * ============================================================================
 *
 * This module defines the complete TypeScript contracts and data structures
 * that model Proof of Demand's validation lifecycle.
 *
 * The 4 Validation Pillars of PoD:
 * --------------------------------
 * 1. Pillar 1 — Hypothesis & Persona Definition:
 *    Models startup ideas, target ICP (Ideal Customer Profile), problem statements,
 *    and pricing assumptions (`Project`, `Hypothesis`, `AudienceConfig`).
 *
 * 2. Pillar 2 — Smoke Test Experiments & Multi-Channel Copy:
 *    Models variant splits, fake-door landing pages, Meta/LinkedIn/Google ad variations,
 *    and UTM tracking (`Experiment`, `Variant`, `LandingPage`, `AdCopyVariation`).
 *
 * 3. Pillar 3 — Behavioral Telemetry & Intent Capture:
 *    Models fake-door clicks, micro-surveys, qualified leads, and Stripe card reservations
 *    (`SignalEvent`, `Lead`, `MicroSurveyResponse`, `ChannelAttribution`).
 *
 * 4. Pillar 4 — AI Verdict, Stage-Gate Matrix & Portfolio:
 *    Models automated go/no-go verdicts, willingness-to-pay elasticity, capital preserved,
 *    and weekly sprint digests (`ValidationVerdict`, `PoDScore`, `StudioConcept`, `SprintDigestSummary`).
 */

// ============================================================================
// 1. Workspaces, Members & Subscriptions
// ============================================================================

/**
 * Subscription plan tiers controlling quotas for active tests, AI generations, and team seats.
 */
export type Plan = "sprint" | "self-serve" | "studio" | "trial";

/**
 * Multi-tenant organization workspace container.
 */
export interface Workspace {
  id: string;
  name: string;
  plan: Plan;
  /** Meta/Facebook Pixel ID injected into public landing pages */
  metaPixelId?: string | null;
  /** Google Ads conversion tag or GA4 Measurement ID */
  googleAdsId?: string | null;
  /** LinkedIn Insight Tag Partner ID */
  linkedinPartnerId?: string | null;
  members: Member[];
  createdAt: string;
}

/**
 * Collaborator membership within a workspace.
 */
export interface Member {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
  avatarUrl?: string;
}

// ============================================================================
// 2. Projects & Hypotheses (Pillar 1)
// ============================================================================

/**
 * Lifecycle state of a startup validation concept.
 */
export type ProjectStatus =
  | "idea"
  | "hypothesis"
  | "testing"
  | "validated"
  | "paused"
  | "weak";

/**
 * Core validation project containing experiments, smoke tests, and market signals.
 */
export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  status: ProjectStatus;
  /** Proof of Demand Score (0-100) combining conversion rate, intent, and willingness to pay */
  podScore: number;
  /** Statistical confidence percentage (0-100%) */
  confidence: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Falsifiable startup hypothesis tested during a validation sprint.
 */
export interface Hypothesis {
  id: string;
  projectId: string;
  audience: string;
  problem: string;
  valueProposition: string;
  pricingAssumption: string;
  confidence: number;
  selected: boolean;
}

// ============================================================================
// 3. Experiments, Variants & Traffic (Pillar 2)
// ============================================================================

export type ExperimentStatus =
  | "draft"
  | "running"
  | "paused"
  | "completed"
  | "winner";

export type Channel = "linkedin" | "meta" | "google" | "twitter";

/**
 * A/B or multi-variant smoke test testing competing value propositions.
 */
export interface Experiment {
  id: string;
  projectId: string;
  name: string;
  status: ExperimentStatus;
  budget: number;
  channel: Channel[];
  startDate: string;
  endDate?: string;
  variants: Variant[];
  traffic: number;
  conversions: number;
  conversionRate: number;
  highIntentActions: number;
  highIntentRate: number;
  costPerAction: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * A single positioning or copy variant within an experiment.
 */
export interface Variant {
  id: string;
  experimentId: string;
  name: string;
  headline: string;
  subheadline?: string;
  positioning: string;
  cta: string;
  trafficAllocation: number;
  visitors: number;
  conversions: number;
  conversionRate: number;
  highIntent: number;
  costPerAction: number;
}

// ============================================================================
// 4. Behavioral Telemetry, Signals & Micro-Surveys (Pillar 3)
// ============================================================================

/**
 * Categorical events emitted by landing page visitors.
 */
export type EventType =
  | "page_view"
  | "scroll"
  | "cta_click"
  | "pricing_view"
  | "pricing_toggle"
  | "demo_request"
  | "checkout_initiate"
  | "payment_start"
  | "form_submit"
  | "preorder_placed"
  | "survey_response";

/**
 * 2-Step qualitative feedback response captured during fake-door CTA clicks.
 */
export interface MicroSurveyResponse {
  problem: string;
  willingPrice: string;
  customNotes?: string;
  email?: string;
  name?: string;
}

/**
 * Immutable time-series telemetry event for funnel and statistical analysis.
 */
export interface ExperimentEvent {
  id: string;
  experimentId: string;
  visitorId: string;
  eventType: EventType;
  timestamp: string;
  variantId: string;
  metadata?: Record<string, unknown>;
}

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "converted"
  | "disqualified";

/**
 * Qualified prospective customer captured via smoke test CTA or Stripe card hold.
 */
export interface Lead {
  id: string;
  experimentId: string;
  variantId: string;
  name: string;
  email: string;
  company: string;
  role: string;
  source: string;
  /** Intent score (0-100) reflecting depth of engagement (e.g. 98 for card reservations) */
  intentScore: number;
  pricingInteraction: boolean;
  /** Flag indicating whether the customer authorized a card pre-order reservation */
  isPreorder?: boolean;
  /** Refundable deposit amount in cents (e.g. 100 for $1.00 or 2500 for $25.00) */
  depositAmount?: number;
  stripeSessionId?: string | null;
  status: LeadStatus;
  events: string[];
  createdAt: string;
}

// ============================================================================
// 5. AI Verdicts & Scoring Engine (Pillar 4)
// ============================================================================

export type InsightType =
  | "demand"
  | "audience"
  | "variant"
  | "pricing"
  | "recommendation";

export interface AIInsight {
  id: string;
  experimentId: string;
  type: InsightType;
  title: string;
  content: string;
  confidence: number;
  recommendation: string;
  evidence: string[];
  createdAt: string;
}

export type Verdict = "strong" | "promising" | "needs_iteration" | "weak";

export interface ValidationVerdict {
  verdict: Verdict;
  label: string;
  description: string;
  color: "green" | "blue" | "amber" | "red";
}

/**
 * Multi-dimensional Proof of Demand score breakdown across key validation vectors.
 */
export interface PoDScore {
  overall: number;
  problemStrength: number;
  audienceFit: number;
  messageResonance: number;
  behavioralIntent: number;
  willingnessToPay: number;
  acquisitionEfficiency: number;
}

export interface FunnelStage {
  label: string;
  count: number;
  percentage: number;
  signalStrength: "none" | "weak" | "moderate" | "strong" | "very_strong";
}

export interface AudienceConfig {
  jobTitle: string;
  industry: string;
  companySize: string;
  geography: string;
  seniority: string;
  interests: string[];
  painPoints: string[];
  estimatedReach: { min: number; max: number };
  primarySegment: string;
  secondarySegment: string;
}

export interface ReportSection {
  title: string;
  content: string;
  data?: Record<string, unknown>;
}

// ============================================================================
// 6. Public Landing Pages
// ============================================================================

export type LandingPageStatus = "draft" | "live" | "paused" | "archived";
export type LandingPageTemplate =
  | "hero"
  | "problem"
  | "social-proof"
  | "pricing"
  | "minimal";

export interface LandingPage {
  id: string;
  projectId: string;
  name: string;
  template: LandingPageTemplate;
  headline: string;
  subheadline: string;
  cta: string;
  positioning: string;
  status: LandingPageStatus;
  experimentId?: string;
  slug: string;
  preorderEnabled?: boolean;
  depositAmount?: number;
  priceAnchor?: number;
  surveyEnabled?: boolean;
  surveyQuestions?: string;
  visitors: number;
  conversions: number;
  bounceRate: number;
  avgTimeOnPage: number;
  conversionRate: number;
  trackingPixels?: {
    metaPixelId?: string | null;
    googleAdsId?: string | null;
    linkedinPartnerId?: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// 7. Validation History & Sprint Log
// ============================================================================

export interface HistoryItem {
  id: string;
  date: string;
  project: string;
  verdict: string;
  score: number;
  experiments: number;
  status: "green" | "blue" | "amber" | "red";
  description: string;
  topExperiment: string;
  keyInsight: string;
}

// ============================================================================
// 8. Traffic & Multi-Channel Ad Campaign Kit
// ============================================================================

export type AdPlatform = "meta" | "linkedin" | "google" | "twitter";

/**
 * Platform-compliant ad creative tailored for Meta, LinkedIn, Google Search, or Twitter.
 */
export interface AdCopyVariation {
  id: string;
  platform: AdPlatform;
  angle: string;
  headline: string;
  description: string;
  primaryText?: string;
  displayPath?: string;
  headlines?: string[];
  descriptions?: string[];
  callToAction: string;
  recommendedAudience: string;
  estimatedCpc: number;
}

export interface UtmCampaignPreset {
  platform: string;
  source: string;
  medium: string;
  campaign: string;
  term?: string;
  content?: string;
}

/**
 * First-party multi-channel traffic attribution row.
 */
export interface ChannelAttribution {
  channel: string;
  source: string;
  visitors: number;
  leads: number;
  preorders: number;
  conversionRate: number;
  costPerLead?: number;
  isWinner?: boolean;
}

// ============================================================================
// 9. Startup Studio Portfolio & Leaderboard
// ============================================================================

export type StageGateVerdict = "BUILD" | "ITERATE" | "KILL" | "TESTING";

/**
 * Portfolio concept evaluated under the Stage-Gate Decision Matrix.
 */
export interface StudioConcept {
  id: string;
  projectId: string;
  name: string;
  slug?: string;
  status: string;
  stage: string;
  podScore: number;
  confidence: number;
  visitors: number;
  leads: number;
  preorders: number;
  cvr: number;
  pir: number;
  verdict: StageGateVerdict;
  verdictReason: string;
  topVariant?: string;
  capitalSaved: number;
  updatedAt: string;
  partnerNotes?: string;
}

/**
 * Studio-wide aggregated performance and capital preservation summary.
 */
export interface PortfolioSummary {
  totalConcepts: number;
  greenlitCount: number;
  iteratingCount: number;
  killedCount: number;
  testingCount: number;
  avgPodScore: number;
  avgPir: number;
  totalCapitalSaved: number;
}

// ============================================================================
// 10. Automated Slack & Email Sprint Digests
// ============================================================================

export interface SprintDigestMetrics {
  totalVisitors: number;
  visitorsGrowth: number; // WoW % change
  totalLeads: number;
  leadsGrowth: number;    // WoW % change
  conversionRate: number; // %
  paidIntentRate: number; // %
  totalPreorders: number;
  totalDepositHeld: number; // in USD
  capitalPreserved: number; // in USD
  avgPodScore: number;
}

export interface SprintTopVariant {
  experimentId: string;
  experimentName: string;
  variantId: string;
  variantName: string;
  headline: string;
  conversionRate: number;
  visitors: number;
  leads: number;
  preorders: number;
  isSignificant: boolean;
  pValue: number;
}

export interface SprintStageGateChange {
  projectId: string;
  projectName: string;
  verdict: StageGateVerdict;
  podScore: number;
  reason: string;
  capitalSaved: number;
}

export interface SprintDigestSummary {
  workspaceId: string;
  workspaceName: string;
  periodStart: string; // ISO string
  periodEnd: string;   // ISO string
  sprintNumber: number;
  sprintDay: number;   // e.g. 7 of 7
  metrics: SprintDigestMetrics;
  topVariant: SprintTopVariant | null;
  stageGateChanges: SprintStageGateChange[];
  aiExecutiveTakeaway: string;
  generatedAt: string;
}

export interface DigestDeliveryConfig {
  slackWebhookUrl?: string | null;
  emailRecipients: string[];
  sendSlack: boolean;
  sendEmail: boolean;
  frequency: "weekly" | "daily_sprint";
  active: boolean;
}