import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** GET /api/landing-pages/:id — get single page (by id or slug) */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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

/** PATCH /api/landing-pages/:id — update fields */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const existing = await prisma.landingPage.findFirst({
    where: { OR: [{ id }, { slug: id }] },
  });

  if (!existing) {
    return NextResponse.json({ error: "Landing page not found" }, { status: 404 });
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

/** DELETE /api/landing-pages/:id — delete page */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const existing = await prisma.landingPage.findFirst({
    where: { OR: [{ id }, { slug: id }] },
  });

  if (!existing) {
    return NextResponse.json({ error: "Landing page not found" }, { status: 404 });
  }

  const data = await prisma.landingPage.delete({ where: { id: existing.id } });
  return NextResponse.json({ data, message: "Landing page deleted" });
}
