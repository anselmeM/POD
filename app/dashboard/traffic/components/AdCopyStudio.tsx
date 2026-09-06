"use client";

import React, { useMemo } from "react";
import { Copy, Check, RefreshCw, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdCopyVariation, AdPlatform } from "@/lib/types";

interface AdCopyStudioProps {
  selectedSlug: string;
  selectedTitle: string;
  variations: AdCopyVariation[];
  targetingBlueprint: any;
  adLoading: boolean;
  platformFilter: "all" | AdPlatform;
  onFilterChange: (p: "all" | AdPlatform) => void;
  onRegenerate: () => void;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
}

export function AdCopyStudio({
  selectedSlug,
  selectedTitle,
  variations,
  targetingBlueprint,
  adLoading,
  platformFilter,
  onFilterChange,
  onRegenerate,
  copiedKey,
  onCopy,
}: AdCopyStudioProps) {
  const filteredVariations = useMemo(() => {
    if (platformFilter === "all") return variations;
    return variations.filter((v) => v.platform === platformFilter);
  }, [variations, platformFilter]);

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-elevated/60 p-3 rounded-2xl border border-border">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-text-tertiary mr-1 font-medium">Channel:</span>
          {(["all", "meta", "linkedin", "google", "twitter"] as const).map((plt) => (
            <button
              key={plt}
              type="button"
              onClick={() => onFilterChange(plt)}
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
          onClick={onRegenerate}
          disabled={adLoading}
          className="flex items-center gap-1.5 cursor-pointer"
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
                            ? "pod.app/beta"
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
                        <span>https://pod.app/{ad.displayPath}</span>
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
                            pod.app/p/{selectedSlug}
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
                      type="button"
                      onClick={() => onCopy(ad.headline, `${ad.id}-headline`)}
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
                        type="button"
                        onClick={() => onCopy(ad.primaryText || "", `${ad.id}-body`)}
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
                    onCopy(fullBundle, `${ad.id}-bundle`);
                  }}
                  className="text-xs cursor-pointer"
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
  );
}
