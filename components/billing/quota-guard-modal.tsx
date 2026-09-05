"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Check, ArrowRight, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface QuotaGuardModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  resource?: "activeExperiments" | "landingPages" | "teamMembers" | string;
  current?: number;
  limit?: number;
  planName?: string;
}

export function QuotaGuardModal({
  open,
  onClose,
  title = "Plan Limit Reached",
  description,
  resource = "activeExperiments",
  current,
  limit,
  planName = "Free Trial",
}: QuotaGuardModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const getResourceLabel = (res: string) => {
    switch (res) {
      case "activeExperiments":
        return "active demand experiments";
      case "landingPages":
        return "smoke test landing pages";
      case "teamMembers":
        return "team member seats";
      default:
        return res;
    }
  };

  const handleUpgrade = async (planKey = "self-serve") => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Failed to initiate checkout:", err);
    } finally {
      setLoading(false);
    }
  };

  const defaultDescription =
    current !== undefined && limit !== undefined
      ? `You have reached your limit of ${limit} ${getResourceLabel(resource)} on the ${planName} plan.`
      : `You have reached your ${getResourceLabel(resource)} limit on your current plan.`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-surface rounded-2xl border border-border max-w-md w-full p-6 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-elevated transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Heading */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-blue/10 border border-blue/20 flex items-center justify-center shrink-0 text-blue">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-text-primary">{title}</h3>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              {description || defaultDescription}
            </p>
          </div>
        </div>

        {/* Quota Gauge Indicator */}
        {current !== undefined && limit !== undefined && (
          <div className="mb-5 p-3 rounded-xl bg-surface-elevated border border-border">
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              <span className="text-text-secondary">Capacity Used</span>
              <span className="text-amber-500 font-semibold">
                {current} / {limit} ({Math.round((current / limit) * 100)}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-border overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: "100%" }}
              />
            </div>
          </div>
        )}

        {/* Value Proposition on Upgrade */}
        <div className="mb-6 space-y-2.5">
          <p className="text-xs font-semibold text-text-primary uppercase tracking-wider">
            Upgrading to Self-Serve unlocks:
          </p>
          <ul className="space-y-2 text-xs text-text-secondary">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                <strong>5 active experiments</strong> (up from {limit || 1})
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                <strong>15 live smoke pages</strong> with custom slugs & UTM tracking
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                <strong>Full AI Analyst verdicts</strong> with WTP elasticity curve
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                <strong>Zapier & Webhook streaming</strong> for real-time lead dispatch
              </span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button
            className="w-full flex items-center justify-center gap-2 shadow-lg shadow-blue/20"
            onClick={() => handleUpgrade("self-serve")}
            disabled={loading}
          >
            {loading ? "Redirecting to Stripe..." : "Upgrade to Self-Serve ($99/mo)"}
            <ArrowRight className="w-4 h-4" />
          </Button>

          <div className="flex items-center justify-between gap-2 pt-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-text-secondary hover:text-text-primary flex-1"
              onClick={() => {
                onClose();
                router.push("/dashboard/billing");
              }}
            >
              Compare All Plans
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-text-tertiary hover:text-text-secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
