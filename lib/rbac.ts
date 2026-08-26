import { prisma } from "@/lib/prisma";

export type WorkspaceRole = "owner" | "admin" | "member";

/** Get the user's role in a workspace (null if not a member) */
export async function getWorkspaceRole(userId: string, workspaceId: string): Promise<WorkspaceRole | null> {
  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  if (membership) return membership.role as WorkspaceRole;
  // Owner via workspace ownerId also counts
  const ws = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (ws?.ownerId === userId) return "owner";
  return null;
}

/** True if role is at least the required minimum (owner > admin > member) */
export function hasRole(userRole: WorkspaceRole | null, required: WorkspaceRole): boolean {
  if (!userRole) return false;
  const rank: Record<WorkspaceRole, number> = { member: 1, admin: 2, owner: 3 };
  return rank[userRole] >= rank[required];
}

/** Throw 403 if user lacks required role */
export async function requireWorkspaceRole(userId: string, workspaceId: string, required: WorkspaceRole) {
  const role = await getWorkspaceRole(userId, workspaceId);
  if (!hasRole(role, required)) {
    const error = new Error(`Requires ${required} role (has ${role ?? "none"})`);
    (error as Error & { status: number }).status = 403;
    throw error;
  }
  return role;
}
