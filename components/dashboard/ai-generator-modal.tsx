"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  X,
  ArrowRight,
  CheckCircle2,
  Globe,
  CreditCard,
  Zap,
  Split,
  Target,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const sampleIdeas = [
  "Loom for code reviews",
  "Stripe for AI agents",
  "Notion for hardware engineering",
  "Canva for investor pitch decks",
  "Linear for marketing campaigns",
];

interface GeneratedResult {
  slug: string;
  experiment: {
    id: string;
    name: string;
  };
  landingPage: {
    id: string;
    name: string;
    preorderEnabled?: boolean;
  };
  persona?: string;
  variants?: Array<{
    name: string;
    positioning: string;
    headline: string;
    cta: string;
  }>;
}

export function AIGeneratorModal({
  isOpen,
  onClose,
  onGenerated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onGenerated?: () => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [enablePreorder, setEnablePreorder] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    "🧠 Synthesizing target buyer persona & core pain points...",
    "⚖️ Generating contrasting positioning variants (Speed vs. Quality)...",
    "🚀 Deploying live landing page & telemetry tracking...",
  ];

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError(null);
    setCurrentStepIndex(0);

    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);

    try {
      const res = await fetch("/api/ai/smoke-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          enablePreorder,
          depositAmount: 100,
        }),
      });

      clearInterval(stepInterval);

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to generate AI smoke test");
      }

      const data = await res.json();
      setResult(data);
      if (onGenerated) onGenerated();
    } catch (err: any) {
      clearInterval(stepInterval);
      setError(err.message || "Something went wrong while generating the experiment.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPrompt("");
    setResult(null);
    setError(null);
    setLoading(false);
    onClose();
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
          onClick={reset}
          className="absolute inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-2xl z-10 overflow-hidden"
        >
          {/* Top Decorative Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-blue/15 blur-3xl pointer-events-none rounded-full" />

          {/* Close button */}
          <button
            onClick={reset}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {!result ? (
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue/15 border border-blue/30 text-xs font-semibold text-blue mb-4">
                <Sparkles className="w-3.5 h-3.5 text-blue" />
                <span>Instant AI Smoke Test Generator</span>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">
                Turn a 1-Sentence Idea into a Live Smoke Test
              </h2>
              <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                PoD AI will analyze your concept, extract customer personas, draft 2 contrasting positioning angles, and publish a live public landing page with analytics.
              </p>

              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Your Startup Concept
                  </label>
                  <textarea
                    rows={3}
                    required
                    disabled={loading}
                    placeholder="e.g., Loom for code reviews with automated pull request walkthroughs"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue text-sm resize-none"
                  />
                </div>

                {/* Sample Idea Tags */}
                <div>
                  <p className="text-[11px] text-slate-400 mb-1.5 font-medium">Or try an inspiration prompt:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {sampleIdeas.map((idea) => (
                      <button
                        key={idea}
                        type="button"
                        disabled={loading}
                        onClick={() => setPrompt(idea)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-300 hover:text-white text-xs transition-colors cursor-pointer"
                      >
                        {idea}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pre-Order Mode Toggle */}
                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">
                        Enable $1.00 Pre-Order Reservation
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Collects refundable card reservations via Stripe instead of just emails
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setEnablePreorder(!enablePreorder)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      enablePreorder ? "bg-emerald-500" : "bg-slate-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        enablePreorder ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {error && (
                  <p className="text-xs text-rose-400 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    {error}
                  </p>
                )}

                {/* Loading state animation */}
                {loading && (
                  <div className="py-4 space-y-3">
                    <div className="flex items-center gap-2.5 text-xs text-blue font-medium animate-pulse">
                      <Zap className="w-4 h-4" />
                      <span>{steps[currentStepIndex]}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <motion.div
                        className="bg-blue h-full"
                        initial={{ width: "10%" }}
                        animate={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-blue hover:bg-blue/90 text-white font-semibold text-sm transition-all shadow-lg shadow-blue/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    "Synthesizing & Deploying..."
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate & Deploy Smoke Test (15s)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* Success State */
            <div className="text-center py-2 space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  Smoke Test Live & Collecting Signals!
                </h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  We published your live landing page, initialized 2 contrasting variants with 50/50 split testing, and activated telemetry.
                </p>
              </div>

              {/* Live link box */}
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Globe className="w-4 h-4 text-blue flex-shrink-0" />
                  <span className="text-xs font-mono text-slate-200 truncate">
                    /p/{result.slug}
                  </span>
                </div>
                <a
                  href={`/p/${result.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue hover:bg-blue/90 text-white text-xs font-semibold transition-colors flex-shrink-0"
                >
                  <span>Open Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Variants Overview */}
              {result.variants && result.variants.length > 0 && (
                <div className="grid grid-cols-2 gap-3 text-left">
                  {result.variants.map((v, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/80 space-y-1"
                    >
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue">
                        <Split className="w-3 h-3" />
                        <span>{v.positioning}</span>
                      </div>
                      <p className="text-xs text-slate-200 font-medium line-clamp-2">
                        {v.headline}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="secondary"
                  onClick={reset}
                  className="flex-1 py-2.5 text-xs bg-slate-800 hover:bg-slate-700 text-white"
                >
                  Done
                </Button>
                <a
                  href={`/dashboard/experiments/${result.experiment.id}`}
                  className="flex-1"
                >
                  <Button
                    className="w-full py-2.5 text-xs bg-blue hover:bg-blue/90 text-white"
                  >
                    View Experiment
                  </Button>
                </a>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
