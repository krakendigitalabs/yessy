"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError("Credenciales incorrectas o acceso denegado por el Oráculo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-kraken-black flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Efecto de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-kraken-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="z-10 w-full max-w-md bg-kraken-dark border border-kraken-gold/30 rounded-2xl p-8 shadow-gold-glow">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-kraken-white">Acceso al </span>
            <span className="text-kraken-gold">Oráculo</span>
          </h1>
          <p className="text-kraken-muted text-sm">Ingresa tus credenciales de administrador</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-wider text-kraken-gold mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-kraken-black border border-kraken-gray rounded-lg px-4 py-3 text-kraken-white focus:outline-none focus:border-kraken-gold transition-colors"
              placeholder="admin@kraken.com"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-kraken-gold mb-1">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-kraken-black border border-kraken-gray rounded-lg px-4 py-3 text-kraken-white focus:outline-none focus:border-kraken-gold transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-kraken-gold text-kraken-black font-bold uppercase tracking-wider py-3 rounded-lg hover:bg-kraken-goldLight transition-colors flex justify-center items-center cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Verificando..." : "Entrar al Sistema"}
          </button>
        </form>
      </div>
    </main>
  );
}
