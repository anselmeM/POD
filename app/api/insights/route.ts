import { prisma } from "@/lib/prisma";
import { serializeInsight } from "@/lib/serialize";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const experimentId = searchParams.get("experimentId");
    const type = searchParams.get("type");

    const where: Record<string, string> = {};
    if (experimentId) where.experimentId = experimentId;
    if (type) where.type = type;

    const insights = await prisma.aIInsight.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: insights.map(serializeInsight), total: insights.length });
  } catch (error) {
    console.error("Error fetching insights:", error);
    return NextResponse.json({ data: [], total: 0 });
  }
}
