"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Rocket, Lightbulb, FlaskConical, Target, Users, DollarSign, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useWizardStore, type WizardState } from "@/lib/store";
import { BRAND } from "@/lib/constants";

const steps = [
  { num: 1, title: "Product", icon: Lightbulb },
  { num: 2, title: "Problem", icon: Target },
  { num: 3, title: "Pricing", icon: DollarSign },
  { num: 4, title: "Describe", icon: FlaskConical },
  { num: 5, title: "Audience", icon: Users },
  { num: 6, title: "Launch", icon: Rocket },
];

export default function OnboardingPage() {
  const w = useWizardStore();
  const router = useRouter();
  const [launching, setLaunching] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);

  const handleLaunch = async () => {
    setLaunching(true);
    setLaunchError(null);
    try {
      const { experimentId } = await w.createProject();
      w.reset();
      router.push(`/dashboard/experiments/${experimentId}`);
    } catch (e) {
      setLaunchError((e as Error).message || "Something went wrong. Please try again.");
      setLaunching(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue/5 rounded-full blur-3xl" />
      </div>
      <div className="w-full max-w-2xl relative">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue flex items-center justify-center"><span className="text-white font-bold">P</span></div>
            <span className="text-xl font-bold">{BRAND.shortName}</span>
          </Link>
        </div>
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s) => (
            <button key={s.num} onClick={() => s.num <= w.step && w.setStep(s.num)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${s.num === w.step ? "bg-blue text-white" : s.num < w.step ? "bg-blue/10 text-blue-bright" : "bg-surface-elevated text-text-tertiary"}`}>
              <s.icon className="w-3 h-3" /><span className="hidden sm:inline">{s.title}</span>
            </button>
          ))}
        </div>
        <motion.div key={w.step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <Card className="p-6">{renderStep(w, handleLaunch, launching, launchError)}</Card>
        </motion.div>
      </div>
    </div>
  );
}

function renderStep(w: WizardState, handleLaunch: () => void, launching: boolean, launchError: string | null) {
  if (w.step === 1) return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-bold mb-2">Your Product</h2><p className="text-sm text-text-secondary">Tell us about the idea you want to validate.</p></div>
      <Input label="Product Name" placeholder="e.g., AI Reporting Copilot" value={w.productName} onChange={(e) => w.updateField("productName", e.target.value)} />
      <Input label="One-Line Description" placeholder="e.g., AI-generated weekly reports for SaaS teams" value={w.oneLiner} onChange={(e) => w.updateField("oneLiner", e.target.value)} />
      <Nav w={w} />
    </div>
  );
  if (w.step === 2) return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-bold mb-2">Problem & Alternatives</h2></div>
      <Textarea label="Core Problem" placeholder="Describe the main pain point" value={w.problem} onChange={(e) => w.updateField("problem", e.target.value)} />
      <Textarea label="Existing Alternatives" placeholder="What do people currently use?" value={w.alternatives} onChange={(e) => w.updateField("alternatives", e.target.value)} />
      <Nav w={w} />
    </div>
  );
  if (w.step === 3) return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-bold mb-2">Pricing</h2></div>
      <Input label="Expected Price Range" placeholder="e.g., $49-99/month" value={w.expectedPrice} onChange={(e) => w.updateField("expectedPrice", e.target.value)} />
      <Input label="Business Model" placeholder="e.g., SaaS subscription" value={w.businessModel} onChange={(e) => w.updateField("businessModel", e.target.value)} />
      <Nav w={w} />
    </div>
  );
  if (w.step === 4) return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-bold mb-2">Describe the Idea</h2></div>
      <Textarea label="Full Description" placeholder="Describe your product idea..." className="min-h-[200px]" value={w.description} onChange={(e) => w.updateField("description", e.target.value)} />
      <Nav w={w} />
    </div>
  );
  if (w.step === 5) return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-bold mb-2">Audience</h2></div>
      <Input label="Job Title" placeholder="e.g., Operations Manager" value={w.audienceConfig.jobTitle || ""} onChange={(e) => w.updateField("audienceConfig", { ...w.audienceConfig, jobTitle: e.target.value })} />
      <Input label="Industry" placeholder="e.g., SaaS, Technology" value={w.audienceConfig.industry || ""} onChange={(e) => w.updateField("audienceConfig", { ...w.audienceConfig, industry: e.target.value })} />
      <Input label="Company Size" placeholder="e.g., 20-200 employees" value={w.audienceConfig.companySize || ""} onChange={(e) => w.updateField("audienceConfig", { ...w.audienceConfig, companySize: e.target.value })} />
      <Nav w={w} />
    </div>
  );
  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-bold mb-2">Review & Launch</h2></div>
      <div className="bg-surface-elevated rounded-lg p-4 space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-text-tertiary">Product:</span><span className="font-medium">{w.productName || "Not set"}</span></div>
        <div className="flex justify-between"><span className="text-text-tertiary">Price:</span><span className="font-medium">{w.expectedPrice || "Not set"}</span></div>
        <div className="flex justify-between"><span className="text-text-tertiary">Audience:</span><span className="font-medium">{[w.audienceConfig.jobTitle, w.audienceConfig.industry].filter(Boolean).join(", ") || "Not set"}</span></div>
      </div>
      {launchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{launchError}</div>
      )}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Button variant="ghost" onClick={w.prevStep} disabled={launching}><ArrowLeft className="w-4 h-4" />Back</Button>
        <Button size="lg" className="group" onClick={handleLaunch} disabled={launching}>
          {launching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
          {launching ? "Creating..." : "Launch"}
          {!launching && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
        </Button>
      </div>
    </div>
  );
}

function Nav({ w }: { w: WizardState }) {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-border">
      {w.step > 1 ? <Button variant="ghost" onClick={w.prevStep}><ArrowLeft className="w-4 h-4" />Back</Button> : <div />}
      <Button onClick={w.nextStep}>Next<ArrowRight className="w-4 h-4" /></Button>
    </div>
  );
}