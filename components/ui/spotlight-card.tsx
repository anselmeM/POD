"use client";

import React, { useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}

export function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(88, 166, 255, 0.06)",
  ...props
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ref.current.style.setProperty("--mouse-x", `${x}px`);
      ref.current.style.setProperty("--mouse-y", `${y}px`);
    },
    []
  );

  return (
    <div
      ref={ref}
      className={cn("spotlight-card", className)}
      onMouseMove={handleMouseMove}
      style={
        {
          "--spotlight-color": spotlightColor,
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </div>
  );
}
