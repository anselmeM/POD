"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Users, TrendingUp, Clock } from "lucide-react";
import type { LandingPage } from "@/lib/types";
import { fadeIn, stagger, getStoredTrackingParams } from "./shared";
import { IntentModal } from "./IntentModal";

export function HeroTemplate({ page }: { page: LandingPage }) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="max-w-4xl mx-auto px-6 py-24 text-center"
      >
        <motion.div variants={fadeIn} className="mb-8">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue/10 text-blue text-sm font-medium border border-blue/20">
            {page.positioning}
          </span>
        </motion.div>
        <motion.h1
          variants={fadeIn}
          className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
        >
          {page.headline}
        </motion.h1>
        <motion.p
          variants={fadeIn}
          className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto"
        >
          {page.subheadline}
        </motion.p>
        <motion.div variants={fadeIn}>
          <button
            onClick={handleCta}
            className="px-8 py-4 bg-blue hover:bg-blue/90 text-white font-semibold rounded-xl text-lg transition-all duration-200 shadow-lg shadow-blue/25 hover:shadow-blue/40 hover:-translate-y-0.5 cursor-pointer"
          >
            {page.cta}
            <ArrowRight className="inline-block ml-2 w-5 h-5" />
          </button>
        </motion.div>
        <motion.div
          variants={fadeIn}
          className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
        >
          {[
            {
              icon: Users,
              label: "Visitors Tested",
              value: page.visitors.toLocaleString(),
            },
            {
              icon: TrendingUp,
              label: "Live Conv. Rate",
              value: `${page.conversionRate}%`,
            },
            {
              icon: Clock,
              label: "Avg. Session Time",
              value: `${page.avgTimeOnPage || 65}s`,
            },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <s.icon className="w-5 h-5 mx-auto mb-2 text-blue" />
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
      <IntentModal page={page} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
