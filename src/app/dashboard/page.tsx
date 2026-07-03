"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function DashboardPage() {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Si ya cargó y NO hay usuario, expulsarlo al login
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

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

      {/* Contenido Principal (Placeholder para futuros datos) */}
      <main className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tarjeta de Resumen 1 */}
          <div className="bg-kraken-dark border border-kraken-gray rounded-xl p-6">
            <h3 className="text-kraken-muted text-sm uppercase tracking-wider mb-2">Leads Capturados</h3>
            <p className="text-4xl font-bold text-kraken-gold">0</p>
          </div>
          
          {/* Tarjeta de Resumen 2 */}
          <div className="bg-kraken-dark border border-kraken-gray rounded-xl p-6">
            <h3 className="text-kraken-muted text-sm uppercase tracking-wider mb-2">Agentes Activos</h3>
            <p className="text-4xl font-bold text-kraken-gold">1</p>
          </div>
          
          {/* Tarjeta de Resumen 3 */}
          <div className="bg-kraken-dark border border-kraken-gray rounded-xl p-6">
            <h3 className="text-kraken-muted text-sm uppercase tracking-wider mb-2">Estado del Sistema</h3>
            <p className="text-xl font-bold text-green-500">Óptimo</p>
          </div>
        </div>
      </main>
    </div>
  );
}
