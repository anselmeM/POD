"use client";

import React, { useRef } from "react";
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
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-8" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <div className="text-center mb-16">
          <TextReveal as="h2" className="text-4xl sm:text-5xl font-bold tracking-tight mb-6" delay={0.1}>
            Your AI Validation Analyst
          </TextReveal>
          <motion.p className="text-lg text-text-secondary max-w-2xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.4 }}>
            Not a chatbot. A demand-validation analyst that reads your experiment data and tells you what it means.
          </motion.p>
        </div>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3, duration: 0.7, ease: [0.23, 1, 0.32, 1] }}>
          <SpotlightCard className="max-w-3xl mx-auto">
            <GlassCard className="overflow-hidden">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue/10 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">AI Demand Analysis</h3>
                    <Badge variant="green">Confidence: 84%</Badge>
                  </div>
                </div>

                <div className="bg-green/5 border border-green/10 rounded-xl p-5 mb-5">
                  <p className="text-sm font-semibold text-green mb-2">Demand signal: Strong</p>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Variant B is generating 2.4x more high-intent interactions than Variant A.
                    Visitors exposed to the &ldquo;Reduce Reporting Time&rdquo; positioning are
                    substantially more likely to interact with pricing.
                  </p>
                </div>

                <div className="space-y-3 mb-5">
                  <h4 className="text-sm font-semibold text-text-secondary">Interpretation</h4>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    The problem appears more compelling when framed around time savings rather
                    than workflow automation.
                  </p>
                </div>

                <div className="space-y-3 mb-8">
                  <h4 className="text-sm font-semibold text-text-secondary">Recommendation</h4>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Run the next experiment against operations managers with a time-savings-oriented
                    headline and a $49/month pricing anchor.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["11.4% conversion on Variant B", "7.7% high-intent rate", "2.1x stronger pricing interaction"].map((e) => (
                      <span key={e} className="flex items-center gap-1.5 text-xs text-text-secondary bg-white/[0.04] rounded-lg px-3 py-1.5 border border-white/[0.06]">
                        <CheckCircle2 className="w-3 h-3 text-green" />
                        {e}
                      </span>
                    ))}
                  </div>
                </div>

                <Button className="w-full group">
                  Accept Recommendation
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </GlassCard>
          </SpotlightCard>
        </motion.div>
      </div>
    </section>
  );
}