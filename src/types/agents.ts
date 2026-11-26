export type AgentDivision =
    | "command_capital"
    | "engineering_cyber"
    | "growth_media_ops"
    | "legal_human_core";

export type AgentRole =
    // División I: Comando y Capital (5)
    | "board_oracle"
    | "yessy_core"
    | "kraken_coo"
    | "cfo_ledger"
    | "wealth_oracle"
    // División II: Ingeniería y Blindaje Cyber (6)
    | "lab_scout"
    | "sentinel_devops"
    | "dev_factory"
    | "brand_architect"
    | "cyber_aegis"
    | "phantom_red"
    // División III: Crecimiento, Medios y Operación (5)
    | "broker_dispatch"
    | "growth_engine"
    | "pulse_cm"
    | "kraken_live"
    | "audit_shield"
    // División IV: Protección Legal y Núcleo Humano (3)
    | "lex_kraken"
    | "shepherd_word"
    | "mind_shield";

export type AgentPlanTier = "tentaculo" | "depredador" | "kraken" | "ecosistema";

export type IntelligenceTier = "fast" | "balanced" | "deep";

export type CapabilityActionType =
    | "read_metrics"
    | "simulate_finance"
    | "delegate_task"
    | "audit_security_rules"
    | "generate_copy_or_script"
    | "draft_legal_policy"
    | "wellness_protocol";

export interface AgentSkill {
    id: string;
    name: string;
    domain: AgentDivision | "cross_division";
    summary: string;
    instructions: string;
    checklist: string[];
}

export interface AgentCapability {
    id: string;
    name: string;
    action: CapabilityActionType;
    description: string;
    requiresApproval: boolean;
}

export interface IntelligenceProfile {
    tier: IntelligenceTier;
    preferredModel?: string;
    temperature: number;
    maxOutputTokens: number;
    rationale: string;
}

export interface AgentDefinition {
    role: AgentRole;
    name: string;
    title: string;
    division: AgentDivision;
    minPlan: AgentPlanTier;
    requiresHumanApproval: boolean;
    description: string;
    intelligence: IntelligenceProfile;
    skillIds: string[];
    capabilityIds: string[];
    systemPrompt: string;
}

export type TaskStatus =
    | "queued"
    | "running"
    | "awaiting_approval"
    | "completed"
    | "failed";

export interface AgentTask {
    id: string;
    tenantId: string;
    assignedTo: AgentRole;
    requestedBy: AgentRole | "human_ceo";
    objective: string;
    inputPayload: Record<string, unknown>;
    outputResult?: string;
    status: TaskStatus;
    requiresApproval: boolean;
    approvedBy?: string;
    createdAt: string;
    completedAt?: string;
}

export interface FinancialSplit {
    orderId: string;
    grossAmount: number;
    currency: "COP" | "USD";
    operation50: number;
    taxReserve20: number;
    investment20: number;
    netProfit10: number;
    createdAt: string;
}