"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import { AGENT_LIST, AGENT_REGISTRY } from "@/features/agents/registry";
import {
  canAccessAgentByPlan,
  isSuperAdmin,
  normalizePlan,
} from "@/lib/privileges";
import type { AgentDefinition, AgentTask, TaskStatus } from "@/types/agents";

const PLAN_LABELS: Record<AgentDefinition["minPlan"], string> = {
  tentaculo: "Tentáculo",
  depredador: "Depredador",
  kraken: "Kraken",
  ecosistema: "Ecosistema",
};

const PLAN_BADGES: Record<AgentDefinition["minPlan"], string> = {
  tentaculo: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  depredador: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  kraken: "border-[#D4AF37]/50 bg-[#D4AF37]/15 text-[#F3E5AB]",
  ecosistema: "border-purple-500/50 bg-purple-500/15 text-purple-200",
};

const STATUS_LABELS: Record<TaskStatus, { label: string; cls: string }> = {
  queued: { label: "En cola", cls: "border-zinc-500/40 bg-zinc-500/10 text-zinc-300" },
  running: { label: "Ejecutando", cls: "border-sky-500/40 bg-sky-500/10 text-sky-300" },
  awaiting_approval: {
    label: "En revisión",
    cls: "border-amber-500/50 bg-amber-500/15 text-amber-200",
  },
  completed: {
    label: "Completada",
    cls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  },
  failed: {
    label: "Error",
    cls: "border-red-500/50 bg-red-500/10 text-red-300",
  },
};

const UPGRADE_WHATSAPP_URL =
  "https://wa.me/573044554311?text=Hola%20Kraken%20Digital%20Labs%2C%20quiero%20subir%20mi%20plan%20para%20desbloquear%20m%C3%A1s%20agentes%20IA.";

export default function CommercePortalPage() {
  const { user, profile } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (profile && isSuperAdmin(profile.role)) {
      router.replace("/dashboard");
    }
  }, [profile, router]);

  const activePlan = normalizePlan(profile?.plan);
  const activeRole = profile?.role ?? "commerce";
  const tenantId = profile?.uid ?? user?.uid ?? "";

  const unlockedAgents = useMemo(
    () =>
      AGENT_LIST.filter((agent) =>
        canAccessAgentByPlan({
          role: activeRole,
          userPlan: activePlan,
          agentMinPlan: agent.minPlan,
        }),
      ),
    [activeRole, activePlan],
  );

  const lockedAgents = useMemo(
    () =>
      AGENT_LIST.filter(
        (agent) =>
          !canAccessAgentByPlan({
            role: activeRole,
            userPlan: activePlan,
            agentMinPlan: agent.minPlan,
          }),
      ),
    [activeRole, activePlan],
  );

  const [selectedAgent, setSelectedAgent] = useState<AgentDefinition>(
    unlockedAgents[0] ?? AGENT_LIST[0],
  );
  const [objective, setObjective] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<AgentTask[]>([]);

  useEffect(() => {
    if (
      unlockedAgents.length > 0 &&
      !unlockedAgents.some((a) => a.role === selectedAgent.role)
    ) {
      setSelectedAgent(unlockedAgents[0]);
    }
  }, [unlockedAgents, selectedAgent.role]);

  const loadTasks = useCallback(async () => {
    if (!tenantId) {
      setLoadingHistory(false);
      return;
    }
    setLoadingHistory(true);
    try {
      const res = await fetch(
        `/api/agents/tasks?tenantId=${encodeURIComponent(tenantId)}&limit=25`,
        { cache: "no-store" },
      );
      const data = (await res.json()) as { ok?: boolean; tasks?: AgentTask[] };
      if (res.ok && data.ok && Array.isArray(data.tasks)) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error("Error cargando historial del comercio:", err);
    } finally {
      setLoadingHistory(false);
    }
  }, [tenantId]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = objective.trim();
    if (!trimmed) {
      setError("Escribe qué necesitas que haga este agente para tu negocio.");
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
          tenantId,
          actorUid: user?.uid,
          actorRole: activeRole,
          actorPlan: activePlan,
        }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        task?: AgentTask;
      };

      if (!res.ok || !data.ok || !data.task) {
        throw new Error(data.error || "No se pudo ejecutar la solicitud.");
      }

      setTasks((prev) => [
        data.task!,
        ...prev.filter((item) => item.id !== data.task!.id),
      ]);
      setObjective("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al ejecutar el agente.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F8F9FA] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
              Kraken OS · Portal del Comercio
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <h1 className="text-2xl md:text-3xl font-bold">
                {profile?.displayName ?? user?.email ?? "Mi Negocio"}
              </h1>
              <span
                className={`text-xs uppercase px-2.5 py-0.5 rounded border font-semibold ${PLAN_BADGES[activePlan]}`}
              >
                Plan {PLAN_LABELS[activePlan]}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={UPGRADE_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#D4AF37] text-[#050505] px-4 py-2 rounded-lg text-xs font-bold hover:brightness-110 transition-all"
            >
              Subir de plan
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="border border-white/15 px-4 py-2 rounded-lg text-xs text-zinc-300 hover:border-[#D4AF37]/50 hover:text-white transition-colors cursor-pointer"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-5">
            <p className="text-xs uppercase tracking-wider text-zinc-400">
              Agentes Activos en tu Plan
            </p>
            <p className="text-3xl font-bold text-[#D4AF37] mt-1">
              {unlockedAgents.length}{" "}
              <span className="text-sm font-normal text-zinc-500">
                / {AGENT_LIST.length}
              </span>
            </p>
          </div>
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-5">
            <p className="text-xs uppercase tracking-wider text-zinc-400">
              Tareas Ejecutadas
            </p>
            <p className="text-3xl font-bold text-emerald-400 mt-1">
              {loadingHistory ? "..." : tasks.length}
            </p>
          </div>
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-5">
            <p className="text-xs uppercase tracking-wider text-zinc-400">
              Agentes Disponibles al Escalar
            </p>
            <p className="text-3xl font-bold text-zinc-200 mt-1">
              {lockedAgents.length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-6">
            <section className="space-y-3">
              <h2 className="text-xs uppercase tracking-wider text-[#D4AF37] font-semibold">
                Tus Agentes Activos ({unlockedAgents.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {unlockedAgents.map((agent) => {
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
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-sm text-white">
                          {agent.name}
                        </span>
                        <span
                          className={`text-[10px] uppercase px-2 py-0.5 rounded border ${PLAN_BADGES[agent.minPlan]}`}
                        >
                          {agent.minPlan}
                        </span>
                      </div>
                      <p className="text-xs text-[#D4AF37] font-medium mb-1">
                        {agent.title}
                      </p>
                      <p className="text-xs text-zinc-400 line-clamp-2">
                        {agent.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            {lockedAgents.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
                    Desbloquea subiendo de plan ({lockedAgents.length})
                  </h2>
                  <a
                    href={UPGRADE_WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#D4AF37] hover:underline"
                  >
                    Solicitar upgrade →
                  </a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-1">
                  {lockedAgents.map((agent) => (
                    <div
                      key={agent.role}
                      className="p-4 rounded-xl border border-white/5 bg-[#080808] opacity-65"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-semibold text-sm text-zinc-300">
                          🔒 {agent.name}
                        </span>
                        <span
                          className={`text-[10px] uppercase px-2 py-0.5 rounded border ${PLAN_BADGES[agent.minPlan]}`}
                        >
                          {agent.minPlan}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">{agent.title}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="lg:col-span-7 bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 space-y-5">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white">
                {selectedAgent.name}{" "}
                <span className="text-sm font-normal text-[#D4AF37]">
                  — {selectedAgent.title}
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                {selectedAgent.description}
              </p>
            </div>

            <form onSubmit={handleDispatch} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2">
                  ¿Qué necesitas resolver hoy?
                </label>
                <textarea
                  rows={4}
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder={`Ej. Pídele a ${selectedAgent.name} un copy, una respuesta a cliente o un plan para tu negocio...`}
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
                {loading
                  ? `Ejecutando ${selectedAgent.name}...`
                  : `Ejecutar con ${selectedAgent.name}`}
              </button>
            </form>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-wider text-zinc-400">
                  Historial de tu negocio ({tasks.length})
                </h3>
                <button
                  type="button"
                  onClick={() => void loadTasks()}
                  className="text-xs text-zinc-400 hover:text-[#D4AF37] cursor-pointer"
                >
                  {loadingHistory ? "Sincronizando..." : "Actualizar"}
                </button>
              </div>

              {!loadingHistory && tasks.length === 0 ? (
                <p className="text-xs text-zinc-500 border border-dashed border-white/10 rounded-xl p-4">
                  Aún no has ejecutado tareas. Elige un agente activo y envía tu primera instrucción.
                </p>
              ) : (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {tasks.map((task) => {
                    const def = AGENT_REGISTRY[task.assignedTo];
                    const badge = STATUS_LABELS[task.status];
                    return (
                      <article
                        key={task.id}
                        className="rounded-xl bg-[#050505] border border-white/10 p-4 space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#D4AF37]">
                              {def?.name ?? task.assignedTo}
                            </span>
                            <span
                              className={`text-[10px] uppercase px-2 py-0.5 rounded border ${badge.cls}`}
                            >
                              {badge.label}
                            </span>
                          </div>
                          <span className="text-zinc-500">
                            {new Date(task.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300 font-medium">
                          {task.objective}
                        </p>
                        {task.outputResult && (
                          <div className="text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed bg-[#0A0A0A] border border-white/5 rounded-lg p-3">
                            {task.outputResult}
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