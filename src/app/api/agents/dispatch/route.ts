import { NextResponse } from "next/server";
import { runAgentCompletion } from "@/lib/ai-router";
import { AGENT_REGISTRY } from "@/features/agents/registry";
import { buildEnrichedSystemPrompt } from "@/features/agents/skills";
import { persistAgentTask } from "@/features/agents/orchestrator";
import {
    canAccessAgentByPlan,
    isSuperAdmin,
    normalizePlan,
    normalizeRole,
} from "@/lib/privileges";
import type { AgentRole, AgentTask } from "@/types/agents";

interface DispatchBody {
    role?: string;
    objective?: string;
    tenantId?: string;
    requestedBy?: AgentRole | "human_ceo";
    inputPayload?: Record<string, unknown>;
    actorUid?: string;
    actorRole?: string;
    actorPlan?: string;
}

interface AdminModuleShape {
    getFirebaseAdminFirestore?: () => FirebaseFirestore.Firestore;
    getFirebaseAdminDb?: () => FirebaseFirestore.Firestore;
    adminDb?: FirebaseFirestore.Firestore;
    db?: FirebaseFirestore.Firestore;
}

async function resolveActorFromFirestore(uid?: string): Promise<{
    role?: string;
    plan?: string;
} | null> {
    if (!uid) return null;
    try {
        const adminMod = (await import("@/lib/firebase-admin")) as AdminModuleShape;
        const firestore =
            (typeof adminMod.getFirebaseAdminFirestore === "function" &&
                adminMod.getFirebaseAdminFirestore()) ||
            (typeof adminMod.getFirebaseAdminDb === "function" &&
                adminMod.getFirebaseAdminDb()) ||
            adminMod.adminDb ||
            adminMod.db ||
            null;

        if (!firestore) return null;
        const snap = await firestore.collection("allies").doc(uid).get();
        if (!snap.exists) return null;
        const data = snap.data() as { role?: string; plan?: string } | undefined;
        return data ? { role: data.role, plan: data.plan } : null;
    } catch {
        return null;
    }
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

        // Verificación de privilegios y gating por plan
        const dbActor = await resolveActorFromFirestore(body.actorUid?.trim());
        const effectiveRole = normalizeRole(dbActor?.role ?? body.actorRole ?? "admin");
        const effectivePlan = normalizePlan(dbActor?.plan ?? body.actorPlan ?? "tentaculo");

        const allowed = canAccessAgentByPlan({
            role: effectiveRole,
            userPlan: effectivePlan,
            agentMinPlan: agent.minPlan,
        });

        if (!allowed) {
            return NextResponse.json(
                {
                    ok: false,
                    code: "PLAN_UPGRADE_REQUIRED",
                    error: `El agente ${agent.name} requiere el plan "${agent.minPlan.toUpperCase()}". Tu plan actual es "${effectivePlan.toUpperCase()}".`,
                },
                { status: 403 },
            );
        }

        // Aislamiento multi-tenant: un comercio siempre escribe en su propio tenantId (su UID)
        const resolvedTenantId = isSuperAdmin(effectiveRole)
            ? body.tenantId?.trim() || "kraken-hq"
            : body.actorUid?.trim() || body.tenantId?.trim() || "commerce-unknown";

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
            tenantId: resolvedTenantId,
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