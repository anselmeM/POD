"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Plus, Trash2, Sparkles, Settings2,
  CheckCircle2, ArrowRight, Zap, Target, DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/lib/types";
import { EXPERIMENT_TEMPLATES } from "@/lib/experiment-templates";

const CHANNELS = [
  { id: "linkedin", label: "LinkedIn" },
  { id: "meta", label: "Meta" },
  { id: "google", label: "Google" },
  { id: "twitter", label: "Twitter" },
] as const;

type DraftVariant = {
  name: string;
  headline: string;
  cta: string;
  positioning: string;
  trafficAllocation: number;
};

function defaultVariant(idx: number): DraftVariant {
  return {
    name: `Variant ${String.fromCharCode(65 + idx)}`,
    headline: "",
    cta: "Learn More",
    positioning: "",
    trafficAllocation: idx === 0 ? 50 : 50,
  };
}

export default function NewExperimentPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");

  // Mode: "guided" (AI Smoke Test Wizard) vs "custom" (Manual Configuration)
  const [mode, setMode] = useState<"guided" | "custom">("guided");

  // Guided Mode States
  const [guidedStep, setGuidedStep] = useState<1 | 2 | 3>(1);
  const [productName, setProductName] = useState("");
  const [oneLiner, setOneLiner] = useState("");
  const [painPoint, setPainPoint] = useState("");
  const [expectedPrice, setExpectedPrice] = useState("39");
  const [angleA, setAngleA] = useState("Save 10 hours every month on tedious tasks");
  const [angleB, setAngleB] = useState("Never worry about errors, audits, or lost revenue again");
  const [ctaChoice, setCtaChoice] = useState("Join Early Access");

  // Custom Mode States
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("100");
  const [channels, setChannels] = useState<string[]>(["linkedin", "meta"]);
  const [variants, setVariants] = useState<DraftVariant[]>([defaultVariant(0), defaultVariant(1)]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((j) => {
        const list: Project[] = j.data || [];
        setProjects(list);
        if (list[0]) {
          setProjectId(list[0].id);
          if (!productName) setProductName(list[0].name);
        }
      })
      .catch(() => {});
  }, [productName]);

  const totalAllocation = variants.reduce((s, v) => s + (Number(v.trafficAllocation) || 0), 0);

  const toggleChannel = (id: string) => {
    setChannels((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const updateVariant = (idx: number, patch: Partial<DraftVariant>) => {
    setVariants((prev) => prev.map((v, i) => (i === idx ? { ...v, ...patch } : v)));
  };

  const addVariant = () => {
    if (variants.length >= 4) return;
    const next = [...variants, defaultVariant(variants.length)];
    const each = Math.floor(100 / next.length);
    const remainder = 100 - each * next.length;
    setVariants(next.map((v, i) => ({ ...v, trafficAllocation: each + (i === 0 ? remainder : 0) })));
  };

  const removeVariant = (idx: number) => {
    if (variants.length <= 1) return;
    const next = variants.filter((_, i) => i !== idx);
    const each = Math.floor(100 / next.length);
    const remainder = 100 - each * next.length;
    setVariants(next.map((v, i) => ({ ...v, trafficAllocation: each + (i === 0 ? remainder : 0) })));
  };

  const applyTemplate = (id: string) => {
    const tpl = EXPERIMENT_TEMPLATES.find((t) => t.id === id);
    if (!tpl) return;
    setBudget(String(tpl.budget));
    setChannels(tpl.channel);
    setVariants(tpl.variants.map((v) => ({ ...v })));
    if (!name) setName(`${tpl.name} — ${new Date().toLocaleDateString()}`);
  };

  // Launch from Guided Wizard
  const handleGuidedLaunch = async () => {
    setError("");
    if (!projectId) { setError("Please select a project."); return; }
    if (!productName.trim()) { setError("Product name is required."); return; }
    setLoading(true);

    try {
      const res = await fetch("/api/experiments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${productName} Smoke Test — ${new Date().toLocaleDateString()}`,
          projectId,
          budget: 100,
          channel: ["linkedin", "meta"],
          status: "running",
          variants: [
            {
              name: "Variant A (Efficiency / Time)",
              headline: angleA || `Fast, automated ${productName}`,
              cta: ctaChoice || "Join Early Access",
              positioning: "Time-saving & speed focus",
              trafficAllocation: 50,
            },
            {
              name: "Variant B (Risk / Assurance)",
              headline: angleB || `100% Reliable ${productName}`,
              cta: ctaChoice || "Join Early Access",
              positioning: "Security, compliance & peace of mind",
              trafficAllocation: 50,
            },
          ],
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create experiment");
      router.push(`/dashboard/experiments/${json.data.id}`);
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  };

  // Launch from Custom Setup
  const handleCustomCreate = async () => {
    setError("");
    if (!name.trim()) { setError("Experiment name is required."); return; }
    if (!projectId) { setError("Please select a project."); return; }
    if (variants.some((v) => !v.name.trim() || !v.headline.trim())) {
      setError("Each variant needs a name and headline.");
      return;
    }
    if (totalAllocation !== 100) {
      setError(`Traffic allocation must sum to 100% (currently ${totalAllocation}%).`);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/experiments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          projectId,
          budget: Number(budget) || 0,
          channel: channels,
          status: "draft",
          variants: variants.map((v) => ({
            name: v.name.trim(),
            headline: v.headline.trim(),
            cta: v.cta.trim() || "Learn More",
            positioning: v.positioning.trim(),
            trafficAllocation: Number(v.trafficAllocation) || 0,
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create experiment");
      router.push(`/dashboard/experiments/${json.data.id}`);
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/experiments">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">New Experiment</h1>
            <p className="text-sm text-text-secondary">Deploy a smoke test to validate market demand.</p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-surface-elevated border border-border">
          <button
            type="button"
            onClick={() => setMode("guided")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === "guided"
                ? "bg-blue text-white shadow-xs"
                : "text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-primary)]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Guided AI Test</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("custom")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === "custom"
                ? "bg-blue text-white shadow-xs"
                : "text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-primary)]"
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Custom Setup</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red/10 border border-red/20 rounded-xl text-xs text-red font-medium">
          {error}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 1: GUIDED AI SMOKE TEST WIZARD */}
      {/* ========================================================================= */}
      {mode === "guided" && (
        <div className="space-y-6">
          {/* Step Pills */}
          <div className="flex items-center justify-between gap-2 p-2 bg-surface-elevated/40 border border-border/60 rounded-xl">
            {[
              { num: 1, label: "Idea & Problem" },
              { num: 2, label: "Angle & Pricing" },
              { num: 3, label: "Review & Launch" },
            ].map((s) => (
              <button
                key={s.num}
                type="button"
                onClick={() => setGuidedStep(s.num as 1 | 2 | 3)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                  guidedStep === s.num
                    ? "bg-surface-elevated text-blue shadow-xs border border-border"
                    : "text-[var(--dash-text-tertiary)] hover:text-[var(--dash-text-secondary)]"
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  guidedStep === s.num ? "bg-blue text-white" : "bg-border text-[var(--dash-text-secondary)]"
                }`}>
                  {s.num}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            ))}
          </div>

          {/* Step 1: Idea & Problem */}
          {guidedStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue" />
                  <span>Step 1: Your Idea & Core Problem</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {projects.length > 1 && (
                  <div>
                    <label className="text-xs font-semibold text-[var(--dash-text-secondary)] block mb-1.5">
                      Assign to Project
                    </label>
                    <select
                      className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm"
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-[var(--dash-text-secondary)] block mb-1.5">
                    Product Name / Working Title
                  </label>
                  <Input
                    placeholder="e.g. TaxSnap AI"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--dash-text-secondary)] block mb-1.5">
                    One-Liner (What does it do?)
                  </label>
                  <Input
                    placeholder="e.g. Automated receipt tax prep for freelance creatives"
                    value={oneLiner}
                    onChange={(e) => setOneLiner(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--dash-text-secondary)] block mb-1.5">
                    Pain Point (What hurts without it?)
                  </label>
                  <Input
                    placeholder="e.g. Losing receipts, wasting 15 hrs every tax season, fear of IRS audits"
                    value={painPoint}
                    onChange={(e) => setPainPoint(e.target.value)}
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    onClick={() => {
                      if (!productName.trim()) { setError("Product name is required."); return; }
                      setError("");
                      setGuidedStep(2);
                    }}
                    className="gap-2"
                  >
                    <span>Next: Value Angles</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Value Angles & Pricing */}
          {guidedStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  <span>Step 2: Value Angles & Target Pricing</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--dash-text-secondary)] block mb-1.5">
                    Target Subscription Price ($/month)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-text-tertiary">$</span>
                    <Input
                      type="number"
                      value={expectedPrice}
                      onChange={(e) => setExpectedPrice(e.target.value)}
                      className="w-32"
                    />
                    <span className="text-xs text-text-secondary">/ month</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <p className="text-xs font-semibold text-[var(--dash-text-secondary)]">
                    Two Competing Value Propositions to Test:
                  </p>

                  <div className="p-3.5 rounded-xl border border-border bg-surface/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="blue">Variant A (Efficiency / Speed)</Badge>
                      <span className="text-xs text-text-tertiary">50% Traffic</span>
                    </div>
                    <Input
                      value={angleA}
                      onChange={(e) => setAngleA(e.target.value)}
                      placeholder="e.g. Save 10 hours every month on bookkeeping"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl border border-border bg-surface/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="green">Variant B (Risk / Assurance)</Badge>
                      <span className="text-xs text-text-tertiary">50% Traffic</span>
                    </div>
                    <Input
                      value={angleB}
                      onChange={(e) => setAngleB(e.target.value)}
                      placeholder="e.g. 100% Audit-Proof Tax Prep Guaranteed"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--dash-text-secondary)] block mb-1.5">
                    Primary Conversion Call to Action (CTA)
                  </label>
                  <select
                    className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm"
                    value={ctaChoice}
                    onChange={(e) => setCtaChoice(e.target.value)}
                  >
                    <option value="Join Early Access">Join Early Access (Email Capture)</option>
                    <option value="Reserve Spot ($1 Deposit)">Reserve Spot ($1 Refundable Deposit)</option>
                    <option value="Start 14-Day Pilot">Start 14-Day Pilot</option>
                    <option value="Request Demo">Request Discovery Demo</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <Button variant="ghost" onClick={() => setGuidedStep(1)}>Back</Button>
                  <Button onClick={() => setGuidedStep(3)} className="gap-2">
                    <span>Next: Review & Deploy</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Review & Launch */}
          {guidedStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Step 3: Confirm & Launch Smoke Test</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 space-y-1">
                  <p className="font-bold">Ready to collect proof of demand!</p>
                  <p>PoD will spin up two live landing page variants, initialize Bayesian significance tracking, and start your 7-day validation cycle.</p>
                </div>

                <div className="space-y-2 border border-border/80 rounded-xl p-3.5 bg-surface/40">
                  <h4 className="text-xs font-bold text-[var(--dash-text-secondary)] uppercase">Experiment Summary</h4>
                  <div className="text-xs space-y-1">
                    <p><span className="text-text-tertiary">Product:</span> <strong>{productName}</strong></p>
                    <p><span className="text-text-tertiary">Target Price:</span> <strong>${expectedPrice}/month</strong></p>
                    <p><span className="text-text-tertiary">Variant A:</span> &quot;{angleA}&quot;</p>
                    <p><span className="text-text-tertiary">Variant B:</span> &quot;{angleB}&quot;</p>
                    <p><span className="text-text-tertiary">Primary CTA:</span> <strong>{ctaChoice}</strong></p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <Button variant="ghost" onClick={() => setGuidedStep(2)}>Back</Button>
                  <Button onClick={handleGuidedLaunch} disabled={loading} className="gap-2 bg-blue text-white shadow-lg">
                    {loading ? "Deploying Smoke Test..." : "🚀 Launch Live Smoke Test"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: CUSTOM SETUP FORM (EXISTING POWER-USER CONFIG) */}
      {/* ========================================================================= */}
      {mode === "custom" && (
        <>
          {/* Template Quick Select */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-text-secondary">Start from a Template</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {EXPERIMENT_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => applyTemplate(t.id)}
                    className="text-left p-3 rounded-lg border border-border hover:border-blue/50 hover:bg-surface-elevated transition-colors text-xs space-y-1"
                  >
                    <div className="font-semibold text-text-primary">{t.name}</div>
                    <div className="text-text-tertiary line-clamp-1">{t.description}</div>
                  </button>

                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Experiment Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">Project</label>
                <select
                  className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">Experiment Name</label>
                <Input placeholder="e.g. Value Prop Headline Test" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1">Budget ($)</label>
                  <Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1">Channels</label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {CHANNELS.map((ch) => {
                      const sel = channels.includes(ch.id);
                      return (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => toggleChannel(ch.id)}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                            sel ? "bg-blue/15 border-blue text-blue" : "border-border text-text-secondary hover:border-border/80"
                          }`}
                        >
                          {ch.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Variants */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Variants ({variants.length}/4)</CardTitle>
                <p className="text-xs text-text-tertiary mt-0.5">Traffic allocated: {totalAllocation}%</p>
              </div>
              {variants.length < 4 && (
                <Button size="sm" variant="secondary" onClick={addVariant}>
                  <Plus className="w-3.5 h-3.5" /> Add Variant
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {variants.map((v, i) => (
                <div key={i} className="p-4 rounded-lg border border-border space-y-3 bg-surface-elevated/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue">{v.name || `Variant ${i + 1}`}</span>
                    {variants.length > 2 && (
                      <button type="button" onClick={() => removeVariant(i)} className="text-text-tertiary hover:text-red">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-text-tertiary block mb-1">Variant Name</label>
                      <Input value={v.name} onChange={(e) => updateVariant(i, { name: e.target.value })} placeholder="e.g. Variant A (Control)" />
                    </div>
                    <div>
                      <label className="text-[11px] text-text-tertiary block mb-1">Traffic %</label>
                      <Input type="number" value={v.trafficAllocation} onChange={(e) => updateVariant(i, { trafficAllocation: Number(e.target.value) })} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-text-tertiary block mb-1">Headline</label>
                    <Input value={v.headline} onChange={(e) => updateVariant(i, { headline: e.target.value })} placeholder="e.g. The fastest way to validate demand." />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-text-tertiary block mb-1">Call to Action (CTA)</label>
                      <Input value={v.cta} onChange={(e) => updateVariant(i, { cta: e.target.value })} placeholder="e.g. Join Waitlist" />
                    </div>
                    <div>
                      <label className="text-[11px] text-text-tertiary block mb-1">Positioning Angle</label>
                      <Input value={v.positioning} onChange={(e) => updateVariant(i, { positioning: e.target.value })} placeholder="e.g. Speed / ROI" />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Link href="/dashboard/experiments"><Button variant="ghost">Cancel</Button></Link>
            <Button onClick={handleCustomCreate} disabled={loading}>
              {loading ? "Creating..." : "Create Experiment"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
