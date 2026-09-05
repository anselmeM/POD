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
    project: {
      findMany: vi.fn(),
    },
    workspace: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    webhook: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
    activityLog: {
      create: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { getAuthenticatedWorkspace } from "@/lib/workspace";
import {
  generateSprintDigest,
  formatSlackDigestBlocks,
  generateDigestEmailHtml,
  getDigestConfig,
  saveDigestConfig,
  dispatchSprintDigest,
} from "@/lib/digest";
import { GET as digestGet, PATCH as digestPatch } from "@/app/api/digest/route";
import { POST as digestSendPost } from "@/app/api/digest/send/route";
import { GET as cronGet, POST as cronPost } from "@/app/api/cron/sprint-digest/route";

describe("Automated Slack & Email Sprint Digests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getAuthenticatedWorkspace as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "usr-founder", email: "founder@startup.io", name: "Founder Alex" },
      workspace: { id: "ws-test", name: "SaaS Launchpad", plan: "scale" },
    });
  });

  describe("Sprint Digest Generation Engine", () => {
    it("aggregates projects, variants, leads, and evaluates stage-gate matrix", async () => {
      (prisma.workspace.findUnique as any).mockResolvedValue({
        id: "ws-test",
        name: "SaaS Launchpad",
      });

      const mockProjects = [
        {
          id: "proj-1",
          name: "Autonomous Security Scanner",
          podScore: 82,
          landingPages: [{ visitors: 160 }],
          experiments: [
            {
              id: "exp-1",
              name: "Security Experiment",
              leads: [
                { id: "l1", variantId: "v-b", isPreorder: true, depositAmount: 4900, intentScore: 95 },
                { id: "l2", variantId: "v-b", isPreorder: true, depositAmount: 4900, intentScore: 95 },
                { id: "l3", variantId: "v-a", isPreorder: false, intentScore: 70 },
              ],
              variants: [
                { id: "v-a", name: "Control", headline: "Scan Code for Bugs", visitors: 70, conversions: 5 },
                { id: "v-b", name: "Variant B (Speed)", headline: "Detect Vulnerabilities in 15 Seconds", visitors: 90, conversions: 12 },
              ],
            },
          ],
        },
        {
          id: "proj-2",
          name: "Obsolete Monolith Deployer",
          podScore: 32,
          landingPages: [{ visitors: 200 }],
          experiments: [
            {
              id: "exp-2",
              name: "Deployer Test",
              leads: [],
              variants: [
                { id: "v-c", name: "Control", headline: "Deploy Faster", visitors: 200, conversions: 2 },
              ],
            },
          ],
        },
      ];

      (prisma.project.findMany as any).mockResolvedValue(mockProjects);

      const digest = await generateSprintDigest("ws-test", "SaaS Launchpad");

      expect(digest.workspaceName).toBe("SaaS Launchpad");
      expect(digest.metrics.totalVisitors).toBe(360);
      expect(digest.metrics.totalPreorders).toBe(2);
      expect(digest.metrics.totalDepositHeld).toBe(98.0);
      expect(digest.metrics.capitalPreserved).toBe(45000); // from proj-2 KILL

      // Top variant should be v-b with 13.3% CVR
      expect(digest.topVariant).not.toBeNull();
      expect(digest.topVariant?.variantName).toBe("Variant B (Speed)");
      expect(digest.topVariant?.headline).toBe("Detect Vulnerabilities in 15 Seconds");

      // Stage gate decisions
      expect(digest.stageGateChanges).toHaveLength(2);
      expect(digest.stageGateChanges[0].verdict).toBe("BUILD");
      expect(digest.stageGateChanges[1].verdict).toBe("KILL");
      expect(digest.stageGateChanges[1].capitalSaved).toBe(45000);
    });

    it("provides realistic starter benchmarks for brand-new workspaces", async () => {
      (prisma.workspace.findUnique as any).mockResolvedValue({ id: "ws-empty", name: "New Co" });
      (prisma.project.findMany as any).mockResolvedValue([]);

      const digest = await generateSprintDigest("ws-empty", "New Co");

      expect(digest.metrics.totalVisitors).toBeGreaterThan(0);
      expect(digest.metrics.totalLeads).toBeGreaterThan(0);
      expect(digest.topVariant).not.toBeNull();
      expect(digest.stageGateChanges.length).toBeGreaterThan(0);
      expect(digest.aiExecutiveTakeaway).toContain("Validation sprint shows strong forward momentum");
    });
  });

  describe("Formatters (Slack Block Kit & Responsive HTML Email)", () => {
    it("formats authentic Slack Block Kit payload with required blocks", async () => {
      const mockDigest = await generateSprintDigest("ws-test", "Test Studio");
      const slackPayload = formatSlackDigestBlocks(mockDigest, "https://pod.app");

      expect(slackPayload.text).toContain("Weekly Sprint Digest");
      expect(Array.isArray(slackPayload.blocks)).toBe(true);

      const headerBlock = slackPayload.blocks.find((b: any) => b.type === "header");
      expect(headerBlock?.text?.text).toContain("PoD Weekly Sprint Digest");

      const sectionGrid = slackPayload.blocks.find((b: any) => b.fields && b.fields.length >= 4);
      expect(sectionGrid).toBeDefined();

      const actionBlock = slackPayload.blocks.find((b: any) => b.type === "actions");
      expect(actionBlock?.elements[0]?.url).toBe("https://pod.app/dashboard/portfolio");
    });

    it("generates complete responsive HTML email with metrics and Stage-Gate table", async () => {
      const mockDigest = await generateSprintDigest("ws-test", "Alpha Ventures");
      const html = generateDigestEmailHtml(mockDigest, "https://pod.app");

      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("Weekly Sprint Digest");
      expect(html).toContain("Alpha Ventures");
      expect(html).toContain("Total Visitors");
      expect(html).toContain("Stage-Gate Portfolio Matrix");
      expect(html).toContain("https://pod.app/dashboard/portfolio");
    });
  });

  describe("Delivery & Settings Management", () => {
    it("saves and loads digest settings via Webhook records", async () => {
      (prisma.webhook.findMany as any).mockResolvedValue([
        {
          id: "wh-1",
          workspaceId: "ws-test",
          url: "https://hooks.slack.com/services/T00/B00/XXX",
          events: JSON.stringify(["sprint.digest", "sprint.digest.slack"]),
          active: true,
        },
        {
          id: "wh-2",
          workspaceId: "ws-test",
          url: "internal://email-digest",
          events: JSON.stringify(["sprint.digest.email"]),
          secret: JSON.stringify(["investor@fund.vc", "founder@pod.com"]),
          active: true,
        },
      ]);

      const config = await getDigestConfig("ws-test");
      expect(config.slackWebhookUrl).toBe("https://hooks.slack.com/services/T00/B00/XXX");
      expect(config.sendSlack).toBe(true);
      expect(config.sendEmail).toBe(true);
      expect(config.emailRecipients).toEqual(["investor@fund.vc", "founder@pod.com"]);
    });

    it("dispatches to Slack and creates an in-app notification", async () => {
      const mockDigest = await generateSprintDigest("ws-test", "Test Workspace");

      // Mock global fetch
      const originalFetch = global.fetch;
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: () => Promise.resolve("ok"),
      });
      global.fetch = mockFetch;

      const result = await dispatchSprintDigest(
        {
          slackWebhookUrl: "https://hooks.slack.com/services/test",
          emailRecipients: ["founder@test.com"],
          sendSlack: true,
          sendEmail: true,
          frequency: "weekly",
          active: true,
        },
        mockDigest
      );

      expect(result.slack).toBe(true);
      expect(result.email).toBe(true);
      expect(prisma.notification.create).toHaveBeenCalled();

      global.fetch = originalFetch;
    });
  });

  describe("API Endpoints", () => {
    it("GET /api/digest returns computed digest and configuration", async () => {
      (prisma.workspace.findUnique as any).mockResolvedValue({ id: "ws-test", name: "SaaS Launchpad" });
      (prisma.project.findMany as any).mockResolvedValue([]);
      (prisma.webhook.findMany as any).mockResolvedValue([]);

      const req = new NextRequest("http://localhost:3000/api/digest");
      const res = await digestGet(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.digest).toBeDefined();
      expect(json.config).toBeDefined();
    });

    it("POST /api/digest/send validates input and triggers test dispatch", async () => {
      (prisma.workspace.findUnique as any).mockResolvedValue({ id: "ws-test", name: "SaaS Launchpad" });
      (prisma.project.findMany as any).mockResolvedValue([]);
      (prisma.webhook.findMany as any).mockResolvedValue([]);

      const req = new NextRequest("http://localhost:3000/api/digest/send", {
        method: "POST",
        body: JSON.stringify({
          channel: "email",
          customEmail: "test@founder.com",
        }),
      });

      const res = await digestSendPost(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.deliveredTo.email).toBe(true);
      expect(json.previewHtml).toContain("Weekly Sprint Digest");
    });

    it("GET & POST /api/cron/sprint-digest handles authorization and processes workspaces", async () => {
      // With invalid secret
      process.env.CRON_SECRET = "supersecretcronkey";
      const unauthorizedReq = new NextRequest("http://localhost:3000/api/cron/sprint-digest", {
        headers: { authorization: "Bearer wrongtoken" },
      });
      const unauthRes = await cronGet(unauthorizedReq);
      expect(unauthRes.status).toBe(401);

      // With valid secret
      (prisma.workspace.findMany as any).mockResolvedValue([
        { id: "ws-1", name: "Portfolio One" },
      ]);
      (prisma.webhook.findMany as any).mockResolvedValue([]);
      (prisma.project.findMany as any).mockResolvedValue([]);

      const validReq = new NextRequest("http://localhost:3000/api/cron/sprint-digest", {
        headers: { authorization: "Bearer supersecretcronkey" },
      });
      const validRes = await cronPost(validReq);
      const validJson = await validRes.json();

      expect(validRes.status).toBe(200);
      expect(validJson.success).toBe(true);
      expect(validJson.processedWorkspaces).toBe(1);

      delete process.env.CRON_SECRET;
    });
  });
});
