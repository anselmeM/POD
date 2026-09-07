import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedWorkspace } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";

export async function GET(req?: NextRequest) {
  const ctx = await getAuthenticatedWorkspace(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await prisma.webhook.findMany({
    where: { workspaceId: ctx.workspace.id },
    orderBy: { createdAt: "desc" },
  });
  const serialized = data.map((w) => ({ ...w, events: JSON.parse(w.events || "[]") }));
  return NextResponse.json({ data: serialized });
}

export async function POST(req: NextRequest) {
  const ctx = await getAuthenticatedWorkspace(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  if (!body.url) return NextResponse.json({ error: "URL required" }, { status: 400 });
  try {
    new URL(String(body.url));
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const webhook = await prisma.webhook.create({
    data: {
      workspaceId: ctx.workspace.id,
      url: String(body.url),
      events: JSON.stringify(body.events || ["experiment.created"]),
      secret: `whsec_${Math.random().toString(36).slice(2, 10)}`,
      active: true,
    },
  });
  return NextResponse.json({ data: { ...webhook, events: JSON.parse(webhook.events) } }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const ctx = await getAuthenticatedWorkspace(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const owned = await prisma.webhook.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
    select: { id: true },
  });
  if (!owned) {
    return NextResponse.json({ error: "Webhook not found in your workspace" }, { status: 404 });
  }

  await prisma.webhook.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
