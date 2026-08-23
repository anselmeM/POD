"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { TiltCard } from "@/components/ui/tilt-card";

export function DashboardPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-30" />
      <motion.div ref={ref} className="relative max-w-5xl mx-auto px-4" initial={{ opacity: 0, y: 60 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}>
        <div className="absolute -inset-8 bg-gradient-to-b from-blue/5 via-purple/3 to-transparent rounded-3xl blur-2xl" />
        <TiltCard className="relative" tiltAmount={3}>
          <div className="glass border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red/50" />
                <div className="w-3 h-3 rounded-full bg-amber/50" />
                <div className="w-3 h-3 rounded-full bg-green/50" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-white/[0.04] rounded-lg px-4 py-1.5 text-xs text-text-tertiary text-center max-w-md mx-auto font-mono">app.proofofdemand.dev/dashboard</div>
              </div>
            </div>
            <DashboardContent isInView={isInView} />
          </div>
        </TiltCard>
      </motion.div>
    </section>
  );
}

function DashboardContent({ isInView }: { isInView: boolean }) {
  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Good evening, Alex</h3>
          <p className="text-sm text-text-secondary">Here&apos;s what your current validation sprint is telling you.</p>
        </div>
        <Badge variant="green">Sprint Active</Badge>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Demand Score", value: "78/100", change: "+14%", positive: true },
          { label: "Experiments", value: "3", sub: "active" },
          { label: "Visitors", value: "1,842", sub: "Last 7 days" },
          { label: "High-Intent", value: "127", sub: "6.9% of visitors", positive: true },
        ].map((m, i) => (
          <motion.div key={m.label} className="glass rounded-xl p-4 hover:border-blue/20 transition-colors" initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3 + i * 0.1 }}>
            <p className="text-xs text-text-tertiary mb-1">{m.label}</p>
            <p className="text-2xl font-bold font-mono">{m.value}</p>
            {"change" in m && m.change && <p className={`text-xs mt-1 ${m.positive ? "text-green" : "text-red"}`}>{m.change}</p>}
            {"sub" in m && m.sub && <p className="text-xs text-text-tertiary mt-1">{m.sub}</p>}
          </motion.div>
        ))}
      </div>
      <ChartSection isInView={isInView} />
      <AIRecommendation isInView={isInView} />
    </div>
  );
}

function ChartSection({ isInView }: { isInView: boolean }) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium">Demand Signal Over Time</span>
        <Badge variant="blue">7 days</Badge>
      </div>
      <div className="h-32 flex items-end gap-1">
        {[35, 42, 48, 55, 62, 58, 71, 78, 82, 75, 88, 92, 86, 95].map((h, i) => (
          <motion.div key={i} className="flex-1 rounded-t-sm relative group cursor-pointer" initial={{ height: 0 }} animate={isInView ? { height: `${h}%` } : {}} transition={{ duration: 0.6, delay: 0.5 + i * 0.04, ease: [0.23, 1, 0.32, 1] }}>
            <div className="absolute inset-0 bg-blue/8 rounded-t-sm group-hover:bg-blue/15 transition-colors" />
            <div className="absolute inset-x-0 top-0 bg-blue/20 rounded-t-sm group-hover:bg-blue/30 transition-colors" style={{ height: "60%" }} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function AIRecommendation({ isInView }: { isInView: boolean }) {
  return (
    <motion.div className="mt-4 glass border border-blue/10 rounded-xl p-4" initial={{ opacity: 0, y: 10 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 1.2 }}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-blue/10 flex items-center justify-center shrink-0">
          <span className="text-blue text-sm font-bold">AI</span>
        </div>
        <div>
          <p className="text-sm font-medium mb-1">Recommendation</p>
          <p className="text-xs text-text-secondary">Variant B is generating 2.4x more high-intent interactions. Consider shifting budget and testing the winning positioning against a $49 vs $79 price point.</p>
        </div>
      </div>
    </motion.div>
  );
}

