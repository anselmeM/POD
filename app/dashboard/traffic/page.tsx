"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone, Target, Share2, Copy, Check, ExternalLink, RefreshCw,
  Sparkles, Globe, DollarSign, Calculator, Layers, ArrowRight,
  TrendingUp, Users, ShieldCheck, ChevronRight, QrCode, Filter,
  Smartphone, Monitor, Search
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdCopyVariation, ChannelAttribution, AdPlatform } from "@/lib/types";

export default function TrafficCampaignPage() {
  const [activeTab, setActiveTab] = useState<"ad-copy" | "utm-builder" | "attribution">("ad-copy");
  const [platformFilter, setPlatformFilter] = useState<"all" | AdPlatform>("all");

  // Selection & Context
  const [experiments, setExperiments] = useState<any[]>([]);
  const [landingPages, setLandingPages] = useState<any[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [selectedTitle, setSelectedTitle] = useState<string>("B2B Workflow Automation");

  // Ad Copy State
  const [variations, setVariations] = useState<AdCopyVariation[]>([]);
  const [targetingBlueprint, setTargetingBlueprint] = useState<any>(null);
  const [adLoading, setAdLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // UTM Builder State
  const [baseUrl, setBaseUrl] = useState("");
  const [utmSource, setUtmSource] = useState("linkedin");
  const [utmMedium, setUtmMedium] = useState("sponsored_content");
  const [utmCampaign, setUtmCampaign] = useState("validation_sprint_v1");
  const [utmTerm, setUtmTerm] = useState("operations_leaders");
  const [utmContent, setUtmContent] = useState("angle_speed_roi");
  const [recentLinks, setRecentLinks] = useState<string[]>([]);
  const [showQr, setShowQr] = useState(false);

  // Attribution State
  const [attribution, setAttribution] = useState<ChannelAttribution[]>([]);
  const [attributionLoading, setAttributionLoading] = useState(false);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [totalLeads, setTotalLeads] = useState(0);
  const [topChannel, setTopChannel] = useState("LinkedIn Ads");

  // Budget Calculator State
  const [targetVisitors, setTargetVisitors] = useState(250);
  const [estimatedCpc, setEstimatedCpc] = useState(2.2);
  const [expectedCvr, setExpectedCvr] = useState(6.5);

  // Load experiments and initial context
  useEffect(() => {
    Promise.all([fetch("/api/experiments"), fetch("/api/landing-pages")])
      .then(async ([expRes, pageRes]) => {
        let defaultSlug = "smoke-test";
        let defaultName = "B2B Workflow Automation";

        if (expRes.ok) {
          const expData = await expRes.json();
          const list = Array.isArray(expData.data) ? expData.data : [];
          setExperiments(list);
          if (list.length > 0) {
            defaultName = list[0].name;
            setSelectedTitle(list[0].name);
          }
        }
        if (pageRes.ok) {
          const pageData = await pageRes.json();
          const pages = Array.isArray(pageData.data) ? pageData.data : [];
          setLandingPages(pages);
          if (pages.length > 0) {
            defaultSlug = pages[0].slug;
            setSelectedSlug(pages[0].slug);
          }
        }

        if (typeof window !== "undefined") {
          setBaseUrl(`${window.location.origin}/p/${defaultSlug}`);
        }

        // Generate initial ad variations
        fetchAdVariations(defaultName, defaultSlug);
      })
      .catch(() => {});
  }, []);

  const fetchAdVariations = async (title: string, slug: string) => {
    setAdLoading(true);
    try {
      const res = await fetch("/api/ai/ad-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conceptTitle: title,
          slug,
          positioning: "Cut operational friction by 50% with automated workflow intelligence",
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data?.variations) {
          setVariations(json.data.variations);
          setTargetingBlueprint(json.data.targetingBlueprint);
        }
      }
    } catch (err) {
      console.warn("Failed to generate ad copy:", err);
    } finally {
      setAdLoading(false);
    }
  };

  // Fetch Attribution Data
  useEffect(() => {
    if (activeTab === "attribution" && attribution.length === 0) {
      setAttributionLoading(true);
      fetch("/api/traffic/attribution")
        .then(async (r) => (r.ok ? r.json() : {}))
        .then((json: any) => {
          if (json?.data) {
            setAttribution(json.data.channels || []);
            setTotalVisitors(json.data.totalVisitors || 0);
            setTotalLeads(json.data.totalLeads || 0);
            setTopChannel(json.data.topPerformingChannel || "LinkedIn Ads");
          }
        })
        .catch(() => {})
        .finally(() => setAttributionLoading(false));
    }
  }, [activeTab, attribution.length]);

  const handleExperimentSelect = (slug: string, name: string) => {
    setSelectedSlug(slug);
    setSelectedTitle(name);
    if (typeof window !== "undefined") {
      setBaseUrl(`${window.location.origin}/p/${slug}`);
    }
    fetchAdVariations(name, slug);
  };

  const copyToClipboard = (text: string, key: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // Build the live tracked URL
  const generatedUrl = useMemo(() => {
    if (!baseUrl) return "";
    try {
      const url = new URL(baseUrl);
      if (utmSource) url.searchParams.set("utm_source", utmSource);
      if (utmMedium) url.searchParams.set("utm_medium", utmMedium);
      if (utmCampaign) url.searchParams.set("utm_campaign", utmCampaign);
      if (utmTerm) url.searchParams.set("utm_term", utmTerm);
      if (utmContent) url.searchParams.set("utm_content", utmContent);
      return url.toString();
    } catch {
      return `${baseUrl}?utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}`;
    }
  }, [baseUrl, utmSource, utmMedium, utmCampaign, utmTerm, utmContent]);

  const saveToRecentLinks = () => {
    copyToClipboard(generatedUrl, "full-url");
    if (!recentLinks.includes(generatedUrl)) {
      setRecentLinks((prev) => [generatedUrl, ...prev.slice(0, 4)]);
    }
  };

  const filteredVariations = useMemo(() => {
    if (platformFilter === "all") return variations;
    return variations.filter((v) => v.platform === platformFilter);
  }, [variations, platformFilter]);

  // Preset quick channel helpers
  const applyPreset = (preset: "meta" | "linkedin" | "google" | "twitter" | "reddit" | "newsletter") => {
    switch (preset) {
      case "meta":
        setUtmSource("facebook");
        setUtmMedium("paid_social");
        break;
      case "linkedin":
        setUtmSource("linkedin");
        setUtmMedium("sponsored_content");
        break;
      case "google":
        setUtmSource("google");
        setUtmMedium("cpc");
        break;
      case "twitter":
        setUtmSource("twitter");
        setUtmMedium("promoted_tweet");
        break;
      case "reddit":
        setUtmSource("reddit");
        setUtmMedium("cpc");
        break;
      case "newsletter":
        setUtmSource("newsletter");
        setUtmMedium("email");
        break;
    }
  };

  // ROI / Budget Calculation
  const calculatedBudget = useMemo(() => {
    const cost = targetVisitors * estimatedCpc;
    const projectedLeads = Math.round(targetVisitors * (expectedCvr / 100));
    const costPerLead = projectedLeads > 0 ? cost / projectedLeads : 0;
    return {
      totalCost: Math.round(cost),
      projectedLeads,
      costPerLead: Number(costPerLead.toFixed(2)),
    };
  }, [targetVisitors, estimatedCpc, expectedCvr]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              Traffic & Multi-Channel Ad Campaign Kit
            </h1>
            <Badge variant="blue" className="text-[10px] font-mono">
              Validation AdKit
            </Badge>
          </div>
          <p className="text-sm text-text-secondary">
            Ready-to-copy ad variations, 1-click UTM tracking builder, and first-party channel attribution.
          </p>
        </div>

        {/* Experiment Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-tertiary">Target Page:</span>
          <select
            value={selectedSlug}
            onChange={(e) => {
              const p = landingPages.find((lp) => lp.slug === e.target.value);
              handleExperimentSelect(e.target.value, p?.name || p?.headline || selectedTitle);
            }}
            aria-label="Target Landing Page"
            className="text-xs bg-surface border border-border rounded-lg px-3 py-1.5 text-text-primary focus:outline-none focus:border-blue"
          >
            {landingPages.map((lp) => (
              <option key={lp.id} value={lp.slug}>
                {lp.name || lp.headline} (/p/{lp.slug})
              </option>
            ))}
            {landingPages.length === 0 && (
              <option value="smoke-test">Demo Smoke Test (/p/smoke-test)</option>
            )}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("ad-copy")}
          className={`pb-3 px-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === "ad-copy"
              ? "border-blue text-blue"
              : "border-transparent text-text-tertiary hover:text-text-primary"
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Ad Copy Studio</span>
        </button>
        <button
          onClick={() => setActiveTab("utm-builder")}
          className={`pb-3 px-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === "utm-builder"
              ? "border-blue text-blue"
              : "border-transparent text-text-tertiary hover:text-text-primary"
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>1-Click UTM Builder</span>
        </button>
        <button
          onClick={() => setActiveTab("attribution")}
          className={`pb-3 px-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === "attribution"
              ? "border-blue text-blue"
              : "border-transparent text-text-tertiary hover:text-text-primary"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Channel Attribution & Budget</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: AD COPY STUDIO */}
      {/* ========================================================================= */}
      {activeTab === "ad-copy" && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-elevated/60 p-3 rounded-2xl border border-border">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-text-tertiary mr-1 font-medium">Channel:</span>
              {(["all", "meta", "linkedin", "google", "twitter"] as const).map((plt) => (
                <button
                  key={plt}
                  onClick={() => setPlatformFilter(plt)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer capitalize ${
                    platformFilter === plt
                      ? "bg-blue text-white shadow-sm"
                      : "bg-surface border border-border text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {plt === "meta" ? "Meta Ads (FB/IG)" : plt === "all" ? "All Channels" : plt}
                </button>
              ))}
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => fetchAdVariations(selectedTitle, selectedSlug)}
              disabled={adLoading}
              className="flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${adLoading ? "animate-spin" : ""}`} />
              <span>{adLoading ? "Synthesizing Copy..." : "Regenerate Copy"}</span>
            </Button>
          </div>

          {/* Ad Variations Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {filteredVariations.map((ad) => {
              const isMeta = ad.platform === "meta";
              const isLinkedin = ad.platform === "linkedin";
              const isGoogle = ad.platform === "google";
              const isTwitter = ad.platform === "twitter";

              return (
                <Card key={ad.id} className="flex flex-col justify-between overflow-hidden">
                  <CardHeader className="pb-3 border-b border-border/60 bg-surface-elevated/40">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            isLinkedin ? "blue" : isMeta ? "purple" : isGoogle ? "green" : "default"
                          }
                          className="capitalize text-[10px] font-semibold"
                        >
                          {ad.platform}
                        </Badge>
                        <span className="text-xs font-medium text-text-secondary">{ad.angle}</span>
                      </div>
                      <span className="text-[11px] font-mono text-text-tertiary">
                        Est. CPC: ${ad.estimatedCpc.toFixed(2)}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 flex-1 space-y-4">
                    {/* Realistic Ad Visual Preview Mockup */}
                    <div className="rounded-xl border border-border bg-surface p-4 text-xs space-y-3">
                      {/* Mockup Header */}
                      <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue/20 flex items-center justify-center font-bold text-[10px] text-blue">
                            PoD
                          </div>
                          <div>
                            <p className="font-semibold text-text-primary leading-none">
                              {selectedTitle}
                            </p>
                            <p className="text-[10px] text-text-tertiary mt-0.5">
                              {isLinkedin
                                ? "Promoted"
                                : isMeta
                                ? "Sponsored"
                                : isGoogle
                                ? "pod.engine/beta"
                                : "Promoted Tweet"}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] text-text-tertiary">Preview</span>
                      </div>

                      {/* Google Search Mockup */}
                      {isGoogle && (
                        <div className="space-y-1.5 font-sans">
                          <div className="flex items-center gap-1 text-[11px] text-text-tertiary">
                            <span className="font-bold text-text-primary text-[10px] border border-border px-1 rounded">
                              Ad
                            </span>
                            <span>https://pod.engine/{ad.displayPath}</span>
                          </div>
                          <h4 className="text-sm font-semibold text-blue hover:underline cursor-pointer">
                            {ad.headlines?.join(" | ") || ad.headline}
                          </h4>
                          <p className="text-xs text-text-secondary leading-relaxed">
                            {ad.descriptions?.join(" ") || ad.description}
                          </p>
                        </div>
                      )}

                      {/* Social Post Mockup (Meta, LinkedIn, Twitter) */}
                      {!isGoogle && (
                        <div className="space-y-3">
                          <p className="text-xs text-text-primary whitespace-pre-line leading-relaxed">
                            {ad.primaryText}
                          </p>
                          <div className="rounded-lg border border-border/80 bg-surface-elevated/70 p-3 flex items-center justify-between">
                            <div>
                              <p className="text-[10px] text-text-tertiary uppercase tracking-wider font-mono">
                                pod.engine/p/{selectedSlug}
                              </p>
                              <p className="text-xs font-bold text-text-primary mt-0.5">
                                {ad.headline}
                              </p>
                              <p className="text-[11px] text-text-secondary line-clamp-1">
                                {ad.description}
                              </p>
                            </div>
                            <button
                              type="button"
                              className="px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-semibold text-text-primary flex-shrink-0 ml-3"
                            >
                              {ad.callToAction}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Copy Snippets Section */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between bg-surface-elevated/60 px-3 py-2 rounded-lg border border-border">
                        <div className="truncate pr-2">
                          <span className="text-[10px] uppercase font-bold text-text-tertiary block">
                            Headline
                          </span>
                          <span className="text-xs font-medium text-text-primary truncate">
                            {ad.headline}
                          </span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(ad.headline, `${ad.id}-headline`)}
                          className="text-text-tertiary hover:text-white transition-colors cursor-pointer p-1"
                          title="Copy Headline"
                        >
                          {copiedKey === `${ad.id}-headline` ? (
                            <Check className="w-3.5 h-3.5 text-green" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {ad.primaryText && (
                        <div className="flex items-center justify-between bg-surface-elevated/60 px-3 py-2 rounded-lg border border-border">
                          <div className="truncate pr-2">
                            <span className="text-[10px] uppercase font-bold text-text-tertiary block">
                              Body / Primary Text
                            </span>
                            <span className="text-xs text-text-secondary truncate block max-w-sm">
                              {ad.primaryText.slice(0, 60)}...
                            </span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(ad.primaryText || "", `${ad.id}-body`)}
                            className="text-text-tertiary hover:text-white transition-colors cursor-pointer p-1"
                            title="Copy Body"
                          >
                            {copiedKey === `${ad.id}-body` ? (
                              <Check className="w-3.5 h-3.5 text-green" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  {/* Card Footer Actions */}
                  <div className="p-4 border-t border-border/80 bg-surface-elevated/30 flex items-center justify-between">
                    <span className="text-[11px] text-text-tertiary">
                      {ad.recommendedAudience}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        const fullBundle = `--- ${ad.platform.toUpperCase()} AD CREATIVE ---\nHEADLINE: ${
                          ad.headline
                        }\nDESCRIPTION: ${ad.description}\n${
                          ad.primaryText ? `PRIMARY TEXT:\n${ad.primaryText}\n` : ""
                        }CTA: ${ad.callToAction}`;
                        copyToClipboard(fullBundle, `${ad.id}-bundle`);
                      }}
                      className="text-xs"
                    >
                      {copiedKey === `${ad.id}-bundle` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green mr-1" />
                          <span>Copied Bundle</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1" />
                          <span>Copy Ad Creative</span>
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Targeting Blueprint */}
          {targetingBlueprint && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue" />
                  <span>Audience & Keyword Blueprint</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-surface-elevated/60 border border-border space-y-2">
                    <p className="text-xs font-semibold text-text-primary">Recommended Job Titles</p>
                    <div className="flex flex-wrap gap-1.5">
                      {targetingBlueprint.targetJobTitles?.map((t: string) => (
                        <Badge key={t} variant="blue" className="text-[10px]">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-elevated/60 border border-border space-y-2">
                    <p className="text-xs font-semibold text-text-primary">Google Match Keywords</p>
                    <div className="flex flex-wrap gap-1.5">
                      {targetingBlueprint.recommendedKeywords?.map((kw: string) => (
                        <Badge key={kw} variant="green" className="text-[10px] font-mono">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-elevated/60 border border-border space-y-2">
                    <p className="text-xs font-semibold text-text-primary">Negative Keyword Exclusions</p>
                    <div className="flex flex-wrap gap-1.5">
                      {targetingBlueprint.negativeKeywords?.map((neg: string) => (
                        <Badge key={neg} variant="red" className="text-[10px] font-mono">
                          -{neg}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: 1-CLICK SMART UTM LINK BUILDER */}
      {/* ========================================================================= */}
      {activeTab === "utm-builder" && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configure Tracking Link</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Preset Platform Chips */}
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-2">
                      1-Click Channel Presets
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "linkedin", label: "LinkedIn Sponsored", icon: "in" },
                        { id: "meta", label: "Meta (FB / IG)", icon: "meta" },
                        { id: "google", label: "Google Search (CPC)", icon: "g" },
                        { id: "twitter", label: "X (Twitter)", icon: "x" },
                        { id: "reddit", label: "Reddit Ads", icon: "r" },
                        { id: "newsletter", label: "Newsletter / Substack", icon: "mail" },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => applyPreset(p.id as never)}
                          className="px-3 py-1.5 rounded-xl border border-border bg-surface-elevated/70 hover:bg-surface-elevated text-xs font-medium text-text-primary transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <span>{p.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Inputs */}
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">
                      Target Landing Page URL
                    </label>
                    <input
                      type="url"
                      value={baseUrl}
                      onChange={(e) => setBaseUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-text-primary focus:outline-none focus:border-blue"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">
                        UTM Source <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={utmSource}
                        onChange={(e) => setUtmSource(e.target.value)}
                        placeholder="e.g. linkedin, facebook, google"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-text-primary focus:outline-none focus:border-blue"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">
                        UTM Medium <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={utmMedium}
                        onChange={(e) => setUtmMedium(e.target.value)}
                        placeholder="e.g. sponsored_content, cpc, email"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-text-primary focus:outline-none focus:border-blue"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">
                        UTM Campaign
                      </label>
                      <input
                        type="text"
                        value={utmCampaign}
                        onChange={(e) => setUtmCampaign(e.target.value)}
                        placeholder="e.g. beta_launch_v1"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-text-primary focus:outline-none focus:border-blue"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">
                        UTM Term (Audience)
                      </label>
                      <input
                        type="text"
                        value={utmTerm}
                        onChange={(e) => setUtmTerm(e.target.value)}
                        placeholder="e.g. ops_managers"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-text-primary focus:outline-none focus:border-blue"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">
                        UTM Content (Creative)
                      </label>
                      <input
                        type="text"
                        value={utmContent}
                        onChange={(e) => setUtmContent(e.target.value)}
                        placeholder="e.g. angle_speed_roi"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-text-primary focus:outline-none focus:border-blue"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Output Box */}
              <Card className="border-blue/30 bg-blue/5">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue uppercase tracking-wider flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" /> Ready Tracked URL
                    </span>
                    <Badge variant="blue" className="text-[10px]">
                      1st-Party Attributed
                    </Badge>
                  </div>

                  <div className="p-3 rounded-xl bg-surface border border-border font-mono text-xs text-text-primary break-all">
                    {generatedUrl}
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <Button
                      onClick={saveToRecentLinks}
                      className="flex-1 bg-blue hover:bg-blue/90 text-white cursor-pointer"
                    >
                      {copiedKey === "full-url" ? (
                        <>
                          <Check className="w-4 h-4 mr-1.5 text-green-300" />
                          <span>Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1.5" />
                          <span>Copy Tracked Link</span>
                        </>
                      )}
                    </Button>

                    <a
                      href={generatedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-surface border border-border hover:bg-surface-elevated text-xs font-medium text-text-primary transition-colors flex items-center gap-1"
                    >
                      <span>Test Link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Side Card: Link History & Instructions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Why 1st-Party UTM Tracking?</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-text-secondary space-y-3 leading-relaxed">
                  <p>
                    PoD landing pages automatically read incoming <code className="text-blue font-mono">utm_source</code>, <code className="text-blue font-mono">gclid</code>, and <code className="text-blue font-mono">fbclid</code>.
                  </p>
                  <p>
                    When a prospect submits an email, micro-survey response, or pre-order reservation, their source is permanently recorded in your dashboard analytics.
                  </p>
                  <div className="p-3 rounded-xl bg-surface-elevated border border-border space-y-1.5 text-[11px]">
                    <span className="font-semibold text-text-primary block">Supported Channels:</span>
                    <p>• Meta Ads Manager</p>
                    <p>• LinkedIn Campaign Manager</p>
                    <p>• Google Ads (Search & Performance Max)</p>
                    <p>• X Ads & Substack Newsletters</p>
                  </div>
                </CardContent>
              </Card>

              {recentLinks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Session Link History</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {recentLinks.map((lnk, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-surface border border-border text-[11px] font-mono truncate flex items-center justify-between"
                      >
                        <span className="truncate mr-2">{lnk}</span>
                        <button
                          onClick={() => copyToClipboard(lnk, `hist-${i}`)}
                          className="text-text-tertiary hover:text-white"
                        >
                          {copiedKey === `hist-${i}` ? (
                            <Check className="w-3.5 h-3.5 text-green" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ATTRIBUTION & BUDGET PLANNER */}
      {/* ========================================================================= */}
      {activeTab === "attribution" && (
        <div className="space-y-6">
          {/* Spotlight Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue/15 to-emerald-500/10 border border-blue/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">🏆</span>
                <h3 className="text-base font-bold text-text-primary">
                  Top Converting Channel: {topChannel}
                </h3>
              </div>
              <p className="text-xs text-text-secondary">
                Delivers the highest intent-to-lead conversion rate among your tested acquisition sources.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-text-tertiary">Tracked Visitors</p>
                <p className="text-xl font-bold font-mono">{totalVisitors.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-text-tertiary">Verified Leads</p>
                <p className="text-xl font-bold font-mono text-emerald-400">
                  {totalLeads.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Attribution Table */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Multi-Channel Conversion Performance</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-surface-elevated/50 border-b border-border text-text-tertiary font-medium">
                        <tr>
                          <th className="py-3 px-4">Channel Source</th>
                          <th className="py-3 px-4">Visitors</th>
                          <th className="py-3 px-4">Leads</th>
                          <th className="py-3 px-4">Pre-Orders</th>
                          <th className="py-3 px-4">CVR (%)</th>
                          <th className="py-3 px-4">Est. Cost/Lead</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {attribution.map((ch) => (
                          <tr key={ch.source} className={ch.isWinner ? "bg-emerald-500/5" : ""}>
                            <td className="py-3.5 px-4 font-medium text-text-primary flex items-center gap-2">
                              {ch.isWinner && (
                                <Badge variant="green" className="text-[9px] py-0 px-1.5">
                                  Winner
                                </Badge>
                              )}
                              <span>{ch.channel}</span>
                            </td>
                            <td className="py-3.5 px-4 font-mono">{ch.visitors}</td>
                            <td className="py-3.5 px-4 font-mono font-semibold text-text-primary">
                              {ch.leads}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-emerald-400">
                              {ch.preorders}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold">
                              {ch.conversionRate}%
                            </td>
                            <td className="py-3.5 px-4 font-mono text-text-tertiary">
                              {ch.costPerLead ? `$${ch.costPerLead.toFixed(2)}` : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Validation Budget & CPC Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Calculator className="w-4 h-4 text-blue" />
                  <span>Validation Budget Calculator</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-text-secondary">Target Sample Size</span>
                    <strong className="text-text-primary font-mono">{targetVisitors} visitors</strong>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="50"
                    value={targetVisitors}
                    onChange={(e) => setTargetVisitors(Number(e.target.value))}
                    className="w-full accent-blue cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-text-secondary">Estimated CPC ($)</span>
                    <strong className="text-text-primary font-mono">${estimatedCpc.toFixed(2)}</strong>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="10.0"
                    step="0.1"
                    value={estimatedCpc}
                    onChange={(e) => setEstimatedCpc(Number(e.target.value))}
                    className="w-full accent-blue cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-text-tertiary pt-1">
                    <span>Meta: ~$1.20</span>
                    <span>Google: ~$2.80</span>
                    <span>LinkedIn: ~$4.80</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-text-secondary">Target Conversion Rate</span>
                    <strong className="text-text-primary font-mono">{expectedCvr}%</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.5"
                    value={expectedCvr}
                    onChange={(e) => setExpectedCvr(Number(e.target.value))}
                    className="w-full accent-blue cursor-pointer"
                  />
                </div>

                {/* Calculation Output Box */}
                <div className="p-4 rounded-xl bg-surface-elevated border border-border space-y-3 pt-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-text-secondary">Required Ad Spend:</span>
                    <span className="text-xl font-bold font-mono text-blue">
                      ${calculatedBudget.totalCost}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-t border-border pt-2">
                    <span className="text-text-secondary">Projected Leads:</span>
                    <span className="font-bold font-mono text-emerald-400">
                      {calculatedBudget.projectedLeads} leads
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-t border-border pt-2">
                    <span className="text-text-secondary">Projected Cost / Lead:</span>
                    <span className="font-mono text-text-primary">
                      ${calculatedBudget.costPerLead}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
