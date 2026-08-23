"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface StickyScrollItem {
  title: string;
  description: string;
  content: React.ReactNode;
}

interface StickyScrollProps {
  items: StickyScrollItem[];
  className?: string;
}

export function StickyScroll({ items, className = "" }: StickyScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={containerRef} className={`relative ${className}`} style={{ height: `${items.length * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left: text content */}
              <div className="relative">
                {items.map((item, i) => {
                  const start = i / items.length;
                  const end = (i + 1) / items.length;

                  return (
                    <StickyText
                      key={i}
                      item={item}
                      index={i}
                      scrollYProgress={scrollYProgress}
                      start={start}
                      end={end}
                    />
                  );
                })}
              </div>

              {/* Right: visual content */}
              <div className="relative hidden lg:block">
                {items.map((item, i) => {
                  const start = i / items.length;
                  const end = (i + 1) / items.length;

                  return (
                    <StickyVisual
                      key={i}
                      content={item.content}
                      scrollYProgress={scrollYProgress}
                      start={start}
                      end={end}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StickyText({
  item,
  index,
  scrollYProgress,
  start,
  end,
}: {
  item: StickyScrollItem;
  index: number;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
  start: number;
  end: number;
}) {
  const opacity = useTransform(scrollYProgress, [start, start + 0.1, end - 0.1, end], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [start, start + 0.1, end - 0.1, end], [40, 0, 0, -40]);

  return (
    <motion.div className="absolute inset-0 flex flex-col justify-center" style={{ opacity, y }}>
      <span className="text-xs font-mono text-blue mb-4 tracking-wider">0{index + 1}</span>
      <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">{item.title}</h3>
      <p className="text-lg text-text-secondary leading-relaxed max-w-lg">{item.description}</p>
    </motion.div>
  );
}

function StickyVisual({
  content,
  scrollYProgress,
  start,
  end,
}: {
  content: React.ReactNode;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
  start: number;
  end: number;
}) {
  const opacity = useTransform(scrollYProgress, [start, start + 0.1, end - 0.1, end], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [start, start + 0.1, end - 0.1, end], [0.9, 1, 1, 0.9]);
  const rotateY = useTransform(scrollYProgress, [start, start + 0.15], [10, 0]);

  return (
    <motion.div style={{ opacity, scale, rotateY, perspective: 1000 }}>
      {content}
    </motion.div>
  );
}