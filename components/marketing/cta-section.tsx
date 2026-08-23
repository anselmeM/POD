"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { TextReveal } from "@/components/ui/text-reveal";

export function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <motion.div
          className="relative rounded-3xl overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Animated gradient border */}
          <div className="gradient-border rounded-3xl">
            <div className="relative bg-white rounded-3xl shadow-xl">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue/5 via-transparent to-purple/3 rounded-3xl" />
              <div className="absolute inset-0 grid-pattern opacity-15 rounded-3xl" />

              {/* Animated glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue/3 rounded-full blur-3xl" />

              <div className="relative p-12 sm:p-16 lg:p-20 text-center">
                <TextReveal as="h2" className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6" delay={0.1}>
                  Stop building on intuition.
                </TextReveal>
                <motion.p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed" initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.4 }}>
                  One week. Real traffic. Real behavior. Better decisions.
                  Find out what customers actually want before you spend six months building it.
                </motion.p>
                <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8" initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.6 }}>
                  <MagneticButton strength={0.15}>
                    <Link href="/sign-up">
                      <Button size="xl" className="group">
                        Start Your First Validation
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </MagneticButton>
                  <MagneticButton strength={0.15}>
                    <Link href="/pricing">
                      <Button variant="secondary" size="xl">View Pricing</Button>
                    </Link>
                  </MagneticButton>
                </motion.div>
                <motion.p className="text-sm text-text-tertiary" initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.8 }}>
                  Don&apos;t build first. Prove first.
                </motion.p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}