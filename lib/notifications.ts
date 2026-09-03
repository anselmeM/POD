import { prisma } from "@/lib/prisma";

export interface CreateNotificationParams {
  userId?: string | null;
  workspaceId?: string | null;
  type?: "experiment" | "lead" | "landing_page" | "signal" | "insight" | "system";
  title: string;
  message: string;
}

/**
 * Creates an in-app notification for a user or workspace.
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    return await prisma.notification.create({
      data: {
        userId: params.userId || null,
        workspaceId: params.workspaceId || null,
        type: params.type || "system",
        title: params.title,
        message: params.message || "",
        read: false,
      },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}
