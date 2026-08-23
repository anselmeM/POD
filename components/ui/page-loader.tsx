"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function PageLoader() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 1800;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const p = Math.min(elapsed / duration, 1);
      // Eased progress
      const eased = 1 - Math.pow(1 - p, 3);
      setProgress(eased * 100);

      if (p < 1) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(() => setLoading(false), 200);
      }
    };
    requestAnimationFrame(animate);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed inset-0 z-[100000] flex items-center justify-center bg-white"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Gradient mesh background */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, transparent 70%)",
                filter: "blur(80px)",
              }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>

          <div className="relative flex flex-col items-center gap-8">
            {/* Logo */}
            <motion.div
              className="relative w-16 h-16"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue to-purple opacity-80" />
              <div className="absolute inset-[3px] rounded-[13px] bg-white flex items-center justify-center">
                <span className="text-blue font-bold text-2xl">P</span>
              </div>
            </motion.div>

            {/* Progress bar */}
            <div className="w-48 h-[2px] bg-border/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue to-purple rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Loading text */}
            <motion.p
              className="text-xs text-text-tertiary tracking-[0.3em] uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Initializing
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}