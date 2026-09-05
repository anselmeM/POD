import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock Auth & Workspace
vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/workspace", () => ({
  getAuthenticatedWorkspace: vi.fn(),
}));

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    landingPage: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    experiment: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    signalEvent: {
      findMany: vi.fn(),
    },
    lead: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { getAuthenticatedWorkspace } from "@/lib/workspace";
import { POST as adCampaignPost } from "@/app/api/ai/ad-campaign/route";
import { GET as attributionGet } from "@/app/api/traffic/attribution/route";

describe("Traffic & Multi-Channel Ad Campaign Kit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getAuthenticatedWorkspace as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "usr-1", email: "growth@startup.io", name: "Growth Lead" },
      workspace: { id: "ws-1", name: "Acme Workspace", plan: "scale" },
    });
  });

  describe("POST /api/ai/ad-campaign", () => {
    it("returns 401 if unauthorized", async () => {
      (getAuthenticatedWorkspace as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/api/ai/ad-campaign", {
        method: "POST",
        body: JSON.stringify({ conceptTitle: "Legal AI Copilot" }),
      });
      const res = await adCampaignPost(req);
      expect(res.status).toBe(401);
    });

    it("generates platform-compliant ad variations for Meta, LinkedIn, Google, and Twitter", async () => {
      const req = new NextRequest("http://localhost:3000/api/ai/ad-campaign", {
        method: "POST",
        body: JSON.stringify({
          conceptTitle: "B2B Contract Automation",
          positioning: "Cut contract turnaround from 5 days to 20 minutes",
          targetAudience: "In-house Legal Counsels and General Counsels",
          slug: "legal-ai",
        }),
      });

      const res = await adCampaignPost(req);
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.success).toBe(true);
      expect(json.data.conceptTitle).toBe("B2B Contract Automation");
      expect(json.data.variations.length).toBeGreaterThanOrEqual(4);

      // Check Meta Ads variation
      const metaAd = json.data.variations.find((v: any) => v.platform === "meta");
      expect(metaAd).toBeDefined();
      expect(metaAd.headline).toBeDefined();
      expect(metaAd.primaryText).toContain("B2B Contract Automation");

      // Check LinkedIn Ads variation
      const linkedinAd = json.data.variations.find((v: any) => v.platform === "linkedin");
      expect(linkedinAd).toBeDefined();
      expect(linkedinAd.headline.length).toBeLessThanOrEqual(70);
      expect(linkedinAd.callToAction).toBeDefined();

      // Check Google Search RSA variation
      const googleAd = json.data.variations.find((v: any) => v.platform === "google");
      expect(googleAd).toBeDefined();
      expect(googleAd.headlines).toBeDefined();
      expect(googleAd.headlines.length).toBe(3);
      for (const h of googleAd.headlines) {
        expect(h.length).toBeLessThanOrEqual(30);
      }
      expect(googleAd.descriptions).toBeDefined();
      expect(googleAd.descriptions.length).toBe(2);
      for (const d of googleAd.descriptions) {
        expect(d.length).toBeLessThanOrEqual(90);
      }

      // Check Targeting Blueprint
      const blueprint = json.data.targetingBlueprint;
      expect(blueprint).toBeDefined();
      expect(blueprint.targetJobTitles.length).toBeGreaterThan(0);
      expect(blueprint.recommendedKeywords.length).toBeGreaterThan(0);
      expect(blueprint.negativeKeywords).toContain("free");
      expect(blueprint.estimatedPlatformCpc.linkedin).toBeGreaterThan(
        blueprint.estimatedPlatformCpc.meta
      );
    });

    it("resolves context from database when landingPageId is passed", async () => {
      (prisma.landingPage.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "lp-99",
        name: "DevOps Observability Tool",
        headline: "Real-Time K8s Cost Observability",
        positioning: "Cloud Cost Optimization",
        slug: "k8s-cost",
      });

      const req = new NextRequest("http://localhost:3000/api/ai/ad-campaign", {
        method: "POST",
        body: JSON.stringify({ landingPageId: "lp-99" }),
      });

      const res = await adCampaignPost(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.conceptTitle).toContain("DevOps Observability Tool");
    });
  });

  describe("GET /api/traffic/attribution", () => {
    it("returns 401 if unauthorized", async () => {
      (getAuthenticatedWorkspace as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/api/traffic/attribution");
      const res = await attributionGet(req);
      expect(res.status).toBe(401);
    });

    it("aggregates traffic, leads, and preorders by channel with conversion rates", async () => {
      const mockEvents = [
        { id: "e1", metadata: JSON.stringify({ utm_source: "linkedin", utm_campaign: "beta_q1" }) },
        { id: "e2", metadata: JSON.stringify({ utm_source: "linkedin", utm_campaign: "beta_q1" }) },
        { id: "e3", metadata: JSON.stringify({ utm_source: "facebook", utm_campaign: "social_promo" }) },
        { id: "e4", metadata: JSON.stringify({ utm_source: "google", gclid: "abc123xyz" }) },
      ];

      const mockLeads = [
        { id: "l1", source: "linkedin", isPreorder: true },
        { id: "l2", source: "facebook", isPreorder: false },
      ];

      (prisma.signalEvent.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockEvents);
      (prisma.lead.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockLeads);

      const req = new NextRequest("http://localhost:3000/api/traffic/attribution");
      const res = await attributionGet(req);
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.success).toBe(true);
      expect(json.data.channels).toBeDefined();

      // Check LinkedIn channel
      const linkedin = json.data.channels.find((c: any) => c.source === "linkedin");
      expect(linkedin).toBeDefined();
      expect(linkedin.visitors).toBe(2);
      expect(linkedin.leads).toBe(1);
      expect(linkedin.preorders).toBe(1);
      expect(linkedin.conversionRate).toBe(50); // 1 / 2 * 100

      // Check Meta channel
      const meta = json.data.channels.find((c: any) => c.source === "meta");
      expect(meta).toBeDefined();
      expect(meta.visitors).toBe(1);
      expect(meta.leads).toBe(1);

      // Check campaign grouping
      expect(json.data.campaigns).toBeDefined();
      const betaCampaign = json.data.campaigns.find((c: any) => c.name === "beta_q1");
      expect(betaCampaign).toBeDefined();
      expect(betaCampaign.visitors).toBe(2);
    });
  });
});
