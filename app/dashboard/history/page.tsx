"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, AlertCircle, RefreshCw } from "lucide-react";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function HistoryPage() {
  const router = useRouter();
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/history");
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      setHistoryItems(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold">Validation History</h1><p className="text-sm text-text-secondary">Loading history...</p></div>
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Card key={i}><CardContent className="p-5 animate-pulse"><div className="h-6 bg-surface-elevated rounded w-48 mb-2" /><div className="h-4 bg-surface-elevated rounded w-32" /></CardContent></Card>)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Validation History</h1>
        <p className="text-sm text-text-secondary">Your past validation sprints and their outcomes.</p>
      </motion.div>

      {error && (
        <Card className="border-red/30 bg-red/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red" />
            <p className="text-sm text-red">{error}</p>
            <Button size="sm" variant="secondary" onClick={fetchData} className="ml-auto"><RefreshCw className="w-3 h-3" /></Button>
          </CardContent>
        </Card>
      )}

      {historyItems.length > 0 ? (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
          {historyItems.map((h) => (
            <motion.div key={h.id} variants={item}>
              <Card className="hover:border-blue/30 transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/history/${h.id}`)}>
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-surface-elevated flex items-center justify-center"><Calendar className="w-5 h-5 text-text-tertiary" /></div>
                    <div>
                      <h3 className="font-semibold">{h.project}</h3>
                      <p className="text-xs text-text-tertiary">{h.date} &middot; {h.experiments} experiments</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center"><p className="text-xs text-text-tertiary">PoD Score</p><p className="text-lg font-mono font-bold">{h.score}</p></div>
                    <Badge variant={h.status}>{h.verdict}</Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <Card><CardContent className="p-8 text-center"><p className="text-sm text-text-tertiary">No validation history yet.</p></CardContent></Card>
      )}
    </div>
  );
}