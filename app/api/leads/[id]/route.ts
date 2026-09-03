import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeLead } from "@/lib/serialize";
import { getAuthenticatedWorkspace } from "@/lib/workspace";

/** GET /api/leads/[id] — get a single lead (requires auth & workspace check) */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getAuthenticatedWorkspace(request);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  try {
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        experiment: {
          include: { project: true },
        },
      },
    });

    if (!lead || lead.experiment.project.workspaceId !== ctx.workspace.id) {
      return NextResponse.json({ error: "Lead not found in your workspace" }, { status: 404 });
    }

    return NextResponse.json({ data: serializeLead(lead) });
  } catch (e) {
    console.error("Failed to fetch lead:", e);
    return NextResponse.json({ error: "Failed to fetch lead" }, { status: 500 });
  }
}

/** PATCH /api/leads/[id] — update a lead (requires auth & workspace check) */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getAuthenticatedWorkspace(request);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json();

  try {
    const existing = await prisma.lead.findUnique({
      where: { id },
      include: {
        experiment: {
          include: { project: true },
        },
      },
    });

    if (!existing || existing.experiment.project.workspaceId !== ctx.workspace.id) {
      return NextResponse.json({ error: "Lead not found in your workspace" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.email !== undefined) data.email = body.email;
    if (body.company !== undefined) data.company = body.company;
    if (body.role !== undefined) data.role = body.role;
    if (body.source !== undefined) data.source = body.source;
    if (body.intentScore !== undefined) data.intentScore = body.intentScore;
    if (body.pricingInteraction !== undefined) data.pricingInteraction = body.pricingInteraction;
    if (body.status !== undefined) data.status = body.status;
    if (body.events !== undefined) data.events = JSON.stringify(body.events);
    if (body.variantId !== undefined) data.variantId = body.variantId;

    const lead = await prisma.lead.update({ where: { id }, data });
    return NextResponse.json({ data: serializeLead(lead) });
  } catch (e) {
    console.error("Failed to update lead:", e);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

/** DELETE /api/leads/[id] — delete a lead (requires auth & workspace check) */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getAuthenticatedWorkspace(request);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  try {
    const existing = await prisma.lead.findUnique({
      where: { id },
      include: {
        experiment: {
          include: { project: true },
        },
      },
    });

    if (!existing || existing.experiment.project.workspaceId !== ctx.workspace.id) {
      return NextResponse.json({ error: "Lead not found in your workspace" }, { status: 404 });
    }

    await prisma.lead.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Failed to delete lead:", e);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
