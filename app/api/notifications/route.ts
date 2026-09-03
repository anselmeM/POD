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

    // Ensure demo notifications exist
    try {
      const count = await prisma.notification.count({ where: { userId: user.id } });
      if (count === 0) {
        await prisma.notification.createMany({
          data: [
            { userId: user.id, type: "experiment", title: "Variant B reached significance", message: "EXP-2048 Variant B is now significantly outperforming (p=0.018). Consider scaling.", read: false },
            { userId: user.id, type: "lead", title: "New qualified lead", message: "Emily Watson (Streamline) marked as qualified.", read: false },
            { userId: user.id, type: "experiment", title: "Sprint ends in 2 days", message: "Your current validation sprint wraps up soon.", read: true },
          ],
        });
      }
    } catch {}

    const data = await prisma.notification.findMany({
      where: { OR: [{ userId: user.id }, { userId: null }] },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    const unread = data.filter((n) => !n.read).length;
    return NextResponse.json({ data, total: data.length, unread });
  } catch (e) {
    console.error("Failed to fetch notifications:", e);
    return NextResponse.json({ data: [], total: 0, unread: 0 });
  }
}

/** PATCH /api/notifications — mark read (body: { id? markAll?: boolean }) */
export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  if (body.markAll) {
    await prisma.notification.updateMany({ where: { userId: user.id, read: false }, data: { read: true } });
    return NextResponse.json({ success: true });
  }
  if (body.id) {
    await prisma.notification.update({ where: { id: String(body.id) }, data: { read: true } });
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: "Missing id or markAll" }, { status: 400 });
}
