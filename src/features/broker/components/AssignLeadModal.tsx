"use client";

import { useState, useEffect } from "react";
import type { Ally, Lead } from "@/types/models";
import { getAllAllies, assignLeadToAlly } from "@/lib/firestore-helpers";

// ═══════════════════════════════════════════════════════
// AssignLeadModal — Modal para asignar un lead a un aliado
// Solo visible para admins desde el Dashboard
// ═══════════════════════════════════════════════════════

interface AssignLeadModalProps {
  lead: Lead;
  onClose: () => void;
  onAssigned: (leadId: string, allyId: string, allyName: string) => void;
}

export function AssignLeadModal({ lead, onClose, onAssigned }: AssignLeadModalProps) {
  const [allies, setAllies] = useState<Ally[]>([]);
  const [loadingAllies, setLoadingAllies] = useState(true);
  const [selectedAllyId, setSelectedAllyId] = useState<string>("");
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAllAllies()
      .then(setAllies)
      .catch(() => setError("No se pudo cargar la lista de aliados."))
      .finally(() => setLoadingAllies(false));
  }, []);

  const handleAssign = async () => {
    if (!selectedAllyId) return;
    setAssigning(true);
    setError(null);
    try {
      await assignLeadToAlly(lead.id, selectedAllyId);
      const ally = allies.find((a) => a.uid === selectedAllyId);
      onAssigned(lead.id, selectedAllyId, ally?.displayName ?? selectedAllyId);
      onClose();
    } catch (err) {
      setError("Error al asignar el lead. Inténtalo de nuevo.");
      console.error(err);
    } finally {
      setAssigning(false);
    }
  };

  return (
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-kraken-dark border border-kraken-gray rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-black/50 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-start mb-5">
          <div>
            <h2 className="text-lg font-bold text-kraken-white">
              Asignar Lead
            </h2>
            <p className="text-sm text-kraken-muted mt-0.5">
              {lead.name} — {lead.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-kraken-muted hover:text-kraken-white transition-colors text-xl leading-none cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Interés del lead */}
        <div className="bg-black/40 rounded-lg p-3 mb-5 border border-kraken-gray/50">
          <p className="text-xs text-kraken-muted uppercase tracking-wider mb-1">
            Módulo de Interés
          </p>
          <p className="text-sm text-kraken-gold">{lead.interest || "—"}</p>
        </div>

        {/* Lista de aliados */}
        <div className="mb-5">
          <label className="block text-sm text-kraken-muted mb-2 uppercase tracking-wider">
            Seleccionar Aliado
          </label>

          {loadingAllies ? (
            <div className="flex items-center gap-2 text-kraken-muted py-4">
              <div className="w-4 h-4 border-2 border-kraken-gold border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Cargando aliados...</span>
            </div>
          ) : allies.length === 0 ? (
            <p className="text-sm text-kraken-muted py-4 text-center">
              No hay aliados activos disponibles.
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {allies.map((ally) => (
                <button
                  key={ally.uid}
                  onClick={() => setSelectedAllyId(ally.uid)}
                  className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedAllyId === ally.uid
                      ? "bg-kraken-gold/10 border-kraken-gold text-kraken-white"
                      : "bg-black/30 border-kraken-gray hover:border-kraken-gold/40 text-kraken-muted hover:text-kraken-white"
                  }`}
                >
                  <p className="font-medium text-sm">{ally.displayName}</p>
                  <p className="text-xs opacity-70 mt-0.5">
                    {ally.email} · Plan {ally.plan}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-400 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            {error}
          </p>
        )}

        {/* Acciones */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-kraken-gray text-kraken-muted hover:text-kraken-white hover:border-kraken-gold/40 transition-colors text-sm cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedAllyId || assigning}
            className="flex-1 px-4 py-2.5 rounded-lg bg-kraken-gold text-kraken-black font-semibold text-sm hover:bg-kraken-goldLight transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {assigning ? "Asignando..." : "Confirmar Asignación"}
          </button>
        </div>
      </div>
    </div>
  );
}
