"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import type { FunnelStage } from "@/lib/types";

const strengthColors: Record<string, string> = {
  none: "var(--text-tertiary)", weak: "var(--red)", moderate: "var(--amber)", strong: "var(--blue)", very_strong: "var(--green)",
};
const strengthLabels: Record<string, string> = {
  none: "None", weak: "Weak", moderate: "Moderate", strong: "Strong", very_strong: "Very Strong",
};

export const dynamic = "force-dynamic";

export default function SignalsPage() {
  const [funnel, setFunnel] = useState<FunnelStage[]>([]);
  const [signalEvents, setSignalEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [funnelRes, signalsRes] = await Promise.all([
        fetch("/api/funnel"),
        fetch("/api/signals"),
      ]);
      if (funnelRes.ok) {
        const funnelJson = await funnelRes.json();
        const raw = funnelJson.data;
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.stages)
          ? raw.stages
          : [];
        setFunnel(list);
      }
      if (signalsRes.ok) {
        const data = await signalsRes.json();
        setSignalEvents(Array.isArray(data.data) ? data.data : []);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const safeFunnel = Array.isArray(funnel) ? funnel : [];
  const safeSignalEvents = Array.isArray(signalEvents) ? signalEvents : [];
  const maxCount = safeFunnel.length > 0 ? Math.max(...safeFunnel.map((s) => s?.count || 0), 1) : 1;

  if (loading) {
    return (
      <div className="space-y-8">
        <div><h1 className="text-2xl font-bold">Behavioral Signals</h1><p className="text-sm text-text-secondary">Loading signal data...</p></div>
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2"><CardContent className="p-6 animate-pulse"><div className="h-64 bg-surface-elevated rounded" /></CardContent></Card>
          <Card><CardContent className="p-6 animate-pulse"><div className="h-64 bg-surface-elevated rounded" /></CardContent></Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Behavioral Signals</h1>
        <p className="text-sm text-text-secondary">Track how visitors progress through your validation funnel.</p>
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

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Conversion Funnel</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {safeFunnel.length > 0 ? safeFunnel.map((stage, i) => (
                <motion.div key={stage.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{stage.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono">{stage.count.toLocaleString()}</span>
                      <span className="text-xs text-text-tertiary w-12 text-right">{stage.percentage}%</span>
                      <span className="text-xs font-medium" style={{ color: strengthColors[stage.signalStrength] }}>{strengthLabels[stage.signalStrength]}</span>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-surface-elevated rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ backgroundColor: strengthColors[stage.signalStrength] }} initial={{ width: 0 }} animate={{ width: `${(stage.count / maxCount) * 100}%` }} transition={{ delay: 0.2 + i * 0.06, duration: 0.6 }} />
                  </div>
                </motion.div>
              )) : <p className="text-sm text-text-tertiary text-center py-8">No funnel data yet. Run an experiment to see signals.</p>}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Willingness to Pay</CardTitle></CardHeader>
            <CardContent>
              {(() => {
                const landingStage = safeFunnel.find((s) => s.label === "Landing Page");
                const pricingStage = safeFunnel.find((s) => s.label === "Pricing View");
                const checkoutStage = safeFunnel.find((s) => s.label === "Checkout");
                const ctaStage = safeFunnel.find((s) => s.label === "CTA Click");

                const totalVisitors = landingStage?.count || 0;
                const pricingViews = pricingStage?.count || 0;
                const checkouts = checkoutStage?.count || 0;
                const ctaClicks = ctaStage?.count || 0;

                const wtpScore = totalVisitors > 0
                  ? Math.min(100, Math.round(((pricingViews * 2 + checkouts * 4) / totalVisitors) * 100))
                  : 0;

                const engagementSignals = [
                  { label: "Pricing page engagement", s: pricingViews > 10 ? "strong" : pricingViews > 0 ? "moderate" : "weak" },
                  { label: "Checkout initiation", s: checkouts > 5 ? "strong" : checkouts > 0 ? "moderate" : "weak" },
                  { label: "Call-to-action click", s: ctaClicks > 10 ? "strong" : ctaClicks > 0 ? "moderate" : "weak" },
                  { label: "Visitor interest", s: totalVisitors > 50 ? "strong" : totalVisitors > 0 ? "moderate" : "weak" },
                ];

                return (
                  <>
                    <div className="text-center mb-4">
                      <p className="text-5xl font-bold font-mono text-blue">{wtpScore}</p>
                      <p className="text-sm text-text-tertiary">/ 100</p>
                    </div>
                    <div className="space-y-2 text-sm">
                      {engagementSignals.map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                          <span className="text-text-secondary">{item.label}</span>
                          <Badge variant={item.s === "strong" ? "green" : item.s === "moderate" ? "amber" : "default"}>
                            {item.s}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
              <div className="mt-4 pt-4 border-t border-border">
                <Link href="/dashboard/experiments/new">
                  <Button className="w-full" size="sm">Run Pricing Experiment</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>PoD Score Breakdown</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {(() => {
                const landingStage = safeFunnel.find((s) => s.label === "Landing Page");
                const pricingStage = safeFunnel.find((s) => s.label === "Pricing View");
                const checkoutStage = safeFunnel.find((s) => s.label === "Checkout");
                const ctaStage = safeFunnel.find((s) => s.label === "CTA Click");

                const totalVisitors = landingStage?.count || 0;
                const pricingViews = pricingStage?.count || 0;
                const checkouts = checkoutStage?.count || 0;
                const ctaClicks = ctaStage?.count || 0;

                const breakdown = [
                  { label: "Problem Strength", v: totalVisitors > 0 ? Math.min(100, Math.round((ctaClicks / totalVisitors) * 100)) : 0 },
                  { label: "Audience Fit", v: totalVisitors > 0 ? Math.min(100, Math.round((pricingViews / totalVisitors) * 100)) : 0 },
                  { label: "Message Resonance", v: totalVisitors > 0 ? Math.min(100, Math.round((ctaClicks / totalVisitors) * 90)) : 0 },
                  { label: "Behavioral Intent", v: totalVisitors > 0 ? Math.min(100, Math.round((checkouts / totalVisitors) * 100)) : 0 },
                ];

                return breakdown.map((s) => (
                  <div key={s.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-text-secondary">{s.label}</span>
                      <span className="text-xs font-mono font-semibold">{s.v}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-blue transition-all" style={{ width: `${s.v}%` }} />
                    </div>
                  </div>
                ));
              })()}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Signal Events Log */}
      <Card>
        <CardHeader><CardTitle>Recent Signal Events</CardTitle></CardHeader>
        <CardContent>
          {safeSignalEvents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-border">{["Event", "Type", "Visitor", "Timestamp", "Value"].map((h) => (<th key={h} className="text-left text-xs font-medium text-text-tertiary pb-3 pr-4">{h}</th>))}</tr></thead>
                <tbody>
                  {safeSignalEvents.slice(0, 8).map((evt: any) => (
                    <tr key={evt.id} className="border-b border-border/50 hover:bg-surface-elevated/50 transition-colors">
                      <td className="py-2.5 pr-4 text-sm">{evt.eventType}</td>
                      <td className="py-2.5 pr-4"><Badge variant="default">{evt.eventType}</Badge></td>
                      <td className="py-2.5 pr-4 text-xs font-mono text-text-tertiary">{evt.visitorId}</td>
                      <td className="py-2.5 pr-4 text-xs text-text-tertiary">{evt.timestamp}</td>
                      <td className="py-2.5 pr-4 text-sm">{evt.metadata && Object.keys(evt.metadata).length > 0 ? JSON.stringify(evt.metadata) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-text-tertiary text-center py-8">No signal events yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}