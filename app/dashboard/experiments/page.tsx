"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, FlaskConical, Search, BarChart3, Users, MousePointerClick, AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useExperimentStore } from "@/lib/store";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useRouter } from "next/navigation";

const statusTabs = ["All", "Running", "Completed", "Paused", "Draft"] as const;

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: "green" | "blue" | "amber" | "default"; label: string }> = {
    running: { variant: "blue", label: "Running" }, completed: { variant: "green", label: "Completed" },
    winner: { variant: "green", label: "Winner" }, paused: { variant: "amber", label: "Paused" }, draft: { variant: "default", label: "Draft" },
  };
  const s = map[status] || map.draft;
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

function ExperimentsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 animate-pulse">
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-4 bg-surface-elevated rounded w-48" />
                <div className="h-3 bg-surface-elevated rounded w-24" />
                <div className="h-3 bg-surface-elevated rounded w-64 mt-2" />
              </div>
              <div className="flex items-center gap-6">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="text-center space-y-1">
                    <div className="h-3 bg-surface-elevated rounded w-12" />
                    <div className="h-4 bg-surface-elevated rounded w-16" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function ExperimentsPage() {
  const router = useRouter();
  const { experiments, loading, error, fetchExperiments } = useExperimentStore();
  const [activeTab, setActiveTab] = useState<(typeof statusTabs)[number]>("All");
  const [search, setSearch] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const toggleCompare = (id: string) => setCompareIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev);

  useEffect(() => {
    fetchExperiments();
  }, [fetchExperiments]);

  const filtered = experiments.filter((exp) => {
    const matchesTab = activeTab === "All" || exp.status === activeTab.toLowerCase();
    const matchesSearch = exp.name.toLowerCase().includes(search.toLowerCase()) || exp.id.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  useKeyboardShortcuts({
    onJ: () => setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1)),
    onK: () => setSelectedIdx((i) => Math.max(i - 1, 0)),
  });

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Enter" && filtered[selectedIdx]) router.push(`/dashboard/experiments/${filtered[selectedIdx].id}`);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [selectedIdx, filtered, router]);

  const totalTraffic = filtered.reduce((sum, e) => sum + e.traffic, 0);
  const totalConversions = filtered.reduce((sum, e) => sum + e.conversions, 0);
  const avgConversion = totalTraffic > 0 ? ((totalConversions / totalTraffic) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Experiments</h1><p className="text-sm text-text-secondary">Manage your demand validation experiments.</p></div>
        <Link href="/dashboard/experiments/new"><Button><Plus className="w-4 h-4" />New Experiment</Button></Link>
      </div>

      {error && (
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <AlertCircle className="w-5 h-5 text-red flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red">Failed to load experiments</p>
              <p className="text-xs text-text-tertiary mt-0.5">{error}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => fetchExperiments()}>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Experiments", value: filtered.length, icon: FlaskConical },
            { label: "Total Traffic", value: totalTraffic.toLocaleString(), icon: Users },
            { label: "Total Conversions", value: totalConversions.toLocaleString(), icon: MousePointerClick },
            { label: "Avg Conversion", value: `${avgConversion}%`, icon: BarChart3 },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <Card key={m.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue/10 flex items-center justify-center"><Icon className="w-4 h-4 text-blue" /></div>
                  <div><p className="text-xs text-text-tertiary">{m.label}</p><p className="text-lg font-bold font-mono">{m.value}</p></div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex gap-1 bg-surface-elevated rounded-lg p-1">
          {statusTabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === tab ? "bg-blue text-white" : "text-text-tertiary hover:text-text-secondary"}`}>
              {tab}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search experiments..."
            className="w-full h-9 pl-9 pr-3 rounded-md border border-border bg-surface-elevated text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-blue" />
        </div>
        {compareIds.length >= 2 && (
          <Link href={`/dashboard/experiments/compare?ids=${compareIds.join(",")}`}>
            <Button size="sm">Compare ({compareIds.length})</Button>
          </Link>
        )}
      </div>

      {loading && <ExperimentsSkeleton />}

      {!loading && (
        <div className="grid gap-4">
          {filtered.map((exp, i) => (
            <motion.div key={exp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Link href={`/dashboard/experiments/${exp.id}`}>
                <Card className={`hover:border-blue/30 transition-colors cursor-pointer ${i === selectedIdx ? "ring-1 ring-blue/30 bg-blue/5" : ""}`}>
                  <CardContent className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <input type="checkbox" checked={compareIds.includes(exp.id)} onChange={(e) => { e.stopPropagation(); toggleCompare(exp.id); }} onClick={(e) => e.stopPropagation()} className="rounded border-border" />
                          <h3 className="text-sm font-semibold truncate">{exp.name}</h3>
                          <StatusBadge status={exp.status} />
                        </div>
                        <p className="text-xs text-text-tertiary font-mono">{exp.id}</p>
                        <p className="text-xs text-text-secondary mt-2 line-clamp-1">Testing demand for {exp.name.toLowerCase()}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center"><p className="text-xs text-text-tertiary">Traffic</p><p className="text-sm font-bold font-mono">{exp.traffic.toLocaleString()}</p></div>
                        <div className="text-center"><p className="text-xs text-text-tertiary">Conversions</p><p className="text-sm font-bold font-mono">{exp.conversions}</p></div>
                        <div className="text-center"><p className="text-xs text-text-tertiary">Rate</p><p className="text-sm font-bold font-mono">{exp.conversionRate}%</p></div>
                        <div className="text-center"><p className="text-xs text-text-tertiary">High Intent</p><p className="text-sm font-bold font-mono">{exp.highIntentActions}</p></div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[10px] text-text-tertiary mb-1">
                        <span>Conversion Rate</span><span>{exp.conversionRate}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                        <motion.div className="h-full rounded-full bg-blue" initial={{ width: 0 }} animate={{ width: `${Math.min(exp.conversionRate * 10, 100)}%` }} transition={{ duration: 0.6, delay: i * 0.05 }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
          {experiments.length === 0 && !error ? (
            <Card className="border-border">
              <CardContent className="p-12 text-center space-y-3">
                <FlaskConical className="w-10 h-10 text-blue mx-auto" />
                <h3 className="text-lg font-bold text-text-primary">No experiments yet</h3>
                <p className="text-sm text-text-secondary max-w-md mx-auto">
                  Create your first experiment to generate high-converting landing page variants and start gathering real demand signals.
                </p>
                <Link href="/dashboard/experiments/new">
                  <Button className="mt-2"><Plus className="w-4 h-4 mr-1.5" /> Launch First Experiment</Button>
                </Link>
              </CardContent>
            </Card>
          ) : filtered.length === 0 && !error ? (
            <Card><CardContent className="p-12 text-center"><FlaskConical className="w-8 h-8 text-text-tertiary mx-auto mb-3" /><p className="text-sm text-text-secondary">No experiments match your filters.</p></CardContent></Card>
          ) : null}
        </div>
      )}
    </div>
  );
}
