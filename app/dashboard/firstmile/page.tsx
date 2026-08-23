"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Rocket, CheckCircle2 } from "lucide-react";
import { demoStudioPortfolio } from "@/lib/mock-data";

const colors: Record<string, "green" | "blue" | "amber" | "red"> = {
  Build: "green", Iterate: "blue", Pause: "amber", Kill: "red",
};

export default function FirstMileDevsPage() {
  const [connected, setConnected] = useState(false);
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">FirstMileDevs Integration</h1><p className="text-sm text-text-secondary">Connect validated ideas to the FirstMileDevs studio for rapid prototyping.</p></div>
      <Card>
        <CardHeader><CardTitle>Studio Portfolio</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-border">{["Project", "PoD Score", "Confidence", "Stage", "Recommendation"].map((h) => <th key={h} className="text-left text-xs font-medium text-text-tertiary pb-3 pr-4">{h}</th>)}</tr></thead>
              <tbody>
                {demoStudioPortfolio.map((p) => (
                  <tr key={p.name} className="border-b border-border/50 hover:bg-surface-elevated/50">
                    <td className="py-3 pr-4 text-sm font-medium">{p.name}</td>
                    <td className="py-3 pr-4 text-sm font-mono">{p.podScore}</td>
                    <td className="py-3 pr-4 text-sm font-mono">{p.confidence}%</td>
                    <td className="py-3 pr-4"><Badge variant="default">{p.stage}</Badge></td>
                    <td className="py-3 pr-4"><Badge variant={colors[p.recommendation]}>{p.recommendation}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-8 text-center">
          {connected ? (
            <>
              <CheckCircle2 className="w-12 h-12 text-green mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Connected!</h3>
              <p className="text-sm text-text-secondary">Your validated concepts have been sent to FirstMileDevs Studio.</p>
            </>
          ) : (
            <>
              <Rocket className="w-12 h-12 text-blue mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Ready to Build?</h3>
              <p className="text-sm text-text-secondary mb-4">Send your validated concepts directly to FirstMileDevs for rapid prototyping.</p>
              <Button onClick={() => setConnected(true)}>Connect to FirstMileDevs Studio</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}