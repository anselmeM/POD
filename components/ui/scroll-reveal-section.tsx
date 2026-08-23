"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ScrollRevealSectionProps {
  eyebrow?: string;
  heading: string;
  subheading?: string;
  children?: React.ReactNode;
  className?: string;
}

export function ScrollRevealSection({
  eyebrow,
  heading,
  subheading,
  children,
  className = "",
}: ScrollRevealSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [100, 0, 0, -100]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.9, 1, 1, 0.9]);

  return (
    <section ref={ref} className={`relative py-32 overflow-hidden ${className}`}>
      <motion.div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ opacity, y, scale }}>
        {eyebrow && (
          <p className="text-xs font-mono text-blue tracking-[0.3em] uppercase mb-6 text-center">
            {eyebrow}
          </p>
        )}
        <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-center max-w-5xl mx-auto leading-[1.1] mb-8 gradient-text-blue">
          {heading}
        </h2>
        {subheading && (
          <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto text-center leading-relaxed mb-12">
            {subheading}
          </p>
        )}
        {children}
      </motion.div>
    </section>
  );
}