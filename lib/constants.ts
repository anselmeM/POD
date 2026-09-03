// ============================================================
// Proof of Demand — Brand Constants & Design Tokens
// ============================================================

import type { LucideIcon } from "lucide-react";
import {
  Activity, Brain, Contact, FileText, FlaskConical, Layout,
  LayoutDashboard, Users,
} from "lucide-react";

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

export const DEMO_USER = {
  name: "Alex Morgan",
  firstName: "Alex",
  email: "alex@example.com",
  initials: "A",
  notificationCount: 7,
} as const;

export const NAV_ITEMS = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Validation Method", href: "/#validation-method" },
  { label: "Pricing", href: "/pricing" },
  { label: "For Startup Studios", href: "/#startup-studios" },
  { label: "Resources", href: "/#resources" },
] as const;

export const DASHBOARD_NAV: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Experiments", href: "/dashboard/experiments", icon: FlaskConical },
  { label: "Signals", href: "/dashboard/signals", icon: Activity },
  { label: "Audiences", href: "/dashboard/audiences", icon: Users },
  { label: "Leads", href: "/dashboard/leads", icon: Contact },
  { label: "AI Analyst", href: "/dashboard/ai-analyst", icon: Brain },
  { label: "Landing Pages", href: "/dashboard/landing-pages", icon: Layout },
  { label: "Reports", href: "/dashboard/reports", icon: FileText },
];

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

export const PRICING_TIERS = [
  {
    name: "Validation Sprint",
    price: "$2,500",
    period: "/week",
    description: "For founders who want hands-on validation.",
    features: [
      "AI demand analysis",
      "Multi-variant landing pages",
      "Paid experiment setup",
      "Audience targeting",
      "Behavioral signal tracking",
      "AI analyst",
      "Validation report",
      "Expert interpretation",
    ],
    cta: "Book a Sprint",
    highlighted: false,
  },
  {
    name: "Self-Serve",
    price: "$99",
    period: "/month",
    description: "For founders running their own experiments.",
    features: [
      "Experiment builder",
      "Landing page variants",
      "AI analyst",
      "Analytics dashboard",
      "Lead capture",
      "Reports",
    ],
    cta: "Start Building",
    highlighted: true,
  },
  {
    name: "Startup Studio",
    price: "Custom",
    period: "",
    description: "For venture builders validating multiple concepts.",
    features: [
      "Multi-project workspace",
      "Team collaboration",
      "Portfolio dashboard",
      "Batch validation",
      "API access",
      "FirstMileDevs integration",
      "Priority support",
    ],
    cta: "Talk to Sales",
    highlighted: false,
  },
] as const;

