"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Experiment } from "@/lib/types";

export default function ComparePage() {
  const params = useSearchParams();
  const ids = (params.get("ids") || "").split(",").filter(Boolean).slice(0, 3);
  const [exps, setExps] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) { setLoading(false); return; }
    Promise.all(ids.map((id) => fetch(`/api/experiments/${id}`).then((r) => r.ok ? r.json() : null).then((j) => j?.data || null)))
      .then((list) => setExps(list.filter(Boolean) as Experiment[]))
      .finally(() => setLoading(false));
  }, [params]);

  if (loading) return <div className="p-8 text-center text-sm text-text-tertiary">Loading comparison…</div>;
  if (ids.length < 2) return <div className="space-y-4"><Link href="/dashboard/experiments"><Button variant="ghost"><ArrowLeft className="w-4 h-4" /> Back</Button></Link><p className="text-sm text-text-tertiary">Select 2–3 experiments to compare. Add ?ids=exp1,exp2 to URL.</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/experiments"><Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <h1 className="text-2xl font-bold">Compare Experiments</h1>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exps.map((exp) => (
          <Card key={exp.id}>
            <CardHeader><CardTitle className="text-base truncate">{exp.name}</CardTitle><Badge variant="default">{exp.status}</Badge></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-text-tertiary">Traffic</p><p className="font-mono font-bold">{exp.traffic}</p></div>
                <div><p className="text-xs text-text-tertiary">CVR</p><p className="font-mono font-bold">{exp.conversionRate}%</p></div>
                <div><p className="text-xs text-text-tertiary">Conversions</p><p className="font-mono">{exp.conversions}</p></div>
                <div><p className="text-xs text-text-tertiary">High Intent</p><p className="font-mono">{exp.highIntentActions}</p></div>
              </div>
              <div className="space-y-1">
                {exp.variants.slice(0, 3).map((v) => (
                  <div key={v.id} className="flex justify-between text-xs"><span>{v.name}</span><span className="font-mono">{v.conversionRate}%</span></div>
                ))}
              </div>
              <Link href={`/dashboard/experiments/${exp.id}`} className="text-xs text-blue hover:underline">View details →</Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
