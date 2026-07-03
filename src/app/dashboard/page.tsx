"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { signOut } from "firebase/auth";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

// Definimos la interfaz del Lead para TypeScript
interface Lead {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  interest: string;
  status: string;
  createdAt: any;
  source: string;
}

export default function DashboardPage() {
  const { user, loading } = useAuthStore();
  const router = useRouter();
  
  // Estado para los leads
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);

  useEffect(() => {
    // Si ya cargó y NO hay usuario, expulsarlo al login
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Cargar leads si hay un usuario autenticado
  useEffect(() => {
    if (user) {
      const fetchLeads = async () => {
        try {
          const leadsRef = collection(db, "leads");
          // Ordenamos por fecha de creación descendente
          const q = query(leadsRef, orderBy("createdAt", "desc"));
          const querySnapshot = await getDocs(q);
          
          const leadsData: Lead[] = [];
          querySnapshot.forEach((doc) => {
            leadsData.push({ id: doc.id, ...doc.data() } as Lead);
          });
          
          setLeads(leadsData);
        } catch (error) {
          console.error("Error obteniendo leads:", error);
        } finally {
          setLoadingLeads(false);
        }
      };

      fetchLeads();
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  // Pantalla de carga mientras Firebase verifica la sesión
  if (loading) {
    return (
      <div className="min-h-screen bg-kraken-black flex items-center justify-center">
        <div className="animate-pulse text-kraken-gold tracking-[0.2em] uppercase text-sm">
          Sincronizando con el Oráculo...
        </div>
      </div>
    );
  }

  // Si no hay usuario (está a punto de ser redirigido), no mostramos nada
  if (!user) return null;

  return (
    <div className="min-h-screen bg-kraken-black text-kraken-white p-8">
      {/* Header del Dashboard */}
      <header className="max-w-6xl mx-auto flex justify-between items-center border-b border-kraken-gray pb-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold">
            <span className="text-kraken-white">Panel </span>
            <span className="text-kraken-gold">Kraken</span>
          </h1>
          <p className="text-kraken-muted text-sm mt-1">Conectado como: {user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="border border-kraken-gray px-4 py-2 rounded-lg text-sm text-kraken-muted hover:text-kraken-white hover:border-kraken-gold transition-colors cursor-pointer"
        >
          Desconectar
        </button>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-6xl mx-auto space-y-12">
        {/* Tarjetas de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-kraken-dark border border-kraken-gray rounded-xl p-6">
            <h3 className="text-kraken-muted text-sm uppercase tracking-wider mb-2">Leads Capturados</h3>
            <p className="text-4xl font-bold text-kraken-gold">
              {loadingLeads ? "..." : leads.length}
            </p>
          </div>
          
          <div className="bg-kraken-dark border border-kraken-gray rounded-xl p-6">
            <h3 className="text-kraken-muted text-sm uppercase tracking-wider mb-2">Agentes Activos</h3>
            <p className="text-4xl font-bold text-kraken-gold">1</p>
          </div>
          
          <div className="bg-kraken-dark border border-kraken-gray rounded-xl p-6">
            <h3 className="text-kraken-muted text-sm uppercase tracking-wider mb-2">Estado del Sistema</h3>
            <p className="text-xl font-bold text-green-500">Óptimo</p>
          </div>
        </div>

        {/* Tabla de Leads */}
        <div className="bg-kraken-dark border border-kraken-gray rounded-xl overflow-hidden">
          <div className="p-6 border-b border-kraken-gray">
            <h2 className="text-xl font-bold text-kraken-white">Registro de Leads</h2>
            <p className="text-sm text-kraken-muted mt-1">Contactos potenciales capturados por el Oráculo.</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#111] border-b border-kraken-gray text-xs uppercase tracking-wider text-kraken-gold">
                  <th className="p-4 font-medium">Nombre / Empresa</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">WhatsApp</th>
                  <th className="p-4 font-medium">Módulo de Interés</th>
                  <th className="p-4 font-medium">Estado</th>
                  <th className="p-4 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-kraken-gray/50">
                {loadingLeads ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-kraken-muted">
                      Consultando registros...
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-kraken-muted">
                      Aún no hay leads capturados.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => {
                    // Formatear la fecha si existe (las fechas de Firestore vienen como Timestamp)
                    const dateStr = lead.createdAt?.toDate 
                      ? lead.createdAt.toDate().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) 
                      : 'N/A';

                    return (
                      <tr key={lead.id} className="hover:bg-[#151515] transition-colors">
                        <td className="p-4 font-medium text-kraken-white">{lead.name}</td>
                        <td className="p-4 text-kraken-muted">{lead.email}</td>
                        <td className="p-4 text-kraken-muted">{lead.whatsapp}</td>
                        <td className="p-4">
                          <span className="bg-kraken-gold/10 text-kraken-gold px-2 py-1 rounded-md text-xs border border-kraken-gold/20">
                            {lead.interest}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-kraken-white">{lead.status}</span>
                        </td>
                        <td className="p-4 text-kraken-muted">{dateStr}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
