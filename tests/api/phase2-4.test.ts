import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    workspace: { findMany: vi.fn(), create: vi.fn(), findUnique: vi.fn() },
    workspaceMember: { findMany: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
    notification: { findMany: vi.fn(), count: vi.fn(), createMany: vi.fn(), updateMany: vi.fn(), update: vi.fn() },
    webhook: { findMany: vi.fn(), create: vi.fn(), delete: vi.fn() },
    activityLog: { findMany: vi.fn(), count: vi.fn(), createMany: vi.fn(), create: vi.fn() },
    experiment: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
    aIInsight: { findMany: vi.fn() },
  },
}));

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

describe("phase 2-4 API — auth guards", () => {
  beforeEach(() => vi.clearAllMocks());

  it("GET /api/workspaces 401 when unauthed", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const { GET } = await import("@/app/api/workspaces/route");
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("GET /api/notifications 401 when unauthed", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const { GET } = await import("@/app/api/notifications/route");
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("GET /api/activity 401 when unauthed", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const { GET } = await import("@/app/api/activity/route");
    const req = { nextUrl: { searchParams: new URLSearchParams() } } as never;
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("GET /api/webhooks 401 when unauthed", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const { GET } = await import("@/app/api/webhooks/route");
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("POST /api/experiments 401 when unauthed", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const { POST } = await import("@/app/api/experiments/route");
    const req = { json: async () => ({ name: "X", projectId: "proj-001" }) } as never;
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("GET /api/notifications returns data when authed", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ user: { email: "alex@example.com" } });
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1" });
    (prisma.notification.count as ReturnType<typeof vi.fn>).mockResolvedValue(1);
    (prisma.notification.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: "n1", title: "Hi", read: false }]);
    const { GET } = await import("@/app/api/notifications/route");
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toHaveLength(1);
  });

  it("POST /api/ai returns stream (mock) when no OPENAI key", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ user: { email: "alex@example.com" } });
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "u1",
      email: "alex@example.com",
      memberships: [
        {
          workspaceId: "ws-1",
          role: "owner",
          workspace: { id: "ws-1", name: "Alex WS" },
        },
      ],
    });
    const { POST } = await import("@/app/api/ai/route");
    // mock prisma for context
    (prisma.experiment.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (prisma.aIInsight.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    const req = { json: async () => ({ messages: [{ role: "user", content: "What is demand?" }] }) } as never;
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/event-stream");
  });
});
