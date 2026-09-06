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
    return NextResponse.json({ data: [], total: 0, error: "Failed to fetch landing pages" });
  }
}

/** POST /api/landing-pages — create a new landing page in caller's workspace */
export async function POST(request: NextRequest) {
  try {
    const ctx = await getAuthenticatedWorkspace(request);
    if (!ctx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid or empty JSON body" }, { status: 400 });
    }

    const required = ["name", "template", "headline", "subheadline", "cta", "slug"];
    for (const field of required) {
      if (!body?.[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Enforce landing pages plan limit
    try {
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
    } catch (quotaErr) {
      console.warn("Workspace limit check warning in POST /api/landing-pages:", quotaErr);
    }

    // Find or verify project in caller's workspace or membership
    let projectId = body.projectId;
    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });
      if (project) {
        if (project.workspaceId !== ctx.workspace.id) {
          const hasAccess = ctx.user?.id
            ? await prisma.workspaceMember.findFirst({
                where: { workspaceId: project.workspaceId, userId: ctx.user.id },
              })
            : null;
          if (!hasAccess && ctx.workspace.id !== "default-ws") {
            return NextResponse.json({ error: "Project not found in your workspace" }, { status: 403 });
          }
        }
        projectId = project.id;
      } else {
        // Fallback to active workspace project
        let projectFallback = await prisma.project.findFirst({
          where: { workspaceId: ctx.workspace.id },
        });
        if (!projectFallback) {
          projectFallback = await prisma.project.create({
            data: {
              workspaceId: ctx.workspace.id,
              name: body.name || "Default Project",
              status: "active",
            },
          });
        }
        projectId = projectFallback.id;
      }
    } else {
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

    // Verify experiment exists if experimentId provided (prevent P2003 foreign key violation)
    let validExperimentId: string | null = null;
    if (body.experimentId) {
      const expExists = await prisma.experiment.findUnique({
        where: { id: String(body.experimentId) },
        select: { id: true },
      });
      if (expExists) {
        validExperimentId = expExists.id;
      }
    }

    // Ensure safe and unique slug
    let rawSlug = String(body.slug || "page")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (!rawSlug) rawSlug = "smoke-test";

    let finalSlug = rawSlug;
    const existing = await prisma.landingPage.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      if (validExperimentId && existing.experimentId === validExperimentId) {
        const updated = await prisma.landingPage.update({
          where: { id: existing.id },
          data: {
            name: String(body.name || "Smoke Test Page").trim(),
            template: body.template || "hero",
            headline: String(body.headline || "").trim(),
            subheadline: String(body.subheadline || "").trim(),
            cta: String(body.cta || "Get Early Access").trim(),
            positioning: body.positioning || "",
            status: body.status || "live",
            preorderEnabled: Boolean(body.preorderEnabled),
            depositAmount: Math.round(Number(body.depositAmount) || 0),
            priceAnchor: Math.round(Number(body.priceAnchor) || 49),
            surveyEnabled: body.surveyEnabled !== undefined ? Boolean(body.surveyEnabled) : true,
            surveyQuestions: typeof body.surveyQuestions === "string" ? body.surveyQuestions : JSON.stringify(body.surveyQuestions || []),
          },
        });
        return NextResponse.json({ data: updated }, { status: 200 });
      }

      // If belongs to another entity, generate unique slug
      let attempt = 0;
      while (attempt < 10) {
        finalSlug = `${rawSlug}-${Math.random().toString(36).substring(2, 6)}`;
        const collision = await prisma.landingPage.findUnique({ where: { slug: finalSlug }, select: { id: true } });
        if (!collision) break;
        attempt++;
      }
    }

    const data = await prisma.landingPage.create({
      data: {
        id: body.id || undefined,
        projectId,
        name: String(body.name || "Smoke Test Page").trim(),
        template: body.template || "hero",
        headline: String(body.headline || "").trim(),
        subheadline: String(body.subheadline || "").trim(),
        cta: String(body.cta || "Get Early Access").trim(),
        positioning: body.positioning || "",
        status: body.status || "live",
        experimentId: validExperimentId,
        slug: finalSlug,
        preorderEnabled: Boolean(body.preorderEnabled),
        depositAmount: Math.round(Number(body.depositAmount) || 0),
        priceAnchor: Math.round(Number(body.priceAnchor) || 49),
        surveyEnabled: body.surveyEnabled !== undefined ? Boolean(body.surveyEnabled) : true,
        surveyQuestions: typeof body.surveyQuestions === "string" ? body.surveyQuestions : JSON.stringify(body.surveyQuestions || []),
      },
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (e) {
    console.error("Failed to create landing page:", e);
    return NextResponse.json(
      { error: (e as Error).message || "Failed to create landing page" },
      { status: 500 }
    );
  }
}
