import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function verdictFromScore(score: number): { verdict: string; status: "green" | "blue" | "amber" | "red" } {
  if (score >= 80) return { verdict: "Strong Demand", status: "green" };
  if (score >= 60) return { verdict: "Promising", status: "blue" };
  if (score >= 40) return { verdict: "Needs Iteration", status: "amber" };
  return { verdict: "Weak Signal", status: "red" };
}

/** GET /api/history — return validation history items derived from Prisma database */
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        experiments: {
          include: {
            variants: true,
            insights: { take: 1, orderBy: { confidence: "desc" } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const historyItems = projects.map((proj) => {
      const { verdict, status } = verdictFromScore(proj.podScore);
      const topExp = proj.experiments.reduce(
        (best, curr) => (curr.conversionRate > (best?.conversionRate || 0) ? curr : best),
        proj.experiments[0]
      );
      const topInsight = proj.experiments.flatMap((e) => e.insights)[0];

      const monthYear = new Date(proj.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      const totalTraffic = proj.experiments.reduce((sum, e) => sum + e.traffic, 0);
      const totalHighIntent = proj.experiments.reduce((sum, e) => sum + e.highIntentActions, 0);

      const dynamicDescription = totalTraffic > 0
        ? `Evaluated across ${totalTraffic.toLocaleString()} visitors with ${totalHighIntent.toLocaleString()} high-intent demand signals. ${topExp ? `Top performing test: "${topExp.name}".` : ""}`
        : proj.description || `Validation project for ${proj.name}.`;

      return {
        id: `hist-${proj.id}`,
        date: monthYear,
        project: proj.name,
        verdict,
        score: proj.podScore,
        experiments: proj.experiments.length,
        status,
        description: dynamicDescription,
        topExperiment: topExp?.name || "Baseline Validation",
        keyInsight: topInsight?.content || `Confidence index at ${proj.confidence}%.`,
      };
    });

    return NextResponse.json({ data: historyItems, total: historyItems.length });
  } catch (error) {
    console.error("Error fetching validation history:", error);
    return NextResponse.json({ error: "Failed to fetch validation history" }, { status: 500 });
  }
}
