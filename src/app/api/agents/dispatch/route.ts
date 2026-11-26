import { NextResponse } from "next/server";
import { runAgentCompletion } from "@/lib/ai-router";
import { AGENT_REGISTRY } from "@/features/agents/registry";
import { buildEnrichedSystemPrompt } from "@/features/agents/skills";
import { persistAgentTask } from "@/features/agents/orchestrator";
import type { AgentRole, AgentTask } from "@/types/agents";

interface DispatchBody {
    role?: string;
    objective?: string;
    tenantId?: string;
    requestedBy?: AgentRole | "human_ceo";
    inputPayload?: Record<string, unknown>;
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
        const enrichedSystemPrompt = buildEnrichedSystemPrompt(agent);

        const aiResponse = await runAgentCompletion({
            systemPrompt: enrichedSystemPrompt,
            userPrompt: objective,
            tier: agent.intelligence.tier,
            temperature: agent.intelligence.temperature,
            maxOutputTokens: agent.intelligence.maxOutputTokens,
        });

        const task: AgentTask = {
            id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            tenantId: body.tenantId?.trim() || "kraken-hq",
            assignedTo: agent.role,
            requestedBy: body.requestedBy ?? "human_ceo",
            objective,
            inputPayload: body.inputPayload ?? {},
            outputResult: aiResponse.content,
            status: agent.requiresHumanApproval ? "awaiting_approval" : "completed",
            requiresApproval: agent.requiresHumanApproval,
            createdAt,
            completedAt: new Date().toISOString(),
        };

        await persistAgentTask(task);

        return NextResponse.json({
            ok: true,
            agent: {
                role: agent.role,
                name: agent.name,
                title: agent.title,
                division: agent.division,
                minPlan: agent.minPlan,
                intelligence: agent.intelligence,
                skillIds: agent.skillIds,
                capabilityIds: agent.capabilityIds,
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