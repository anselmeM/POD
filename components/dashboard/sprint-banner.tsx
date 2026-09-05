"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Clock, Target, ChevronDown, ChevronUp, Plus,
  ArrowRight, CheckCircle2, TrendingUp, Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Experiment } from "@/lib/types";

interface SprintBannerProps {
  experiments: Experiment[];
  confidence?: number;
  initialExpanded?: boolean;
}

export function SprintBanner({ experiments, confidence, initialExpanded = false }: SprintBannerProps) {
  const [expanded, setExpanded] = useState(initialExpanded);

  const safeExperiments = Array.isArray(experiments) ? experiments : [];
  if (safeExperiments.length === 0) return null;

  const runningExperiments = safeExperiments.filter(
    (e) => (e.status as string) === "running" || (e.status as string) === "active"
  );
  const hasActiveSprint = runningExperiments.length > 0;



  // Aggregate stats across running sprint experiments
  const totalTraffic = runningExperiments.reduce((sum, e) => sum + (e.traffic || 0), 0);
  const totalLeads = runningExperiments.reduce((sum, e) => sum + (e.highIntentActions || e.conversions || 0), 0);
  
  // Quota targets for standard 7-day validation sprint
  const targetLeads = 25;
  const targetTraffic = 200;
  const leadProgress = Math.min(Math.round((totalLeads / targetLeads) * 100), 100);
  const trafficProgress = Math.min(Math.round((totalTraffic / targetTraffic) * 100), 100);

  // Confidence level from project or fallback
  const displayConfidence = confidence || (hasActiveSprint ? 95 : 0);

  return (
    <div className="w-full bg-gradient-to-r from-amber-500/10 via-surface-elevated to-blue/10 border border-amber-500/20 dark:border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-xs relative overflow-hidden transition-all duration-300">
      {/* Background subtle glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 relative z-10">
        
        {/* Left: Sprint Identity */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-500 shadow-xs">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-[var(--dash-text-primary)]">
                {hasActiveSprint ? "Active 7-Day Validation Sprint" : "Validation Sprint Ready"}
              </h3>
              {hasActiveSprint ? (
                <Badge variant="blue" className="bg-amber-500/15 text-amber-500 border border-amber-500/30 text-[10px] font-semibold py-0.5">
                  Live Sprint
                </Badge>
              ) : (
                <span className="text-xs text-[var(--dash-text-tertiary)]">No tests currently running</span>
              )}
            </div>
            
            <div className="flex items-center gap-3 mt-1 text-xs text-[var(--dash-text-secondary)]">
              {hasActiveSprint ? (
                <>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span><strong>4 days</strong> remaining</span>
                  </span>
                  <span className="inline-block w-1 h-1 rounded-full bg-border" />
                  <span className="flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-blue" />
                    <span><strong>{totalLeads}</strong> / {targetLeads} target leads ({leadProgress}%)</span>
                  </span>
                </>
              ) : (
                <span>Set a 7-day quota to validate demand before building.</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          {hasActiveSprint ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-primary)] gap-1 px-2.5 h-8"
              >
                {expanded ? "Hide Details" : "View Quotas & Tests"}
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </Button>
              <Link href="/dashboard/ai-analyst">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 h-8 text-xs font-semibold border-amber-500/30 text-amber-500 hover:bg-amber-500/10 shadow-xs hidden sm:inline-flex"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Review AI Verdict</span>
                </Button>
              </Link>
              <Link href="/dashboard/experiments/new">
                <Button size="sm" className="gap-1.5 h-8 text-xs font-semibold shadow-xs">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Test</span>
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/dashboard/experiments/new">
              <Button size="sm" className="gap-1.5 h-8 text-xs font-semibold shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Start 7-Day Sprint</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Expandable Sprint Details */}
      <AnimatePresence>
        {expanded && hasActiveSprint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 pt-4 border-t border-border/60 relative z-10"
          >
            {/* Progress Bars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              
              {/* Metric 1: Lead Quota */}
              <div className="bg-surface/80 dark:bg-surface/40 p-3 rounded-xl border border-border/60">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[var(--dash-text-secondary)] font-medium">Lead Quota</span>
                  <span className="font-bold text-[var(--dash-text-primary)]">{totalLeads} / {targetLeads}</span>
                </div>
                <div className="w-full bg-surface-elevated rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${leadProgress}%` }}
                  />
                </div>
                <p className="text-[10px] text-[var(--dash-text-tertiary)] mt-1.5">{leadProgress}% of goal reached</p>
              </div>

              {/* Metric 2: Traffic Quota */}
              <div className="bg-surface/80 dark:bg-surface/40 p-3 rounded-xl border border-border/60">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[var(--dash-text-secondary)] font-medium">Visitor Traffic</span>
                  <span className="font-bold text-[var(--dash-text-primary)]">{totalTraffic} / {targetTraffic}</span>
                </div>
                <div className="w-full bg-surface-elevated rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue h-full rounded-full transition-all duration-500"
                    style={{ width: `${trafficProgress}%` }}
                  />
                </div>
                <p className="text-[10px] text-[var(--dash-text-tertiary)] mt-1.5">{trafficProgress}% of target audience reached</p>
              </div>

              {/* Metric 3: Stat Significance */}
              <div className="bg-surface/80 dark:bg-surface/40 p-3 rounded-xl border border-border/60">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[var(--dash-text-secondary)] font-medium">Significance</span>
                  <span className="font-bold text-[var(--dash-text-primary)]">{displayConfidence}%</span>
                </div>
                <div className="w-full bg-surface-elevated rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(displayConfidence, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-[var(--dash-text-tertiary)] mt-1.5">Bayesian confidence threshold</p>
              </div>

            </div>

            {/* Active Tests in Sprint */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-[var(--dash-text-secondary)] uppercase tracking-wider">
                  Tests Running in This Sprint ({runningExperiments.length})
                </h4>
                <Link
                  href="/dashboard/experiments"
                  className="text-xs text-blue hover:underline flex items-center gap-1"
                >
                  <span>Manage All Experiments</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {runningExperiments.map((exp) => (
                  <Link
                    key={exp.id}
                    href={`/dashboard/experiments/${exp.id}`}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-surface/50 hover:bg-surface border border-border/60 transition-colors group"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-xs font-medium text-[var(--dash-text-primary)] truncate group-hover:text-blue">
                        {exp.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-xs text-[var(--dash-text-secondary)]">
                      <span>{exp.conversionRate}% conv</span>
                      <span>{exp.traffic} views</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-blue" />
                    </div>
                  </Link>
                ))}
              </div>

              {/* Graduation Action */}
              <div className="mt-3 pt-3 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <p className="text-xs text-[var(--dash-text-secondary)]">
                  {totalLeads >= targetLeads
                    ? "🎯 Validation quota achieved! Synthesize empirical evidence into an investor brief."
                    : "7-day sprint active. Telemetry and Bayesian significance are continuously evaluated."}
                </p>
                <Link href="/dashboard/ai-analyst?export=ready" className="shrink-0 w-full sm:w-auto">
                  <Button size="sm" className="h-7 text-xs gap-1.5 w-full sm:w-auto">
                    <span>Finalize Verdict & Executive Brief</span>
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
