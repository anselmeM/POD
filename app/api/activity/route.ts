import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const count = await prisma.activityLog.count({ where: { userId: user.id } });
  if (count === 0) {
    await prisma.activityLog.createMany({
      data: [
        { userId: user.id, action: "experiment.created", entityType: "Experiment", entityId: "EXP-2048", detail: "Created Time-Savings Positioning" },
        { userId: user.id, action: "lead.status_changed", entityType: "Lead", entityId: "lead-005", detail: "Emily Watson → qualified" },
        { userId: user.id, action: "landing_page.published", entityType: "LandingPage", entityId: "lp-002", detail: "Variant B — Automation published" },
        { userId: user.id, action: "experiment.deleted", entityType: "Experiment", entityId: "EXP-2035", detail: "Deleted Pricing Sensitivity (cleaned after test)" },
      ],
    });
  }

  const type = request.nextUrl.searchParams.get("type");
  const where: Record<string, string> = { userId: user.id };
  if (type) where.entityType = type;
  const data = await prisma.activityLog.findMany({ where, orderBy: { createdAt: "desc" }, take: 50 });
  return NextResponse.json({ data, total: data.length });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const body = await request.json();
  const log = await prisma.activityLog.create({
    data: { userId: user.id, action: String(body.action || "unknown"), entityType: String(body.entityType || "Unknown"), entityId: body.entityId ? String(body.entityId) : null, detail: String(body.detail || "") },
  });
  return NextResponse.json({ data: log }, { status: 201 });
}
