import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const dbUrl = (process.env.DATABASE_URL || "file:./dev.db").trim();
  const tursoToken = process.env.TURSO_AUTH_TOKEN?.trim();

  // If using Turso or remote LibSQL database
  if (dbUrl.startsWith("libsql://") || dbUrl.startsWith("https://") || tursoToken) {
    const adapter = new PrismaLibSql({
      url: dbUrl,
      authToken: tursoToken,
    });
    return new PrismaClient({ adapter });
  }

  // Local SQLite database (default)
  const adapter = new PrismaBetterSqlite3({ url: dbUrl });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

