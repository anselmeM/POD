import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeExperiment } from "@/lib/serialize";

/** GET /api/experiments — list all experiments with variants */
export async function GET(request: NextRequest) {
  const projectId = request.nextUrl.searchParams.get("projectId");
  const status = request.nextUrl.searchParams.get("status");
  const where: Record<string, string> = {};
  if (projectId) where.projectId = projectId;
  if (status) where.status = status;

  try {
    const data = await prisma.experiment.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: { variants: true },
    });
    return NextResponse.json({ data: data.map(serializeExperiment), total: data.length });
  } catch (e) {
    console.error("Failed to fetch experiments:", e);
    return NextResponse.json({ error: "Failed to fetch experiments" }, { status: 500 });
  }
}

/** POST /api/experiments — create a new experiment */
export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.name) {
    return NextResponse.json({ error: "Experiment name is required" }, { status: 400 });
  }
  if (!body.projectId) {
    return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
  }

  try {
    const experiment = await prisma.experiment.create({
      data: {
        id: body.id || undefined,
        projectId: body.projectId,
        name: body.name,
        status: body.status || "draft",
        budget: body.budget || 0,
        channel: JSON.stringify(body.channel || []),
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
      },
      include: { variants: true },
    });
    return NextResponse.json({ data: serializeExperiment(experiment) }, { status: 201 });
  } catch (e) {
    console.error("Failed to create experiment:", e);
    return NextResponse.json({ error: "Failed to create experiment" }, { status: 500 });
  }
}
