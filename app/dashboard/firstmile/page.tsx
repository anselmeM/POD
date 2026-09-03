"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Rocket, CheckCircle2, Plus, ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/types";

const colors: Record<string, "green" | "blue" | "amber" | "red"> = {
  Build: "green",
  Iterate: "blue",
  Pause: "amber",
  Kill: "red",
};

function getRecommendation(score: number): "Build" | "Iterate" | "Pause" | "Kill" {
  if (score >= 75) return "Build";
  if (score >= 50) return "Iterate";
  if (score >= 30) return "Pause";
  return "Kill";
}

export default function FirstMileDevsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((json) => setProjects(json.data || []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">FirstMileDevs Integration</h1>
        <p className="text-sm text-text-secondary">
          Connect validated ideas to the FirstMileDevs studio for rapid prototyping.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Studio Portfolio</CardTitle>
          <Link href="/dashboard/experiments/new">
            <Button size="sm" variant="secondary">
              <Plus className="w-3.5 h-3.5" /> Validate New Idea
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3 py-4 animate-pulse">
              <div className="h-6 bg-surface-elevated rounded w-1/2" />
              <div className="h-12 bg-surface-elevated rounded" />
              <div className="h-12 bg-surface-elevated rounded" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-sm text-text-tertiary">No projects in your validation portfolio yet.</p>
              <Link href="/dashboard/experiments/new">
                <Button size="sm">Create First Experiment</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {["Project", "PoD Score", "Confidence", "Stage", "Recommendation", "Actions"].map((h) => (
                      <th key={h} className="text-left text-xs font-medium text-text-tertiary pb-3 pr-4">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => {
                    const rec = getRecommendation(p.podScore);
                    return (
                      <tr key={p.id} className="border-b border-border/50 hover:bg-surface-elevated/50 transition-colors">
                        <td className="py-3 pr-4 text-sm font-medium text-text-primary">{p.name}</td>
                        <td className="py-3 pr-4 text-sm font-mono">{p.podScore}</td>
                        <td className="py-3 pr-4 text-sm font-mono">{p.confidence}%</td>
                        <td className="py-3 pr-4">
                          <Badge variant="default" className="capitalize">
                            {p.status}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant={colors[rec]}>{rec}</Badge>
                        </td>
                        <td className="py-3 pr-4">
                          <Link href="/dashboard/reports" className="text-xs text-blue hover:underline flex items-center gap-1">
                            Report <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-8 text-center">
          {connected ? (
            <>
              <CheckCircle2 className="w-12 h-12 text-green mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Connected!</h3>
              <p className="text-sm text-text-secondary">
                Your validated concepts have been sent to FirstMileDevs Studio.
              </p>
            </>
          ) : (
            <>
              <Rocket className="w-12 h-12 text-blue mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Ready to Build?</h3>
              <p className="text-sm text-text-secondary mb-4">
                Send your validated concepts directly to FirstMileDevs for rapid prototyping.
              </p>
              <Button onClick={() => setConnected(true)}>Connect to FirstMileDevs Studio</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}