"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Project, AIInsight } from "@/lib/types";

const verdictColors: Record<string, string> = {
  green: "border-green/30 bg-green/5",
  blue: "border-blue/30 bg-blue/5",
  amber: "border-amber/30 bg-amber/5",
  red: "border-red/30 bg-red/5",
};
const verdictTextColors: Record<string, string> = {
  green: "text-green", blue: "text-blue-bright", amber: "text-amber", red: "text-red",
};

export default function ReportsPage() {
  const [project, setProject] = useState<Project | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [projRes, insRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/insights"),
      ]);
      if (projRes.ok) {
        const data = await projRes.json();
        if (data.data && data.data.length > 0) setProject(data.data[0]);
      }
      if (insRes.ok) {
        const data = await insRes.json();
        setInsights(Array.isArray(data) ? data : data.data || []);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // PoD score derived from project data
  const podScore = project?.podScore || 0;
  const confidence = project?.confidence || 0;
  const verdictColor = podScore >= 75 ? "green" : podScore >= 50 ? "blue" : podScore >= 30 ? "amber" : "red";
  const verdictLabel = podScore >= 75 ? "Strong Demand" : podScore >= 50 ? "Promising" : podScore >= 30 ? "Needs Iteration" : "Weak Signal";

  const sprintHistory = [
    { id: "sprint-003", name: "Sprint 3 — Positioning", startDate: "2026-01-10", endDate: "2026-01-16", visitors: 1842, conversions: 159, leads: 48, podScore: 78 },
    { id: "sprint-002", name: "Sprint 2 — Messaging", startDate: "2025-12-20", endDate: "2026-01-05", visitors: 1211, conversions: 98, leads: 24, podScore: 64 },
    { id: "sprint-001", name: "Sprint 1 — Problem Fit", startDate: "2025-12-01", endDate: "2025-12-15", visitors: 820, conversions: 52, leads: 12, podScore: 51 },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div><h1 className="text-2xl font-bold">Validation Report</h1><p className="text-sm text-text-secondary">Loading report data...</p></div>
        <Card><CardContent className="p-8 animate-pulse"><div className="h-32 bg-surface-elevated rounded" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Validation Report</h1>
          <p className="text-sm text-text-secondary">Generated {new Date().toLocaleDateString()}</p>
        </div>
        <Button variant="secondary" className="group" onClick={() => window.print()}><Download className="w-4 h-4" />Export PDF</Button>
      </div>

      {error && (
        <Card className="border-red/30 bg-red/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red" />
            <p className="text-sm text-red">{error}</p>
            <Button size="sm" variant="secondary" onClick={fetchData} className="ml-auto"><RefreshCw className="w-3 h-3" /></Button>
          </CardContent>
        </Card>
      )}

      {/* Verdict */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className={`border ${verdictColors[verdictColor]}`}>
          <CardContent className="p-8 text-center">
            <Badge variant={verdictColor as "green" | "blue" | "amber" | "red"} className="mb-4">{verdictLabel}</Badge>
            <h2 className="text-3xl font-bold mb-2">{project?.name || "No Project"}</h2>
            <p className="text-lg text-text-secondary mb-6">{project?.description || "Create a project to see validation data."}</p>
            <div className="flex items-center justify-center gap-8">
              <div>
                <p className={`text-5xl font-bold font-mono ${verdictTextColors[verdictColor]}`}>{podScore}</p>
                <p className="text-xs text-text-tertiary">PoD Score</p>
              </div>
              <div>
                <p className="text-5xl font-bold font-mono text-blue">{confidence}%</p>
                <p className="text-xs text-text-tertiary">Confidence</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Score Breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Problem Strength", value: 78 },
              { label: "Audience Fit", value: 82 },
              { label: "Message Resonance", value: 71 },
              { label: "Behavioral Intent", value: 85 },
              { label: "Willingness to Pay", value: 72 },
              { label: "Acquisition Efficiency", value: 68 },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-secondary">{s.label}</span>
                  <span className="text-sm font-mono font-semibold">{s.value}</span>
                </div>
                <div className="w-full h-2 bg-surface-elevated rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-blue"
                    initial={{ width: 0 }}
                    animate={{ width: `${s.value}%` }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Key Findings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {insights.length > 0 ? insights.map((ins) => (
              <div key={ins.id} className="bg-surface-elevated rounded-lg p-4 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={ins.type === "demand" ? "green" : ins.type === "pricing" ? "amber" : "blue"}>{ins.type}</Badge>
                  <span className="text-xs text-text-tertiary">{ins.confidence}% confidence</span>
                </div>
                <h4 className="text-sm font-semibold mb-1">{ins.title}</h4>
                <p className="text-xs text-text-secondary mb-2">{ins.content}</p>
                <p className="text-xs text-blue">{ins.recommendation}</p>
              </div>
            )) : <p className="text-sm text-text-tertiary text-center py-4">No insights yet.</p>}
          </CardContent>
        </Card>
      </div>

      {/* Sprint Comparison */}
      <Card>
        <CardHeader><CardTitle>Sprint Comparison</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-border">{["Sprint", "Period", "Visitors", "Conversions", "Leads", "PoD Score"].map((h) => (<th key={h} className="text-left text-xs font-medium text-text-tertiary pb-3 pr-4">{h}</th>))}</tr></thead>
              <tbody>
                {sprintHistory.map((sprint, i) => (
                  <tr key={sprint.id} className={`border-b border-border/50 ${i === 0 ? "bg-blue/5" : ""}`}>
                    <td className="py-3 pr-4 text-sm font-medium">{sprint.name}</td>
                    <td className="py-3 pr-4 text-xs text-text-tertiary">{sprint.startDate} — {sprint.endDate}</td>
                    <td className="py-3 pr-4 text-sm font-mono">{sprint.visitors.toLocaleString()}</td>
                    <td className="py-3 pr-4 text-sm font-mono">{sprint.conversions}</td>
                    <td className="py-3 pr-4 text-sm font-mono">{sprint.leads}</td>
                    <td className="py-3 pr-4"><span className="text-sm font-mono font-semibold text-blue">{sprint.podScore}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Share & Export */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Share Report</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <input readOnly value="https://pod.engine/reports/sprint-3-validation" className="flex-1 h-9 rounded-md border border-border bg-surface-elevated px-3 text-xs font-mono text-text-tertiary" />
              <Button size="sm" variant="secondary" onClick={() => navigator.clipboard.writeText("https://pod.engine/reports/sprint-3-validation")}>Copy Link</Button>
            </div>
            <p className="text-xs text-text-tertiary">Anyone with the link can view this report. Share it with stakeholders to align on the validation results.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Export Options</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: "PDF Report", desc: "Full validation report with charts", icon: FileText },
              { label: "CSV Data Export", desc: "Raw experiment data for analysis", icon: Download },
            ].map((opt) => {
              const Icon = opt.icon;
              return (
                <button key={opt.label} className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-blue/30 transition-colors text-left" onClick={() => window.print()}>
                  <div className="w-8 h-8 rounded-lg bg-blue/10 flex items-center justify-center"><Icon className="w-4 h-4 text-blue" /></div>
                  <div><p className="text-sm font-medium">{opt.label}</p><p className="text-xs text-text-tertiary">{opt.desc}</p></div>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 text-blue mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Next Steps</h3>
          <p className="text-sm text-text-secondary mb-6 max-w-lg mx-auto">
            Based on the validation data, we recommend running a pricing experiment with the winning
            positioning to establish a reliable willingness-to-pay threshold before scaling.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button className="group">Create Next Experiment <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></Button>
            <Button variant="secondary">Send to FirstMileDevs</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}