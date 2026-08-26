import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const membership = await prisma.workspaceMember.findFirst({ where: { userId: user.id } });
  if (!membership) return NextResponse.json({ data: [] });
  const data = await prisma.webhook.findMany({ where: { workspaceId: membership.workspaceId }, orderBy: { createdAt: "desc" } });
  const serialized = data.map((w) => ({ ...w, events: JSON.parse(w.events || "[]") }));
  return NextResponse.json({ data: serialized });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (!body.url) return NextResponse.json({ error: "URL required" }, { status: 400 });
  try { new URL(String(body.url)); } catch { return NextResponse.json({ error: "Invalid URL" }, { status: 400 }); }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const membership = await prisma.workspaceMember.findFirst({ where: { userId: user.id } });
  if (!membership) return NextResponse.json({ error: "No workspace" }, { status: 400 });
  const webhook = await prisma.webhook.create({
    data: {
      workspaceId: membership.workspaceId,
      url: String(body.url),
      events: JSON.stringify(body.events || ["experiment.created"]),
      secret: `whsec_${Math.random().toString(36).slice(2, 10)}`,
      active: true,
    },
  });
  return NextResponse.json({ data: { ...webhook, events: JSON.parse(webhook.events) } }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.webhook.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
