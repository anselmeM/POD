"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { GradientMesh } from "@/components/ui/gradient-mesh";
import { ParticleField } from "@/components/ui/particle-field";
import { TextReveal } from "@/components/ui/text-reveal";
import { Badge } from "@/components/ui/badge";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, target]);

  return <span ref={ref} className="font-mono">{count.toLocaleString()}{suffix}</span>;
}

function SignalPulse() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue/8"
          initial={{ width: 200, height: 200, opacity: 0.3 }}
          animate={{ width: [200, 800], height: [200, 800], opacity: [0.3, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: i * 1.3, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center overflow-hidden">
      <GradientMesh />
      <ParticleField particleCount={50} />
      <SignalPulse />
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

      <motion.div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 w-full" style={{ y, opacity, scale }}>
        <div className="max-w-5xl mx-auto">
          <motion.div className="flex justify-center mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <Badge variant="blue" className="px-4 py-1.5 text-xs tracking-wide">
              <Sparkles className="w-3 h-3 mr-1.5" />
              AI-Powered Demand Validation
            </Badge>
          </motion.div>

          <div className="text-center mb-8">
            <TextReveal as="h1" className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight leading-[0.95]" delay={0.3} staggerChildren={0.04}>
              Prove demand before you build.
            </TextReveal>
          </div>

          <motion.p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto text-center mb-12 leading-relaxed" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }}>
            PoD Engine turns startup ideas into measurable demand experiments—combining AI-generated positioning, multi-variant landing pages, targeted ad tests, and willingness-to-pay analysis.
          </motion.p>

          <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1 }}>
            <MagneticButton strength={0.15}>
              <Link href="/sign-up">
                <Button size="xl" className="group relative overflow-hidden">
                  <span className="relative z-10 flex items-center gap-2">
                    Start a Validation Sprint
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>
            </MagneticButton>
            <MagneticButton strength={0.15}>
              <Link href="#how-it-works">
                <Button variant="secondary" size="xl" className="group">
                  See How It Works
                  <motion.span className="inline-block" animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
                </Button>
              </Link>
            </MagneticButton>
          </motion.div>

          <motion.div className="grid grid-cols-3 gap-8 max-w-lg mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.2 }}>
            {[
              { value: 2847, suffix: "+", label: "Experiments Run" },
              { value: 94, suffix: "%", label: "Accuracy Rate" },
              { value: 12, suffix: "x", label: "Faster Validation" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold gradient-text-blue">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-xs text-text-tertiary mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
          <span className="text-[10px] uppercase tracking-[0.2em] text-text-tertiary">Scroll</span>
          <motion.div className="w-[1px] h-8 bg-gradient-to-b from-blue/30 to-transparent" animate={{ scaleY: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity }} />
        </motion.div>
      </motion.div>
    </section>
  );
}