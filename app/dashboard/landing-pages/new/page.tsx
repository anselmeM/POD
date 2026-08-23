"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Layout, Sparkles, Target, Megaphone, Check, Wand2, Globe, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLandingPageStore } from "@/lib/store";
import type { LandingPageTemplate } from "@/lib/types";

const steps = [
  { label: "Template", icon: Layout },
  { label: "Content", icon: Megaphone },
  { label: "Audience", icon: Target },
  { label: "Review", icon: Check },
];

const templates = [
  { id: "tpl-hero", name: "Hero-Focused", description: "Bold headline with a single strong CTA. Best for clear value propositions.", preview: "gradient-to-r from-blue to-indigo", bestFor: "Time-savings products" },
  { id: "tpl-problem", name: "Problem-Aware", description: "Lead with the pain point, then present your solution. Great for B2B.", preview: "gradient-to-r from-amber to-orange", bestFor: "B2B SaaS tools" },
  { id: "tpl-social", name: "Social Proof", description: "Testimonials and stats front-and-center. Builds trust fast.", preview: "gradient-to-r from-green to-emerald", bestFor: "Consumer products" },
  { id: "tpl-pricing", name: "Pricing-First", description: "Show pricing immediately. Best for willingness-to-pay tests.", preview: "gradient-to-r from-purple to-violet", bestFor: "Pricing experiments" },
  { id: "tpl-minimal", name: "Minimal", description: "Clean, distraction-free. Lets the headline do all the work.", preview: "gradient-to-r from-slate to-gray", bestFor: "Early validation" },
];

const positioningOptions = [
  { id: "pos-timesaving", label: "Time Savings", desc: "Save X hours per week on reporting" },
  { id: "pos-automation", label: "Automation", desc: "Automate your weekly reports with AI" },
  { id: "pos-speed", label: "Speed", desc: "Get your numbers in minutes, not days" },
  { id: "pos-accuracy", label: "Accuracy", desc: "Error-free reports, every time" },
];

const ctaOptions = [
  "Start Free Trial", "Get Early Access", "See How It Works", "Book a Demo", "Join Waitlist", "Learn More",
];

export default function NewLandingPagePage() {
  const router = useRouter();
  const { addLandingPage } = useLandingPageStore();
  const [step, setStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState("tpl-hero");
  const [headline, setHeadline] = useState("Reduce Weekly Reporting Time by 50%");
  const [subheadline, setSubheadline] = useState("AI-powered reports that connect to your existing tools and deliver insights in minutes.");
  const [selectedCta, setSelectedCta] = useState("Start Free Trial");
  const [selectedPositioning, setSelectedPositioning] = useState("pos-timesaving");
  const [pageName, setPageName] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const templateMap: Record<string, LandingPageTemplate> = {
    "tpl-hero": "hero",
    "tpl-problem": "problem",
    "tpl-social": "social-proof",
    "tpl-pricing": "pricing",
    "tpl-minimal": "minimal",
  };

  const positioningMap: Record<string, string> = {
    "pos-timesaving": "Time Savings",
    "pos-automation": "Automation",
    "pos-speed": "Speed",
    "pos-accuracy": "Accuracy",
  };

  const handlePublish = async () => {
    const slug = (pageName || headline).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    await addLandingPage({
      projectId: "proj-001",
      name: pageName || headline.slice(0, 40),
      template: templateMap[selectedTemplate] || "hero",
      headline,
      subheadline,
      cta: selectedCta,
      positioning: positioningMap[selectedPositioning] || selectedPositioning,
      status: "live",
      slug,
      visitors: 0,
      conversions: 0,
      bounceRate: 0,
      avgTimeOnPage: 0,
      conversionRate: 0,
    });
    router.push("/dashboard/landing-pages");
  };

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 2000);
  };

  const selectedTpl = templates.find((t) => t.id === selectedTemplate);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/landing-pages"><Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div><h1 className="text-2xl font-bold">Create Landing Page</h1><p className="text-sm text-text-secondary">AI-generated landing page for your validation experiment.</p></div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <React.Fragment key={s.label}>
              <button onClick={() => setStep(i)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${i === step ? "bg-blue/10 text-blue border border-blue/30" : i < step ? "text-green" : "text-text-tertiary"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${i < step ? "bg-green text-white" : i === step ? "bg-blue text-white" : "bg-surface-elevated"}`}>
                  {i < step ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < steps.length - 1 && <div className={`flex-1 h-px ${i < step ? "bg-green" : "bg-border"}`} />}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="step-0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Choose a Template</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {templates.map((tpl) => (
                  <button key={tpl.id} onClick={() => setSelectedTemplate(tpl.id)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${selectedTemplate === tpl.id ? "border-blue bg-blue/5" : "border-border hover:border-border/80"}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-lg bg-${tpl.preview} flex items-center justify-center shrink-0`}>
                        <Layout className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold">{tpl.name}</h3>
                          {selectedTemplate === tpl.id && <Badge variant="blue">Selected</Badge>}
                        </div>
                        <p className="text-xs text-text-secondary">{tpl.description}</p>
                        <p className="text-[10px] text-text-tertiary mt-1">Best for: {tpl.bestFor}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="step-1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Page Content</CardTitle>
                  <Button variant="secondary" size="sm" onClick={() => { setHeadline("Stop Losing Hours to Manual Reporting"); setSubheadline("Join 2,000+ operations teams who automated their weekly reports."); }}>
                    <Wand2 className="w-3 h-3 mr-1" />AI Suggest
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input label="Page Name" value={pageName} onChange={(e) => setPageName(e.target.value)} placeholder="e.g., Time-Savings Hero Page" />
                <Input label="Headline" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Your main value proposition" />
                <Textarea label="Subheadline" value={subheadline} onChange={(e) => setSubheadline(e.target.value)} placeholder="Supporting text below the headline" />

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Positioning Angle</label>
                  <div className="grid grid-cols-2 gap-2">
                    {positioningOptions.map((pos) => (
                      <button key={pos.id} onClick={() => setSelectedPositioning(pos.id)}
                        className={`text-left p-3 rounded-lg border transition-all ${selectedPositioning === pos.id ? "border-blue bg-blue/5" : "border-border hover:border-border/80"}`}>
                        <p className="text-sm font-medium">{pos.label}</p>
                        <p className="text-xs text-text-tertiary">{pos.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Call to Action</label>
                  <div className="flex flex-wrap gap-2">
                    {ctaOptions.map((cta) => (
                      <button key={cta} onClick={() => setSelectedCta(cta)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedCta === cta ? "border-blue bg-blue/10 text-blue" : "border-border text-text-tertiary hover:text-text-secondary"}`}>
                        {cta}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Target Audience & Experiment</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Input label="Target Audience" placeholder="e.g., Operations Managers at SaaS companies" hint="Who is this landing page for?" />
                <Input label="Industry" placeholder="e.g., SaaS, FinTech, E-commerce" />
                <Input label="Company Size" placeholder="e.g., 50-500 employees" />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Traffic Source" placeholder="e.g., LinkedIn Ads" />
                  <Input label="Daily Budget" placeholder="$50" />
                </div>
                <div className="bg-surface-elevated rounded-lg p-4 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-amber" />
                    <p className="text-sm font-medium">AI Recommendation</p>
                  </div>
                  <p className="text-xs text-text-secondary">Based on your experiment data, we recommend targeting operations managers at companies with 50-500 employees. LinkedIn ads have shown 2.1x better conversion than Meta for this audience.</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Review & Launch</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-elevated rounded-lg p-3"><p className="text-[10px] text-text-tertiary mb-1">Template</p><p className="text-sm font-medium">{selectedTpl?.name}</p></div>
                  <div className="bg-surface-elevated rounded-lg p-3"><p className="text-[10px] text-text-tertiary mb-1">Positioning</p><p className="text-sm font-medium">{positioningOptions.find((p) => p.id === selectedPositioning)?.label}</p></div>
                  <div className="bg-surface-elevated rounded-lg p-3"><p className="text-[10px] text-text-tertiary mb-1">CTA</p><p className="text-sm font-medium">{selectedCta}</p></div>
                  <div className="bg-surface-elevated rounded-lg p-3"><p className="text-[10px] text-text-tertiary mb-1">Page Name</p><p className="text-sm font-medium">{pageName || "Untitled Page"}</p></div>
                </div>

                <div className="bg-surface-elevated rounded-lg p-4 border border-border/50">
                  <p className="text-xs text-text-tertiary mb-2">Preview</p>
                  <div className="bg-surface rounded-lg p-6 border border-border/30">
                    <p className="text-lg font-bold mb-2">{headline}</p>
                    <p className="text-sm text-text-secondary mb-4">{subheadline}</p>
                    <div className="inline-block px-4 py-2 bg-blue text-white rounded-lg text-sm font-medium">{selectedCta}</div>
                  </div>
                </div>

                {!generated ? (
                  <Button onClick={handleGenerate} disabled={generating} className="w-full">
                    {generating ? (
                      <><Sparkles className="w-4 h-4 mr-2 animate-spin" />Generating Landing Page...</>
                    ) : (
                      <><Sparkles className="w-4 h-4 mr-2" />Generate with AI</>
                    )}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-green/5 border border-green/20 rounded-lg p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green/10 flex items-center justify-center"><Check className="w-4 h-4 text-green" /></div>
                      <div><p className="text-sm font-medium text-green">Landing Page Generated</p><p className="text-xs text-text-secondary">Your page is ready to publish.</p></div>
                    </div>
                    <div className="flex gap-3">
                      <Button className="flex-1" onClick={handlePublish}>Publish Page</Button>
                      <Button variant="secondary">Preview</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="secondary" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
          <ArrowLeft className="w-4 h-4 mr-1" />Back
        </Button>
        {step < 3 && (
          <Button onClick={() => setStep(Math.min(3, step + 1))}>
            Next<ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}