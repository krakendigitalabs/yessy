import { create } from "zustand";
import type { Plan } from "@/types/models";
import { getPlans, getPlanById } from "@/lib/firestore-helpers";

// ═══════════════════════════════════════════════════════
// Plan Store — Gestión del plan activo y catálogo
// ═══════════════════════════════════════════════════════

interface PlanState {
  // Plan activo del usuario autenticado
  activePlan: Plan | null;
  // Cache de todos los planes disponibles
  plans: Plan[];
  // Estado de carga
  loading: boolean;

  // Setters
  setActivePlan: (plan: Plan | null) => void;

  // Acciones asíncronas
  loadPlans: () => Promise<void>;
  loadActivePlan: (planId: string) => Promise<void>;

  // Helpers de acceso a features
  canAccessFeature: (feature: "broker" | "saas" | "growth") => boolean;
}

export const usePlanStore = create<PlanState>((set, get) => ({
  activePlan: null,
  plans: [],
  loading: false,

  setActivePlan: (plan) => set({ activePlan: plan }),

  loadPlans: async () => {
    set({ loading: true });
    try {
      const plans = await getPlans();
      set({ plans });
    } catch (error) {
      console.error("Error cargando planes:", error);
    } finally {
      set({ loading: false });
    }
  },

  loadActivePlan: async (planId: string) => {
    try {
      const plan = await getPlanById(planId);
      set({ activePlan: plan });
    } catch (error) {
      console.error("Error cargando plan activo:", error);
    }
  },

  canAccessFeature: (feature) => {
    const plan = get().activePlan;
    if (!plan) return false;

    switch (feature) {
      case "broker":
        return plan.hasBrokerAccess;
      case "saas":
        return plan.hasSaasAccess;
      case "growth":
        return plan.hasGrowthEngine;
      default:
        return false;
    }
  },
}));
