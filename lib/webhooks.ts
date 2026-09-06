/**
 * ============================================================================
 * AD NETWORK CONVERSION WEBHOOKS & MULTI-PLATFORM DISPATCH ENGINE
 * ============================================================================
 *
 * This module generates normalized, privacy-preserving conversion payloads for:
 * 1. Meta Conversions API (CAPI) (fbclid, SHA-256 hashed PII, value)
 * 2. Google Ads Enhanced / Offline Conversions (gclid, hashed email, value)
 * 3. LinkedIn Ads Conversions (li_fat_id, SHA-256 email)
 *
 * It bridges public smoke-test landing pages (`/p/[slug]`) and solo-founder ad
 * budgets so founders can feed verified "Willingness to Pay" back into ad algos.
 */

import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

export interface AdConversionData {
  leadId: string;
  email?: string;
  name?: string;
  company?: string;
  role?: string;
  source?: string;
  intentScore?: number;
  isPreorder: boolean;
  depositAmount?: number; // in cents, e.g. 10000 = $100.00
  stripeSessionId?: string | null;
  landingPageName?: string;
  landingPageSlug?: string;
  landingPageUrl?: string;
  experimentId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  gclid?: string;
  fbclid?: string;
  liFatId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp?: number;
}

/**
 * Standard SHA-256 hashing for PII required by Meta, Google, and LinkedIn.
 * String is trimmed and lowercased per ad network spec.
 */
export function hashForAdNetwork(value: string): string {
  if (!value) return "";
  const normalized = value.trim().toLowerCase();
  if (!normalized) return "";
  return createHash("sha256").update(normalized).digest("hex");
}

/**
 * Formats data for Meta Conversions API (CAPI).
 * Compatible with Meta Graph API /v19.0/{pixel_id}/events
 */
export function formatMetaCapiPayload(data: AdConversionData) {
  const ts = Math.floor((data.timestamp || Date.now()) / 1000);
  const emailHash = data.email ? hashForAdNetwork(data.email) : undefined;
  const firstName = data.name ? data.name.split(" ")[0] : undefined;
  const firstNameHash = firstName ? hashForAdNetwork(firstName) : undefined;

  return {
    event_name: data.isPreorder ? "Purchase" : "Lead",
    event_time: ts,
    event_source_url: data.landingPageUrl || `https://pod.app/p/${data.landingPageSlug || "smoke-test"}`,
    action_source: "website",
    user_data: {
      em: emailHash ? [emailHash] : [],
      fn: firstNameHash ? [firstNameHash] : [],
      fbc: data.fbclid ? `fb.1.${data.timestamp || Date.now()}.${data.fbclid}` : undefined,
      client_ip_address: data.ipAddress || undefined,
      client_user_agent: data.userAgent || undefined,
    },
    custom_data: {
      currency: "USD",
      value: data.depositAmount ? Number((data.depositAmount / 100).toFixed(2)) : 0,
      content_name: data.landingPageName || "Smoke Test Validation",
      content_category: "Proof of Demand Validation",
      status: data.isPreorder ? "preorder_reserved" : "lead_captured",
      intent_score: data.intentScore || (data.isPreorder ? 98 : 90),
    },
  };
}

/**
 * Formats data for Google Ads Enhanced & Offline Conversions.
 */
export function formatGoogleAdsPayload(data: AdConversionData) {
  const emailHash = data.email ? hashForAdNetwork(data.email) : undefined;
  const isoTime = new Date(data.timestamp || Date.now()).toISOString();

  return {
    conversion_action: data.isPreorder ? "preorder_deposit" : "lead_signup",
    conversion_date_time: isoTime,
    gclid: data.gclid || undefined,
    conversion_value: data.depositAmount ? Number((data.depositAmount / 100).toFixed(2)) : 0,
    currency_code: "USD",
    user_identifiers: [
      ...(emailHash ? [{ hashed_email: emailHash }] : []),
    ],
    consent: {
      ad_user_data: "GRANTED",
      ad_personalization: "GRANTED",
    },
  };
}

/**
 * Formats data for LinkedIn Ads Conversions API.
 */
export function formatLinkedInPayload(data: AdConversionData) {
  const emailHash = data.email ? hashForAdNetwork(data.email) : undefined;

  return {
    conversion: data.isPreorder ? "PreOrderReservation" : "LeadGenForm",
    conversion_happened_at: data.timestamp || Date.now(),
    user: {
      user_id: {
        id_type: "SHA256_EMAIL",
        id_value: emailHash || "",
      },
      li_fat_id: data.liFatId || undefined,
    },
    value: {
      currency_code: "USD",
      amount: data.depositAmount ? (data.depositAmount / 100).toFixed(2) : "0.00",
    },
  };
}

/**
 * Builds the full unified conversion payload that is dispatched to customer webhooks
 * (Zapier, Make, n8n, Meta CAPI endpoint, Google Ads webhook intake, etc.).
 */
export function buildAdConversionPayload(data: AdConversionData) {
  const eventName = data.isPreorder ? "preorder.reserved" : "lead.captured";
  const timestamp = data.timestamp || Date.now();
  const isoTimestamp = new Date(timestamp).toISOString();

  const leadPayload = {
    id: data.leadId,
    name: data.name || (data.isPreorder ? "Founding Backer" : "Anonymous Lead"),
    email: data.email || "",
    company: data.company || "",
    role: data.role || "",
    source: data.source || "",
    intentScore: data.intentScore || (data.isPreorder ? 98 : 90),
    isPreorder: data.isPreorder,
    depositAmount: data.depositAmount || 0,
    stripeSessionId: data.stripeSessionId || null,
    landingPage: {
      name: data.landingPageName || "",
      slug: data.landingPageSlug || "",
      url: data.landingPageUrl || "",
    },
    experimentId: data.experimentId || null,
    metadata: {
      utm_source: data.utmSource || null,
      utm_medium: data.utmMedium || null,
      utm_campaign: data.utmCampaign || null,
      utm_content: data.utmContent || null,
      utm_term: data.utmTerm || null,
      gclid: data.gclid || null,
      fbclid: data.fbclid || null,
      li_fat_id: data.liFatId || null,
    },
  };

  return {
    event: eventName,
    timestamp: isoTimestamp,
    soloFounderSignal: {
      willingToPay: data.isPreorder,
      intentScore: data.intentScore || (data.isPreorder ? 98 : 90),
      depositCapturedUsd: data.depositAmount ? Number((data.depositAmount / 100).toFixed(2)) : 0,
      verdict: data.isPreorder ? "STRONG_PAYING_DEMAND" : "SOFT_INTEREST",
      recommendation: data.isPreorder
        ? "Audience has demonstrated hard financial commitment. Scale ad spend to capture market."
        : "Audience has soft interest. Validate pricing elasticity before committing engineering resources.",
    },
    lead: leadPayload,
    data: leadPayload, // Backwards-compatibility for existing Zapier/Make receivers
    attribution: leadPayload.metadata,
    landingPage: leadPayload.landingPage,
    experimentId: data.experimentId || null,
    // Standard pre-formatted ad network schemas for zero-code webhook routing
    adNetworks: {
      meta_capi: formatMetaCapiPayload({ ...data, timestamp }),
      google_ads: formatGoogleAdsPayload({ ...data, timestamp }),
      linkedin_ads: formatLinkedInPayload({ ...data, timestamp }),
    },
  };
}

/**
 * Asynchronously fans out conversion payloads to all active webhooks for a workspace.
 */
export async function dispatchAdWebhooks(workspaceId: string | null | undefined, data: AdConversionData) {
  try {
    const whereClause: any = { active: true };
    if (workspaceId) {
      whereClause.workspaceId = workspaceId;
    }

    const webhooks = await prisma.webhook.findMany({
      where: whereClause,
    });

    if (webhooks.length === 0) return { dispatched: 0 };

    const payload = buildAdConversionPayload(data);
    const bodyStr = JSON.stringify(payload);

    // Fan-out with timeout tolerance (5000ms)
    await Promise.allSettled(
      webhooks.map(async (wh) => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        try {
          await fetch(wh.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-PoD-Event": data.isPreorder ? "preorder.reserved" : "lead.captured",
              ...(wh.secret ? { "X-PoD-Signature": wh.secret } : {}),
            },
            body: bodyStr,
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeout);
        }
      })
    );

    return { dispatched: webhooks.length };
  } catch (error) {
    console.warn("Ad webhook dispatch error:", error);
    return { dispatched: 0, error };
  }
}

/**
 * Creates realistic sample conversion payload for ad network testing.
 */
export function createSampleAdPayload(isPreorder: boolean = true) {
  const sampleData: AdConversionData = {
    leadId: "lead_demo_" + Math.random().toString(36).slice(2, 8),
    email: "sarah.connor@acme-robotics.com",
    name: "Sarah Connor",
    company: "Acme Cybernetics",
    role: "VP of Operations",
    source: "meta_paid_ad",
    intentScore: isPreorder ? 98 : 90,
    isPreorder,
    depositAmount: isPreorder ? 10000 : 0, // $100.00
    stripeSessionId: isPreorder ? "cs_test_a1b2c3d4e5f6g7h8" : null,
    landingPageName: "AI Workflow Copilot",
    landingPageSlug: "ai-copilot",
    landingPageUrl: "https://pod.app/p/ai-copilot",
    experimentId: "exp_preview_101",
    utmSource: "meta",
    utmMedium: "paid_social",
    utmCampaign: "validation_sprint_q3",
    utmContent: "video_demo_v2",
    utmTerm: "b2b_automation",
    fbclid: "fb.1.1717200000.IwAR2xYZ_SAMPLE_CLICK_ID_987",
    gclid: "Cj0KCQj SAMPLE_GOOGLE_CLICK_ID_123",
    liFatId: "li_fat_SAMPLE_LINKEDIN_CLICK_ID_456",
    ipAddress: "198.51.100.42",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    timestamp: Date.now(),
  };

  return buildAdConversionPayload(sampleData);
}
