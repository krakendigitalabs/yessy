"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PublicLoginPage() {
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
      router.push("/gateway");
    } catch (err: any) {
      console.error(err);
      setError("Credenciales incorrectas.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/gateway");
    } catch (err: any) {
      console.error(err);
      setError("Error al iniciar sesión con Google.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-kraken-black flex flex-col items-center justify-center p-8 relative overflow-hidden">
      
      {/* Botón Volver al inicio */}
      <div className="absolute top-6 left-8 z-50">
        <Link 
          href="/" 
          className="text-kraken-muted hover:text-kraken-white text-sm font-medium tracking-wider uppercase transition-colors flex items-center gap-2"
        >
          ← Volver
        </Link>
      </div>

      {/* Efecto de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-[#FFDF00]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="z-10 w-full max-w-md bg-kraken-dark border border-kraken-gray/30 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-kraken-white">
            Acceso al Sistema
          </h1>
          <p className="text-kraken-muted text-sm">Aliados y Turistas</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-wider text-kraken-muted mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-kraken-black border border-kraken-gray rounded-lg px-4 py-3 text-kraken-white focus:outline-none focus:border-[#FFDF00] transition-colors"
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-kraken-muted mb-1">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-kraken-black border border-kraken-gray rounded-lg px-4 py-3 text-kraken-white focus:outline-none focus:border-[#FFDF00] transition-colors"
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
            className="w-full bg-kraken-white text-kraken-black font-bold uppercase tracking-wider py-3 rounded-lg hover:bg-gray-200 transition-colors flex justify-center items-center cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Ingresando..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-kraken-gray"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-kraken-dark text-kraken-muted">O continuar con</span>
            </div>
          </div>
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full mt-6 bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors flex justify-center items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>
        </div>
      </div>
    </main>
  );
}
