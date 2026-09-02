"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Sparkles, Layers, BarChart3, Check } from "lucide-react";

const STAGES = [
  {
    num: "01",
    title: "Multi-Angle Positioning",
    icon: Sparkles,
    subtitle: "Turn 1 hypothesis into 3 distinct value angles",
    description: "Our positioning engine derives 3 fundamentally different value propositions (Time-savings, Revenue-lift, and Risk-mitigation) to identify where true urgency lies.",
    points: [
      "Target audience ICP segmentation",
      "Dynamic copy & headline generation",
      "Baseline price elasticity anchors",
    ],
  },
  {
    num: "02",
    title: "Micro-Funnel Smoke Testing",
    icon: Layers,
    subtitle: "Deploy live high-speed variant pages",
    description: "Launch lightning-fast, production-grade landing page variants that capture real micro-intent: scroll depth, feature clicks, pricing tier dwell time, and checkout initiations.",
    points: [
      "Instant variant routing & slug deployment",
      "Intent-depth event instrumentation",
      "Zero dev or engineering overhead",
    ],
  },
  {
    num: "03",
    title: "Statistical Verdict",
    icon: BarChart3,
    subtitle: "Clear go / pivot / kill decisions",
    description: "Every experiment is backed by 95% Wilson Confidence Intervals, cost-per-validated-action metrics, and an executive recommendation on whether to build or pivot.",
    points: [
      "Statistical significance calculator",
      "Composite Demand Score (0–100)",
      "Next experiment & pricing recommendations",
    ],
  },
];

export function FrameworkSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section id="how-it-works" className="py-28 relative overflow-hidden">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs font-mono uppercase tracking-wider text-blue font-bold">
            The 7-Day Protocol
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text-primary mt-2">
            How Proof of Demand works.
          </h2>
          <p className="text-base sm:text-lg text-text-secondary mt-4 leading-relaxed">
            From raw concept to quantitative market proof in 3 disciplined steps.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {STAGES.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.15 + i * 0.12, duration: 0.55 }}
                className="glass-strong rounded-3xl border border-border p-7 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center">
                      <Icon className="w-5 h-5 text-blue" />
                    </div>
                    <span className="text-xs font-mono font-bold text-text-tertiary">Step {s.num}</span>
                  </div>

                  <h3 className="text-lg font-bold text-text-primary mb-1">{s.title}</h3>
                  <p className="text-xs font-medium text-blue mb-3">{s.subtitle}</p>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-6">
                    {s.description}
                  </p>
                </div>

                <div className="pt-5 border-t border-border/70 space-y-2">
                  {s.points.map((pt) => (
                    <div key={pt} className="flex items-center gap-2 text-xs text-text-tertiary">
                      <Check className="w-3.5 h-3.5 text-green shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}