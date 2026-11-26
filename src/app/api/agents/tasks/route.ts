import { NextResponse } from "next/server";
import {
    listRecentAgentTasks,
    updateAgentTaskApproval,
} from "@/features/agents/orchestrator";
import type { TaskStatus } from "@/types/agents";

const VALID_STATUSES = new Set<TaskStatus>([
    "queued",
    "running",
    "awaiting_approval",
    "completed",
    "failed",
]);

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const tenantId = searchParams.get("tenantId")?.trim() || undefined;
        const rawStatus = searchParams.get("status")?.trim() as TaskStatus | undefined;
        const status = rawStatus && VALID_STATUSES.has(rawStatus) ? rawStatus : undefined;
        const limitParam = Number(searchParams.get("limit") || "30");
        const limit = Number.isFinite(limitParam) ? limitParam : 30;

        const tasks = await listRecentAgentTasks({
            tenantId,
            status,
            limit,
        });

        return NextResponse.json({
            ok: true,
            count: tasks.length,
            tasks,
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Error consultando tareas de agentes.";
        console.error("[/api/agents/tasks][GET] Error:", error);
        return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = (await request.json()) as {
            taskId?: string;
            decision?: "approve" | "reject";
            approvedBy?: string;
        };

        const taskId = body.taskId?.trim();
        const decision = body.decision;

        if (!taskId) {
            return NextResponse.json(
                { ok: false, error: "Falta taskId para actualizar la tarea." },
                { status: 400 },
            );
        }

        if (decision !== "approve" && decision !== "reject") {
            return NextResponse.json(
                { ok: false, error: "La decisión debe ser 'approve' o 'reject'." },
                { status: 400 },
            );
        }

        const updated = await updateAgentTaskApproval({
            taskId,
            decision,
            approvedBy: body.approvedBy?.trim() || "human_ceo",
        });

        if (!updated) {
            return NextResponse.json(
                { ok: false, error: "No se encontró la tarea o no fue posible actualizarla." },
                { status: 404 },
            );
        }

        return NextResponse.json({
            ok: true,
            task: updated,
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Error actualizando aprobación de tarea.";
        console.error("[/api/agents/tasks][PATCH] Error:", error);
        return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
}