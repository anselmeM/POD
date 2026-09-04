"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, Star, Users, Shield, Clock, TrendingUp, X, Sparkles } from "lucide-react";
import type { LandingPage } from "@/lib/types";

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

function IntentModal({
  page,
  isOpen,
  onClose,
}: {
  page: LandingPage;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    let visitorId = "vis-anon";
    try {
      visitorId = localStorage.getItem("pod_vid") || "";
    } catch {
      visitorId = `vis-${Math.random().toString(36).slice(2, 9)}`;
    }

    const trackingParams = (() => {
      try {
        return JSON.parse(sessionStorage.getItem("pod_tracking_params") || "{}");
      } catch {
        return {};
      }
    })();

    const leadSource = trackingParams.utm_source ? String(trackingParams.utm_source).toLowerCase() : "/p/" + page.slug;

    try {
      await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: page.slug,
          eventType: "lead_captured",
          visitorId,
          leadData: {
            name: name || "Anonymous Lead",
            email,
            company,
            role,
            source: leadSource,
            pricingInteraction: true,
          },
          metadata: {
            cta: page.cta,
            positioning: page.positioning,
            ...trackingParams,
          },
        }),
      });

      // Fire client-side pixel conversion events
      if (typeof window !== "undefined") {
        const w = window as unknown as {
          fbq?: (cmd: string, event: string, params?: Record<string, unknown>) => void;
          gtag?: (cmd: string, event: string, params?: Record<string, unknown>) => void;
          lintrk?: (cmd: string, params?: Record<string, unknown>) => void;
        };
        try {
          if (typeof w.fbq === "function") {
            w.fbq("track", "Lead", { content_name: page.name });
          }
          if (typeof w.gtag === "function") {
            w.gtag("event", "generate_lead", { event_label: page.slug });
          }
          if (typeof w.lintrk === "function") {
            w.lintrk("track");
          }
        } catch {}
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit intent:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-2xl z-10"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {!submitted ? (
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue/10 border border-blue/20 text-xs font-semibold text-blue mb-4">
                <Sparkles className="w-3.5 h-3.5" /> Early Access Priority
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">
                Join the Private Beta
              </h2>
              <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                We are onboarding our founding cohort this week. Reserve your spot to lock in 50% lifetime discount pricing.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Alex Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Work Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="alex@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Company (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Acme Inc."
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Role (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Head of Ops"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-3.5 px-6 rounded-xl bg-blue hover:bg-blue/90 text-white font-semibold text-sm transition-all shadow-lg shadow-blue/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Confirming..." : `${page.cta} — Get Priority Access`}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-2xl bg-green/10 border border-green/20 text-green flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">You&apos;re on the priority list!</h3>
              <p className="text-sm text-slate-300 mb-6 leading-relaxed max-w-sm mx-auto">
                We&apos;ve recorded your intent reservation. Check your inbox ({email}) for early-bird onboarding details and founding member perks.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition-colors"
              >
                Close Window
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export function HeroTemplate({ page }: { page: LandingPage }) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleCta = () => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: page.slug, eventType: "cta_click" }),
    }).catch(() => {});
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-4xl mx-auto px-6 py-24 text-center">
        <motion.div variants={fadeIn} className="mb-8"><span className="inline-block px-4 py-1.5 rounded-full bg-blue/10 text-blue text-sm font-medium border border-blue/20">{page.positioning}</span></motion.div>
        <motion.h1 variants={fadeIn} className="text-5xl md:text-6xl font-bold mb-6 leading-tight">{page.headline}</motion.h1>
        <motion.p variants={fadeIn} className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">{page.subheadline}</motion.p>
        <motion.div variants={fadeIn}>
          <button onClick={handleCta} className="px-8 py-4 bg-blue hover:bg-blue/90 text-white font-semibold rounded-xl text-lg transition-all duration-200 shadow-lg shadow-blue/25 hover:shadow-blue/40 hover:-translate-y-0.5 cursor-pointer">
            {page.cta}<ArrowRight className="inline-block ml-2 w-5 h-5" />
          </button>
        </motion.div>
        <motion.div variants={fadeIn} className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          {[{ icon: Users, label: "Visitors Tested", value: page.visitors.toLocaleString() }, { icon: TrendingUp, label: "Live Conv. Rate", value: `${page.conversionRate}%` }, { icon: Clock, label: "Avg. Session Time", value: `${page.avgTimeOnPage || 65}s` }].map((s) => (
            <div key={s.label} className="text-center"><s.icon className="w-5 h-5 mx-auto mb-2 text-blue" /><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-slate-400">{s.label}</p></div>
          ))}
        </motion.div>
      </motion.div>
      <IntentModal page={page} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

export function ProblemTemplate({ page }: { page: LandingPage }) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleCta = () => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: page.slug, eventType: "cta_click" }),
    }).catch(() => {});
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl mx-auto px-6 py-24">
        <motion.div variants={fadeIn} className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-red-500/10 text-red-400 text-sm font-medium border border-red-500/20 mb-6">{page.positioning || "Problem"}</span>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{page.headline}</h1>
          <p className="text-xl text-slate-300">{page.subheadline}</p>
        </motion.div>
        <motion.div variants={fadeIn} className="space-y-4 mb-16">
          {["Manual processes waste hours every week", "Data scattered across multiple disconnected tools", "Reports are outdated by the time leadership sees them"].map((p, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-slate-900/50 border border-slate-800"><CheckCircle2 className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" /><p className="text-slate-300">{p}</p></div>
          ))}
        </motion.div>
        <motion.div variants={fadeIn} className="text-center">
          <button onClick={handleCta} className="px-8 py-4 bg-blue hover:bg-blue/90 text-white font-semibold rounded-xl text-lg transition-all cursor-pointer">
            {page.cta}<ArrowRight className="inline-block ml-2 w-5 h-5" />
          </button>
        </motion.div>
      </motion.div>
      <IntentModal page={page} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

export function SocialProofTemplate({ page }: { page: LandingPage }) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleCta = () => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: page.slug, eventType: "cta_click" }),
    }).catch(() => {});
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-4xl mx-auto px-6 py-24 text-center">
        <motion.div variants={fadeIn} className="flex justify-center gap-1 mb-6">{[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />)}</motion.div>
        <motion.h1 variants={fadeIn} className="text-4xl md:text-5xl font-bold mb-6">{page.headline}</motion.h1>
        <motion.p variants={fadeIn} className="text-xl text-slate-300 mb-10">{page.subheadline}</motion.p>
        <motion.div variants={fadeIn} className="grid md:grid-cols-3 gap-6 mb-16">
          {[{ quote: "Saved our operations team 12 hours per week.", name: "Sarah K.", role: "Ops Lead" }, { quote: "Finally, quantitative reports that executives actually read.", name: "Mike R.", role: "CEO" }, { quote: "Onboarding took less than 5 minutes.", name: "Lisa T.", role: "Product Director" }].map((t, i) => (
            <div key={i} className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 text-left"><p className="text-slate-300 mb-4 italic">&ldquo;{t.quote}&rdquo;</p><p className="text-sm font-medium">{t.name}</p><p className="text-xs text-slate-400">{t.role}</p></div>
          ))}
        </motion.div>
        <motion.div variants={fadeIn}>
          <button onClick={handleCta} className="px-8 py-4 bg-blue hover:bg-blue/90 text-white font-semibold rounded-xl text-lg transition-all cursor-pointer">
            {page.cta}<ArrowRight className="inline-block ml-2 w-5 h-5" />
          </button>
        </motion.div>
      </motion.div>
      <IntentModal page={page} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

export function PricingTemplate({ page }: { page: LandingPage }) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleCta = (tierName: string) => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: page.slug, eventType: "pricing_interaction", metadata: { tier: tierName } }),
    }).catch(() => {});
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-2xl mx-auto px-6 py-24 text-center">
        <motion.div variants={fadeIn} className="mb-8"><span className="inline-block px-4 py-1.5 rounded-full bg-green-500/10 text-green-400 text-sm font-medium border border-green-500/20">{page.positioning || "Pricing Plan"}</span></motion.div>
        <motion.h1 variants={fadeIn} className="text-4xl md:text-5xl font-bold mb-4">{page.headline}</motion.h1>
        <motion.p variants={fadeIn} className="text-xl text-slate-300 mb-10">{page.subheadline}</motion.p>
        <motion.div variants={fadeIn} className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 mb-10">
          <div className="flex items-center justify-center gap-2 mb-6"><Shield className="w-5 h-5 text-green-400" /><span className="text-sm text-green-400">14-day free trial · Cancel anytime</span></div>
          <ul className="space-y-3 text-left max-w-sm mx-auto mb-8">{["Unlimited automated reports", "Full multi-tool data sync", "Priority 24/7 Slack support", "Executive PDF exports"].map((f, i) => <li key={i} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue" /><span className="text-slate-300">{f}</span></li>)}</ul>
          <button onClick={() => handleCta("Starter")} className="px-8 py-4 bg-blue hover:bg-blue/90 text-white font-semibold rounded-xl text-lg transition-all w-full cursor-pointer">
            {page.cta}<ArrowRight className="inline-block ml-2 w-5 h-5" />
          </button>
        </motion.div>
      </motion.div>
      <IntentModal page={page} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

export function MinimalTemplate({ page }: { page: LandingPage }) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleCta = () => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: page.slug, eventType: "cta_click" }),
    }).catch(() => {});
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-xl mx-auto px-6 py-24 text-center">
        <motion.h1 variants={fadeIn} className="text-4xl font-bold mb-4">{page.headline}</motion.h1>
        <motion.p variants={fadeIn} className="text-lg text-slate-500 mb-8">{page.subheadline}</motion.p>
        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={handleCta} className="px-6 py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
            {page.cta}
          </button>
          <Link href="/dashboard" className="px-6 py-3 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors">
            Learn more
          </Link>
        </motion.div>
      </motion.div>
      <IntentModal page={page} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
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

