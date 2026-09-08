"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Webhook,
  Trash2,
  Plus,
  Target,
  Check,
  Sparkles,
  Send,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
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

  // Webhook ping testing state
  const [testingWebhookId, setTestingWebhookId] = useState<string | null>(null);
  const [webhookPingNotice, setWebhookPingNotice] = useState<{ id: string; success: boolean; message: string; ms?: number } | null>(null);

  const handleTestWebhookPing = async (targetUrl: string, whId: string) => {
    setTestingWebhookId(whId);
    setWebhookPingNotice(null);
    try {
      const res = await fetch("/api/webhooks/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl, isPreorder: true }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setWebhookPingNotice({
          id: whId,
          success: true,
          message: `Test conversion payload received (HTTP ${data.statusCode})`,
          ms: data.responseTimeMs,
        });
      } else {
        setWebhookPingNotice({
          id: whId,
          success: false,
          message: data.error || `HTTP ${data.statusCode || 500} delivery failed`,
          ms: data.responseTimeMs,
        });
      }
    } catch (err: any) {
      setWebhookPingNotice({
        id: whId,
        success: false,
        message: err.message || "Network error reaching endpoint",
      });
    } finally {
      setTestingWebhookId(null);
      setTimeout(() => setWebhookPingNotice(null), 7000);
    }
  };

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
    <div className="space-y-6 max-w-2xl pb-16">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/settings">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Ad Webhooks & Conversion Pixels</h1>
          <p className="text-sm text-text-secondary">
            Configure server-side conversion webhooks for Meta CAPI, Google Ads, LinkedIn Ads, and client-side tracking pixels.
          </p>
        </div>
      </div>

      {/* Outbound Webhooks & Ad Network Endpoints Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Webhook className="w-4 h-4 text-blue" /> Outbound Webhooks & Ad Network Endpoints
            </CardTitle>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold uppercase tracking-wider">
              Meta · Google · LinkedIn Ready
            </span>
          </div>
          <CardDescription>
            Whenever a visitor validates demand or pre-orders on your smoke test page, Proof of Demand dispatches server-side conversion payloads with SHA-256 hashed emails, first-party click IDs (<code>fbclid</code>, <code>gclid</code>, <code>li_fat_id</code>), and financial value to your endpoints (Zapier, Make, n8n, or custom server).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="https://hooks.zapier.com/hooks/catch/... or https://api.yourdomain.com/webhook"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 font-mono text-xs bg-surface-elevated"
            />
            <Button onClick={addWebhook} disabled={loadingWebhook || !url.trim()} size="sm">
              <Plus className="w-4 h-4 mr-1" /> Add Endpoint
            </Button>
          </div>

          <div className="flex items-center justify-between text-xs text-text-tertiary bg-surface-elevated/40 px-3 py-2 rounded-lg border border-border/50">
            <span>Want to test ad conversions or inspect JSON schemas?</span>
            <Link
              href="/dashboard/traffic?tab=ad-webhooks"
              className="text-blue hover:underline flex items-center gap-1 font-medium"
            >
              Open Traffic & Attribution
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {webhooks.length === 0 ? (
            <p className="text-xs text-text-tertiary py-2">No webhook endpoints configured yet.</p>
          ) : (
            webhooks.map((wh) => (
              <div
                key={wh.id}
                className="space-y-2 p-3 rounded-lg border border-border bg-surface-elevated"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-xs font-mono text-text-primary truncate">{wh.url}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-text-tertiary font-medium">
                        Dispatches:
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue/10 text-blue font-mono">
                        Meta CAPI
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                        Google Ads
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-400 font-mono">
                        LinkedIn
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestWebhookPing(wh.url, wh.id)}
                      disabled={testingWebhookId === wh.id}
                      className="text-xs h-7 px-2.5 flex items-center gap-1 text-text-secondary hover:text-text-primary"
                    >
                      {testingWebhookId === wh.id ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-blue animate-ping" />
                          Pinging...
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3 text-blue" />
                          Test Ping
                        </>
                      )}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeWebhook(wh.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-text-tertiary hover:text-red-400" />
                    </Button>
                  </div>
                </div>

                {/* Test Ping Notice */}
                {webhookPingNotice && webhookPingNotice.id === wh.id && (
                  <div
                    className={`text-[11px] p-2 rounded-md border flex items-center justify-between ${
                      webhookPingNotice.success
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-red-500/10 border-red-500/30 text-red-300"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {webhookPingNotice.success ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      )}
                      <span>{webhookPingNotice.message}</span>
                    </div>
                    {webhookPingNotice.ms && (
                      <span className="font-mono text-[10px] opacity-80">
                        {webhookPingNotice.ms}ms
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

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
                <span className="text-[10px] text-text-tertiary font-normal font-mono">Fires `fbq(&apos;track&apos;, &apos;Lead&apos;)`</span>
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
                <span className="text-[10px] text-text-tertiary font-normal font-mono">Fires `gtag(&apos;event&apos;, &apos;generate_lead&apos;)`</span>
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
                <span className="text-[10px] text-text-tertiary font-normal font-mono">Fires `lintrk(&apos;track&apos;)`</span>
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
    </div>
  );
}
