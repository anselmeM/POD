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

export function normalizePlanKey(plan: string): string {
  const normalized = (plan || "trial").toLowerCase().trim();
  if (normalized === "free" || normalized === "starter_free") return "trial";
  if (normalized === "starter" || normalized === "growth") return "self-serve";
  if (normalized === "enterprise") return "studio";
  return normalized;
}

export function getPlanLimits(plan: string): PlanLimits {
  const key = normalizePlanKey(plan);
  return PLAN_LIMITS[key] || PLAN_LIMITS.trial;
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

export interface ResourceQuotaUsage {
  current: number;
  limit: number;
  percent: number;
  allowed: boolean;
}

export interface WorkspaceUsage {
  plan: string;
  planName: string;
  quotas: {
    activeExperiments: ResourceQuotaUsage;
    landingPages: ResourceQuotaUsage;
    teamMembers: ResourceQuotaUsage;
    canUseAIAnalyst: boolean;
  };
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
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

/**
 * Retrieves a complete usage summary for all quota-tracked resources in a workspace.
 */
export async function getWorkspaceUsage(workspaceId: string): Promise<WorkspaceUsage> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  const plan = workspace?.plan || "trial";
  const limits = getPlanLimits(plan);

  const [expCount, lpCount, memberCount] = await Promise.all([
    typeof prisma.experiment.count === "function"
      ? prisma.experiment.count({
          where: {
            project: { workspaceId },
            status: { in: ["active", "testing"] },
          },
        })
      : prisma.experiment.findMany({
          where: {
            project: { workspaceId },
            status: { in: ["active", "testing"] },
          },
        }).then((res) => res.length),
    typeof prisma.landingPage.count === "function"
      ? prisma.landingPage.count({
          where: {
            project: { workspaceId },
          },
        })
      : prisma.landingPage.findMany({
          where: {
            project: { workspaceId },
          },
        }).then((res) => res.length),
    typeof prisma.workspaceMember.count === "function"
      ? prisma.workspaceMember.count({
          where: { workspaceId },
        })
      : prisma.workspaceMember.findMany({
          where: { workspaceId },
        }).then((res) => res.length),
  ]);

  const activeExpQuota: ResourceQuotaUsage = {
    current: expCount,
    limit: limits.maxActiveExperiments,
    percent: Math.min(100, Math.round((expCount / limits.maxActiveExperiments) * 100)),
    allowed: expCount < limits.maxActiveExperiments,
  };

  const landingPageQuota: ResourceQuotaUsage = {
    current: lpCount,
    limit: limits.maxLandingPages,
    percent: Math.min(100, Math.round((lpCount / limits.maxLandingPages) * 100)),
    allowed: lpCount < limits.maxLandingPages,
  };

  const memberQuota: ResourceQuotaUsage = {
    current: memberCount,
    limit: limits.maxTeamMembers,
    percent: Math.min(100, Math.round((memberCount / limits.maxTeamMembers) * 100)),
    allowed: memberCount < limits.maxTeamMembers,
  };

  return {
    plan,
    planName: limits.name,
    quotas: {
      activeExperiments: activeExpQuota,
      landingPages: landingPageQuota,
      teamMembers: memberQuota,
      canUseAIAnalyst: limits.canUseAIAnalyst,
    },
    stripeCustomerId: workspace?.stripeCustomerId || null,
    stripeSubscriptionId: workspace?.stripeSubscriptionId || null,
  };
}

