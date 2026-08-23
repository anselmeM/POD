"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { TextReveal } from "@/components/ui/text-reveal";

const signals = [
  { label: "Page View", strength: 1 },
  { label: "Scroll / Engagement", strength: 2 },
  { label: "CTA Click", strength: 3 },
  { label: "Pricing Interaction", strength: 4 },
  { label: "Demo / Application", strength: 5 },
  { label: "Checkout Initiation", strength: 6 },
  { label: "Payment Intent", strength: 7 },
  { label: "Purchase", strength: 8 },
];

export function SignalLadderSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-10" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}>
            <TextReveal as="h2" className="text-4xl sm:text-5xl font-bold tracking-tight mb-6" delay={0.1}>
              Measure intent, not vanity metrics.
            </TextReveal>
            <motion.p className="text-lg text-text-secondary mb-6 leading-relaxed" initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.4 }}>
              PoD analyzes the depth of customer behavior instead of treating every conversion as equally meaningful. A page view is not the same as a checkout initiation.
            </motion.p>
            <motion.p className="text-sm text-text-tertiary" initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.6 }}>
              Each step in the funnel represents increasing evidence of real demand and willingness to pay.
            </motion.p>
          </motion.div>

          <motion.div className="space-y-2" initial={{ opacity: 0, x: 30 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}>
            {signals.map((s, i) => {
              const intensity = s.strength / 8;
              const bgColor = `rgba(88, 166, 255, ${0.02 + intensity * 0.04})`;
              const borderColor = `rgba(88, 166, 255, ${0.04 + intensity * 0.1})`;
              const barColor = i >= 5 ? "#3FB950" : i >= 3 ? "#58A6FF" : i >= 1 ? "#D29922" : "#484F58";

              return (
                <motion.div
                  key={s.label}
                  className="flex items-center gap-3 rounded-xl px-5 py-3.5 border hover:border-opacity-60 transition-colors group"
                  style={{ backgroundColor: bgColor, borderColor }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.2 + i * 0.06, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: barColor }} />
                  <span className="text-sm flex-1 font-medium">{s.label}</span>
                  <div className="w-24 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: barColor }}
                      initial={{ width: 0 }}
                      animate={isInView ? { width: `${(s.strength / 8) * 100}%` } : {}}
                      transition={{ delay: 0.4 + i * 0.06, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                    />
                  </div>
                  {i > 0 && <span className="text-xs text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity">↓</span>}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}