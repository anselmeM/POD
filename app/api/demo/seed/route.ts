import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedWorkspace } from "@/lib/workspace";

export async function POST(request: NextRequest) {
  const ctx = await getAuthenticatedWorkspace(request);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceId = ctx.workspace.id;

  try {
    // 1. Create or retrieve Project
    let project = await prisma.project.findFirst({
      where: { workspaceId },
    });

    if (!project) {
      project = await prisma.project.create({
        data: {
          workspaceId,
          name: "B2B Workflow Copilot",
          description:
            "Automated operational reporting copilot for growth-stage teams.",
          status: "testing",
          podScore: 78,
          confidence: 84,
        },
      });
    } else {
      project = await prisma.project.update({
        where: { id: project.id },
        data: { podScore: 78, confidence: 84 },
      });
    }

    // 2. Create Experiments
    const experimentsData = [
      {
        id: `exp-${Date.now()}-1`,
        projectId: project.id,
        name: "Time-Savings Positioning",
        status: "running",
        budget: 100,
        channel: JSON.stringify(["linkedin", "meta"]),
        traffic: 1842,
        conversions: 159,
        conversionRate: 8.7,
        highIntentActions: 98,
        highIntentRate: 6.9,
        costPerAction: 3.31,
      },
      {
        id: `exp-${Date.now()}-2`,
        projectId: project.id,
        name: "Pricing Sensitivity Tier ($49 vs $79)",
        status: "running",
        budget: 150,
        channel: JSON.stringify(["meta", "google"]),
        traffic: 940,
        conversions: 72,
        conversionRate: 7.6,
        highIntentActions: 48,
        highIntentRate: 5.1,
        costPerAction: 3.9,
      },
      {
        id: `exp-${Date.now()}-3`,
        projectId: project.id,
        name: "Pain-Focused Headline Test",
        status: "completed",
        budget: 75,
        channel: JSON.stringify(["linkedin"]),
        traffic: 620,
        conversions: 42,
        conversionRate: 6.8,
        highIntentActions: 24,
        highIntentRate: 3.9,
        costPerAction: 4.2,
      },
    ];

    let defaultVariantId = "";
    for (const exp of experimentsData) {
      await prisma.experiment.create({ data: exp });

      const varAId = `var-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const varBId = `var-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      if (!defaultVariantId) defaultVariantId = varAId;

      // Create Variants
      await prisma.variant.createMany({
        data: [
          {
            id: varAId,
            experimentId: exp.id,
            name: "Variant A (Direct)",
            headline: "Stop Losing Hours to Manual Reporting",
            subheadline: "Generate executive operational summaries in seconds.",
            positioning: "Time savings",
            cta: "Get Early Access",
            trafficAllocation: 50,
            visitors: Math.round(exp.traffic * 0.5),
            conversions: Math.round(exp.conversions * 0.45),
            conversionRate: 6.2,
            highIntent: Math.round(exp.highIntentActions * 0.45),
            costPerAction: 3.8,
          },
          {
            id: varBId,
            experimentId: exp.id,
            name: "Variant B (ROI Benefit)",
            headline: "Reduce Weekly Ops Labor by 50%",
            subheadline: "Your AI copilot for recurring KPI briefs.",
            positioning: "Automation ROI",
            cta: "Start Free Trial",
            trafficAllocation: 50,
            visitors: Math.round(exp.traffic * 0.5),
            conversions: Math.round(exp.conversions * 0.55),
            conversionRate: 10.4,
            highIntent: Math.round(exp.highIntentActions * 0.55),
            costPerAction: 2.9,
          },
        ],
      });
    }

    // 3. Create Sample Leads
    const sampleLeads = [
      {
        id: `lead-${Date.now()}-1`,
        experimentId: experimentsData[0].id,
        variantId: defaultVariantId,
        name: "Sarah Chen",
        email: "sarah.chen@fintechflow.io",
        company: "FintechFlow",
        role: "VP Operations",
        source: "linkedin",
        intentScore: 94,
        pricingInteraction: true,
        status: "qualified",
      },
      {
        id: `lead-${Date.now()}-2`,
        experimentId: experimentsData[0].id,
        variantId: defaultVariantId,
        name: "Marcus Vance",
        email: "marcus@hypergrowth.co",
        company: "HyperGrowth Media",
        role: "Founder & CEO",
        source: "meta",
        intentScore: 88,
        pricingInteraction: true,
        status: "new",
      },
      {
        id: `lead-${Date.now()}-3`,
        experimentId: experimentsData[1].id,
        variantId: defaultVariantId,
        name: "Elena Rostova",
        email: "elena@novasystems.de",
        company: "Nova Systems",
        role: "Head of Product",
        source: "google",
        intentScore: 92,
        pricingInteraction: true,
        status: "converted",
      },
    ];

    for (const l of sampleLeads) {
      await prisma.lead.create({
        data: {
          ...l,
          events: JSON.stringify([
            { type: "page_view", timestamp: new Date().toISOString() },
            { type: "pricing_click", timestamp: new Date().toISOString() },
            { type: "lead_captured", timestamp: new Date().toISOString() },
          ]),
        },
      });
    }

    // 4. Create Notification
    await prisma.notification.create({
      data: {
        title: "🚀 Demo Dataset Loaded",
        message: "Loaded 3 sample validation experiments, 6 variants, and verified prospect leads.",
        type: "system",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Sample validation dataset seeded successfully",
      projectId: project.id,
    });
  } catch (error) {
    console.error("Failed to seed demo dataset:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to seed demo data" },
      { status: 500 }
    );
  }
}
