"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface Log { id: string; action: string; entityType: string; entityId: string | null; detail: string; createdAt: string; }

export default function ActivityPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [filter, setFilter] = useState("");
  useEffect(() => {
    const q = filter ? `?type=${filter}` : "";
    fetch(`/api/activity${q}`)
      .then((r) => r.ok ? r.json() : { data: [] })
      .then((j) => setLogs(Array.isArray(j.data) ? j.data : []))
      .catch(() => setLogs([]));
  }, [filter]);

  const safeLogs = Array.isArray(logs) ? logs : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/history"><Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div><h1 className="text-2xl font-bold">Activity Log</h1><p className="text-sm text-text-secondary">All user actions — filterable timeline</p></div>
      </div>
      <div className="flex gap-2">
        {["", "Experiment", "Lead", "LandingPage"].map((t) => (
          <button key={t || "all"} onClick={() => setFilter(t)} className={`px-3 py-1.5 rounded-full text-xs font-medium border ${filter === t ? "bg-blue text-white border-blue" : "bg-surface border-border text-text-secondary"}`}>{t || "All"}</button>
        ))}
      </div>
      <div className="space-y-2">
        {safeLogs.length === 0 ? <Card><CardContent className="p-8 text-center text-sm text-text-tertiary">No activity yet.</CardContent></Card> : safeLogs.map((log) => (
          <Card key={log.id}><CardContent className="p-4 flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue/10 flex items-center justify-center shrink-0"><Activity className="w-4 h-4 text-blue" /></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{log.action} <span className="text-text-tertiary">· {log.entityType}</span></p>
              <p className="text-xs text-text-secondary truncate">{log.detail}</p>
              <p className="text-[10px] text-text-tertiary">{new Date(log.createdAt).toLocaleString()}</p>
            </div>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}
