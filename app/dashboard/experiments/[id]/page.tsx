"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import type { Experiment, AIInsight, FunnelStage } from "@/lib/types";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: "green" | "blue" | "amber" | "default"; label: string }> = {
    running: { variant: "blue", label: "RUNNING" }, completed: { variant: "green", label: "COMPLETED" },
    winner: { variant: "green", label: "WINNER" }, paused: { variant: "amber", label: "PAUSED" }, draft: { variant: "default", label: "DRAFT" },
  };
  const s = map[status] || map.draft;
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

function DetailSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-8 bg-surface-elevated rounded w-48" />
        <div className="h-6 bg-surface-elevated rounded w-20" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}><CardContent className="p-4"><div className="h-4 bg-surface-elevated rounded w-16 mx-auto mb-2" /><div className="h-8 bg-surface-elevated rounded w-12 mx-auto" /></CardContent></Card>
        ))}
      </div>
      <Card><CardContent className="p-6"><div className="h-64 bg-surface-elevated rounded" /></CardContent></Card>
    </div>
  );
}

export default function ExperimentDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [funnel, setFunnel] = useState<FunnelStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [expRes, insRes, funnelRes] = await Promise.all([
        fetch(`/api/experiments/${id}`),
        fetch(`/api/insights?experimentId=${id}`),
        fetch(`/api/funnel?experimentId=${id}`),
      ]);

      if (!expRes.ok) {
        if (expRes.status === 404) {
          setError("Experiment not found");
        } else {
          const err = await expRes.json();
          throw new Error(err.error || "Failed to fetch experiment");
        }
        return;
      }

      const expJson = await expRes.json();
      setExperiment(expJson.data);

      if (insRes.ok) {
        const insJson = await insRes.json();
        setInsights(insJson.data || []);
      }

      if (funnelRes.ok) {
        const funnelJson = await funnelRes.json();
        setFunnel(funnelJson || []);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/experiments" className="inline-flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-secondary transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to Experiments
        </Link>
        <DetailSkeleton />
      </div>
    );
  }

  if (error || !experiment) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/experiments" className="inline-flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-secondary transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to Experiments
        </Link>
        <Card className="border-red/30 bg-red/5">
          <CardContent className="p-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red" />
            <p className="text-sm text-red">{error || "Experiment not found"}</p>
            <Button size="sm" variant="secondary" onClick={fetchData} className="ml-auto"><RefreshCw className="w-3 h-3" /></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const winnerIdx = experiment.variants.reduce((best, v, i, arr) => v.conversionRate > arr[best].conversionRate ? i : best, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/experiments" className="inline-flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-secondary transition-colors">
          <ArrowLeft className="w-4 h-4" />Back
        </Link>
        <h1 className="text-2xl font-bold">{experiment.name}</h1>
        <StatusBadge status={experiment.status} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Traffic", value: experiment.traffic.toLocaleString() },
          { label: "Conversions", value: experiment.conversions.toString() },
          { label: "CVR", value: `${experiment.conversionRate}%` },
          { label: "High Intent", value: experiment.highIntentActions.toString() },
          { label: "Cost/Action", value: `$${experiment.costPerAction.toFixed(2)}` },
        ].map((m) => (
          <Card key={m.label}>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-text-tertiary">{m.label}</p>
              <p className="text-2xl font-bold font-mono">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Variant Performance</CardTitle></CardHeader>
        <CardContent>
          {experiment.variants.length > 0 ? (
            <>
              <div className="h-64 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={experiment.variants}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="name" tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }} />
                    <YAxis tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                    <Bar dataKey="conversionRate" radius={[4, 4, 0, 0]}>
                      {experiment.variants.map((_, i) => (
                        <Cell key={i} fill={i === winnerIdx ? "#3FB950" : "#58A6FF"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      {["Variant", "Visitors", "CVR", "High Intent", "Cost/Action"].map((h) => (
                        <th key={h} className="text-left text-xs font-medium text-text-tertiary pb-3 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {experiment.variants.map((v, i) => (
                      <tr key={v.id} className={`border-b border-border/50 ${i === winnerIdx ? "bg-green/5" : ""}`}>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            {i === winnerIdx && <Badge variant="green" className="text-[10px]">Winner</Badge>}
                            <span className="text-sm font-medium">{v.name}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-sm font-mono">{v.visitors}</td>
                        <td className="py-3 pr-4 text-sm font-mono">{v.conversionRate}%</td>
                        <td className="py-3 pr-4 text-sm font-mono">{v.highIntent}</td>
                        <td className="py-3 pr-4 text-sm font-mono">${v.costPerAction.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="text-sm text-text-tertiary text-center py-8">No variants yet. Add variants to compare performance.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Behavioral Funnel</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {funnel.length > 0 ? funnel.map((stage, i) => {
              const colors = ["bg-text-tertiary", "bg-red", "bg-amber", "bg-blue", "bg-blue-bright", "bg-green", "bg-green"];
              return (
                <motion.div key={stage.label} className="flex items-center gap-3" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <div className={`w-2 h-2 rounded-full ${colors[i]}`} />
                  <span className="text-sm flex-1">{stage.label}</span>
                  <span className="text-sm font-mono">{stage.count.toLocaleString()}</span>
                  <span className="text-xs text-text-tertiary w-12 text-right">{stage.percentage}%</span>
                </motion.div>
              );
            }) : <p className="text-sm text-text-tertiary text-center py-4">No funnel data yet.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>AI Insights</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {insights.length > 0 ? (
              insights.slice(0, 3).map((ins) => (
                <div key={ins.id} className="bg-surface-elevated rounded-lg p-4 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={ins.type === "demand" ? "green" : ins.type === "pricing" ? "amber" : "blue"}>{ins.type}</Badge>
                    <span className="text-xs text-text-tertiary">Confidence: {ins.confidence}%</span>
                  </div>
                  <h4 className="text-sm font-semibold mb-1">{ins.title}</h4>
                  <p className="text-xs text-text-secondary">{ins.content}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-text-tertiary text-center py-4">No insights yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}