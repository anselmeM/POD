import { NextResponse } from "next/server";

/** GET /api/history — return validation history items */
export async function GET() {
  // TODO: Replace with real Prisma query when History model is added
  const historyItems = [
    { id: "hist-001", date: "Jan 2026", project: "AI Reporting Copilot", verdict: "Promising", score: 78, experiments: 3, status: "blue", description: "Strong signal from operations managers. Variant B (automation + time savings) outperformed by 38% on conversion rate.", topExperiment: "Time-Savings Positioning", keyInsight: "Operations managers at mid-size SaaS companies show the highest willingness to pay for automated reporting." },
    { id: "hist-002", date: "Dec 2025", project: "Workflow Automator", verdict: "Needs Iteration", score: 54, experiments: 2, status: "amber", description: "Moderate interest but pricing sensitivity detected. Need to test lower price points and alternative positioning.", topExperiment: "Pricing Sensitivity Test", keyInsight: "Users are interested in the concept but current pricing exceeds their perceived value threshold." },
    { id: "hist-003", date: "Nov 2025", project: "Dev Analytics", verdict: "Strong Demand", score: 89, experiments: 4, status: "green", description: "Exceptional demand from engineering leaders. High-intent signals across all variants with strong conversion rates.", topExperiment: "Developer Pain Points", keyInsight: "Engineering managers actively search for solutions to reduce time spent on manual status reporting." },
  ];

  return NextResponse.json({ data: historyItems, total: historyItems.length });
}
