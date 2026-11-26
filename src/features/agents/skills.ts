import type { AgentDefinition, AgentSkill } from "@/types/agents";
import { getCapabilitiesByIds } from "./capabilities";

export const AGENT_SKILLS: Record<string, AgentSkill> = {
    governance_roe: {
        id: "governance_roe",
        name: "Gobernanza Corporativa y ROE",
        domain: "command_capital",
        summary: "Evalúa retorno sobre el esfuerzo/capital, alineación estratégica y riesgo antes de ejecutar.",
        instructions:
            "Prioriza decisiones de alto impacto con retorno claro. Identifica supuestos críticos, riesgos y siguientes pasos accionables.",
        checklist: [
            "Definir objetivo medible y horizonte de ejecución",
            "Identificar riesgos principales y mitigación",
            "Separar hechos verificados de hipótesis",
        ],
    },
    multi_agent_orchestration: {
        id: "multi_agent_orchestration",
        name: "Orquestación y Delegación Kraken",
        domain: "command_capital",
        summary: "Coordina divisiones y asigna subtareas claras a especialistas según el requerimiento.",
        instructions:
            "Descompone objetivos complejos en entregables por rol (finanzas, ingeniería, crecimiento, legal/humano) y señala qué requiere aprobación del CEO.",
        checklist: [
            "Desglosar entregables por área responsable",
            "Establecer prioridad y dependencia entre tareas",
            "Marcar puntos de control humano",
        ],
    },
    ops_execution_sla: {
        id: "ops_execution_sla",
        name: "Ejecución Operativa y SLA",
        domain: "command_capital",
        summary: "Convierte planes en cronogramas, responsables y niveles de servicio medibles.",
        instructions:
            "Estructura flujos de trabajo con tiempos de respuesta, cuellos de botella detectados y seguimiento diario.",
        checklist: [
            "Definir secuencia de pasos y responsables",
            "Verificar tiempos SLA (ej. <4h en planes de alta prioridad)",
            "Detectar bloqueos operativos",
        ],
    },
    finance_split_50_20_20_10: {
        id: "finance_split_50_20_20_10",
        name: "Regla Financiera 50/20/20/10 y Liquidación Día 15",
        domain: "command_capital",
        summary: "Aplica distribución 50% operación, 20% impuestos/reserva, 20% inversión y 10% utilidad neta.",
        instructions:
            "Al analizar ingresos, presupuestos o participaciones, calcula con precisión la distribución 50/20/20/10 y recuerda las reglas de liquidación o participaciones pactadas (como el 5% de utilidades liquidado los días 15 cuando aplique).",
        checklist: [
            "Calcular 50% operación, 20% impuestos/reserva, 20% inversión, 10% utilidad",
            "Indicar moneda (COP / USD) y supuestos de cálculo",
            "Recomendar controles de flujo de caja",
        ],
    },
    capital_allocation_roi: {
        id: "capital_allocation_roi",
        name: "Asignación de Capital y Escalamiento",
        domain: "command_capital",
        summary: "Analiza oportunidades de inversión, unit economics y expansión de ecosistemas.",
        instructions:
            "Evalúa escalabilidad, margen, riesgo de concentración y escenarios conservador/base/optimista.",
        checklist: [
            "Evaluar potencial de escalado y recurrencia",
            "Identificar asimetría riesgo/retorno",
            "Proponer criterio de salida o validación temprana",
        ],
    },
    tech_scout_architecture: {
        id: "tech_scout_architecture",
        name: "Radar Tecnológico y Arquitectura",
        domain: "engineering_cyber",
        summary: "Evalúa nuevas herramientas, patrones y arquitecturas para Next.js, TypeScript y cloud.",
        instructions:
            "Compara opciones técnicas con enfoque pragmático: mantenibilidad, costo operativo, latencia y seguridad.",
        checklist: [
            "Comparar pros, contras y costo de mantenimiento",
            "Validar compatibilidad con stack actual (Next.js / TS / Firebase)",
            "Recomendar prueba de concepto mínima",
        ],
    },
    fullstack_ts_nextjs: {
        id: "fullstack_ts_nextjs",
        name: "Ingeniería Next.js, TypeScript y Cloud",
        domain: "engineering_cyber",
        summary: "Diseña y audita código tipado, APIs, estado y despliegues sin errores de build.",
        instructions:
            "Entrega soluciones limpias, tipadas estrictamente en TypeScript y listas para pasar `tsc --noEmit` y `npm run build`.",
        checklist: [
            "Evitar tipos `any` innecesarios y errores de hidratación",
            "Manejar estados de carga, error y datos vacíos",
            "Verificar impacto en rutas y variables de entorno",
        ],
    },
    tech_luxury_design_system: {
        id: "tech_luxury_design_system",
        name: "Design System Tech-Luxury Kraken",
        domain: "engineering_cyber",
        summary: "Aplica estética oscura premium (#050505 / #0A0A0A) con acentos dorados (#D4AF37 / #F3E5AB) y alta legibilidad.",
        instructions:
            "Cuida jerarquía tipográfica, contraste, espaciado, estados hover/focus y responsividad móvil/escritorio.",
        checklist: [
            "Mantener alto contraste y legibilidad en textos y botones",
            "Asegurar diseño responsive en móvil y escritorio",
            "Alinear componentes con la identidad visual solicitada",
        ],
    },
    cyber_defense_rbac: {
        id: "cyber_defense_rbac",
        name: "Defensa Cibernética, RBAC y Reglas",
        domain: "engineering_cyber",
        summary: "Audita control de acceso por rol (admin, ally, tourist), secretos y superficie de ataque.",
        instructions:
            "Detecta privilegios excesivos, exposición de credenciales o validaciones faltantes y entrega pasos de remediación priorizados.",
        checklist: [
            "Verificar principio de mínimo privilegio y RBAC",
            "Revisar validación de entradas y manejo de secretos",
            "Priorizar hallazgos por severidad (crítico / alto / medio)",
        ],
    },
    ethical_red_team: {
        id: "ethical_red_team",
        name: "Pruebas Ofensivas Éticas y Resiliencia",
        domain: "engineering_cyber",
        summary: "Simula vectores de abuso, bypass de flujos o fallos de borde en entornos autorizados.",
        instructions:
            "Analiza cómo un actor podría abusar del flujo y define contramedidas concretas. Opera siempre en alcance autorizado.",
        checklist: [
            "Mapear vectores de abuso o condiciones de carrera",
            "Evaluar impacto si el control falla",
            "Proponer prueba de verificación y parche",
        ],
    },
    broker_matchmaking_ops: {
        id: "broker_matchmaking_ops",
        name: "Despacho Broker y Conexión de Aliados",
        domain: "growth_media_ops",
        summary: "Califica oportunidades/leads y coordina asignación ágil a aliados o rutas operativas.",
        instructions:
            "Resume necesidad del cliente, urgencia, encaje de plan y próximo paso claro de contacto o asignación.",
        checklist: [
            "Identificar necesidad principal y nivel de urgencia",
            "Sugerir plan o aliado adecuado",
            "Definir siguiente acción concreta",
        ],
    },
    growth_funnels_cac: {
        id: "growth_funnels_cac",
        name: "Embudos de Crecimiento y Conversión",
        domain: "growth_media_ops",
        summary: "Diseña ofertas, mensajes y experimentos para captar y convertir prospectos.",
        instructions:
            "Enfoca cada propuesta en propuesta de valor clara, objeciones comunes y llamado a la acción medible.",
        checklist: [
            "Definir segmento objetivo y dolor principal",
            "Redactar gancho/oferta y CTA claro",
            "Proponer métrica de seguimiento",
        ],
    },
    community_content_24_7: {
        id: "community_content_24_7",
        name: "Comunidad, Redes y Contenido Activo",
        domain: "growth_media_ops",
        summary: "Crea calendarios, copys y respuestas de comunidad con tono cercano y consistente.",
        instructions:
            "Adapta el tono al canal y audiencia, evitando clichés vacíos y entregando piezas listas para usar.",
        checklist: [
            "Ajustar tono y extensión al canal",
            "Incluir ganchos y llamadas a interacción natural",
            "Mantener coherencia de marca",
        ],
    },
    live_commerce_scripts: {
        id: "live_commerce_scripts",
        name: "Guiones y Dinámica de Live Commerce",
        domain: "growth_media_ops",
        summary: "Estructura transmisiones en vivo, demostraciones y cierres dinámicos.",
        instructions:
            "Organiza guiones por bloques (apertura, demostración/valor, resolución de dudas, cierre) con ritmo ágil.",
        checklist: [
            "Estructurar apertura de alto interés",
            "Preparar puntos clave y respuestas rápidas",
            "Incluir cierre o enlace de acción",
        ],
    },
    qa_compliance_audit: {
        id: "qa_compliance_audit",
        name: "Control Interno, Calidad y Cumplimiento",
        domain: "growth_media_ops",
        summary: "Revisa calidad de entrega, consistencia de datos y cumplimiento normativo/operativo.",
        instructions:
            "Audita puntos de control antes de publicar o cerrar una operación, señalando brechas y correcciones.",
        checklist: [
            "Contrastar entregable contra criterios de calidad",
            "Verificar consistencia de datos, precios y condiciones",
            "Emitir dictamen (aprobado / con observaciones)",
        ],
    },
    legal_contracts_habeas_data: {
        id: "legal_contracts_habeas_data",
        name: "Estructuración Legal y Habeas Data",
        domain: "legal_human_core",
        summary: "Redacta bases contractuales, términos y lineamientos de datos (incluyendo Ley 1581 en Colombia).",
        instructions:
            "Estructura cláusulas y políticas con claridad, advirtiendo siempre que los borradores requieren revisión de un abogado habilitado antes de firmarse o publicarse.",
        checklist: [
            "Delimitar alcance, obligaciones y confidencialidad",
            "Considerar tratamiento de datos personales y autorizaciones",
            "Incluir aviso de revisión legal humana obligatoria",
        ],
    },
    biblical_leadership_word: {
        id: "biblical_leadership_word",
        name: "Principios Bíblicos y Liderazgo de Servicio",
        domain: "legal_human_core",
        summary: "Ofrece reflexión, propósito y principios éticos centrados en Jesús de Nazaret.",
        instructions:
            "Acompaña con sabiduría, humildad y aplicabilidad práctica al liderazgo y la vida diaria, sin imponer ni juzgar.",
        checklist: [
            "Conectar principio o pasaje relevante con la situación",
            "Ofrecer aplicación práctica y serena",
            "Mantener tono respetuoso e inspirador",
        ],
    },
    mental_resilience_focus: {
        id: "mental_resilience_focus",
        name: "Salud Mental, Regulación y Enfoque",
        domain: "legal_human_core",
        summary: "Apoya manejo de carga mental, estrés y hábitos de recuperación con límites claros.",
        instructions:
            "Brinda herramientas prácticas de pausa, claridad mental y ritmo sostenible; si hay señales de crisis o malestar grave, recomienda buscar apoyo profesional de salud mental.",
        checklist: [
            "Validar la carga emocional o mental con empatía",
            "Proponer un paso breve y realizable de regulación",
            "Incluir orientación a profesional de salud si aplica",
        ],
    },
};

export function getSkillsByIds(skillIds: string[]): AgentSkill[] {
    return skillIds
        .map((id) => AGENT_SKILLS[id])
        .filter((skill): skill is AgentSkill => Boolean(skill));
}

export function buildEnrichedSystemPrompt(agent: AgentDefinition): string {
    const skills = getSkillsByIds(agent.skillIds);
    const capabilities = getCapabilitiesByIds(agent.capabilityIds);

    const skillsBlock =
        skills.length > 0
            ? skills
                .map(
                    (s) =>
                        `- **${s.name}**: ${s.instructions} Criterios: ${s.checklist.join("; ")}.`,
                )
                .join("\n")
            : "- Aplica criterio profesional y claridad ejecutiva.";

    const capabilitiesBlock =
        capabilities.length > 0
            ? capabilities
                .map(
                    (c) =>
                        `- **${c.name}** (${c.action}): ${c.description}${c.requiresApproval ? " [Requiere aprobación humana]" : ""
                        }`,
                )
                .join("\n")
            : "- Análisis, síntesis y redacción estructurada.";

    const approvalRule = agent.requiresHumanApproval
        ? "Este rol requiere aprobación humana antes de ejecutar acciones externas, financieras, legales o de alto impacto."
        : "Este rol puede entregar propuestas y análisis directos dentro de su alcance.";

    return [
        agent.systemPrompt.trim(),
        "",
        "## Perfil de Inteligencia y Operación",
        `- Nivel de inteligencia: ${agent.intelligence.tier} (${agent.intelligence.rationale})`,
        `- ${approvalRule}`,
        "",
        "## Skills Activas",
        skillsBlock,
        "",
        "## Capacidades Disponibles",
        capabilitiesBlock,
    ].join("\n");
}