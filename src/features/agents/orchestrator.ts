import "server-only";
import { runAgentCompletion } from "@/lib/ai-router";
import { AGENT_REGISTRY } from "@/features/agents/registry";
import { buildEnrichedSystemPrompt } from "@/features/agents/skills";
import { calculateFinancialSplit } from "@/features/agents/capabilities";
import type { AgentRole, AgentTask, FinancialSplit, TaskStatus } from "@/types/agents";

const COLLECTION_AGENT_TASKS = "agent_tasks";

interface AdminModuleShape {
    getFirebaseAdminFirestore?: () => FirebaseFirestore.Firestore;
    getFirebaseAdminDb?: () => FirebaseFirestore.Firestore;
    adminDb?: FirebaseFirestore.Firestore;
    db?: FirebaseFirestore.Firestore;
}

async function getAdminFirestoreSafe(): Promise<FirebaseFirestore.Firestore | null> {
    try {
        const adminMod = (await import("@/lib/firebase-admin")) as AdminModuleShape;
        if (typeof adminMod.getFirebaseAdminFirestore === "function") {
            return adminMod.getFirebaseAdminFirestore();
        }
        if (typeof adminMod.getFirebaseAdminDb === "function") {
            return adminMod.getFirebaseAdminDb();
        }
        if (adminMod.adminDb) return adminMod.adminDb;
        if (adminMod.db) return adminMod.db;
        return null;
    } catch (err) {
        console.warn("[orchestrator] Firebase Admin no disponible para persistencia:", err);
        return null;
    }
}

export async function persistAgentTask(task: AgentTask): Promise<AgentTask> {
    const firestore = await getAdminFirestoreSafe();
    if (!firestore) return task;

    try {
        await firestore.collection(COLLECTION_AGENT_TASKS).doc(task.id).set(task, { merge: true });
    } catch (err) {
        console.error(`[orchestrator] Error guardando tarea ${task.id} en Firestore:`, err);
    }

    return task;
}

export async function listRecentAgentTasks(params?: {
    tenantId?: string;
    status?: TaskStatus;
    limit?: number;
}): Promise<AgentTask[]> {
    const firestore = await getAdminFirestoreSafe();
    if (!firestore) return [];

    try {
        const maxItems = Math.min(Math.max(params?.limit ?? 30, 1), 100);
        let query: FirebaseFirestore.Query = firestore.collection(COLLECTION_AGENT_TASKS);

        if (params?.tenantId) {
            query = query.where("tenantId", "==", params.tenantId);
        }
        if (params?.status) {
            query = query.where("status", "==", params.status);
        }

        const snap = await query.orderBy("createdAt", "desc").limit(maxItems).get();
        return snap.docs.map((d) => d.data() as AgentTask);
    } catch (err) {
        console.error("[orchestrator] Error leyendo agent_tasks:", err);
        return [];
    }
}

export async function updateAgentTaskApproval(params: {
    taskId: string;
    decision: "approve" | "reject";
    approvedBy: string;
}): Promise<AgentTask | null> {
    const firestore = await getAdminFirestoreSafe();
    if (!firestore) return null;

    try {
        const ref = firestore.collection(COLLECTION_AGENT_TASKS).doc(params.taskId);
        const snap = await ref.get();
        if (!snap.exists) return null;

        const current = snap.data() as AgentTask;
        const nextStatus: TaskStatus = params.decision === "approve" ? "completed" : "failed";
        const updated: AgentTask = {
            ...current,
            status: nextStatus,
            approvedBy: params.approvedBy,
            completedAt: new Date().toISOString(),
        };

        await ref.set(updated, { merge: true });
        return updated;
    } catch (err) {
        console.error(`[orchestrator] Error actualizando tarea ${params.taskId}:`, err);
        return null;
    }
}

export async function delegateTaskToAgent(params: {
    assignedTo: AgentRole;
    requestedBy: AgentRole | "human_ceo";
    objective: string;
    tenantId?: string;
    inputPayload?: Record<string, unknown>;
}): Promise<{
    task: AgentTask;
    provider: "gemini";
    model: string;
    financialSplit?: FinancialSplit;
}> {
    const agent = AGENT_REGISTRY[params.assignedTo];
    const createdAt = new Date().toISOString();
    const tenantId = params.tenantId?.trim() || "kraken-hq";

    let financialSplit: FinancialSplit | undefined;
    const grossAmount =
        typeof params.inputPayload?.grossAmount === "number"
            ? params.inputPayload.grossAmount
            : undefined;

    if (grossAmount && grossAmount > 0 && agent.capabilityIds.includes("simulate_split_50_20_20_10")) {
        const currency = params.inputPayload?.currency === "USD" ? "USD" : "COP";
        financialSplit = calculateFinancialSplit({
            orderId: `ord_${Date.now()}`,
            grossAmount,
            currency,
        });
    }

    const promptWithContext = financialSplit
        ? `${params.objective}\n\n[Referencia cálculo 50/20/20/10 sobre ${financialSplit.grossAmount} ${financialSplit.currency}]: Operación 50%=${financialSplit.operation50}, Reserva/Impuestos 20%=${financialSplit.taxReserve20}, Inversión 20%=${financialSplit.investment20}, Utilidad 10%=${financialSplit.netProfit10}.`
        : params.objective;

    const aiResponse = await runAgentCompletion({
        systemPrompt: buildEnrichedSystemPrompt(agent),
        userPrompt: promptWithContext,
        tier: agent.intelligence.tier,
        temperature: agent.intelligence.temperature,
        maxOutputTokens: agent.intelligence.maxOutputTokens,
    });

    const task: AgentTask = {
        id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        tenantId,
        assignedTo: agent.role,
        requestedBy: params.requestedBy,
        objective: params.objective,
        inputPayload: params.inputPayload ?? {},
        outputResult: aiResponse.content,
        status: agent.requiresHumanApproval ? "awaiting_approval" : "completed",
        requiresApproval: agent.requiresHumanApproval,
        createdAt,
        completedAt: new Date().toISOString(),
    };

    await persistAgentTask(task);

    return {
        task,
        provider: aiResponse.provider,
        model: aiResponse.model,
        financialSplit,
    };
}