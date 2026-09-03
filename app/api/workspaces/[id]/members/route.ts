import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

/** GET /api/workspaces/[id]/members — list members of a workspace */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Verify caller is a member or owner
  const isMember = await prisma.workspaceMember.findFirst({
    where: { workspaceId: id, userId: user.id },
  });
  const workspace = await prisma.workspace.findUnique({ where: { id } });
  if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

  if (!isMember && workspace.ownerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId: id },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const formatted = members.map((m) => ({
    id: m.id,
    userId: m.userId,
    name: m.user.name || m.user.email.split("@")[0],
    email: m.user.email,
    image: m.user.image,
    role: m.role,
    createdAt: m.createdAt,
  }));

  return NextResponse.json({ data: formatted });
}

/** POST /api/workspaces/[id]/members — invite/add a member */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const inviteEmail = String(body.email || "").trim().toLowerCase();
  const role = body.role === "admin" ? "admin" : "member";

  if (!inviteEmail || !inviteEmail.includes("@")) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  const caller = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!caller) return NextResponse.json({ error: "Caller not found" }, { status: 404 });

  // Caller must be owner or admin
  const callerMembership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: id,
      userId: caller.id,
      role: { in: ["owner", "admin"] },
    },
  });
  const workspace = await prisma.workspace.findUnique({ where: { id } });
  if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

  if (!callerMembership && workspace.ownerId !== caller.id) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }

  // Find or create target user
  let targetUser = await prisma.user.findUnique({ where: { email: inviteEmail } });
  if (!targetUser) {
    targetUser = await prisma.user.create({
      data: {
        email: inviteEmail,
        name: inviteEmail.split("@")[0],
      },
    });
  }

  // Check if already a member
  const existing = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: id,
        userId: targetUser.id,
      },
    },
  });

  if (existing) {
    return NextResponse.json({ error: "User is already a member of this workspace" }, { status: 409 });
  }

  const newMembership = await prisma.workspaceMember.create({
    data: {
      workspaceId: id,
      userId: targetUser.id,
      role,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: caller.id,
      action: "member.invited",
      entityType: "workspace",
      entityId: id,
      detail: `Invited ${inviteEmail} as ${role}`,
    },
  });

  return NextResponse.json(
    {
      data: {
        id: newMembership.id,
        userId: newMembership.userId,
        name: newMembership.user.name || newMembership.user.email.split("@")[0],
        email: newMembership.user.email,
        image: newMembership.user.image,
        role: newMembership.role,
        createdAt: newMembership.createdAt,
      },
    },
    { status: 201 }
  );
}

/** DELETE /api/workspaces/[id]/members — remove a member by memberId */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get("memberId");

  if (!memberId) {
    return NextResponse.json({ error: "memberId is required" }, { status: 400 });
  }

  const caller = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!caller) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const callerMembership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: id,
      userId: caller.id,
      role: { in: ["owner", "admin"] },
    },
  });
  const workspace = await prisma.workspace.findUnique({ where: { id } });
  if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

  if (!callerMembership && workspace.ownerId !== caller.id) {
    return NextResponse.json({ error: "Forbidden: only owners or admins can remove members" }, { status: 403 });
  }

  const targetMembership = await prisma.workspaceMember.findUnique({ where: { id: memberId } });
  if (!targetMembership || targetMembership.workspaceId !== id) {
    return NextResponse.json({ error: "Member not found in this workspace" }, { status: 404 });
  }

  // Prevent removing workspace owner
  if (targetMembership.role === "owner") {
    return NextResponse.json({ error: "Cannot remove workspace owner" }, { status: 400 });
  }

  await prisma.workspaceMember.delete({ where: { id: memberId } });

  return NextResponse.json({ success: true });
}
