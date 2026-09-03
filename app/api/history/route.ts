import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedWorkspace } from "@/lib/workspace";

function verdictFromScore(score: number): { verdict: string; status: "green" | "blue" | "amber" | "red" } {
  if (score >= 80) return { verdict: "Strong Demand", status: "green" };
  if (score >= 60) return { verdict: "Promising", status: "blue" };
  if (score >= 40) return { verdict: "Needs Iteration", status: "amber" };
  return { verdict: "Weak Signal", status: "red" };
}

/** GET /api/history — return validation history items scoped to caller's workspace */
export async function GET(request?: NextRequest) {
  const ctx = await getAuthenticatedWorkspace(request);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const projects = await prisma.project.findMany({
      where: { workspaceId: ctx.workspace.id },
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

      const description =
        totalTraffic > 0
          ? `Evaluated across ${totalTraffic.toLocaleString()} visitors with ${totalHighIntent} high-intent demand signals.${topExp ? ` Top performing test: "${topExp.name}".` : ""}`
          : `Validation sprint for ${proj.name}. No active experiment traffic recorded yet.`;

      return {
        id: `hist-${proj.id}`,
        date: monthYear,
        project: proj.name,
        verdict,
        score: proj.podScore,
        experiments: proj.experiments.length,
        status,
        description,
        topExperiment: topExp?.name || "Initial Test",
        keyInsight: topInsight?.content || "Gathering more visitor interactions to confirm hypothesis.",
      };
    });

    return NextResponse.json({ data: historyItems, total: historyItems.length });
  } catch (e) {
    console.error("Failed to fetch history:", e);
    return NextResponse.json({ error: "Failed to fetch validation history" }, { status: 500 });
  }
}
