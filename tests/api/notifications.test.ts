import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    notification: {
      count: vi.fn(),
      createMany: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GET, POST, PATCH, DELETE } from "@/app/api/notifications/route";
import { createNotification } from "@/lib/notifications";

describe("Notifications API & Dispatcher", { timeout: 15000 }, () => {
  beforeEach(() => vi.clearAllMocks());

  it("GET /api/notifications returns 401 when unauthorized", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("GET /api/notifications seeds starter notifications on first load and returns list", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { email: "founder@example.com" },
    });
    (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "usr-founder",
      email: "founder@example.com",
    });
    (prisma.notification.count as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(0);
    (prisma.notification.createMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ count: 4 });
    (prisma.notification.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: "notif-1",
        userId: "usr-founder",
        type: "experiment",
        title: "Variant B reached significance",
        message: "Confidence 98%",
        read: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "notif-2",
        userId: "usr-founder",
        type: "system",
        title: "System update",
        message: "Sprint active",
        read: true,
        createdAt: new Date().toISOString(),
      },
    ]);

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.total).toBe(2);
    expect(body.unread).toBe(1);
    expect(body.data).toHaveLength(2);
    expect(prisma.notification.createMany).toHaveBeenCalled();
  });

  it("POST /api/notifications creates a new notification", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { email: "founder@example.com" },
    });
    (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "usr-founder",
      email: "founder@example.com",
    });
    (prisma.notification.create as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "notif-new",
      userId: "usr-founder",
      type: "lead",
      title: "New Lead captured",
      message: "Sarah booked demo",
      read: false,
    });

    const req = {
      json: async () => ({
        type: "lead",
        title: "New Lead captured",
        message: "Sarah booked demo",
      }),
    } as never;

    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.title).toBe("New Lead captured");
  });

  it("PATCH /api/notifications marks single notification as read", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { email: "founder@example.com" },
    });
    (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "usr-founder",
      email: "founder@example.com",
    });
    (prisma.notification.update as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "notif-1",
      read: true,
    });

    const req = {
      json: async () => ({ id: "notif-1" }),
    } as never;

    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.id).toBe("notif-1");
  });

  it("PATCH /api/notifications marks all notifications as read", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { email: "founder@example.com" },
    });
    (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "usr-founder",
      email: "founder@example.com",
    });
    (prisma.notification.updateMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      count: 5,
    });

    const req = {
      json: async () => ({ markAll: true }),
    } as never;

    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.count).toBe("all");
  });

  it("DELETE /api/notifications dismisses a single notification", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { email: "founder@example.com" },
    });
    (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "usr-founder",
      email: "founder@example.com",
    });
    (prisma.notification.delete as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "notif-1",
    });

    const req = {
      url: "http://localhost/api/notifications?id=notif-1",
      json: async () => ({}),
    } as never;

    const res = await DELETE(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.deleted).toBe("notif-1");
  });

  it("DELETE /api/notifications clears all notifications", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { email: "founder@example.com" },
    });
    (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "usr-founder",
      email: "founder@example.com",
    });
    (prisma.notification.deleteMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      count: 8,
    });

    const req = {
      url: "http://localhost/api/notifications?clearAll=true",
      json: async () => ({}),
    } as never;

    const res = await DELETE(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.cleared).toBe(true);
  });

  it("createNotification helper inserts record into prisma.notification", async () => {
    (prisma.notification.create as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "notif-auto",
      type: "experiment",
      title: "Experiment Created",
      message: "Variant A and B running",
    });

    const notif = await createNotification({
      type: "experiment",
      title: "Experiment Created",
      message: "Variant A and B running",
    });

    expect(notif).toBeDefined();
    expect(prisma.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: "experiment",
        title: "Experiment Created",
      }),
    });
  });
});
