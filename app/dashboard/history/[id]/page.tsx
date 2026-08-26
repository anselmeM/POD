"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Lightbulb, FlaskConical } from "lucide-react";
import type { HistoryItem } from "@/lib/types";

const verdictColors: Record<string, string> = {
  green: "border-green/30 bg-green/5",
  blue: "border-blue/30 bg-blue/5",
  amber: "border-amber/30 bg-amber/5",
  red: "border-red/30 bg-red/5",
};

export default function HistoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<HistoryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/history")
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((json) => setItem((json.data as HistoryItem[]).find((h) => h.id === id) ?? null))
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push("/dashboard/history")}><ArrowLeft className="w-4 h-4" />Back to History</Button>
        <Card><CardContent className="p-12 text-center"><p className="text-text-secondary">Loading…</p></CardContent></Card>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push("/dashboard/history")}><ArrowLeft className="w-4 h-4" />Back to History</Button>
        <Card><CardContent className="p-12 text-center"><p className="text-text-secondary">History entry not found.</p></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push("/dashboard/history")}><ArrowLeft className="w-4 h-4" />Back</Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className={`border ${verdictColors[item.status]}`}>
          <CardContent className="p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Badge variant={item.status} className="mb-3">{item.verdict}</Badge>
                <h1 className="text-2xl font-bold">{item.project}</h1>
                <p className="text-sm text-text-tertiary flex items-center gap-1 mt-1"><Calendar className="w-3 h-3" />{item.date} &middot; {item.experiments} experiments</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold font-mono">{item.score}</p>
                <p className="text-xs text-text-tertiary">PoD Score</p>
              </div>
            </div>
            <p className="text-text-secondary">{item.description}</p>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><FlaskConical className="w-4 h-4 text-blue" />Top Experiment</CardTitle></CardHeader>
            <CardContent><p className="text-text-secondary">{item.topExperiment}</p></CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Lightbulb className="w-4 h-4 text-amber" />Key Insight</CardTitle></CardHeader>
            <CardContent><p className="text-text-secondary">{item.keyInsight}</p></CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}