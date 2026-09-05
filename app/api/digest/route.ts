import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedWorkspace } from "@/lib/workspace";
import { generateSprintDigest, getDigestConfig, saveDigestConfig } from "@/lib/digest";

export async function GET(request: NextRequest) {
  const ctx = await getAuthenticatedWorkspace(request);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [digest, config] = await Promise.all([
      generateSprintDigest(ctx.workspace.id, ctx.workspace.name),
      getDigestConfig(ctx.workspace.id),
    ]);

    // If no custom emails configured yet, default to current user's email
    if (config.emailRecipients.length === 0 && ctx.user.email) {
      config.emailRecipients = [ctx.user.email];
    }

    return NextResponse.json({
      success: true,
      digest,
      config,
    });
  } catch (err: any) {
    console.error("Failed to generate digest or get config:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load digest" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const ctx = await getAuthenticatedWorkspace(request);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const updatedConfig = await saveDigestConfig(ctx.workspace.id, {
      slackWebhookUrl: body.slackWebhookUrl,
      emailRecipients: body.emailRecipients,
      sendSlack: body.sendSlack,
      sendEmail: body.sendEmail,
      frequency: body.frequency,
      active: body.active,
    });

    return NextResponse.json({
      success: true,
      config: updatedConfig,
    });
  } catch (err: any) {
    console.error("Failed to update digest config:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update digest settings" },
      { status: 500 }
    );
  }
}
