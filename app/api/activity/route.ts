import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedWorkspace } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const ctx = await getAuthenticatedWorkspace(request);
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const count = await prisma.activityLog.count({ where: { userId: ctx.user.id } });
    if (count === 0) {
      await prisma.activityLog.createMany({
        data: [
          { userId: ctx.user.id, action: "experiment.created", entityType: "Experiment", entityId: "EXP-2048", detail: "Created Time-Savings Positioning" },
          { userId: ctx.user.id, action: "lead.status_changed", entityType: "Lead", entityId: "lead-005", detail: "Emily Watson → qualified" },
          { userId: ctx.user.id, action: "landing_page.published", entityType: "LandingPage", entityId: "lp-002", detail: "Variant B — Automation published" },
          { userId: ctx.user.id, action: "experiment.deleted", entityType: "Experiment", entityId: "EXP-2035", detail: "Deleted Pricing Sensitivity (cleaned after test)" },
        ],
      });
    }

    const type = request.nextUrl.searchParams.get("type");
    const where: Record<string, string> = { userId: ctx.user.id };
    if (type) where.entityType = type;
    const data = await prisma.activityLog.findMany({ where, orderBy: { createdAt: "desc" }, take: 50 });
    return NextResponse.json({ data, total: data.length });
  } catch (error) {
    console.error("Error in GET /api/activity:", error);
    return NextResponse.json({ data: [], total: 0 });
  }
}

export async function POST(request: NextRequest) {
  const ctx = await getAuthenticatedWorkspace(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const log = await prisma.activityLog.create({
    data: {
      userId: ctx.user.id,
      action: String(body.action || "unknown"),
      entityType: String(body.entityType || "Unknown"),
      entityId: body.entityId ? String(body.entityId) : null,
      detail: String(body.detail || ""),
    },
  });
  return NextResponse.json({ data: log }, { status: 201 });
}
