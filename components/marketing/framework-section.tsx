"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Brain, FlaskConical, RefreshCw, ArrowRight } from "lucide-react";
import { TextReveal } from "@/components/ui/text-reveal";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { GlassCard } from "@/components/ui/glass-card";

const stages = [
  {
    num: "01",
    title: "Predict",
    icon: Brain,
    description: "AI analyzes your market, identifies customer pain points, and generates positioning hypotheses.",
    items: ["Target market analysis", "Customer pain identification", "Competitive positioning", "Pricing hypotheses", "Messaging angles"],
    output: "Demand Hypothesis",
    color: "blue",
  },
  {
    num: "02",
    title: "Validate",
    icon: FlaskConical,
    description: "Launch multi-variant experiments with real traffic to test your demand signals.",
    items: ["Multi-variant landing pages", "Audience-specific messaging", "Controlled paid acquisition", "Conversion tracking", "Pricing interactions"],
    output: "Real Behavioral Evidence",
    color: "green",
  },
  {
    num: "03",
    title: "Iterate",
    icon: RefreshCw,
    description: "AI analyzes results and recommends your next experiment with higher confidence.",
    items: ["Acquisition efficiency", "Engagement analysis", "High-intent behavior", "Willingness-to-pay signals", "Audience segment comparison"],
    output: "Next Experiment Recommendation",
    color: "amber",
  },
];

export function FrameworkSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section id="how-it-works" className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-8" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <div className="text-center mb-20">
          <TextReveal as="h2" className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6" delay={0.1}>
            Predict → Validate → Iterate
          </TextReveal>
          <motion.p className="text-lg text-text-secondary max-w-2xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.4 }}>
            A systematic framework for turning uncertain ideas into validated demand.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Animated connectors between cards */}
          <div className="hidden md:block absolute top-1/2 left-[33.33%] w-[calc(33.33%-24px)] h-[2px] -translate-y-1/2 z-10 pointer-events-none">
            <motion.div
              className="h-full bg-gradient-to-r from-blue/25 via-green/25 to-transparent rounded-full"
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ delay: 0.8, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
              style={{ transformOrigin: "left" }}
            />
            <motion.div
              className="absolute right-0 top-1/2 -translate-y-1/2"
              initial={{ opacity: 0, x: -5 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 1.2 }}
            >
              <ArrowRight className="w-4 h-4 text-green/40" />
            </motion.div>
          </div>

          <div className="hidden md:block absolute top-1/2 left-[66.66%] w-[calc(33.33%-24px)] h-[2px] -translate-y-1/2 z-10 pointer-events-none">
            <motion.div
              className="h-full bg-gradient-to-r from-green/25 via-amber/25 to-transparent rounded-full"
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ delay: 1.0, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
              style={{ transformOrigin: "left" }}
            />
            <motion.div
              className="absolute right-0 top-1/2 -translate-y-1/2"
              initial={{ opacity: 0, x: -5 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 1.4 }}
            >
              <ArrowRight className="w-4 h-4 text-amber/40" />
            </motion.div>
          </div>

          {stages.map((stage, i) => {
            const Icon = stage.icon;
            const colorMap: Record<string, { border: string; bg: string; icon: string; dot: string; glow: string }> = {
              blue: { border: "border-blue/15", bg: "bg-blue/5", icon: "text-blue bg-blue/10", dot: "bg-blue", glow: "shadow-blue/5" },
              green: { border: "border-green/15", bg: "bg-green/5", icon: "text-green bg-green/10", dot: "bg-green", glow: "shadow-green/5" },
              amber: { border: "border-amber/15", bg: "bg-amber/5", icon: "text-amber bg-amber/10", dot: "bg-amber", glow: "shadow-amber/5" },
            };
            const c = colorMap[stage.color];

            return (
              <motion.div key={stage.num} initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3 + i * 0.15, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}>
                <SpotlightCard className="h-full">
                  <GlassCard className={`p-8 h-full border ${c.border} hover:border-opacity-40 transition-all duration-300`}>
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-xs font-mono text-text-tertiary">{stage.num}</span>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.icon}`}>
                        <Icon size={20} />
                      </div>
                      <h3 className="text-xl font-bold text-text-primary">{stage.title}</h3>
                    </div>
                    <p className="text-sm text-text-secondary mb-6 leading-relaxed">{stage.description}</p>
                    <ul className="space-y-3 mb-8">
                      {stage.items.map((item) => (
                        <li key={item} className="text-sm text-text-secondary flex items-center gap-2.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div className="border-t border-white/[0.06] pt-4">
                      <p className="text-xs text-text-tertiary uppercase tracking-wider mb-1">Output</p>
                      <p className="text-sm font-semibold text-text-primary">{stage.output}</p>
                    </div>
                  </GlassCard>
                </SpotlightCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}