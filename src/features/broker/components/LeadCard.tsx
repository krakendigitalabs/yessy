"use client";

import { useState } from "react";
import type { Lead, LeadStatus } from "@/types/models";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { updateLeadStatus } from "@/lib/firestore-helpers";

// ═══════════════════════════════════════════════════════
// LeadCard — Tarjeta de lead para el portal del aliado
// Permite ver datos del contacto y actualizar su estado
// ═══════════════════════════════════════════════════════

const STATUS_OPTIONS: LeadStatus[] = [
  "contactado",
  "en_negociacion",
  "convertido",
  "descartado",
];

interface LeadCardProps {
  lead: Lead;
  onStatusChange?: (leadId: string, newStatus: LeadStatus) => void;
}

export function LeadCard({ lead, onStatusChange }: LeadCardProps) {
  const [updating, setUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<LeadStatus>(lead.status);

  const createdAt = lead.createdAt as any;
  const dateStr = createdAt?.toDate
    ? createdAt.toDate().toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (newStatus === currentStatus || updating) return;
    setUpdating(true);
    try {
      await updateLeadStatus(lead.id, newStatus);
      setCurrentStatus(newStatus);
      onStatusChange?.(lead.id, newStatus);
    } catch (error) {
      console.error("Error actualizando estado:", error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-kraken-dark border border-kraken-gray rounded-xl p-5 hover:border-kraken-gold/40 transition-colors group">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-kraken-white group-hover:text-kraken-gold transition-colors">
            {lead.name}
          </h3>
          <p className="text-xs text-kraken-muted mt-0.5">{dateStr}</p>
        </div>
        <LeadStatusBadge status={currentStatus} />
      </div>

      {/* Datos de contacto */}
      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-2 text-sm text-kraken-muted">
          <span className="text-kraken-gold/60">✉</span>
          <span>{lead.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-kraken-muted">
          <span className="text-kraken-gold/60">📱</span>
          <a
            href={`https://wa.me/${lead.whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-green-400 transition-colors"
          >
            {lead.whatsapp}
          </a>
        </div>
        {lead.interest && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-kraken-gold/60">★</span>
            <span className="bg-kraken-gold/10 text-kraken-gold px-2 py-0.5 rounded text-xs border border-kraken-gold/20">
              {lead.interest}
            </span>
          </div>
        )}
      </div>

      {/* Selector de estado */}
      <div className="border-t border-kraken-gray/50 pt-3">
        <p className="text-xs text-kraken-muted mb-2 uppercase tracking-wider">
          Actualizar estado
        </p>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={updating || status === currentStatus}
              className={`text-xs px-2.5 py-1 rounded-md border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                status === currentStatus
                  ? "bg-kraken-gold/20 border-kraken-gold text-kraken-gold"
                  : "bg-transparent border-kraken-gray text-kraken-muted hover:border-kraken-gold/40 hover:text-kraken-white"
              }`}
            >
              {updating && status !== currentStatus ? "..." : status.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
