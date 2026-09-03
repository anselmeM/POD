import { prisma } from "@/lib/prisma";

export interface PlanLimits {
  name: string;
  maxActiveExperiments: number;
  maxLandingPages: number;
  maxTeamMembers: number;
  canUseAIAnalyst: boolean;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  trial: {
    name: "Free Trial",
    maxActiveExperiments: 1,
    maxLandingPages: 2,
    maxTeamMembers: 2,
    canUseAIAnalyst: true,
  },
  "self-serve": {
    name: "Self-Serve",
    maxActiveExperiments: 5,
    maxLandingPages: 15,
    maxTeamMembers: 5,
    canUseAIAnalyst: true,
  },
  studio: {
    name: "Startup Studio",
    maxActiveExperiments: 50,
    maxLandingPages: 100,
    maxTeamMembers: 20,
    canUseAIAnalyst: true,
  },
  sprint: {
    name: "Validation Sprint",
    maxActiveExperiments: 10,
    maxLandingPages: 25,
    maxTeamMembers: 10,
    canUseAIAnalyst: true,
  },
};

export function getPlanLimits(plan: string): PlanLimits {
  const normalized = (plan || "trial").toLowerCase().trim();
  return PLAN_LIMITS[normalized] || PLAN_LIMITS.trial;
}

export type ResourceType = "activeExperiments" | "landingPages" | "teamMembers";

export interface QuotaCheckResult {
  allowed: boolean;
  current: number;
  limit: number;
  planName: string;
  resource: ResourceType;
  message?: string;
}

/**
 * Checks if a workspace is within its plan limits for a specific resource type.
 */
export async function checkWorkspaceLimit(
  workspaceId: string,
  resource: ResourceType
): Promise<QuotaCheckResult> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  const plan = workspace?.plan || "trial";
  const limits = getPlanLimits(plan);

  let current = 0;
  let limit = 0;

  switch (resource) {
    case "activeExperiments": {
      limit = limits.maxActiveExperiments;
      current = typeof prisma.experiment.count === "function"
        ? await prisma.experiment.count({
            where: {
              project: { workspaceId },
              status: { in: ["active", "testing"] },
            },
          })
        : (await prisma.experiment.findMany({
            where: {
              project: { workspaceId },
              status: { in: ["active", "testing"] },
            },
          })).length;
      break;
    }
    case "landingPages": {
      limit = limits.maxLandingPages;
      current = typeof prisma.landingPage.count === "function"
        ? await prisma.landingPage.count({
            where: {
              project: { workspaceId },
            },
          })
        : (await prisma.landingPage.findMany({
            where: {
              project: { workspaceId },
            },
          })).length;
      break;
    }
    case "teamMembers": {
      limit = limits.maxTeamMembers;
      current = typeof prisma.workspaceMember.count === "function"
        ? await prisma.workspaceMember.count({
            where: { workspaceId },
          })
        : (await prisma.workspaceMember.findMany({
            where: { workspaceId },
          })).length;
      break;
    }
  }

  const allowed = current < limit;
  const message = allowed
    ? undefined
    : `You have reached the maximum limit (${limit}) of ${resource} on the ${limits.name} plan. Please upgrade your plan to unlock higher limits.`;

  return {
    allowed,
    current,
    limit,
    planName: limits.name,
    resource,
    message,
  };
}
