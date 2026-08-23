"use client";

import React, { useEffect, useRef } from "react";

interface SmoothScrollProps {
  children: React.ReactNode;
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<unknown>(null);

  useEffect(() => {
    let animId: number;

    import("lenis").then(({ default: Lenis }) => {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        touchMultiplier: 2,
        infinite: false,
      });

      lenisRef.current = lenis;

      const raf = (time: number) => {
        lenis.raf(time);
        animId = requestAnimationFrame(raf);
      };
      animId = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(animId);
      if (lenisRef.current) {
        (lenisRef.current as { destroy: () => void }).destroy();
      }
    };
  }, []);

  return <>{children}</>;
}