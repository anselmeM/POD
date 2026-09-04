"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Webhook, Trash2, Plus, Target, Check, Sparkles, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function IntegrationsPage() {
  const [webhooks, setWebhooks] = useState<{ id: string; url: string; events: string[]; active: boolean }[]>([]);
  const [url, setUrl] = useState("");
  const [loadingWebhook, setLoadingWebhook] = useState(false);

  // Pixel settings state
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [metaPixelId, setMetaPixelId] = useState("");
  const [googleAdsId, setGoogleAdsId] = useState("");
  const [linkedinPartnerId, setLinkedinPartnerId] = useState("");
  const [savingPixels, setSavingPixels] = useState(false);
  const [pixelsSaved, setPixelsSaved] = useState(false);

  const fetchWebhooks = () =>
    fetch("/api/webhooks")
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((j) => setWebhooks(j.data || []))
      .catch(() => {});

  const fetchWorkspace = () => {
    fetch("/api/workspaces")
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((j) => {
        const ws = j.data?.[0];
        if (ws) {
          setWorkspaceId(ws.id);
          setMetaPixelId(ws.metaPixelId || "");
          setGoogleAdsId(ws.googleAdsId || "");
          setLinkedinPartnerId(ws.linkedinPartnerId || "");
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchWebhooks();
    fetchWorkspace();
  }, []);

  const savePixels = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId) return;
    setSavingPixels(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metaPixelId: metaPixelId.trim(),
          googleAdsId: googleAdsId.trim(),
          linkedinPartnerId: linkedinPartnerId.trim(),
        }),
      });
      if (res.ok) {
        setPixelsSaved(true);
        setTimeout(() => setPixelsSaved(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save pixels:", err);
    } finally {
      setSavingPixels(false);
    }
  };

  const addWebhook = async () => {
    if (!url.trim()) return;
    setLoadingWebhook(true);
    await fetch("/api/webhooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, events: ["experiment.created"] }),
    });
    setUrl("");
    await fetchWebhooks();
    setLoadingWebhook(false);
  };

  const removeWebhook = async (id: string) => {
    await fetch(`/api/webhooks?id=${id}`, { method: "DELETE" });
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/settings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Integrations & Pixels</h1>
          <p className="text-sm text-text-secondary">
            Configure conversion pixels and webhook notifications for your experiments.
          </p>
        </div>
      </div>

      {/* Ad Tracking & Pixels Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="w-4 h-4 text-blue" /> Ad Tracking & Conversion Pixels
            </CardTitle>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue/10 text-blue font-semibold uppercase tracking-wider">
              Automatic Attribution
            </span>
          </div>
          <CardDescription>
            Inject client-side conversion pixels into all public landing pages (<code>/p/[slug]</code>). When visitors sign up or click CTAs, standard <code>Lead</code> and <code>PageView</code> events fire into your ad managers automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={savePixels} className="space-y-4">
            {/* Meta Pixel */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold flex items-center justify-between">
                <span>Meta Pixel ID (Facebook / Instagram)</span>
                <span className="text-[10px] text-text-tertiary font-normal font-mono">Fires `fbq('track', 'Lead')`</span>
              </label>
              <Input
                placeholder="e.g. 182947291048291"
                value={metaPixelId}
                onChange={(e) => setMetaPixelId(e.target.value)}
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-text-tertiary">
                Find this in Meta Events Manager &gt; Data Sources &gt; Pixel ID.
              </p>
            </div>

            {/* Google Ads Tag */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold flex items-center justify-between">
                <span>Google Tag / Ads ID</span>
                <span className="text-[10px] text-text-tertiary font-normal font-mono">Fires `gtag('event', 'generate_lead')`</span>
              </label>
              <Input
                placeholder="e.g. AW-123456789 or G-XXXXXXXX"
                value={googleAdsId}
                onChange={(e) => setGoogleAdsId(e.target.value)}
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-text-tertiary">
                Google Ads Conversion ID (starts with <code>AW-</code>) or Google Analytics 4 Measurement ID.
              </p>
            </div>

            {/* LinkedIn Insight Tag */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold flex items-center justify-between">
                <span>LinkedIn Insight Tag (Partner ID)</span>
                <span className="text-[10px] text-text-tertiary font-normal font-mono">Fires `lintrk('track')`</span>
              </label>
              <Input
                placeholder="e.g. 6291048"
                value={linkedinPartnerId}
                onChange={(e) => setLinkedinPartnerId(e.target.value)}
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-text-tertiary">
                Find your Partner ID in LinkedIn Campaign Manager &gt; Analyze &gt; Insight Tag.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-border">
              <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
                <Sparkles className="w-3.5 h-3.5 text-blue" />
                <span>First-party UTM tracking (`utm_source`) is active on all pages.</span>
              </div>
              <Button type="submit" disabled={savingPixels || !workspaceId} size="sm">
                {pixelsSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Saved!
                  </>
                ) : savingPixels ? (
                  "Saving..."
                ) : (
                  "Save Pixels"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Webhooks Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Webhook className="w-4 h-4" /> Webhooks
          </CardTitle>
          <CardDescription>
            Receive validation events at your external endpoint (e.g., Slack, Zapier, Make).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="https://hooks.slack.com/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 font-mono text-xs"
            />
            <Button onClick={addWebhook} disabled={loadingWebhook || !url.trim()} size="sm">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
          {webhooks.length === 0 ? (
            <p className="text-xs text-text-tertiary py-2">No webhooks configured yet.</p>
          ) : (
            webhooks.map((wh) => (
              <div
                key={wh.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface-elevated"
              >
                <div>
                  <p className="text-xs font-mono truncate max-w-[260px]">{wh.url}</p>
                  <p className="text-[10px] text-text-tertiary">{wh.events.join(", ")}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeWebhook(wh.id)}>
                  <Trash2 className="w-4 h-4 text-text-tertiary hover:text-red-400" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
