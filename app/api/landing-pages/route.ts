import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { LandingPageStatus } from "@/lib/types";

/** GET /api/landing-pages — list all (optional ?status= filter) */
export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status") as LandingPageStatus | null;
  const where = status ? { status } : {};
  const data = await prisma.landingPage.findMany({ where, orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ data, total: data.length });
}

/** POST /api/landing-pages — create a new landing page */
export async function POST(request: NextRequest) {
  const body = await request.json();

  const required = ["name", "template", "headline", "subheadline", "cta", "slug"];
  for (const field of required) {
    if (!body[field]) {
      return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
    }
  }

  // Check slug uniqueness
  const existing = await prisma.landingPage.findUnique({ where: { slug: body.slug } });
  if (existing) {
    return NextResponse.json({ error: `Slug "${body.slug}" already exists` }, { status: 409 });
  }

  const data = await prisma.landingPage.create({
    data: {
      id: body.id || undefined,
      projectId: body.projectId || "proj-001",
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
}
