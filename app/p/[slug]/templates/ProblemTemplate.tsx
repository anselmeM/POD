"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { LandingPage } from "@/lib/types";
import { fadeIn, stagger, getStoredTrackingParams } from "./shared";
import { IntentModal } from "./IntentModal";

export function ProblemTemplate({ page }: { page: LandingPage }) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleCta = () => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: page.slug,
        eventType: "cta_click",
        metadata: getStoredTrackingParams(),
      }),
    }).catch(() => {});
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="max-w-3xl mx-auto px-6 py-24"
      >
        <motion.div variants={fadeIn} className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-red-500/10 text-red-400 text-sm font-medium border border-red-500/20 mb-6">
            {page.positioning || "Problem"}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{page.headline}</h1>
          <p className="text-xl text-slate-300">{page.subheadline}</p>
        </motion.div>
        <motion.div variants={fadeIn} className="space-y-4 mb-16">
          {[
            "Manual processes waste hours every week",
            "Data scattered across multiple disconnected tools",
            "Reports are outdated by the time leadership sees them",
          ].map((p, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 rounded-xl bg-slate-900/50 border border-slate-800"
            >
              <CheckCircle2 className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-slate-300">{p}</p>
            </div>
          ))}
        </motion.div>
        <motion.div variants={fadeIn} className="text-center">
          <button
            onClick={handleCta}
            className="px-8 py-4 bg-blue hover:bg-blue/90 text-white font-semibold rounded-xl text-lg transition-all cursor-pointer"
          >
            {page.cta}
            <ArrowRight className="inline-block ml-2 w-5 h-5" />
          </button>
        </motion.div>
      </motion.div>
      <IntentModal page={page} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
