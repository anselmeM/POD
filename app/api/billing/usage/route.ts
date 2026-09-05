import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedWorkspace } from "@/lib/workspace";
import { getWorkspaceUsage } from "@/lib/plan-limits";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ctx = await getAuthenticatedWorkspace(req);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const usage = await getWorkspaceUsage(ctx.workspace.id);
    return NextResponse.json({
      success: true,
      workspace: {
        id: ctx.workspace.id,
        name: ctx.workspace.name,
      },
      usage,
    });
  } catch (error: any) {
    console.error("Failed to fetch workspace usage:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve billing usage" },
      { status: 500 }
    );
  }
}
