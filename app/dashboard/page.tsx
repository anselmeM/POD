"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight, TrendingUp, Users, MousePointerClick, Target,
  Plus, Activity,
  AlertCircle, RefreshCw, Sparkles,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useExperimentStore } from "@/lib/store";
import { VERDICTS } from "@/lib/constants";
import type { FunnelStage, Project } from "@/lib/types";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SprintBanner } from "@/components/dashboard/sprint-banner";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);
  useEffect(() => {
    const dur = 1800, start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    running: { cls: "bg-[var(--dash-accent-light)] text-[var(--dash-accent)]", label: "Running" },
    completed: { cls: "bg-[var(--dash-green-light)] text-[var(--dash-green)]", label: "Completed" },
    winner: { cls: "bg-[var(--dash-green-light)] text-[var(--dash-green)]", label: "Winner" },
    paused: { cls: "bg-[var(--dash-amber-light)] text-[var(--dash-amber)]", label: "Paused" },
    draft: { cls: "bg-surface-elevated text-[var(--dash-text-tertiary)] border border-border", label: "Draft" },
  };
  const s = map[status] || map.draft;
  return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${s.cls}`}>{s.label}</span>;
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

function SignalFunnelChart() {
  const [stages, setStages] = useState<FunnelStage[]>([]);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/funnel")
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((json) => {
        const raw = json.data;
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.stages)
          ? raw.stages
          : [];
        setStages(list);
      })
      .catch(() => setStages([]));
  }, []);

  const safeStages = Array.isArray(stages) ? stages : [];
  const maxCount = safeStages.length > 0 ? Math.max(...safeStages.map((s) => s?.count || 0), 1) : 1;

  if (safeStages.length === 0) {
    return <p className="text-sm text-[var(--dash-text-tertiary)] text-center py-12">No signal events yet.</p>;
  }

  return (
    <div className="flex items-end justify-between gap-1 sm:gap-2 h-40 px-2">
      {safeStages.map((s, i) => (
        <div key={s.label} className="flex-1 flex flex-col items-center gap-1 relative"
          onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
          {hovered === i && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="absolute -top-8 bg-blue text-white text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap z-10 shadow-lg">
              {s.count} events · {s.percentage}%
            </motion.div>
          )}
          <div className="w-full flex justify-center">
            <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max((s.count / maxCount) * 144, 4)}px` }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
              className={`w-full max-w-[28px] rounded-t-lg transition-colors cursor-pointer ${
                hovered === i ? "bg-blue" : "bg-surface-elevated hover:bg-black/10 dark:hover:bg-white/10"
              }`} />
          </div>
          <span className="text-[10px] font-semibold text-[var(--dash-text-tertiary)] mt-1 text-center leading-tight">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const { user } = useUser();
  const { experiments, error, fetchExperiments } = useExperimentStore();
  const [project, setProject] = useState<Project | null>(null);
  const [loadingDemo, setLoadingDemo] = useState(false);

  const fetchProjectData = async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const json = await res.json();
        setProject(json.data?.[0] ?? null);
      }
    } catch {
      setProject(null);
    }
  };

  useEffect(() => { fetchExperiments(); }, [fetchExperiments]);
  useEffect(() => { fetchProjectData(); }, []);

  const handleLoadDemoData = async () => {
    setLoadingDemo(true);
    try {
      const res = await fetch("/api/demo/seed", { method: "POST" });
      if (res.ok) {
        await Promise.all([fetchExperiments(), fetchProjectData()]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDemo(false);
    }
  };

  const safeExperiments = Array.isArray(experiments) ? experiments : [];

  // Compute metrics from real data
  const totalTraffic = safeExperiments.reduce((sum, e) => sum + (e?.traffic || 0), 0);
  const totalHighIntent = safeExperiments.reduce((sum, e) => sum + (e?.highIntentActions || 0), 0);
  const podScore = project?.podScore ?? 0;
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

  const metrics = [
    { label: "Demand Score", value: podScore, suffix: "/100", icon: Target, color: "#58A6FF" },
    { label: "Experiment Traffic", value: totalTraffic, suffix: "", icon: Users, color: "#BC8CFF" },
    { label: "High-Intent Actions", value: totalHighIntent, suffix: "", icon: MousePointerClick, color: "#3FB950" },
    { label: "Validation Confidence", value: project?.confidence ?? 0, suffix: "%", icon: TrendingUp, color: "#D29922" },
  ];

  const [isSprintView, setIsSprintView] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("view") === "sprint") {
        setIsSprintView(true);
      }
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--dash-text-primary)]">
            {greeting}, {displayName}
          </h1>
          <p className="text-sm text-[var(--dash-text-secondary)] font-medium mt-1">
            {safeExperiments.length > 0
              ? "Here's what your current validation sprint is telling you."
              : "Welcome to your demand validation workspace."}
          </p>
        </div>
        {safeExperiments.length > 0 && (
          <Link href="/dashboard/experiments/new">
            <button className="flex items-center gap-2 bg-blue text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue/20 hover:shadow-blue/30 hover:scale-[1.02] transition-all">
              <Plus className="w-4 h-4" /> New Experiment
            </button>
          </Link>
        )}
      </motion.div>

      {error && (
        <Card className="border-red/30 bg-red/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red" />
            <p className="text-sm text-red">{error}</p>
            <Button size="sm" variant="secondary" onClick={() => fetchExperiments()} className="ml-auto"><RefreshCw className="w-3 h-3" /></Button>
          </CardContent>
        </Card>
      )}

      {/* Pillar 1: Unified Sprint Status & Quota Progress (Active Sprints) */}
      {safeExperiments.length > 0 ? (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <SprintBanner
            experiments={safeExperiments}
            confidence={project?.confidence}
            initialExpanded={isSprintView}
          />
        </motion.div>
      ) : (
        /* Zero-State: Single Unified Onboarding Hero Card */
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="border border-blue/30 bg-gradient-to-r from-blue/5 via-surface-elevated to-purple/5 p-6 sm:p-7 rounded-2xl shadow-xs relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue/15 text-blue flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-text-primary">Welcome to Proof of Demand</h3>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Validate buyer demand with empirical signals before building. Launch a 7-day smoke test to measure true buying intent, or load sample data to explore the 4 pillars.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Button
                  variant="secondary"
                  size="default"
                  onClick={handleLoadDemoData}
                  disabled={loadingDemo}
                  className="gap-2 h-10 px-4"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingDemo ? "animate-spin" : ""}`} />
                  <span>{loadingDemo ? "Seeding..." : "Load Demo Dataset"}</span>
                </Button>
                <Link href="/dashboard/experiments/new">
                  <Button size="default" className="gap-2 h-10 px-4 bg-blue text-white hover:bg-blue-bright shadow-lg shadow-blue/20">
                    <Plus className="w-4 h-4" />
                    <span>Start 7-Day Sprint</span>
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      )}



      {/* Bento Grid — Metric Cards */}
      <div className="bento-grid">

        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div key={m.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}>
              <SpotlightCard className="h-full">
                <GlassCard className="p-5 h-full">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${m.color}15` }}>
                    <Icon className="w-4 h-4" style={{ color: m.color }} />
                  </div>
                  <p className="text-[11px] font-semibold text-[var(--dash-text-tertiary)] uppercase tracking-wide">{m.label}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--dash-text-primary)]">
                      <AnimatedCounter target={m.value} suffix={m.suffix} />
                    </span>
                  </div>
                </GlassCard>
              </SpotlightCard>
            </motion.div>
          );
        })}
      </div>


      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Validation Signals Chart — spans 2 cols */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="lg:col-span-2">
          <SpotlightCard className="h-full">
            <GlassCard className="p-5 h-full">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-sm font-bold text-[var(--dash-text-primary)]">Validation Signals</span>
                  <p className="text-[11px] text-[var(--dash-text-tertiary)] font-medium mt-0.5">Funnel events across all experiments</p>
                </div>
              </div>
              <SignalFunnelChart />
            </GlassCard>
          </SpotlightCard>
        </motion.div>

        {/* PoD Score Gauge */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <SpotlightCard className="h-full">
            <GlassCard className="p-5 h-full flex flex-col items-center justify-center text-center">
              <p className="text-[11px] font-semibold text-[var(--dash-text-tertiary)] uppercase tracking-wide mb-4">PoD Score</p>
              <div className="relative w-32 h-32 mb-4">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-border)" strokeWidth="8" />
                  <motion.circle cx="50" cy="50" r="42" fill="none" stroke="url(#scoreGradient)" strokeWidth="8"
                    strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 42}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - podScore / 100) }}
                    transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }} />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#58A6FF" />
                      <stop offset="50%" stopColor="#BC8CFF" />
                      <stop offset="100%" stopColor="#56D4DD" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-[var(--dash-text-primary)]">
                    <AnimatedCounter target={podScore} />
                  </span>
                  <span className="text-[10px] text-[var(--dash-text-tertiary)]">/ 100</span>
                </div>
              </div>
              <Badge variant={verdict.color} className="mb-2">{verdict.label}</Badge>
              <p className="text-[11px] text-[var(--dash-text-tertiary)] mt-1">Updated {timeAgo(project?.updatedAt)}</p>
            </GlassCard>
          </SpotlightCard>
        </motion.div>
      </div>


      {/* Experiments Table + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Experiments Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="lg:col-span-2">
          <SpotlightCard>
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-[var(--dash-text-primary)]">Active Experiments</span>
                <Link href="/dashboard/experiments">
                  <button className="text-xs font-bold text-[var(--dash-text-tertiary)] hover:text-[var(--dash-text-primary)] transition-colors flex items-center gap-1">
                    View All <ArrowUpRight className="w-3 h-3" />
                  </button>
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-[10px] font-bold text-[var(--dash-text-tertiary)] uppercase tracking-wider pb-3 pr-4">Experiment</th>
                      <th className="text-left text-[10px] font-bold text-[var(--dash-text-tertiary)] uppercase tracking-wider pb-3 pr-4">Variants</th>
                      <th className="text-left text-[10px] font-bold text-[var(--dash-text-tertiary)] uppercase tracking-wider pb-3 pr-4">Traffic</th>
                      <th className="text-left text-[10px] font-bold text-[var(--dash-text-tertiary)] uppercase tracking-wider pb-3 pr-4">CVR</th>
                      <th className="text-left text-[10px] font-bold text-[var(--dash-text-tertiary)] uppercase tracking-wider pb-3 pr-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeExperiments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-sm text-[var(--dash-text-tertiary)]">
                          No experiments created yet.{" "}
                          <Link href="/dashboard/experiments/new" className="text-blue font-semibold hover:underline">
                            Launch your first experiment &rarr;
                          </Link>
                        </td>
                      </tr>
                    ) : (
                      safeExperiments.map((exp) => (
                        <tr key={exp.id} className="border-b border-border hover:bg-surface-elevated/80 transition-colors">
                          <td className="py-3 pr-4">
                            <Link href={`/dashboard/experiments/${exp.id}`} className="text-sm font-bold text-[var(--dash-text-primary)] hover:text-blue transition-colors">{exp.name}</Link>
                            <p className="text-[10px] text-[var(--dash-text-tertiary)] font-mono">{exp.id}</p>
                          </td>
                          <td className="py-3 pr-4 text-sm text-[var(--dash-text-secondary)]">{exp.variants?.length || 0} variants</td>
                          <td className="py-3 pr-4 text-sm font-mono font-semibold text-[var(--dash-text-primary)]">{(exp.traffic || 0).toLocaleString()}</td>
                          <td className="py-3 pr-4 text-sm font-mono font-semibold text-[var(--dash-text-primary)]">{exp.conversionRate || 0}%</td>
                          <td className="py-3 pr-4"><StatusPill status={exp.status} /></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </SpotlightCard>
        </motion.div>

        {/* Activity Feed */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          <SpotlightCard className="h-full">
            <GlassCard className="p-5 h-full">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-[var(--dash-text-primary)]">Recent Activity</span>
                <Link href="/dashboard/history">
                  <button className="text-xs font-bold text-[var(--dash-text-tertiary)] hover:text-[var(--dash-text-primary)] transition-colors flex items-center gap-1">
                    View All <ArrowUpRight className="w-3 h-3" />
                  </button>
                </Link>
              </div>
              <div className="space-y-2">
                {safeExperiments.slice(0, 6).map((exp, i) => (
                  <motion.div key={exp.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.05 }}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-elevated transition-colors">
                    <div className="w-7 h-7 rounded-full bg-surface-elevated border border-border flex items-center justify-center shrink-0">
                      <Activity className="w-3.5 h-3.5 text-[var(--dash-text-tertiary)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[var(--dash-text-primary)] truncate">{exp.name}</p>
                      <p className="text-[11px] text-[var(--dash-text-tertiary)] truncate">{exp.status} · {exp.traffic} visitors</p>
                    </div>
                    <span className="text-[10px] text-[var(--dash-text-tertiary)] font-medium whitespace-nowrap">
                      {timeAgo(exp.updatedAt)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </SpotlightCard>
        </motion.div>
      </div>
    </div>
  );
}

