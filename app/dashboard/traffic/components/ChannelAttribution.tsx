"use client";

import React from "react";
import { Calculator, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ChannelAttribution as ChannelAttributionType } from "@/lib/types";

interface ChannelAttributionProps {
  attribution: ChannelAttributionType[];
  attributionLoading: boolean;
  totalVisitors: number;
  totalLeads: number;
  topChannel: string;
  targetVisitors: number;
  setTargetVisitors: (n: number) => void;
  estimatedCpc: number;
  setEstimatedCpc: (n: number) => void;
  expectedCvr: number;
  setExpectedCvr: (n: number) => void;
  calculatedBudget: {
    totalCost: number;
    projectedLeads: number;
    costPerLead: number;
  };
}

export function ChannelAttribution({
  attribution,
  attributionLoading,
  totalVisitors,
  totalLeads,
  topChannel,
  targetVisitors,
  setTargetVisitors,
  estimatedCpc,
  setEstimatedCpc,
  expectedCvr,
  setExpectedCvr,
  calculatedBudget,
}: ChannelAttributionProps) {
  return (
    <div className="space-y-6">
      {/* Spotlight Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue/15 to-emerald-500/10 border border-blue/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🏆</span>
            <h3 className="text-base font-bold text-text-primary">
              Top Converting Channel: {topChannel}
            </h3>
          </div>
          <p className="text-xs text-text-secondary">
            Delivers the highest intent-to-lead conversion rate among your tested acquisition sources.
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-text-tertiary">Tracked Visitors</p>
            <p className="text-xl font-bold font-mono">{totalVisitors.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-text-tertiary">Verified Leads</p>
            <p className="text-xl font-bold font-mono text-emerald-400">
              {totalLeads.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Attribution Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Multi-Channel Conversion Performance</CardTitle>
              {attributionLoading && (
                <span className="text-xs text-text-tertiary animate-pulse">Syncing...</span>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-elevated/50 border-b border-border text-text-tertiary font-medium">
                    <tr>
                      <th className="py-3 px-4">Channel Source</th>
                      <th className="py-3 px-4">Visitors</th>
                      <th className="py-3 px-4">Leads</th>
                      <th className="py-3 px-4">Pre-Orders</th>
                      <th className="py-3 px-4">CVR (%)</th>
                      <th className="py-3 px-4">Est. Cost/Lead</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {attribution.map((ch) => (
                      <tr key={ch.source} className={ch.isWinner ? "bg-emerald-500/5" : ""}>
                        <td className="py-3.5 px-4 font-medium text-text-primary flex items-center gap-2">
                          {ch.isWinner && (
                            <Badge variant="green" className="text-[9px] py-0 px-1.5">
                              Winner
                            </Badge>
                          )}
                          <span>{ch.channel}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono">{ch.visitors}</td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-text-primary">
                          {ch.leads}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-emerald-400">
                          {ch.preorders}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold">
                          {ch.conversionRate}%
                        </td>
                        <td className="py-3.5 px-4 font-mono text-text-tertiary">
                          {ch.costPerLead ? `$${ch.costPerLead.toFixed(2)}` : "—"}
                        </td>
                      </tr>
                    ))}
                    {attribution.length === 0 && !attributionLoading && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-text-tertiary">
                          No attribution data recorded yet. Share your tracked links to see incoming ad traffic!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Validation Budget & CPC Calculator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Calculator className="w-4 h-4 text-blue" />
              <span>Validation Budget Calculator</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-text-secondary">Target Sample Size</span>
                <strong className="text-text-primary font-mono">{targetVisitors} visitors</strong>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="50"
                value={targetVisitors}
                onChange={(e) => setTargetVisitors(Number(e.target.value))}
                className="w-full accent-blue cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-text-secondary">Estimated CPC ($)</span>
                <strong className="text-text-primary font-mono">${estimatedCpc.toFixed(2)}</strong>
              </div>
              <input
                type="range"
                min="0.5"
                max="10.0"
                step="0.1"
                value={estimatedCpc}
                onChange={(e) => setEstimatedCpc(Number(e.target.value))}
                className="w-full accent-blue cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-text-tertiary pt-1">
                <span>Meta: ~$1.20</span>
                <span>Google: ~$2.80</span>
                <span>LinkedIn: ~$4.80</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-text-secondary">Target Conversion Rate</span>
                <strong className="text-text-primary font-mono">{expectedCvr}%</strong>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="0.5"
                value={expectedCvr}
                onChange={(e) => setExpectedCvr(Number(e.target.value))}
                className="w-full accent-blue cursor-pointer"
              />
            </div>

            {/* Calculation Output Box */}
            <div className="p-4 rounded-xl bg-surface-elevated border border-border space-y-3 pt-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-secondary">Required Ad Spend:</span>
                <span className="text-xl font-bold font-mono text-blue">
                  ${calculatedBudget.totalCost}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-border pt-2">
                <span className="text-text-secondary">Projected Leads:</span>
                <span className="font-bold font-mono text-emerald-400">
                  {calculatedBudget.projectedLeads} leads
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-border pt-2">
                <span className="text-text-secondary">Projected Cost / Lead:</span>
                <span className="font-mono text-text-primary">
                  ${calculatedBudget.costPerLead}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
