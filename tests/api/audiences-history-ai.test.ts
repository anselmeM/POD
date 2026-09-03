import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    project: { findFirst: vi.fn(), findUnique: vi.fn(), findMany: vi.fn() },
    audience: { findUnique: vi.fn(), create: vi.fn(), upsert: vi.fn() },
    user: { findUnique: vi.fn(), findFirst: vi.fn() },
    aIConversation: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), findUnique: vi.fn() },
    aIMessage: { create: vi.fn() },
  },
}));

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

describe("Audiences, History, and AI Conversations API", () => {
  beforeEach(() => vi.clearAllMocks());

  it("GET /api/audiences returns audience and segments", async () => {
    (prisma.project.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "proj-1" });
    (prisma.audience.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "aud-1",
      primarySegment: "SaaS Ops Leaders",
      jobTitle: "VP Operations",
      industry: "SaaS",
      companySize: "50-200",
      geography: "US",
      seniority: "VP",
      interests: JSON.stringify(["Automation"]),
      painPoints: JSON.stringify(["Manual reports"]),
      segments: [
        { id: "seg-1", name: "Ops Leaders", description: "B2B SaaS Ops", reach: 10000, intentScore: 85, status: "active" },
      ],
    });

    const { GET } = await import("@/app/api/audiences/route");
    const req = { url: "http://localhost:3000/api/audiences" } as never;
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.audience.primarySegment).toBe("SaaS Ops Leaders");
    expect(json.segments).toHaveLength(1);
  });

  it("GET /api/history returns aggregated validation items from Prisma", async () => {
    (prisma.project.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: "proj-1",
        name: "AI Reporting Copilot",
        podScore: 82,
        confidence: 85,
        updatedAt: new Date("2026-02-01"),
        experiments: [
          {
            id: "exp-1",
            name: "Automated Reporting Test",
            traffic: 1500,
            conversions: 150,
            conversionRate: 0.1,
            highIntentActions: 45,
            highIntentRate: 0.03,
            insights: [{ content: "Strong intent detected from SaaS founders." }],
            variants: [],
          },
        ],
      },
    ]);

    const { GET } = await import("@/app/api/history/route");
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toHaveLength(1);
    expect(json.data[0].verdict).toBe("Strong Demand");
    expect(json.data[0].score).toBe(82);
  });

  it("GET /api/ai/conversations returns list of threads", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ user: { email: "alex@example.com" } });
    (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "usr-1" });
    (prisma.aIConversation.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: "conv-1",
        title: "Demand Check",
        updatedAt: new Date(),
        messages: [{ id: "m-1", role: "user", content: "Is demand strong?", createdAt: new Date() }],
      },
    ]);

    const { GET } = await import("@/app/api/ai/conversations/route");
    const req = {} as never;
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toHaveLength(1);
    expect(json.data[0].title).toBe("Demand Check");
  });

  it("POST /api/ai/conversations saves message and creates thread", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ user: { email: "alex@example.com" } });
    (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "usr-1" });
    (prisma.project.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "proj-1" });
    (prisma.aIConversation.create as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "conv-new",
    });
    (prisma.aIMessage.create as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "msg-1",
      role: "user",
      content: "Hello AI analyst",
      createdAt: new Date(),
    });
    (prisma.aIConversation.update as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({});

    const { POST } = await import("@/app/api/ai/conversations/route");
    const req = {
      json: async () => ({ message: { role: "user", content: "Hello AI analyst" } }),
    } as never;
    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.conversationId).toBe("conv-new");
    expect(json.message.content).toBe("Hello AI analyst");
  });
});
