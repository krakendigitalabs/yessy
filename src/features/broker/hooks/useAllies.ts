"use client";

import { useState, useEffect } from "react";
import { collection, query, onSnapshot, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Ally } from "@/types/models";

// ═══════════════════════════════════════════════════════
// useAllies — Hook para cargar la lista de aliados activos
// Solo para uso en componentes de admin
// ═══════════════════════════════════════════════════════

export function useAllies() {
  const [allies, setAllies] = useState<Ally[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Query simple sin orderBy para evitar índice compuesto.
    // El ordenamiento se hace client-side.
    const q = query(
      collection(db, "allies"),
      where("isActive", "==", true)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() } as Ally))
          .sort((a, b) => {
            // Ordenar por createdAt descendente (client-side)
            const aTime = (a.createdAt as any)?.toMillis?.() ?? 0;
            const bTime = (b.createdAt as any)?.toMillis?.() ?? 0;
            return bTime - aTime;
          });
        setAllies(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error en listener de allies:", err);
        setError("No se pudieron cargar los aliados.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);


  return { allies, loading, error };
}
