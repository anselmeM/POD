import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedWorkspace } from "@/lib/workspace";
import { checkWorkspaceLimit } from "@/lib/plan-limits";
import type { LandingPageStatus } from "@/lib/types";

/** GET /api/landing-pages — list all landing pages scoped to caller's workspace */
export async function GET(request: NextRequest) {
  const ctx = await getAuthenticatedWorkspace(request);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const status = request.nextUrl.searchParams.get("status") as LandingPageStatus | null;
    const where: Record<string, unknown> = {
      project: {
        workspaceId: ctx.workspace.id,
      },
    };
    if (status) where.status = status;

    const data = await prisma.landingPage.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ data, total: data.length });
  } catch (e) {
    console.error("Failed to fetch landing pages:", e);
    return NextResponse.json({ error: "Failed to fetch landing pages" }, { status: 500 });
  }
}

/** POST /api/landing-pages — create a new landing page in caller's workspace */
export async function POST(request: NextRequest) {
  const ctx = await getAuthenticatedWorkspace(request);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();

  const required = ["name", "template", "headline", "subheadline", "cta", "slug"];
  for (const field of required) {
    if (!body[field]) {
      return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
    }
  }

  // Enforce landing pages plan limit
  const quota = await checkWorkspaceLimit(ctx.workspace.id, "landingPages");
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

  // Find or verify project in caller's workspace
  let projectId = body.projectId;
  if (projectId) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, workspaceId: ctx.workspace.id },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found in your workspace" }, { status: 403 });
    }
  } else {
    // Default to the first project in workspace, or create one if none exist
    let project = await prisma.project.findFirst({
      where: { workspaceId: ctx.workspace.id },
    });
    if (!project) {
      project = await prisma.project.create({
        data: {
          workspaceId: ctx.workspace.id,
          name: body.name || "Default Project",
          status: "active",
        },
      });
    }
    projectId = project.id;
  }

  // Check slug uniqueness
  try {
    const existing = await prisma.landingPage.findUnique({ where: { slug: body.slug } });
    if (existing) {
      return NextResponse.json({ error: `Slug "${body.slug}" already exists` }, { status: 409 });
    }

    const data = await prisma.landingPage.create({
      data: {
        id: body.id || undefined,
        projectId,
        name: body.name,
        template: body.template,
        headline: body.headline,
        subheadline: body.subheadline,
        cta: body.cta,
        positioning: body.positioning || "",
        status: body.status || "live",
        experimentId: body.experimentId || null,
        slug: body.slug,
      },
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (e) {
    console.error("Failed to create landing page:", e);
    return NextResponse.json({ error: "Failed to create landing page" }, { status: 500 });
  }
}
