"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Target, TrendingUp, Globe, Building2, Briefcase, AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export default function AudiencesPage() {
  const [audience, setAudience] = useState<any>(null);
  const [segments, setSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/audiences");
      if (!res.ok) throw new Error("Failed to fetch audiences");
      const data = await res.json();
      setAudience(data.audience);
      setSegments(data.segments);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const totalReach = segments.reduce((s, seg) => s + seg.reach, 0);
  const avgIntent = segments.length > 0 ? Math.round(segments.reduce((s, seg) => s + seg.intentScore, 0) / segments.length) : 0;
  const reachData = segments.map((seg) => ({ name: seg.name.length > 15 ? seg.name.slice(0, 15) + "…" : seg.name, reach: seg.reach, intent: seg.intentScore }));

  if (loading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold">Audiences</h1><p className="text-sm text-text-secondary">Loading audience data...</p></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <Card key={i}><CardContent className="p-4 animate-pulse"><div className="h-4 bg-surface-elevated rounded w-16 mb-2" /><div className="h-8 bg-surface-elevated rounded w-12" /></CardContent></Card>)}</div>
        <div className="grid lg:grid-cols-2 gap-6"><Card><CardContent className="p-6 animate-pulse"><div className="h-64 bg-surface-elevated rounded" /></CardContent></Card><Card><CardContent className="p-6 animate-pulse"><div className="h-64 bg-surface-elevated rounded" /></CardContent></Card></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Audiences</h1><p className="text-sm text-text-secondary">Target audience segments and reach analysis for your experiments.</p></div>

      {error && (
        <Card className="border-red/30 bg-red/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red" />
            <p className="text-sm text-red">{error}</p>
            <Button size="sm" variant="secondary" onClick={fetchData} className="ml-auto"><RefreshCw className="w-3 h-3" /></Button>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Segments", value: segments.length, icon: Users },
          { label: "Total Reach", value: totalReach.toLocaleString(), icon: Globe },
          { label: "Avg Intent Score", value: `${avgIntent}/100`, icon: Target },
          { label: "Active Segments", value: segments.filter((s) => s.status === "active").length, icon: TrendingUp },
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Reach Bar Chart */}
        <Card>
          <CardHeader><CardTitle>Segment Reach</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reachData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis type="number" tick={{ fill: "var(--color-text-secondary)", fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "var(--color-text-secondary)", fontSize: 11 }} width={100} />
                  <Tooltip contentStyle={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text-primary)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="reach" fill="var(--color-blue)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Primary Segment Detail */}
        {audience && (
          <Card>
            <CardHeader><CardTitle>Primary Segment</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-text-tertiary flex items-center gap-1"><Target className="w-3 h-3" />Target</p><p className="text-sm font-medium">{audience.primarySegment}</p></div>
                <div><p className="text-xs text-text-tertiary flex items-center gap-1"><Briefcase className="w-3 h-3" />Job Title</p><p className="text-sm">{audience.jobTitle}</p></div>
                <div><p className="text-xs text-text-tertiary flex items-center gap-1"><Building2 className="w-3 h-3" />Industry</p><p className="text-sm">{audience.industry}</p></div>
                <div><p className="text-xs text-text-tertiary flex items-center gap-1"><Users className="w-3 h-3" />Company Size</p><p className="text-sm">{audience.companySize}</p></div>
              </div>
              <div><p className="text-xs text-text-tertiary mb-2">Interests</p><div className="flex flex-wrap gap-2">{audience.interests.map((i: string) => <Badge key={i} variant="blue">{i}</Badge>)}</div></div>
              <div><p className="text-xs text-text-tertiary mb-2">Pain Points</p><div className="space-y-2">{audience.painPoints.map((p: string) => <div key={p} className="text-xs text-text-secondary bg-surface-elevated rounded px-3 py-2 border border-border/50">{p}</div>)}</div></div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Segment Comparison Table */}
      <Card>
        <CardHeader><CardTitle>Segment Comparison</CardTitle></CardHeader>
        <CardContent>
          {segments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-border">{["Segment", "Reach", "Intent Score", "Status"].map((h) => (<th key={h} className="text-left text-xs font-medium text-text-tertiary pb-3 pr-4">{h}</th>))}</tr></thead>
                <tbody>
                  {segments.map((seg) => (
                    <tr key={seg.id} className="border-b border-border/50 hover:bg-surface-elevated/50 transition-colors">
                      <td className="py-3 pr-4"><p className="text-sm font-medium">{seg.name}</p><p className="text-xs text-text-tertiary">{seg.description}</p></td>
                      <td className="py-3 pr-4 text-sm font-mono">{seg.reach.toLocaleString()}</td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2"><span className="text-sm font-mono">{seg.intentScore}</span>
                          <div className="w-16 h-1.5 bg-surface-elevated rounded-full overflow-hidden"><div className="h-full rounded-full bg-blue" style={{ width: `${seg.intentScore}%` }} /></div>
                        </div>
                      </td>
                      <td className="py-3 pr-4"><Badge variant={seg.status === "active" ? "green" : "default"}>{seg.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-text-tertiary text-center py-8">No audience segments yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}