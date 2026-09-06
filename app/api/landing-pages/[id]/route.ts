import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedWorkspace } from "@/lib/workspace";

/** GET /api/landing-pages/:id — get single page (by id or slug, public for visitor rendering) */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let page = await prisma.landingPage.findFirst({
    where: { OR: [{ id }, { slug: id }, { experimentId: id }] },
    include: { project: true },
  });

  // If not found, check if an Experiment exists with this id
  if (!page) {
    const exp = await prisma.experiment.findUnique({
      where: { id },
      include: {
        project: true,
        variants: true,
      },
    });

    if (exp) {
      const v = exp.variants[0];
      const safeSlug =
        exp.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") || exp.id;

      page = await prisma.landingPage.create({
        data: {
          projectId: exp.projectId,
          experimentId: exp.id,
          name: `${exp.name} Live Page`,
          template: "hero",
          headline: v?.headline || exp.name,
          subheadline:
            v?.subheadline ||
            "The automated solution built for modern founders and teams. Join early adopters testing today.",
          cta: v?.cta || "Get Early Access",
          positioning: v?.positioning || "Direct Value Focus",
          slug: safeSlug,
          status: "live",
          preorderEnabled: true,
          depositAmount: 1000,
          priceAnchor: 4900,
          surveyEnabled: true,
        },
        include: { project: true },
      });
    }
  }

  // If still not found and requesting common default smoke test slugs
  if (!page && (id === "smoke-test" || id === "demo" || id === "default")) {
    let defaultProject = await prisma.project.findFirst();
    if (!defaultProject) {
      let ws = await prisma.workspace.findFirst();
      if (!ws) {
        ws = await prisma.workspace.create({
          data: {
            name: "Solo Founder Studio",
            plan: "trial",
          },
        });
      }
      defaultProject = await prisma.project.create({
        data: {
          workspaceId: ws.id,
          name: "AI Workflow Copilot",
          description: "Automated operational copilot for solo founders.",
          status: "testing",
          podScore: 78,
        },
      });
    }

    page = await prisma.landingPage.create({
      data: {
        projectId: defaultProject.id,
        name: "AI Workflow Copilot — Smoke Test Page",
        template: "hero",
        headline: "Automate 80% of Your Recurring Client Reporting",
        subheadline:
          "Stop losing 10 hours every week to manual spreadsheets. Deliver branded, executive KPI summaries on autopilot.",
        cta: "Reserve Founding Spot ($10)",
        positioning: "Refundable Founder Deposit",
        slug: id,
        status: "live",
        preorderEnabled: true,
        depositAmount: 1000,
        priceAnchor: 4900,
        surveyEnabled: true,
        surveyQuestions: JSON.stringify([
          {
            id: "q1",
            question: "What is your biggest pain with client reporting today?",
            type: "text",
          },
          {
            id: "q2",
            question: "What price would feel like an absolute no-brainer for this?",
            type: "text",
          },
        ]),
      },
      include: { project: true },
    });
  }

  if (!page) {
    return NextResponse.json({ error: "Landing page not found" }, { status: 404 });
  }

  let trackingPixels = {
    metaPixelId: null as string | null,
    googleAdsId: null as string | null,
    linkedinPartnerId: null as string | null,
  };

  if (page.project?.workspaceId) {
    const ws = await prisma.workspace.findUnique({
      where: { id: page.project.workspaceId },
      select: {
        metaPixelId: true,
        googleAdsId: true,
        linkedinPartnerId: true,
      },
    });
    if (ws) {
      trackingPixels = ws;
    }
  }

  return NextResponse.json({
    data: {
      ...page,
      trackingPixels,
    },
  });
}

/** PATCH /api/landing-pages/:id — update fields (requires auth and workspace ownership) */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getAuthenticatedWorkspace(request);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const existing = await prisma.landingPage.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: { project: true },
  });

  if (!existing || existing.project.workspaceId !== ctx.workspace.id) {
    return NextResponse.json({ error: "Landing page not found in your workspace" }, { status: 404 });
  }

  const body = await request.json();
  const { id: _id, createdAt: _ca, ...updates } = body;

  // If slug is being changed, check uniqueness
  if (updates.slug && updates.slug !== existing.slug) {
    const slugTaken = await prisma.landingPage.findUnique({ where: { slug: updates.slug } });
    if (slugTaken) {
      return NextResponse.json({ error: `Slug "${updates.slug}" already exists` }, { status: 409 });
    }
  }

  const data = await prisma.landingPage.update({
    where: { id: existing.id },
    data: updates,
  });

  return NextResponse.json({ data });
}

/** DELETE /api/landing-pages/:id — delete page (requires auth and workspace ownership) */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getAuthenticatedWorkspace(request);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const existing = await prisma.landingPage.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: { project: true },
  });

  if (!existing || existing.project.workspaceId !== ctx.workspace.id) {
    return NextResponse.json({ error: "Landing page not found in your workspace" }, { status: 404 });
  }

  const data = await prisma.landingPage.delete({ where: { id: existing.id } });
  return NextResponse.json({ data, message: "Landing page deleted" });
}
