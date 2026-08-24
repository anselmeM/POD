"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLeadStore } from "@/lib/store";
import { Users, Target, TrendingUp, Search, Filter, AlertCircle, RefreshCw } from "lucide-react";

export default function LeadsPage() {
  const { leads, loading, error, fetchLeads } = useLeadStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const lead = leads.find((l) => l.id === selected);

  const filtered = leads.filter((l) => {
    const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.company.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const avgIntent = leads.length > 0 ? Math.round(leads.reduce((s, l) => s + l.intentScore, 0) / leads.length) : 0;
  const qualified = leads.filter((l) => l.status === "qualified" || l.status === "converted").length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold">Leads</h1><p className="text-sm text-text-secondary">Loading leads...</p></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <Card key={i}><CardContent className="p-4 animate-pulse"><div className="h-4 bg-surface-elevated rounded w-16 mb-2" /><div className="h-8 bg-surface-elevated rounded w-12" /></CardContent></Card>)}</div>
        <Card><CardContent className="p-6 animate-pulse"><div className="h-64 bg-surface-elevated rounded" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Leads</h1>
        <p className="text-sm text-text-secondary">High-intent leads captured from your validation experiments.</p>
      </div>

      {error && (
        <Card className="border-red/30 bg-red/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red" />
            <p className="text-sm text-red">{error}</p>
            <Button size="sm" variant="secondary" onClick={() => fetchLeads()} className="ml-auto"><RefreshCw className="w-3 h-3" /></Button>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Leads", value: leads.length, icon: Users },
          { label: "Qualified", value: qualified, icon: Target },
          { label: "Avg Intent", value: `${avgIntent}`, icon: TrendingUp },
          { label: "Pricing Interactions", value: leads.filter((l) => l.pricingInteraction).length, icon: Filter },
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

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search leads..."
            className="w-full h-9 pl-9 pr-3 rounded-md border border-border bg-surface-elevated text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-blue" />
        </div>
        <div className="flex gap-1 bg-surface-elevated rounded-lg p-1">
          {["all", "new", "contacted", "qualified", "converted"].map((tab) => (
            <button key={tab} onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${statusFilter === tab ? "bg-blue text-white" : "text-text-tertiary hover:text-text-secondary"}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>{filtered.length} Leads</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      {["Name", "Company", "Role", "Source", "Intent", "Pricing", "Status"].map((h) => (
                        <th key={h} className="text-left text-xs font-medium text-text-tertiary pb-3 pr-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((l) => (
                      <tr key={l.id} className={`border-b border-border/50 cursor-pointer hover:bg-surface-elevated/50 transition-colors ${selected === l.id ? "bg-surface-elevated" : ""}`} onClick={() => setSelected(l.id)}>
                        <td className="py-3 pr-3 text-sm font-medium">{l.name}</td>
                        <td className="py-3 pr-3 text-sm text-text-secondary">{l.company}</td>
                        <td className="py-3 pr-3 text-sm text-text-secondary">{l.role}</td>
                        <td className="py-3 pr-3 text-sm text-text-secondary">{l.source}</td>
                        <td className="py-3 pr-3"><IntentScore score={l.intentScore} /></td>
                        <td className="py-3 pr-3">{l.pricingInteraction ? <Badge variant="green">Yes</Badge> : <span className="text-xs text-text-tertiary">No</span>}</td>
                        <td className="py-3 pr-3"><LeadStatusBadge status={l.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          {lead ? (
            <motion.div key={lead.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle>{lead.name}</CardTitle>
                  <p className="text-sm text-text-secondary">{lead.role} at {lead.company}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div><p className="text-xs text-text-tertiary">Email</p><p className="text-sm">{lead.email}</p></div>
                  <div><p className="text-xs text-text-tertiary">Source</p><p className="text-sm">{lead.source}</p></div>
                  <div><p className="text-xs text-text-tertiary">Intent Score</p><IntentScore score={lead.intentScore} /></div>
                  <div>
                    <p className="text-xs text-text-tertiary mb-2">Events</p>
                    <div className="flex flex-wrap gap-1">
                      {lead.events.map((e) => (
                        <Badge key={e} variant="default" className="text-[10px]">{e.replace(/_/g, " ")}</Badge>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full" size="sm">Send to FirstMileDevs</Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-sm text-text-tertiary">Select a lead to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function IntentScore({ score }: { score: number }) {
  const color = score >= 80 ? "text-green" : score >= 60 ? "text-amber" : "text-red";
  const label = score >= 80 ? "Very High" : score >= 60 ? "Moderate" : "Low";
  return (
    <span className={`text-sm font-mono font-semibold ${color}`}>{score} <span className="text-xs font-normal text-text-tertiary">— {label}</span></span>
  );
}

function LeadStatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: "green" | "blue" | "amber" | "red" | "default"; label: string }> = {
    new: { variant: "blue", label: "New" },
    contacted: { variant: "default", label: "Contacted" },
    qualified: { variant: "green", label: "Qualified" },
    converted: { variant: "green", label: "Converted" },
    disqualified: { variant: "red", label: "Disqualified" },
  };
  const s = map[status] || { variant: "default" as const, label: status };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}