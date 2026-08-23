// ============================================================
// Proof of Demand — Brand Constants & Design Tokens
// ============================================================

export const BRAND = {
  name: "Proof of Demand",
  shortName: "PoD",
  productName: "PoD Engine",
  tagline: "Prove demand before you build.",
  description:
    "AI-powered demand validation for founders who want evidence—not opinions—before spending months building a product.",
  url: "https://proofofdemand.dev",
  firstMileDevs: "FirstMileDevs",
} as const;

export const NAV_ITEMS = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Validation Method", href: "/#validation-method" },
  { label: "Pricing", href: "/pricing" },
  { label: "For Startup Studios", href: "/#startup-studios" },
  { label: "Resources", href: "/#resources" },
] as const;

export const SIDEBAR_NAV = [
  { label: "Overview", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Experiments", href: "/dashboard/experiments", icon: "FlaskConical" },
  { label: "Landing Pages", href: "/dashboard/landing-pages", icon: "Layout" },
  { label: "Audiences", href: "/dashboard/audiences", icon: "Users" },
  { label: "Signals", href: "/dashboard/signals", icon: "Activity" },
  { label: "Leads", href: "/dashboard/leads", icon: "Contact" },
  { label: "AI Analyst", href: "/dashboard/ai-analyst", icon: "Brain" },
  { label: "Reports", href: "/dashboard/reports", icon: "FileText" },
] as const;

export const SIDEBAR_WORKSPACE = [
  { label: "Current Sprint", href: "/dashboard/sprint", icon: "Zap" },
  { label: "Validation History", href: "/dashboard/history", icon: "History" },
  { label: "Team", href: "/dashboard/team", icon: "UsersRound" },
] as const;

export const SIDEBAR_BOTTOM = [
  { label: "FirstMileDevs", href: "/dashboard/firstmile", icon: "Rocket", external: true },
  { label: "Settings", href: "/dashboard/settings", icon: "Settings" },
  { label: "Help", href: "/dashboard/help", icon: "HelpCircle" },
] as const;

export const VERDICTS = {
  strong: {
    verdict: "strong" as const,
    label: "Strong Demand",
    description: "Evidence supports moving toward development.",
    color: "green" as const,
  },
  promising: {
    verdict: "promising" as const,
    label: "Promising",
    description: "Signals are encouraging, but one or two major assumptions remain untested.",
    color: "blue" as const,
  },
  needs_iteration: {
    verdict: "needs_iteration" as const,
    label: "Needs Iteration",
    description: "Some demand exists, but the current positioning or audience needs refinement.",
    color: "amber" as const,
  },
  weak: {
    verdict: "weak" as const,
    label: "Weak Demand",
    description: "Current evidence does not justify significant development investment.",
    color: "red" as const,
  },
} as const;

export const SIGNAL_STRENGTH_LABELS = {
  none: { label: "None", color: "text-text-tertiary" },
  weak: { label: "Weak", color: "text-red" },
  moderate: { label: "Moderate", color: "text-amber" },
  strong: { label: "Strong", color: "text-green" },
  very_strong: { label: "Very Strong", color: "text-blue-bright" },
} as const;