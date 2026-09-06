/**
 * ============================================================================
 * AD CONVERSION WEBHOOK TEST & DIAGNOSTIC ENDPOINT
 * ============================================================================
 *
 * Route: POST /api/webhooks/test
 *
 * Allows solo founders and developers to test outbound conversion payloads
 * to their webhook receptors (Zapier, Make, n8n, Meta CAPI receiver,
 * Google Ads webhook intake, LinkedIn webhook, etc.) with 1 click.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSampleAdPayload } from "@/lib/webhooks";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { url, isPreorder = true } = body;

    const samplePayload = createSampleAdPayload(isPreorder);

    if (!url) {
      // Just return sample payload for schema inspection
      return NextResponse.json({
        success: true,
        sample: true,
        payload: samplePayload,
      });
    }

    // Validate URL
    try {
      new URL(String(url));
    } catch {
      return NextResponse.json(
        { error: "Invalid webhook URL format" },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const pingResponse = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-PoD-Event": samplePayload.event,
          "User-Agent": "ProofOfDemand-AdWebhookEngine/1.0",
        },
        body: JSON.stringify(samplePayload),
        signal: controller.signal,
      });

      const responseTimeMs = Date.now() - startTime;
      const responseText = await pingResponse.text().catch(() => "");

      return NextResponse.json({
        success: pingResponse.ok,
        statusCode: pingResponse.status,
        statusText: pingResponse.statusText,
        responseTimeMs,
        responseSnippet: responseText.slice(0, 300),
        payload: samplePayload,
      });
    } catch (fetchErr: any) {
      const responseTimeMs = Date.now() - startTime;
      const isAbort = fetchErr.name === "AbortError";

      return NextResponse.json({
        success: false,
        statusCode: isAbort ? 504 : 502,
        error: isAbort ? "Request timed out after 6000ms" : (fetchErr.message || "Failed to reach endpoint"),
        responseTimeMs,
        payload: samplePayload,
      });
    } finally {
      clearTimeout(timeout);
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    samplePayload: createSampleAdPayload(true),
  });
}
