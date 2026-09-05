import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generateSprintDigest,
  getDigestConfig,
  dispatchSprintDigest,
} from "@/lib/digest";

async function handleCron(request: NextRequest) {
  // 1. Verify Authorization Header (Vercel Cron or secret)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized cron request" }, { status: 401 });
  }

  const host = request.headers.get("host") || "pod-blue-nine.vercel.app";
  const proto = host.includes("localhost") ? "http" : "https";
  const dashboardUrl = `${proto}://${host}`;

  try {
    // 2. Query all workspaces
    const workspaces = await prisma.workspace.findMany({
      select: { id: true, name: true },
    });

    let dispatchedCount = 0;
    const errors: string[] = [];

    for (const ws of workspaces) {
      try {
        const config = await getDigestConfig(ws.id);
        // Only dispatch if configured for Slack or Email
        if ((config.sendSlack && config.slackWebhookUrl) || (config.sendEmail && config.emailRecipients.length > 0)) {
          const digest = await generateSprintDigest(ws.id, ws.name);
          const res = await dispatchSprintDigest(config, digest, dashboardUrl);
          if (res.slack || res.email) {
            dispatchedCount++;
          }
          if (res.errors.length > 0) {
            errors.push(`${ws.name} (${ws.id}): ${res.errors.join(", ")}`);
          }
        }
      } catch (wsErr: any) {
        errors.push(`Workspace ${ws.id} error: ${wsErr.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      processedWorkspaces: workspaces.length,
      dispatchedCount,
      errors,
      executedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Cron sprint-digest failed:", err);
    return NextResponse.json(
      { error: err.message || "Failed to execute cron sprint digest" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleCron(request);
}

export async function POST(request: NextRequest) {
  return handleCron(request);
}
