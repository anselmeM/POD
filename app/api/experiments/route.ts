import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeExperiment } from "@/lib/serialize";
import { getAuthenticatedWorkspace } from "@/lib/workspace";
import { checkWorkspaceLimit } from "@/lib/plan-limits";

/** GET /api/experiments — list all experiments for caller's workspace */
export async function GET(request: NextRequest) {
  const ctx = await getAuthenticatedWorkspace(request);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectId = request.nextUrl.searchParams.get("projectId");
  const status = request.nextUrl.searchParams.get("status");

  const where: Record<string, unknown> = {
    project: {
      workspaceId: ctx.workspace.id,
    },
  };
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

/** POST /api/experiments — create a new experiment (requires auth & workspace ownership) */
export async function POST(request: NextRequest) {
  const ctx = await getAuthenticatedWorkspace(request);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();

  if (!body.name) {
    return NextResponse.json({ error: "Experiment name is required" }, { status: 400 });
  }
  if (!body.projectId) {
    return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
  }

  // Verify that the target project belongs strictly to the caller's workspace
  const project = await prisma.project.findFirst({
    where: {
      id: body.projectId,
      workspaceId: ctx.workspace.id,
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found in your workspace" }, { status: 403 });
  }

  // Enforce plan limit for active experiments
  const isTargetActive = body.status === "active" || body.status === "testing";
  if (isTargetActive) {
    const quota = await checkWorkspaceLimit(ctx.workspace.id, "activeExperiments");
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: quota.message,
          upgradeRequired: true,
          current: quota.current,
          limit: quota.limit,
        },
        { status: 402 }
      );
    }
  }

  try {
    const variantsInput = (Array.isArray(body.variants) ? body.variants : []) as Record<string, unknown>[];
    const expId: string = body.id ? String(body.id) : `exp-${Date.now()}`;
    const data: Record<string, unknown> = {
      id: expId,
      projectId: body.projectId,
      name: body.name,
      status: body.status || "draft",
      budget: body.budget || 0,
      channel: JSON.stringify(body.channel || []),
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
    };
    if (variantsInput.length) {
      (data as Record<string, unknown> & { variants: unknown }).variants = {
        create: variantsInput.map((v, idx) => ({
          ...(v.id ? { id: String(v.id) } : { id: `${expId}-var-${idx + 1}` }),
          name: String(v.name || "Variant"),
          headline: String(v.headline || ""),
          subheadline: String(v.subheadline || ""),
          cta: String(v.cta || "Get Started"),
          positioning: String(v.positioning || ""),
          traffic: Number(v.traffic) || 0,
          conversions: Number(v.conversions) || 0,
          conversionRate: Number(v.conversionRate) || 0,
        })),
      };
    }

    const created = await prisma.experiment.create({
      data: data as Parameters<typeof prisma.experiment.create>[0]["data"],
      include: { variants: true },
    });

    return NextResponse.json({ data: serializeExperiment(created) }, { status: 201 });
  } catch (e) {
    console.error("Failed to create experiment:", e);
    return NextResponse.json({ error: "Failed to create experiment" }, { status: 500 });
  }
}
