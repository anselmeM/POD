"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, ArrowUpRight, Sparkles, Filter, Download, Plus,
  CreditCard, Target, TrendingUp, AlertTriangle, CheckCircle2,
  XCircle, Clock, ShieldCheck, ExternalLink, HelpCircle, FileText,
  DollarSign, RefreshCw, X, MessageSquare, Megaphone
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StudioConcept, PortfolioSummary, StageGateVerdict } from "@/lib/types";

const verdictBadgeColors: Record<StageGateVerdict, "green" | "blue" | "red" | "amber"> = {
  BUILD: "green",
  ITERATE: "blue",
  KILL: "red",
  TESTING: "amber",
};

export default function StudioPortfolioPage() {
  const [concepts, setConcepts] = useState<StudioConcept[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterVerdict, setFilterVerdict] = useState<"ALL" | StageGateVerdict>("ALL");
  const [selectedConcept, setSelectedConcept] = useState<StudioConcept | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  // Override modal state
  const [overrideVerdict, setOverrideVerdict] = useState<StageGateVerdict>("BUILD");
  const [partnerNotes, setPartnerNotes] = useState("");
  const [savingOverride, setSavingOverride] = useState(false);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/studio/portfolio");
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setConcepts(json.data.concepts || []);
          setSummary(json.data.summary || null);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch portfolio:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const filteredConcepts = useMemo(() => {
    if (filterVerdict === "ALL") return concepts;
    return concepts.filter((c) => c.verdict === filterVerdict);
  }, [concepts, filterVerdict]);

  const handleSaveOverride = async () => {
    if (!selectedConcept) return;
    setSavingOverride(true);
    try {
      const res = await fetch(`/api/studio/portfolio/${selectedConcept.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verdict: overrideVerdict,
          partnerNotes,
        }),
      });
      if (res.ok) {
        setConcepts((prev) =>
          prev.map((c) =>
            c.id === selectedConcept.id
              ? {
                  ...c,
                  verdict: overrideVerdict,
                  verdictReason: `Manually updated by Partner: "${partnerNotes || overrideVerdict}"`,
                  partnerNotes,
                }
              : c
          )
        );
        setSelectedConcept((prev) =>
          prev
            ? {
                ...prev,
                verdict: overrideVerdict,
                verdictReason: `Manually updated by Partner: "${partnerNotes || overrideVerdict}"`,
                partnerNotes,
              }
            : null
        );
      }
    } catch (e) {
      console.error("Failed to update verdict:", e);
    } finally {
      setSavingOverride(false);
    }
  };

  const handleExportCSV = () => {
    if (concepts.length === 0) return;
    const headers = [
      "Rank",
      "Concept Name",
      "PoD Score",
      "Stage-Gate Verdict",
      "Conversion Rate (CVR %)",
      "Paid Intent Rate (PIR %)",
      "Total Visitors",
      "Total Leads",
      "Pre-Orders Placed",
      "Estimated Capital Saved ($)",
      "Decision Rationale",
    ];

    const rows = concepts.map((c, idx) => [
      idx + 1,
      `"${c.name.replace(/"/g, '""')}"`,
      c.podScore,
      c.verdict,
      `${c.cvr}%`,
      `${c.pir}%`,
      c.visitors,
      c.leads,
      c.preorders,
      c.capitalSaved,
      `"${c.verdictReason.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PoD_Studio_Portfolio_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = async () => {
    setExportingPdf(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "landscape" });

      // Document Header
      doc.setFontSize(18);
      doc.setTextColor(20, 20, 25);
      doc.text("Proof of Demand — Executive Studio Portfolio Report", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 110);
      doc.text(
        `Generated: ${new Date().toLocaleDateString()}  •  Total Concepts: ${summary?.totalConcepts || 0}  •  Capital Preserved: $${(
          summary?.totalCapitalSaved || 0
        ).toLocaleString()}  •  Greenlit for Build: ${summary?.greenlitCount || 0}`,
        14,
        28
      );

      // Table Header
      let y = 42;
      doc.setFillColor(240, 243, 248);
      doc.rect(14, y - 6, 268, 8, "F");
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 60);
      doc.setFont("helvetica", "bold");
      doc.text("Rank", 16, y);
      doc.text("Concept Name", 30, y);
      doc.text("PoD Score", 105, y);
      doc.text("CVR (%)", 130, y);
      doc.text("Paid Intent (PIR)", 155, y);
      doc.text("Visitors", 190, y);
      doc.text("Verdict", 215, y);
      doc.text("Capital Saved", 245, y);

      // Rows
      doc.setFont("helvetica", "normal");
      y += 8;
      for (let i = 0; i < concepts.length; i++) {
        const c = concepts[i];
        if (y > 185) {
          doc.addPage();
          y = 20;
        }

        doc.text(String(i + 1), 16, y);
        doc.text(c.name.slice(0, 34), 30, y);
        doc.text(`${c.podScore}/100`, 105, y);
        doc.text(`${c.cvr}%`, 130, y);
        doc.text(`${c.pir}% (${c.preorders})`, 155, y);
        doc.text(String(c.visitors), 190, y);
        doc.text(c.verdict, 215, y);
        doc.text(c.capitalSaved > 0 ? `$${c.capitalSaved.toLocaleString()}` : "—", 245, y);

        y += 8;
      }

      doc.save(`PoD_Executive_Portfolio_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              Startup Studio Portfolio & Idea Leaderboard
            </h1>
            <Badge variant="green" className="text-[10px] font-mono">
              Stage-Gate Matrix
            </Badge>
          </div>
          <p className="text-sm text-text-secondary">
            Comparative validation command center ranking all portfolio concepts by PoD Score, CVR, and Paid Intent.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportPDF}
            disabled={exportingPdf}
            className="flex items-center gap-1.5 text-xs"
          >
            <FileText className="w-3.5 h-3.5 text-blue" />
            <span>{exportingPdf ? "Generating PDF..." : "Executive PDF Report"}</span>
          </Button>

          <Link href="/dashboard/experiments/new/ai-wizard">
            <Button size="sm" className="bg-blue hover:bg-blue/90 text-white flex items-center gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" />
              <span>Validate New Concept</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Executive Metric Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue/10 flex items-center justify-center flex-shrink-0">
              <Trophy className="w-5 h-5 text-blue" />
            </div>
            <div>
              <p className="text-xs text-text-tertiary">Portfolio PoD Avg</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-mono text-text-primary">
                  {summary?.avgPodScore || 0}
                </span>
                <span className="text-xs text-text-tertiary">/ 100</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-text-tertiary">Greenlit for MVP</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-mono text-emerald-400">
                  {summary?.greenlitCount || 0}
                </span>
                <span className="text-xs text-text-tertiary">
                  / {summary?.totalConcepts || 0} concepts
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-text-tertiary">Paid Intent Rate (PIR)</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-mono text-text-primary">
                  {summary?.avgPir || 0}%
                </span>
                <span className="text-xs text-text-tertiary">avg reservation</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green/10 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-green" />
            </div>
            <div>
              <p className="text-xs text-text-tertiary">Capital Preserved</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-mono text-green">
                  ${((summary?.totalCapitalSaved || 0) / 1000).toFixed(0)}k
                </span>
                <span className="text-[11px] text-text-tertiary">saved</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stage-Gate Filter Bar */}
      <div className="flex items-center justify-between gap-3 bg-surface-elevated/60 p-3 rounded-2xl border border-border">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-text-tertiary mr-1 font-medium">Stage-Gate Verdict:</span>
          {(["ALL", "BUILD", "ITERATE", "KILL", "TESTING"] as const).map((v) => {
            const count =
              v === "ALL"
                ? concepts.length
                : concepts.filter((c) => c.verdict === v).length;
            return (
              <button
                key={v}
                onClick={() => setFilterVerdict(v)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filterVerdict === v
                    ? "bg-blue text-white shadow-sm"
                    : "bg-surface border border-border text-text-secondary hover:text-text-primary"
                }`}
              >
                <span>{v === "ALL" ? "All Concepts" : v}</span>
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              </button>
            );
          })}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchPortfolio}
          disabled={loading}
          className="text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Comparative Leaderboard Table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-elevated/60 border-b border-border text-text-tertiary font-medium">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Concept & Positioning</th>
                  <th className="py-3 px-4 text-center">PoD Score</th>
                  <th className="py-3 px-4 text-center">CVR (%)</th>
                  <th className="py-3 px-4 text-center">Paid Intent (PIR)</th>
                  <th className="py-3 px-4 text-center">Views / Leads</th>
                  <th className="py-3 px-4">Stage-Gate Verdict</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredConcepts.map((c, idx) => {
                  const isGold = idx === 0 && c.podScore >= 75;
                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-surface-elevated/40 transition-colors ${
                        isGold ? "bg-amber-500/5" : ""
                      }`}
                    >
                      <td className="py-4 px-4 text-center font-mono font-bold text-text-tertiary">
                        {idx + 1}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-text-primary">
                              {c.name}
                            </span>
                            {c.preorders > 0 && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <CreditCard className="w-3 h-3" /> {c.preorders} Backers
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-text-secondary mt-0.5">
                            Angle: {c.topVariant || "Primary Value Prop"}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <span
                            className={`font-black font-mono text-base ${
                              c.podScore >= 75
                                ? "text-green"
                                : c.podScore >= 50
                                ? "text-blue"
                                : "text-amber"
                            }`}
                          >
                            {c.podScore}
                          </span>
                          <span className="text-[10px] text-text-tertiary font-mono">/100</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center font-mono font-semibold text-text-primary">
                        {c.cvr}%
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span
                          className={`font-mono font-bold ${
                            c.pir >= 2 ? "text-emerald-400" : "text-text-secondary"
                          }`}
                        >
                          {c.pir}%
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center font-mono text-text-tertiary">
                        <span>{c.visitors}</span> /{" "}
                        <span className="text-text-primary font-semibold">{c.leads}</span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Badge variant={verdictBadgeColors[c.verdict]} className="font-bold">
                            {c.verdict}
                          </Badge>
                          <span className="text-[11px] text-text-secondary line-clamp-1 max-w-[200px]" title={c.verdictReason}>
                            {c.verdictReason}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedConcept(c);
                              setOverrideVerdict(c.verdict);
                              setPartnerNotes(c.partnerNotes || "");
                            }}
                            className="text-xs h-7 px-2.5 cursor-pointer"
                          >
                            Inspect
                          </Button>

                          <Link href={`/p/${c.slug}`} target="_blank">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-text-tertiary hover:text-white" title="View Public Smoke Page">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick-Inspect Side Drawer Modal */}
      <AnimatePresence>
        {selectedConcept && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedConcept(null)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-2xl z-10 space-y-6"
            >
              <button
                onClick={() => setSelectedConcept(null)}
                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={verdictBadgeColors[selectedConcept.verdict]}>
                    {selectedConcept.verdict}
                  </Badge>
                  <span className="text-xs text-slate-400 font-mono">
                    Score: {selectedConcept.podScore}/100
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white">{selectedConcept.name}</h2>
                <p className="text-xs text-slate-300 mt-1">
                  Target Positioning: <span className="text-white font-medium">{selectedConcept.topVariant}</span>
                </p>
              </div>

              {/* Rationale Box */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Stage-Gate Validation Analysis
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {selectedConcept.verdictReason}
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                  <p className="text-[10px] text-slate-400">Visitors</p>
                  <p className="text-lg font-bold font-mono text-white mt-0.5">
                    {selectedConcept.visitors}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                  <p className="text-[10px] text-slate-400">CVR</p>
                  <p className="text-lg font-bold font-mono text-white mt-0.5">
                    {selectedConcept.cvr}%
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                  <p className="text-[10px] text-slate-400">Pre-Orders</p>
                  <p className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                    {selectedConcept.preorders}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                  <p className="text-[10px] text-slate-400">Capital Saved</p>
                  <p className="text-lg font-bold font-mono text-green mt-0.5">
                    {selectedConcept.capitalSaved > 0
                      ? `$${(selectedConcept.capitalSaved / 1000).toFixed(0)}k`
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Partner Override Selector */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/80 space-y-3">
                <label className="block text-xs font-semibold text-slate-300">
                  Partner Stage-Gate Override
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["BUILD", "ITERATE", "KILL", "TESTING"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setOverrideVerdict(v)}
                      className={`py-2 px-2 text-xs rounded-lg font-bold border transition-all cursor-pointer text-center ${
                        overrideVerdict === v
                          ? "bg-blue border-blue text-white"
                          : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Investment Committee / Partner Notes
                  </label>
                  <textarea
                    rows={2}
                    value={partnerNotes}
                    onChange={(e) => setPartnerNotes(e.target.value)}
                    placeholder="Enter strategic rationale or customer interview notes..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedConcept(null)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveOverride}
                    disabled={savingOverride}
                    className="bg-blue hover:bg-blue/90 text-white text-xs cursor-pointer"
                  >
                    {savingOverride ? "Saving..." : "Save Verdict Override"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
