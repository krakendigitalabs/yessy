import type { AgentPlanTier } from "@/types/agents";

export type SystemPrivilegeRole = "superadmin" | "admin" | "commerce" | "ally" | "user";

const PLAN_RANK: Record<AgentPlanTier, number> = {
    tentaculo: 1,
    depredador: 2,
    kraken: 3,
    ecosistema: 4,
};

export function normalizeRole(role?: string | null): SystemPrivilegeRole {
    const clean = (role || "").trim().toLowerCase();
    if (clean === "superadmin") return "superadmin";
    if (clean === "admin") return "admin";
    if (clean === "commerce" || clean === "merchant") return "commerce";
    if (clean === "ally") return "ally";
    return "user";
}

export function isSuperAdmin(role?: string | null): boolean {
    const norm = normalizeRole(role);
    return norm === "superadmin" || norm === "admin";
}

export function isSubscribedCommerce(role?: string | null): boolean {
    const norm = normalizeRole(role);
    return norm === "commerce" || norm === "ally";
}

export function normalizePlan(plan?: string | null): AgentPlanTier {
    const clean = (plan || "").trim().toLowerCase();
    if (clean === "ecosistema") return "ecosistema";
    if (clean === "kraken") return "kraken";
    if (clean === "depredador") return "depredador";
    return "tentaculo";
}

export function canAccessAgentByPlan(params: {
    role?: string | null;
    userPlan?: string | null;
    agentMinPlan: AgentPlanTier;
}): boolean {
    if (isSuperAdmin(params.role)) return true;
    if (!isSubscribedCommerce(params.role)) return false;

    const currentRank = PLAN_RANK[normalizePlan(params.userPlan)];
    const requiredRank = PLAN_RANK[params.agentMinPlan];
    return currentRank >= requiredRank;
}

export function resolveHomeRouteByRole(role?: string | null): string {
    if (isSuperAdmin(role)) return "/dashboard";
    if (isSubscribedCommerce(role)) return "/portal";
    return "/";
}