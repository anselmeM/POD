import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeLead } from "@/lib/serialize";

/** GET /api/leads — list all leads */
export async function GET(request: NextRequest) {
  const experimentId = request.nextUrl.searchParams.get("experimentId");
  const status = request.nextUrl.searchParams.get("status");
  const where: Record<string, string> = {};
  if (experimentId) where.experimentId = experimentId;
  if (status) where.status = status;

  try {
    const data = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: data.map(serializeLead), total: data.length });
  } catch (e) {
    console.error("Failed to fetch leads:", e);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

/** POST /api/leads — create a new lead */
export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.experimentId) {
    return NextResponse.json({ error: "Experiment ID is required" }, { status: 400 });
  }
  if (!body.name) {
    return NextResponse.json({ error: "Lead name is required" }, { status: 400 });
  }
  if (!body.email) {
    return NextResponse.json({ error: "Lead email is required" }, { status: 400 });
  }

  try {
    const lead = await prisma.lead.create({
      data: {
        id: body.id || undefined,
        experimentId: body.experimentId,
        variantId: body.variantId || "",
        name: body.name,
        email: body.email,
        company: body.company || "",
        role: body.role || "",
        source: body.source || "",
        intentScore: body.intentScore || 0,
        pricingInteraction: body.pricingInteraction ?? false,
        status: body.status || "new",
        events: JSON.stringify(body.events || []),
      },
    });
    return NextResponse.json({ data: serializeLead(lead) }, { status: 201 });
  } catch (e) {
    console.error("Failed to create lead:", e);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}
