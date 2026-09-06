"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import type { LandingPage } from "@/lib/types";
import { fadeIn, stagger, getStoredTrackingParams } from "./shared";
import { IntentModal } from "./IntentModal";

export function SocialProofTemplate({ page }: { page: LandingPage }) {
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
        className="max-w-4xl mx-auto px-6 py-24 text-center"
      >
        <motion.div variants={fadeIn} className="flex justify-center gap-1 mb-6">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          ))}
        </motion.div>
        <motion.h1
          variants={fadeIn}
          className="text-4xl md:text-5xl font-bold mb-6"
        >
          {page.headline}
        </motion.h1>
        <motion.p
          variants={fadeIn}
          className="text-xl text-slate-300 mb-10"
        >
          {page.subheadline}
        </motion.p>
        <motion.div
          variants={fadeIn}
          className="grid md:grid-cols-3 gap-6 mb-16"
        >
          {[
            {
              quote: "Saved our operations team 12 hours per week.",
              name: "Sarah K.",
              role: "Ops Lead",
            },
            {
              quote: "Finally, quantitative reports that executives actually read.",
              name: "Mike R.",
              role: "CEO",
            },
            {
              quote: "Onboarding took less than 5 minutes.",
              name: "Lisa T.",
              role: "Product Director",
            },
          ].map((t, i) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 text-left"
            >
              <p className="text-slate-300 mb-4 italic">&ldquo;{t.quote}&rdquo;</p>
              <p className="text-sm font-medium">{t.name}</p>
              <p className="text-xs text-slate-400">{t.role}</p>
            </div>
          ))}
        </motion.div>
        <motion.div variants={fadeIn}>
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
