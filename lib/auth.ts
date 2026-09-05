/**
 * ============================================================================
 * AUTHENTICATION BRIDGE & USER SESSION PROVIDER
 * ============================================================================
 *
 * This module bridges Clerk Auth (`@clerk/nextjs/server`) with the Proof of
 * Demand (PoD) local database schema.
 *
 * Core Responsibilities:
 * ----------------------
 * 1. Session Resolution:
 *    Extracts authenticated user tokens from incoming requests via Clerk server helpers.
 *
 * 2. Just-in-Time (JIT) User & Workspace Provisioning:
 *    When a user signs in for the first time via OAuth (e.g. Google, GitHub, Email OTP),
 *    Clerk creates the identity record in Clerk's cloud. This module lazily detects if
 *    a matching `User` record exists in Prisma. If not found, it automatically creates:
 *    - A PoD `User` record with their primary email, name, and profile image.
 *    - A default `Workspace` (`"[Name]'s Workspace"` on the "trial" tier).
 *    - A `WorkspaceMember` record with role `"owner"`.
 *
 * 3. Contract Compatibility:
 *    Returns an `AppSession` object mimicking standard NextAuth/Auth.js conventions
 *    (`session.user.id`, `session.user.email`), ensuring backward compatibility across
 *    all API routes without requiring Clerk-specific logic in route handlers.
 *
 * 4. Resilient Fallbacks:
 *    If the database is temporarily unreachable during user lookup, it falls back to
 *    the Clerk session token payload so users are not locked out.
 */

import { auth as clerkAuth, currentUser as clerkCurrentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * Standard authenticated session interface consumed throughout PoD API routes.
 */
export interface AppSession {
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
  };
}

/**
 * Resolves the authenticated user session for the current request.
 *
 * Execution Flow:
 * 1. Queries Clerk server context for `userId`.
 * 2. Fetches `currentUser()` to obtain verified email addresses and profile metadata.
 * 3. Queries local/Turso Prisma database for existing user record.
 * 4. Auto-provisions user + workspace if this is their first visit.
 * 5. Returns formatted `AppSession` or `null` if unauthenticated.
 *
 * @returns {Promise<AppSession | null>} The active user session, or null if unauthenticated.
 *
 * @example
 * ```ts
 * const session = await auth();
 * if (!session?.user?.email) {
 *   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 * }
 * ```
 */
export async function auth(): Promise<AppSession | null> {
  try {
    // 1. Verify token signature via Clerk
    const { userId } = await clerkAuth();
    if (!userId) return null;

    // 2. Fetch user details from Clerk identity service
    const user = await clerkCurrentUser();
    if (!user) return null;

    const email = user.emailAddresses?.[0]?.emailAddress?.toLowerCase().trim();
    if (!email) return null;

    try {
      // 3. Query PoD database for user & workspace memberships
      let dbUser = await prisma.user.findUnique({
        where: { email },
        include: {
          memberships: {
            include: { workspace: true },
          },
        },
      });

      // 4. Just-In-Time (JIT) Provisioning for new sign-ups
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

        // Auto-provision initial workspace for the founder
        const workspace = await prisma.workspace.create({
          data: {
            name: `${name}'s Workspace`,
            plan: "trial",
            ownerId: dbUser.id,
          },
        });

        // Grant the founding user the "owner" role in their workspace
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
      // Resilient fallback: return Clerk claims if database query encounters transient error
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

/**
 * Convenience helper returning the current authenticated user object or null.
 *
 * @returns {Promise<AppSession["user"] | null>}
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user || null;
}
