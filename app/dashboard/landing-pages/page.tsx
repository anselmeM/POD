"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Layout, TrendingUp, Clock, MousePointerClick, Eye, MoreVertical, Trash2, Pause, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLandingPageStore } from "@/lib/store";
import type { LandingPageStatus } from "@/lib/types";

const statusMap: Record<string, { variant: "green" | "blue" | "amber" | "default"; label: string }> = {
  live: { variant: "green", label: "Live" },
  draft: { variant: "default", label: "Draft" },
  paused: { variant: "amber", label: "Paused" },
  archived: { variant: "default", label: "Archived" },
};

function StatusBadge({ status }: { status: string }) {
  const s = statusMap[status] || statusMap.draft;
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

const filterTabs: { label: string; value: LandingPageStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Live", value: "live" },
  { label: "Draft", value: "draft" },
  { label: "Paused", value: "paused" },
];

export default function LandingPagesPage() {
  const { landingPages, loading, fetchLandingPages, deleteLandingPage, updateLandingPageStatus } = useLandingPageStore();
  const [filter, setFilter] = useState<LandingPageStatus | "all">("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchLandingPages(); }, [fetchLandingPages]);

  useEffect(() => {
    if (!openMenu) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenu]);

  const filtered = filter === "all" ? landingPages : landingPages.filter((lp) => lp.status === filter);
  const totalVisitors = landingPages.reduce((s, p) => s + p.visitors, 0);
  const totalConversions = landingPages.reduce((s, p) => s + p.conversions, 0);
  const avgBounce = landingPages.length ? Math.round(landingPages.reduce((s, p) => s + p.bounceRate, 0) / landingPages.length) : 0;
  const avgTime = landingPages.length ? Math.round(landingPages.reduce((s, p) => s + p.avgTimeOnPage, 0) / landingPages.length) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Landing Pages</h1><p className="text-sm text-text-secondary">AI-generated landing pages for your validation experiments.</p></div>
        <Link href="/dashboard/landing-pages/new"><Button><Plus className="w-4 h-4" />New Page</Button></Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Visitors", value: totalVisitors.toLocaleString(), icon: Eye },
          { label: "Total Conversions", value: totalConversions.toLocaleString(), icon: MousePointerClick },
          { label: "Avg Bounce Rate", value: `${avgBounce}%`, icon: TrendingUp },
          { label: "Avg Time on Page", value: `${avgTime}s`, icon: Clock },
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {filterTabs.map((tab) => (
          <button key={tab.value} onClick={() => setFilter(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === tab.value ? "bg-blue/10 text-blue border border-blue/30" : "text-text-tertiary hover:text-text-secondary"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Landing Pages Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((page, i) => (
          <motion.div key={page.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="hover:border-blue/30 transition-colors h-full relative group">
              <Link href={`/dashboard/landing-pages/${page.id}`} className="block">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue/10 flex items-center justify-center"><Layout className="w-4 h-4 text-blue" /></div>
                    <StatusBadge status={page.status} />
                  </div>
                  <h3 className="font-semibold mb-1">{page.name}</h3>
                  <p className="text-xs text-text-tertiary mb-1 line-clamp-1">{page.headline}</p>
                  <p className="text-[10px] text-text-tertiary mb-4">Created {page.createdAt}</p>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-surface-elevated rounded-lg p-2.5"><p className="text-[10px] text-text-tertiary mb-0.5">Visitors</p><p className="text-sm font-bold font-mono">{page.visitors.toLocaleString()}</p></div>
                    <div className="bg-surface-elevated rounded-lg p-2.5"><p className="text-[10px] text-text-tertiary mb-0.5">Conversions</p><p className="text-sm font-bold font-mono">{page.conversions}</p></div>
                    <div className="bg-surface-elevated rounded-lg p-2.5"><p className="text-[10px] text-text-tertiary mb-0.5">Bounce Rate</p><p className="text-sm font-bold font-mono">{page.bounceRate}%</p></div>
                    <div className="bg-surface-elevated rounded-lg p-2.5"><p className="text-[10px] text-text-tertiary mb-0.5">Avg Time</p><p className="text-sm font-bold font-mono">{page.avgTimeOnPage}s</p></div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-text-tertiary mb-1"><span>Conversion Rate</span><span>{page.conversionRate}%</span></div>
                    <div className="w-full h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full bg-green" initial={{ width: 0 }} animate={{ width: `${Math.min(page.conversionRate * 10, 100)}%` }} transition={{ duration: 0.6, delay: i * 0.05 }} />
                    </div>
                  </div>
                </CardContent>
              </Link>

              {/* Actions Menu */}
              <div ref={openMenu === page.id ? menuRef : undefined} className="absolute top-3 right-12 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.preventDefault(); setOpenMenu(openMenu === page.id ? null : page.id); }}
                  className="p-1 rounded hover:bg-surface-elevated text-text-tertiary hover:text-text-primary">
                  <MoreVertical className="w-4 h-4" />
                </button>
                {openMenu === page.id && (
                  <div className="absolute right-0 top-8 w-40 bg-surface border border-border rounded-lg shadow-lg z-10 py-1">
                    {page.status === "live" ? (
                      <button onClick={() => { updateLandingPageStatus(page.id, "paused"); setOpenMenu(null); }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-surface-elevated flex items-center gap-2">
                        <Pause className="w-3 h-3" />Pause
                      </button>
                    ) : page.status === "paused" ? (
                      <button onClick={() => { updateLandingPageStatus(page.id, "live"); setOpenMenu(null); }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-surface-elevated flex items-center gap-2">
                        <Play className="w-3 h-3" />Resume
                      </button>
                    ) : null}
                    <button onClick={() => { deleteLandingPage(page.id); setOpenMenu(null); }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-surface-elevated flex items-center gap-2 text-red">
                      <Trash2 className="w-3 h-3" />Delete
                    </button>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Layout className="w-8 h-8 text-text-tertiary mx-auto mb-3" />
          <p className="text-sm text-text-secondary">No landing pages found.</p>
          <Link href="/dashboard/landing-pages/new"><Button variant="secondary" className="mt-3"><Plus className="w-4 h-4 mr-1" />Create your first page</Button></Link>
        </div>
      )}
    </div>
  );
}