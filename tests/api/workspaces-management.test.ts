import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn() },
    workspace: { findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
    workspaceMember: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    activityLog: { create: vi.fn() },
  },
}));

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

describe("Workspace Management & Team API", () => {
  beforeEach(() => vi.clearAllMocks());

  it("PATCH /api/workspaces/[id] returns 401 when unauthenticated", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const { PATCH } = await import("@/app/api/workspaces/[id]/route");
    const req = { json: async () => ({ name: "Updated Name" }) } as never;
    const res = await PATCH(req, { params: Promise.resolve({ id: "ws-001" }) });
    expect(res.status).toBe(401);
  });

  it("PATCH /api/workspaces/[id] updates name when owner", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { email: "alex@example.com" },
    });
    (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "usr-1",
      email: "alex@example.com",
    });
    (prisma.workspace.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "ws-001",
      name: "Old Name",
      ownerId: "usr-1",
    });
    (prisma.workspaceMember.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      role: "owner",
    });
    (prisma.workspace.update as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "ws-001",
      name: "New Name",
    });

    const { PATCH } = await import("@/app/api/workspaces/[id]/route");
    const req = { json: async () => ({ name: "New Name" }) } as never;
    const res = await PATCH(req, { params: Promise.resolve({ id: "ws-001" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.name).toBe("New Name");
  });

  it("GET /api/workspaces/[id]/members returns member list", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { email: "alex@example.com" },
    });
    (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "usr-1",
      email: "alex@example.com",
    });
    (prisma.workspace.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "ws-001",
      ownerId: "usr-1",
    });
    (prisma.workspaceMember.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      role: "owner",
    });
    (prisma.workspaceMember.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: "mem-1",
        userId: "usr-1",
        role: "owner",
        createdAt: new Date(),
        user: { id: "usr-1", name: "Alex Morgan", email: "alex@example.com", image: null },
      },
    ]);

    const { GET } = await import("@/app/api/workspaces/[id]/members/route");
    const req = {} as never;
    const res = await GET(req, { params: Promise.resolve({ id: "ws-001" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].name).toBe("Alex Morgan");
  });

  it("POST /api/workspaces/[id]/members invites member", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { email: "alex@example.com" },
    });
    (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ id: "usr-1", email: "alex@example.com" }) // caller
      .mockResolvedValueOnce(null); // target doesn't exist yet
    (prisma.workspace.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "ws-001",
      ownerId: "usr-1",
    });
    (prisma.workspaceMember.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      role: "owner",
    });
    (prisma.workspaceMember.count as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(1);
    (prisma.user.create as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "usr-2",
      email: "newmember@example.com",
      name: "newmember",
    });
    (prisma.workspaceMember.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (prisma.workspaceMember.create as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "mem-2",
      workspaceId: "ws-001",
      userId: "usr-2",
      role: "member",
      createdAt: new Date(),
      user: { id: "usr-2", name: "newmember", email: "newmember@example.com", image: null },
    });

    const { POST } = await import("@/app/api/workspaces/[id]/members/route");
    const req = { json: async () => ({ email: "newmember@example.com", role: "member" }) } as never;
    const res = await POST(req, { params: Promise.resolve({ id: "ws-001" }) });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.email).toBe("newmember@example.com");
  });
});
