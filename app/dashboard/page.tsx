"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight, TrendingUp, Users, MousePointerClick, Target,
  Plus, Activity, Brain, FlaskConical, FileText,
  Calendar, ArrowRight, MoreHorizontal,
} from "lucide-react";
import { demoExperiments, demoPoDScore, demoActivityFeed, demoSprintHistory } from "@/lib/mock-data";

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

function Sparkline({ data, color = "#3B82F6" }: { data: number[]; color?: string }) {
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 60},${22 - ((v - min) / range) * 22}`).join(" ");
  return <svg width="60" height="22" className="opacity-50"><polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" points={pts} /></svg>;
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    running: { cls: "bg-[var(--dash-accent-light)] text-[var(--dash-accent)]", label: "Running" },
    completed: { cls: "bg-[var(--dash-green-light)] text-[var(--dash-green)]", label: "Completed" },
    winner: { cls: "bg-[var(--dash-green-light)] text-[var(--dash-green)]", label: "Winner" },
    paused: { cls: "bg-[var(--dash-amber-light)] text-[var(--dash-amber)]", label: "Paused" },
    draft: { cls: "bg-[var(--dash-container)] text-[var(--dash-text-secondary)]", label: "Draft" },
  };
  const s = map[status] || map.draft;
  return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${s.cls}`}>{s.label}</span>;
}

function DotMatrix({ cols }: { cols: number[][] }) {
  return (
    <div className="flex items-end justify-between gap-1.5 h-14 px-1">
      {cols.map((col, ci) => (
        <div key={ci} className="flex flex-col gap-1 items-center justify-end">
          {Array.from({ length: col.length }).map((_, ri) => (
            <div key={ri} className="w-2.5 h-2.5 rounded-full bg-[var(--dash-orange)] hover:scale-125 transition-transform cursor-pointer" />
          ))}
        </div>
      ))}
    </div>
  );
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
              className="absolute -top-8 bg-[var(--dash-nav-active)] text-white text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap z-10">
              {d.p}
            </motion.div>
          )}
          <div className="w-full flex justify-center">
            <motion.div
              initial={{ height: 0 }} animate={{ height: `${d.v * 1.6}px` }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
              className={`w-full max-w-[28px] rounded-t-lg transition-colors cursor-pointer ${
                hovered === i ? "bg-[var(--dash-nav-active)]" : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          </div>
          <span className="text-[10px] font-semibold text-[var(--dash-text-tertiary)] mt-1">{d.m}</span>
        </div>
      ))}
    </div>
  );
}

function MiniCalendar() {
  const [selected, setSelected] = useState(16);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const offset = 3;
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-[var(--dash-text-primary)]">January 2025</span>
        <Calendar className="w-3.5 h-3.5 text-[var(--dash-text-tertiary)]" />
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
          <span key={d} className="text-[9px] font-bold text-[var(--dash-text-tertiary)] pb-1">{d}</span>
        ))}
        {Array.from({ length: offset }).map((_, i) => <div key={`e${i}`} />)}
        {days.map((d) => (
          <button key={d} onClick={() => setSelected(d)}
            className={`w-7 h-7 rounded-full text-[10px] font-bold transition-all ${
              d === selected
                ? "bg-[var(--dash-nav-active)] text-white shadow-md"
                : d === 5 || d === 12 || d === 22
                  ? "bg-[var(--dash-orange)]/10 text-[var(--dash-orange)]"
                  : "text-[var(--dash-text-secondary)] hover:bg-[var(--dash-container)]"
            }`}>
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}

function TimeframePill({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="bg-[var(--dash-container)] p-0.5 rounded-full flex gap-0.5">
      {["Week", "Month", "Year"].map((t) => (
        <button key={t} onClick={() => onChange(t)}
          className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
            value === t ? "bg-[var(--dash-nav-active)] text-white shadow-sm" : "text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-secondary)]"
          }`}>
          {t}
        </button>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [timeframe, setTimeframe] = useState("Week");
  const currentSprint = demoSprintHistory[0];

  const metrics = [
    { label: "Demand Score", value: demoPoDScore.overall, suffix: "/100", change: "+14%", icon: Target, color: "#3B82F6", sparkline: [51, 58, 62, 64, 71, 74, 78] },
    { label: "Experiment Traffic", value: 1842, suffix: "", change: "+22%", icon: Users, color: "#8B5CF6", sparkline: [820, 1211, 1400, 1600, 1720, 1800, 1842] },
    { label: "High-Intent Actions", value: 127, suffix: "", change: "+18%", icon: MousePointerClick, color: "#22C55E", sparkline: [31, 57, 72, 85, 98, 112, 127] },
    { label: "Validation Confidence", value: 84, suffix: "%", change: "+6%", icon: TrendingUp, color: "#F59E0B", sparkline: [58, 65, 71, 75, 79, 82, 84] },
  ];

  const dotCols = [[1,2,3],[2,3,4,3],[1,2,3,4,3,2],[3,4,3,2],[1,2,3,4,2],[2,3],[1,2,3,2],[1,2],[2,3,2],[1,2]];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--dash-text-primary)]">Good evening, Alex</h1>
          <p className="text-sm text-[var(--dash-text-secondary)] font-medium mt-1">Here&apos;s what your current validation sprint is telling you.</p>
        </div>
        <Link href="/dashboard/experiments/new">
          <button className="flex items-center gap-2 bg-[var(--dash-nav-active)] text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg hover:opacity-80 hover:scale-[1.02] transition-all">
            <Plus className="w-4 h-4" /> New Experiment
          </button>
        </Link>
      </motion.div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div key={m.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-[var(--dash-card)] p-5 rounded-3xl shadow-sm border border-[var(--dash-card-border)] hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${m.color}15` }}>
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
            </motion.div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        {/* Sales Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-3 bg-[var(--dash-card)] p-5 rounded-3xl shadow-sm border border-[var(--dash-card-border)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-bold text-[var(--dash-text-primary)]">Validation Signals</span>
              <p className="text-[10px] text-[var(--dash-text-tertiary)] font-semibold mt-0.5">Monthly signal strength</p>
            </div>
            <TimeframePill value={timeframe} onChange={setTimeframe} />
          </div>
          <SalesBarChart />
        </motion.div>

        {/* Calendar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="lg:col-span-1 bg-[var(--dash-card)] p-5 rounded-3xl shadow-sm border border-[var(--dash-card-border)] flex flex-col justify-between">
          <MiniCalendar />
          <div className="mt-4 pt-3 border-t border-[var(--dash-card-border)]">
            <p className="text-[10px] font-bold text-[var(--dash-text-primary)]">Sprint Progress</p>
            <div className="w-full bg-[var(--dash-container)] rounded-full h-2 mt-2">
              <motion.div initial={{ width: 0 }} animate={{ width: "68%" }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
            </div>
            <p className="text-[10px] text-[var(--dash-text-tertiary)] mt-1">Day 14 of 21</p>
          </div>
        </motion.div>

        {/* Users Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-[var(--dash-card)] p-5 rounded-3xl shadow-sm border border-[var(--dash-card-border)] flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-[var(--dash-text-primary)]">Active Users</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-[var(--dash-text-primary)]">1,842</span>
              <span className="bg-[var(--dash-green-light)] text-[var(--dash-green)] text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">+22%</span>
            </div>
            <p className="text-[10px] font-semibold text-[var(--dash-text-tertiary)] mt-1">This week</p>
          </div>
          <div className="flex items-center mt-4">
            <div className="flex -space-x-2">
              {["A","B","C","D","E"].map((l, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ backgroundColor: ["#3B82F6","#8B5CF6","#22C55E","#F59E0B","#EF4444"][i], zIndex: 5 - i }}>
                  {l}
                </div>
              ))}
            </div>
            <span className="text-[10px] text-[var(--dash-text-tertiary)] font-semibold ml-3">+2.1k more</span>
          </div>
        </motion.div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Dot Matrix */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="bg-[var(--dash-card)] p-5 rounded-3xl shadow-sm border border-[var(--dash-card-border)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--dash-text-primary)]">Total Transactions</span>
              <button className="bg-[var(--dash-container)] px-3 py-1 rounded-full text-[10px] font-bold text-[var(--dash-text-secondary)] hover:bg-[var(--dash-container)] transition-colors">View All</button>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-[var(--dash-text-primary)] tracking-tight">15,842</span>
              <span className="bg-[var(--dash-green-light)] text-[var(--dash-green)] text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">+10%</span>
            </div>
            <p className="text-[10px] font-semibold text-[var(--dash-text-tertiary)]">This month</p>
          </div>
          <DotMatrix cols={dotCols} />
          <p className="text-[10px] font-semibold text-[var(--dash-text-tertiary)] mt-3 pt-3 border-t border-[var(--dash-card-border)]">
            Total transactions grew by <span className="text-[var(--dash-text-secondary)] font-bold">9%</span> compared to last month.
          </p>
        </motion.div>

        {/* Dark Accent Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-[var(--dash-dark-card)] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[260px]">
          <div className="absolute inset-0 bg-gradient-to-tr from-black via-[#141414] to-black opacity-90" />
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-200 tracking-wide">Demand Score</span>
            <MoreHorizontal className="w-5 h-5 text-[var(--dash-text-tertiary)] hover:text-white transition-colors cursor-pointer" />
          </div>
          <div className="relative z-10 my-auto py-6">
            <div className="text-6xl sm:text-7xl font-black tracking-tight font-sans flex items-baseline">
              <AnimatedCounter target={demoPoDScore.overall} />
              <span className="text-3xl font-bold text-[var(--dash-text-tertiary)] ml-1">/100</span>
            </div>
          </div>
          <div className="relative z-10 flex justify-start">
            <Link href="/dashboard/signals">
              <button className="bg-[var(--dash-card)] text-black px-6 py-2 rounded-full text-xs font-black shadow-lg hover:bg-[var(--dash-container)] hover:scale-105 transition-all">View Signals</button>
            </Link>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="grid grid-cols-1 gap-4">
          {[
            { label: "New Experiment", desc: "Test a new hypothesis", href: "/dashboard/experiments/new", icon: FlaskConical, color: "#3B82F6" },
            { label: "AI Analyst", desc: "Ask about your data", href: "/dashboard/ai-analyst", icon: Brain, color: "#8B5CF6" },
            { label: "View Signals", desc: "Check behavioral data", href: "/dashboard/signals", icon: Activity, color: "#22C55E" },
            { label: "Export Report", desc: "Download validation report", href: "/dashboard/reports", icon: FileText, color: "#F59E0B" },
          ].map((a) => {
            const Icon = a.icon;
            return (
              <Link key={a.label} href={a.href}>
                <div className="bg-[var(--dash-card)] p-4 rounded-2xl shadow-sm border border-[var(--dash-card-border)] flex items-center gap-3 hover:shadow-md hover:border-[var(--dash-card-border)] transition-all cursor-pointer group">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${a.color}15` }}>
                    <Icon className="w-4 h-4" style={{ color: a.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[var(--dash-text-primary)]">{a.label}</p>
                    <p className="text-[11px] text-[var(--dash-text-tertiary)] font-medium">{a.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[var(--dash-text-secondary)] group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            );
          })}
        </motion.div>
      </div>

      {/* Experiments Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="bg-[var(--dash-card)] rounded-3xl shadow-sm border border-[var(--dash-card-border)] overflow-hidden">
        <div className="flex items-center justify-between p-5 pb-0">
          <span className="text-sm font-bold text-[var(--dash-text-primary)]">Active Experiments</span>
          <Link href="/dashboard/experiments">
            <button className="text-xs font-bold text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-primary)] transition-colors flex items-center gap-1">
              View All <ArrowUpRight className="w-3 h-3" />
            </button>
          </Link>
        </div>
        <div className="overflow-x-auto p-5">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--dash-card-border)]">
                {["Experiment", "Variants", "Traffic", "Conversion", "High Intent", "Status"].map((h) => (
                  <th key={h} className="text-left text-[10px] font-bold text-[var(--dash-text-tertiary)] uppercase tracking-wider pb-3 pr-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {demoExperiments.map((exp) => (
                <tr key={exp.id} className="border-b border-[var(--dash-card-border)] hover:bg-[var(--dash-container)]/50 transition-colors">
                  <td className="py-3 pr-4">
                    <Link href={`/dashboard/experiments/${exp.id}`} className="text-sm font-bold text-[var(--dash-text-primary)] hover:text-blue-600 transition-colors">{exp.name}</Link>
                    <p className="text-[10px] text-[var(--dash-text-tertiary)] font-mono">{exp.id}</p>
                  </td>
                  <td className="py-3 pr-4 text-sm text-[var(--dash-text-secondary)]">{exp.variants.length} variants</td>
                  <td className="py-3 pr-4 text-sm font-mono font-semibold text-[var(--dash-text-primary)]">{exp.traffic.toLocaleString()}</td>
                  <td className="py-3 pr-4 text-sm font-mono font-semibold text-[var(--dash-text-primary)]">{exp.conversionRate}%</td>
                  <td className="py-3 pr-4 text-sm font-mono font-semibold text-[var(--dash-text-primary)]">{exp.highIntentActions}</td>
                  <td className="py-3 pr-4"><StatusPill status={exp.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Activity Feed */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
        className="bg-[var(--dash-card)] rounded-3xl shadow-sm border border-[var(--dash-card-border)] p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-[var(--dash-text-primary)]">Recent Activity</span>
          <Link href="/dashboard/history">
            <button className="text-xs font-bold text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-primary)] transition-colors flex items-center gap-1">
              View All <ArrowUpRight className="w-3 h-3" />
            </button>
          </Link>
        </div>
        <div className="space-y-3">
          {demoActivityFeed.slice(0, 5).map((item, i) => (
            <motion.div key={item.id}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.05 }}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--dash-container)] transition-colors">
              <div className="w-7 h-7 rounded-full bg-[var(--dash-container)] flex items-center justify-center shrink-0">
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
      </motion.div>
    </div>
  );
}

