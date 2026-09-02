"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Users2, Mail, Code2, AlertTriangle, ArrowRight } from "lucide-react";

const TRAPS = [
  {
    num: "01",
    icon: Users2,
    trap: "The \"Polite Interview\" Trap",
    quote: "“That sounds amazing, let me know when you launch!”",
    reality: "Customer interviews measure social politeness, not buying behavior. People say yes when it costs them nothing to be agreeable.",
  },
  {
    num: "02",
    icon: Mail,
    trap: "The \"Free Waitlist\" Illusion",
    quote: "“We have 1,500 people on our pre-launch email list!”",
    reality: "Email addresses have near-zero friction. When the product goes live with a $49 price tag, 98% of free waitlist signups disappear.",
  },
  {
    num: "03",
    icon: Code2,
    trap: "The \"Build First\" Sunk Cost",
    quote: "“We just need 4 more months to ship our full MVP.”",
    reality: "Founders spend $30k–$80k building software before testing if anyone actually cares enough to click a checkout button.",
  },
];

export function ProblemSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section className="py-28 relative overflow-hidden">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber mb-3">
            <AlertTriangle className="w-3.5 h-3.5" />
            Why 90% of Early Startups Fail
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text-primary leading-tight">
            The three false signals that trick smart founders.
          </h2>
          <p className="text-base sm:text-lg text-text-secondary mt-4 leading-relaxed">
            Most ideas don&apos;t fail because of technical execution. They fail because the founder validated opinions instead of economic commitment.
          </p>
        </div>

        {/* 3 Traps Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {TRAPS.map((t, i) => {
            const Icon = t.icon;
            return (
              <motion.div
                key={t.num}
                initial={{ opacity: 0, y: 25 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.15 + i * 0.1, duration: 0.5 }}
                className="glass-strong rounded-3xl border border-border p-7 flex flex-col justify-between hover:border-text-secondary/30 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center">
                      <Icon className="w-5 h-5 text-text-primary" />
                    </div>
                    <span className="text-xs font-mono font-bold text-text-tertiary">{t.num}</span>
                  </div>

                  <h3 className="text-base font-bold text-text-primary mb-2">{t.trap}</h3>
                  <div className="p-3 rounded-xl bg-surface-elevated/60 border border-border/80 text-xs italic text-text-secondary mb-4">
                    {t.quote}
                  </div>
                  <p className="text-xs sm:text-sm text-text-tertiary leading-relaxed">
                    {t.reality}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* The Remedy Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 sm:p-8 rounded-3xl bg-surface-elevated border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-6"
        >
          <div>
            <p className="text-sm font-mono uppercase tracking-wider text-blue font-semibold">The Antidote</p>
            <p className="text-lg sm:text-xl font-bold text-text-primary mt-1">
              High-friction behavioral tests before writing application code.
            </p>
          </div>
          <a
            href="#framework"
            className="inline-flex items-center gap-2 text-xs font-semibold text-text-primary hover:text-blue transition-colors shrink-0"
          >
            Explore the validation framework <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>

      </div>
    </section>
  );
}