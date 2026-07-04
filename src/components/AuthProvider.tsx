"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getAllyByUid, getAllyByEmail } from "@/lib/firestore-helpers";
import { useAuthStore } from "@/store/authStore";
import { usePlanStore } from "@/store/planStore";

// ═══════════════════════════════════════════════════════
// AuthProvider — Sincroniza Firebase Auth + Perfil Firestore
// Envuelve toda la app en layout.tsx
// ═══════════════════════════════════════════════════════

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setLoading } = useAuthStore();
  const { loadActivePlan, setActivePlan, loadPlans } = usePlanStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true); // Evitar race condition de enrutamiento
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          // 1. Buscar perfil del aliado en Firestore por UID
          let allyProfile = await getAllyByUid(firebaseUser.uid);

          // 1.5 Fallback: Si no se encuentra por UID, intentar por email (Google Sign-In)
          if (!allyProfile && firebaseUser.email) {
            console.log(`[DEBUG] Perfil no encontrado por UID. Intentando fallback con email: ${firebaseUser.email}`);
            allyProfile = await getAllyByEmail(firebaseUser.email);
          }

          setProfile(allyProfile);

          // 2. Si tiene perfil con plan, cargar el plan activo
          if (allyProfile?.plan) {
            await loadActivePlan(allyProfile.plan);
          }

          // 3. Cargar catálogo de planes (cache global)
          await loadPlans();
        } catch (error) {
          console.error("Error cargando perfil del aliado:", error);
          setProfile(null);
        }
      } else {
        // Usuario deslogueado: limpiar todo
        setProfile(null);
        setActivePlan(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setProfile, setLoading, loadActivePlan, setActivePlan, loadPlans]);

  return <>{children}</>;
}

