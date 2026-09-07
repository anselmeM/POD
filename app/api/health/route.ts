import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Public liveness probe (used by Railway/Vercel healthchecks). Deliberately
// minimal: config presence, DB latency, and raw error strings must not be
// enumerable without authentication.
export async function GET() {
  let dbStatus: "connected" | "error" = "connected";

  try {
    await prisma.$queryRawUnsafe("SELECT 1");
  } catch {
    dbStatus = "error";
  }

  const isHealthy = dbStatus === "connected";

  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
