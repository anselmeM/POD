/**
 * ============================================================================
 * DATABASE CLIENT & DRIVER ADAPTER CONFIGURATION
 * ============================================================================
 *
 * This module initializes and exports a singleton Prisma Client instance for
 * Proof of Demand (PoD).
 *
 * Architectural Design & Drivers:
 * --------------------------------
 * PoD operates in a dual-mode database architecture:
 *
 * 1. LOCAL DEVELOPMENT & TESTING:
 *    Uses local SQLite (`better-sqlite3`) via `@prisma/adapter-better-sqlite3`.
 *    Requires zero cloud setup or remote dependencies, storing tables in `./dev.db`.
 *
 * 2. PRODUCTION / STAGING:
 *    Uses Turso / LibSQL via `@prisma/adapter-libsql`. This provides distributed,
 *    edge-compatible SQLite storage that works with Vercel Serverless Functions
 *    without connection limits.
 *
 * Hot Module Replacement (HMR) Guard:
 * -----------------------------------
 * In development mode, Next.js clears the Node.js require cache on every file
 * change, which would create a new PrismaClient instance per reload and exhaust
 * connection pools. We cache the initialized client on `globalThis` to preserve
 * a single persistent connection across reloads.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaLibSql } from "@prisma/adapter-libsql";

// Extend globalThis type to cache the PrismaClient instance in development
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

/**
 * Factory function that selects the appropriate database driver adapter based
 * on environment variables and instantiates a new PrismaClient.
 *
 * @returns {PrismaClient} Configured Prisma Client instance
 */
function createPrismaClient(): PrismaClient {
  const dbUrl = (process.env.DATABASE_URL || "file:./dev.db").trim();
  const tursoToken = process.env.TURSO_AUTH_TOKEN?.trim();

  // Mode A: Remote Turso or Edge LibSQL Database
  // Triggered when DATABASE_URL begins with libsql:// or https://, or TURSO_AUTH_TOKEN is provided.
  if (dbUrl.startsWith("libsql://") || dbUrl.startsWith("https://") || tursoToken) {
    const adapter = new PrismaLibSql({
      url: dbUrl,
      authToken: tursoToken,
    });
    return new PrismaClient({ adapter });
  }

  // Mode B: Local SQLite Database (Default for local development & automated Vitest runs)
  const adapter = new PrismaBetterSqlite3({ url: dbUrl });
  return new PrismaClient({ adapter });
}

/**
 * Global singleton Prisma Client instance.
 * Import this everywhere you need to query the database.
 *
 * @example
 * ```ts
 * import { prisma } from "@/lib/prisma";
 * const user = await prisma.user.findUnique({ where: { email } });
 * ```
 */
export const prisma = globalForPrisma.prisma || createPrismaClient();

// In non-production environments, preserve client on globalThis across HMR cycles
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
