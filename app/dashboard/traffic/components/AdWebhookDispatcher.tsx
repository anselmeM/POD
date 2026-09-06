"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Zap, RefreshCw, Send, CheckCircle2, AlertTriangle, Code2, Check,
  Copy, ArrowRight, Plus, Trash2, ShieldCheck, Globe
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdWebhookDispatcherProps {
  registeredWebhooks: any[];
  onRefreshWebhooks: () => void;
  webhookTestUrl: string;
  setWebhookTestUrl: (url: string) => void;
  testIsPreorder: boolean;
  setTestIsPreorder: (val: boolean) => void;
  testingWebhook: boolean;
  webhookTestResult: any;
  onTestWebhook: () => void;
  samplePayload: any;
  payloadTab: "full" | "meta" | "google" | "linkedin";
  setPayloadTab: (tab: "full" | "meta" | "google" | "linkedin") => void;
  onDeleteWebhook: (id: string) => Promise<void>;
  onAddWebhook: (url: string, events: string[]) => Promise<void>;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
}

export function AdWebhookDispatcher({
  registeredWebhooks,
  onRefreshWebhooks,
  webhookTestUrl,
  setWebhookTestUrl,
  testIsPreorder,
  setTestIsPreorder,
  testingWebhook,
  webhookTestResult,
  onTestWebhook,
  samplePayload,
  payloadTab,
  setPayloadTab,
  onDeleteWebhook,
  onAddWebhook,
  copiedKey,
  onCopy,
}: AdWebhookDispatcherProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [subscribePreorder, setSubscribePreorder] = useState(true);
  const [subscribeLead, setSubscribeLead] = useState(true);
  const [addingWebhook, setAddingWebhook] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;
    setAddingWebhook(true);
    setAddError(null);
    try {
      const events: string[] = [];
      if (subscribePreorder) events.push("preorder.reserved");
      if (subscribeLead) events.push("lead.captured");
      await onAddWebhook(newUrl, events);
      setNewUrl("");
      setShowAddForm(false);
      onRefreshWebhooks();
    } catch (err: any) {
      setAddError(err?.message || "Failed to create webhook");
    } finally {
      setAddingWebhook(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-blue/10 via-purple-500/10 to-emerald-500/10 border border-border rounded-2xl p-6 relative overflow-hidden">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="blue" className="text-[10px] font-mono uppercase tracking-wider">
              Solo Founder Ad Engine
            </Badge>
            <span className="text-xs text-text-tertiary">Direct Server-Side Dispatch</span>
          </div>
          <h2 className="text-xl font-bold text-text-primary">
            Multi-Network Ad Conversion Webhooks
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Connect your smoke-test landing pages directly to <strong className="text-text-primary">Meta CAPI</strong>, <strong className="text-text-primary">Google Ads</strong>, and <strong className="text-text-primary">LinkedIn Ads</strong>. When visitors click your ads and reserve slots or sign up, Proof of Demand captures first-party click IDs (<code className="text-blue bg-blue/10 px-1 py-0.5 rounded text-xs font-mono">fbclid</code>, <code className="text-blue bg-blue/10 px-1 py-0.5 rounded text-xs font-mono">gclid</code>, <code className="text-blue bg-blue/10 px-1 py-0.5 rounded text-xs font-mono">li_fat_id</code>), hashes customer PII with SHA-256, and dispatches normalized ad conversion events directly to your webhooks or automation pipelines (Zapier, Make, n8n).
          </p>
        </div>

        {/* 3 Network Architecture Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
          <div className="p-3.5 rounded-xl bg-surface/80 border border-border space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue animate-pulse" />
                Meta Conversions API (CAPI)
              </span>
              <Badge variant="blue" className="text-[9px]">fbclid</Badge>
            </div>
            <p className="text-[11px] text-text-tertiary">
              Sends <code className="text-text-secondary">Purchase</code> for paid pre-orders and <code className="text-text-secondary">Lead</code> for waitlists with SHA-256 hashed email and deposit value.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface/80 border border-border space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Google Ads Offline Conversions
              </span>
              <Badge variant="green" className="text-[9px]">gclid</Badge>
            </div>
            <p className="text-[11px] text-text-tertiary">
              Matches clicks via <code className="text-text-secondary">gclid</code> with SHA-256 hashed emails and granular conversion value for smart bidding algorithms.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface/80 border border-border space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                LinkedIn Ads Conversions
              </span>
              <Badge variant="purple" className="text-[9px]">li_fat_id</Badge>
            </div>
            <p className="text-[11px] text-text-tertiary">
              Tracks B2B decision-maker conversions with first-party <code className="text-text-secondary">li_fat_id</code> and SHA-256 hashed professional emails.
            </p>
          </div>
        </div>
      </div>

      {/* Webhook Endpoints Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue" />
              Connected Ad Webhook Endpoints
            </CardTitle>
            <p className="text-xs text-text-tertiary mt-0.5">
              Active webhook URLs receiving real-time conversion payloads from your landing pages.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="cursor-pointer text-xs flex items-center gap-1 bg-blue hover:bg-blue/90 text-white"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Webhook</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Webhook Drawer */}
          {showAddForm && (
            <form onSubmit={handleCreateWebhook} className="p-4 rounded-xl bg-surface-elevated/70 border border-border space-y-3">
              <div className="text-xs font-semibold text-text-primary">Connect New Conversion Endpoint</div>
              <div>
                <Input
                  type="url"
                  placeholder="https://hooks.zapier.com/hooks/catch/... or https://your-server.com/api/ad-webhook"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  required
                  className="text-xs font-mono"
                />
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-text-tertiary">Subscribe Events:</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={subscribePreorder}
                    onChange={(e) => setSubscribePreorder(e.target.checked)}
                    className="rounded accent-blue"
                  />
                  <span>Pre-order Purchases</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={subscribeLead}
                    onChange={(e) => setSubscribeLead(e.target.checked)}
                    className="rounded accent-blue"
                  />
                  <span>Waitlist Leads</span>
                </label>
              </div>
              {addError && <p className="text-xs text-red-400">{addError}</p>}
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addingWebhook || !newUrl}
                  size="sm"
                  className="bg-blue hover:bg-blue/90 text-white text-xs"
                >
                  {addingWebhook ? "Connecting..." : "Save Webhook"}
                </Button>
              </div>
            </form>
          )}

          {/* Webhooks List */}
          {registeredWebhooks.length === 0 ? (
            <div className="py-6 text-center text-xs text-text-tertiary space-y-2">
              <p>No custom webhooks configured yet.</p>
              <p>Add a Zapier, Make, n8n, or ad webhook above to receive live conversion dispatches.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {registeredWebhooks.map((wh) => (
                <div key={wh.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-text-primary truncate block max-w-md">
                        {wh.url}
                      </span>
                      <Badge variant="green" className="text-[9px] py-0">Active</Badge>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {Array.isArray(wh.events) && wh.events.map((ev: string) => (
                        <span key={ev} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border border-border text-text-tertiary">
                          {ev}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setWebhookTestUrl(wh.url)}
                      className="px-2.5 py-1 text-xs rounded-lg border border-border bg-surface-elevated hover:bg-surface text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                    >
                      Use in Tester
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteWebhook(wh.id)}
                      className="p-1.5 text-text-tertiary hover:text-red-400 transition-colors cursor-pointer"
                      title="Delete Webhook"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Webhook Tester & Live Diagnostic */}
      <Card className="border border-border bg-surface shadow-sm">
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Live Ad Conversion Webhook Ping Tester
              </CardTitle>
              <p className="text-xs text-text-tertiary mt-0.5">
                Dispatch a verified test payload to your webhook receptor (Zapier, Make, n8n, or API proxy) to verify field mapping.
              </p>
            </div>
            <Link
              href="/dashboard/settings/integrations"
              className="text-xs text-blue hover:underline flex items-center gap-1 shrink-0"
            >
              Workspace Settings
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-3">
              <label className="text-xs font-medium text-text-secondary flex items-center justify-between">
                <span>Webhook Receptor URL:</span>
                {registeredWebhooks.length > 0 && (
                  <span className="text-[11px] text-text-tertiary">
                    {registeredWebhooks.length} saved in Workspace
                  </span>
                )}
              </label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://hooks.zapier.com/hooks/catch/... or https://your-server.com/webhook"
                  value={webhookTestUrl}
                  onChange={(e) => setWebhookTestUrl(e.target.value)}
                  className="font-mono text-xs bg-surface-elevated"
                />
                <Button
                  onClick={onTestWebhook}
                  disabled={testingWebhook || !webhookTestUrl}
                  className="bg-blue hover:bg-blue/90 text-white shrink-0 px-4 text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {testingWebhook ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Send Test Ping
                    </>
                  )}
                </Button>
              </div>

              {registeredWebhooks.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="text-[11px] text-text-tertiary">Quick select:</span>
                  {registeredWebhooks.map((wh) => (
                    <button
                      key={wh.id}
                      type="button"
                      onClick={() => setWebhookTestUrl(wh.url)}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-elevated border border-border text-text-secondary hover:text-text-primary hover:border-blue transition-colors cursor-pointer"
                    >
                      {wh.url.length > 40 ? wh.url.slice(0, 38) + "..." : wh.url}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Event Simulation Selector */}
            <div className="space-y-3">
              <label className="text-xs font-medium text-text-secondary">
                Simulation Event Type:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTestIsPreorder(true)}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    testIsPreorder
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-semibold"
                      : "border-border bg-surface-elevated/50 text-text-tertiary hover:text-text-primary"
                  }`}
                >
                  <div className="text-xs flex items-center gap-1">
                    💳 $100 Pre-Order
                  </div>
                  <div className="text-[10px] text-text-tertiary mt-0.5">
                    Purchase (High Intent)
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setTestIsPreorder(false)}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    !testIsPreorder
                      ? "border-blue bg-blue/10 text-blue font-semibold"
                      : "border-border bg-surface-elevated/50 text-text-tertiary hover:text-text-primary"
                  }`}
                >
                  <div className="text-xs flex items-center gap-1">
                    ✉️ Waitlist Lead
                  </div>
                  <div className="text-[10px] text-text-tertiary mt-0.5">
                    Lead (Soft Interest)
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Test Response Notice */}
          {webhookTestResult && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 animate-in fade-in duration-200 ${
                webhookTestResult.success
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-red-500/10 border-red-500/30 text-red-300"
              }`}
            >
              {webhookTestResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 text-xs">
                <div className="font-semibold flex items-center gap-2">
                  <span>
                    {webhookTestResult.success
                      ? `✅ Webhook ping successfully received (HTTP ${webhookTestResult.statusCode})`
                      : `❌ Webhook delivery failed (${webhookTestResult.statusCode || "Network Error"})`}
                  </span>
                  {webhookTestResult.responseTimeMs && (
                    <span className="text-[10px] font-mono border border-border px-1.5 py-0.5 rounded bg-surface">
                      {webhookTestResult.responseTimeMs}ms
                    </span>
                  )}
                </div>
                <p className="text-text-tertiary">
                  {webhookTestResult.success
                    ? "Your endpoint acknowledged the test conversion payload. Meta, Google, and LinkedIn parameters were validated."
                    : webhookTestResult.error || "Endpoint rejected the payload or timed out."}
                </p>
                {webhookTestResult.responseSnippet && (
                  <div className="text-[11px] font-mono bg-black/40 p-2 rounded border border-white/5 text-text-secondary mt-1">
                    Server response: {webhookTestResult.responseSnippet}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Schema & Payload Inspector */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue" />
                <span className="text-xs font-bold text-text-primary">
                  Ad Conversion Payload Inspector
                </span>
              </div>
              <div className="flex items-center gap-1">
                {(["full", "meta", "google", "linkedin"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setPayloadTab(tab)}
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-lg transition-colors capitalize cursor-pointer ${
                      payloadTab === tab
                        ? "bg-blue text-white"
                        : "bg-surface-elevated text-text-tertiary hover:text-text-primary"
                    }`}
                  >
                    {tab === "full" ? "Unified Payload" : tab === "meta" ? "Meta CAPI" : tab === "google" ? "Google Ads" : "LinkedIn"}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <pre className="p-4 rounded-xl bg-surface-elevated border border-border text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-80 leading-relaxed">
                {JSON.stringify(
                  payloadTab === "full"
                    ? samplePayload || { message: "Loading sample..." }
                    : payloadTab === "meta"
                    ? samplePayload?.adNetworks?.meta_capi || { message: "Loading Meta schema..." }
                    : payloadTab === "google"
                    ? samplePayload?.adNetworks?.google_ads || { message: "Loading Google schema..." }
                    : samplePayload?.adNetworks?.linkedin_ads || { message: "Loading LinkedIn schema..." },
                  null,
                  2
                )}
              </pre>
              <button
                type="button"
                onClick={() => {
                  const dataToCopy =
                    payloadTab === "full"
                      ? samplePayload
                      : payloadTab === "meta"
                      ? samplePayload?.adNetworks?.meta_capi
                      : payloadTab === "google"
                      ? samplePayload?.adNetworks?.google_ads
                      : samplePayload?.adNetworks?.linkedin_ads;
                  onCopy(JSON.stringify(dataToCopy, null, 2), "payload-json");
                }}
                className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-surface/90 border border-border text-xs text-text-secondary hover:text-text-primary hover:border-blue flex items-center gap-1 transition-all cursor-pointer"
              >
                {copiedKey === "payload-json" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
