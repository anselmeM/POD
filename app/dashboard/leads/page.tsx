"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLeadStore } from "@/lib/store";
import type { LeadStatus, FunnelStage } from "@/lib/types";
import {
  Users, Target, TrendingUp, Search, Filter, AlertCircle, RefreshCw,
  Globe, Building2, Briefcase, Activity, Zap, ExternalLink, ArrowRight,
  MousePointerClick, BarChart3, Download, CreditCard, MessageSquare, DollarSign, Quote, Sparkles,
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import Link from "next/link";

const strengthColors: Record<string, string> = {
  none: "var(--text-tertiary)", weak: "var(--red)", moderate: "var(--amber)", strong: "var(--blue)", very_strong: "var(--green)",
};
const strengthLabels: Record<string, string> = {
  none: "None", weak: "Weak", moderate: "Moderate", strong: "Strong", very_strong: "Very Strong",
};

function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const map: Record<LeadStatus, { variant: "default" | "blue" | "green" | "amber" | "red"; label: string }> = {
    new: { variant: "blue", label: "New" },
    contacted: { variant: "amber", label: "Contacted" },
    qualified: { variant: "green", label: "Qualified" },
    converted: { variant: "green", label: "Converted" },
    disqualified: { variant: "red", label: "Disqualified" },
  };
  const s = map[status] || map.new;
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

function IntentScore({ score }: { score: number }) {
  const color = score >= 80 ? "text-green font-bold" : score >= 50 ? "text-amber font-semibold" : "text-text-tertiary";
  return <span className={`font-mono text-sm ${color}`}>{score}/100</span>;
}

function LeadSourceBadge({ source }: { source?: string | null }) {
  const s = (source || "direct").toLowerCase();
  if (s.includes("meta") || s.includes("facebook") || s.includes("fb")) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#1877F2]/15 text-[#1877F2] border border-[#1877F2]/30">Meta</span>;
  }
  if (s.includes("google") || s.includes("adwords") || s.includes("gclid")) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#EA4335]/15 text-[#EA4335] border border-[#EA4335]/30">Google</span>;
  }
  if (s.includes("linkedin") || s.includes("li_fat_id")) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#0A66C2]/15 text-[#0A66C2] border border-[#0A66C2]/30">LinkedIn</span>;
  }
  if (s.includes("twitter") || s.includes("x.com")) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-surface-elevated text-text-primary border border-border">X</span>;
  }
  if (s.includes("reddit")) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#FF4500]/15 text-[#FF4500] border border-[#FF4500]/30">Reddit</span>;
  }
  return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-surface-elevated text-text-tertiary border border-border">Direct</span>;
}

export const dynamic = "force-dynamic";

export default function LeadsPage() {
  const { leads, loading: leadsLoading, error: leadsError, fetchLeads } = useLeadStore();

  // Tab State: "leads" | "attribution" | "signals"
  const [activeTab, setActiveTab] = useState<"leads" | "attribution" | "signals">("leads");

  // Leads CRM State
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Attribution & Audience State
  const [audience, setAudience] = useState<any>(null);
  const [segments, setSegments] = useState<any[]>([]);
  const [audienceLoading, setAudienceLoading] = useState(false);

  // Signals State
  const [funnel, setFunnel] = useState<FunnelStage[]>([]);
  const [signalEvents, setSignalEvents] = useState<any[]>([]);
  const [signalsLoading, setSignalsLoading] = useState(false);
  const [surveyAnalytics, setSurveyAnalytics] = useState<{
    totalResponses: number;
    avgAcceptablePrice: number;
    problemDistribution: Array<{ label: string; count: number; percentage: number }>;
    priceElasticity: Array<{ tier: string; count: number; percentage: number }>;
    recentResponses: Array<{
      id: string;
      timestamp: string;
      problem: string;
      willingPrice: string;
      customNotes?: string;
      email?: string;
      name?: string;
    }>;
  } | null>(null);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "attribution" || tabParam === "signals" || tabParam === "leads") {
        setActiveTab(tabParam);
      }
    }
  }, []);

  // Fetch Audience data if switching to attribution tab
  useEffect(() => {
    if (activeTab === "attribution" && segments.length === 0) {
      setAudienceLoading(true);
      fetch("/api/audiences")
        .then((r) => (r.ok ? r.json() : {}))
        .then((data: any) => {
          setAudience(data?.audience || null);
          setSegments(Array.isArray(data?.segments) ? data.segments : []);
        })

        .catch(() => {})
        .finally(() => setAudienceLoading(false));
    }
  }, [activeTab, segments.length]);

  // Fetch Signals, Funnel & Survey Analytics if switching to signals tab
  useEffect(() => {
    if (activeTab === "signals") {
      setSignalsLoading(true);
      Promise.all([
        fetch("/api/funnel"),
        fetch("/api/signals"),
        fetch("/api/signals/survey"),
      ])
        .then(async ([fRes, sRes, surRes]) => {
          if (fRes.ok) {
            const fData = await fRes.json();
            const raw = fData.data;
            setFunnel(Array.isArray(raw) ? raw : Array.isArray(raw?.stages) ? raw.stages : []);
          }
          if (sRes.ok) {
            const sData = await sRes.json();
            setSignalEvents(Array.isArray(sData.data) ? sData.data : []);
          }
          if (surRes.ok) {
            const surData = await surRes.json();
            if (surData?.data) {
              setSurveyAnalytics(surData.data);
            }
          }
        })
        .catch(() => {})
        .finally(() => setSignalsLoading(false));
    }
  }, [activeTab]);

  const safeLeads = Array.isArray(leads) ? leads : [];
  const lead = safeLeads.find((l) => l.id === selected);

  const filteredLeads = safeLeads.filter((l) => {
    const matchesSearch =
      (l.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.company || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "preorders"
        ? Boolean(l.isPreorder)
        : l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const avgIntent = safeLeads.length > 0 ? Math.round(safeLeads.reduce((s, l) => s + (l.intentScore || 0), 0) / safeLeads.length) : 0;
  const qualified = safeLeads.filter((l) => l.status === "qualified" || l.status === "converted").length;

  const safeSegments = Array.isArray(segments) ? segments : [];
  const totalReach = safeSegments.reduce((s, seg) => s + (seg?.reach || 0), 0);
  const reachData = safeSegments.map((seg) => ({
    name: (seg?.name || "").length > 15 ? (seg?.name || "").slice(0, 15) + "…" : (seg?.name || ""),
    reach: seg?.reach || 0,
    intent: seg?.intentScore || 0,
  }));

  const safeFunnel = Array.isArray(funnel) ? funnel : [];
  const maxCount = safeFunnel.length > 0 ? Math.max(...safeFunnel.map((s) => s?.count || 0), 1) : 1;

  const switchTab = (tab: "leads" | "attribution" | "signals") => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState({}, "", url.toString());
    }
  };

  const handleExportCSV = () => {
    if (safeLeads.length === 0) return;
    const headers = ["ID", "Name", "Email", "Company", "Role", "Source", "Intent Score", "Pricing Interacted", "Status", "Created At"];
    const rows = filteredLeads.map((l) => [
      `"${l.id || ""}"`,
      `"${(l.name || "").replace(/"/g, '""')}"`,
      `"${(l.email || "").replace(/"/g, '""')}"`,
      `"${(l.company || "").replace(/"/g, '""')}"`,
      `"${(l.role || "").replace(/"/g, '""')}"`,
      `"${(l.source || "").replace(/"/g, '""')}"`,
      l.intentScore ?? 0,
      l.pricingInteraction ? "Yes" : "No",
      `"${l.status || "new"}"`,
      `"${l.createdAt ? new Date(l.createdAt).toISOString() : ""}"`,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `pod-leads-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header & Pillar 3 Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Demand & Signals</h1>
          <p className="text-sm text-text-secondary">
            Customer interest, traffic attribution, and behavioral telemetry.
          </p>
        </div>

        {/* 3-Tab Pill Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-surface-elevated/70 border border-border">
          <button
            type="button"
            onClick={() => switchTab("leads")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "leads"
                ? "bg-surface text-[var(--dash-text-primary)] shadow-xs border border-border"
                : "text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-primary)]"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Leads CRM ({safeLeads.length})</span>
          </button>
          <button
            type="button"
            onClick={() => switchTab("attribution")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "attribution"
                ? "bg-surface text-[var(--dash-text-primary)] shadow-xs border border-border"
                : "text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-primary)]"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Attribution & Channels</span>
          </button>
          <button
            type="button"
            onClick={() => switchTab("signals")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "signals"
                ? "bg-surface text-[var(--dash-text-primary)] shadow-xs border border-border"
                : "text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-primary)]"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Live Telemetry</span>
          </button>
        </div>
      </div>

      {leadsError && (
        <Card className="border-red/30 bg-red/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red" />
            <p className="text-sm text-red">{leadsError}</p>
            <Button size="sm" variant="secondary" onClick={() => fetchLeads()} className="ml-auto">
              <RefreshCw className="w-3 h-3" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: LEADS CRM */}
      {/* ========================================================================= */}
      {activeTab === "leads" && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Leads", value: safeLeads.length, icon: Users },
              { label: "Pre-Orders ($)", value: safeLeads.filter((l) => l.isPreorder).length, icon: CreditCard },
              { label: "Qualified", value: qualified, icon: Target },
              { label: "Avg Intent", value: `${avgIntent}`, icon: TrendingUp },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <Card key={m.label}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-blue" />
                    </div>
                    <div>
                      <p className="text-xs text-text-tertiary">{m.label}</p>
                      <p className="text-lg font-bold font-mono">{m.value}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search leads..."
                className="w-full h-9 pl-9 pr-3 rounded-md border border-border bg-surface-elevated text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-blue"
              />
            </div>
            <div className="flex gap-1 bg-surface-elevated rounded-lg p-1 overflow-x-auto">
              {[
                { id: "all", label: "All" },
                { id: "preorders", label: `Pre-Orders (${safeLeads.filter((l) => l.isPreorder).length})` },
                { id: "new", label: "New" },
                { id: "contacted", label: "Contacted" },
                { id: "qualified", label: "Qualified" },
                { id: "converted", label: "Converted" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                    statusFilter === tab.id ? "bg-blue text-white" : "text-text-tertiary hover:text-text-secondary"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportCSV}
              disabled={filteredLeads.length === 0}
              className="h-9 gap-1.5 sm:ml-auto text-xs w-full sm:w-auto"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV ({filteredLeads.length})</span>
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>{filteredLeads.length} Captured Prospects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          {["Name", "Company", "Role", "Source", "Intent", "Pricing", "Status"].map((h) => (
                            <th key={h} className="text-left text-xs font-medium text-text-tertiary pb-3 pr-3 whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLeads.map((l) => (
                          <tr
                            key={l.id}
                            className={`border-b border-border/50 cursor-pointer hover:bg-surface-elevated/50 transition-colors ${
                              selected === l.id ? "bg-surface-elevated" : ""
                            }`}
                            onClick={() => setSelected(l.id)}
                          >
                            <td className="py-3 pr-3 text-sm font-medium">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span>{l.name}</span>
                                {l.isPreorder && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                    <CreditCard className="w-2.5 h-2.5" />
                                    ${((l.depositAmount || 100) / 100).toFixed(0)} Pre-Order
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 pr-3 text-sm text-text-secondary">{l.company}</td>
                            <td className="py-3 pr-3 text-sm text-text-secondary">{l.role}</td>
                            <td className="py-3 pr-3"><LeadSourceBadge source={l.source} /></td>
                            <td className="py-3 pr-3"><IntentScore score={l.intentScore} /></td>
                            <td className="py-3 pr-3">
                              {l.pricingInteraction ? <Badge variant="green">Yes</Badge> : <span className="text-xs text-text-tertiary">No</span>}
                            </td>
                            <td className="py-3 pr-3"><LeadStatusBadge status={l.status} /></td>
                          </tr>
                        ))}
                        {filteredLeads.length === 0 && (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-xs text-text-tertiary">
                              No leads captured yet. Run experiments with waitlist/signup CTAs to capture leads.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Selected Lead Inspection Drawer */}
            <div>
              {lead ? (
                <motion.div key={lead.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle>{lead.name}</CardTitle>
                      <p className="text-sm text-text-secondary">{lead.role} at {lead.company}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {lead.isPreorder && (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-1">
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Founding Pre-Order Reservation</span>
                          </div>
                          <p className="text-xs text-slate-300">
                            Deposit: <strong className="text-white">${((lead.depositAmount || 100) / 100).toFixed(2)}</strong>
                          </p>
                          {lead.stripeSessionId && (
                            <p className="text-[11px] font-mono text-slate-400 mt-1 truncate">
                              Ref: {lead.stripeSessionId}
                            </p>
                          )}
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-text-tertiary">Email</p>
                        <p className="text-sm font-mono">{lead.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-tertiary">Traffic Source</p>
                        <div className="mt-1"><LeadSourceBadge source={lead.source} /></div>
                      </div>
                      <div>
                        <p className="text-xs text-text-tertiary">Buying Intent Score</p>
                        <IntentScore score={lead.intentScore} />
                      </div>
                      <div>
                        <p className="text-xs text-text-tertiary">Pricing Interaction</p>
                        <p className="text-sm">{lead.pricingInteraction ? "Viewed pricing tier modal" : "No pricing view recorded"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-tertiary">Status</p>
                        <div className="mt-1"><LeadStatusBadge status={lead.status} /></div>
                      </div>
                      <a href={`mailto:${lead.email}`} className="block">
                        <Button className="w-full" size="sm">Contact Prospect</Button>
                      </a>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-xs text-text-tertiary">
                    Select a prospect from the table to inspect details and attribution.
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ATTRIBUTION & AUDIENCE */}
      {/* ========================================================================= */}
      {activeTab === "attribution" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Tracked Channels", value: "5 Platforms", icon: Globe },
              { label: "Total Reach", value: totalReach.toLocaleString(), icon: Target },
              { label: "Active Segments", value: safeSegments.length, icon: Users },
              { label: "Attribution Precision", value: "100% 1st-Party", icon: TrendingUp },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <Card key={m.label}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-blue" />
                    </div>
                    <div>
                      <p className="text-xs text-text-tertiary">{m.label}</p>
                      <p className="text-lg font-bold font-mono">{m.value}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Audience Segment Reach</CardTitle></CardHeader>
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

            {/* Primary Segment Specs */}
            <Card>
              <CardHeader><CardTitle>Target Persona Blueprint</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {audience ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-text-tertiary flex items-center gap-1"><Target className="w-3 h-3" />Target</p>
                        <p className="text-sm font-medium">{audience.primarySegment}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-tertiary flex items-center gap-1"><Briefcase className="w-3 h-3" />Job Title</p>
                        <p className="text-sm">{audience.jobTitle}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-tertiary flex items-center gap-1"><Building2 className="w-3 h-3" />Industry</p>
                        <p className="text-sm">{audience.industry}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-tertiary flex items-center gap-1"><Users className="w-3 h-3" />Company Size</p>
                        <p className="text-sm">{audience.companySize}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-text-tertiary mb-2">Interests</p>
                      <div className="flex flex-wrap gap-2">
                        {audience.interests?.map((i: string) => <Badge key={i} variant="blue">{i}</Badge>)}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-text-tertiary py-6 text-center">No persona data specified yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LIVE TELEMETRY & SIGNALS */}
      {/* ========================================================================= */}
      {activeTab === "signals" && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader><CardTitle>Behavioral Conversion Funnel</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {safeFunnel.length > 0 ? safeFunnel.map((stage, i) => (
                    <motion.div key={stage.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{stage.label}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono">{stage.count.toLocaleString()}</span>
                          <span className="text-xs text-text-tertiary w-12 text-right">{stage.percentage}%</span>
                          <span className="text-xs font-medium" style={{ color: strengthColors[stage.signalStrength] }}>
                            {strengthLabels[stage.signalStrength]}
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-3 bg-surface-elevated rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: strengthColors[stage.signalStrength] }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(stage.count / maxCount) * 100}%` }}
                          transition={{ delay: 0.2 + i * 0.06, duration: 0.6 }}
                        />
                      </div>
                    </motion.div>
                  )) : (
                    <p className="text-sm text-text-tertiary text-center py-8">
                      No funnel events recorded yet. Send traffic to your smoke test pages.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Willingness-to-Pay Index</span>
                  <Badge variant="blue" className="text-[10px] font-mono">Elasticity</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="p-3 rounded-xl bg-blue/10 border border-blue/20 inline-block mx-auto mb-2">
                    <p className="text-3xl font-black font-mono text-blue">
                      ${surveyAnalytics?.avgAcceptablePrice || 49}
                      <span className="text-xs font-normal text-text-tertiary">/mo</span>
                    </p>
                    <p className="text-[11px] text-text-tertiary">Avg Acceptable Price</p>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-border">
                  <p className="text-xs font-semibold text-text-secondary">Price Sensitivity Curve</p>
                  {surveyAnalytics?.priceElasticity && surveyAnalytics.priceElasticity.length > 0 ? (
                    surveyAnalytics.priceElasticity.map((tier) => (
                      <div key={tier.tier} className="text-xs">
                        <div className="flex justify-between text-text-secondary mb-1">
                          <span className="font-medium text-text-primary">{tier.tier}</span>
                          <span className="font-mono text-text-tertiary">{tier.count} votes ({tier.percentage}%)</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(tier.percentage, 4)}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-text-tertiary space-y-1.5">
                      <p className="flex items-center justify-between">
                        <span>Starter ($19/mo)</span>
                        <span className="font-mono">Pending</span>
                      </p>
                      <p className="flex items-center justify-between">
                        <span>Pro ($49/mo)</span>
                        <span className="font-mono">Pending</span>
                      </p>
                      <p className="flex items-center justify-between">
                        <span>Growth ($99/mo)</span>
                        <span className="font-mono">Pending</span>
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Micro-Survey Problem Discovery & Feedback Stream */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue" />
                    <span>Customer Friction & Bottlenecks</span>
                  </CardTitle>
                  <Badge variant="default" className="text-[10px]">
                    {surveyAnalytics?.totalResponses || 0} Responses
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {surveyAnalytics?.problemDistribution && surveyAnalytics.problemDistribution.length > 0 ? (
                  surveyAnalytics.problemDistribution.map((item, idx) => (
                    <div key={item.label} className="p-3 rounded-xl bg-surface-elevated/60 border border-border">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-text-primary flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue/10 text-blue text-[10px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          {item.label}
                        </span>
                        <span className="text-xs font-mono text-text-secondary">
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue/80 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-8 h-8 text-text-tertiary mx-auto mb-2 opacity-50" />
                    <p className="text-xs text-text-secondary font-medium">No friction responses recorded yet</p>
                    <p className="text-[11px] text-text-tertiary mt-1 max-w-xs mx-auto">
                      When prospects click CTAs on your landing pages, the micro-survey captures their #1 problem before capturing lead info.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Quote className="w-4 h-4 text-emerald-400" />
                  <span>Voice of Customer Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[360px] overflow-auto">
                {surveyAnalytics?.recentResponses && surveyAnalytics.recentResponses.length > 0 ? (
                  surveyAnalytics.recentResponses.map((res) => (
                    <div key={res.id} className="p-3 rounded-xl bg-surface-elevated/70 border border-border text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-text-primary">
                          {res.email ? res.email : "Anonymous Visitor"}
                        </span>
                        <Badge variant="green" className="text-[10px] font-mono">
                          {res.willingPrice || "No price"}
                        </Badge>
                      </div>
                      <p className="text-text-secondary italic">
                        &quot;{res.problem}&quot;
                      </p>
                      {res.customNotes && (
                        <p className="text-[11px] text-text-tertiary">
                          Urgency: <span className="text-text-secondary">{res.customNotes}</span>
                        </p>
                      )}
                      <p className="text-[10px] text-text-tertiary pt-1">
                        {new Date(res.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Quote className="w-8 h-8 text-text-tertiary mx-auto mb-2 opacity-50" />
                    <p className="text-xs text-text-secondary font-medium">Feed waiting for responses</p>
                    <p className="text-[11px] text-text-tertiary mt-1 max-w-xs mx-auto">
                      Qualitative answers and customer quotes will stream here live as visitors engage.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}