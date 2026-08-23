"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Star, Users, Shield, Clock, TrendingUp } from "lucide-react";
import type { LandingPage } from "@/lib/types";

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

export function HeroTemplate({ page }: { page: LandingPage }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-4xl mx-auto px-6 py-24 text-center">
        <motion.div variants={fadeIn} className="mb-8"><span className="inline-block px-4 py-1.5 rounded-full bg-blue/10 text-blue text-sm font-medium border border-blue/20">{page.positioning}</span></motion.div>
        <motion.h1 variants={fadeIn} className="text-5xl md:text-6xl font-bold mb-6 leading-tight">{page.headline}</motion.h1>
        <motion.p variants={fadeIn} className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">{page.subheadline}</motion.p>
        <motion.div variants={fadeIn}><button className="px-8 py-4 bg-blue hover:bg-blue/90 text-white font-semibold rounded-xl text-lg transition-all duration-200 shadow-lg shadow-blue/25 hover:shadow-blue/40 hover:-translate-y-0.5">{page.cta}<ArrowRight className="inline-block ml-2 w-5 h-5" /></button></motion.div>
        <motion.div variants={fadeIn} className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          {[{ icon: Users, label: "Users", value: page.visitors.toLocaleString() }, { icon: TrendingUp, label: "Conv.", value: `${page.conversionRate}%` }, { icon: Clock, label: "Avg. Time", value: `${page.avgTimeOnPage}s` }].map((s) => (
            <div key={s.label} className="text-center"><s.icon className="w-5 h-5 mx-auto mb-2 text-blue" /><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-slate-400">{s.label}</p></div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

export function ProblemTemplate({ page }: { page: LandingPage }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl mx-auto px-6 py-24">
        <motion.div variants={fadeIn} className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-red-500/10 text-red-400 text-sm font-medium border border-red-500/20 mb-6">Problem</span>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{page.headline}</h1>
          <p className="text-xl text-slate-300">{page.subheadline}</p>
        </motion.div>
        <motion.div variants={fadeIn} className="space-y-4 mb-16">
          {["Manual processes waste hours every week", "Data scattered across multiple tools", "Reports are outdated by the time they're ready"].map((p, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-slate-900/50 border border-slate-800"><CheckCircle2 className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" /><p className="text-slate-300">{p}</p></div>
          ))}
        </motion.div>
        <motion.div variants={fadeIn} className="text-center"><button className="px-8 py-4 bg-blue hover:bg-blue/90 text-white font-semibold rounded-xl text-lg transition-all">{page.cta}<ArrowRight className="inline-block ml-2 w-5 h-5" /></button></motion.div>
      </motion.div>
    </div>
  );
}

export function SocialProofTemplate({ page }: { page: LandingPage }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-4xl mx-auto px-6 py-24 text-center">
        <motion.div variants={fadeIn} className="flex justify-center gap-1 mb-6">{[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />)}</motion.div>
        <motion.h1 variants={fadeIn} className="text-4xl md:text-5xl font-bold mb-6">{page.headline}</motion.h1>
        <motion.p variants={fadeIn} className="text-xl text-slate-300 mb-10">{page.subheadline}</motion.p>
        <motion.div variants={fadeIn} className="grid md:grid-cols-3 gap-6 mb-16">
          {[{ quote: "Saved us 10 hours per week.", name: "Sarah K.", role: "Ops Manager" }, { quote: "Finally, reports that are actually useful.", name: "Mike R.", role: "CEO" }, { quote: "Setup took 5 minutes.", name: "Lisa T.", role: "Team Lead" }].map((t, i) => (
            <div key={i} className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 text-left"><p className="text-slate-300 mb-4 italic">&ldquo;{t.quote}&rdquo;</p><p className="text-sm font-medium">{t.name}</p><p className="text-xs text-slate-400">{t.role}</p></div>
          ))}
        </motion.div>
        <motion.div variants={fadeIn}><button className="px-8 py-4 bg-blue hover:bg-blue/90 text-white font-semibold rounded-xl text-lg transition-all">{page.cta}<ArrowRight className="inline-block ml-2 w-5 h-5" /></button></motion.div>
      </motion.div>
    </div>
  );
}

export function PricingTemplate({ page }: { page: LandingPage }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-2xl mx-auto px-6 py-24 text-center">
        <motion.div variants={fadeIn} className="mb-8"><span className="inline-block px-4 py-1.5 rounded-full bg-green-500/10 text-green-400 text-sm font-medium border border-green-500/20">Pricing</span></motion.div>
        <motion.h1 variants={fadeIn} className="text-4xl md:text-5xl font-bold mb-4">{page.headline}</motion.h1>
        <motion.p variants={fadeIn} className="text-xl text-slate-300 mb-10">{page.subheadline}</motion.p>
        <motion.div variants={fadeIn} className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 mb-10">
          <div className="flex items-center justify-center gap-2 mb-6"><Shield className="w-5 h-5 text-green-400" /><span className="text-sm text-green-400">14-day free trial</span></div>
          <ul className="space-y-3 text-left max-w-sm mx-auto mb-8">{["Unlimited reports", "All integrations", "Priority support", "Custom branding"].map((f, i) => <li key={i} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue" /><span className="text-slate-300">{f}</span></li>)}</ul>
          <button className="px-8 py-4 bg-blue hover:bg-blue/90 text-white font-semibold rounded-xl text-lg transition-all w-full">{page.cta}<ArrowRight className="inline-block ml-2 w-5 h-5" /></button>
        </motion.div>
      </motion.div>
    </div>
  );
}

export function MinimalTemplate({ page }: { page: LandingPage }) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-xl mx-auto px-6 py-24 text-center">
        <motion.h1 variants={fadeIn} className="text-4xl font-bold mb-4">{page.headline}</motion.h1>
        <motion.p variants={fadeIn} className="text-lg text-slate-500 mb-8">{page.subheadline}</motion.p>
        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-3 justify-center">
          <button className="px-6 py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors">{page.cta}</button>
          <Link href="/dashboard" className="px-6 py-3 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors">Learn more</Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

export const templateRenderers: Record<string, React.FC<{ page: LandingPage }>> = {
  hero: HeroTemplate,
  problem: ProblemTemplate,
  "social-proof": SocialProofTemplate,
  pricing: PricingTemplate,
  minimal: MinimalTemplate,
};
