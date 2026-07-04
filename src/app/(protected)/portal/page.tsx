"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import { LeadCard } from "@/features/broker/components/LeadCard";
import { useAllyLeads } from "@/features/broker/hooks/useLeads";
import type { LeadStatus } from "@/types/models";

// ═══════════════════════════════════════════════════════
// Portal del Aliado — /portal
// Vista exclusiva para aliados (role: "ally")
// Muestra leads asignados y permite gestionar su estado
// ═══════════════════════════════════════════════════════

export default function PortalPage() {
  const { user, profile, isAdmin } = useAuthStore();
  const router = useRouter();

  // Si es admin, redirige al dashboard
  useEffect(() => {
    if (isAdmin()) {
      router.push("/dashboard");
    }
  }, [isAdmin, router]);

  const { leads, setLeads, loading, error } = useAllyLeads(
    profile?.uid ?? null
  );

  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  // Métricas rápidas
  const totalLeads = leads.length;
  const convertidos = leads.filter((l) => l.status === "convertido").length;
  const enProceso = leads.filter(
    (l) => l.status === "contactado" || l.status === "en_negociacion"
  ).length;

  return (
    <div className="min-h-screen bg-kraken-black text-kraken-white">
      {/* Header */}
      <header className="border-b border-kraken-gray">
        <div className="max-w-5xl mx-auto px-6 py-5 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">
                <span className="text-kraken-white">Portal </span>
                <span className="text-kraken-gold">Aliado</span>
              </h1>
              <span className="bg-kraken-gold/10 text-kraken-gold px-2 py-0.5 rounded text-xs border border-kraken-gold/20 uppercase">
                {profile?.plan ?? "—"}
              </span>
            </div>
            <p className="text-sm text-kraken-muted mt-0.5">
              {profile?.displayName ?? user?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="border border-kraken-gray px-4 py-2 rounded-lg text-sm text-kraken-muted hover:text-kraken-white hover:border-kraken-gold/40 transition-colors cursor-pointer"
          >
            Desconectar
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Métricas */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-kraken-dark border border-kraken-gray rounded-xl p-5">
            <p className="text-xs text-kraken-muted uppercase tracking-wider mb-1">
              Leads Asignados
            </p>
            <p className="text-3xl font-bold text-kraken-gold">
              {loading ? "..." : totalLeads}
            </p>
          </div>
          <div className="bg-kraken-dark border border-kraken-gray rounded-xl p-5">
            <p className="text-xs text-kraken-muted uppercase tracking-wider mb-1">
              En Proceso
            </p>
            <p className="text-3xl font-bold text-yellow-400">
              {loading ? "..." : enProceso}
            </p>
          </div>
          <div className="bg-kraken-dark border border-kraken-gray rounded-xl p-5">
            <p className="text-xs text-kraken-muted uppercase tracking-wider mb-1">
              Convertidos
            </p>
            <p className="text-3xl font-bold text-green-400">
              {loading ? "..." : convertidos}
            </p>
          </div>
        </div>

        {/* Leads */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-kraken-white">
              Mis Leads Asignados
            </h2>
            {totalLeads > 0 && (
              <span className="text-xs text-kraken-muted">
                {totalLeads} contacto{totalLeads !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <div className="w-6 h-6 border-2 border-kraken-gold border-t-transparent rounded-full animate-spin" />
              <p className="text-kraken-muted text-sm animate-pulse">
                Cargando leads...
              </p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="bg-kraken-dark border border-kraken-gray rounded-xl p-12 text-center">
              <div className="text-4xl mb-3">🐙</div>
              <p className="text-kraken-muted text-sm">
                Aún no tienes leads asignados.
              </p>
              <p className="text-kraken-muted/60 text-xs mt-1">
                El administrador te asignará contactos pronto.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
