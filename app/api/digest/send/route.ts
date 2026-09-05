import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedWorkspace } from "@/lib/workspace";
import {
  generateSprintDigest,
  getDigestConfig,
  dispatchSprintDigest,
  generateDigestEmailHtml,
} from "@/lib/digest";

export async function POST(request: NextRequest) {
  const ctx = await getAuthenticatedWorkspace(request);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const channel: "slack" | "email" | "all" = body.channel || "all";
    const customWebhookUrl: string | undefined = body.customWebhookUrl;
    const customEmail: string | undefined = body.customEmail;

    // Load or build delivery config
    const currentConfig = await getDigestConfig(ctx.workspace.id);

    const activeSlackUrl =
      customWebhookUrl && customWebhookUrl.trim()
        ? customWebhookUrl.trim()
        : currentConfig.slackWebhookUrl;

    const activeEmails =
      customEmail && customEmail.trim()
        ? [customEmail.trim()]
        : currentConfig.emailRecipients.length > 0
        ? currentConfig.emailRecipients
        : ctx.user.email
        ? [ctx.user.email]
        : [];

    const sendSlack = (channel === "slack" || channel === "all") && Boolean(activeSlackUrl);
    const sendEmail = (channel === "email" || channel === "all") && activeEmails.length > 0;

    if (!sendSlack && !sendEmail) {
      return NextResponse.json(
        {
          error:
            channel === "slack"
              ? "Slack webhook URL is required to send Slack digest."
              : channel === "email"
              ? "Recipient email is required to send email digest."
              : "Please provide a Slack Webhook URL or Email recipient.",
        },
        { status: 400 }
      );
    }

    const host = request.headers.get("host") || "pod-blue-nine.vercel.app";
    const proto = host.includes("localhost") ? "http" : "https";
    const dashboardUrl = `${proto}://${host}`;

    const digest = await generateSprintDigest(ctx.workspace.id, ctx.workspace.name);

    const result = await dispatchSprintDigest(
      {
        slackWebhookUrl: activeSlackUrl,
        emailRecipients: activeEmails,
        sendSlack,
        sendEmail,
        frequency: currentConfig.frequency,
        active: true,
      },
      digest,
      dashboardUrl
    );

    const previewHtml = generateDigestEmailHtml(digest, dashboardUrl);

    return NextResponse.json({
      success: true,
      deliveredTo: {
        slack: result.slack,
        email: result.email,
      },
      errors: result.errors,
      digest,
      previewHtml,
    });
  } catch (err: any) {
    console.error("Failed to dispatch digest:", err);
    return NextResponse.json(
      { error: err.message || "Failed to dispatch digest" },
      { status: 500 }
    );
  }
}
