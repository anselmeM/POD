/**
 * ============================================================================
 * SCHEDULED SPRINT DIGEST CRON JOB (SLACK & EMAIL DISPATCHER)
 * ============================================================================
 * 
 * Architectural Role:
 * -------------------
 * This route is invoked by Vercel Cron (or external job schedulers) on a weekly basis
 * (e.g., every Monday at 09:00 UTC) to generate and broadcast 7-day validation performance
 * digests across all active workspaces.
 * 
 * Execution Lifecycle:
 * --------------------
 * 1. Cryptographic Authentication:
 *    - Validates `Authorization: Bearer <CRON_SECRET>` against the environment secret.
 *    - Rejects unauthorized invocations with HTTP 401.
 * 2. Tenant Enumeration:
 *    - Iterates over all workspaces in the multi-tenant database.
 * 3. Configuration & Guard Checks:
 *    - Checks if Slack webhooks or email recipient lists are enabled for each workspace.
 *    - Skips inactive workspaces to avoid unnecessary compute and external API calls.
 * 4. Aggregate Metric Synthesis:
 *    - Invokes `generateSprintDigest` to compute 7-day week-over-week trends,
 *      top-converting variants, and Stage-Gate verdicts.
 * 5. Multi-Channel Dispatch:
 *    - Dispatches rich Slack Block Kit payloads to founder channels and responsive
 *      HTML email reports via Resend.
 * 
 * Endpoint Support:
 * - GET: Used by standard Vercel Cron jobs.
 * - POST: Used by manual admin triggers or external CI/CD webhooks.
 * 
 * @module app/api/cron/sprint-digest/route
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generateSprintDigest,
  getDigestConfig,
  dispatchSprintDigest,
} from "@/lib/digest";

/**
 * Shared execution handler for cron triggers.
 * 
 * @param request - Inbound NextRequest from cron scheduler or administrative trigger.
 */
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
