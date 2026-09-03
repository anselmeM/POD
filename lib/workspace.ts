import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface AuthenticatedWorkspaceContext {
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
  };
  workspace: {
    id: string;
    name: string;
    plan: string;
    ownerId: string | null;
    stripeCustomerId?: string | null;
    stripeSubscriptionId?: string | null;
  };
  role: string;
}

/**
 * Resolves the authenticated user and their active workspace.
 * Returns null if the user is unauthenticated or not found in the database.
 */
export async function getAuthenticatedWorkspace(
  request?: NextRequest
): Promise<AuthenticatedWorkspaceContext | null> {
  const session = await auth();
  if (!session?.user?.email) {
    return null;
  }

  const email = session.user.email.toLowerCase().trim();
  const dbUser = await prisma.user.findUnique({
    where: { email },
    include: {
      memberships: {
        include: { workspace: true },
      },
    },
  });

  if (!dbUser) {
    return null;
  }

  // Defensive array extraction for memberships
  const memberships = Array.isArray((dbUser as any).memberships)
    ? (dbUser as any).memberships
    : [];
  let membership = memberships[0];

  // Defensive retrieval of requested workspaceId from headers or query param
  let requestedWorkspaceId: string | null = null;
  if (request?.headers?.get) {
    requestedWorkspaceId = request.headers.get("x-workspace-id");
  }
  if (!requestedWorkspaceId && request) {
    if (request.nextUrl?.searchParams?.get) {
      requestedWorkspaceId = request.nextUrl.searchParams.get("workspaceId");
    } else if (typeof request.url === "string") {
      try {
        requestedWorkspaceId = new URL(request.url).searchParams.get("workspaceId");
      } catch {}
    }
  }

  if (requestedWorkspaceId) {
    const match = memberships.find(
      (m: any) => m.workspaceId === requestedWorkspaceId
    );
    if (match) {
      membership = match;
    }
  }

  // Edge case: User exists but has no workspace memberships yet -> auto-create default workspace
  if (!membership) {
    const defaultName = dbUser.name ? `${dbUser.name}'s Workspace` : "My Workspace";
    const workspace = await prisma.workspace.create({
      data: {
        name: defaultName,
        plan: "trial",
        ownerId: dbUser.id,
      },
    });

    const newMember = await prisma.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: dbUser.id,
        role: "owner",
      },
      include: { workspace: true },
    });

    membership = newMember;
  }

  return {
    user: {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      image: dbUser.image,
    },
    workspace: membership.workspace || {
      id: membership.workspaceId || "default-ws",
      name: "Default Workspace",
      plan: "trial",
      ownerId: dbUser.id,
    },
    role: membership.role || "owner",
  };
}
