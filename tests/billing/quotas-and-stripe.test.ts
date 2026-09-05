import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/workspace", () => ({
  getAuthenticatedWorkspace: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn(), findFirst: vi.fn() },
    workspace: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      findFirst: vi.fn(),
    },
    workspaceMember: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), count: vi.fn() },
    project: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn() },
    experiment: { findMany: vi.fn(), count: vi.fn(), create: vi.fn() },
    landingPage: { count: vi.fn(), create: vi.fn(), findUnique: vi.fn(), findMany: vi.fn() },
    activityLog: { create: vi.fn() },
    notification: { create: vi.fn() },
  },
}));

import { getAuthenticatedWorkspace } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import {
  getPlanLimits,
  normalizePlanKey,
  checkWorkspaceLimit,
  getWorkspaceUsage,
} from "@/lib/plan-limits";
import { resolvePlanConfig } from "@/lib/stripe";
import { GET as usageGet } from "@/app/api/billing/usage/route";
import { POST as checkoutPost } from "@/app/api/stripe/checkout/route";
import { POST as portalPost } from "@/app/api/stripe/portal/route";
import { POST as webhookPost } from "@/app/api/webhooks/stripe/route";

describe("Option 3: Stripe Monetization & Plan Quotas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getAuthenticatedWorkspace as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "usr-001", email: "founder@example.com", name: "Founder Alex" },
      workspace: {
        id: "ws-001",
        name: "Acme Demand",
        plan: "trial",
        stripeCustomerId: "cus_test_123",
        stripeSubscriptionId: null,
      },
    });
  });

  describe("Plan Limits & Tier Aliases", () => {
    it("normalizes common SaaS aliases to standard PoD tiers", () => {
      expect(normalizePlanKey("free")).toBe("trial");
      expect(normalizePlanKey("starter")).toBe("self-serve");
      expect(normalizePlanKey("growth")).toBe("self-serve");
      expect(normalizePlanKey("enterprise")).toBe("studio");
      expect(normalizePlanKey("sprint")).toBe("sprint");
      expect(normalizePlanKey("trial")).toBe("trial");
    });

    it("returns correct limits for all standard and aliased plans", () => {
      const trial = getPlanLimits("trial");
      expect(trial.maxActiveExperiments).toBe(1);
      expect(trial.maxLandingPages).toBe(2);
      expect(trial.maxTeamMembers).toBe(2);

      const starter = getPlanLimits("starter");
      expect(starter.maxActiveExperiments).toBe(5);
      expect(starter.maxLandingPages).toBe(15);
      expect(starter.maxTeamMembers).toBe(5);

      const enterprise = getPlanLimits("enterprise");
      expect(enterprise.maxActiveExperiments).toBe(50);
      expect(enterprise.maxLandingPages).toBe(100);
      expect(enterprise.maxTeamMembers).toBe(20);
    });

    it("resolves pricing config for aliased tiers in lib/stripe", () => {
      expect(resolvePlanConfig("starter")).toBeDefined();
      expect(resolvePlanConfig("starter")?.amount).toBe(9900);
      expect(resolvePlanConfig("growth")?.name).toBe("Self-Serve");
      expect(resolvePlanConfig("enterprise")?.amount).toBe(99900);
      expect(resolvePlanConfig("sprint")?.mode).toBe("payment");
    });
  });

  describe("Workspace Usage Calculation", () => {
    it("computes accurate usage percentages and allowed flags", async () => {
      (prisma.workspace.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "ws-001",
        plan: "trial",
        stripeCustomerId: "cus_test_123",
        stripeSubscriptionId: "sub_test_456",
      });
      (prisma.experiment.count as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(1);
      (prisma.landingPage.count as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(1);
      (prisma.workspaceMember.count as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(2);

      const usage = await getWorkspaceUsage("ws-001");

      expect(usage.plan).toBe("trial");
      expect(usage.planName).toBe("Free Trial");
      // Experiments: 1 / 1 = 100% -> allowed: false
      expect(usage.quotas.activeExperiments.current).toBe(1);
      expect(usage.quotas.activeExperiments.limit).toBe(1);
      expect(usage.quotas.activeExperiments.percent).toBe(100);
      expect(usage.quotas.activeExperiments.allowed).toBe(false);

      // Landing pages: 1 / 2 = 50% -> allowed: true
      expect(usage.quotas.landingPages.current).toBe(1);
      expect(usage.quotas.landingPages.limit).toBe(2);
      expect(usage.quotas.landingPages.percent).toBe(50);
      expect(usage.quotas.landingPages.allowed).toBe(true);

      // Team members: 2 / 2 = 100% -> allowed: false
      expect(usage.quotas.teamMembers.current).toBe(2);
      expect(usage.quotas.teamMembers.limit).toBe(2);
      expect(usage.quotas.teamMembers.percent).toBe(100);
      expect(usage.quotas.teamMembers.allowed).toBe(false);

      expect(usage.stripeCustomerId).toBe("cus_test_123");
      expect(usage.stripeSubscriptionId).toBe("sub_test_456");
    });
  });

  describe("GET /api/billing/usage", () => {
    it("returns 401 when unauthorized", async () => {
      (getAuthenticatedWorkspace as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      const req = { headers: new Headers() } as never;
      const res = await usageGet(req);
      expect(res.status).toBe(401);
    });

    it("returns 200 with full workspace quota telemetry", async () => {
      (prisma.workspace.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "ws-001",
        plan: "self-serve",
        stripeCustomerId: "cus_123",
      });
      (prisma.experiment.count as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(3);
      (prisma.landingPage.count as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(5);
      (prisma.workspaceMember.count as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(2);

      const req = { headers: new Headers() } as never;
      const res = await usageGet(req);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.usage.plan).toBe("self-serve");
      expect(body.usage.quotas.activeExperiments.current).toBe(3);
      expect(body.usage.quotas.activeExperiments.limit).toBe(5);
      expect(body.usage.quotas.activeExperiments.percent).toBe(60);
      expect(body.usage.quotas.activeExperiments.allowed).toBe(true);
    });
  });

  describe("POST /api/stripe/checkout", () => {
    it("accepts tier aliases like starter and returns simulated or live checkout session", async () => {
      const req = {
        json: async () => ({ plan: "starter" }),
        headers: new Headers(),
        nextUrl: { origin: "http://localhost:3000" },
      } as never;

      const res = await checkoutPost(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.url).toContain("mock_checkout=starter");
      expect(body.mock).toBe(true);
    });

    it("rejects invalid plans with 400", async () => {
      const req = {
        json: async () => ({ plan: "bogus-tier" }),
        headers: new Headers(),
        nextUrl: { origin: "http://localhost:3000" },
      } as never;

      const res = await checkoutPost(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain("Invalid plan");
    });
  });

  describe("POST /api/stripe/portal", () => {
    it("returns mock portal redirection to /dashboard/billing when Stripe unconfigured", async () => {
      const req = {
        headers: new Headers(),
        nextUrl: { origin: "http://localhost:3000" },
      } as never;

      const res = await portalPost(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.url).toContain("/dashboard/billing?mock_portal=1");
      expect(body.mock).toBe(true);
    });
  });

  describe("Stripe Webhook Plan Lifecycle", () => {
    it("upgrades workspace plan upon checkout.session.completed", async () => {
      (prisma.workspace.update as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "ws-001",
        plan: "self-serve",
      });
      (prisma.activityLog.create as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const req = {
        text: async () =>
          JSON.stringify({
            type: "checkout.session.completed",
            data: {
              object: {
                client_reference_id: "ws-001",
                subscription: "sub_live_999",
                customer: "cus_live_999",
                metadata: { planKey: "self-serve", workspaceId: "ws-001" },
                amount_total: 9900,
                currency: "usd",
              },
            },
          }),
        headers: new Headers(),
      } as never;

      const res = await webhookPost(req);
      expect(res.status).toBe(200);
      expect(prisma.workspace.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "ws-001" },
          data: expect.objectContaining({ plan: "self-serve" }),
        })
      );
    });

    it("reverts workspace to trial upon customer.subscription.deleted", async () => {
      (prisma.workspace.updateMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        count: 1,
      });
      (prisma.workspace.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "ws-001",
        plan: "trial",
      });
      (prisma.activityLog.create as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const req = {
        text: async () =>
          JSON.stringify({
            type: "customer.subscription.deleted",
            data: {
              object: {
                id: "sub_live_999",
                metadata: { workspaceId: "ws-001" },
              },
            },
          }),
        headers: new Headers(),
      } as never;

      const res = await webhookPost(req);
      expect(res.status).toBe(200);
      expect(prisma.workspace.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "ws-001" },
          data: { plan: "trial", stripeSubscriptionId: null },
        })
      );
    });
  });
});
