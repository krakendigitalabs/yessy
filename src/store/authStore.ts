import { create } from "zustand";
import { User } from "firebase/auth";
import type { Ally } from "@/types/models";

// ═══════════════════════════════════════════════════════
// Auth Store — Usuario de Firebase + Perfil de Aliado
// ═══════════════════════════════════════════════════════

interface AuthState {
  // Firebase Auth user
  user: User | null;
  // Perfil completo del aliado desde Firestore (null si no existe)
  profile: Ally | null;
  // Estado de carga inicial
  loading: boolean;

  // Setters
  setUser: (user: User | null) => void;
  setProfile: (profile: Ally | null) => void;
  setLoading: (loading: boolean) => void;

  // Helpers de rol (computados desde profile)
  isAdmin: () => boolean;
  isAlly: () => boolean;
  hasProfile: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),

  isAdmin: () => get().profile?.role === "admin",
  isAlly: () => get().profile?.role === "ally",
  hasProfile: () => get().profile !== null,
}));
