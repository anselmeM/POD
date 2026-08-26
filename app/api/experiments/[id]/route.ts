import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeExperiment } from "@/lib/serialize";
import { auth } from "@/lib/auth";
import { hasRole, getWorkspaceRole } from "@/lib/rbac";

/** GET /api/experiments/[id] — get a single experiment with variants */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const experiment = await prisma.experiment.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!experiment) {
      return NextResponse.json({ error: "Experiment not found" }, { status: 404 });
    }

    return NextResponse.json({ data: serializeExperiment(experiment) });
  } catch (e) {
    console.error("Failed to fetch experiment:", e);
    return NextResponse.json({ error: "Failed to fetch experiment" }, { status: 500 });
  }
}

/** PATCH /api/experiments/[id] — update an experiment (requires auth, member+) */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json();

  try {
    const existing = await prisma.experiment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Experiment not found" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.status !== undefined) data.status = body.status;
    if (body.budget !== undefined) data.budget = body.budget;
    if (body.channel !== undefined) data.channel = JSON.stringify(body.channel);
    if (body.startDate !== undefined) data.startDate = body.startDate ? new Date(body.startDate) : null;
    if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate) : null;
    if (body.traffic !== undefined) data.traffic = body.traffic;
    if (body.conversions !== undefined) data.conversions = body.conversions;
    if (body.conversionRate !== undefined) data.conversionRate = body.conversionRate;
    if (body.highIntentActions !== undefined) data.highIntentActions = body.highIntentActions;
    if (body.highIntentRate !== undefined) data.highIntentRate = body.highIntentRate;
    if (body.costPerAction !== undefined) data.costPerAction = body.costPerAction;

    const experiment = await prisma.experiment.update({
      where: { id },
      data,
      include: { variants: true },
    });

    return NextResponse.json({ data: serializeExperiment(experiment) });
  } catch (e) {
    console.error("Failed to update experiment:", e);
    return NextResponse.json({ error: "Failed to update experiment" }, { status: 500 });
  }
}

/** DELETE /api/experiments/[id] — delete an experiment (requires admin+) */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  try {
    const existing = await prisma.experiment.findUnique({ where: { id }, include: { project: true } });
    if (!existing) {
      return NextResponse.json({ error: "Experiment not found" }, { status: 404 });
    }

    // RBAC: only admin/owner of the workspace can delete
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (user) {
      const role = await getWorkspaceRole(user.id, existing.project.workspaceId);
      if (!hasRole(role, "admin")) {
        return NextResponse.json({ error: "Forbidden: admin role required" }, { status: 403 });
      }
    }

    await prisma.experiment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Failed to delete experiment:", e);
    return NextResponse.json({ error: "Failed to delete experiment" }, { status: 500 });
  }
}
