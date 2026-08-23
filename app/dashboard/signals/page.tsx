"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { demoFunnel, demoPoDScore, demoSignalEvents } from "@/lib/mock-data";
import Link from "next/link";

const strengthColors: Record<string, string> = {
  none: "var(--text-tertiary)", weak: "var(--red)", moderate: "var(--amber)", strong: "var(--blue)", very_strong: "var(--green)",
};
const strengthLabels: Record<string, string> = {
  none: "None", weak: "Weak", moderate: "Moderate", strong: "Strong", very_strong: "Very Strong",
};

export default function SignalsPage() {
  const maxCount = Math.max(...demoFunnel.map((s) => s.count));
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Behavioral Signals</h1>
        <p className="text-sm text-text-secondary">Track how visitors progress through your validation funnel.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Conversion Funnel</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {demoFunnel.map((stage, i) => (
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
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Willingness to Pay</CardTitle></CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <p className="text-5xl font-bold font-mono text-blue">72</p>
                <p className="text-sm text-text-tertiary">/ 100</p>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  { label: "Pricing page engagement", s: "strong" },
                  { label: "Price comparison", s: "strong" },
                  { label: "Checkout initiation", s: "moderate" },
                  { label: "Email signup", s: "weak" },
                  { label: "Demo requests", s: "strong" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-text-secondary">{item.label}</span>
                    <Badge variant={item.s === "strong" ? "green" : item.s === "moderate" ? "amber" : "red"}>{item.s}</Badge>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <Link href="/dashboard/experiments/new"><Button className="w-full" size="sm">Run Pricing Experiment</Button></Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>PoD Score Breakdown</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Problem Strength", v: demoPoDScore.problemStrength },
                { label: "Audience Fit", v: demoPoDScore.audienceFit },
                { label: "Message Resonance", v: demoPoDScore.messageResonance },
                { label: "Behavioral Intent", v: demoPoDScore.behavioralIntent },
                { label: "Willingness to Pay", v: demoPoDScore.willingnessToPay },
                { label: "Acquisition Efficiency", v: demoPoDScore.acquisitionEfficiency },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-text-secondary">{s.label}</span>
                    <span className="text-xs font-mono font-semibold">{s.v}</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-blue" style={{ width: `${s.v}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Signal Events Log */}
      <Card>
        <CardHeader><CardTitle>Recent Signal Events</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-border">{["Event", "Type", "Visitor", "Timestamp", "Value"].map((h) => (<th key={h} className="text-left text-xs font-medium text-text-tertiary pb-3 pr-4">{h}</th>))}</tr></thead>
              <tbody>
                {demoSignalEvents.slice(0, 8).map((evt) => (
                  <tr key={evt.id} className="border-b border-border/50 hover:bg-surface-elevated/50 transition-colors">
                    <td className="py-2.5 pr-4 text-sm">{evt.eventType}</td>
                    <td className="py-2.5 pr-4"><Badge variant="default">{evt.eventType}</Badge></td>
                    <td className="py-2.5 pr-4 text-xs font-mono text-text-tertiary">{evt.visitorId}</td>
                    <td className="py-2.5 pr-4 text-xs text-text-tertiary">{evt.timestamp}</td>
                    <td className="py-2.5 pr-4 text-sm">{evt.metadata}</td>
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