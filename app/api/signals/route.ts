import { prisma } from "@/lib/prisma";
import { serializeSignalEvent } from "@/lib/serialize";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const experimentId = searchParams.get("experimentId");

    const where: Record<string, string> = {};
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
    return NextResponse.json({ error: "Failed to fetch signal events" }, { status: 500 });
  }
}
