import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn(), findFirst: vi.fn() },
    workspace: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), updateMany: vi.fn(), findFirst: vi.fn() },
    workspaceMember: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), count: vi.fn() },
    project: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn() },
    experiment: { findMany: vi.fn(), count: vi.fn(), create: vi.fn() },
    landingPage: { count: vi.fn(), create: vi.fn(), findUnique: vi.fn() },
    aIInsight: { findMany: vi.fn() },
    activityLog: { create: vi.fn() },
    notification: { create: vi.fn() },
  },
}));

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkWorkspaceLimit, getPlanLimits } from "@/lib/plan-limits";
import { POST as checkoutPost } from "@/app/api/stripe/checkout/route";
import { POST as webhookPost } from "@/app/api/webhooks/stripe/route";
import { POST as aiPost } from "@/app/api/ai/route";
import { POST as experimentPost } from "@/app/api/experiments/route";

describe("Phase 2: Commercial Monetization, Plan Limits & AI Gateway", { timeout: 15000 }, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { email: "founder@example.com", name: "Founder Alex" },
    });
    (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "usr-001",
      email: "founder@example.com",
      name: "Founder Alex",
      memberships: [
        {
          workspaceId: "ws-001",
          role: "owner",
          workspace: { id: "ws-001", name: "Alex Studio", plan: "trial" },
        },
      ],
    });
  });

  describe("Stripe Checkout API", () => {
    it("POST /api/stripe/checkout returns 401 if unauthenticated", async () => {
      (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      const req = {
        json: async () => ({ plan: "self-serve" }),
        headers: new Headers(),
      } as never;
      const res = await checkoutPost(req);
      expect(res.status).toBe(401);
    });

    it("POST /api/stripe/checkout rejects invalid plan with 400", async () => {
      const req = {
        json: async () => ({ plan: "invalid-plan-xyz" }),
        headers: new Headers(),
      } as never;
      const res = await checkoutPost(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain("Invalid plan");
    });

    it("POST /api/stripe/checkout generates fallback mock session when keys unconfigured", async () => {
      const req = {
        json: async () => ({ plan: "self-serve" }),
        headers: new Headers(),
      } as never;
      const res = await checkoutPost(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.url).toContain("mock_checkout=self-serve");
      expect(body.mock).toBe(true);
    });
  });

  describe("Plan Limits & Quota Enforcement", () => {
    it("returns correct quotas for tiers", () => {
      expect(getPlanLimits("trial").maxActiveExperiments).toBe(1);
      expect(getPlanLimits("self-serve").maxActiveExperiments).toBe(5);
      expect(getPlanLimits("studio").maxActiveExperiments).toBe(50);
    });

    it("blocks creating active experiment when trial limit is reached", async () => {
      // Workspace has 1 active experiment already on trial
      (prisma.workspace.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "ws-001",
        plan: "trial",
      });
      (prisma.experiment.count as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(1);

      const quota = await checkWorkspaceLimit("ws-001", "activeExperiments");
      expect(quota.allowed).toBe(false);
      expect(quota.limit).toBe(1);
      expect(quota.current).toBe(1);
    });

    it("POST /api/experiments returns 402 when active experiments limit is reached", async () => {
      (prisma.workspace.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "ws-001",
        plan: "trial",
      });
      (prisma.project.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "proj-1",
        workspaceId: "ws-001",
      });
      // Already 1 active experiment
      (prisma.experiment.count as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(1);

      const req = {
        json: async () => ({
          name: "Second Active Experiment",
          projectId: "proj-1",
          status: "active",
        }),
        headers: new Headers(),
      } as never;
      const res = await experimentPost(req);
      expect(res.status).toBe(402);
      const body = await res.json();
      expect(body.upgradeRequired).toBe(true);
    });
  });

  describe("Stripe Webhook Processing", () => {
    it("handles checkout.session.completed and upgrades workspace plan", async () => {
      (prisma.workspace.update as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "ws-001",
        plan: "self-serve",
      });
      (prisma.activityLog.create as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const eventPayload = {
        type: "checkout.session.completed",
        data: {
          object: {
            client_reference_id: "ws-001",
            subscription: "sub_12345",
            customer: "cus_98765",
            metadata: {
              workspaceId: "ws-001",
              planKey: "self-serve",
            },
            amount_total: 9900,
            currency: "usd",
          },
        },
      };

      const req = {
        text: async () => JSON.stringify(eventPayload),
        headers: new Headers(),
      } as never;

      const res = await webhookPost(req);
      expect(res.status).toBe(200);

      expect(prisma.workspace.update).toHaveBeenCalledWith({
        where: { id: "ws-001" },
        data: expect.objectContaining({
          plan: "self-serve",
          stripeCustomerId: "cus_98765",
          stripeSubscriptionId: "sub_12345",
        }),
      });
    });

    it("handles customer.subscription.deleted and downgrades to trial", async () => {
      (prisma.workspace.updateMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        count: 1,
      });
      (prisma.workspace.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "ws-001",
      });
      (prisma.activityLog.create as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const eventPayload = {
        type: "customer.subscription.deleted",
        data: {
          object: {
            id: "sub_12345",
            metadata: { workspaceId: "ws-001" },
          },
        },
      };

      const req = {
        text: async () => JSON.stringify(eventPayload),
        headers: new Headers(),
      } as never;

      const res = await webhookPost(req);
      expect(res.status).toBe(200);

      expect(prisma.workspace.updateMany).toHaveBeenCalledWith({
        where: { id: "ws-001" },
        data: { plan: "trial", stripeSubscriptionId: null },
      });
    });
  });

  describe("AI Analyst Gateway", () => {
    it("POST /api/ai returns 401 when unauthenticated", async () => {
      (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      const req = {
        json: async () => ({ prompt: "What is my top variant?" }),
        headers: new Headers(),
      } as never;
      const res = await aiPost(req);
      expect(res.status).toBe(401);
    });

    it("POST /api/ai streams demand analysis when authenticated", async () => {
      (prisma.experiment.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
        {
          name: "Landing Page Test",
          status: "active",
          traffic: 450,
          conversions: 38,
          conversionRate: 8.4,
          highIntentActions: 18,
          variants: [
            { name: "Variant A", conversionRate: 6.2, visitors: 220, conversions: 14, highIntent: 6 },
            { name: "Variant B", conversionRate: 10.4, visitors: 230, conversions: 24, highIntent: 12 },
          ],
        },
      ]);
      (prisma.aIInsight.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const req = {
        json: async () => ({ prompt: "Analyze demand" }),
        headers: new Headers(),
      } as never;
      const res = await aiPost(req);
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toContain("text/event-stream");
    });
  });
});
