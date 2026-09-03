import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedWorkspace } from "@/lib/workspace";

/** GET /api/ai/conversations — list user's AI conversations */
export async function GET(request: NextRequest) {
  const ctx = await getAuthenticatedWorkspace(request);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const conversations = await prisma.aIConversation.findMany({
      where: { userId: ctx.user.id },
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
  const ctx = await getAuthenticatedWorkspace(request);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { conversationId, title, message } = body;

    if (!message || !message.content) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    let conversation;

    if (conversationId) {
      conversation = await prisma.aIConversation.findFirst({
        where: { id: conversationId, userId: ctx.user.id },
      });
    }

    if (!conversation) {
      // Find default project in caller's workspace
      const proj = await prisma.project.findFirst({
        where: { workspaceId: ctx.workspace.id },
        orderBy: { updatedAt: "desc" },
      });

      conversation = await prisma.aIConversation.create({
        data: {
          userId: ctx.user.id,
          title: title || message.content.slice(0, 40) + "...",
          projectId: proj?.id || null,
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
