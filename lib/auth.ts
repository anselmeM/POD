import { auth as clerkAuth, currentUser as clerkCurrentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export interface AppSession {
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
  };
}

/**
 * Bridges Clerk authentication with the PoD database.
 * Returns a session object compatible with existing API route contracts.
 * If the user is authenticated via Clerk but doesn't exist in Prisma yet,
 * it lazily auto-creates the User record and default Workspace.
 */
export async function auth(): Promise<AppSession | null> {
  try {
    const { userId } = await clerkAuth();
    if (!userId) return null;

    const user = await clerkCurrentUser();
    if (!user) return null;

    const email = user.emailAddresses?.[0]?.emailAddress?.toLowerCase().trim();
    if (!email) return null;

    try {
      // Look up user in Prisma database
      let dbUser = await prisma.user.findUnique({
        where: { email },
        include: {
          memberships: {
            include: { workspace: true },
          },
        },
      });

      // Auto-provision user & workspace if new (e.g. first Google Sign-In)
      if (!dbUser) {
        const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || email.split("@")[0];
        dbUser = await prisma.user.create({
          data: {
            email,
            name,
            image: user.imageUrl || null,
          },
          include: {
            memberships: {
              include: { workspace: true },
            },
          },
        });

        // Create a default workspace for this new user
        const workspaceSlug =
          email.split("@")[0].replace(/[^a-z0-9]/gi, "-").toLowerCase() +
          "-" +
          Math.random().toString(36).slice(2, 6);

        const workspace = await prisma.workspace.create({
          data: {
            name: `${name}'s Workspace`,
            slug: workspaceSlug,
            ownerId: dbUser.id,
          },
        });

        await prisma.workspaceMember.create({
          data: {
            userId: dbUser.id,
            workspaceId: workspace.id,
            role: "owner",
          },
        });
      }

      return {
        user: {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          image: dbUser.image,
        },
      };
    } catch (dbErr) {
      console.error("Database user lookup failed, falling back to Clerk session:", dbErr);
      return {
        user: {
          id: user.id,
          email,
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || email.split("@")[0],
          image: user.imageUrl || null,
        },
      };
    }
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await auth();
  return session?.user || null;
}
