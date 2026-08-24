"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { demoFunnel, demoPoDScore } from "@/lib/mock-data";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import type { Experiment, AIInsight } from "@/lib/types";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [expRes, insRes] = await Promise.all([
        fetch(`/api/experiments/${id}`),
        fetch(`/api/insights?experimentId=${id}`),
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
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-10 h-10 text-red mx-auto mb-4" />
            <h2 className="text-lg font-bold mb-2">{error === "Experiment not found" ? "Experiment Not Found" : "Something Went Wrong"}</h2>
            <p className="text-sm text-text-secondary mb-6">{error === "Experiment not found" ? `No experiment with ID "${id}" exists.` : error}</p>
            <div className="flex gap-3 justify-center">
              {error !== "Experiment not found" && (
                <Button variant="outline" onClick={fetchData}><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Retry</Button>
              )}
              <Link href="/dashboard/experiments"><Button>Back to Experiments</Button></Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const variantData = experiment.variants.map((v) => ({ name: v.name.replace("Variant ", ""), conversion: v.conversionRate, highIntent: v.highIntent, visitors: v.visitors, cost: v.costPerAction }));
  const winnerIdx = experiment.variants.reduce((maxI, v, i, arr) => v.conversionRate > arr[maxI].conversionRate ? i : maxI, 0);

  return (
    <div className="space-y-8">
      <Link href="/dashboard/experiments" className="inline-flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-secondary transition-colors">
        <ArrowLeft className="w-4 h-4" />Back to Experiments
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold">Experiment #{experiment.id}</h1>
            <StatusBadge status={experiment.status} />
          </div>
          <p className="text-sm text-text-secondary">{experiment.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">Pause</Button>
          <Button variant="secondary" size="sm">Edit</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Demand Score", value: `${demoPoDScore.overall}` },
          { label: "Confidence", value: "84%" },
          { label: "Visitors", value: experiment.traffic.toLocaleString() },
          { label: "Conversion", value: `${experiment.conversionRate}%` },
          { label: "High-Intent Rate", value: `${experiment.highIntentRate}%` },
        ].map((m) => (
          <Card key={m.label}>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-text-tertiary mb-1">{m.label}</p>
              <p className="text-2xl font-bold font-mono">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Variant Comparison</CardTitle></CardHeader>
        <CardContent>
          {experiment.variants.length > 0 ? (
            <>
              <div className="h-64 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={variantData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{ fill: "#6B7280", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", color: "#1F2937", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="conversion" name="Conversion %" radius={[4, 4, 0, 0]}>
                      {variantData.map((_, i) => (
                        <Cell key={i} fill={i === winnerIdx ? "#35D399" : "#4C8DFF"} fillOpacity={i === winnerIdx ? 1 : 0.6} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      {["Variant", "Visitors", "Conversion", "High Intent", "Cost/Action"].map((h) => (
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
            {demoFunnel.map((stage, i) => {
              const colors = ["bg-text-tertiary", "bg-red", "bg-amber", "bg-blue", "bg-blue-bright", "bg-green", "bg-green"];
              return (
                <motion.div key={stage.label} className="flex items-center gap-3" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <div className={`w-2 h-2 rounded-full ${colors[i]}`} />
                  <span className="text-sm flex-1">{stage.label}</span>
                  <span className="text-sm font-mono">{stage.count.toLocaleString()}</span>
                  <span className="text-xs text-text-tertiary w-12 text-right">{stage.percentage}%</span>
                </motion.div>
              );
            })}
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
