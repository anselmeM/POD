"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Layout, Eye, MousePointerClick, TrendingUp, Clock, Pause, Play, Trash2, Edit3, Check, X, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLandingPageStore } from "@/lib/store";
import { templateRenderers } from "@/app/p/[slug]/templates";
import type { LandingPageTemplate } from "@/lib/types";

const statusMap: Record<string, { variant: "green" | "blue" | "amber" | "default"; label: string }> = {
  live: { variant: "green", label: "Live" },
  draft: { variant: "default", label: "Draft" },
  paused: { variant: "amber", label: "Paused" },
  archived: { variant: "default", label: "Archived" },
};

export default function LandingPageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { landingPages, fetchLandingPages, updateLandingPage, updateLandingPageStatus, deleteLandingPage } = useLandingPageStore();
  const page = landingPages.find((lp) => lp.id === params.id);

  useEffect(() => { fetchLandingPages(); }, [fetchLandingPages]);

  const [editing, setEditing] = useState(false);
  const [headline, setHeadline] = useState("");
  const [subheadline, setSubheadline] = useState("");
  const [cta, setCta] = useState("");
  const [template, setTemplate] = useState<LandingPageTemplate>("hero");
  const [positioning, setPositioning] = useState("");
  const [preorderEnabled, setPreorderEnabled] = useState(false);
  const [depositAmount, setDepositAmount] = useState(100);
  const [priceAnchor, setPriceAnchor] = useState(4900);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (page) {
      setHeadline(page.headline);
      setSubheadline(page.subheadline);
      setCta(page.cta);
      setTemplate(page.template);
      setPositioning(page.positioning);
      setPreorderEnabled(Boolean(page.preorderEnabled));
      setDepositAmount(page.depositAmount ?? 100);
      setPriceAnchor(page.priceAnchor ?? 4900);
    }
  }, [page]);

  if (!page) {
    return (
      <div className="text-center py-20">
        <Layout className="w-10 h-10 text-text-tertiary mx-auto mb-4" />
        <h2 className="text-lg font-semibold mb-2">Landing page not found</h2>
        <Link href="/dashboard/landing-pages"><Button variant="secondary">Back to Landing Pages</Button></Link>
      </div>
    );
  }

  const s = statusMap[page.status] || statusMap.draft;

  const handleSave = () => {
    updateLandingPage(page.id, {
      headline,
      subheadline,
      cta,
      template,
      positioning,
      preorderEnabled,
      depositAmount,
      priceAnchor,
    });
    setEditing(false);
  };

  const handleDelete = () => {
    deleteLandingPage(page.id);
    router.push("/dashboard/landing-pages");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/landing-pages"><Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{page.name}</h1>
              <Badge variant={s.variant}>{s.label}</Badge>
            </div>
            <p className="text-sm text-text-secondary">{page.headline}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {page.status === "live" ? (
            <Button variant="secondary" size="sm" onClick={() => updateLandingPageStatus(page.id, "paused")}><Pause className="w-3 h-3 mr-1" />Pause</Button>
          ) : page.status === "paused" ? (
            <Button variant="secondary" size="sm" onClick={() => updateLandingPageStatus(page.id, "live")}><Play className="w-3 h-3 mr-1" />Resume</Button>
          ) : null}
          <Button variant="secondary" size="sm" onClick={() => setEditing(!editing)}><Edit3 className="w-3 h-3 mr-1" />{editing ? "Cancel" : "Edit"}</Button>
          <Link href={`/p/${page.slug}`} target="_blank"><Button variant="secondary" size="sm"><ExternalLink className="w-3 h-3 mr-1" />Preview</Button></Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Visitors", value: page.visitors.toLocaleString(), icon: Eye },
          { label: "Conversions", value: page.conversions.toString(), icon: MousePointerClick },
          { label: "Conv. Rate", value: `${page.conversionRate}%`, icon: TrendingUp },
          { label: "Bounce Rate", value: `${page.bounceRate}%`, icon: TrendingUp },
          { label: "Avg Time", value: `${page.avgTimeOnPage}s`, icon: Clock },
        ].map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card>
                <CardContent className="p-4 text-center">
                  <Icon className="w-4 h-4 text-text-tertiary mx-auto mb-2" />
                  <p className="text-xs text-text-tertiary mb-1">{m.label}</p>
                  <p className="text-xl font-bold font-mono">{m.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Content Editor / Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Page Content</CardTitle>
            {editing && (
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave}><Check className="w-3 h-3 mr-1" />Save</Button>
                <Button variant="secondary" size="sm" onClick={() => { setEditing(false); setHeadline(page.headline); setSubheadline(page.subheadline); setCta(page.cta); setTemplate(page.template); setPositioning(page.positioning); }}>
                  <X className="w-3 h-3 mr-1" />Cancel
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {editing ? (
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input label="Headline" value={headline} onChange={(e) => setHeadline(e.target.value)} />
                <Textarea label="Subheadline" value={subheadline} onChange={(e) => setSubheadline(e.target.value)} />
                <Input label="CTA Button Text" value={cta} onChange={(e) => setCta(e.target.value)} />
                <div>
                  <label className="text-sm font-medium">Template</label>
                  <select value={template} onChange={(e) => setTemplate(e.target.value as LandingPageTemplate)} className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm">
                    <option value="hero">Hero</option>
                    <option value="problem">Problem</option>
                    <option value="social-proof">Social Proof</option>
                    <option value="pricing">Pricing</option>
                    <option value="minimal">Minimal</option>
                  </select>
                </div>
                <Input label="Positioning" value={positioning} onChange={(e) => setPositioning(e.target.value)} />

                <div className="pt-2 border-t border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-primary">Pre-Order Reservation Mode</p>
                      <p className="text-xs text-text-tertiary">Collect refundable card reservations via Stripe instead of email waitlist</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreorderEnabled(!preorderEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preorderEnabled ? "bg-blue" : "bg-surface-elevated border border-border"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preorderEnabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {preorderEnabled && (
                    <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-surface-elevated/70 border border-border">
                      <div>
                        <label className="text-xs font-medium text-text-secondary mb-1 block">Deposit ($)</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={(depositAmount / 100).toFixed(0)}
                          onChange={(e) => setDepositAmount(Math.max(1, Number(e.target.value)) * 100)}
                          className="w-full h-8 px-2.5 rounded-lg border border-border bg-surface text-xs text-text-primary"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-text-secondary mb-1 block">Launch Price ($/mo)</label>
                        <input
                          type="number"
                          min="1"
                          value={(priceAnchor / 100).toFixed(0)}
                          onChange={(e) => setPriceAnchor(Math.max(1, Number(e.target.value)) * 100)}
                          className="w-full h-8 px-2.5 rounded-lg border border-border bg-surface text-xs text-text-primary"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="px-3 py-2 bg-surface-elevated border-b border-border text-xs font-medium text-text-tertiary">Live Preview — {template}</div>
                <div className="max-h-[420px] overflow-auto bg-surface">
                  {(() => {
                    const Preview = templateRenderers[template] || templateRenderers.hero;
                    const previewPage = { ...page, headline: headline || page.headline, subheadline: subheadline || page.subheadline, cta: cta || page.cta, template, positioning, preorderEnabled, depositAmount, priceAnchor };
                    return <div className="scale-[0.55] origin-top-left w-[182%] h-[380px] overflow-hidden"><Preview page={previewPage as never} /></div>;
                  })()}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="px-3 py-2 bg-surface-elevated border-b border-border text-xs font-medium text-text-tertiary capitalize">{page.template.replace("-", " ")} Preview</div>
              <div className="max-h-[420px] overflow-auto">
                {(() => {
                  const Preview = templateRenderers[page.template] || templateRenderers.hero;
                  return <div className="scale-[0.55] origin-top-left w-[182%] h-[380px] overflow-hidden"><Preview page={page} /></div>;
                })()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-text-tertiary">Template</span><span className="font-medium capitalize">{page.template.replace("-", " ")}</span></div>
            <div className="flex justify-between text-sm"><span className="text-text-tertiary">Positioning</span><span className="font-medium">{page.positioning}</span></div>
            <div className="flex justify-between text-sm">
              <span className="text-text-tertiary">Mode</span>
              <span className="font-medium">
                {page.preorderEnabled ? `Pre-Order ($${((page.depositAmount || 100) / 100).toFixed(2)} Deposit)` : "Email Waitlist"}
              </span>
            </div>
            <div className="flex justify-between text-sm"><span className="text-text-tertiary">Slug</span><span className="font-mono text-xs">{page.slug}</span></div>
            <div className="flex justify-between text-sm"><span className="text-text-tertiary">Experiment</span><span className="font-mono text-xs">{page.experimentId || "None"}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Dates</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-text-tertiary">Created</span><span>{page.createdAt}</span></div>
            <div className="flex justify-between text-sm"><span className="text-text-tertiary">Last Updated</span><span>{page.updatedAt}</span></div>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="border-red/20">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Delete Landing Page</p>
              <p className="text-xs text-text-tertiary">This action cannot be undone.</p>
            </div>
            {!confirmDelete ? (
              <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}><Trash2 className="w-3 h-3 mr-1" />Delete</Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="danger" size="sm" onClick={handleDelete}>Confirm Delete</Button>
                <Button variant="secondary" size="sm" onClick={() => setConfirmDelete(false)}>Cancel</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}