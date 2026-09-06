"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Sparkles, Zap, DollarSign, CheckCircle2,
  Clock, Globe, Layers, Check, ExternalLink, ShieldCheck, HelpCircle,
  Copy, Megaphone, Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/lib/types";
import { QuotaGuardModal } from "@/components/billing/quota-guard-modal";

type OfferType = "deposit" | "paid" | "waitlist";
type TemplateType = "hero" | "problem" | "minimal" | "split";

const INSPIRATION_PITCHES = [
  { label: "B2B SaaS", name: "DocuFlow AI", pitch: "Reconcile vendor invoices and receipts automatically in 15 seconds" },
  { label: "Dev Tool", name: "QueryPulse", pitch: "Detect slow database queries and N+1 leaks before code hits production" },
  { label: "Creator / Solo", name: "CourseFunnel", pitch: "Turn short-form video viewers into paying cohort members in 2 taps" },
  { label: "Agency Ops", name: "ClientSync", pitch: "Automated weekly client status reports generated from your Slack and GitHub" },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export default function NewExperimentPage() {
  const router = useRouter();

  // Current Step: 1 (Concept) -> 2 (Offer) -> 3 (Template & Launch)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Concept
  const [productName, setProductName] = useState("");
  const [oneLiner, setOneLiner] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [slugModified, setSlugModified] = useState(false);

  // Step 2: The Offer & WTP Model
  const [offerType, setOfferType] = useState<OfferType>("deposit");
  const [priceAnchor, setPriceAnchor] = useState("49");
  const [depositAmount, setDepositAmount] = useState("20");
  const [ctaText, setCtaText] = useState("Reserve Founder Spot ($20)");

  // Step 3: Landing Page Template
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("hero");

  // Projects & Workspace context
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");

  // Submitting & Quota State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quotaModalOpen, setQuotaModalOpen] = useState(false);
  const [quotaDetail, setQuotaDetail] = useState<{ current?: number; limit?: number; message?: string }>({});
  const [launchSuccess, setLaunchSuccess] = useState<{
    slug: string;
    experimentId: string;
    name: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    if (launchSuccess && typeof window !== "undefined") {
      const url = `${window.location.origin}/p/${launchSuccess.slug}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Computed slug
  const activeSlug = useMemo(() => {
    if (slugModified && customSlug.trim()) return slugify(customSlug);
    return slugify(productName) || "my-product-test";
  }, [productName, customSlug, slugModified]);

  // Load existing projects safely
  useEffect(() => {
    fetch("/api/projects")
      .then(async (r) => {
        const text = await r.text();
        return text ? JSON.parse(text) : { data: [] };
      })
      .then((j) => {
        const list: Project[] = j.data || [];
        setProjects(list);
      })
      .catch(() => {});
  }, []);

  // Update default CTA when offer model changes
  const handleOfferTypeChange = (type: OfferType) => {
    setOfferType(type);
    if (type === "deposit") {
      setCtaText(`Reserve Founder Spot ($${depositAmount || "20"})`);
    } else if (type === "paid") {
      setCtaText(`Get Early Access ($${priceAnchor || "49"}/mo)`);
    } else {
      setCtaText("Request Founder Access");
    }
  };

  const handleDepositChange = (amount: string) => {
    setDepositAmount(amount);
    if (offerType === "deposit") {
      setCtaText(`Reserve Founder Spot ($${amount || "20"})`);
    }
  };

  const handlePriceChange = (price: string) => {
    setPriceAnchor(price);
    if (offerType === "paid") {
      setCtaText(`Get Early Access ($${price || "49"}/mo)`);
    }
  };

  const applyInspiration = (item: typeof INSPIRATION_PITCHES[0]) => {
    setProductName(item.name);
    setOneLiner(item.pitch);
    setSlugModified(false);
  };

  // Safe response parser that prevents SyntaxError on empty, HTML, or proxy responses
  async function parseApiResponse<T = any>(
    res: Response,
    actionName: string
  ): Promise<{ ok: boolean; status: number; data?: T; error?: string; upgradeRequired?: boolean; current?: number; limit?: number }> {
    let text = "";
    try {
      text = await res.text();
    } catch {
      return {
        ok: false,
        status: res.status || 0,
        error: `Network error while reading response for ${actionName}.`,
      };
    }

    let json: any = null;
    if (text && text.trim().length > 0) {
      try {
        json = JSON.parse(text);
      } catch {
        const cleanSnippet = text.replace(/<[^>]*>?/gm, " ").trim().replace(/\s+/g, " ").slice(0, 160);
        return {
          ok: false,
          status: res.status,
          error: `Server responded with non-JSON (${res.status}) during ${actionName}: ${cleanSnippet || res.statusText || "Unexpected response"}`,
        };
      }
    }

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        data: json,
        error: json?.error || json?.message || `Failed to ${actionName} (HTTP ${res.status})`,
        upgradeRequired: Boolean(json?.upgradeRequired || res.status === 402),
        current: json?.current,
        limit: json?.limit,
      };
    }

    return {
      ok: true,
      status: res.status,
      data: json,
    };
  }

  // Launch the 60-second test
  const handleLaunch = async () => {
    setError("");
    if (!productName.trim()) {
      setError("Please provide a product name.");
      setStep(1);
      return;
    }
    if (!oneLiner.trim()) {
      setError("Please provide a one-line value proposition.");
      setStep(1);
      return;
    }

    setLoading(true);

    try {
      // Step A: Ensure target project exists
      // If an existing project matches this product name exactly, reuse it; otherwise create a fresh project
      const matched = projects.find(
        (p) => p.name.trim().toLowerCase() === productName.trim().toLowerCase()
      );
      let targetProjectId = matched?.id;

      if (!targetProjectId) {
        const projRes = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productName: productName.trim(),
            description: oneLiner.trim(),
          }),
        });
        const projResult = await parseApiResponse<{ project: { id: string } }>(projRes, "create project");
        if (!projResult.ok || !projResult.data?.project?.id) {
          throw new Error(projResult.error || "Failed to create project");
        }
        targetProjectId = projResult.data.project.id;
      }

      // Step B: Create the 7-Day Sprint Experiment
      const now = new Date();
      const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const expRes = await fetch("/api/experiments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${productName.trim()} Smoke Test`,
          projectId: targetProjectId,
          budget: 100,
          channel: ["meta", "linkedin", "google"],
          status: "running",
          startDate: now.toISOString(),
          endDate: in7Days.toISOString(),
          variants: [
            {
              name: "Variant A (Core Value)",
              headline: oneLiner.trim(),
              cta: ctaText.trim() || "Get Early Access",
              positioning: offerType === "deposit" ? "Refundable Deposit Pre-order" : "Direct Value Focus",
              trafficAllocation: 50,
            },
            {
              name: "Variant B (Speed / ROI)",
              headline: `Automate your workflow with ${productName.trim()}`,
              cta: ctaText.trim() || "Get Early Access",
              positioning: "Time-savings and outcome focus",
              trafficAllocation: 50,
            },
          ],
        }),
      });

      const expResult = await parseApiResponse<{ data: { id: string } }>(expRes, "create experiment");
      if (!expResult.ok || !expResult.data?.data?.id) {
        if (expResult.status === 402 || expResult.upgradeRequired) {
          setQuotaDetail({ current: expResult.current, limit: expResult.limit, message: expResult.error });
          setQuotaModalOpen(true);
          setLoading(false);
          return;
        }
        throw new Error(expResult.error || "Failed to create experiment");
      }

      const experimentId = expResult.data.data.id;

      // Step C: Create the Public Landing Page
      const lpRes = await fetch("/api/landing-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: targetProjectId,
          experimentId,
          name: `${productName.trim()} — Smoke Test Page`,
          template: selectedTemplate,
          headline: oneLiner.trim(),
          subheadline: `The automated solution built for modern founders and teams. Join early adopters testing ${productName.trim()}.`,
          cta: ctaText.trim() || "Get Early Access",
          positioning: offerType === "deposit" ? "Refundable Deposit" : offerType === "paid" ? "Paid Early Access" : "High-Intent Waitlist",
          slug: activeSlug,
          status: "live",
          preorderEnabled: offerType === "deposit",
          depositAmount: offerType === "deposit" ? Number(depositAmount) || 20 : 0,
          priceAnchor: Number(priceAnchor) || 49,
          surveyEnabled: true,
          surveyQuestions: JSON.stringify([
            { id: "q1", question: "What is your current role?", type: "text" },
            { id: "q2", question: "What would make this tool an absolute no-brainer for you?", type: "text" },
          ]),
        }),
      });

      const lpResult = await parseApiResponse<{ data: { slug: string } }>(lpRes, "create landing page");
      if (!lpResult.ok || !lpResult.data?.data) {
        if (lpResult.status === 402 || lpResult.upgradeRequired) {
          setQuotaDetail({ current: lpResult.current, limit: lpResult.limit, message: lpResult.error });
          setQuotaModalOpen(true);
          setLoading(false);
          return;
        }
        throw new Error(lpResult.error || "Failed to create landing page");
      }

      const finalSlug = lpResult.data.data.slug || activeSlug;

      // Attempt to immediately launch the live page in a new browser tab
      try {
        if (typeof window !== "undefined") {
          window.open(`/p/${finalSlug}`, "_blank");
        }
      } catch {}

      // Reveal the launch celebration screen with direct actions
      setLaunchSuccess({
        slug: finalSlug,
        experimentId,
        name: productName.trim(),
      });
      setLoading(false);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <Link
            href="/dashboard/experiments"
            className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors mb-2 gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Tests
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Launch Test in 60 Seconds
            </h1>
            <Badge variant="amber" className="text-xs font-mono">
              <Clock className="w-3 h-3 mr-1" /> ~45 sec setup
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Build a smoke test, set your pricing offer, and get a live public link to measure real willingness to pay.
          </p>
        </div>

        {/* 3-Step Stepper Header */}
        <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-xl border border-border/60 text-xs">
          {[
            { num: 1, label: "Concept" },
            { num: 2, label: "Offer & Pricing" },
            { num: 3, label: "Launch" },
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setStep(s.num as 1 | 2 | 3)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                step === s.num
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : step > s.num
                  ? "text-foreground bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {step > s.num ? (
                <Check className="w-3 h-3 text-primary" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-background/30 flex items-center justify-center text-[10px]">
                  {s.num}
                </span>
              )}
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-center justify-between">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={() => setError("")}>
            Dismiss
          </Button>
        </div>
      )}

      {launchSuccess ? (
        <Card className="border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 via-card to-card overflow-hidden shadow-2xl">
          <CardContent className="p-8 sm:p-12 text-center space-y-6 max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <Badge variant="green" className="text-xs px-3 py-1 uppercase tracking-wider font-bold">
                🚀 Smoke Test Live & Deployed
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                {launchSuccess.name} is Live!
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Your public smoke-test landing page is published and ready to capture visitor intent and willingness-to-pay.
              </p>
            </div>

            {/* Live Link Callout */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <Globe className="w-4 h-4 text-primary shrink-0" />
                <div className="truncate font-mono text-xs text-foreground font-semibold">
                  /p/{launchSuccess.slug}
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleCopyLink}
                  className="text-xs h-9 gap-1.5 flex-1 sm:flex-none cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? "Copied" : "Copy Link"}</span>
                </Button>
                <Link
                  href={`/p/${launchSuccess.slug}`}
                  target="_blank"
                  className="flex-1 sm:flex-none"
                >
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground text-xs h-9 gap-1.5 w-full font-bold shadow-md cursor-pointer"
                  >
                    <span>Open Live Landing Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Next Steps Buttons */}
            <div className="grid sm:grid-cols-2 gap-3 pt-4 border-t border-border/50">
              <Link href="/dashboard/traffic">
                <Button
                  variant="secondary"
                  className="w-full justify-center gap-2 text-xs py-5 cursor-pointer"
                >
                  <Megaphone className="w-4 h-4 text-primary" />
                  <span>Start Google Ads Campaign</span>
                </Button>
              </Link>
              <Link href={`/dashboard/experiments/${launchSuccess.experimentId}`}>
                <Button
                  className="w-full justify-center gap-2 text-xs py-5 bg-card hover:bg-muted border border-border text-foreground cursor-pointer"
                >
                  <span>View Experiment Analytics</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Main Builder Grid: 2 Columns on Desktop */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Express Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <AnimatePresence mode="wait">
            {/* STEP 1: The Concept */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">1</span>
                    What are you testing?
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Define the core idea you want to validate before writing any code.
                  </p>
                </div>

                {/* Inspiration Quick Pills */}
                <div className="space-y-2">
                  <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" /> Need inspiration? Pick a template:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {INSPIRATION_PITCHES.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => applyInspiration(item)}
                        className="px-2.5 py-1 text-xs rounded-lg border border-border/60 bg-card hover:border-primary/50 text-muted-foreground hover:text-foreground transition-all"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1.5">
                      Product Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="e.g. DocuFlow AI"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="text-sm bg-card"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1.5">
                      One-Line Value Proposition (Your Hero Headline) <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Reconcile client invoices and receipts automatically in 15 seconds without spreadsheets."
                      value={oneLiner}
                      onChange={(e) => setOneLiner(e.target.value)}
                      className="w-full text-sm rounded-md border border-input bg-card px-3 py-2 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                    <span className="text-[11px] text-muted-foreground mt-1 block">
                      This will be the primary headline on your public landing page.
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1.5">
                      Live URL Slug
                    </label>
                    <div className="flex items-center rounded-md border border-input bg-card px-3 py-1.5 text-xs">
                      <span className="text-muted-foreground select-none">/p/</span>
                      <input
                        type="text"
                        value={slugModified ? customSlug : activeSlug}
                        onChange={(e) => {
                          setSlugModified(true);
                          setCustomSlug(e.target.value);
                        }}
                        className="w-full bg-transparent text-foreground focus:outline-none pl-1 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={() => {
                      if (!productName.trim()) {
                        setError("Product name is required.");
                        return;
                      }
                      if (!oneLiner.trim()) {
                        setError("One-line value proposition is required.");
                        return;
                      }
                      setError("");
                      setStep(2);
                    }}
                    className="gap-2"
                  >
                    Next: Define the Offer <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: The Offer & Willingness-to-Pay */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">2</span>
                    What is your offer & commitment model?
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Real validation requires measuring skin-in-the-game. How will you test willingness to pay?
                  </p>
                </div>

                {/* 3 Offer Models */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: "deposit" as OfferType,
                      title: "Refundable Deposit",
                      badge: "Strongest Signal",
                      badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                      desc: "Visitors pay a small deposit to lock founder pricing. 100% money-back guarantee.",
                    },
                    {
                      id: "paid" as OfferType,
                      title: "Paid Early Access",
                      badge: "Direct Checkout",
                      badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
                      desc: "Display full monthly/annual price and capture checkout intent before building.",
                    },
                    {
                      id: "waitlist" as OfferType,
                      title: "High-Intent Waitlist",
                      badge: "Low Friction",
                      badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
                      desc: "Collect verified work email + willingness-to-pay budget survey questions.",
                    },
                  ].map((o) => (
                    <div
                      key={o.id}
                      onClick={() => handleOfferTypeChange(o.id)}
                      className={`cursor-pointer rounded-xl p-4 border transition-all flex flex-col justify-between ${
                        offerType === o.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                          : "border-border/60 bg-card hover:border-border"
                      }`}
                    >
                      <div className="space-y-2">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${o.badgeColor}`}>
                          {o.badge}
                        </span>
                        <div className="font-semibold text-sm text-foreground">{o.title}</div>
                        <p className="text-xs text-muted-foreground">{o.desc}</p>
                      </div>
                      <div className="mt-4 pt-2 border-t border-border/40 flex justify-end">
                        {offerType === o.id && <CheckCircle2 className="w-4 h-4 text-primary" />}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Offer Pricing Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border border-border/60">
                  {offerType === "deposit" && (
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1">
                        Deposit Amount ($ USD)
                      </label>
                      <div className="relative">
                        <DollarSign className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
                        <Input
                          type="number"
                          value={depositAmount}
                          onChange={(e) => handleDepositChange(e.target.value)}
                          className="pl-8 text-sm bg-card"
                          placeholder="20"
                        />
                      </div>
                      <span className="text-[11px] text-muted-foreground mt-1 block">
                        Typical deposits: $10, $20, or $50
                      </span>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      {offerType === "waitlist" ? "Expected Target Price ($/mo)" : "Target Retail Price ($/mo)"}
                    </label>
                    <div className="relative">
                      <DollarSign className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
                      <Input
                        type="number"
                        value={priceAnchor}
                        onChange={(e) => handlePriceChange(e.target.value)}
                        className="pl-8 text-sm bg-card"
                        placeholder="49"
                      />
                    </div>
                    <span className="text-[11px] text-muted-foreground mt-1 block">
                      Shown on page as anchor price
                    </span>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Button CTA Text
                    </label>
                    <Input
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      className="text-sm bg-card"
                      placeholder="Reserve Founder Spot"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <Button variant="ghost" onClick={() => setStep(1)} className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button onClick={() => setStep(3)} className="gap-2">
                    Next: Choose Template <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Template & Launch */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">3</span>
                    Pick a Template & Launch
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Select the public layout that best highlights your value proposition.
                  </p>
                </div>

                {/* Template Selection Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      id: "hero" as TemplateType,
                      name: "Hero Direct",
                      tag: "Recommended for SaaS",
                      desc: "Clean centered layout focusing on the value proposition, social proof, and 1-click CTA.",
                    },
                    {
                      id: "problem" as TemplateType,
                      name: "Problem / Solution",
                      tag: "Best for B2B Pain Points",
                      desc: "Contrasts painful current workflows against your automated solution.",
                    },
                    {
                      id: "minimal" as TemplateType,
                      name: "Minimalist Focus",
                      tag: "High Conversion",
                      desc: "Ultra-fast loading, distraction-free hero with bulleted feature checklist.",
                    },
                    {
                      id: "split" as TemplateType,
                      name: "Interactive Split",
                      tag: "Showcase / AI",
                      desc: "Left-side persuasive copy with a right-side simulated product showcase card.",
                    },
                  ].map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTemplate(t.id)}
                      className={`cursor-pointer rounded-xl p-4 border transition-all ${
                        selectedTemplate === t.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                          : "border-border/60 bg-card hover:border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-sm text-foreground">{t.name}</span>
                        {selectedTemplate === t.id && <CheckCircle2 className="w-4 h-4 text-primary" />}
                      </div>
                      <Badge variant="default" className="text-[10px] mb-2 font-mono">
                        {t.tag}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{t.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Automated 7-Day Sprint Defaults Info Box */}
                <div className="bg-muted/30 border border-border/60 rounded-xl p-4 space-y-2 text-xs">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Automated 7-Day Sprint Configuration
                  </div>
                  <ul className="text-muted-foreground space-y-1 pl-5 list-disc">
                    <li>Experiment status set to <strong className="text-foreground">Running</strong> for 7 days.</li>
                    <li>2 A/B variant angles automatically generated for attribution.</li>
                    <li>Meta, Google Ads, and LinkedIn conversion webhooks ready to receive traffic.</li>
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <Button variant="ghost" onClick={() => setStep(2)} className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button
                    onClick={handleLaunch}
                    disabled={loading}
                    className="bg-primary text-primary-foreground gap-2 font-semibold shadow-md hover:shadow-lg transition-all"
                  >
                    {loading ? (
                      "Launching Smoke Test..."
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                        Launch 60-Second Smoke Test
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Live Landing Page Preview Card (5 cols) */}
        <div className="lg:col-span-5 sticky top-8">
          <Card className="border-border/80 shadow-md bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border/60 bg-muted/40 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                <span className="text-[11px] font-mono text-muted-foreground ml-2">Live Page Preview</span>
              </div>
              <Badge variant="green" className="text-[10px]">
                Ready to Publish
              </Badge>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Browser Address Bar Preview */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/40 text-xs font-mono text-muted-foreground">
                <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate">
                  yourdomain.com/p/<span className="text-foreground font-semibold">{activeSlug}</span>
                </span>
              </div>

              {/* Simulated Landing Page Hero */}
              <div className="rounded-xl border border-border/60 bg-background/80 p-5 space-y-4 text-center">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-medium mx-auto">
                  <Sparkles className="w-3 h-3" />
                  {productName.trim() || "Your Product Name"}
                </div>

                <h3 className="text-base font-bold tracking-tight text-foreground leading-snug">
                  {oneLiner.trim() || "Your irresistible one-line pitch will appear here."}
                </h3>

                <p className="text-xs text-muted-foreground">
                  The fastest way to automate workflows, eliminate human error, and save 10+ hours every week.
                </p>

                {/* Offer Preview Banner */}
                <div className="py-2 px-3 rounded-lg bg-muted/40 border border-border/40 text-xs">
                  {offerType === "deposit" ? (
                    <div className="text-foreground font-medium">
                      🔒 <strong className="text-emerald-500">${depositAmount || "20"} Refundable Deposit</strong> to lock founder pricing ($49/mo retail)
                    </div>
                  ) : offerType === "paid" ? (
                    <div className="text-foreground font-medium">
                      💳 <strong className="text-blue-500">${priceAnchor || "49"}/month</strong> • Full Early Founder Access
                    </div>
                  ) : (
                    <div className="text-foreground font-medium">
                      📋 <strong>Free Founder Pilot</strong> • Verified Work Email Required
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <div className="w-full py-2.5 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5">
                    {ctaText || "Get Early Access"}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1.5 block">
                    No credit card required for waitlist • Instant receipt
                  </span>
                </div>
              </div>

              {/* Founder Checklist Summary */}
              <div className="space-y-2 pt-2 text-xs border-t border-border/40">
                <div className="font-semibold text-foreground text-[11px]">Included with 1-Click Launch:</div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Custom public URL with UTM tracking</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Meta, Google & LinkedIn ad webhook ready</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Willingness-to-pay intent analytics</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )}

      {/* Quota Limit Guard Modal */}
      <QuotaGuardModal
        open={quotaModalOpen}
        onClose={() => setQuotaModalOpen(false)}
        resource="activeExperiments"
        current={quotaDetail.current}
        limit={quotaDetail.limit}
        description={quotaDetail.message}
      />
    </div>
  );
}
