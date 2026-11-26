"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { AGENT_LIST } from "@/features/agents/registry";
import type { AgentDefinition, AgentDivision, AgentTask } from "@/types/agents";

type DivisionFilter = "all" | AgentDivision;

interface ExecutionEntry {
    task: AgentTask;
    agentName: string;
    agentTitle: string;
    provider: "gemini";
    model: string;
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

const DEFAULT_AGENT =
    AGENT_LIST.find((a) => a.role === "yessy_core") ?? AGENT_LIST[0];

export default function AgentsCommandPage() {
    const { user, profile } = useAuthStore();
    const [division, setDivision] = useState<DivisionFilter>("all");
    const [selectedAgent, setSelectedAgent] = useState<AgentDefinition>(DEFAULT_AGENT);
    const [objective, setObjective] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<ExecutionEntry[]>([]);

    const backHref = profile?.role === "admin" ? "/dashboard" : "/portal";
    const backLabel =
        profile?.role === "admin" ? "← Volver al Dashboard" : "← Volver al Portal";

    const filteredAgents = useMemo(() => {
        if (division === "all") return AGENT_LIST;
        return AGENT_LIST.filter((a) => a.division === division);
    }, [division]);

    async function handleDispatch(e: React.FormEvent) {
        e.preventDefault();
        if (!objective.trim() || loading) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/agents/dispatch", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    role: selectedAgent.role,
                    objective: objective.trim(),
                    tenantId:
                        profile?.role === "admin"
                            ? "kraken-hq"
                            : (profile?.uid ?? user?.uid ?? "kraken-hq"),
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.ok) {
                throw new Error(data.error || "No se pudo ejecutar el agente.");
            }

            setHistory((prev) => [
                {
                    task: data.task as AgentTask,
                    agentName: selectedAgent.name,
                    agentTitle: selectedAgent.title,
                    provider: data.provider,
                    model: data.model,
                },
                ...prev,
            ]);
            setObjective("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error de conexión.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#050505] text-[#F8F9FA] px-4 py-8 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-7xl space-y-8">
                <header className="flex flex-col gap-4 border-b border-[#D4AF37]/20 pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
                            Kraken OS · Fuerza Laboral Autónoma
                        </p>
                        <h1 className="mt-1 text-3xl font-black tracking-tight text-[#F8F9FA] sm:text-4xl">
                            Sala de Comando — 19 Agentes
                        </h1>
                        <p className="mt-1 text-sm text-neutral-400">
                            Selecciona cualquier puesto corporativo, asigna un objetivo y ejecuta en tiempo real con Gemini.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={backHref}
                            className="rounded-xl border border-[#D4AF37]/30 bg-[#0A0A0A] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#F3E5AB] transition hover:border-[#D4AF37] hover:bg-[#D4AF37]/10"
                        >
                            {backLabel}
                        </Link>
                    </div>
                </header>

                <nav aria-label="Filtrar agentes por división" className="flex flex-wrap gap-2">
                    {(Object.keys(DIVISION_LABELS) as DivisionFilter[]).map((key) => {
                        const active = division === key;
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setDivision(key)}
                                className={`rounded-full border px-4 py-2 text-xs font-bold tracking-wide transition cursor-pointer ${active
                                        ? "border-[#D4AF37] bg-[#D4AF37] text-[#050505]"
                                        : "border-white/10 bg-[#0A0A0A] text-neutral-300 hover:border-[#D4AF37]/50 hover:text-[#F3E5AB]"
                                    }`}
                            >
                                {DIVISION_LABELS[key]}
                            </button>
                        );
                    })}
                </nav>

                <div className="grid gap-8 lg:grid-cols-12">
                    <section className="lg:col-span-7 grid gap-3 sm:grid-cols-2 content-start">
                        {filteredAgents.map((agent) => {
                            const isSelected = selectedAgent.role === agent.role;
                            return (
                                <button
                                    key={agent.role}
                                    type="button"
                                    onClick={() => setSelectedAgent(agent)}
                                    className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition cursor-pointer ${isSelected
                                            ? "border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_25px_rgba(212,175,55,0.18)]"
                                            : "border-white/10 bg-[#0A0A0A] hover:border-[#D4AF37]/40"
                                        }`}
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h2 className="text-base font-extrabold text-[#F8F9FA]">
                                                    {agent.name}
                                                </h2>
                                                <p className="text-xs font-semibold text-[#D4AF37]">
                                                    {agent.title}
                                                </p>
                                            </div>
                                            <span
                                                className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${PLAN_BADGES[agent.minPlan]}`}
                                            >
                                                {agent.minPlan}
                                            </span>
                                        </div>

                                        <p className="mt-2.5 text-xs leading-relaxed text-neutral-400">
                                            {agent.description}
                                        </p>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2.5 text-[10px] uppercase tracking-wider text-neutral-500">
                                        <span>
                                            {agent.requiresHumanApproval
                                                ? "Requiere aprobación CEO"
                                                : "Ejecución autónoma"}
                                        </span>
                                        {isSelected && (
                                            <span className="font-bold text-[#F3E5AB]">● Activo</span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </section>

                    <section className="lg:col-span-5 space-y-6">
                        <div className="rounded-2xl border border-[#D4AF37]/40 bg-[#0A0A0A] p-5 shadow-[0_0_30px_rgba(212,175,55,0.08)]">
                            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                                        Agente Seleccionado
                                    </p>
                                    <h2 className="text-xl font-black text-[#F8F9FA]">
                                        {selectedAgent.name}{" "}
                                        <span className="text-sm font-medium text-neutral-400">
                                            · {selectedAgent.title}
                                        </span>
                                    </h2>
                                </div>
                            </div>

                            <form onSubmit={handleDispatch} className="mt-4 space-y-4">
                                <div>
                                    <label
                                        htmlFor="agent-objective"
                                        className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-300"
                                    >
                                        Instrucción u objetivo
                                    </label>
                                    <textarea
                                        id="agent-objective"
                                        rows={4}
                                        value={objective}
                                        onChange={(e) => setObjective(e.target.value)}
                                        placeholder={`Ej: ${selectedAgent.name}, prepara un plan de acción para hoy...`}
                                        className="w-full rounded-xl border border-white/15 bg-[#050505] p-3 text-sm text-[#F8F9FA] placeholder:text-neutral-500 focus:border-[#D4AF37] focus:outline-none"
                                        disabled={loading}
                                    />
                                </div>

                                {error && (
                                    <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading || !objective.trim()}
                                    className="w-full rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] px-4 py-3 text-sm font-black uppercase tracking-wider text-[#050505] transition hover:brightness-110 disabled:opacity-50 cursor-pointer"
                                >
                                    {loading
                                        ? `Ejecutando ${selectedAgent.name}...`
                                        : `Despachar a ${selectedAgent.name}`}
                                </button>
                            </form>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                                Resultados de la Sesión ({history.length})
                            </h3>

                            {history.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-white/10 bg-[#0A0A0A]/50 p-6 text-center text-xs text-neutral-500">
                                    Aún no has ejecutado tareas en esta sesión. Selecciona un agente arriba y envía tu primera orden.
                                </div>
                            ) : (
                                history.map((entry) => (
                                    <article
                                        key={entry.task.id}
                                        className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-4 space-y-3"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2">
                                            <div>
                                                <span className="text-sm font-extrabold text-[#F3E5AB]">
                                                    {entry.agentName}
                                                </span>
                                                <span className="ml-2 text-xs text-neutral-400">
                                                    {entry.agentTitle}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase">
                                                <span className="rounded-md border border-white/15 bg-white/5 px-2 py-0.5 text-neutral-300">
                                                    {entry.provider} · {entry.model}
                                                </span>
                                                <span
                                                    className={`rounded-md px-2 py-0.5 ${entry.task.status === "awaiting_approval"
                                                            ? "bg-amber-500/20 text-amber-300"
                                                            : "bg-emerald-500/20 text-emerald-300"
                                                        }`}
                                                >
                                                    {entry.task.status === "awaiting_approval"
                                                        ? "Pendiente CEO"
                                                        : "Completada"}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-xs italic text-neutral-400">
                                            “{entry.task.objective}”
                                        </p>

                                        <div className="whitespace-pre-wrap rounded-xl bg-[#050505] p-3 text-sm leading-relaxed text-neutral-100 border border-white/5">
                                            {entry.task.outputResult}
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}