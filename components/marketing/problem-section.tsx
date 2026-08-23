"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { TextReveal } from "@/components/ui/text-reveal";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { GlassCard } from "@/components/ui/glass-card";

const problems = [
  { myth: "\u201cPeople will want it.\u201d", reality: "But nobody has actually demonstrated demand." },
  { myth: "\u201cThey\u2019ll pay for it.\u201d", reality: "Email signups don\u2019t necessarily prove willingness to pay." },
  { myth: "\u201cWe\u2019ll know once we launch.\u201d", reality: "By then you\u2019ve already spent months and significant capital." },
];

export function ProblemSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-10" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <div className="text-center mb-20">
          <TextReveal as="h2" className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight" delay={0.1} staggerChildren={0.03}>
            Your roadmap shouldn&apos;t be built on guesses.
          </TextReveal>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {problems.map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 + i * 0.15, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}>
              <SpotlightCard className="h-full">
                <GlassCard className="p-8 h-full group">
                  <div className="w-12 h-12 rounded-xl bg-amber/10 flex items-center justify-center mb-6 group-hover:bg-amber/15 transition-colors">
                    <AlertTriangle className="w-6 h-6 text-amber" />
                  </div>
                  <p className="text-xl font-semibold mb-3 text-text-primary">{p.myth}</p>
                  <p className="text-sm text-text-secondary leading-relaxed">{p.reality}</p>
                </GlassCard>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center relative"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue/5 to-transparent rounded-2xl" />
          <div className="relative glass border border-blue/10 rounded-2xl p-10">
            <p className="text-xl sm:text-2xl font-semibold gradient-text-blue">
              Test the riskiest assumptions while they&apos;re still cheap to change.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}