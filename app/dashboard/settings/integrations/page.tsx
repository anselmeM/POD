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
  Mail,
  Eye,
  MessageSquare,
  Calendar,
  X,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SprintDigestSummary } from "@/lib/types";

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

  // Weekly Sprint Digest state
  const [slackWebhookUrl, setSlackWebhookUrl] = useState("");
  const [emailRecipients, setEmailRecipients] = useState("");
  const [sendSlack, setSendSlack] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);
  const [savingDigest, setSavingDigest] = useState(false);
  const [digestSaved, setDigestSaved] = useState(false);
  const [sendingTestSlack, setSendingTestSlack] = useState(false);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [testNotice, setTestNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Live preview modal state
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewTab, setPreviewTab] = useState<"slack" | "email">("slack");
  const [previewDigest, setPreviewDigest] = useState<SprintDigestSummary | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

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

  const fetchDigestSettings = () => {
    fetch("/api/digest")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j?.config) {
          setSlackWebhookUrl(j.config.slackWebhookUrl || "");
          setEmailRecipients(
            Array.isArray(j.config.emailRecipients)
              ? j.config.emailRecipients.join(", ")
              : ""
          );
          setSendSlack(j.config.sendSlack ?? true);
          setSendEmail(j.config.sendEmail ?? true);
        }
        if (j?.digest) {
          setPreviewDigest(j.digest);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchWebhooks();
    fetchWorkspace();
    fetchDigestSettings();
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

  const handleSaveDigest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDigest(true);
    try {
      const emails = emailRecipients
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch("/api/digest", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slackWebhookUrl: slackWebhookUrl.trim() || null,
          emailRecipients: emails,
          sendSlack,
          sendEmail,
        }),
      });

      if (res.ok) {
        setDigestSaved(true);
        setTimeout(() => setDigestSaved(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save digest settings:", err);
    } finally {
      setSavingDigest(false);
    }
  };

  const handleSendTest = async (channel: "slack" | "email") => {
    if (channel === "slack") setSendingTestSlack(true);
    if (channel === "email") setSendingTestEmail(true);
    setTestNotice(null);

    try {
      const res = await fetch("/api/digest/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          customWebhookUrl: slackWebhookUrl.trim() || undefined,
          customEmail: emailRecipients.split(",")[0]?.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (channel === "slack") {
          setTestNotice({
            type: "success",
            message: "Test card sent to Slack successfully! Check your channel.",
          });
        } else {
          setTestNotice({
            type: "success",
            message: `Test email digest sent to ${emailRecipients.split(",")[0] || "inbox"}!`,
          });
        }
      } else {
        setTestNotice({
          type: "error",
          message: data.error || `Failed to send ${channel} test digest.`,
        });
      }
    } catch (err: any) {
      setTestNotice({
        type: "error",
        message: err.message || `Network error sending ${channel} test.`,
      });
    } finally {
      if (channel === "slack") setSendingTestSlack(false);
      if (channel === "email") setSendingTestEmail(false);
      setTimeout(() => setTestNotice(null), 6000);
    }
  };

  const openPreview = async () => {
    setShowPreviewModal(true);
    if (!previewDigest || !previewHtml) {
      setLoadingPreview(true);
      try {
        const res = await fetch("/api/digest");
        const json = await res.json();
        if (json?.digest) setPreviewDigest(json.digest);
        // Also get email HTML preview
        const sendRes = await fetch("/api/digest/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channel: "email" }),
        });
        const sendJson = await sendRes.json();
        if (sendJson?.previewHtml) setPreviewHtml(sendJson.previewHtml);
      } catch (err) {
        console.error("Preview fetch error:", err);
      } finally {
        setLoadingPreview(false);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-2xl pb-16">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/settings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Integrations & Pixels</h1>
          <p className="text-sm text-text-secondary">
            Configure conversion pixels, Slack sprint digests, and outbound webhooks.
          </p>
        </div>
      </div>

      {/* Slack & Email Weekly Sprint Digest Card */}
      <Card className="border-border bg-surface">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="w-4 h-4 text-emerald-400" /> Automated Slack & Email Sprint Digests
            </CardTitle>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Every Monday 9am
            </span>
          </div>
          <CardDescription>
            Deliver an automated executive summary to your team Slack channel and investor email list. Reports week-over-week traffic growth, leads, winning value propositions, and Stage-Gate portfolio verdicts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveDigest} className="space-y-4">
            {/* Slack Webhook Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#4A154B]" /> Slack Incoming Webhook URL
                </span>
                <span className="text-[10px] text-text-tertiary font-mono">Block Kit formatted</span>
              </label>
              <Input
                placeholder="https://hooks.slack.com/services/T000/B000/XXXX"
                value={slackWebhookUrl}
                onChange={(e) => setSlackWebhookUrl(e.target.value)}
                className="font-mono text-xs"
              />
              <div className="flex items-center justify-between text-[11px] text-text-tertiary">
                <span>Create via Slack API &gt; Incoming Webhooks &gt; Add New Webhook to Workspace.</span>
                <label className="inline-flex items-center gap-1.5 cursor-pointer text-text-secondary">
                  <input
                    type="checkbox"
                    checked={sendSlack}
                    onChange={(e) => setSendSlack(e.target.checked)}
                    className="rounded border-border text-blue focus:ring-blue"
                  />
                  <span>Active</span>
                </label>
              </div>
            </div>

            {/* Email Recipients */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue" /> Investor & Team Email Recipients
                </span>
                <span className="text-[10px] text-text-tertiary">Comma-separated</span>
              </label>
              <Input
                placeholder="founder@studio.com, partner@venture.vc, team@startup.com"
                value={emailRecipients}
                onChange={(e) => setEmailRecipients(e.target.value)}
                className="text-xs"
              />
              <div className="flex items-center justify-between text-[11px] text-text-tertiary">
                <span>Sends responsive executive HTML email via Resend with Stage-Gate matrix.</span>
                <label className="inline-flex items-center gap-1.5 cursor-pointer text-text-secondary">
                  <input
                    type="checkbox"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="rounded border-border text-blue focus:ring-blue"
                  />
                  <span>Active</span>
                </label>
              </div>
            </div>

            {/* Notice Feedback Banner */}
            {testNotice && (
              <div
                className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                  testNotice.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}
              >
                {testNotice.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                )}
                <span>{testNotice.message}</span>
              </div>
            )}

            {/* Actions Bar */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendTest("slack")}
                  disabled={sendingTestSlack || !slackWebhookUrl.trim()}
                  className="text-xs h-8"
                >
                  <Send className="w-3 h-3 mr-1" />
                  {sendingTestSlack ? "Sending..." : "Send Test Slack"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendTest("email")}
                  disabled={sendingTestEmail || !emailRecipients.trim()}
                  className="text-xs h-8"
                >
                  <Mail className="w-3 h-3 mr-1" />
                  {sendingTestEmail ? "Sending..." : "Send Test Email"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={openPreview}
                  className="text-xs h-8 text-blue hover:text-blue hover:bg-blue/10"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Live Preview
                </Button>
              </div>

              <Button type="submit" disabled={savingDigest} size="sm" className="h-8">
                {digestSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Saved!
                  </>
                ) : savingDigest ? (
                  "Saving..."
                ) : (
                  "Save Digest Settings"
                )}
              </Button>
            </div>
          </form>
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
            Receive validation events at your external endpoint (e.g., Zapier, Make, custom HTTP server).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="https://api.yourdomain.com/webhook"
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

      {/* Live Digest Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-surface-elevated border border-border rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue" /> Live Digest Output Preview
                </h3>
                <p className="text-xs text-text-secondary">
                  How your team and investors will see the weekly sprint pulse.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-surface rounded-lg p-0.5 border border-border text-xs">
                  <button
                    onClick={() => setPreviewTab("slack")}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      previewTab === "slack"
                        ? "bg-blue text-white font-semibold"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    Slack Card
                  </button>
                  <button
                    onClick={() => setPreviewTab("email")}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      previewTab === "email"
                        ? "bg-blue text-white font-semibold"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    HTML Email
                  </button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPreviewModal(false)}
                  className="h-8 w-8 text-text-tertiary hover:text-text-primary"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              {loadingPreview ? (
                <div className="py-16 text-center text-xs text-text-tertiary">
                  Generating preview...
                </div>
              ) : previewTab === "slack" && previewDigest ? (
                /* Slack Block Kit Rendering */
                <div className="bg-[#1A1D21] border border-[#383F45] rounded-lg p-4 font-sans text-xs text-[#D1D2D3] space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#383F45]">
                    <div className="w-6 h-6 rounded bg-blue flex items-center justify-center font-bold text-white text-[10px]">
                      PoD
                    </div>
                    <div>
                      <span className="font-bold text-white text-xs">Proof of Demand</span>
                      <span className="text-[10px] text-text-tertiary ml-2">APP • Today at 9:00 AM</span>
                    </div>
                  </div>

                  <div className="space-y-2 pl-8">
                    <h4 className="text-sm font-bold text-white">
                      🚀 PoD Weekly Sprint Digest — {previewDigest.workspaceName}
                    </h4>
                    <p className="text-[11px] text-[#ABABAD]">
                      📅 <b>Sprint Window:</b> 7-Day Performance Pulse | 🏁 <b>Day 7 of 7</b>
                    </p>

                    <div className="grid grid-cols-2 gap-2 bg-[#222529] p-3 rounded border border-[#383F45]">
                      <div>
                        <div className="text-[10px] text-[#ABABAD] uppercase font-bold">📈 Unique Visitors</div>
                        <div className="text-sm font-bold text-white">
                          {previewDigest.metrics.totalVisitors.toLocaleString()}{" "}
                          <span className="text-emerald-400 text-xs font-normal">
                            +{previewDigest.metrics.visitorsGrowth}% WoW
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#ABABAD] uppercase font-bold">🎯 Leads & CVR</div>
                        <div className="text-sm font-bold text-white">
                          {previewDigest.metrics.totalLeads}{" "}
                          <span className="text-blue text-xs font-normal">
                            ({previewDigest.metrics.conversionRate}% CVR)
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#ABABAD] uppercase font-bold">💳 Paid Pre-Orders</div>
                        <div className="text-sm font-bold text-emerald-400">
                          {previewDigest.metrics.totalPreorders}{" "}
                          <span className="text-xs text-[#ABABAD] font-normal">
                            (${previewDigest.metrics.totalDepositHeld.toFixed(2)})
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#ABABAD] uppercase font-bold">🛡️ Capital Preserved</div>
                        <div className="text-sm font-bold text-emerald-400">
                          ${previewDigest.metrics.capitalPreserved.toLocaleString()}{" "}
                          <span className="text-xs text-[#ABABAD] font-normal">
                            (Avg PoD: {previewDigest.metrics.avgPodScore}/100)
                          </span>
                        </div>
                      </div>
                    </div>

                    {previewDigest.topVariant && (
                      <div className="bg-[#222529] p-3 rounded border-l-2 border-blue space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-blue">🏆 TOP-CONVERTING VALUE PROPOSITION</span>
                          {previewDigest.topVariant.isSignificant && (
                            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                              p = {previewDigest.topVariant.pValue} &lt; 0.05
                            </span>
                          )}
                        </div>
                        <div className="font-semibold text-white">
                          {previewDigest.topVariant.variantName} — {previewDigest.topVariant.conversionRate}% CVR
                        </div>
                        <p className="italic text-[#ABABAD]">&quot;{previewDigest.topVariant.headline}&quot;</p>
                      </div>
                    )}

                    <div className="bg-[#222529] p-3 rounded border border-[#383F45]">
                      <div className="font-bold text-white text-xs mb-1">⚖️ Stage-Gate Portfolio Verdicts</div>
                      <div className="space-y-1 text-[11px]">
                        {previewDigest.stageGateChanges.map((sg, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <span>
                              {sg.verdict === "BUILD" ? "🟢" : sg.verdict === "KILL" ? "🔴" : "🟡"}{" "}
                              <b>{sg.verdict}</b>: {sg.projectName}
                            </span>
                            <span className="text-text-tertiary">
                              {sg.capitalSaved > 0 ? `Saved $${sg.capitalSaved.toLocaleString()}` : `PoD: ${sg.podScore}/100`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button size="sm" className="bg-[#007A5A] hover:bg-[#148567] text-white text-xs h-7">
                        Open Portfolio Command Center →
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                /* HTML Email Iframe Preview */
                <div className="border border-border rounded-lg overflow-hidden bg-black">
                  {previewHtml ? (
                    <iframe
                      title="Email Preview"
                      srcDoc={previewHtml}
                      className="w-full h-[450px] border-none"
                    />
                  ) : (
                    <div className="p-8 text-center text-xs text-text-tertiary">
                      Loading email template...
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-border bg-surface flex items-center justify-between text-xs text-text-tertiary">
              <span>Automatically generated every Monday at 9:00 AM EST via Vercel Cron.</span>
              <Button size="sm" variant="outline" onClick={() => setShowPreviewModal(false)} className="text-xs h-7">
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
