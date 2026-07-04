"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function GatewayPage() {
  const { user, profile, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/");
      return;
    }

    if (profile) {
      if (profile.role === "admin") {
        router.push("/dashboard");
      } else if (profile.role === "ally") {
        router.push("/portal");
      } else if (profile.role === "tourist") {
        router.push("/app");
      } else {
        router.push("/");
      }
    }
  }, [user, profile, loading, router]);

  if (!loading && user && !profile) {
    return (
      <div className="min-h-screen bg-kraken-black flex flex-col items-center justify-center p-8">
        <div className="bg-kraken-dark border border-red-500/50 p-8 rounded-xl max-w-lg w-full text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Perfil no encontrado en Firestore</h2>
          <p className="text-kraken-muted mb-6">
            Iniciaste sesión correctamente con <strong className="text-white">{user.email}</strong>, pero no existe un documento en la colección <code className="text-kraken-gold bg-black px-2 py-1 rounded">allies</code> que coincida con tu UID actual.
          </p>
          <div className="bg-black p-4 rounded-lg border border-kraken-gray mb-6">
            <p className="text-sm text-kraken-muted mb-2">Tu UID exacto de Firebase Auth es:</p>
            <code className="text-xl font-mono text-kraken-gold break-all select-all">
              {user.uid}
            </code>
          </div>
          <p className="text-sm text-kraken-muted text-left mb-4">
            <strong>Instrucciones:</strong><br/>
            1. Copia el UID dorado de arriba.<br/>
            2. Ve a Firestore en Firebase Console.<br/>
            3. Borra el documento viejo en `allies`.<br/>
            4. Crea un documento nuevo usando ese UID como ID.<br/>
            5. Agrega los campos: role (admin), plan (kraken), email y isActive (true).<br/>
            6. Recarga esta página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kraken-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-kraken-gold border-t-transparent rounded-full animate-spin" />
        <p className="animate-pulse text-kraken-gold tracking-[0.2em] uppercase text-sm">
          Enrutando al sector correspondiente...
        </p>
      </div>
    </div>
  );
}
