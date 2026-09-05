// ============================================================
// Proof of Demand — TypeScript Types
// ============================================================

export type Plan = "sprint" | "self-serve" | "studio" | "trial";

export interface Workspace {
  id: string;
  name: string;
  plan: Plan;
  metaPixelId?: string | null;
  googleAdsId?: string | null;
  linkedinPartnerId?: string | null;
  members: Member[];
  createdAt: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
  avatarUrl?: string;
}

export type ProjectStatus = "idea" | "hypothesis" | "testing" | "validated" | "paused" | "weak";

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  status: ProjectStatus;
  podScore: number;
  confidence: number;
  createdAt: string;
  updatedAt: string;
}

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

export type ExperimentStatus = "draft" | "running" | "paused" | "completed" | "winner";
export type Channel = "linkedin" | "meta" | "google" | "twitter";

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

export interface MicroSurveyResponse {
  problem: string;
  willingPrice: string;
  customNotes?: string;
  email?: string;
  name?: string;
}

export interface ExperimentEvent {
  id: string;
  experimentId: string;
  visitorId: string;
  eventType: EventType;
  timestamp: string;
  variantId: string;
  metadata?: Record<string, unknown>;
}

export type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "disqualified";

export interface Lead {
  id: string;
  experimentId: string;
  variantId: string;
  name: string;
  email: string;
  company: string;
  role: string;
  source: string;
  intentScore: number;
  pricingInteraction: boolean;
  isPreorder?: boolean;
  depositAmount?: number;
  stripeSessionId?: string | null;
  status: LeadStatus;
  events: string[];
  createdAt: string;
}

export type InsightType = "demand" | "audience" | "variant" | "pricing" | "recommendation";

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

// ============================================================
// Landing Pages
// ============================================================

export type LandingPageStatus = "draft" | "live" | "paused" | "archived";
export type LandingPageTemplate = "hero" | "problem" | "social-proof" | "pricing" | "minimal";

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

// ============================================================
// Validation History
// ============================================================

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

// ============================================================
// Traffic & Multi-Channel Ad Campaign Kit
// ============================================================

export type AdPlatform = "meta" | "linkedin" | "google" | "twitter";

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

// ============================================================
// Startup Studio Portfolio & Leaderboard
// ============================================================

export type StageGateVerdict = "BUILD" | "ITERATE" | "KILL" | "TESTING";

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