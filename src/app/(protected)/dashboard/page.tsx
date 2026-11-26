"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import type { Lead } from "@/types/models";
import { useAllLeadsRealtime } from "@/features/broker/hooks/useLeads";
import { useAllies } from "@/features/broker/hooks/useAllies";
import { AssignLeadModal } from "@/features/broker/components/AssignLeadModal";
import { LeadStatusBadge } from "@/features/broker/components/LeadStatusBadge";

function formatLeadDate(createdAt: unknown): string {
  if (
    createdAt &&
    typeof createdAt === "object" &&
    "toDate" in createdAt &&
    typeof (createdAt as { toDate: unknown }).toDate === "function"
  ) {
    return (createdAt as { toDate: () => Date })
      .toDate()
      .toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
  }
  if (typeof createdAt === "string") {
    const parsed = new Date(createdAt);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
  }
  return "N/A";
}

export default function DashboardPage() {
  const { user, profile } = useAuthStore();
  const router = useRouter();

  // Protección RBAC: si no es admin, redirige a /portal
  useEffect(() => {
    if (profile && profile.role !== "admin") {
      router.replace("/portal");
    }
  }, [profile, router]);

  const { leads, loading: loadingLeads } = useAllLeadsRealtime();
  const { allies, loading: loadingAllies } = useAllies();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const allyMap = useMemo(
    () => Object.fromEntries(allies.map((a) => [a.uid, a.displayName])),
    [allies],
  );

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  const handleAssigned = (leadId: string, allyId: string, allyName: string) => {
    console.log(`Lead ${leadId} asignado a ${allyName} (${allyId})`);
  };

  const leadsNuevos = leads.filter((l) => l.status === "nuevo").length;
  const leadsConvertidos = leads.filter((l) => l.status === "convertido").length;
  const alliesActivos = allies.filter((a) => a.role === "ally").length;

  return (
    <div className="min-h-screen bg-kraken-black text-kraken-white p-6">
      <header className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4 border-b border-kraken-gray pb-5 mb-8">
        <div>
          <h1 className="text-2xl font-bold">
            <span className="text-kraken-white">Panel </span>
            <span className="text-kraken-gold">Kraken</span>
          </h1>
          <p className="text-kraken-muted text-sm mt-1">
            {user?.email}
            {profile && (
              <span className="ml-2 inline-flex items-center gap-1">
                ·
                <span className="bg-kraken-gold/10 text-kraken-gold px-2 py-0.5 rounded text-xs border border-kraken-gold/20 uppercase">
                  {profile.role}
                </span>
                ·
                <span className="text-kraken-goldLight text-xs uppercase">
                  Plan {profile.plan}
                </span>
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/agents"
            className="bg-kraken-gold text-kraken-black px-4 py-2 rounded-lg text-sm font-bold hover:brightness-110 transition-all"
          >
            Sala de 19 Agentes IA →
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="border border-kraken-gray px-4 py-2 rounded-lg text-sm text-kraken-muted hover:text-kraken-white hover:border-kraken-gold/40 transition-colors cursor-pointer"
          >
            Desconectar
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-kraken-dark border border-kraken-gray rounded-xl p-5">
            <h3 className="text-kraken-muted text-xs uppercase tracking-wider mb-2">
              Total Leads
            </h3>
            <p className="text-3xl font-bold text-kraken-gold">
              {loadingLeads ? "..." : leads.length}
            </p>
          </div>
          <div className="bg-kraken-dark border border-kraken-gray rounded-xl p-5">
            <h3 className="text-kraken-muted text-xs uppercase tracking-wider mb-2">
              Sin Asignar
            </h3>
            <p className="text-3xl font-bold text-blue-400">
              {loadingLeads ? "..." : leadsNuevos}
            </p>
          </div>
          <div className="bg-kraken-dark border border-kraken-gray rounded-xl p-5">
            <h3 className="text-kraken-muted text-xs uppercase tracking-wider mb-2">
              Convertidos
            </h3>
            <p className="text-3xl font-bold text-green-400">
              {loadingLeads ? "..." : leadsConvertidos}
            </p>
          </div>
          <div className="bg-kraken-dark border border-kraken-gray rounded-xl p-5">
            <h3 className="text-kraken-muted text-xs uppercase tracking-wider mb-2">
              Aliados Activos
            </h3>
            <p className="text-3xl font-bold text-kraken-gold">
              {loadingAllies ? "..." : alliesActivos}
            </p>
          </div>
        </div>

        <div className="bg-kraken-dark border border-kraken-gray rounded-xl overflow-hidden">
          <div className="p-5 border-b border-kraken-gray flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-kraken-white">
                Registro de Leads
              </h2>
              <p className="text-sm text-kraken-muted mt-0.5">
                Contactos capturados · actualización en tiempo real
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-green-400">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              En vivo
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#111] border-b border-kraken-gray text-xs uppercase tracking-wider text-kraken-gold">
                  <th className="p-4 font-medium">Nombre</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">WhatsApp</th>
                  <th className="p-4 font-medium">Interés</th>
                  <th className="p-4 font-medium">Estado</th>
                  <th className="p-4 font-medium">Asignado a</th>
                  <th className="p-4 font-medium">Fecha</th>
                  <th className="p-4 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-kraken-gray/50">
                {loadingLeads ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-kraken-muted">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-kraken-gold border-t-transparent rounded-full animate-spin" />
                        Consultando registros...
                      </div>
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-kraken-muted">
                      Aún no hay leads capturados.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => {
                    const dateStr = formatLeadDate(lead.createdAt);
                    const assignedName = lead.assignedAllyId
                      ? allyMap[lead.assignedAllyId] ?? "Aliado"
                      : null;
                    const whatsappDigits = (lead.whatsapp ?? "").replace(/\D/g, "");

                    return (
                      <tr
                        key={lead.id}
                        className="hover:bg-[#151515] transition-colors"
                      >
                        <td className="p-4 font-medium text-kraken-white">
                          {lead.name}
                        </td>
                        <td className="p-4 text-kraken-muted">{lead.email}</td>
                        <td className="p-4 text-kraken-muted">
                          {whatsappDigits ? (
                            <a
                              href={`https://wa.me/${whatsappDigits}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-green-400 transition-colors"
                            >
                              {lead.whatsapp}
                            </a>
                          ) : (
                            <span>—</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="bg-kraken-gold/10 text-kraken-gold px-2 py-1 rounded-md text-xs border border-kraken-gold/20">
                            {lead.interest}
                          </span>
                        </td>
                        <td className="p-4">
                          <LeadStatusBadge status={lead.status} />
                        </td>
                        <td className="p-4">
                          {assignedName ? (
                            <span className="text-kraken-white text-xs">
                              {assignedName}
                            </span>
                          ) : (
                            <span className="text-kraken-muted/50 text-xs italic">
                              Sin asignar
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-kraken-muted text-xs">
                          {dateStr}
                        </td>
                        <td className="p-4">
                          <button
                            type="button"
                            onClick={() => setSelectedLead(lead)}
                            className="px-3 py-1.5 rounded-lg text-xs border border-kraken-gold/40 text-kraken-gold hover:bg-kraken-gold hover:text-kraken-black transition-all cursor-pointer font-medium"
                          >
                            {lead.assignedAllyId ? "Reasignar" : "Asignar"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {selectedLead && (
        <AssignLeadModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onAssigned={handleAssigned}
        />
      )}
    </div>
  );
}