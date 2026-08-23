"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { TextReveal } from "@/components/ui/text-reveal";

const testimonials = [
  {
    quote: "We were about to spend $200K building a feature nobody wanted. PoD showed us in 5 days.",
    name: "Sarah Chen",
    role: "CEO, DataSync",
    metric: "Saved $200K",
  },
  {
    quote: "The demand signals were crystal clear. We pivoted our entire product strategy based on PoD's analysis.",
    name: "Marcus Rivera",
    role: "Founder, FlowState",
    metric: "3.2x conversion lift",
  },
  {
    quote: "Finally, a tool that tells me if customers will actually pay before I build it. Game changer.",
    name: "Aisha Patel",
    role: "CPO, Nexus Labs",
    metric: "Validated in 7 days",
  },
];

export function TestimonialsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gray-50/50" />
      <div className="absolute inset-0 dot-grid opacity-8" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <div className="text-center mb-20">
          <TextReveal as="h2" className="text-4xl sm:text-5xl font-bold tracking-tight mb-6" delay={0.1}>
            Trusted by builders who ship smart.
          </TextReveal>
          <motion.p
            className="text-lg text-text-secondary max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
          >
            Teams using PoD make better decisions, faster.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.15, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="relative group h-full">
                <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-blue/10 via-transparent to-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-white border border-gray-200 rounded-2xl p-8 h-full flex flex-col shadow-sm">
                  {/* Quote */}
                  <div className="flex-1 mb-6">
                    <svg className="w-8 h-8 text-blue/15 mb-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                    <p className="text-text-secondary leading-relaxed">{t.quote}</p>
                  </div>

                  {/* Metric badge */}
                  <div className="mb-6">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green bg-green/10 border border-green/20 rounded-full px-3 py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green" />
                      {t.metric}
                    </span>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue/10 to-purple/10 flex items-center justify-center text-sm font-bold text-blue">
                      {t.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-text-tertiary">{t.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust logos */}
        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
        >
          <p className="text-xs text-text-tertiary uppercase tracking-[0.2em] mb-8">Trusted by teams at</p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-30">
            {["Stripe", "Vercel", "Linear", "Notion", "Figma"].map((company) => (
              <span key={company} className="text-lg font-bold text-text-secondary tracking-tight">
                {company}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
