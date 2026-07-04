"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getLeadsByAlly } from "@/lib/firestore-helpers";
import type { Lead } from "@/types/models";

// ═══════════════════════════════════════════════════════
// useLeads — Hook para cargar leads según el rol del usuario
// Admin: escucha todos los leads en tiempo real (onSnapshot)
// Ally: carga solo sus leads asignados (getDocs)
// ═══════════════════════════════════════════════════════

export function useAllLeadsRealtime() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() } as Lead)
        );
        setLeads(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error en listener de leads:", err);
        setError("No se pudieron cargar los leads.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { leads, loading, error };
}

export function useAllyLeads(allyId: string | null) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!allyId) {
      setLoading(false);
      return;
    }

    getLeadsByAlly(allyId)
      .then(setLeads)
      .catch((err) => {
        console.error("Error cargando leads del aliado:", err);
        setError("No se pudieron cargar tus leads.");
      })
      .finally(() => setLoading(false));
  }, [allyId]);

  return { leads, setLeads, loading, error };
}
