"use client";

import React from "react";

interface MarqueeProps {
  items: string[];
  speed?: number;
  className?: string;
}

export function Marquee({ items, speed = 30, className = "" }: MarqueeProps) {
  const duplicated = [...items, ...items];

  return (
    <div className={`overflow-hidden ${className}`}>
      <div
        className="flex gap-8 animate-marquee"
        style={{ animationDuration: `${speed}s` }}
      >
        {duplicated.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-3 text-text-tertiary whitespace-nowrap text-sm font-medium"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue/40" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}