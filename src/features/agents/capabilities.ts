import type {
    AgentCapability,
    AgentRole,
    FinancialSplit,
} from "@/types/agents";

export const AGENT_CAPABILITIES: Record<string, AgentCapability> = {
    read_business_metrics: {
        id: "read_business_metrics",
        name: "Lectura de Métricas y Estado",
        action: "read_metrics",
        description: "Interpreta indicadores de operación, ventas, leads o avance de proyectos.",
        requiresApproval: false,
    },
    simulate_split_50_20_20_10: {
        id: "simulate_split_50_20_20_10",
        name: "Simulación Financiera 50/20/20/10",
        action: "simulate_finance",
        description:
            "Calcula repartos financieros (50% operación, 20% impuestos/reserva, 20% inversión, 10% utilidad).",
        requiresApproval: true,
    },
    delegate_specialist_task: {
        id: "delegate_specialist_task",
        name: "Delegación a Especialistas",
        action: "delegate_task",
        description: "Prepara subtareas estructuradas para otros agentes de Kraken OS.",
        requiresApproval: false,
    },
    audit_access_and_rules: {
        id: "audit_access_and_rules",
        name: "Auditoría de Reglas y Seguridad",
        action: "audit_security_rules",
        description: "Revisa permisos, rutas, configuración o vulnerabilidades reportadas.",
        requiresApproval: true,
    },
    produce_growth_assets: {
        id: "produce_growth_assets",
        name: "Generación de Copys, Guiones y Embudos",
        action: "generate_copy_or_script",
        description: "Redacta propuestas comerciales, mensajes, calendarios o guiones en vivo.",
        requiresApproval: false,
    },
    draft_legal_documents: {
        id: "draft_legal_documents",
        name: "Redacción de Borradores Legales y Políticas",
        action: "draft_legal_policy",
        description:
            "Elabora estructuras de contratos, términos o políticas de privacidad para revisión humana.",
        requiresApproval: true,
    },
    guide_human_wellbeing: {
        id: "guide_human_wellbeing",
        name: "Acompañamiento Ético, Espiritual y Mental",
        action: "wellness_protocol",
        description: "Facilita guías de propósito, liderazgo o regulación mental con límites saludables.",
        requiresApproval: false,
    },
};

export const ROLE_DEFAULT_CAPABILITIES: Record<AgentRole, string[]> = {
    board_oracle: ["read_business_metrics", "simulate_split_50_20_20_10"],
    yessy_core: ["read_business_metrics", "delegate_specialist_task", "simulate_split_50_20_20_10"],
    kraken_coo: ["read_business_metrics", "delegate_specialist_task"],
    cfo_ledger: ["read_business_metrics", "simulate_split_50_20_20_10"],
    wealth_oracle: ["read_business_metrics", "simulate_split_50_20_20_10"],
    lab_scout: ["read_business_metrics", "produce_growth_assets"],
    sentinel_devops: ["read_business_metrics", "audit_access_and_rules"],
    dev_factory: ["read_business_metrics", "audit_access_and_rules"],
    brand_architect: ["produce_growth_assets", "read_business_metrics"],
    cyber_aegis: ["audit_access_and_rules"],
    phantom_red: ["audit_access_and_rules"],
    broker_dispatch: ["read_business_metrics", "produce_growth_assets"],
    growth_engine: ["read_business_metrics", "produce_growth_assets"],
    pulse_cm: ["produce_growth_assets"],
    kraken_live: ["produce_growth_assets"],
    audit_shield: ["read_business_metrics", "audit_access_and_rules"],
    lex_kraken: ["draft_legal_documents", "audit_access_and_rules"],
    shepherd_word: ["guide_human_wellbeing"],
    mind_shield: ["guide_human_wellbeing"],
};

export function getCapabilitiesByIds(capabilityIds: string[]): AgentCapability[] {
    return capabilityIds
        .map((id) => AGENT_CAPABILITIES[id])
        .filter((cap): cap is AgentCapability => Boolean(cap));
}

export function calculateFinancialSplit(params: {
    orderId: string;
    grossAmount: number;
    currency: "COP" | "USD";
}): FinancialSplit {
    const round2 = (n: number) => Math.round(n * 100) / 100;
    return {
        orderId: params.orderId,
        grossAmount: params.grossAmount,
        currency: params.currency,
        operation50: round2(params.grossAmount * 0.5),
        taxReserve20: round2(params.grossAmount * 0.2),
        investment20: round2(params.grossAmount * 0.2),
        netProfit10: round2(params.grossAmount * 0.1),
        createdAt: new Date().toISOString(),
    };
}