import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedWorkspace } from "@/lib/workspace";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      slug,
      visitorId = "vis-" + Math.random().toString(36).slice(2, 9),
      problem = "",
      willingPrice = "",
      customNotes = "",
      email = "",
      name = "",
    } = body;

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const page = await prisma.landingPage.findUnique({
      where: { slug },
      include: {
        experiment: true,
        project: { select: { workspaceId: true } },
      },
    });

    if (!page) {
      return NextResponse.json({ error: "Landing page not found" }, { status: 404 });
    }

    // Fail closed: never attribute a public response to an unrelated experiment.
    if (!page.experimentId) {
      return NextResponse.json(
        { error: "This page is not linked to an experiment" },
        { status: 400 }
      );
    }
    const expId = page.experimentId;
    // projectId is NOT NULL on LandingPage, so the workspace is always known
    // in production (the fallback only covers mocked unit tests).
    const pageWorkspaceId: string | null = (page as any).project?.workspaceId ?? null;
    const eventId = "evt-survey-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6);

    const surveyData = {
      slug,
      problem,
      willingPrice,
      customNotes,
      email,
      name,
      pageHeadline: page.headline,
      pagePositioning: page.positioning,
    };

    // 1. Record SignalEvent
    const signalEvent = await prisma.signalEvent.create({
      data: {
        id: eventId,
        experimentId: expId,
        visitorId,
        eventType: "survey_response",
        variantId: page.id,
        metadata: JSON.stringify(surveyData),
      },
    });

    // 2. If an email is provided, update or create lead with survey insight
    if (email) {
      const existingLead = await prisma.lead.findFirst({
        where: { email, experimentId: expId },
      });

      if (existingLead) {
        let eventsArr: Array<Record<string, unknown>> = [];
        try {
          eventsArr = JSON.parse(existingLead.events || "[]");
        } catch {
          eventsArr = [];
        }
        eventsArr.push({
          type: "survey_response",
          timestamp: new Date().toISOString(),
          data: { problem, willingPrice, customNotes },
        });

        await prisma.lead.update({
          where: { id: existingLead.id },
          data: {
            pricingInteraction: true,
            intentScore: Math.min(100, existingLead.intentScore + 5),
            events: JSON.stringify(eventsArr),
          },
        });
      }
    }

    // 3. Send in-app notification scoped to the page owner's workspace so it
    // never leaks into other tenants' feeds.
    await prisma.notification.create({
      data: {
        ...(pageWorkspaceId ? { workspaceId: pageWorkspaceId } : {}),
        title: "📋 New Micro-Survey Insight Captured",
        message: `Prospect feedback on "${page.name}": "${problem || 'Friction response'}" (WTP: ${willingPrice || 'N/A'})`,
        type: "signal",
      },
    });

    // 4. Outbound Webhook dispatch scoped to the page owner's workspace so
    // respondent PII is never fanned out to other tenants' endpoints.
    try {
      const webhooks = await prisma.webhook.findMany({
        where: { active: true, ...(pageWorkspaceId ? { workspaceId: pageWorkspaceId } : {}) },
      });
      if (webhooks.length > 0) {
        const webhookPayload = {
          event: "survey.completed",
          timestamp: new Date().toISOString(),
          data: {
            id: eventId,
            experimentId: expId,
            landingPage: { id: page.id, slug: page.slug, name: page.name },
            ...surveyData,
          },
        };

        Promise.allSettled(
          webhooks.map((wh) =>
            fetch(wh.url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-PoD-Event": "survey.completed",
                ...(wh.secret ? { "X-PoD-Signature": wh.secret } : {}),
              },
              body: JSON.stringify(webhookPayload),
            }).catch(() => {})
          )
        ).catch(() => {});
      }
    } catch (whErr) {
      console.warn("Webhook dispatch error for survey:", whErr);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: signalEvent.id,
        surveyData,
      },
    });
  } catch (error) {
    console.error("Error submitting micro-survey:", error);
    return NextResponse.json({ error: "Failed to record survey response" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const ctx = await getAuthenticatedWorkspace(request);
    if (!ctx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const experimentId = searchParams.get("experimentId");

    const where: Record<string, unknown> = {
      eventType: "survey_response",
      experiment: {
        project: {
          workspaceId: ctx.workspace.id,
        },
      },
    };

    if (experimentId) {
      // Verify the requested experiment belongs to the caller — an
      // experimentId must narrow the scope, never widen it.
      const owned = await prisma.experiment.findFirst({
        where: { id: experimentId, project: { workspaceId: ctx.workspace.id } },
        select: { id: true },
      });
      if (!owned) {
        return NextResponse.json(
          { error: "Experiment not found in your workspace" },
          { status: 403 }
        );
      }
      where.experimentId = experimentId;
    }

    const events = await prisma.signalEvent.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: 200,
    });

    // Parse metadata
    const parsed = events.map((e) => {
      let meta: Record<string, unknown> = {};
      try {
        meta = typeof e.metadata === "string" ? JSON.parse(e.metadata) : (e.metadata as Record<string, unknown>) || {};
      } catch {
        meta = {};
      }
      return {
        id: e.id,
        timestamp: e.timestamp,
        experimentId: e.experimentId,
        variantId: e.variantId,
        problem: String(meta.problem || "Unspecified"),
        willingPrice: String(meta.willingPrice || "Unspecified"),
        customNotes: String(meta.customNotes || ""),
        email: String(meta.email || ""),
        name: String(meta.name || ""),
      };
    });

    // Aggregate Problem Distribution
    const problemCounts: Record<string, number> = {};
    const priceCounts: Record<string, number> = {
      "$19/mo": 0,
      "$49/mo": 0,
      "$99/mo": 0,
      "$199/mo": 0,
      Other: 0,
    };

    let numericPriceSum = 0;
    let numericPriceCount = 0;

    for (const item of parsed) {
      if (item.problem && item.problem !== "Unspecified") {
        problemCounts[item.problem] = (problemCounts[item.problem] || 0) + 1;
      }

      if (item.willingPrice && item.willingPrice !== "Unspecified") {
        const wp = item.willingPrice.toLowerCase();
        if (wp.includes("19") && !wp.includes("199")) priceCounts["$19/mo"]++;
        else if (wp.includes("49")) priceCounts["$49/mo"]++;
        else if (wp.includes("99") && !wp.includes("199")) priceCounts["$99/mo"]++;
        else if (wp.includes("199")) priceCounts["$199/mo"]++;
        else priceCounts["Other"]++;

        const match = item.willingPrice.match(/\d+/);
        if (match) {
          const val = parseInt(match[0], 10);
          if (val > 0 && val < 1000) {
            numericPriceSum += val;
            numericPriceCount++;
          }
        }
      }
    }

    const problemDistribution = Object.entries(problemCounts).map(([label, count]) => ({
      label,
      count,
      percentage: parsed.length > 0 ? Math.round((count / parsed.length) * 100) : 0,
    })).sort((a, b) => b.count - a.count);

    const priceElasticity = Object.entries(priceCounts).map(([tier, count]) => ({
      tier,
      count,
      percentage: parsed.length > 0 ? Math.round((count / parsed.length) * 100) : 0,
    }));

    const avgAcceptablePrice = numericPriceCount > 0 ? Math.round(numericPriceSum / numericPriceCount) : 49;

    return NextResponse.json({
      success: true,
      data: {
        totalResponses: parsed.length,
        avgAcceptablePrice,
        problemDistribution,
        priceElasticity,
        recentResponses: parsed.slice(0, 15),
      },
    });
  } catch (error) {
    console.error("Error fetching survey analytics:", error);
    return NextResponse.json({ error: "Failed to fetch survey analytics" }, { status: 500 });
  }
}
