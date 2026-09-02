"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight, TrendingUp } from "lucide-react";

const CASE_STUDIES = [
  {
    company: "SyncOps",
    category: "B2B DevTools",
    quote: "We were 2 weeks away from hiring two contract engineers to build a \$60k feature. The PoD sprint revealed that developers loved the positioning, but willingness-to-pay stalled at \$19/mo. We pivoted to team licensing before writing code.",
    founder: "Sarah Chen",
    role: "Founder & CTO",
    metric: "Saved $60k + 3 Mo Dev",
    metricType: "green" as const,
  },
  {
    company: "Cadence Health",
    category: "Digital Clinic SaaS",
    quote: "We tested 3 value props: 'Save Clinician Time', 'Reduce No-Shows', and 'HIPAA Automated Audit'. 'Reduce No-Shows' drove a 4.1× higher checkout click-through. It completely shaped our launch messaging.",
    founder: "Marcus Rivera",
    role: "Co-Founder",
    metric: "4.1x Higher Checkout Intent",
    metricType: "blue" as const,
  },
  {
    company: "FinPilot",
    category: "SMB Financial Workflow",
    quote: "Traditional surveys told us everyone wanted automated invoice extraction. But when we put up a deposit smoke test, only agency owners converted. PoD pinpointed our exact beachhead ICP in 6 days.",
    founder: "Aisha Patel",
    role: "Product Lead",
    metric: "Beachhead ICP Identified",
    metricType: "green" as const,
  },
];

export function TestimonialsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section className="py-28 relative overflow-hidden">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-mono uppercase tracking-wider text-green font-bold flex items-center gap-1.5 mb-3">
            <TrendingUp className="w-3.5 h-3.5" /> Real Founder Evidence
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text-primary">
            Before code was written.
          </h2>
          <p className="text-base sm:text-lg text-text-secondary mt-4 leading-relaxed">
            How early-stage teams used behavioral smoke tests to kill bad ideas early and double down on validated demand.
          </p>
        </div>

        {/* 3 Case Study Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {CASE_STUDIES.map((c, i) => (
            <motion.div
              key={c.company}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 + i * 0.1, duration: 0.55 }}
              className="glass-strong rounded-3xl border border-border p-7 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/70">
                  <div>
                    <span className="text-sm font-bold text-text-primary">{c.company}</span>
                    <p className="text-[11px] text-text-tertiary font-mono">{c.category}</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-elevated border border-border text-text-primary">
                    {c.metric}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-6">
                  &ldquo;{c.quote}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-border/70 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue/20 to-purple/20 border border-border flex items-center justify-center text-xs font-bold text-text-primary">
                  {c.founder.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-xs font-semibold text-text-primary">{c.founder}</p>
                  <p className="text-[11px] text-text-tertiary">{c.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

