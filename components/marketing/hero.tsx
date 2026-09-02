"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, TrendingUp, Sparkles, ShieldCheck, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const DEMO_VARIANTS = [
  {
    id: "var-a",
    tag: "Angle A: Feature / Automation",
    headline: "Automate your operational workflows in one click.",
    price: "$49 / mo",
    traffic: 1240,
    cvr: "4.2%",
    intentRate: "3.1%",
    verdict: "Weak Demand",
    verdictColor: "amber" as const,
    insight: "Low pricing interaction (2.1%). Users understand the feature but don't feel acute urgency.",
  },
  {
    id: "var-b",
    tag: "Angle B: Outcome / Time Saved",
    headline: "Cut 15 hours of manual reporting every single week.",
    price: "$79 / mo",
    traffic: 1842,
    cvr: "11.4%",
    intentRate: "8.7%",
    verdict: "Strong Validation (Winner)",
    verdictColor: "green" as const,
    insight: "High-intent checkout rate is 2.8× higher. 95% Wilson CI confirms statistical significance.",
  },
  {
    id: "var-c",
    tag: "Angle C: Risk / Compliance",
    headline: "Never fail a SOC2 audit due to rogue spreadsheet silos.",
    price: "$199 / mo",
    traffic: 980,
    cvr: "6.8%",
    intentRate: "5.4%",
    verdict: "Moderate (Enterprise Lead)",
    verdictColor: "blue" as const,
    insight: "Higher revenue potential per lead ($199), but smaller addressable search traffic.",
  },
];

export function HeroSection() {
  const [selectedIdx, setSelectedIdx] = useState(1);
  const activeVariant = DEMO_VARIANTS[selectedIdx];

  return (
    <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden">
      {/* Subtle atmospheric background */}
      <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Eyebrow */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-elevated border border-border text-xs font-medium text-text-secondary shadow-xs">
            <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
            <span>The 7-Day Demand Sprint</span>
            <span className="text-text-tertiary">·</span>
            <span className="text-text-tertiary font-mono">Statistical Rigor</span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center max-w-4xl mx-auto mb-8">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-text-primary leading-[1.08]">
            Don&apos;t spend 6 months building something{" "}
            <span className="underline decoration-blue/40 decoration-4 underline-offset-8">
              nobody wants.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mt-6 leading-relaxed">
            Customer interviews lie. Friends are polite. Real validation only happens when people click pricing tiers, commit intent, and pull out their wallets.
          </p>
        </div>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/onboarding">
            <Button size="xl" className="w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold shadow-lg shadow-blue/20 hover:shadow-blue/30 group">
              Start a 7-Day Sprint
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="#interactive-demo">
            <Button variant="secondary" size="xl" className="w-full sm:w-auto px-8 py-3.5 rounded-full font-medium">
              See Live Evidence
            </Button>
          </Link>
        </div>

        {/* Interactive Experiment Simulator Widget */}
        <div id="interactive-demo" className="mt-8 max-w-4xl mx-auto">
          <div className="glass-strong rounded-3xl border border-border p-5 sm:p-7 shadow-2xl shadow-black/5 dark:shadow-black/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-tertiary font-mono">Live Validation Test</span>
                  <Badge variant="blue">EXP-2848</Badge>
                </div>
                <h3 className="text-base font-bold text-text-primary mt-1">B2B Workflow SaaS — Positioning & Pricing Sprint</h3>
              </div>
              <div className="flex items-center gap-1.5 bg-surface-elevated p-1 rounded-full border border-border self-start sm:self-auto">
                {DEMO_VARIANTS.map((v, i) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedIdx(i)}
                    className={cn(
                      "px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer",
                      selectedIdx === i
                        ? "bg-surface text-text-primary shadow-xs border border-border"
                        : "text-text-tertiary hover:text-text-secondary"
                    )}
                  >
                    Variant {String.fromCharCode(65 + i)}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Variant Data Card */}
            <div className="pt-5 space-y-5">
              <div className="p-4 rounded-2xl bg-surface-elevated/70 border border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-mono text-text-tertiary uppercase">{activeVariant.tag}</span>
                  <p className="text-sm sm:text-base font-semibold text-text-primary mt-0.5">&ldquo;{activeVariant.headline}&rdquo;</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-text-tertiary">Tested Price:</span>
                  <span className="px-2.5 py-1 rounded-lg bg-surface border border-border text-xs font-mono font-bold text-text-primary">
                    {activeVariant.price}
                  </span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-surface border border-border">
                  <p className="text-[11px] text-text-tertiary">Sample Traffic</p>
                  <p className="text-xl font-bold font-mono text-text-primary mt-0.5">{activeVariant.traffic.toLocaleString()}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface border border-border">
                  <p className="text-[11px] text-text-tertiary">Conversion Rate</p>
                  <p className="text-xl font-bold font-mono text-text-primary mt-0.5">{activeVariant.cvr}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface border border-border">
                  <p className="text-[11px] text-text-tertiary">High-Intent Clicks</p>
                  <p className="text-xl font-bold font-mono text-text-primary mt-0.5">{activeVariant.intentRate}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface border border-border">
                  <p className="text-[11px] text-text-tertiary">Verdict</p>
                  <div className="mt-1">
                    <Badge variant={activeVariant.verdictColor}>{activeVariant.verdict}</Badge>
                  </div>
                </div>
              </div>

              {/* Diagnosis Callout */}
              <div className="p-3.5 rounded-xl bg-blue/5 border border-blue/15 flex items-start gap-3">
                <TrendingUp className="w-4 h-4 text-blue shrink-0 mt-0.5" />
                <p className="text-xs text-text-secondary leading-relaxed">
                  <strong className="text-text-primary">Demand Diagnosis:</strong> {activeVariant.insight}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Human Proof Pillars */}
        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16 pt-12 border-t border-border/70 text-center sm:text-left">
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start text-xs font-semibold text-text-primary">
              <CheckCircle2 className="w-4 h-4 text-green" />
              <span>Real Behavioral Funnels</span>
            </div>
            <p className="text-xs text-text-tertiary mt-1.5 leading-relaxed">
              Track pricing table dwell time, checkout attempts, and deposit commitments.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start text-xs font-semibold text-text-primary">
              <ShieldCheck className="w-4 h-4 text-blue" />
              <span>Statistical Confidence</span>
            </div>
            <p className="text-xs text-text-tertiary mt-1.5 leading-relaxed">
              Wilson 95% confidence intervals and sample sizing to eliminate random noise.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start text-xs font-semibold text-text-primary">
              <DollarSign className="w-4 h-4 text-amber" />
              <span>Willingness to Pay</span>
            </div>
            <p className="text-xs text-text-tertiary mt-1.5 leading-relaxed">
              Discover price elasticity across cohorts before writing product code.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}