"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Brain, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { GlassCard } from "@/components/ui/glass-card";
import { TextReveal } from "@/components/ui/text-reveal";

export function AIAnalysisSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section className="py-28 relative overflow-hidden">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <div className="text-center mb-16">
          <span className="text-xs font-mono uppercase tracking-wider text-blue font-bold">
            Statistical Synthesis
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text-primary mt-2">
            Quantitative demand interpretation.
          </h2>
          <motion.p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto mt-4" initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.4 }}>
            Not a generic chatbot. A specialized analysis engine that parses your funnel drop-offs, pricing sensitivity, and cohort conversion depth.
          </motion.p>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3, duration: 0.6 }}>
          <div className="max-w-3xl mx-auto glass-strong rounded-3xl border border-border overflow-hidden p-7 sm:p-9 shadow-2xl">
            <div className="flex items-center justify-between gap-3 mb-6 pb-5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue/10 border border-blue/20 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-blue" />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary text-sm sm:text-base">Executive Demand Verdict</h3>
                  <p className="text-[11px] text-text-tertiary font-mono">B2B Workflow Sprint · 1,842 sessions</p>
                </div>
              </div>
              <Badge variant="green">95% Wilson Confidence</Badge>
            </div>

            <div className="bg-green/5 border border-green/20 rounded-2xl p-5 mb-5">
              <p className="text-xs font-bold font-mono text-green uppercase tracking-wide mb-1">Signal Status: Strong Demand</p>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Variant B (&ldquo;Cut 15 Hours of Reporting&rdquo;) outperforms Variant A by <strong>2.8× in checkout intent</strong> and generates <strong>3.4× more pricing table dwell time</strong>.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-text-tertiary mb-1">Empirical Finding</h4>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Prospects actively reject generic &ldquo;workflow automation&rdquo; but show acute, urgent willingness to pay when framed around specific weekly time savings.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-text-tertiary mb-1">Next Action Recommendation</h4>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Proceed to MVP build with Variant B positioning. Anchor initial pricing at <strong>$79/month</strong> based on price sensitivity curve.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {["11.4% CVR on Variant B", "8.7% High-Intent Rate", "2.8x Checkout Initiation"].map((e) => (
                  <span key={e} className="flex items-center gap-1.5 text-xs text-text-primary bg-surface-elevated rounded-lg px-3 py-1.5 border border-border font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green" />
                    {e}
                  </span>
                ))}
              </div>
            </div>

            <Link href="/onboarding">
              <Button className="w-full rounded-full py-3 font-semibold group cursor-pointer">
                Run a Validation Sprint for Your Idea
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}