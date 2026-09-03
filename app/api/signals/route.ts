import { prisma } from "@/lib/prisma";
import { serializeSignalEvent } from "@/lib/serialize";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedWorkspace } from "@/lib/workspace";

export async function GET(request: NextRequest) {
  const ctx = await getAuthenticatedWorkspace(request);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const experimentId = searchParams.get("experimentId");

    const where: Record<string, unknown> = {
      experiment: {
        project: {
          workspaceId: ctx.workspace.id,
        },
      },
    };
    if (experimentId) where.experimentId = experimentId;

    const signalEvents = await prisma.signalEvent.findMany({
      where,
      orderBy: { timestamp: "desc" },
    });

    return NextResponse.json({
      data: signalEvents.map(serializeSignalEvent),
      total: signalEvents.length,
    });
  } catch (error) {
    console.error("Error fetching signal events:", error);
    return NextResponse.json({ data: [], total: 0 });
  }
}
