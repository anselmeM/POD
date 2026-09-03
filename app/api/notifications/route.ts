import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** GET /api/notifications — list for current user (most recent first) */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ data: [], total: 0, unread: 0 });

    // Seed default starter notifications if user has none
    try {
      const count = await prisma.notification.count({ where: { userId: user.id } });
      if (count === 0) {
        await prisma.notification.createMany({
          data: [
            {
              userId: user.id,
              type: "experiment",
              title: "Variant B reached significance",
              message: "EXP-2048 Variant B is outperforming control with 98.2% statistical confidence. Consider scaling.",
              read: false,
            },
            {
              userId: user.id,
              type: "lead",
              title: "New high-intent lead captured",
              message: "Emily Watson (Streamline Ops) clicked 'Start Pilot' and submitted qualification details.",
              read: false,
            },
            {
              userId: user.id,
              type: "insight",
              title: "AI Analysis: Pricing elasticity update",
              message: "Willingness-to-pay clustering suggests strong conversion elasticity between $49 and $79/mo.",
              read: false,
            },
            {
              userId: user.id,
              type: "system",
              title: "Validation sprint countdown active",
              message: "Your current validation sprint ends in 3 days. Check your funnel health score.",
              read: true,
            },
          ],
        });
      }
    } catch (seedErr) {
      console.warn("Could not seed starter notifications:", seedErr);
    }

    const data = await prisma.notification.findMany({
      where: { OR: [{ userId: user.id }, { userId: null }] },
      orderBy: { createdAt: "desc" },
      take: 40,
    });
    const unread = data.filter((n) => !n.read).length;
    return NextResponse.json({ data, total: data.length, unread });
  } catch (e) {
    console.error("Failed to fetch notifications:", e);
    return NextResponse.json({ data: [], total: 0, unread: 0 });
  }
}

/** POST /api/notifications — create a new notification */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await request.json().catch(() => ({}));
    if (!body.title) {
      return NextResponse.json({ error: "Notification title is required" }, { status: 400 });
    }

    const created = await prisma.notification.create({
      data: {
        userId: user.id,
        type: String(body.type || "system"),
        title: String(body.title),
        message: String(body.message || ""),
        read: false,
      },
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (e) {
    console.error("Failed to create notification:", e);
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}

/** PATCH /api/notifications — mark read (body: { id? markAll?: boolean }) */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await request.json().catch(() => ({}));
    if (body.markAll) {
      await prisma.notification.updateMany({
        where: { userId: user.id, read: false },
        data: { read: true },
      });
      return NextResponse.json({ success: true, count: "all" });
    }
    if (body.id) {
      await prisma.notification.update({
        where: { id: String(body.id) },
        data: { read: true },
      });
      return NextResponse.json({ success: true, id: body.id });
    }
    return NextResponse.json({ error: "Missing id or markAll" }, { status: 400 });
  } catch (e) {
    console.error("Failed to update notification:", e);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}

/** DELETE /api/notifications — dismiss / clear notifications */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { searchParams } = new URL(request.url);
    const idFromQuery = searchParams.get("id");
    const clearAllFromQuery = searchParams.get("clearAll") === "true";

    const body = await request.json().catch(() => ({}));
    const targetId = idFromQuery || body.id;
    const clearAll = clearAllFromQuery || body.clearAll;

    if (clearAll) {
      await prisma.notification.deleteMany({
        where: { userId: user.id },
      });
      return NextResponse.json({ success: true, cleared: true });
    }

    if (targetId) {
      await prisma.notification.delete({
        where: { id: String(targetId) },
      });
      return NextResponse.json({ success: true, deleted: targetId });
    }

    return NextResponse.json({ error: "Missing id or clearAll" }, { status: 400 });
  } catch (e) {
    console.error("Failed to delete notification:", e);
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 });
  }
}
