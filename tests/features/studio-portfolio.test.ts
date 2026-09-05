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
      findFirst: vi.fn(),
      update: vi.fn(),
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
import { GET as portfolioGet } from "@/app/api/studio/portfolio/route";
import { PATCH as portfolioPatch } from "@/app/api/studio/portfolio/[id]/route";

describe("Startup Studio Portfolio & Idea Leaderboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getAuthenticatedWorkspace as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "usr-partner", email: "partner@studio.vc", name: "Studio Partner" },
      workspace: { id: "ws-studio", name: "Venture Studio Labs", plan: "scale" },
    });
  });

  describe("GET /api/studio/portfolio", () => {
    it("returns 401 if unauthorized", async () => {
      (getAuthenticatedWorkspace as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/api/studio/portfolio");
      const res = await portfolioGet(req);
      expect(res.status).toBe(401);
    });

    it("evaluates Stage-Gate verdicts and calculates metrics across projects", async () => {
      const mockProjects = [
        {
          id: "proj-build",
          name: "Autonomous Security Scanner",
          status: "active",
          podScore: 86,
          confidence: 88,
          updatedAt: new Date(),
          landingPages: [{ visitors: 150, conversions: 24, slug: "security-scanner" }],
          experiments: [
            {
              traffic: 150,
              conversions: 24,
              leads: [{ isPreorder: true }, { isPreorder: true }, { isPreorder: true }],
              variants: [{ name: "Zero-Trust Speed", conversionRate: 16.0 }],
            },
          ],
        },
        {
          id: "proj-kill",
          name: "Social Media for Pets",
          status: "active",
          podScore: 30,
          confidence: 70,
          updatedAt: new Date(),
          landingPages: [{ visitors: 220, conversions: 3, slug: "pet-social" }],
          experiments: [
            {
              traffic: 220,
              conversions: 3,
              leads: [],
              variants: [{ name: "Community First", conversionRate: 1.3 }],
            },
          ],
        },
        {
          id: "proj-iterate",
          name: "AI Email Followup Tool",
          status: "active",
          podScore: 58,
          confidence: 65,
          updatedAt: new Date(),
          landingPages: [{ visitors: 120, conversions: 8, slug: "email-tool" }],
          experiments: [
            {
              traffic: 120,
              conversions: 8,
              leads: [],
              variants: [{ name: "Smart Sequences", conversionRate: 6.6 }],
            },
          ],
        },
        {
          id: "proj-testing",
          name: "Voice Search Optimizer",
          status: "draft",
          podScore: 0,
          confidence: 50,
          updatedAt: new Date(),
          landingPages: [{ visitors: 25, conversions: 1, slug: "voice-search" }],
          experiments: [
            {
              traffic: 25,
              conversions: 1,
              leads: [],
              variants: [{ name: "Instant Voice Index", conversionRate: 4.0 }],
            },
          ],
        },
      ];

      (prisma.project.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockProjects);

      const req = new NextRequest("http://localhost:3000/api/studio/portfolio");
      const res = await portfolioGet(req);
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.success).toBe(true);
      expect(json.data.concepts).toBeDefined();

      const concepts = json.data.concepts;
      expect(concepts.length).toBeGreaterThanOrEqual(4);

      // Verify BUILD verdict
      const buildConcept = concepts.find((c: any) => c.name === "Autonomous Security Scanner");
      expect(buildConcept).toBeDefined();
      expect(buildConcept.verdict).toBe("BUILD");
      expect(buildConcept.preorders).toBe(3);

      // Verify KILL verdict
      const killConcept = concepts.find((c: any) => c.name === "Social Media for Pets");
      expect(killConcept).toBeDefined();
      expect(killConcept.verdict).toBe("KILL");
      expect(killConcept.capitalSaved).toBe(45000);

      // Verify ITERATE verdict
      const iterateConcept = concepts.find((c: any) => c.name === "AI Email Followup Tool");
      expect(iterateConcept).toBeDefined();
      expect(iterateConcept.verdict).toBe("ITERATE");

      // Verify TESTING verdict
      const testingConcept = concepts.find((c: any) => c.name === "Voice Search Optimizer");
      expect(testingConcept).toBeDefined();
      expect(testingConcept.verdict).toBe("TESTING");

      // Verify Portfolio Summary metrics
      const summary = json.data.summary;
      expect(summary.totalConcepts).toBeGreaterThanOrEqual(4);
      expect(summary.greenlitCount).toBeGreaterThanOrEqual(1);
      expect(summary.killedCount).toBeGreaterThanOrEqual(1);
      expect(summary.totalCapitalSaved).toBeGreaterThanOrEqual(45000);
    });
  });

  describe("PATCH /api/studio/portfolio/[id]", () => {
    it("returns 400 if verdict is missing", async () => {
      const req = new NextRequest("http://localhost:3000/api/studio/portfolio/proj-1", {
        method: "PATCH",
        body: JSON.stringify({ partnerNotes: "Needs review" }),
      });
      const res = await portfolioPatch(req, { params: Promise.resolve({ id: "proj-1" }) });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Verdict is required");
    });

    it("updates project status and creates in-app notification on partner override", async () => {
      const mockProject = {
        id: "proj-100",
        name: "Enterprise Data Hub",
        status: "active",
        workspaceId: "ws-studio",
      };
      (prisma.project.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockProject);
      (prisma.project.update as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        ...mockProject,
        status: "validated",
      });
      (prisma.notification.create as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "notif-1" });
      (prisma.activityLog.create as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "act-1" });

      const req = new NextRequest("http://localhost:3000/api/studio/portfolio/proj-100", {
        method: "PATCH",
        body: JSON.stringify({
          verdict: "BUILD",
          partnerNotes: "Approved by Investment Committee with $100k seed budget",
        }),
      });

      const res = await portfolioPatch(req, { params: Promise.resolve({ id: "proj-100" }) });
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.success).toBe(true);
      expect(json.data.verdict).toBe("BUILD");
      expect(json.data.status).toBe("validated");

      // Verify Notification creation
      expect(prisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: expect.stringContaining("Stage-Gate Decision"),
          }),
        })
      );
    });
  });
});
