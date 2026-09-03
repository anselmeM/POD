import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn() },
    workspace: { findUnique: vi.fn(), create: vi.fn() },
    workspaceMember: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn() },
    project: { findMany: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
    experiment: { findMany: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    landingPage: { findMany: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    signalEvent: { findMany: vi.fn(), groupBy: vi.fn() },
    lead: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
  },
}));

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

describe("Phase 1: Multi-Tenancy & Workspace Data Isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /api/projects returns 401 when unauthenticated", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const { GET } = await import("@/app/api/projects/route");
    const req = { nextUrl: new URL("http://localhost/api/projects"), headers: new Headers() } as never;
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("GET /api/projects scopes query to caller's workspaceId", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { email: "founderA@example.com" },
    });
    (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "usr-A",
      email: "founderA@example.com",
      memberships: [{ workspaceId: "ws-A", role: "owner", workspace: { id: "ws-A", name: "Workspace A" } }],
    });
    (prisma.project.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: "proj-A1", name: "Project A1", workspaceId: "ws-A", experiments: [] },
    ]);

    const { GET } = await import("@/app/api/projects/route");
    const req = { nextUrl: new URL("http://localhost/api/projects"), headers: new Headers() } as never;
    const res = await GET(req);
    expect(res.status).toBe(200);

    // Verify Prisma query was called with where: { workspaceId: "ws-A" }
    expect(prisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { workspaceId: "ws-A" },
      })
    );
  });

  it("POST /api/experiments rejects with 403 if project does not belong to caller's workspace", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { email: "founderA@example.com" },
    });
    (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "usr-A",
      email: "founderA@example.com",
      memberships: [{ workspaceId: "ws-A", role: "owner", workspace: { id: "ws-A", name: "Workspace A" } }],
    });
    // Target project is in workspace B, not workspace A
    (prisma.project.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const { POST } = await import("@/app/api/experiments/route");
    const req = {
      json: async () => ({ name: "Attacker Test", projectId: "proj-belonging-to-B" }),
      headers: new Headers(),
    } as never;
    const res = await POST(req);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain("workspace");
  });

  it("GET /api/landing-pages scopes query to caller's workspace projects", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { email: "founderB@example.com" },
    });
    (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "usr-B",
      email: "founderB@example.com",
      memberships: [{ workspaceId: "ws-B", role: "owner", workspace: { id: "ws-B", name: "Workspace B" } }],
    });
    (prisma.landingPage.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const { GET } = await import("@/app/api/landing-pages/route");
    const req = { nextUrl: new URL("http://localhost/api/landing-pages"), headers: new Headers() } as never;
    const res = await GET(req);
    expect(res.status).toBe(200);

    expect(prisma.landingPage.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          project: {
            workspaceId: "ws-B",
          },
        },
      })
    );
  });

  it("PATCH /api/landing-pages/[id] prevents editing a landing page belonging to another workspace", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { email: "founderA@example.com" },
    });
    (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "usr-A",
      email: "founderA@example.com",
      memberships: [{ workspaceId: "ws-A", role: "owner", workspace: { id: "ws-A", name: "Workspace A" } }],
    });
    // Landing page belongs to workspace B
    (prisma.landingPage.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "lp-B",
      slug: "lp-b",
      project: { workspaceId: "ws-B" },
    });

    const { PATCH } = await import("@/app/api/landing-pages/[id]/route");
    const req = {
      json: async () => ({ headline: "Hacked Headline" }),
      headers: new Headers(),
    } as never;
    const res = await PATCH(req, { params: Promise.resolve({ id: "lp-B" }) });
    expect(res.status).toBe(404);
  });
});
