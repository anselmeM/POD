"use client";

import React, { useMemo, useState } from "react";
import { Globe, Copy, Check, ExternalLink, QrCode, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface UtmLinkGeneratorProps {
  baseUrl: string;
  setBaseUrl: (url: string) => void;
  utmSource: string;
  setUtmSource: (source: string) => void;
  utmMedium: string;
  setUtmMedium: (medium: string) => void;
  utmCampaign: string;
  setUtmCampaign: (campaign: string) => void;
  utmTerm: string;
  setUtmTerm: (term: string) => void;
  utmContent: string;
  setUtmContent: (content: string) => void;
  applyPreset: (preset: "meta" | "linkedin" | "google" | "twitter" | "reddit" | "newsletter") => void;
  recentLinks: string[];
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
  onSaveToRecent: (url: string) => void;
}

export function UtmLinkGenerator({
  baseUrl,
  setBaseUrl,
  utmSource,
  setUtmSource,
  utmMedium,
  setUtmMedium,
  utmCampaign,
  setUtmCampaign,
  utmTerm,
  setUtmTerm,
  utmContent,
  setUtmContent,
  applyPreset,
  recentLinks,
  copiedKey,
  onCopy,
  onSaveToRecent,
}: UtmLinkGeneratorProps) {
  const [showQrModal, setShowQrModal] = useState(false);

  const generatedUrl = useMemo(() => {
    try {
      const url = new URL(baseUrl || "https://pod.app/p/smoke-test");
      if (utmSource) url.searchParams.set("utm_source", utmSource);
      if (utmMedium) url.searchParams.set("utm_medium", utmMedium);
      if (utmCampaign) url.searchParams.set("utm_campaign", utmCampaign);
      if (utmTerm) url.searchParams.set("utm_term", utmTerm);
      if (utmContent) url.searchParams.set("utm_content", utmContent);
      return url.toString();
    } catch {
      return baseUrl;
    }
  }, [baseUrl, utmSource, utmMedium, utmCampaign, utmTerm, utmContent]);

  const handleCopyTrackedUrl = () => {
    onCopy(generatedUrl, "full-url");
    onSaveToRecent(generatedUrl);
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    generatedUrl
  )}`;

  return (
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
                    { id: "linkedin", label: "LinkedIn Sponsored" },
                    { id: "meta", label: "Meta (FB / IG)" },
                    { id: "google", label: "Google Search (CPC)" },
                    { id: "twitter", label: "X (Twitter)" },
                    { id: "reddit", label: "Reddit Ads" },
                    { id: "newsletter", label: "Newsletter / Substack" },
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

              {/* Base URL */}
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

              {/* Source & Medium */}
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
                    placeholder="e.g. paid_social, cpc, email"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-text-primary focus:outline-none focus:border-blue"
                  />
                </div>
              </div>

              {/* Campaign, Term, Content */}
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

              <div className="flex items-center gap-3 pt-1 flex-wrap">
                <Button
                  onClick={handleCopyTrackedUrl}
                  className="flex-1 bg-blue hover:bg-blue/90 text-white cursor-pointer min-w-[160px]"
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

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowQrModal(true)}
                  className="cursor-pointer flex items-center gap-1.5 text-xs"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QR Code</span>
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
                      type="button"
                      onClick={() => onCopy(lnk, `hist-${i}`)}
                      className="text-text-tertiary hover:text-white cursor-pointer"
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

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl text-center">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <QrCode className="w-4 h-4 text-blue" />
                Scannable Campaign QR Code
              </h3>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="text-text-tertiary hover:text-text-primary p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-white p-4 rounded-xl inline-block mx-auto border border-border shadow-sm">
              <img
                src={qrImageUrl}
                alt="Campaign QR Code"
                className="w-48 h-48 block mx-auto"
              />
            </div>
            <p className="text-xs text-text-secondary font-mono break-all line-clamp-2">
              {generatedUrl}
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowQrModal(false)}
              className="w-full text-xs"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
