import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

/** GET /api/workspaces/[id] — get workspace details */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const workspace = await prisma.workspace.findUnique({ where: { id } });
  if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

  return NextResponse.json({ data: workspace });
}

/** PATCH /api/workspaces/[id] — update workspace details */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Verify caller is owner or admin
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: id,
      userId: user.id,
      role: { in: ["owner", "admin"] },
    },
  });

  const workspace = await prisma.workspace.findUnique({ where: { id } });
  if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

  if (!membership && workspace.ownerId !== user.id) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }

  const updated = await prisma.workspace.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: String(body.name).trim() } : {}),
      ...(body.plan !== undefined ? { plan: String(body.plan).trim() } : {}),
      ...(body.metaPixelId !== undefined ? { metaPixelId: body.metaPixelId ? String(body.metaPixelId).trim() : null } : {}),
      ...(body.googleAdsId !== undefined ? { googleAdsId: body.googleAdsId ? String(body.googleAdsId).trim() : null } : {}),
      ...(body.linkedinPartnerId !== undefined ? { linkedinPartnerId: body.linkedinPartnerId ? String(body.linkedinPartnerId).trim() : null } : {}),
    },
  });

  return NextResponse.json({ data: updated });
}

/** DELETE /api/workspaces/[id] — delete workspace */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const workspace = await prisma.workspace.findUnique({ where: { id } });
  if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

  const membership = await prisma.workspaceMember.findFirst({
    where: { workspaceId: id, userId: user.id, role: "owner" },
  });

  if (!membership && workspace.ownerId !== user.id) {
    return NextResponse.json({ error: "Forbidden: only workspace owner can delete" }, { status: 403 });
  }

  await prisma.workspace.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
