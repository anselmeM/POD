import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** GET /api/ai/conversations — list user's AI conversations */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    let userId: string | null = null;

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({ where: { email: session.user.email } });
      userId = user?.id || null;
    }

    if (!userId) {
      // Fallback to first user in database if unauthed dev mode
      const firstUser = await prisma.user.findFirst();
      userId = firstUser?.id || null;
    }

    if (!userId) {
      return NextResponse.json({ data: [] });
    }

    const conversations = await prisma.aIConversation.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const formatted = conversations.map((c) => ({
      id: c.id,
      title: c.title,
      timestamp: c.updatedAt.toISOString(),
      messageCount: c.messages.length,
      lastMessage: c.messages[c.messages.length - 1]?.content || "",
      messages: c.messages.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      })),
    }));

    return NextResponse.json({ data: formatted });
  } catch (error) {
    console.error("Error fetching AI conversations:", error);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}

/** POST /api/ai/conversations — save a message or create conversation */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    let userId: string | null = null;

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({ where: { email: session.user.email } });
      userId = user?.id || null;
    }

    if (!userId) {
      const firstUser = await prisma.user.findFirst();
      userId = firstUser?.id || null;
    }

    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { conversationId, title, message } = body;

    if (!message || !message.content) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    let conversation;

    if (conversationId) {
      conversation = await prisma.aIConversation.findUnique({ where: { id: conversationId } });
    }

    if (!conversation) {
      // Find default project
      const firstProj = await prisma.project.findFirst();
      conversation = await prisma.aIConversation.create({
        data: {
          userId,
          title: title || message.content.slice(0, 40) + "...",
          projectId: firstProj?.id || null,
        },
      });
    }

    // Add message
    const savedMessage = await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: message.role === "ai" || message.role === "assistant" ? "assistant" : "user",
        content: message.content,
      },
    });

    // Touch conversation updatedAt
    await prisma.aIConversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(
      {
        conversationId: conversation.id,
        message: {
          id: savedMessage.id,
          role: savedMessage.role,
          content: savedMessage.content,
          createdAt: savedMessage.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving AI message:", error);
    return NextResponse.json({ error: "Failed to save AI message" }, { status: 500 });
  }
}
