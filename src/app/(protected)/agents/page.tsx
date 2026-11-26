"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AGENT_LIST, AGENT_REGISTRY } from "@/features/agents/registry";
import { useAuthStore } from "@/store/authStore";
import type {
    AgentDefinition,
    AgentDivision,
    AgentTask,
    TaskStatus,
} from "@/types/agents";

type DivisionFilter = "all" | AgentDivision;

interface ExecutionEntry {
    task: AgentTask;
    agentName: string;
    agentTitle: string;
    provider?: "ollama" | "gemini";
    model?: string;
}

const DIVISION_LABELS: Record<DivisionFilter, string> = {
    all: "Todos (19)",
    command_capital: "I. Comando y Capital",
    engineering_cyber: "II. Ingeniería y Cyber",
    growth_media_ops: "III. Crecimiento y Ops",
    legal_human_core: "IV. Legal y Humano",
};

const PLAN_BADGES: Record<AgentDefinition["minPlan"], string> = {
    tentaculo: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    depredador: "border-sky-500/40 bg-sky-500/10 text-sky-300",
    kraken: "border-[#D4AF37]/50 bg-[#D4AF37]/15 text-[#F3E5AB]",
    ecosistema: "border-purple-500/50 bg-purple-500/15 text-purple-200",
};

const STATUS_BADGES: Record<TaskStatus, { label: string; cls: string }> = {
    queued: { label: "En cola", cls: "border-zinc-500/40 bg-zinc-500/10 text-zinc-300" },
    running: { label: "Ejecutando", cls: "border-sky-500/40 bg-sky-500/10 text-sky-300" },
    awaiting_approval: {
        label: "Pendiente aprobación",
        cls: "border-amber-500/50 bg-amber-500/15 text-amber-200",
    },
    completed: {
        label: "Completada",
        cls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    },
    failed: {
        label: "Rechazada / Error",
        cls: "border-red-500/50 bg-red-500/10 text-red-300",
    },
};

function mapTasksToEntries(tasks: AgentTask[]): ExecutionEntry[] {
    return tasks.map((task) => {
        const def = AGENT_REGISTRY[task.assignedTo];
        return {
            task,
            agentName: def?.name ?? task.assignedTo,
            agentTitle: def?.title ?? "Especialista Kraken",
        };
    });
}

export default function AgentsCommandPage() {
    const { user } = useAuthStore();
    const [division, setDivision] = useState<DivisionFilter>("all");
    const [selectedAgent, setSelectedAgent] = useState<AgentDefinition>(
        AGENT_LIST.find((a) => a.role === "yessy_core") ?? AGENT_LIST[0],
    );
    const [objective, setObjective] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [actionTaskId, setActionTaskId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<ExecutionEntry[]>([]);

    const loadPersistedHistory = useCallback(async () => {
        setLoadingHistory(true);
        try {
            const res = await fetch("/api/agents/tasks?tenantId=kraken-hq&limit=30", {
                cache: "no-store",
            });
            const data = (await res.json()) as { ok?: boolean; tasks?: AgentTask[] };
            if (res.ok && data.ok && Array.isArray(data.tasks)) {
                setHistory(mapTasksToEntries(data.tasks));
            }
        } catch (err) {
            console.error("Error cargando historial de tareas:", err);
        } finally {
            setLoadingHistory(false);
        }
    }, []);

    useEffect(() => {
        void loadPersistedHistory();
    }, [loadPersistedHistory]);

    const filteredAgents = useMemo(() => {
        if (division === "all") return AGENT_LIST;
        return AGENT_LIST.filter((a) => a.division === division);
    }, [division]);

    const handleDispatch = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const trimmed = objective.trim();
        if (!trimmed) {
            setError("Escribe una instrucción o tarea para el agente.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/agents/dispatch", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    role: selectedAgent.role,
                    objective: trimmed,
                    tenantId: "kraken-hq",
                }),
            });

            const data = (await res.json()) as {
                ok?: boolean;
                error?: string;
                task?: AgentTask;
                provider?: "ollama" | "gemini";
                model?: string;
            };

            if (!res.ok || !data.ok || !data.task) {
                throw new Error(data.error || "No se pudo ejecutar la tarea.");
            }

            const newEntry: ExecutionEntry = {
                task: data.task,
                agentName: selectedAgent.name,
                agentTitle: selectedAgent.title,
                provider: data.provider,
                model: data.model,
            };

            setHistory((prev) => [
                newEntry,
                ...prev.filter((item) => item.task.id !== data.task!.id),
            ]);
            setObjective("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al despachar tarea.");
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (taskId: string, decision: "approve" | "reject") => {
        setError(null);
        setActionTaskId(taskId);
        try {
            const res = await fetch("/api/agents/tasks", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    taskId,
                    decision,
                    approvedBy: user?.email || "human_ceo",
                }),
            });

            const data = (await res.json()) as {
                ok?: boolean;
                error?: string;
                task?: AgentTask;
            };

            if (!res.ok || !data.ok || !data.task) {
                throw new Error(data.error || "No se pudo actualizar la aprobación.");
            }

            setHistory((prev) =>
                prev.map((entry) =>
                    entry.task.id === taskId ? { ...entry, task: data.task! } : entry,
                ),
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al actualizar tarea.");
        } finally {
            setActionTaskId(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-[#F8F9FA] p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
                            Kraken OS · Sala de Comando
                        </p>
                        <h1 className="text-2xl md:text-3xl font-bold mt-1">
                            19 Agentes <span className="text-[#D4AF37]">Autónomos</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => void loadPersistedHistory()}
                            className="border border-white/15 px-3.5 py-2 rounded-lg text-xs text-zinc-300 hover:border-[#D4AF37]/50 hover:text-white transition-colors cursor-pointer"
                        >
                            {loadingHistory ? "Sincronizando..." : "Actualizar historial"}
                        </button>
                        <Link
                            href="/dashboard"
                            className="border border-white/15 px-4 py-2 rounded-lg text-sm text-zinc-300 hover:border-[#D4AF37]/50 hover:text-white transition-colors"
                        >
                            ← Volver al Dashboard
                        </Link>
                    </div>
                </header>

                <div className="flex flex-wrap gap-2">
                    {(Object.keys(DIVISION_LABELS) as DivisionFilter[]).map((key) => {
                        const active = division === key;
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setDivision(key)}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${active
                                        ? "bg-[#D4AF37] text-[#050505] border-[#D4AF37]"
                                        : "bg-[#0A0A0A] text-zinc-300 border-white/10 hover:border-[#D4AF37]/40"
                                    }`}
                            >
                                {DIVISION_LABELS[key]}
                            </button>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[620px] overflow-y-auto pr-1">
                        {filteredAgents.map((agent) => {
                            const isSelected = selectedAgent.role === agent.role;
                            return (
                                <button
                                    key={agent.role}
                                    type="button"
                                    onClick={() => setSelectedAgent(agent)}
                                    className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${isSelected
                                            ? "bg-[#120F07] border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.12)]"
                                            : "bg-[#0A0A0A] border-white/10 hover:border-[#D4AF37]/40"
                                        }`}
                                >
                                    <div className="flex items-center justify-between gap-2 mb-1.5">
                                        <span className="font-bold text-sm text-white">{agent.name}</span>
                                        <span
                                            className={`text-[10px] uppercase px-2 py-0.5 rounded border ${PLAN_BADGES[agent.minPlan]
                                                }`}
                                        >
                                            {agent.minPlan}
                                        </span>
                                    </div>
                                    <p className="text-xs text-[#D4AF37] font-medium mb-1.5">{agent.title}</p>
                                    <p className="text-xs text-zinc-400 line-clamp-2">{agent.description}</p>
                                </button>
                            );
                        })}
                    </div>

                    <div className="lg:col-span-7 bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 space-y-5">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
                            <div>
                                <h2 className="text-lg font-bold text-white">
                                    {selectedAgent.name}{" "}
                                    <span className="text-sm font-normal text-[#D4AF37]">
                                        — {selectedAgent.title}
                                    </span>
                                </h2>
                                <p className="text-xs text-zinc-400 mt-1">{selectedAgent.description}</p>
                                <p className="text-[11px] text-zinc-500 mt-1">
                                    Inteligencia: <span className="text-zinc-300">{selectedAgent.intelligence.tier}</span> ·{" "}
                                    {selectedAgent.skillIds.length} skills · {selectedAgent.capabilityIds.length} capacidades
                                </p>
                            </div>
                            {selectedAgent.requiresHumanApproval && (
                                <span className="text-[11px] px-2.5 py-1 rounded bg-amber-500/15 border border-amber-500/40 text-amber-200">
                                    Requiere aprobación
                                </span>
                            )}
                        </div>

                        <form onSubmit={handleDispatch} className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2">
                                    Instrucción u objetivo
                                </label>
                                <textarea
                                    rows={4}
                                    value={objective}
                                    onChange={(e) => setObjective(e.target.value)}
                                    placeholder={`Ej. Dale una tarea concreta a ${selectedAgent.name}...`}
                                    className="w-full rounded-xl bg-[#050505] border border-white/15 p-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#D4AF37]"
                                />
                            </div>

                            {error && (
                                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-[#D4AF37] text-[#050505] font-bold text-sm px-5 py-2.5 rounded-xl hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer"
                            >
                                {loading ? `Ejecutando ${selectedAgent.name}...` : `Despachar a ${selectedAgent.name}`}
                            </button>
                        </form>

                        <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs uppercase tracking-wider text-zinc-400">
                                    Historial persistido de tareas ({history.length})
                                </h3>
                                {loadingHistory && (
                                    <span className="text-[11px] text-zinc-500">Cargando desde Firestore...</span>
                                )}
                            </div>

                            {!loadingHistory && history.length === 0 ? (
                                <p className="text-xs text-zinc-500 border border-dashed border-white/10 rounded-xl p-4">
                                    Aún no hay tareas registradas. Envía una instrucción arriba para iniciar.
                                </p>
                            ) : (
                                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                                    {history.map((item) => {
                                        const badge = STATUS_BADGES[item.task.status];
                                        const isBusy = actionTaskId === item.task.id;

                                        return (
                                            <article
                                                key={item.task.id}
                                                className="rounded-xl bg-[#050505] border border-white/10 p-4 space-y-2.5"
                                            >
                                                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="font-bold text-[#D4AF37]">{item.agentName}</span>
                                                        <span className="text-zinc-500">· {item.agentTitle}</span>
                                                        <span
                                                            className={`text-[10px] uppercase px-2 py-0.5 rounded border ${badge.cls}`}
                                                        >
                                                            {badge.label}
                                                        </span>
                                                    </div>
                                                    <span className="text-zinc-500">
                                                        {item.model ? `${item.model} · ` : ""}
                                                        {new Date(item.task.createdAt).toLocaleString()}
                                                    </span>
                                                </div>

                                                <p className="text-xs text-zinc-300 font-medium">
                                                    Objetivo: {item.task.objective}
                                                </p>

                                                {item.task.outputResult && (
                                                    <div className="text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed bg-[#0A0A0A] border border-white/5 rounded-lg p-3">
                                                        {item.task.outputResult}
                                                    </div>
                                                )}

                                                {item.task.status === "awaiting_approval" && (
                                                    <div className="flex items-center gap-2 pt-1">
                                                        <button
                                                            type="button"
                                                            disabled={isBusy}
                                                            onClick={() => void handleApproval(item.task.id, "approve")}
                                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 hover:bg-emerald-500/30 disabled:opacity-50 transition-colors cursor-pointer"
                                                        >
                                                            {isBusy ? "Guardando..." : "Aprobar tarea"}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={isBusy}
                                                            onClick={() => void handleApproval(item.task.id, "reject")}
                                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/15 text-red-200 border border-red-500/40 hover:bg-red-500/25 disabled:opacity-50 transition-colors cursor-pointer"
                                                        >
                                                            Rechazar
                                                        </button>
                                                    </div>
                                                )}
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}