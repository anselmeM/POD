import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** GET /api/workspaces — list workspaces for current user */
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const memberships = await prisma.workspaceMember.findMany({
    where: { userId: user.id },
    include: { workspace: true },
  });

  const owned = await prisma.workspace.findMany({ where: { ownerId: user.id } });
  const ownedIds = new Set(memberships.map((m) => m.workspaceId));
  const extraOwned = owned.filter((w) => !ownedIds.has(w.id));

  const data = [
    ...memberships.map((m) => ({ ...m.workspace, role: m.role })),
    ...extraOwned.map((w) => ({ ...w, role: "owner" as const })),
  ];

  return NextResponse.json({ data });
}

/** POST /api/workspaces — create a new workspace */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  if (!body.name) {
    return NextResponse.json({ error: "Workspace name is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const workspace = await prisma.workspace.create({
    data: { name: String(body.name).trim(), plan: body.plan || "trial", ownerId: user.id },
  });

  await prisma.workspaceMember.create({
    data: { workspaceId: workspace.id, userId: user.id, role: "owner" },
  });

  return NextResponse.json({ data: workspace }, { status: 201 });
}
