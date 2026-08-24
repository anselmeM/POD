"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight, TrendingUp, Users, MousePointerClick, Target,
  Plus, Activity, Brain, FlaskConical, FileText, Calendar, ArrowRight,
} from "lucide-react";
import { demoExperiments, demoPoDScore, demoActivityFeed, demoSprintHistory } from "@/lib/mock-data";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";

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

function Sparkline({ data, color = "#58A6FF" }: { data: number[]; color?: string }) {
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 60},${22 - ((v - min) / range) * 22}`).join(" ");
  return <svg width="60" height="22" className="opacity-40"><polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" points={pts} /></svg>;
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    running: { cls: "bg-[var(--dash-accent-light)] text-[var(--dash-accent)]", label: "Running" },
    completed: { cls: "bg-[var(--dash-green-light)] text-[var(--dash-green)]", label: "Completed" },
    winner: { cls: "bg-[var(--dash-green-light)] text-[var(--dash-green)]", label: "Winner" },
    paused: { cls: "bg-[var(--dash-amber-light)] text-[var(--dash-amber)]", label: "Paused" },
    draft: { cls: "bg-white/[0.04] text-[var(--dash-text-tertiary)]", label: "Draft" },
  };
  const s = map[status] || map.draft;
  return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${s.cls}`}>{s.label}</span>;
}

function SalesBarChart() {
  const [hovered, setHovered] = useState<number | null>(null);
  const data = [
    { m: "Jan", v: 55, p: "+24%" }, { m: "Feb", v: 85, p: "+36%" }, { m: "Mar", v: 65, p: "+26%" },
    { m: "Apr", v: 45, p: "+19%" }, { m: "May", v: 62, p: "+25%" }, { m: "Jun", v: 38, p: "+14%" },
    { m: "Jul", v: 50, p: "+20%" }, { m: "Aug", v: 68, p: "+25%" }, { m: "Sep", v: 42, p: "+18%" },
    { m: "Oct", v: 78, p: "+32%" }, { m: "Nov", v: 35, p: "+14%" }, { m: "Dec", v: 82, p: "+25%" },
  ];
  return (
    <div className="flex items-end justify-between gap-1 sm:gap-2 h-40 px-2">
      {data.map((d, i) => (
        <div key={d.m} className="flex-1 flex flex-col items-center gap-1 relative"
          onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
          {hovered === i && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="absolute -top-8 bg-blue text-white text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap z-10">
              {d.p}
            </motion.div>
          )}
          <div className="w-full flex justify-center">
            <motion.div initial={{ height: 0 }} animate={{ height: `${d.v * 1.6}px` }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
              className={`w-full max-w-[28px] rounded-t-lg transition-colors cursor-pointer ${
                hovered === i ? "bg-blue" : "bg-white/[0.08] hover:bg-white/[0.12]"
              }`} />
          </div>
          <span className="text-[10px] font-semibold text-[var(--dash-text-tertiary)] mt-1">{d.m}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [timeframe, setTimeframe] = useState("Week");
  const currentSprint = demoSprintHistory[0];

  const metrics = [
    { label: "Demand Score", value: demoPoDScore.overall, suffix: "/100", change: "+14%", icon: Target, color: "#58A6FF", sparkline: [51, 58, 62, 64, 71, 74, 78] },
    { label: "Experiment Traffic", value: 1842, suffix: "", change: "+22%", icon: Users, color: "#BC8CFF", sparkline: [820, 1211, 1400, 1600, 1720, 1800, 1842] },
    { label: "High-Intent Actions", value: 127, suffix: "", change: "+18%", icon: MousePointerClick, color: "#3FB950", sparkline: [31, 57, 72, 85, 98, 112, 127] },
    { label: "Validation Confidence", value: 84, suffix: "%", change: "+6%", icon: TrendingUp, color: "#D29922", sparkline: [58, 65, 71, 75, 79, 82, 84] },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--dash-text-primary)]">
            Good evening, Alex
          </h1>
          <p className="text-sm text-[var(--dash-text-secondary)] font-medium mt-1">
            Here&apos;s what your current validation sprint is telling you.
          </p>
        </div>
        <Link href="/dashboard/experiments/new">
          <button className="flex items-center gap-2 bg-blue text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue/20 hover:shadow-blue/30 hover:scale-[1.02] transition-all">
            <Plus className="w-4 h-4" /> New Experiment
          </button>
        </Link>
      </motion.div>


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
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${m.color}15` }}>
                      <Icon className="w-4 h-4" style={{ color: m.color }} />
                    </div>
                    <Sparkline data={m.sparkline} color={m.color} />
                  </div>
                  <p className="text-[11px] font-semibold text-[var(--dash-text-tertiary)] uppercase tracking-wide">{m.label}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--dash-text-primary)]">
                      <AnimatedCounter target={m.value} suffix={m.suffix} />
                    </span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-[var(--dash-green-light)] text-[var(--dash-green)]">{m.change}</span>
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
                  <p className="text-[11px] text-[var(--dash-text-tertiary)] font-medium mt-0.5">Monthly signal strength</p>
                </div>
                <div className="flex gap-1 bg-white/[0.03] rounded-full p-0.5">
                  {["Week", "Month", "Year"].map((t) => (
                    <button key={t} onClick={() => setTimeframe(t)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                        timeframe === t ? "bg-blue text-white shadow-sm" : "text-[var(--dash-text-tertiary)] hover:text-[var(--dash-text-secondary)]"
                      }`}>{t}</button>
                  ))}
                </div>
              </div>
              <SalesBarChart />
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
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
                  <motion.circle cx="50" cy="50" r="42" fill="none" stroke="url(#scoreGradient)" strokeWidth="8"
                    strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 42}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - demoPoDScore.overall / 100) }}
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
                    <AnimatedCounter target={demoPoDScore.overall} />
                  </span>
                  <span className="text-[10px] text-[var(--dash-text-tertiary)]">/ 100</span>
                </div>
              </div>
              <Badge variant="green" className="mb-2">Strong Demand</Badge>
              <p className="text-[11px] text-[var(--dash-text-tertiary)] mt-1">Updated 2 hours ago</p>
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
                    <tr className="border-b border-white/[0.04]">
                      <th className="text-left text-[10px] font-bold text-[var(--dash-text-tertiary)] uppercase tracking-wider pb-3 pr-4">Experiment</th>
                      <th className="text-left text-[10px] font-bold text-[var(--dash-text-tertiary)] uppercase tracking-wider pb-3 pr-4">Variants</th>
                      <th className="text-left text-[10px] font-bold text-[var(--dash-text-tertiary)] uppercase tracking-wider pb-3 pr-4">Traffic</th>
                      <th className="text-left text-[10px] font-bold text-[var(--dash-text-tertiary)] uppercase tracking-wider pb-3 pr-4">CVR</th>
                      <th className="text-left text-[10px] font-bold text-[var(--dash-text-tertiary)] uppercase tracking-wider pb-3 pr-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demoExperiments.map((exp) => (
                      <tr key={exp.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 pr-4">
                          <Link href={`/dashboard/experiments/${exp.id}`} className="text-sm font-bold text-[var(--dash-text-primary)] hover:text-blue transition-colors">{exp.name}</Link>
                          <p className="text-[10px] text-[var(--dash-text-tertiary)] font-mono">{exp.id}</p>
                        </td>
                        <td className="py-3 pr-4 text-sm text-[var(--dash-text-secondary)]">{exp.variants.length} variants</td>
                        <td className="py-3 pr-4 text-sm font-mono font-semibold text-[var(--dash-text-primary)]">{exp.traffic.toLocaleString()}</td>
                        <td className="py-3 pr-4 text-sm font-mono font-semibold text-[var(--dash-text-primary)]">{exp.conversionRate}%</td>
                        <td className="py-3 pr-4"><StatusPill status={exp.status} /></td>
                      </tr>
                    ))}
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
                {demoActivityFeed.slice(0, 6).map((item, i) => (
                  <motion.div key={item.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.05 }}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] transition-colors">
                    <div className="w-7 h-7 rounded-full bg-white/[0.04] flex items-center justify-center shrink-0">
                      <Activity className="w-3.5 h-3.5 text-[var(--dash-text-tertiary)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[var(--dash-text-primary)] truncate">{item.title}</p>
                      <p className="text-[11px] text-[var(--dash-text-tertiary)] truncate">{item.description}</p>
                    </div>
                    <span className="text-[10px] text-[var(--dash-text-tertiary)] font-medium whitespace-nowrap">
                      {(() => {
                        const diff = Date.now() - new Date(item.timestamp).getTime();
                        const mins = Math.floor(diff / 60000);
                        if (mins < 60) return `${mins}m ago`;
                        const hrs = Math.floor(mins / 60);
                        if (hrs < 24) return `${hrs}h ago`;
                        return `${Math.floor(hrs / 24)}d ago`;
                      })()}
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

