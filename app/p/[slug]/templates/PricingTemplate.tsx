"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Shield } from "lucide-react";
import type { LandingPage } from "@/lib/types";
import { fadeIn, stagger, getStoredTrackingParams } from "./shared";
import { IntentModal } from "./IntentModal";

export function PricingTemplate({ page }: { page: LandingPage }) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleCta = (tierName: string) => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: page.slug,
        eventType: "pricing_interaction",
        metadata: { tier: tierName, ...getStoredTrackingParams() },
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
        className="max-w-2xl mx-auto px-6 py-24 text-center"
      >
        <motion.div variants={fadeIn} className="mb-8">
          <span className="inline-block px-4 py-1.5 rounded-full bg-green-500/10 text-green-400 text-sm font-medium border border-green-500/20">
            {page.positioning || "Pricing Plan"}
          </span>
        </motion.div>
        <motion.h1
          variants={fadeIn}
          className="text-4xl md:text-5xl font-bold mb-4"
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
          className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 mb-10"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-sm text-green-400">14-day free trial · Cancel anytime</span>
          </div>
          <ul className="space-y-3 text-left max-w-sm mx-auto mb-8">
            {[
              "Unlimited automated reports",
              "Full multi-tool data sync",
              "Priority 24/7 Slack support",
              "Executive PDF exports",
            ].map((f, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue" />
                <span className="text-slate-300">{f}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleCta("Starter")}
            className="px-8 py-4 bg-blue hover:bg-blue/90 text-white font-semibold rounded-xl text-lg transition-all w-full cursor-pointer"
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
