import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  let dbStatus: "connected" | "error" = "connected";
  let dbLatencyMs = 0;
  let dbError: string | undefined = undefined;

  try {
    const dbStart = Date.now();
    await prisma.$queryRawUnsafe("SELECT 1");
    dbLatencyMs = Date.now() - dbStart;
  } catch (err: any) {
    dbStatus = "error";
    dbError = err.message || "Database ping failed";
  }

  const isHealthy = dbStatus === "connected";
  const status = isHealthy ? "healthy" : "degraded";

  const checks = {
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
      ...(dbError ? { error: dbError } : {}),
    },
    auth: {
      status: process.env.CLERK_SECRET_KEY || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? "configured" : "unconfigured",
    },
    stripe: {
      status: process.env.STRIPE_SECRET_KEY ? "configured" : "unconfigured",
    },
    ai: {
      status: process.env.OPENAI_API_KEY ? "configured" : "rule_engine_fallback",
    },
  };

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      totalDurationMs: Date.now() - startTime,
      checks,
      version: "1.0.0",
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
