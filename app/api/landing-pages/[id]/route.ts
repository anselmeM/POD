import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedWorkspace } from "@/lib/workspace";

/** GET /api/landing-pages/:id — get single page (by id or slug, public for visitor rendering) */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const page = await prisma.landingPage.findFirst({
    where: { OR: [{ id }, { slug: id }] },
  });

  if (!page) {
    return NextResponse.json({ error: "Landing page not found" }, { status: 404 });
  }

  return NextResponse.json({ data: page });
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
