import type {
  Workspace,
  Project,
  Hypothesis,
  Experiment,
  Lead,
  AIInsight,
  PoDScore,
  FunnelStage,
  AudienceConfig,
  ValidationVerdict,
  LandingPage,
  HistoryItem,
} from "./types";
import { VERDICTS } from "./constants";

export const demoWorkspace: Workspace = {
  id: "ws-001",
  name: "Alex Morgan Studios",
  plan: "self-serve",
  members: [
    { id: "m-001", name: "Alex Morgan", email: "alex@example.com", role: "owner" },
    { id: "m-002", name: "Jordan Lee", email: "jordan@example.com", role: "admin" },
  ],
  createdAt: "2025-11-15T00:00:00Z",
};

export const demoProject: Project = {
  id: "proj-001",
  workspaceId: "ws-001",
  name: "AI Reporting Copilot",
  description: "An AI assistant that automatically prepares weekly operational reports for growing SaaS teams.",
  status: "testing",
  podScore: 78,
  confidence: 84,
  createdAt: "2025-12-01T00:00:00Z",
  updatedAt: "2026-01-15T00:00:00Z",
};

export const demoHypotheses: Hypothesis[] = [
  {
    id: "hyp-001", projectId: "proj-001",
    audience: "Operations Managers at SaaS companies (20-200 employees)",
    problem: "Operations managers spend 4-8 hours per week compiling data from multiple tools into reports.",
    valueProposition: "Reduce weekly reporting time by 50% with AI-generated operational reports.",
    pricingAssumption: "$49-$99/month per team",
    confidence: 78, selected: true,
  },
  {
    id: "hyp-002", projectId: "proj-001",
    audience: "Small business owners (5-50 employees)",
    problem: "Small businesses pay analysts or spend founder time manually creating reports.",
    valueProposition: "Eliminate manual reporting labor and reduce operational costs.",
    pricingAssumption: "$29-$59/month",
    confidence: 64, selected: false,
  },
  {
    id: "hyp-003", projectId: "proj-001",
    audience: "Finance teams at mid-market companies",
    problem: "Finance teams deal with reporting errors from manual data aggregation.",
    valueProposition: "Reduce reporting errors by 90% with automated data aggregation.",
    pricingAssumption: "$99-$199/month per team",
    confidence: 58, selected: false,
  },
];

export const demoExperiments: Experiment[] = [
  {
    id: "EXP-2048", projectId: "proj-001", name: "Time-Savings Positioning",
    status: "running", budget: 100, channel: ["linkedin", "meta"],
    startDate: "2026-01-10T00:00:00Z",
    variants: [
      { id: "var-001", experimentId: "EXP-2048", name: "Variant A", headline: "Stop Losing Hours to Manual Reporting", subheadline: "AI-generated weekly reports in minutes, not days.", positioning: "Time savings", cta: "Get Early Access", trafficAllocation: 33, visitors: 604, conversions: 37, conversionRate: 6.2, highIntent: 19, costPerAction: 4.8 },
      { id: "var-002", experimentId: "EXP-2048", name: "Variant B", headline: "Reduce Weekly Reporting Time by 50%", subheadline: "Your AI copilot for operational reporting.", positioning: "Automation + time savings", cta: "Start Free Trial", trafficAllocation: 34, visitors: 621, conversions: 71, conversionRate: 11.4, highIntent: 48, costPerAction: 2.71 },
      { id: "var-003", experimentId: "EXP-2048", name: "Variant C", headline: "Get Your Weekly Numbers in Minutes", subheadline: "AI-powered reports from your existing tools.", positioning: "Speed + simplicity", cta: "See How It Works", trafficAllocation: 33, visitors: 617, conversions: 51, conversionRate: 8.3, highIntent: 31, costPerAction: 3.41 },
    ],
    traffic: 1842, conversions: 159, conversionRate: 8.7, highIntentActions: 98, highIntentRate: 6.9, costPerAction: 3.31,
  },
  {
    id: "EXP-2041", projectId: "proj-001", name: "Problem-Aware Messaging",
    status: "completed", budget: 100, channel: ["linkedin"],
    startDate: "2025-12-20T00:00:00Z", endDate: "2026-01-05T00:00:00Z",
    variants: [
      { id: "var-004", experimentId: "EXP-2041", name: "Variant A", headline: "Reporting Shouldn't Take All Week", positioning: "Pain-focused", cta: "Learn More", trafficAllocation: 33, visitors: 412, conversions: 31, conversionRate: 7.5, highIntent: 18, costPerAction: 4.12 },
      { id: "var-005", experimentId: "EXP-2041", name: "Variant B", headline: "Your Team Deserves Better Data", positioning: "Outcome-focused", cta: "Get Started", trafficAllocation: 34, visitors: 401, conversions: 38, conversionRate: 9.5, highIntent: 24, costPerAction: 3.29 },
      { id: "var-006", experimentId: "EXP-2041", name: "Variant C", headline: "Automated Reports for Growing Teams", positioning: "Solution-focused", cta: "Try Free", trafficAllocation: 33, visitors: 398, conversions: 29, conversionRate: 7.3, highIntent: 15, costPerAction: 4.51 },
    ],
    traffic: 1230, conversions: 89, conversionRate: 7.2, highIntentActions: 52, highIntentRate: 5.8, costPerAction: 3.92,
  },
  {
    id: "EXP-2035", projectId: "proj-001", name: "Pricing Sensitivity",
    status: "running", budget: 100, channel: ["meta", "google"],
    startDate: "2026-01-12T00:00:00Z",
    variants: [
      { id: "var-007", experimentId: "EXP-2035", name: "Variant A", headline: "AI Reporting for $49/Month", positioning: "Lower price anchor", cta: "Start Free Trial", trafficAllocation: 50, visitors: 284, conversions: 22, conversionRate: 7.7, highIntent: 16, costPerAction: 2.86 },
      { id: "var-008", experimentId: "EXP-2035", name: "Variant B", headline: "AI Reporting for $99/Month", positioning: "Premium price anchor", cta: "Start Free Trial", trafficAllocation: 50, visitors: 240, conversions: 14, conversionRate: 5.8, highIntent: 13, costPerAction: 3.93 },
    ],
    traffic: 524, conversions: 36, conversionRate: 6.9, highIntentActions: 22, highIntentRate: 5.1, costPerAction: 4.12,
  },
];

export const demoLeads: Lead[] = [
  { id: "lead-001", experimentId: "EXP-2048", variantId: "var-002", name: "Sarah Chen", email: "sarah.chen@scaleops.io", company: "ScaleOps", role: "VP of Operations", source: "LinkedIn", intentScore: 92, pricingInteraction: true, status: "new", events: ["page_view", "cta_click", "pricing_view", "pricing_toggle", "form_submit"], createdAt: "2026-01-14T14:22:00Z" },
  { id: "lead-002", experimentId: "EXP-2048", variantId: "var-002", name: "Marcus Rodriguez", email: "marcus@growthlane.com", company: "GrowthLane", role: "Head of Ops", source: "Meta", intentScore: 87, pricingInteraction: true, status: "contacted", events: ["page_view", "scroll", "cta_click", "pricing_view", "pricing_toggle"], createdAt: "2026-01-13T09:45:00Z" },
  { id: "lead-003", experimentId: "EXP-2048", variantId: "var-001", name: "Priya Patel", email: "priya@cloudnine.io", company: "CloudNine", role: "Operations Manager", source: "LinkedIn", intentScore: 74, pricingInteraction: false, status: "new", events: ["page_view", "scroll", "cta_click", "form_submit"], createdAt: "2026-01-14T16:10:00Z" },
  { id: "lead-004", experimentId: "EXP-2048", variantId: "var-003", name: "David Kim", email: "david.kim@nexustech.co", company: "NexusTech", role: "CEO", source: "Meta", intentScore: 68, pricingInteraction: true, status: "qualified", events: ["page_view", "cta_click", "pricing_view"], createdAt: "2026-01-12T11:30:00Z" },
  { id: "lead-005", experimentId: "EXP-2048", variantId: "var-002", name: "Emily Watson", email: "emily.w@streamlinehq.com", company: "Streamline", role: "COO", source: "LinkedIn", intentScore: 81, pricingInteraction: true, status: "new", events: ["page_view", "scroll", "cta_click", "pricing_view", "pricing_toggle", "form_submit"], createdAt: "2026-01-15T08:15:00Z" },
  { id: "lead-006", experimentId: "EXP-2041", variantId: "var-005", name: "James Liu", email: "james@datafirst.co", company: "DataFirst", role: "Founder", source: "LinkedIn", intentScore: 55, pricingInteraction: false, status: "disqualified", events: ["page_view", "scroll"], createdAt: "2026-01-02T10:00:00Z" },
  { id: "lead-007", experimentId: "EXP-2048", variantId: "var-002", name: "Rachel Torres", email: "rachel@pivotops.com", company: "PivotOps", role: "Director of Operations", source: "Meta", intentScore: 89, pricingInteraction: true, status: "contacted", events: ["page_view", "cta_click", "pricing_view", "pricing_toggle", "form_submit"], createdAt: "2026-01-14T13:55:00Z" },
  { id: "lead-008", experimentId: "EXP-2035", variantId: "var-007", name: "Tom Bradley", email: "tom.b@acmecorp.com", company: "Acme Corp", role: "Product Manager", source: "LinkedIn", intentScore: 61, pricingInteraction: true, status: "new", events: ["page_view", "scroll", "pricing_view"], createdAt: "2026-01-15T07:20:00Z" },
];

export const demoInsights: AIInsight[] = [
  { id: "ins-001", experimentId: "EXP-2048", type: "variant", title: "Variant B Outperforming on High-Intent Actions", content: "Variant B is generating 2.4x more high-intent interactions than Variant A.", confidence: 87, recommendation: "Shift traffic allocation toward Variant B and test against a higher price point.", evidence: ["Variant B: 11.4% conversion vs. A: 6.2%", "Variant B: 48 high-intent vs. A: 19", "Pricing interaction rate 2.1x higher on B"], createdAt: "2026-01-14T10:00:00Z" },
  { id: "ins-002", experimentId: "EXP-2048", type: "demand", title: "Demand Signal: Strong", content: "Consistent high-intent signals suggest real purchase intent.", confidence: 84, recommendation: "Run pricing experiment $49 vs $79 before scaling.", evidence: ["84% validation confidence", "6.9% high-intent rate", "Consistent conversion across 3 variants"], createdAt: "2026-01-14T10:30:00Z" },
  { id: "ins-003", experimentId: "EXP-2048", type: "audience", title: "Operations Leaders Responding Strongest", content: "Ops leaders have 3.2x higher high-intent rate than general audience.", confidence: 79, recommendation: "Create dedicated experiment targeting ops leaders.", evidence: ["Ops leaders: 14.2% conversion", "General: 4.4% conversion", "Ops leaders: 68% of pricing interactions"], createdAt: "2026-01-13T15:00:00Z" },
  { id: "ins-004", experimentId: "EXP-2048", type: "pricing", title: "Pricing Signal: Moderate", content: "Meaningful purchase intent but insufficient sample for WTP threshold.", confidence: 68, recommendation: "Test $49 vs $79 with winning positioning.", evidence: ["$49: 7.7% conversion", "$99: 5.8% conversion", "Below significance threshold"], createdAt: "2026-01-14T11:00:00Z" },
];

export const demoPoDScore: PoDScore = { overall: 78, problemStrength: 84, audienceFit: 81, messageResonance: 76, behavioralIntent: 73, willingnessToPay: 68, acquisitionEfficiency: 71 };

export const demoFunnel: FunnelStage[] = [
  { label: "Ad Impression", count: 12480, percentage: 100, signalStrength: "none" },
  { label: "Landing Page", count: 1842, percentage: 14.8, signalStrength: "weak" },
  { label: "Engaged Visitor", count: 986, percentage: 53.5, signalStrength: "weak" },
  { label: "CTA Click", count: 412, percentage: 22.4, signalStrength: "moderate" },
  { label: "Pricing Interaction", count: 187, percentage: 10.2, signalStrength: "strong" },
  { label: "Checkout Intent", count: 74, percentage: 4.0, signalStrength: "strong" },
  { label: "Lead Captured", count: 48, percentage: 2.6, signalStrength: "very_strong" },
];

export const demoAudience: AudienceConfig = {
  jobTitle: "Operations Manager, VP of Operations, Head of Ops",
  industry: "SaaS, Technology, B2B Software",
  companySize: "20-200 employees",
  geography: "United States, United Kingdom, Canada",
  seniority: "Manager, Director, VP",
  interests: ["Operations Management", "Business Intelligence", "Process Automation", "SaaS Tools"],
  painPoints: ["Manual reporting takes too long", "Data scattered across multiple tools", "Reports inconsistent or error-prone", "Leadership needs faster insights"],
  estimatedReach: { min: 84000, max: 120000 },
  primarySegment: "Operations Managers at SaaS companies",
  secondarySegment: "Founders / CEOs of small SaaS teams",
};

export const demoVerdict = VERDICTS.promising;

export const demoSignalTimeSeries = [
  { date: "Jan 10", visitors: 180, engagement: 96, highIntent: 12, pricing: 6, conversions: 14 },
  { date: "Jan 11", visitors: 210, engagement: 118, highIntent: 15, pricing: 9, conversions: 18 },
  { date: "Jan 12", visitors: 245, engagement: 132, highIntent: 18, pricing: 12, conversions: 22 },
  { date: "Jan 13", visitors: 268, engagement: 148, highIntent: 22, pricing: 14, conversions: 24 },
  { date: "Jan 14", visitors: 302, engagement: 172, highIntent: 28, pricing: 18, conversions: 28 },
  { date: "Jan 15", visitors: 318, engagement: 186, highIntent: 31, pricing: 21, conversions: 30 },
  { date: "Jan 16", visitors: 319, engagement: 134, highIntent: 21, pricing: 16, conversions: 23 },
];

export interface StudioProject { name: string; podScore: number; confidence: number; stage: string; recommendation: "Build" | "Iterate" | "Pause" | "Kill"; }

export const demoStudioPortfolio: StudioProject[] = [
  { name: "AI Reporting Copilot", podScore: 82, confidence: 89, stage: "Validated", recommendation: "Build" },
  { name: "Local Commerce Engine", podScore: 64, confidence: 71, stage: "Testing", recommendation: "Iterate" },
  { name: "HR Assistant", podScore: 41, confidence: 62, stage: "Weak", recommendation: "Pause" },
  { name: "Creator Monetization", podScore: 73, confidence: 77, stage: "Testing", recommendation: "Iterate" },
  { name: "B2B Marketplace", podScore: 55, confidence: 65, stage: "Hypothesis", recommendation: "Iterate" },
];

export const demoPricingTiers = [
  { name: "Validation Sprint", price: "$2,500", period: "/week", description: "For founders who want hands-on validation.", features: ["AI demand analysis", "Multi-variant landing pages", "Paid experiment setup", "Audience targeting", "Behavioral signal tracking", "AI analyst", "Validation report", "Expert interpretation"], cta: "Book a Sprint", highlighted: false },
  { name: "Self-Serve", price: "$99", period: "/month", description: "For founders running their own experiments.", features: ["Experiment builder", "Landing page variants", "AI analyst", "Analytics dashboard", "Lead capture", "Reports"], cta: "Start Building", highlighted: true },
  { name: "Startup Studio", price: "Custom", period: "", description: "For venture builders validating multiple concepts.", features: ["Multi-project workspace", "Team collaboration", "Portfolio dashboard", "Batch validation", "API access", "FirstMileDevs integration", "Priority support"], cta: "Talk to Sales", highlighted: false },
];

// ============================================================
// Expanded Mock Data — Activity Feed
// ============================================================

export interface ActivityItem {
  id: string;
  type: "experiment" | "lead" | "insight" | "signal" | "report" | "system";
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}

export const demoActivityFeed: ActivityItem[] = [
  { id: "act-001", type: "lead", title: "New lead captured", description: "Sarah Chen from Dataflow signed up via Variant B.", timestamp: "2026-01-16T14:32:00Z", icon: "UserPlus" },
  { id: "act-002", type: "insight", title: "AI insight generated", description: "Time-savings positioning shows 2.1x stronger engagement.", timestamp: "2026-01-16T12:15:00Z", icon: "Brain" },
  { id: "act-003", type: "experiment", title: "Experiment milestone", description: "EXP-2048 reached 1,800 visitors.", timestamp: "2026-01-16T10:45:00Z", icon: "FlaskConical" },
  { id: "act-004", type: "signal", title: "Signal spike detected", description: "Pricing page interactions up 34% in 24 hours.", timestamp: "2026-01-16T09:20:00Z", icon: "TrendingUp" },
  { id: "act-005", type: "lead", title: "High-intent lead", description: "Marcus Johnson viewed pricing 3 times.", timestamp: "2026-01-15T22:10:00Z", icon: "Zap" },
  { id: "act-006", type: "report", title: "Weekly report ready", description: "Week 3 validation summary available.", timestamp: "2026-01-15T18:00:00Z", icon: "FileText" },
  { id: "act-007", type: "experiment", title: "Variant B leading", description: "Variant B maintains 11.4% conversion.", timestamp: "2026-01-15T15:30:00Z", icon: "BarChart3" },
  { id: "act-008", type: "system", title: "Budget alert", description: "EXP-2048 used 78% of its $100 budget.", timestamp: "2026-01-15T12:00:00Z", icon: "AlertTriangle" },
];

// ============================================================
// Expanded Mock Data — Landing Pages
// ============================================================

export interface LandingPageData {
  id: string;
  name: string;
  experimentId: string;
  variantId: string;
  status: "active" | "winner" | "paused" | "draft";
  visitors: number;
  conversions: number;
  conversionRate: number;
  bounceRate: number;
  avgTimeOnPage: number;
  createdAt: string;
  headline: string;
  cta: string;
}

export const demoLandingPages: LandingPage[] = [
  { id: "lp-001", projectId: "proj-001", name: "Variant A — Time Savings", template: "hero", headline: "Stop Losing Hours to Manual Reporting", subheadline: "AI-generated weekly reports in minutes, not days.", cta: "Get Early Access", positioning: "Time Savings", status: "live", experimentId: "EXP-2048", slug: "variant-a-time-savings", visitors: 604, conversions: 37, conversionRate: 6.2, bounceRate: 42, avgTimeOnPage: 48, createdAt: "2026-01-10", updatedAt: "2026-01-16" },
  { id: "lp-002", projectId: "proj-001", name: "Variant B — Automation", template: "problem", headline: "Reduce Weekly Reporting Time by 50%", subheadline: "Your AI copilot for operational reporting.", cta: "Start Free Trial", positioning: "Automation + Time Savings", status: "live", experimentId: "EXP-2048", slug: "variant-b-automation", visitors: 621, conversions: 71, conversionRate: 11.4, bounceRate: 31, avgTimeOnPage: 72, createdAt: "2026-01-10", updatedAt: "2026-01-16" },
  { id: "lp-003", projectId: "proj-001", name: "Variant C — Speed", template: "minimal", headline: "Get Your Weekly Numbers in Minutes", subheadline: "AI-powered reports from your existing tools.", cta: "See How It Works", positioning: "Speed + Simplicity", status: "paused", experimentId: "EXP-2048", slug: "variant-c-speed", visitors: 617, conversions: 51, conversionRate: 8.3, bounceRate: 36, avgTimeOnPage: 58, createdAt: "2026-01-10", updatedAt: "2026-01-14" },
  { id: "lp-004", projectId: "proj-001", name: "Problem-Aware A", template: "problem", headline: "Reporting Shouldn't Take All Week", subheadline: "Automate your operational reports with AI.", cta: "Learn More", positioning: "Pain Point", status: "paused", experimentId: "EXP-2041", slug: "problem-aware-a", visitors: 412, conversions: 31, conversionRate: 7.5, bounceRate: 45, avgTimeOnPage: 39, createdAt: "2025-12-20", updatedAt: "2026-01-10" },
  { id: "lp-005", projectId: "proj-001", name: "Pricing Test — $49", template: "pricing", headline: "AI Reporting for $49/Month", subheadline: "Full-featured operational reports at an affordable price.", cta: "Start Free Trial", positioning: "Pricing", status: "live", experimentId: "EXP-2035", slug: "pricing-test-49", visitors: 284, conversions: 22, conversionRate: 7.7, bounceRate: 38, avgTimeOnPage: 65, createdAt: "2026-01-12", updatedAt: "2026-01-16" },
  { id: "lp-006", projectId: "proj-001", name: "Pricing Test — $99", template: "pricing", headline: "AI Reporting for $99/Month", subheadline: "Enterprise-grade operational reports for growing teams.", cta: "Start Free Trial", positioning: "Pricing", status: "live", experimentId: "EXP-2035", slug: "pricing-test-99", visitors: 240, conversions: 14, conversionRate: 5.8, bounceRate: 48, avgTimeOnPage: 52, createdAt: "2026-01-12", updatedAt: "2026-01-16" },
];

// ============================================================
// Expanded Mock Data — Audience Segments
// ============================================================

export interface AudienceSegment {
  id: string;
  name: string;
  description: string;
  reach: number;
  visitors: number;
  conversions: number;
  conversionRate: number;
  intentScore: number;
  status: "active" | "testing" | "paused";
}

export const demoAudienceSegments: AudienceSegment[] = [
  { id: "seg-001", name: "Ops Managers at SaaS", description: "Operations Managers at SaaS companies with 20-200 employees", reach: 92000, visitors: 684, conversions: 62, conversionRate: 9.1, intentScore: 82, status: "active" },
  { id: "seg-002", name: "VP Operations", description: "VP-level operations leaders at mid-market tech companies", reach: 34000, visitors: 312, conversions: 28, conversionRate: 9.0, intentScore: 78, status: "active" },
  { id: "seg-003", name: "Startup Founders", description: "Founders and CEOs of early-stage startups (5-30 employees)", reach: 156000, visitors: 486, conversions: 31, conversionRate: 6.4, intentScore: 58, status: "testing" },
  { id: "seg-004", name: "Finance Teams", description: "Finance and accounting teams at B2B companies", reach: 67000, visitors: 198, conversions: 18, conversionRate: 9.1, intentScore: 71, status: "testing" },
  { id: "seg-005", name: "Data Analysts", description: "Data analysts and BI professionals", reach: 45000, visitors: 162, conversions: 12, conversionRate: 7.4, intentScore: 64, status: "paused" },
];

// ============================================================
// Expanded Mock Data — Signal Events
// ============================================================

export interface SignalEvent {
  id: string;
  timestamp: string;
  visitorId: string;
  eventType: string;
  variant: string;
  experiment: string;
  metadata: string;
}

export const demoSignalEvents: SignalEvent[] = [
  { id: "evt-001", timestamp: "2026-01-16T14:32:12Z", visitorId: "vis-8821", eventType: "checkout_initiate", variant: "Variant B", experiment: "EXP-2048", metadata: "Started checkout flow" },
  { id: "evt-002", timestamp: "2026-01-16T14:28:45Z", visitorId: "vis-7734", eventType: "pricing_toggle", variant: "Variant B", experiment: "EXP-2048", metadata: "Toggled annual/monthly" },
  { id: "evt-003", timestamp: "2026-01-16T14:25:03Z", visitorId: "vis-6612", eventType: "form_submit", variant: "Variant B", experiment: "EXP-2048", metadata: "Email captured" },
  { id: "evt-004", timestamp: "2026-01-16T14:22:18Z", visitorId: "vis-5598", eventType: "pricing_view", variant: "Variant C", experiment: "EXP-2048", metadata: "Viewed pricing section" },
  { id: "evt-005", timestamp: "2026-01-16T14:18:30Z", visitorId: "vis-4421", eventType: "cta_click", variant: "Variant A", experiment: "EXP-2048", metadata: "Clicked Get Early Access" },
  { id: "evt-006", timestamp: "2026-01-16T14:15:02Z", visitorId: "vis-3387", eventType: "demo_request", variant: "Variant B", experiment: "EXP-2048", metadata: "Requested product demo" },
  { id: "evt-007", timestamp: "2026-01-16T14:12:44Z", visitorId: "vis-2254", eventType: "scroll", variant: "Variant C", experiment: "EXP-2048", metadata: "Scrolled 85% of page" },
  { id: "evt-008", timestamp: "2026-01-16T14:08:11Z", visitorId: "vis-1198", eventType: "page_view", variant: "Variant A", experiment: "EXP-2048", metadata: "Landed from LinkedIn ad" },
  { id: "evt-009", timestamp: "2026-01-16T14:05:33Z", visitorId: "vis-9912", eventType: "pricing_view", variant: "Variant B", experiment: "EXP-2035", metadata: "Viewed $49 pricing" },
  { id: "evt-010", timestamp: "2026-01-16T14:02:19Z", visitorId: "vis-8845", eventType: "cta_click", variant: "Variant B", experiment: "EXP-2035", metadata: "Clicked Start Free Trial" },
];

// ============================================================
// Expanded Mock Data — AI Conversations & Templates
// ============================================================

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  messageCount: number;
}

export const demoConversations: Conversation[] = [
  { id: "conv-001", title: "Demand validation analysis", lastMessage: "The evidence suggests moderate-to-strong demand...", timestamp: "2026-01-16T14:30:00Z", messageCount: 8 },
  { id: "conv-002", title: "Pricing strategy review", lastMessage: "At $49/month, conversion is 32% higher...", timestamp: "2026-01-15T16:20:00Z", messageCount: 5 },
  { id: "conv-003", title: "Audience segment comparison", lastMessage: "Operations managers show the highest intent...", timestamp: "2026-01-14T11:45:00Z", messageCount: 6 },
  { id: "conv-004", title: "Variant performance deep-dive", lastMessage: "Variant B outperforms on every metric...", timestamp: "2026-01-13T09:30:00Z", messageCount: 4 },
];

export const demoAnalysisTemplates = [
  { id: "tpl-001", name: "Demand Verdict", description: "Get an overall demand assessment", prompt: "Is there real demand for this product? Give me a verdict with evidence." },
  { id: "tpl-002", name: "Audience Analysis", description: "Compare audience segments", prompt: "Which audience segment shows the strongest demand signals?" },
  { id: "tpl-003", name: "Pricing Insights", description: "Analyze willingness-to-pay", prompt: "What does the pricing data tell us about willingness to pay?" },
  { id: "tpl-004", name: "Next Experiment", description: "Recommendations for what to test", prompt: "Based on current data, what should we test next?" },
  { id: "tpl-005", name: "Variant Comparison", description: "Deep comparison of variants", prompt: "Compare the variants and recommend which to scale." },
];

// ============================================================
// Expanded Mock Data — Sprint History
// ============================================================

export interface SprintSummary {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
  highIntentActions: number;
  leads: number;
  podScore: number;
  confidence: number;
}

export const demoSprintHistory: SprintSummary[] = [
  { id: "sprint-003", name: "Sprint 3 — Positioning", startDate: "2026-01-10", endDate: "2026-01-16", visitors: 1842, conversions: 159, conversionRate: 8.7, highIntentActions: 98, leads: 48, podScore: 78, confidence: 84 },
  { id: "sprint-002", name: "Sprint 2 — Messaging", startDate: "2025-12-20", endDate: "2026-01-05", visitors: 1211, conversions: 98, conversionRate: 8.1, highIntentActions: 57, leads: 24, podScore: 64, confidence: 71 },
  { id: "sprint-001", name: "Sprint 1 — Problem Fit", startDate: "2025-12-01", endDate: "2025-12-15", visitors: 820, conversions: 52, conversionRate: 6.3, highIntentActions: 31, leads: 12, podScore: 51, confidence: 58 },
];

// ============================================================
// Validation History
// ============================================================

export const demoHistoryItems: HistoryItem[] = [
  { id: "hist-001", date: "Jan 2026", project: "AI Reporting Copilot", verdict: "Promising", score: 78, experiments: 3, status: "blue", description: "Strong signal from operations managers. Variant B (automation + time savings) outperformed by 38% on conversion rate.", topExperiment: "Time-Savings Positioning", keyInsight: "Operations managers at mid-size SaaS companies show the highest willingness to pay for automated reporting." },
  { id: "hist-002", date: "Dec 2025", project: "Workflow Automator", verdict: "Needs Iteration", score: 54, experiments: 2, status: "amber", description: "Moderate interest but pricing sensitivity detected. Need to test lower price points and alternative positioning.", topExperiment: "Pricing Sensitivity Test", keyInsight: "Users are interested in the concept but current pricing exceeds their perceived value threshold." },
  { id: "hist-003", date: "Nov 2025", project: "Dev Analytics", verdict: "Strong Demand", score: 89, experiments: 4, status: "green", description: "Exceptional demand from engineering leaders. High-intent signals across all variants with strong conversion rates.", topExperiment: "Developer Pain Points", keyInsight: "Engineering managers actively search for solutions to reduce time spent on manual status reporting." },
];