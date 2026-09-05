"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  CreditCard,
  Zap,
  Check,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Sparkles,
  FlaskConical,
  Layout,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface QuotaDetail {
  current: number;
  limit: number;
  percent: number;
  allowed: boolean;
}

interface WorkspaceUsageData {
  plan: string;
  planName: string;
  quotas: {
    activeExperiments: QuotaDetail;
    landingPages: QuotaDetail;
    teamMembers: QuotaDetail;
    canUseAIAnalyst: boolean;
  };
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

function BillingContent() {
  const searchParams = useSearchParams();
  const billingSuccess = searchParams.get("billing_success");
  const canceled = searchParams.get("canceled");
  const mockCheckout = searchParams.get("mock_checkout");
  const mockPortal = searchParams.get("mock_portal");

  const [usage, setUsage] = useState<WorkspaceUsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = async () => {
    try {
      const res = await fetch("/api/billing/usage");
      if (!res.ok) throw new Error("Failed to load usage data");
      const json = await res.json();
      if (json.usage) setUsage(json.usage);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  const handleCheckout = async (planKey: string) => {
    setActionLoading(planKey);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (err: any) {
      alert(`Checkout failed: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePortal = async () => {
    setActionLoading("portal");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to launch billing portal");
      }
    } catch (err: any) {
      alert(`Customer portal error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const activePlanKey = (usage?.plan || "trial").toLowerCase();

  const getProgressColor = (percent: number) => {
    if (percent >= 100) return "bg-red";
    if (percent >= 70) return "bg-amber-500";
    return "bg-blue";
  };

  return (
    <div className="space-y-8 max-w-5xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Billing & Plans</h1>
          <p className="text-sm text-text-secondary">
            Manage your subscription, monitor resource quotas, and unlock higher limits.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            className="flex items-center gap-2"
            onClick={handlePortal}
            disabled={actionLoading === "portal"}
          >
            <CreditCard className="w-4 h-4 text-blue" />
            {actionLoading === "portal" ? "Opening..." : "Manage Subscription"}
            <ExternalLink className="w-3.5 h-3.5 text-text-tertiary" />
          </Button>
        </div>
      </div>

      {/* Status Banners */}
      {billingSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-400">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold">Subscription Activated!</p>
            <p className="text-xs text-emerald-400/80">
              Your workspace plan has been upgraded. All limits and features are active immediately.
            </p>
          </div>
        </div>
      )}

      {canceled && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-amber-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold">Checkout Canceled</p>
            <p className="text-xs text-amber-400/80">
              No charges were made to your account. You remain on your current plan.
            </p>
          </div>
        </div>
      )}

      {mockCheckout && (
        <div className="p-4 rounded-xl bg-blue/10 border border-blue/30 flex items-center gap-3 text-blue">
          <Zap className="w-5 h-5 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold">Development Mode Simulation</p>
            <p className="text-xs text-text-secondary">
              Simulating checkout for plan <code className="text-blue font-bold">{mockCheckout}</code>. In production, configure <code className="text-text-primary font-mono">STRIPE_SECRET_KEY</code> to enable live Stripe checkout.
            </p>
          </div>
        </div>
      )}

      {mockPortal && (
        <div className="p-4 rounded-xl bg-blue/10 border border-blue/30 flex items-center gap-3 text-blue">
          <Zap className="w-5 h-5 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold">Development Mode Customer Portal</p>
            <p className="text-xs text-text-secondary">
              Customer portal simulated. In production with live Stripe credentials, this opens the Stripe Billing Portal for invoice receipts and payment method management.
            </p>
          </div>
        </div>
      )}

      {/* Plan & Usage Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Active Plan Card */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
              Current Tier
            </span>
            <div className="flex items-center gap-2 mt-2">
              <h2 className="text-xl font-bold font-heading text-text-primary">
                {usage?.planName || "Free Trial"}
              </h2>
              <Badge variant="blue" className="capitalize text-xs">
                {activePlanKey === "trial" ? "Trial" : "Active"}
              </Badge>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              {activePlanKey === "trial"
                ? "Starter sandbox limits"
                : "Continuous validation active"}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-text-tertiary">
            <span>Stripe Customer</span>
            <span className="font-mono text-text-secondary">
              {usage?.stripeCustomerId ? "Linked" : "Unlinked"}
            </span>
          </div>
        </Card>

        {/* Active Experiments Gauge */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider flex items-center gap-1.5">
                <FlaskConical className="w-3.5 h-3.5 text-blue" />
                Active Experiments
              </span>
              <span className="text-xs font-bold text-text-primary">
                {usage?.quotas.activeExperiments.current ?? 0} /{" "}
                {usage?.quotas.activeExperiments.limit ?? 1}
              </span>
            </div>

            <div className="w-full h-2 bg-surface-elevated rounded-full overflow-hidden mt-3 border border-border">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getProgressColor(
                  usage?.quotas.activeExperiments.percent ?? 0
                )}`}
                style={{ width: `${usage?.quotas.activeExperiments.percent ?? 0}%` }}
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-text-tertiary">
            <span>{usage?.quotas.activeExperiments.percent ?? 0}% Used</span>
            {usage?.quotas.activeExperiments.allowed ? (
              <span className="text-emerald-500 font-medium">Available</span>
            ) : (
              <span className="text-amber-500 font-medium">At Limit</span>
            )}
          </div>
        </Card>

        {/* Smoke Test Landing Pages Gauge */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider flex items-center gap-1.5">
                <Layout className="w-3.5 h-3.5 text-purple-400" />
                Landing Pages
              </span>
              <span className="text-xs font-bold text-text-primary">
                {usage?.quotas.landingPages.current ?? 0} /{" "}
                {usage?.quotas.landingPages.limit ?? 2}
              </span>
            </div>

            <div className="w-full h-2 bg-surface-elevated rounded-full overflow-hidden mt-3 border border-border">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getProgressColor(
                  usage?.quotas.landingPages.percent ?? 0
                )}`}
                style={{ width: `${usage?.quotas.landingPages.percent ?? 0}%` }}
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-text-tertiary">
            <span>{usage?.quotas.landingPages.percent ?? 0}% Used</span>
            {usage?.quotas.landingPages.allowed ? (
              <span className="text-emerald-500 font-medium">Available</span>
            ) : (
              <span className="text-amber-500 font-medium">At Limit</span>
            )}
          </div>
        </Card>

        {/* Team Member Seats Gauge */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-500" />
                Team Seats
              </span>
              <span className="text-xs font-bold text-text-primary">
                {usage?.quotas.teamMembers.current ?? 0} /{" "}
                {usage?.quotas.teamMembers.limit ?? 2}
              </span>
            </div>

            <div className="w-full h-2 bg-surface-elevated rounded-full overflow-hidden mt-3 border border-border">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getProgressColor(
                  usage?.quotas.teamMembers.percent ?? 0
                )}`}
                style={{ width: `${usage?.quotas.teamMembers.percent ?? 0}%` }}
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-text-tertiary">
            <span>{usage?.quotas.teamMembers.percent ?? 0}% Used</span>
            {usage?.quotas.teamMembers.allowed ? (
              <span className="text-emerald-500 font-medium">Available</span>
            ) : (
              <span className="text-amber-500 font-medium">At Limit</span>
            )}
          </div>
        </Card>
      </div>

      {/* Plan Tier Matrix */}
      <div>
        <div className="mb-6">
          <h2 className="text-lg font-bold font-heading text-text-primary">Available Plans</h2>
          <p className="text-xs text-text-secondary">
            Select the tier that aligns with your continuous experiment volume.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Plan 1: Self-Serve */}
          <Card className={`p-6 flex flex-col justify-between relative ${
            activePlanKey === "self-serve"
              ? "border-blue ring-1 ring-blue/20 bg-blue/[0.02]"
              : "hover:border-border-hover transition-colors"
          }`}>
            <div className="absolute -top-3 left-6">
              <Badge variant="blue" className="text-[11px] font-semibold">
                Most Popular
              </Badge>
            </div>

            <div>
              <div className="flex items-center justify-between mt-1 mb-2">
                <h3 className="text-lg font-bold font-heading">Self-Serve</h3>
                {activePlanKey === "self-serve" && (
                  <Badge variant="default" className="text-[10px]">
                    Current Plan
                  </Badge>
                )}

              </div>
              <p className="text-xs text-text-secondary mb-4">
                For solo founders and small squads validating demand continuously.
              </p>
              <div className="mb-6">
                <span className="text-3xl font-extrabold font-heading text-text-primary">$99</span>
                <span className="text-xs text-text-secondary"> / month</span>
              </div>

              <ul className="space-y-2.5 text-xs text-text-secondary mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span><strong>5 active experiments</strong> simultaneously</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span><strong>15 live landing pages</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span><strong>5 team member seats</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>AI Verdict Engine & WTP elasticity</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Real-time webhook dispatch (Zapier/Slack)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>1-Click CSV lead exports</span>
                </li>
              </ul>
            </div>

            <Button
              className="w-full mt-4"
              variant={activePlanKey === "self-serve" ? "secondary" : "default"}
              disabled={activePlanKey === "self-serve" || actionLoading === "self-serve"}
              onClick={() => handleCheckout("self-serve")}
            >
              {activePlanKey === "self-serve"
                ? "Active Plan"
                : actionLoading === "self-serve"
                ? "Redirecting..."
                : "Upgrade to Self-Serve"}
            </Button>
          </Card>

          {/* Plan 2: Startup Studio */}
          <Card className={`p-6 flex flex-col justify-between relative ${
            activePlanKey === "studio"
              ? "border-blue ring-1 ring-blue/20 bg-blue/[0.02]"
              : "hover:border-border-hover transition-colors"
          }`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold font-heading">Startup Studio</h3>
                {activePlanKey === "studio" && (
                  <Badge variant="default" className="text-[10px]">
                    Current Plan
                  </Badge>
                )}

              </div>
              <p className="text-xs text-text-secondary mb-4">
                For venture studios, incubators, and enterprise innovation labs.
              </p>
              <div className="mb-6">
                <span className="text-3xl font-extrabold font-heading text-text-primary">$999</span>
                <span className="text-xs text-text-secondary"> / month</span>
              </div>

              <ul className="space-y-2.5 text-xs text-text-secondary mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span><strong>50 active experiments</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span><strong>100 live landing pages</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span><strong>20 team member seats</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Batch AI experiment generator</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Multi-tenant studio dashboard</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Dedicated priority API access</span>
                </li>
              </ul>
            </div>

            <Button
              className="w-full mt-4"
              variant={activePlanKey === "studio" ? "secondary" : "default"}
              disabled={activePlanKey === "studio" || actionLoading === "studio"}
              onClick={() => handleCheckout("studio")}
            >
              {activePlanKey === "studio"
                ? "Active Plan"
                : actionLoading === "studio"
                ? "Redirecting..."
                : "Upgrade to Studio"}
            </Button>
          </Card>

          {/* Plan 3: Validation Sprint */}
          <Card className={`p-6 flex flex-col justify-between relative ${
            activePlanKey === "sprint"
              ? "border-blue ring-1 ring-blue/20 bg-blue/[0.02]"
              : "hover:border-border-hover transition-colors"
          }`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold font-heading">Validation Sprint</h3>
                {activePlanKey === "sprint" && (
                  <Badge variant="default" className="text-[10px]">
                    Current Plan
                  </Badge>
                )}

              </div>
              <p className="text-xs text-text-secondary mb-4">
                High-touch, 1-week guided validation with expert analyst review.
              </p>
              <div className="mb-6">
                <span className="text-3xl font-extrabold font-heading text-text-primary">$2,500</span>
                <span className="text-xs text-text-secondary"> one-time</span>
              </div>

              <ul className="space-y-2.5 text-xs text-text-secondary mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span><strong>10 active experiments</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span><strong>25 landing pages</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Hands-on paid ad campaign setup</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Weekly sprint review call with founder</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Executive validation debrief & PDF</span>
                </li>
              </ul>
            </div>

            <Button
              className="w-full mt-4"
              variant="secondary"
              disabled={actionLoading === "sprint"}
              onClick={() => handleCheckout("sprint")}
            >
              {actionLoading === "sprint" ? "Redirecting..." : "Book a Sprint"}
            </Button>
          </Card>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-blue" />
          <CardTitle>Billing FAQs</CardTitle>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-text-secondary">
          <div>
            <p className="font-semibold text-text-primary mb-1">
              Can I upgrade or downgrade anytime?
            </p>
            <p>
              Yes. Upgrades apply immediately and prorate automatically. You can also cancel anytime with 1-click via the Stripe Customer Portal.
            </p>
          </div>
          <div>
            <p className="font-semibold text-text-primary mb-1">
              What happens if I reach my experiment limit?
            </p>
            <p>
              Your existing experiments continue running and capturing visitor signals. To launch additional concurrent tests, you can either archive older tests or upgrade your plan.
            </p>
          </div>
          <div>
            <p className="font-semibold text-text-primary mb-1">
              Do landing pages stop collecting leads if I reach the cap?
            </p>
            <p>
              No. Live landing pages never stop converting visitors. Quotas only govern the total count of distinct active landing page URLs published in your workspace.
            </p>
          </div>
          <div>
            <p className="font-semibold text-text-primary mb-1">
              Need custom invoicing or wire payment?
            </p>
            <p>
              For enterprise teams and studios requiring ACH, Wire, or custom terms, contact sales or book a Validation Sprint engagement.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 max-w-5xl animate-pulse">
          <div className="h-8 bg-surface-elevated rounded w-1/4" />
          <div className="h-32 bg-surface-elevated rounded-xl" />
          <div className="grid grid-cols-3 gap-6">
            <div className="h-64 bg-surface-elevated rounded-xl" />
            <div className="h-64 bg-surface-elevated rounded-xl" />
            <div className="h-64 bg-surface-elevated rounded-xl" />
          </div>
        </div>
      }
    >
      <BillingContent />
    </Suspense>
  );
}
