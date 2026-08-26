"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Webhook, Trash2, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function IntegrationsPage() {
  const [webhooks, setWebhooks] = useState<{ id: string; url: string; events: string[]; active: boolean }[]>([]);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchWebhooks = () => fetch("/api/webhooks").then((r) => r.ok ? r.json() : { data: [] }).then((j) => setWebhooks(j.data || [])).catch(() => {});
  useEffect(() => { fetchWebhooks(); }, []);

  const add = async () => {
    if (!url.trim()) return;
    setLoading(true);
    await fetch("/api/webhooks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url, events: ["experiment.created"] }) });
    setUrl(""); await fetchWebhooks(); setLoading(false);
  };
  const remove = async (id: string) => {
    await fetch(`/api/webhooks?id=${id}`, { method: "DELETE" });
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/settings"><Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div><h1 className="text-2xl font-bold">Integrations & Webhooks</h1><p className="text-sm text-text-secondary">Connect PoD Engine to external tools.</p></div>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Webhook className="w-4 h-4" /> Webhooks</CardTitle><CardDescription>Receive experiment events at your URL (e.g., Slack, Zapier).</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="https://hooks.slack.com/..." value={url} onChange={(e) => setUrl(e.target.value)} className="flex-1" />
            <Button onClick={add} disabled={loading || !url.trim()}><Plus className="w-4 h-4" /> Add</Button>
          </div>
          {webhooks.length === 0 ? <p className="text-xs text-text-tertiary">No webhooks yet.</p> : webhooks.map((wh) => (
            <div key={wh.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface-elevated">
              <div><p className="text-xs font-mono truncate max-w-[260px]">{wh.url}</p><p className="text-[10px] text-text-tertiary">{wh.events.join(", ")}</p></div>
              <Button variant="ghost" size="icon" onClick={() => remove(wh.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
          <p className="text-xs text-text-tertiary">FirstMileDevs API: Contact support to enable direct integration. Email digests and Slack notifications are configured via webhooks above.</p>
        </CardContent>
      </Card>
    </div>
  );
}
