import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock dependencies
vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/workspace", () => ({
  getAuthenticatedWorkspace: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    landingPage: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    lead: {
      create: vi.fn(),
      findFirst: vi.fn(),
    },
    experiment: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    variant: {
      create: vi.fn(),
    },
    aIInsight: {
      create: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
    signalEvent: {
      create: vi.fn(),
    },
    webhook: {
      findMany: vi.fn(),
    },
    workspace: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
    project: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { getAuthenticatedWorkspace } from "@/lib/workspace";
import { POST as preorderPost } from "@/app/api/stripe/preorder/route";
import { POST as trackPost } from "@/app/api/track/route";
import { POST as aiSmokeTestPost } from "@/app/api/ai/smoke-test/route";

describe("Flagship Features: Stripe Pre-Order Reservations & Instant AI Smoke Test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getAuthenticatedWorkspace as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "usr-test", email: "founder@acme.com", name: "Founder" },
      workspace: { id: "ws-test", name: "Test Workspace", plan: "self-serve" },
    });
  });

  describe("1. Stripe Pre-Order & Card Reservation API (/api/stripe/preorder)", () => {
    it("returns 400 if slug or email is missing", async () => {
      const req1 = new NextRequest("http://localhost:3000/api/stripe/preorder", {
        method: "POST",
        body: JSON.stringify({ email: "backer@example.com" }),
      });
      const res1 = await preorderPost(req1);
      expect(res1.status).toBe(400);

      const req2 = new NextRequest("http://localhost:3000/api/stripe/preorder", {
        method: "POST",
        body: JSON.stringify({ slug: "loom-reviews" }),
      });
      const res2 = await preorderPost(req2);
      expect(res2.status).toBe(400);
    });

    it("returns 404 if landing page slug does not exist", async () => {
      (prisma.landingPage.findUnique as any).mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/api/stripe/preorder", {
        method: "POST",
        body: JSON.stringify({ slug: "non-existent", email: "backer@example.com" }),
      });
      const res = await preorderPost(req);
      expect(res.status).toBe(404);
    });

    it("creates a pre-order reservation session with configured deposit amount", async () => {
      (prisma.landingPage.findUnique as any).mockResolvedValue({
        id: "lp-101",
        slug: "loom-for-code",
        name: "Loom for Code Reviews",
        headline: "Async video reviews for pull requests",
        preorderEnabled: true,
        depositAmount: 100, // $1.00
        priceAnchor: 4900, // $49.00
        experimentId: "exp-001",
      });

      const req = new NextRequest("http://localhost:3000/api/stripe/preorder", {
        method: "POST",
        headers: { origin: "http://localhost:3000" },
        body: JSON.stringify({
          slug: "loom-for-code",
          email: "alex@company.com",
          name: "Alex Morgan",
        }),
      });

      const res = await preorderPost(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.depositAmount).toBe(100);
      expect(json.priceAnchor).toBe(4900);
      expect(json.sessionId).toBeDefined();
      expect(json.url).toContain("preorder_success=1");
    });
  });

  describe("2. High-Conviction Pre-Order Tracking & Telemetry (/api/track)", () => {
    it("records a pre-order with intentScore: 98, deposit amount, and custom notification", async () => {
      (prisma.landingPage.findUnique as any).mockResolvedValue({
        id: "lp-101",
        slug: "loom-for-code",
        name: "Loom for Code",
        headline: "Review PRs 5x Faster",
        preorderEnabled: true,
        depositAmount: 100,
        visitors: 10,
        conversions: 2,
        experimentId: "exp-001",
        experiment: { id: "exp-001", conversions: 2, highIntentActions: 4 },
      });
      (prisma.lead.create as any).mockImplementation(({ data }: { data: any }) => Promise.resolve(data));
      (prisma.notification.create as any).mockResolvedValue({ id: "notif-1" });
      (prisma.signalEvent.create as any).mockResolvedValue({ id: "evt-1" });
      (prisma.webhook.findMany as any).mockResolvedValue([]);

      const req = new NextRequest("http://localhost:3000/api/track", {
        method: "POST",
        body: JSON.stringify({
          slug: "loom-for-code",
          eventType: "preorder_placed",
          visitorId: "vis-12345",
          leadData: {
            name: "Alex Backer",
            email: "alex@company.com",
            isPreorder: true,
            depositAmount: 100,
            stripeSessionId: "cs_test_preorder_123",
          },
        }),
      });

      const res = await trackPost(req);
      expect(res.status).toBe(200);

      // Verify Lead was created with 98 intentScore and isPreorder: true
      expect(prisma.lead.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isPreorder: true,
            depositAmount: 100,
            intentScore: 98,
            stripeSessionId: "cs_test_preorder_123",
            name: "Alex Backer",
            email: "alex@company.com",
          }),
        })
      );

      // Verify notification title specifies Pre-Order reservation
      expect(prisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: "💳 Confirmed Pre-Order Reservation Captured!",
            type: "preorder",
          }),
        })
      );
    });
  });

  describe("3. Instant AI Smoke Test Generator (/api/ai/smoke-test)", () => {
    it("validates that prompt has minimum length", async () => {
      const req = new NextRequest("http://localhost:3000/api/ai/smoke-test", {
        method: "POST",
        body: JSON.stringify({ prompt: "ab" }),
      });
      const res = await aiSmokeTestPost(req);
      expect(res.status).toBe(400);
    });

    it("synthesizes target persona, contrasting angles, experiment, and landing page", async () => {
      (prisma.workspace.findFirst as any).mockResolvedValue({ id: "ws-test" });
      (prisma.project.findFirst as any).mockResolvedValue({ id: "proj-001", workspaceId: "ws-test" });
      (prisma.experiment.create as any).mockImplementation(({ data }: { data: any }) => Promise.resolve(data));
      (prisma.variant.create as any).mockImplementation(({ data }: { data: any }) => Promise.resolve(data));
      (prisma.landingPage.create as any).mockImplementation(({ data }: { data: any }) => Promise.resolve(data));
      (prisma.aIInsight.create as any).mockImplementation(({ data }: { data: any }) => Promise.resolve(data));
      (prisma.notification.create as any).mockResolvedValue({ id: "notif-2" });

      const req = new NextRequest("http://localhost:3000/api/ai/smoke-test", {
        method: "POST",
        body: JSON.stringify({
          prompt: "Loom for code reviews",
          enablePreorder: true,
          depositAmount: 100,
        }),
      });

      const res = await aiSmokeTestPost(req);
      expect(res.status).toBe(201);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.slug).toContain("loom-for-code-reviews");
      expect(json.experiment).toBeDefined();
      expect(json.variants).toHaveLength(2);
      expect(json.landingPage).toBeDefined();
      expect(json.persona).toBeDefined();

      // Verify 2 contrasting variants were created
      expect(prisma.variant.create).toHaveBeenCalledTimes(2);

      // Verify LandingPage was created with preorderEnabled: true
      expect(prisma.landingPage.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            preorderEnabled: true,
            depositAmount: 100,
            status: "live",
          }),
        })
      );

      // Verify AI hypothesis insight was saved
      expect(prisma.aIInsight.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: "variant",
            confidence: 94,
          }),
        })
      );
    });
  });
});
