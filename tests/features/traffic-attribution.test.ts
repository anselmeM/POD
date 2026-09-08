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
import { GET as attributionGet } from "@/app/api/traffic/attribution/route";

describe("Traffic Attribution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getAuthenticatedWorkspace as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "usr-1", email: "growth@startup.io", name: "Growth Lead" },
      workspace: { id: "ws-1", name: "Acme Workspace", plan: "scale" },
    });
  });

  describe("GET /api/traffic/attribution", () => {
    it("returns 401 if unauthorized", async () => {
      (getAuthenticatedWorkspace as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/api/traffic/attribution");
      const res = await attributionGet(req);
      expect(res.status).toBe(401);
    });

    it("returns 403 when experimentId belongs to another workspace", async () => {
      (prisma.experiment.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/api/traffic/attribution?experimentId=exp-foreign");
      const res = await attributionGet(req);
      expect(res.status).toBe(403);
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
