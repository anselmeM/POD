import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeSignalEvent, serializeLead } from "@/lib/serialize";
import { getClientIp, checkRateLimit, createRateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimitResult = checkRateLimit(`track:${clientIp}`, {
    limit: 60,
    windowMs: 60000,
  });

  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult);
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { slug, eventType = "page_view", visitorId = "vis-" + Math.random().toString(36).slice(2, 9), metadata = {}, leadData } = body;

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const page = await prisma.landingPage.findUnique({
      where: { slug },
      include: { experiment: true },
    });

    if (!page) {
      return NextResponse.json({ error: "Landing page not found" }, { status: 404 });
    }

    let updatedVisitors = page.visitors;
    let updatedConversions = page.conversions;
    let createdLead = null;
    let createdEvent = null;

    // Handle Page View
    if (eventType === "page_view") {
      updatedVisitors = page.visitors + 1;
      const cvr = updatedVisitors > 0 ? Number(((updatedConversions / updatedVisitors) * 100).toFixed(1)) : 0;
      await prisma.landingPage.update({
        where: { id: page.id },
        data: { visitors: updatedVisitors, conversionRate: cvr },
      });

      if (page.experimentId) {
        const exp = page.experiment;
        if (exp) {
          const expTraffic = exp.traffic + 1;
          const expCvr = expTraffic > 0 ? Number(((exp.conversions / expTraffic) * 100).toFixed(1)) : 0;
          await prisma.experiment.update({
            where: { id: exp.id },
            data: { traffic: expTraffic, conversionRate: expCvr },
          });
        }

        createdEvent = await prisma.signalEvent.create({
          data: {
            id: "evt-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
            experimentId: page.experimentId,
            visitorId,
            eventType: "page_view",
            variantId: page.id,
            metadata: JSON.stringify({ slug, ...metadata }),
          },
        });
      }
    }

    // Handle CTA Click
    if (eventType === "cta_click") {
      updatedConversions = page.conversions + 1;
      const cvr = page.visitors > 0 ? Number(((updatedConversions / page.visitors) * 100).toFixed(1)) : 100;
      await prisma.landingPage.update({
        where: { id: page.id },
        data: { conversions: updatedConversions, conversionRate: cvr },
      });

      if (page.experimentId) {
        const exp = page.experiment;
        if (exp) {
          const expConversions = exp.conversions + 1;
          const expHighIntent = exp.highIntentActions + 1;
          const expCvr = exp.traffic > 0 ? Number(((expConversions / exp.traffic) * 100).toFixed(1)) : 0;
          const expHighRate = exp.traffic > 0 ? Number(((expHighIntent / exp.traffic) * 100).toFixed(1)) : 0;
          await prisma.experiment.update({
            where: { id: exp.id },
            data: {
              conversions: expConversions,
              highIntentActions: expHighIntent,
              conversionRate: expCvr,
              highIntentRate: expHighRate,
            },
          });
        }

        createdEvent = await prisma.signalEvent.create({
          data: {
            id: "evt-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
            experimentId: page.experimentId,
            visitorId,
            eventType: "cta_click",
            variantId: page.id,
            metadata: JSON.stringify({ slug, ...metadata }),
          },
        });
      }
    }

    // Handle Pricing Interaction
    if (eventType.startsWith("pricing_")) {
      if (page.experimentId) {
        const exp = page.experiment;
        if (exp) {
          await prisma.experiment.update({
            where: { id: exp.id },
            data: { highIntentActions: exp.highIntentActions + 1 },
          });
        }

        createdEvent = await prisma.signalEvent.create({
          data: {
            id: "evt-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
            experimentId: page.experimentId,
            visitorId,
            eventType: "pricing_view",
            variantId: page.id,
            metadata: JSON.stringify({ slug, ...metadata }),
          },
        });
      }
    }

    // Handle Scroll Depth Tracking
    if (eventType.startsWith("scroll_")) {
      if (page.experimentId) {
        createdEvent = await prisma.signalEvent.create({
          data: {
            id: "evt-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
            experimentId: page.experimentId,
            visitorId,
            eventType: "scroll",
            variantId: page.id,
            metadata: JSON.stringify({ slug, ...metadata }),
          },
        });
      }
    }

    // Handle Lead Submission / Fake-Door Capture
    if (leadData && leadData.email) {
      updatedConversions = page.conversions + 1;
      const cvr = page.visitors > 0 ? Number(((updatedConversions / page.visitors) * 100).toFixed(1)) : 100;
      await prisma.landingPage.update({
        where: { id: page.id },
        data: { conversions: updatedConversions, conversionRate: cvr },
      });

      const expId = page.experimentId || (await prisma.experiment.findFirst())?.id || "EXP-2048";
      
      const leadId = "lead-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6);
      createdLead = await prisma.lead.create({
        data: {
          id: leadId,
          experimentId: expId,
          variantId: page.id,
          name: leadData.name || "Anonymous Lead",
          email: leadData.email,
          company: leadData.company || "",
          role: leadData.role || "",
          source: "/p/" + slug,
          intentScore: 90,
          pricingInteraction: Boolean(leadData.pricingInteraction ?? true),
          status: "new",
          events: JSON.stringify([
            { type: "page_view", timestamp: new Date().toISOString() },
            { type: "cta_click", timestamp: new Date().toISOString() },
            { type: "lead_captured", timestamp: new Date().toISOString(), metadata },
          ]),
        },
      });

      // Send live notification to dashboard
      await prisma.notification.create({
        data: {
          title: "🔥 New Validated Lead Captured",
          message: `${leadData.name || leadData.email} validated demand on "${page.name}" (${page.headline})`,
          type: "lead",
        },
      });

      if (page.experimentId) {
        const exp = page.experiment;
        if (exp) {
          await prisma.experiment.update({
            where: { id: exp.id },
            data: {
              conversions: exp.conversions + 1,
              highIntentActions: exp.highIntentActions + 2,
            },
          });
        }

        createdEvent = await prisma.signalEvent.create({
          data: {
            id: "evt-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
            experimentId: expId,
            visitorId,
            eventType: "checkout_initiate",
            variantId: page.id,
            metadata: JSON.stringify({ email: leadData.email, name: leadData.name, slug }),
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        visitors: updatedVisitors,
        conversions: updatedConversions,
        lead: createdLead ? serializeLead(createdLead) : null,
        event: createdEvent ? serializeSignalEvent(createdEvent) : null,
      },
    }, { status: 200 });

  } catch (error) {
    console.error("Error in tracking beacon:", error);
    return NextResponse.json({ error: "Failed to record event" }, { status: 500 });
  }
}
