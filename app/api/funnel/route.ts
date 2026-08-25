import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/** GET /api/funnel — compute funnel stages from signal events */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const experimentId = searchParams.get("experimentId");

    const where: Record<string, string> = {};
    if (experimentId) where.experimentId = experimentId;

    // Count events by type to build funnel
    const events = await prisma.signalEvent.groupBy({
      by: ["eventType"],
      where,
      _count: { id: true },
    });

    // Define funnel stage order
    const stageOrder = [
      { label: "Ad Impression", eventTypes: ["page_view"] },
      { label: "Landing Page", eventTypes: ["page_view"] },
      { label: "Scroll", eventTypes: ["scroll"] },
      { label: "CTA Click", eventTypes: ["cta_click"] },
      { label: "Pricing View", eventTypes: ["pricing_view"] },
      { label: "Checkout", eventTypes: ["checkout_initiate", "form_submit"] },
    ];

    // Get total count for percentage calculation
    const totalEvents = events.reduce((sum, e) => sum + e._count.id, 0);
    const maxCount = Math.max(totalEvents, 1);

    // Build funnel stages
    const funnel = stageOrder.map((stage) => {
      const count = events
        .filter((e) => stage.eventTypes.includes(e.eventType))
        .reduce((sum, e) => sum + e._count.id, 0);
      const percentage = Math.round((count / maxCount) * 100 * 10) / 10;
      const signalStrength =
        percentage >= 80 ? "very_strong" :
        percentage >= 60 ? "strong" :
        percentage >= 40 ? "moderate" :
        percentage >= 20 ? "weak" : "none";
      return { label: stage.label, count, percentage, signalStrength };
    });

    return NextResponse.json({ data: funnel });
  } catch (error) {
    console.error("Error computing funnel:", error);
    return NextResponse.json({ error: "Failed to compute funnel" }, { status: 500 });
  }
}
