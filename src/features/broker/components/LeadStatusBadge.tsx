"use client";

import type { LeadStatus } from "@/types/models";

// ═══════════════════════════════════════════════════════
// LeadStatusBadge — Badge de color según estado del lead
// ═══════════════════════════════════════════════════════

const STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; className: string }
> = {
  nuevo: {
    label: "Nuevo",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  contactado: {
    label: "Contactado",
    className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  },
  en_negociacion: {
    label: "En Negociación",
    className: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  },
  convertido: {
    label: "Convertido ✓",
    className: "bg-green-500/10 text-green-400 border-green-500/20",
  },
  descartado: {
    label: "Descartado",
    className: "bg-red-500/10 text-red-400 border-red-500/20",
  },
};

interface LeadStatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

export function LeadStatusBadge({ status, className = "" }: LeadStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG["nuevo"];
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
}
