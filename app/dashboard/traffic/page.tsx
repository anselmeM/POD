"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Target, Share2, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ChannelAttribution as ChannelAttributionType } from "@/lib/types";

import { UtmLinkGenerator } from "./components/UtmLinkGenerator";
import { ChannelAttribution } from "./components/ChannelAttribution";
import { AdWebhookDispatcher } from "./components/AdWebhookDispatcher";

export default function TrafficCampaignPage() {
  const [activeTab, setActiveTab] = useState<"utm-builder" | "attribution" | "ad-webhooks">("utm-builder");

  // Selection & Context
  const [, setExperiments] = useState<any[]>([]);
  const [landingPages, setLandingPages] = useState<any[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [selectedTitle, setSelectedTitle] = useState<string>("B2B Workflow Automation");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // UTM Builder State
  const [baseUrl, setBaseUrl] = useState("");
  const [utmSource, setUtmSource] = useState("linkedin");
  const [utmMedium, setUtmMedium] = useState("sponsored_content");
  const [utmCampaign, setUtmCampaign] = useState("validation_sprint_v1");
  const [utmTerm, setUtmTerm] = useState("operations_leaders");
  const [utmContent, setUtmContent] = useState("angle_speed_roi");
  const [recentLinks, setRecentLinks] = useState<string[]>([]);

  // Attribution State
  const [attribution, setAttribution] = useState<ChannelAttributionType[]>([]);
  const [attributionLoading, setAttributionLoading] = useState(false);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [totalLeads, setTotalLeads] = useState(0);
  const [topChannel, setTopChannel] = useState("LinkedIn Ads");

  // Budget Calculator State
  const [targetVisitors, setTargetVisitors] = useState(250);
  const [estimatedCpc, setEstimatedCpc] = useState(2.2);
  const [expectedCvr, setExpectedCvr] = useState(6.5);

  // Webhooks State
  const [registeredWebhooks, setRegisteredWebhooks] = useState<any[]>([]);
  const [webhookTestUrl, setWebhookTestUrl] = useState("");
  const [testIsPreorder, setTestIsPreorder] = useState(true);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [webhookTestResult, setWebhookTestResult] = useState<any>(null);
  const [samplePayload, setSamplePayload] = useState<any>(null);
  const [payloadTab, setPayloadTab] = useState<"full" | "meta" | "google" | "linkedin">("full");

  const copyToClipboard = useCallback((text: string, key: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  }, []);

  const fetchWebhooks = useCallback(() => {
    fetch("/api/webhooks")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        const list = j?.data || [];
        setRegisteredWebhooks(list);
        if (list.length > 0) {
          setWebhookTestUrl((prev) => prev || list[0].url);
        }
      })
      .catch(() => {});
  }, []);

  // Initial Data Fetching
  useEffect(() => {
    Promise.all([fetch("/api/experiments"), fetch("/api/landing-pages")])
      .then(async ([expRes, pageRes]) => {
        let defaultSlug = "smoke-test";

        if (expRes.ok) {
          const expData = await expRes.json();
          const list = Array.isArray(expData.data) ? expData.data : [];
          setExperiments(list);
          if (list.length > 0) {
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
      })
      .catch(() => {});

    fetchWebhooks();

    fetch("/api/webhooks/test")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j?.samplePayload) {
          setSamplePayload(j.samplePayload);
        }
      })
      .catch(() => {});
  }, [fetchWebhooks]);

  // Attribution lazy fetch
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
  };

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
        setUtmCampaign("google_search_v1");
        setUtmTerm("{keyword}");
        setUtmContent("{creative}");
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

  const handleTestWebhook = async () => {
    if (!webhookTestUrl) return;
    setTestingWebhook(true);
    setWebhookTestResult(null);
    try {
      const res = await fetch("/api/webhooks/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: webhookTestUrl,
          isPreorder: testIsPreorder,
        }),
      });
      const data = await res.json();
      setWebhookTestResult(data);
      if (data.payload) {
        setSamplePayload(data.payload);
      }
    } catch (err: any) {
      setWebhookTestResult({
        success: false,
        error: err?.message || "Failed to reach test server",
      });
    } finally {
      setTestingWebhook(false);
    }
  };

  const handleAddWebhook = async (url: string, events: string[]) => {
    const res = await fetch("/api/webhooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, events }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to add webhook");
    }
    fetchWebhooks();
  };

  const handleDeleteWebhook = async (id: string) => {
    await fetch(`/api/webhooks?id=${id}`, { method: "DELETE" });
    fetchWebhooks();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              Traffic & Attribution
            </h1>
            <Badge variant="blue" className="text-[10px] font-mono">
              Validation Traffic
            </Badge>
          </div>
          <p className="text-sm text-text-secondary">
            1-click UTM tracking builder, first-party attribution, and ad conversion webhooks.
          </p>
        </div>

        {/* Target Landing Page Selector */}
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

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border overflow-x-auto">
        <button
          onClick={() => setActiveTab("utm-builder")}
          className={`pb-3 px-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 cursor-pointer shrink-0 ${
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
          className={`pb-3 px-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === "attribution"
              ? "border-blue text-blue"
              : "border-transparent text-text-tertiary hover:text-text-primary"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Channel Attribution & Budget</span>
        </button>
        <button
          onClick={() => setActiveTab("ad-webhooks")}
          className={`pb-3 px-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === "ad-webhooks"
              ? "border-blue text-blue"
              : "border-transparent text-text-tertiary hover:text-text-primary"
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Ad Webhooks & Tracking</span>
          <Badge variant="green" className="text-[9px] px-1.5 py-0 h-4">
            Meta · Google · LinkedIn
          </Badge>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "utm-builder" && (
        <UtmLinkGenerator
          baseUrl={baseUrl}
          setBaseUrl={setBaseUrl}
          utmSource={utmSource}
          setUtmSource={setUtmSource}
          utmMedium={utmMedium}
          setUtmMedium={setUtmMedium}
          utmCampaign={utmCampaign}
          setUtmCampaign={setUtmCampaign}
          utmTerm={utmTerm}
          setUtmTerm={setUtmTerm}
          utmContent={utmContent}
          setUtmContent={setUtmContent}
          applyPreset={applyPreset}
          recentLinks={recentLinks}
          copiedKey={copiedKey}
          onCopy={copyToClipboard}
          onSaveToRecent={(url) => setRecentLinks((prev) => [url, ...prev.filter((l) => l !== url)].slice(0, 5))}
        />
      )}

      {activeTab === "attribution" && (
        <ChannelAttribution
          attribution={attribution}
          attributionLoading={attributionLoading}
          totalVisitors={totalVisitors}
          totalLeads={totalLeads}
          topChannel={topChannel}
          targetVisitors={targetVisitors}
          setTargetVisitors={setTargetVisitors}
          estimatedCpc={estimatedCpc}
          setEstimatedCpc={setEstimatedCpc}
          expectedCvr={expectedCvr}
          setExpectedCvr={setExpectedCvr}
          calculatedBudget={calculatedBudget}
        />
      )}

      {activeTab === "ad-webhooks" && (
        <AdWebhookDispatcher
          registeredWebhooks={registeredWebhooks}
          onRefreshWebhooks={fetchWebhooks}
          webhookTestUrl={webhookTestUrl}
          setWebhookTestUrl={setWebhookTestUrl}
          testIsPreorder={testIsPreorder}
          setTestIsPreorder={setTestIsPreorder}
          testingWebhook={testingWebhook}
          webhookTestResult={webhookTestResult}
          onTestWebhook={handleTestWebhook}
          samplePayload={samplePayload}
          payloadTab={payloadTab}
          setPayloadTab={setPayloadTab}
          onDeleteWebhook={handleDeleteWebhook}
          onAddWebhook={handleAddWebhook}
          copiedKey={copiedKey}
          onCopy={copyToClipboard}
        />
      )}
    </div>
  );
}
