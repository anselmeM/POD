"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight, TrendingUp, Users, Target, Plus, Activity,
  AlertCircle, RefreshCw, Sparkles, Share2, Copy, Check,
  ExternalLink, CreditCard, Zap, DollarSign, ArrowRight
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useExperimentStore } from "@/lib/store";
import { VERDICTS } from "@/lib/constants";
import type { Project, ChannelAttribution } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SprintBanner } from "@/components/dashboard/sprint-banner";
import { AIGeneratorModal } from "@/components/dashboard/ai-generator-modal";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);
  useEffect(() => {
    const dur = 1400;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

function timeAgo(dateStr?: string | null) {
  const diff = Date.now() - new Date(dateStr || Date.now()).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(mins, 0)}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function verdictFromScore(score: number) {
  if (score >= 80) return VERDICTS.strong;
  if (score >= 60) return VERDICTS.promising;
  if (score >= 40) return VERDICTS.needs_iteration;
  return VERDICTS.weak;
}

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const { user } = useUser();
  const { experiments, error, fetchExperiments } = useExperimentStore();
  const [project, setProject] = useState<Project | null>(null);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [landingPages, setLandingPages] = useState<any[]>([]);
  const [attribution, setAttribution] = useState<ChannelAttribution[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSprintView, setIsSprintView] = useState(false);

  const fetchProjectData = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const json = await res.json();
        setProject(json.data?.[0] ?? null);
      }
    } catch {
      setProject(null);
    }
  }, []);

  const fetchAllDashboardData = useCallback(() => {
    fetchExperiments();
    fetchProjectData();

    fetch("/api/activity")
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((j) => setActivityLogs(Array.isArray(j.data) ? j.data.slice(0, 8) : []))
      .catch(() => setActivityLogs([]));

    fetch("/api/leads")
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((j) => setLeads(Array.isArray(j.data) ? j.data : []))
      .catch(() => setLeads([]));

    fetch("/api/landing-pages")
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((j) => setLandingPages(Array.isArray(j.data) ? j.data : []))
      .catch(() => setLandingPages([]));

    fetch("/api/traffic/attribution")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j?.data?.channels) {
          setAttribution(j.data.channels);
        }
      })
      .catch(() => {});
  }, [fetchExperiments, fetchProjectData]);

  useEffect(() => {
    fetchAllDashboardData();
  }, [fetchAllDashboardData]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("view") === "sprint") {
        setIsSprintView(true);
      }
    }
  }, []);

  const handleLoadDemoData = async () => {
    setLoadingDemo(true);
    try {
      const res = await fetch("/api/demo/seed", { method: "POST" });
      if (res.ok) {
        fetchAllDashboardData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDemo(false);
    }
  };

  const safeExperiments = Array.isArray(experiments) ? experiments : [];

  // Compute Solo Founder Willingness-To-Pay (WTP) metrics
  const preorderLeads = leads.filter((l) => l.isPreorder);
  const waitlistLeads = leads.filter((l) => !l.isPreorder);
  const preorderCount = preorderLeads.length;
  const waitlistCount = waitlistLeads.length;
  const totalLeadsCount = leads.length;

  const totalDepositDollars = Math.round(
    preorderLeads.reduce((sum, l) => sum + (l.depositAmount || 0), 0) / 100
  );

  const wtpConversionRate = totalLeadsCount > 0
    ? Number(((preorderCount / totalLeadsCount) * 100).toFixed(1))
    : 0;

  const primaryPage = landingPages[0] || null;
  const primarySlug = primaryPage?.slug || "smoke-test";

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/p/${primarySlug}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const podScore = project?.podScore ?? (preorderCount > 0 ? 88 : waitlistCount > 0 ? 64 : 45);
  const verdict = verdictFromScore(podScore);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  const displayName =
    user?.firstName ||
    user?.fullName?.split(" ")[0] ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "there";

  // Preset fallbacks for top channels if none recorded yet
  const channelDisplay = attribution.length > 0
    ? attribution
    : [
        { channel: "Meta Ads (FB/IG)", source: "meta", visitors: 0, leads: 0, preorders: 0, conversionRate: 0, isWinner: false, costPerLead: 0 },
        { channel: "Google Ads (CPC)", source: "google", visitors: 0, leads: 0, preorders: 0, conversionRate: 0, isWinner: false, costPerLead: 0 },
        { channel: "LinkedIn Ads", source: "linkedin", visitors: 0, leads: 0, preorders: 0, conversionRate: 0, isWinner: false, costPerLead: 0 },
      ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header & Fast Actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text-primary">
              {greeting}, {displayName}
            </h1>
            <Badge variant="blue" className="text-[10px] font-mono uppercase tracking-wider">
              Solo Founder Command
            </Badge>
          </div>
          <p className="text-sm text-text-secondary">
            Empirical demand validation: test willingness to pay, track ad channels, and launch smoke tests in 60s.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setAiModalOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-blue text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-purple-500/20 hover:scale-[1.02] transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Smoke Test</span>
          </button>

          <Link href="/dashboard/experiments/new">
            <Button className="flex items-center gap-1.5 bg-blue hover:bg-blue/90 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-md shadow-blue/20 cursor-pointer">
              <Plus className="w-4 h-4" />
              <span>Launch in 60s</span>
            </Button>
          </Link>

          {safeExperiments.length === 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLoadDemoData}
              disabled={loadingDemo}
              className="text-xs h-9 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loadingDemo ? "animate-spin" : ""}`} />
              <span>{loadingDemo ? "Seeding..." : "Load Demo Dataset"}</span>
            </Button>
          )}
        </div>
      </motion.div>

      {error && (
        <Card className="border-red/30 bg-red/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-sm text-red-300">{error}</p>
            <Button size="sm" variant="secondary" onClick={() => fetchExperiments()} className="ml-auto">
              <RefreshCw className="w-3 h-3" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Sprint Banner (when active sprint is running) */}
      {safeExperiments.some((e) => (e.status as string) === "running" || (e.status as string) === "active") && (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <SprintBanner
            experiments={safeExperiments}
            confidence={project?.confidence}
            initialExpanded={isSprintView}
          />
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: WILLINGNESS-TO-PAY (WTP) HERO COMMAND CENTER */}
      {/* ========================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl border border-border bg-gradient-to-br from-surface-elevated/90 via-surface to-surface-elevated/70 p-6 relative overflow-hidden shadow-sm space-y-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue/10 text-blue font-bold uppercase tracking-wider">
                Skin-In-The-Game Gauge
              </span>
              <span className="text-xs text-text-tertiary">
                Are people willing to pay for this?
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-text-primary flex items-center gap-2 flex-wrap">
                <span>Willingness to Pay:</span>
                <span className="text-emerald-400 font-mono">
                  ${totalDepositDollars.toLocaleString()}
                </span>
                <span className="text-sm font-normal text-text-tertiary">in verified deposits</span>
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                Empirical validation prioritizes skin-in-the-game commitment &mdash; separating paying backers ($10 – $100 card holds) from non-committal waitlist emails.
              </p>
            </div>

            {/* Empirical Verdict Pill */}
            <div className="pt-1">
              {preorderCount > 0 ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  STRONG PAYING DEMAND: ${totalDepositDollars.toLocaleString()} secured across {preorderCount} pre-orders ({wtpConversionRate}% paying ratio)
                </div>
              ) : waitlistCount > 0 ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  SOFT INTEREST ONLY: {waitlistCount} free signups captured, $0 paid deposits
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue/15 border border-blue/30 text-blue text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-blue animate-pulse" />
                  READY TO TEST: Share your link or connect ad webhooks to start measuring demand
                </div>
              )}
            </div>
          </div>

          {/* Quick Share Link Box */}
          <div className="p-4 rounded-xl bg-surface border border-border space-y-3 lg:w-96 shrink-0 shadow-xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-text-primary flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-blue" />
                Live Smoke-Test Page
              </span>
              <span className="text-[10px] text-text-tertiary font-mono">/p/{primarySlug}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-surface-elevated px-3 py-1.5 rounded-lg border border-border text-xs font-mono text-text-secondary truncate">
                /p/{primarySlug}
              </div>
              <Button
                size="sm"
                onClick={handleCopyLink}
                className="shrink-0 text-xs h-8 px-3 bg-blue hover:bg-blue/90 text-white cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1 text-green-300" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1" /> Copy Link
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[11px]">
              <Link
                href={`/p/${primarySlug}`}
                target="_blank"
                className="text-text-tertiary hover:text-text-primary flex items-center gap-1 transition-colors"
              >
                Preview Live <ExternalLink className="w-3 h-3" />
              </Link>
              <Link
                href="/dashboard/traffic"
                className="text-blue hover:underline flex items-center gap-1 font-medium"
              >
                Ad Campaign Kit <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Quantitative Validation Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-border/60">
          <div className="p-4 rounded-xl bg-surface/70 border border-border space-y-1">
            <div className="flex items-center justify-between text-xs text-text-tertiary">
              <span className="font-medium">Hard Intent ($)</span>
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-black font-mono text-emerald-400">
              ${totalDepositDollars.toLocaleString()}
            </div>
            <p className="text-[11px] text-text-tertiary">
              {preorderCount} paid pre-order holds
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface/70 border border-border space-y-1">
            <div className="flex items-center justify-between text-xs text-text-tertiary">
              <span className="font-medium">Soft Intent (Leads)</span>
              <Users className="w-3.5 h-3.5 text-blue" />
            </div>
            <div className="text-2xl font-black font-mono text-text-primary">
              <AnimatedCounter target={waitlistCount} />
            </div>
            <p className="text-[11px] text-text-tertiary">
              Waitlist signups ($0 friction)
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface/70 border border-border space-y-1">
            <div className="flex items-center justify-between text-xs text-text-tertiary">
              <span className="font-medium">WTP Conviction</span>
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-black font-mono text-amber-400">
              {wtpConversionRate}%
            </div>
            <p className="text-[11px] text-text-tertiary">
              Paying backers / total leads
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface/70 border border-border space-y-1">
            <div className="flex items-center justify-between text-xs text-text-tertiary">
              <span className="font-medium">PoD Score</span>
              <Target className="w-3.5 h-3.5 text-blue" />
            </div>
            <div className="text-2xl font-black font-mono text-blue flex items-center gap-1.5">
              <AnimatedCounter target={podScore} />
              <span className="text-xs font-normal text-text-tertiary">/100</span>
            </div>
            <p className="text-[11px] text-text-tertiary">
              Verdict: <strong className="text-text-primary">{verdict.label}</strong>
            </p>
          </div>
        </div>
      </motion.div>

      {/* ========================================================================= */}
      {/* SECTION 2: TOP-PERFORMING AD CHANNELS SNAPSHOT */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-text-primary">
              Ad Network Performance & Attribution
            </h3>
            <span className="text-xs text-text-tertiary hidden sm:inline">
              First-party tracking for Meta CAPI, Google Ads, and LinkedIn Ads
            </span>
          </div>

          <Link
            href="/dashboard/traffic"
            className="text-xs text-blue hover:underline flex items-center gap-1 font-medium"
          >
            Manage Campaigns & Webhooks
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {channelDisplay.map((ch) => {
            const isMeta = ch.source?.includes("meta") || ch.source?.includes("facebook");
            const isGoogle = ch.source?.includes("google");
            const isLinkedin = ch.source?.includes("linkedin");

            return (
              <Card key={ch.source} className="border border-border bg-surface hover:border-border/80 transition-all">
                <CardHeader className="pb-2.5 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={isLinkedin ? "blue" : isMeta ? "purple" : isGoogle ? "green" : "default"}
                      className="text-[10px] font-semibold"
                    >
                      {ch.channel}
                    </Badge>
                    {ch.isWinner && (
                      <Badge variant="green" className="text-[9px] py-0 px-1.5">
                        Top CVR
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs font-mono font-bold text-text-primary">
                    {ch.conversionRate}% CVR
                  </span>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="grid grid-cols-3 gap-2 py-1 text-center bg-surface-elevated/50 rounded-lg border border-border/50">
                    <div>
                      <span className="text-[10px] text-text-tertiary block">Visitors</span>
                      <strong className="font-mono text-text-primary">{ch.visitors}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-tertiary block">Leads</span>
                      <strong className="font-mono text-text-primary">{ch.leads}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-tertiary block">Pre-Orders</span>
                      <strong className="font-mono text-emerald-400">{ch.preorders}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-text-tertiary pt-1 border-t border-border/40">
                    <span>Est. Cost / Lead:</span>
                    <span className="font-mono font-medium text-text-primary">
                      {ch.costPerLead ? `$${ch.costPerLead.toFixed(2)}` : "—"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: ACTIVE 7-DAY SMOKE TESTS & ACTIVITY STREAM */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Smoke Tests List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue" />
              Active Validation Experiments
            </h3>
            <Link
              href="/dashboard/experiments"
              className="text-xs text-text-tertiary hover:text-text-primary transition-colors flex items-center gap-1"
            >
              View All Experiments <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <Card className="border border-border">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-elevated/50 border-b border-border text-text-tertiary font-medium">
                    <tr>
                      <th className="py-3 px-4">Experiment Name</th>
                      <th className="py-3 px-4">Variants</th>
                      <th className="py-3 px-4">Visitors</th>
                      <th className="py-3 px-4">CVR (%)</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {safeExperiments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-text-tertiary space-y-3">
                          <p>No validation experiments created yet.</p>
                          <Link href="/dashboard/experiments/new">
                            <Button size="sm" className="bg-blue hover:bg-blue/90 text-white cursor-pointer text-xs">
                              <Plus className="w-3.5 h-3.5 mr-1" />
                              Launch Smoke Test in 60s
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ) : (
                      safeExperiments.map((exp) => (
                        <tr key={exp.id} className="hover:bg-surface-elevated/60 transition-colors">
                          <td className="py-3.5 px-4 font-medium text-text-primary">
                            <Link
                              href={`/dashboard/experiments/${exp.id}`}
                              className="hover:text-blue transition-colors block font-semibold"
                            >
                              {exp.name}
                            </Link>
                            <span className="text-[10px] text-text-tertiary font-mono">{exp.id}</span>
                          </td>
                          <td className="py-3.5 px-4 text-text-secondary">
                            {exp.variants?.length || 1} variants
                          </td>
                          <td className="py-3.5 px-4 font-mono font-semibold text-text-primary">
                            {(exp.traffic || 0).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-text-primary">
                            {exp.conversionRate || 0}%
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge
                              variant={exp.status === "running" ? "blue" : exp.status === "winner" ? "green" : "default"}
                              className="capitalize text-[10px]"
                            >
                              {exp.status}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Backer & Conversion Feed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue" />
              Live Backer & Lead Stream
            </h3>
            <Link
              href="/dashboard/history/activity"
              className="text-xs text-text-tertiary hover:text-text-primary transition-colors flex items-center gap-1"
            >
              All Activity <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <Card className="border border-border">
            <CardContent className="p-3 space-y-2">
              {leads.length > 0 ? (
                leads.slice(0, 6).map((ld) => {
                  const isPre = ld.isPreorder;
                  const depAmt = ld.depositAmount ? (ld.depositAmount / 100).toFixed(0) : "100";
                  const src = ld.source || "direct";

                  return (
                    <div
                      key={ld.id}
                      className="p-2.5 rounded-xl bg-surface-elevated/50 border border-border flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-text-primary truncate block max-w-[160px]">
                            {ld.name || ld.email}
                          </span>
                          <span className="text-[10px] font-mono px-1 rounded bg-surface border border-border text-text-tertiary uppercase">
                            {src.includes("meta") || src.includes("facebook")
                              ? "Meta"
                              : src.includes("google")
                              ? "Google"
                              : src.includes("linkedin")
                              ? "LinkedIn"
                              : "Web"}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-tertiary truncate">
                          {ld.company || ld.role || ld.email}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        {isPre ? (
                          <Badge variant="green" className="text-[10px] font-mono">
                            +${depAmt} Hold
                          </Badge>
                        ) : (
                          <Badge variant="default" className="text-[10px]">
                            Waitlist
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : activityLogs.length > 0 ? (
                activityLogs.slice(0, 6).map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-surface-elevated/40 border border-border flex items-center gap-3 text-xs"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue/10 flex items-center justify-center shrink-0">
                      <Activity className="w-3 h-3 text-blue" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary truncate">{log.action}</p>
                      <p className="text-[10px] text-text-tertiary truncate">{log.detail}</p>
                    </div>
                    <span className="text-[10px] text-text-tertiary shrink-0">
                      {timeAgo(log.createdAt)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-text-tertiary space-y-1">
                  <p>No conversion events yet.</p>
                  <p>Share your smoke-test page to see live visitor conversions!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 15-Second Instant AI Smoke Test Generator Modal */}
      <AIGeneratorModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onGenerated={fetchExperiments}
      />
    </div>
  );
}
