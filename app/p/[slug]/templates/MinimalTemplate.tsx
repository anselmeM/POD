"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { LandingPage } from "@/lib/types";
import { fadeIn, stagger, getStoredTrackingParams } from "./shared";
import { IntentModal } from "./IntentModal";

export function MinimalTemplate({ page }: { page: LandingPage }) {
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
    <div className="min-h-screen bg-white text-slate-900">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="max-w-xl mx-auto px-6 py-24 text-center"
      >
        <motion.h1
          variants={fadeIn}
          className="text-4xl font-bold mb-4"
        >
          {page.headline}
        </motion.h1>
        <motion.p
          variants={fadeIn}
          className="text-lg text-slate-500 mb-8"
        >
          {page.subheadline}
        </motion.p>
        <motion.div
          variants={fadeIn}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <button
            onClick={handleCta}
            className="px-6 py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {page.cta}
          </button>
          <Link
            href="/dashboard"
            className="px-6 py-3 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            Learn more
          </Link>
        </motion.div>
      </motion.div>
      <IntentModal page={page} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
