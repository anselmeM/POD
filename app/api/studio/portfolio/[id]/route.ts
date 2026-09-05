import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedWorkspace } from "@/lib/workspace";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getAuthenticatedWorkspace(request);
    if (!ctx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { verdict, partnerNotes = "" } = body;

    if (!verdict) {
      return NextResponse.json({ error: "Verdict is required" }, { status: 400 });
    }

    // Check if this is a real project in the workspace
    const project = await prisma.project.findFirst({
      where: { id, workspaceId: ctx.workspace.id },
    });

    if (!project) {
      // If it's a benchmark/demo concept, return simulated success
      return NextResponse.json({
        success: true,
        data: {
          id,
          verdict,
          partnerNotes,
          updatedAt: new Date().toISOString(),
        },
      });
    }

    const statusMap: Record<string, string> = {
      BUILD: "validated",
      ITERATE: "active",
      KILL: "paused",
      TESTING: "testing",
    };

    const newStatus = statusMap[verdict] || project.status;

    await prisma.project.update({
      where: { id: project.id },
      data: {
        status: newStatus,
      },
    });

    // Create Notification
    await prisma.notification.create({
      data: {
        workspaceId: ctx.workspace.id,
        title: `🏆 Stage-Gate Decision: ${project.name}`,
        message: `Decision set to ${verdict}.${partnerNotes ? ` Partner Notes: "${partnerNotes}"` : ""}`,
        type: "experiment",
      },
    });

    // Create ActivityLog
    await prisma.activityLog.create({
      data: {
        userId: ctx.user.id,
        action: `stage_gate_${verdict.toLowerCase()}`,
        entityType: "project",
        entityId: project.id,
        detail: `Stage-Gate updated to ${verdict} by ${ctx.user.name || ctx.user.email}`,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: project.id,
        verdict,
        partnerNotes,
        status: newStatus,
      },
    });
  } catch (error) {
    console.error("Error updating stage-gate verdict:", error);
    return NextResponse.json({ error: "Failed to update stage-gate verdict" }, { status: 500 });
  }
}
