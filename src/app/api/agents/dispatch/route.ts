import { NextResponse } from "next/server";
import { runAgentCompletion } from "@/lib/ai-router";
import { AGENT_REGISTRY } from "@/features/agents/registry";
import type { AgentRole, AgentTask } from "@/types/agents";

interface DispatchBody {
    role?: string;
    objective?: string;
    tenantId?: string;
    preferLocal?: boolean;
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as DispatchBody;
        const role = body.role as AgentRole | undefined;
        const objective = body.objective?.trim();

        if (!role || !(role in AGENT_REGISTRY)) {
            return NextResponse.json(
                { ok: false, error: "Agente no válido o no registrado en Kraken OS." },
                { status: 400 },
            );
        }

        if (!objective) {
            return NextResponse.json(
                { ok: false, error: "Debes escribir un objetivo o instrucción para el agente." },
                { status: 400 },
            );
        }

        const agent = AGENT_REGISTRY[role];
        const createdAt = new Date().toISOString();

        const aiResponse = await runAgentCompletion({
            systemPrompt: agent.systemPrompt,
            userPrompt: objective,
            preferLocal: Boolean(body.preferLocal),
        });

        const task: AgentTask = {
            id: `task_${Date.now()}`,
            tenantId: body.tenantId?.trim() || "kraken-hq",
            assignedTo: agent.role,
            requestedBy: "human_ceo",
            objective,
            inputPayload: { preferLocal: Boolean(body.preferLocal) },
            outputResult: aiResponse.content,
            status: agent.requiresHumanApproval ? "awaiting_approval" : "completed",
            requiresApproval: agent.requiresHumanApproval,
            createdAt,
            completedAt: new Date().toISOString(),
        };

        return NextResponse.json({
            ok: true,
            agent: {
                role: agent.role,
                name: agent.name,
                title: agent.title,
                division: agent.division,
                minPlan: agent.minPlan,
                requiresHumanApproval: agent.requiresHumanApproval,
            },
            provider: aiResponse.provider,
            model: aiResponse.model,
            task,
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Error inesperado ejecutando el agente.";
        console.error("[/api/agents/dispatch] Error:", error);
        return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
}