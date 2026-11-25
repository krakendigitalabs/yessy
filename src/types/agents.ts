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

export type TaskStatus =
    | "queued"
    | "running"
    | "awaiting_approval"
    | "completed"
    | "failed";

export interface AgentDefinition {
    role: AgentRole;
    name: string;
    title: string;
    division: AgentDivision;
    minPlan: AgentPlanTier;
    requiresHumanApproval: boolean;
    description: string;
    systemPrompt: string;
}

export interface AgentTask {
    id: string;
    tenantId: string; // "kraken-hq" para uso interno, o ID del cliente comprador
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
    operation50: number;   // 50% Operación y entrega
    taxReserve20: number;  // 20% Impuestos y reserva legal
    investment20: number;  // 20% Fondo de innovación e inversión
    netProfit10: number;   // 10% Utilidad neta / Junta de Socios
    createdAt: string;
}
