import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedWorkspace } from "@/lib/workspace";

/** POST /api/projects — create a Project + initial Experiment from onboarding wizard (requires auth) */
export async function POST(request: NextRequest) {
  const ctx = await getAuthenticatedWorkspace(request);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();

  // Validate required fields
  if (!body.productName) {
    return NextResponse.json({ error: "Product name is required" }, { status: 400 });
  }

  try {
    // Create the project strictly scoped to the caller's active workspace
    const project = await prisma.project.create({
      data: {
        workspaceId: ctx.workspace.id,
        name: String(body.productName).trim(),
        description: body.description || body.oneLiner || "",
        status: "idea",
      },
    });

    // Create an initial experiment linked to the project
    const experimentId = `exp-${Date.now()}`;
    const experiment = await prisma.experiment.create({
      data: {
        id: experimentId,
        projectId: project.id,
        name: `${body.productName} — Initial Validation`,
        status: "draft",
        budget: Number(body.budget) || 100,
        channel: JSON.stringify(body.channel || ["linkedin", "meta"]),
      },
    });

    return NextResponse.json(
      { project, experiment },
      { status: 201 }
    );
  } catch (e) {
    console.error("Failed to create project:", e);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

/** GET /api/projects — list projects scoped to caller's workspace */
export async function GET(request: NextRequest) {
  const ctx = await getAuthenticatedWorkspace(request);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await prisma.project.findMany({
      where: { workspaceId: ctx.workspace.id },
      orderBy: { updatedAt: "desc" },
      include: { experiments: true },
    });
    return NextResponse.json({ data, total: data.length });
  } catch (e) {
    console.error("Failed to fetch projects:", e);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}
