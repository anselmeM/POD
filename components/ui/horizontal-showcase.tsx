"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface HorizontalShowcaseItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
}

interface HorizontalShowcaseProps {
  items: HorizontalShowcaseItem[];
  className?: string;
}

export function HorizontalShowcase({ items, className = "" }: HorizontalShowcaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", `-${(items.length - 1) * 60}%`]
  );

  const cardWidth = typeof window !== "undefined" && window.innerWidth < 768 ? "80vw" : "40vw";

  return (
    <div ref={containerRef} className={`relative ${className}`} style={{ height: `${items.length * 80}vh` }}>
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <motion.div className="flex gap-8 pl-[10vw]" style={{ x }}>
          {items.map((item, i) => (
            <motion.div
              key={i}
              className="flex-shrink-0 relative group"
              style={{ width: cardWidth }}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative rounded-3xl border border-border/30 overflow-hidden bg-surface-elevated p-10 h-[60vh] flex flex-col justify-between">
                {/* Gradient accent */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: item.gradient }}
                />

                {/* Grid pattern */}
                <div className="absolute inset-0 grid-pattern opacity-20" />

                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-surface border border-border/30 flex items-center justify-center mb-8 group-hover:border-blue/30 transition-colors">
                    {item.icon}
                  </div>
                  <h3 className="text-3xl font-bold mb-4">{item.title}</h3>
                  <p className="text-text-secondary text-lg leading-relaxed max-w-sm">{item.description}</p>
                </div>

                <div className="relative flex items-center gap-2 text-sm text-text-tertiary">
                  <span className="font-mono text-xs">0{i + 1}</span>
                  <div className="flex-1 h-[1px] bg-border/30" />
                  <span className="text-xs">Scroll to explore</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}