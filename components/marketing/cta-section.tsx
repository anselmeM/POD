"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section className="py-28 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <motion.div
          className="relative rounded-3xl overflow-hidden glass-strong border border-border p-8 sm:p-14 lg:p-18 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-blue/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-3xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-wider text-blue font-bold">
              Ready to validate?
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text-primary mt-3 leading-tight">
              Test willingness-to-pay before writing a single line of code.
            </h2>
            <p className="text-base sm:text-lg text-text-secondary mt-5 max-w-xl mx-auto leading-relaxed">
              Launch a 7-day validation sprint. Put real traffic in front of competing value propositions. Get statistical proof of demand.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-9 mb-8">
              <Link href="/onboarding">
                <Button size="xl" className="w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold shadow-lg shadow-blue/20 group">
                  Start Your 7-Day Sprint
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="secondary" size="xl" className="w-full sm:w-auto px-8 py-3.5 rounded-full font-medium">
                  View Pricing
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-text-tertiary pt-6 border-t border-border/70">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green" /> No coding required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green" /> Statistical 95% Wilson CI
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green" /> 7-day sprint protocol
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}