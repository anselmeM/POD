import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name: String(name).trim(), email: normalizedEmail, password: hashed },
    });

    // Auto-create a personal workspace for the new user
    const workspace = await prisma.workspace.create({
      data: {
        id: `ws-${user.id.slice(0, 8)}`,
        name: `${user.name || "Personal"}'s Workspace`,
        plan: "trial",
        ownerId: user.id,
      },
    });

    await prisma.workspaceMember.create({
      data: { workspaceId: workspace.id, userId: user.id, role: "owner" },
    });

    return NextResponse.json({ data: { id: user.id, email: user.email } }, { status: 201 });
  } catch (e) {
    console.error("Failed to register user:", e);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
