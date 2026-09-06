import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import {
  hashForAdNetwork,
  formatMetaCapiPayload,
  formatGoogleAdsPayload,
  formatLinkedInPayload,
  buildAdConversionPayload,
  createSampleAdPayload,
  dispatchAdWebhooks,
  AdConversionData,
} from "@/lib/webhooks";

// Mock Auth & Workspace
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));
vi.mock("@/lib/workspace", () => ({
  getAuthenticatedWorkspace: vi.fn(),
}));

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    webhook: {
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { auth } from "@/lib/auth";
import { getAuthenticatedWorkspace } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { POST as testWebhookPost, GET as testWebhookGet } from "@/app/api/webhooks/test/route";

describe("Ad Network Conversion Webhooks Engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("hashForAdNetwork()", () => {
    it("lowercases and trims strings before generating SHA-256 hex", () => {
      const email1 = "Founder@Example.com ";
      const email2 = "founder@example.com";
      const hash1 = hashForAdNetwork(email1);
      const hash2 = hashForAdNetwork(email2);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
      // SHA-256 for "founder@example.com"
      expect(hash1).toMatch(/^[a-f0-9]{64}$/);
    });

    it("returns empty string when input is empty or null", () => {
      expect(hashForAdNetwork("")).toBe("");
      expect(hashForAdNetwork("   ")).toBe("");
    });
  });

  describe("formatMetaCapiPayload()", () => {
    it("formats a Purchase event for verified pre-orders with value and fbclid", () => {
      const data: AdConversionData = {
        leadId: "lead-123",
        email: "alice@company.com",
        name: "Alice Founder",
        isPreorder: true,
        depositAmount: 10000, // $100.00
        landingPageName: "AI Sales Copilot",
        landingPageSlug: "sales-copilot",
        fbclid: "fbclid_sample_987",
        timestamp: 1717200000000,
      };

      const meta = formatMetaCapiPayload(data);
      expect(meta.event_name).toBe("Purchase");
      expect(meta.event_time).toBe(1717200000);
      expect(meta.user_data.em[0]).toBe(hashForAdNetwork("alice@company.com"));
      expect(meta.user_data.fn[0]).toBe(hashForAdNetwork("Alice"));
      expect(meta.user_data.fbc).toContain("fbclid_sample_987");
      expect(meta.custom_data.value).toBe(100);
      expect(meta.custom_data.currency).toBe("USD");
      expect(meta.custom_data.status).toBe("preorder_reserved");
    });

    it("formats a Lead event for waitlist captures with 0 dollar value", () => {
      const data: AdConversionData = {
        leadId: "lead-456",
        email: "bob@prospect.io",
        isPreorder: false,
        depositAmount: 0,
        landingPageSlug: "crm-ai",
      };

      const meta = formatMetaCapiPayload(data);
      expect(meta.event_name).toBe("Lead");
      expect(meta.custom_data.value).toBe(0);
      expect(meta.custom_data.status).toBe("lead_captured");
    });
  });

  describe("formatGoogleAdsPayload()", () => {
    it("formats preorder_deposit offline conversion with gclid and consent parameters", () => {
      const data: AdConversionData = {
        leadId: "lead-789",
        email: "carol@google-user.com",
        isPreorder: true,
        depositAmount: 4900, // $49.00
        gclid: "Cj0KCQj_SAMPLE_GCLID",
        timestamp: 1717200000000,
      };

      const google = formatGoogleAdsPayload(data);
      expect(google.conversion_action).toBe("preorder_deposit");
      expect(google.gclid).toBe("Cj0KCQj_SAMPLE_GCLID");
      expect(google.conversion_value).toBe(49);
      expect(google.currency_code).toBe("USD");
      expect(google.user_identifiers[0].hashed_email).toBe(hashForAdNetwork("carol@google-user.com"));
      expect(google.consent.ad_user_data).toBe("GRANTED");
      expect(google.consent.ad_personalization).toBe("GRANTED");
    });
  });

  describe("formatLinkedInPayload()", () => {
    it("formats PreOrderReservation with li_fat_id and SHA256 email", () => {
      const data: AdConversionData = {
        leadId: "lead-999",
        email: "david@enterprise.com",
        isPreorder: true,
        depositAmount: 25000, // $250.00
        liFatId: "li_fat_SAMPLE_123",
      };

      const li = formatLinkedInPayload(data);
      expect(li.conversion).toBe("PreOrderReservation");
      expect(li.user.li_fat_id).toBe("li_fat_SAMPLE_123");
      expect(li.user.user_id.id_type).toBe("SHA256_EMAIL");
      expect(li.user.user_id.id_value).toBe(hashForAdNetwork("david@enterprise.com"));
      expect(li.value.amount).toBe("250.00");
    });
  });

  describe("buildAdConversionPayload()", () => {
    it("constructs full unified payload with solo founder signals and backwards compatibility", () => {
      const data: AdConversionData = {
        leadId: "lead-xyz",
        email: "elena@startup.com",
        name: "Elena Rostova",
        isPreorder: true,
        depositAmount: 10000,
        utmSource: "facebook",
        utmCampaign: "sprint_q3",
        fbclid: "fbclid_123",
      };

      const payload = buildAdConversionPayload(data);
      expect(payload.event).toBe("preorder.reserved");
      expect(payload.soloFounderSignal.willingToPay).toBe(true);
      expect(payload.soloFounderSignal.depositCapturedUsd).toBe(100);
      expect(payload.soloFounderSignal.verdict).toBe("STRONG_PAYING_DEMAND");

      // Backwards compatibility for legacy webhook listeners
      expect(payload.data.id).toBe("lead-xyz");
      expect(payload.data.email).toBe("elena@startup.com");
      expect(payload.lead.id).toBe("lead-xyz");

      // Multi-network schemas attached
      expect(payload.adNetworks.meta_capi.event_name).toBe("Purchase");
      expect(payload.adNetworks.google_ads.conversion_action).toBe("preorder_deposit");
      expect(payload.adNetworks.linkedin_ads.conversion).toBe("PreOrderReservation");
    });
  });

  describe("createSampleAdPayload()", () => {
    it("returns pre-populated realistic payload for simulation and verification", () => {
      const sample = createSampleAdPayload(true);
      expect(sample.event).toBe("preorder.reserved");
      expect(sample.soloFounderSignal.willingToPay).toBe(true);
      expect(sample.soloFounderSignal.depositCapturedUsd).toBe(100);
      expect(sample.adNetworks.meta_capi).toBeDefined();
      expect(sample.adNetworks.google_ads).toBeDefined();
      expect(sample.adNetworks.linkedin_ads).toBeDefined();
    });
  });

  describe("dispatchAdWebhooks()", () => {
    it("gracefully returns dispatched: 0 when no webhooks exist", async () => {
      (prisma.webhook.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const result = await dispatchAdWebhooks("ws-1", {
        leadId: "lead-1",
        isPreorder: false,
      });

      expect(result.dispatched).toBe(0);
    });

    it("fans out conversion payload to active webhooks", async () => {
      (prisma.webhook.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
        { id: "wh-1", url: "https://zapier.com/hooks/1", secret: "whsec_test" },
      ]);

      const mockFetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true })));
      global.fetch = mockFetch;

      const result = await dispatchAdWebhooks("ws-1", {
        leadId: "lead-1",
        email: "test@example.com",
        isPreorder: true,
        depositAmount: 10000,
      });

      expect(result.dispatched).toBe(1);
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe("API Route: /api/webhooks/test", () => {
    it("returns 401 when unauthorized", async () => {
      (getAuthenticatedWorkspace as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/api/webhooks/test", {
        method: "POST",
        body: JSON.stringify({ url: "https://example.com/webhook" }),
      });

      const res = await testWebhookPost(req);
      expect(res.status).toBe(401);
    });

    it("returns sample schema when no URL is provided", async () => {
      (getAuthenticatedWorkspace as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: "usr-1", email: "founder@pod.app" },
        workspace: { id: "ws-1", name: "Founder Workspace" },
      });

      const req = new NextRequest("http://localhost:3000/api/webhooks/test", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const res = await testWebhookPost(req);
      const json = await res.json();
      expect(res.status).toBe(200);
      expect(json.sample).toBe(true);
      expect(json.payload).toBeDefined();
    });

    it("rejects invalid URL format", async () => {
      (getAuthenticatedWorkspace as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: "usr-1", email: "founder@pod.app" },
        workspace: { id: "ws-1", name: "Founder Workspace" },
      });

      const req = new NextRequest("http://localhost:3000/api/webhooks/test", {
        method: "POST",
        body: JSON.stringify({ url: "not-a-valid-url" }),
      });

      const res = await testWebhookPost(req);
      expect(res.status).toBe(400);
    });

    it("dispatches live ping to destination URL and measures latency", async () => {
      (getAuthenticatedWorkspace as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: "usr-1", email: "founder@pod.app" },
        workspace: { id: "ws-1", name: "Founder Workspace" },
      });

      const mockFetch = vi.fn().mockResolvedValue(new Response("OK", { status: 200 }));
      global.fetch = mockFetch;

      const req = new NextRequest("http://localhost:3000/api/webhooks/test", {
        method: "POST",
        body: JSON.stringify({ url: "https://hooks.zapier.com/catch/test", isPreorder: true }),
      });

      const res = await testWebhookPost(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.statusCode).toBe(200);
      expect(json.responseTimeMs).toBeGreaterThanOrEqual(0);
      expect(json.payload.soloFounderSignal.willingToPay).toBe(true);
    });

    it("GET returns sample payload for documentation", async () => {
      (getAuthenticatedWorkspace as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: "usr-1", email: "founder@pod.app" },
        workspace: { id: "ws-1", name: "Founder Workspace" },
      });

      const res = await testWebhookGet();
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.samplePayload).toBeDefined();
    });
  });
});
