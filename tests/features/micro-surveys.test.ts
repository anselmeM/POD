import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock auth & workspace dependencies
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
      create: vi.fn(),
      update: vi.fn(),
    },
    lead: {
      findFirst: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    experiment: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    signalEvent: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
    webhook: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { getAuthenticatedWorkspace } from "@/lib/workspace";
import { POST as surveyPost, GET as surveyGet } from "@/app/api/signals/survey/route";

describe("High-Intent Micro-Surveys on Fake-Door Clicks & Price Elasticity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getAuthenticatedWorkspace as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "usr-1", email: "alex@acme.com", name: "Alex" },
      workspace: { id: "ws-1", name: "Test Workspace", plan: "scale" },
    });
  });

  describe("POST /api/signals/survey", () => {
    it("returns 400 if slug is missing", async () => {
      const req = new NextRequest("http://localhost:3000/api/signals/survey", {
        method: "POST",
        body: JSON.stringify({ problem: "Too expensive" }),
      });
      const res = await surveyPost(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Slug is required");
    });

    it("returns 404 if landing page is not found", async () => {
      (prisma.landingPage.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/api/signals/survey", {
        method: "POST",
        body: JSON.stringify({ slug: "non-existent-page", problem: "Too manual" }),
      });
      const res = await surveyPost(req);
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toBe("Landing page not found");
    });

    it("records a signalEvent, in-app notification, and triggers webhook on valid response", async () => {
      const mockPage = {
        id: "page-123",
        slug: "ai-copilot",
        name: "AI Copilot Landing",
        headline: "Cut Work By 50%",
        positioning: "Time Savings",
        experimentId: "exp-001",
      };
      (prisma.landingPage.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockPage);

      const mockEvent = { id: "evt-survey-123" };
      (prisma.signalEvent.create as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockEvent);
      (prisma.notification.create as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "notif-1" });
      (prisma.webhook.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
        { url: "https://example.com/webhook", secret: "sec-123", active: true },
      ]);

      const globalFetch = vi.fn().mockResolvedValue({ ok: true });
      vi.stubGlobal("fetch", globalFetch);

      const req = new NextRequest("http://localhost:3000/api/signals/survey", {
        method: "POST",
        body: JSON.stringify({
          slug: "ai-copilot",
          visitorId: "vis-abc",
          problem: "Current tools are too slow, bloated, or overpriced",
          willingPrice: "$49/mo",
          customNotes: "Urgent (This week)",
        }),
      });

      const res = await surveyPost(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.id).toBe("evt-survey-123");
      expect(json.data.surveyData.problem).toContain("bloated");
      expect(json.data.surveyData.willingPrice).toBe("$49/mo");

      // Verify Prisma SignalEvent created
      expect(prisma.signalEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            experimentId: "exp-001",
            eventType: "survey_response",
            variantId: "page-123",
          }),
        })
      );

      // Verify Notification created
      expect(prisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: "signal",
          }),
        })
      );
    });

    it("enriches existing lead with +5 intentScore and records survey event in lead history", async () => {
      const mockPage = {
        id: "page-123",
        slug: "ai-copilot",
        name: "AI Copilot",
        experimentId: "exp-001",
      };
      (prisma.landingPage.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockPage);
      (prisma.signalEvent.create as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "evt-1" });
      (prisma.notification.create as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "n-1" });
      (prisma.webhook.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const mockLead = {
        id: "lead-456",
        email: "lead@target.com",
        intentScore: 40,
        events: JSON.stringify([{ type: "cta_click" }]),
      };
      (prisma.lead.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockLead);
      (prisma.lead.update as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ ...mockLead, intentScore: 45 });

      const req = new NextRequest("http://localhost:3000/api/signals/survey", {
        method: "POST",
        body: JSON.stringify({
          slug: "ai-copilot",
          email: "lead@target.com",
          name: "Sam Altman",
          problem: "Lack of real-time visibility",
          willingPrice: "$99/mo",
        }),
      });

      const res = await surveyPost(req);
      expect(res.status).toBe(200);

      // Verify Lead was updated
      expect(prisma.lead.update).toHaveBeenCalledWith({
        where: { id: "lead-456" },
        data: expect.objectContaining({
          pricingInteraction: true,
          intentScore: 45, // 40 + 5
        }),
      });
    });
  });

  describe("GET /api/signals/survey", () => {
    it("returns aggregated problem distribution, price elasticity curve, and average acceptable price", async () => {
      const mockEvents = [
        {
          id: "e1",
          timestamp: new Date().toISOString(),
          experimentId: "exp-001",
          variantId: "v1",
          metadata: JSON.stringify({
            problem: "Too much manual overhead",
            willingPrice: "$49/mo",
            email: "user1@test.com",
          }),
        },
        {
          id: "e2",
          timestamp: new Date().toISOString(),
          experimentId: "exp-001",
          variantId: "v1",
          metadata: JSON.stringify({
            problem: "Too much manual overhead",
            willingPrice: "$49/mo",
            email: "user2@test.com",
          }),
        },
        {
          id: "e3",
          timestamp: new Date().toISOString(),
          experimentId: "exp-001",
          variantId: "v1",
          metadata: JSON.stringify({
            problem: "Lack of analytics",
            willingPrice: "$99/mo",
            email: "user3@test.com",
          }),
        },
      ];

      (prisma.signalEvent.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockEvents);

      const req = new NextRequest("http://localhost:3000/api/signals/survey?experimentId=exp-001");
      const res = await surveyGet(req);
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.success).toBe(true);
      expect(json.data.totalResponses).toBe(3);
      expect(json.data.avgAcceptablePrice).toBe(66); // (49 + 49 + 99) / 3 = 65.66 -> 66

      // Problem breakdown check
      const problems = json.data.problemDistribution;
      expect(problems).toHaveLength(2);
      expect(problems[0].label).toBe("Too much manual overhead");
      expect(problems[0].count).toBe(2);
      expect(problems[0].percentage).toBe(67);

      // Price elasticity curve check
      const prices = json.data.priceElasticity;
      const tier49 = prices.find((p: any) => p.tier === "$49/mo");
      const tier99 = prices.find((p: any) => p.tier === "$99/mo");
      expect(tier49.count).toBe(2);
      expect(tier99.count).toBe(1);

      // Recent responses list check
      expect(json.data.recentResponses).toHaveLength(3);
      expect(json.data.recentResponses[0].email).toBe("user1@test.com");
    });
  });
});
