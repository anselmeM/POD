"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, Target, TrendingUp, Globe, Building2, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { demoAudience, demoAudienceSegments } from "@/lib/mock-data";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

export default function AudiencesPage() {
  const totalReach = demoAudienceSegments.reduce((s, seg) => s + seg.reach, 0);
  const avgIntent = Math.round(demoAudienceSegments.reduce((s, seg) => s + seg.intentScore, 0) / demoAudienceSegments.length);

  const reachData = demoAudienceSegments.map((seg) => ({ name: seg.name.length > 15 ? seg.name.slice(0, 15) + "…" : seg.name, reach: seg.reach, intent: seg.intentScore }));

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Audiences</h1><p className="text-sm text-text-secondary">Target audience segments and reach analysis for your experiments.</p></div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Segments", value: demoAudienceSegments.length, icon: Users },
          { label: "Total Reach", value: totalReach.toLocaleString(), icon: Globe },
          { label: "Avg Intent Score", value: `${avgIntent}/100`, icon: Target },
          { label: "Active Segments", value: demoAudienceSegments.filter((s) => s.status === "active").length, icon: TrendingUp },
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" tick={{ fill: "#6B7280", fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#6B7280", fontSize: 11 }} width={100} />
                  <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", color: "#1F2937", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="reach" fill="#4C8DFF" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Primary Segment Detail */}
        <Card>
          <CardHeader><CardTitle>Primary Segment</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-text-tertiary flex items-center gap-1"><Target className="w-3 h-3" />Target</p><p className="text-sm font-medium">{demoAudience.primarySegment}</p></div>
              <div><p className="text-xs text-text-tertiary flex items-center gap-1"><Briefcase className="w-3 h-3" />Job Title</p><p className="text-sm">{demoAudience.jobTitle}</p></div>
              <div><p className="text-xs text-text-tertiary flex items-center gap-1"><Building2 className="w-3 h-3" />Industry</p><p className="text-sm">{demoAudience.industry}</p></div>
              <div><p className="text-xs text-text-tertiary flex items-center gap-1"><Users className="w-3 h-3" />Company Size</p><p className="text-sm">{demoAudience.companySize}</p></div>
            </div>
            <div><p className="text-xs text-text-tertiary mb-2">Interests</p><div className="flex flex-wrap gap-2">{demoAudience.interests.map((i) => <Badge key={i} variant="blue">{i}</Badge>)}</div></div>
            <div><p className="text-xs text-text-tertiary mb-2">Pain Points</p><div className="space-y-2">{demoAudience.painPoints.map((p) => <div key={p} className="text-xs text-text-secondary bg-surface-elevated rounded px-3 py-2 border border-border/50">{p}</div>)}</div></div>
          </CardContent>
        </Card>
      </div>

      {/* Segment Comparison Table */}
      <Card>
        <CardHeader><CardTitle>Segment Comparison</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-border">{["Segment", "Reach", "Intent Score", "Status"].map((h) => (<th key={h} className="text-left text-xs font-medium text-text-tertiary pb-3 pr-4">{h}</th>))}</tr></thead>
              <tbody>
                {demoAudienceSegments.map((seg) => (
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
        </CardContent>
      </Card>
    </div>
  );
}