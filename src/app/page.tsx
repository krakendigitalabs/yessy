"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    interest: "Turismo AI Broker",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Guardar en la colección 'leads'
      await addDoc(collection(db, "leads"), {
        ...formData,
        createdAt: serverTimestamp(),
        source: "Landing Page Principal",
        status: "Nuevo",
      });

      setIsSuccess(true);
      // Limpiar formulario después del éxito (opcional, ya que mostramos mensaje de éxito)
      setFormData({ name: "", email: "", whatsapp: "", interest: "Turismo AI Broker" });
      
      // Cerrar modal automáticamente después de 3 segundos
      setTimeout(() => {
        setIsModalOpen(false);
        setIsSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error("Error al registrar lead:", error);
      alert("Error de conexión con el Oráculo. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-kraken-black flex flex-col items-center justify-center p-8 relative overflow-hidden">
      
      {/* Botón de Login (Escondido elegantemente en la esquina) */}
      <div className="absolute top-6 right-8 z-50">
        <Link 
          href="/login" 
          className="text-kraken-muted hover:text-kraken-white text-sm font-medium tracking-wider uppercase transition-colors"
        >
          Acceso Usuarios
        </Link>
      </div>

      {/* Efecto de luz dorada sutil en el fondo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-kraken-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="z-10 text-center max-w-4xl w-full">
        {/* Título Principal */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
          <span className="text-kraken-white">Yessy </span>
          <span className="bg-linear-to-r from-kraken-gold via-[#FFDF00] to-kraken-gold bg-clip-text text-transparent">Kraken</span>
          <br />
          <span className="text-kraken-white">Digital Labs</span>
        </h1>

        {/* Subtítulo */}
        <p className="text-kraken-gold tracking-[0.2em] uppercase text-sm md:text-base font-semibold mb-8">
          Oráculo de Automatización & Riqueza
        </p>

        {/* Descripción de la Oferta */}
        <p className="text-kraken-muted text-lg md:text-xl leading-relaxed mb-12 max-w-2xl mx-auto">
          Plataforma premium de automatización. Desplegamos Agentes de IA y sistemas SaaS que transforman la operación de negocios locales en ecosistemas altamente rentables 24/7.
        </p>

        {/* Los 3 Módulos (Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
          
          {/* Tarjeta 1 */}
          <div className="bg-kraken-dark border border-kraken-gray/50 p-8 rounded-xl hover:border-kraken-gold/50 hover:shadow-gold-glow transition-all duration-300">
            <h3 className="text-kraken-white font-bold text-xl mb-3">Turismo AI Broker</h3>
            <p className="text-kraken-muted text-sm leading-relaxed">
              Agente inteligente que cierra ventas de paquetes turísticos (Comuna 13, Necoclí) y procesa pagos directos.
            </p>
          </div>

          {/* Tarjeta 2 */}
          <div className="bg-kraken-dark border border-kraken-gray/50 p-8 rounded-xl hover:border-kraken-gold/50 hover:shadow-gold-glow transition-all duration-300">
            <h3 className="text-kraken-white font-bold text-xl mb-3">Dev-Factory SaaS</h3>
            <p className="text-kraken-muted text-sm leading-relaxed">
              Sistemas de gestión (PMS, Restaurantes) desplegados bajo demanda con modelo de suscripción MRR.
            </p>
          </div>

          {/* Tarjeta 3 */}
          <div className="bg-kraken-dark border border-kraken-gray/50 p-8 rounded-xl hover:border-kraken-gold/50 hover:shadow-gold-glow transition-all duration-300">
            <h3 className="text-kraken-white font-bold text-xl mb-3">Wealth Oracle</h3>
            <p className="text-kraken-muted text-sm leading-relaxed">
              Auditoría tecnológica premium. Detectamos fugas operativas e implementamos soluciones de alto rendimiento.
            </p>
          </div>

        </div>

        {/* Botón de Acción Principal */}
        <div className="mt-16">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-transparent border-2 border-kraken-gold text-kraken-gold px-8 py-3 rounded-full font-bold uppercase tracking-wider hover:bg-kraken-gold hover:text-kraken-black transition-colors duration-300 cursor-pointer"
          >
            Iniciar Secuencia
          </button>
        </div>

      </div>

      {/* MODAL DE CAPTURA DE LEADS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity">
          <div className="bg-kraken-dark border border-kraken-gold/30 rounded-2xl p-8 max-w-md w-full shadow-gold-glow relative">
            
            {/* Botón Cerrar */}
            <button 
              onClick={() => !isSubmitting && setIsModalOpen(false)}
              className="absolute top-4 right-4 text-kraken-muted hover:text-kraken-white transition-colors"
              disabled={isSubmitting}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {isSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto bg-kraken-gold/20 rounded-full flex items-center justify-center mb-4 border border-kraken-gold/50">
                  <svg className="w-8 h-8 text-kraken-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="text-2xl font-bold text-kraken-white mb-2">Secuencia Iniciada</h3>
                <p className="text-kraken-muted">El Oráculo ha registrado tu solicitud. Nos pondremos en contacto pronto.</p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-kraken-white mb-2 text-center">Acceso al Sistema</h2>
                <p className="text-kraken-muted text-sm text-center mb-6">Ingresa tus datos para analizar el rendimiento de tu ecosistema.</p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-kraken-gold mb-1">Nombre / Empresa</label>
                    <input 
                      type="text" 
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-kraken-black border border-kraken-gray rounded-lg px-4 py-2.5 text-kraken-white focus:outline-none focus:border-kraken-gold transition-colors"
                      placeholder="Ej. Industrias Wayne"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-kraken-gold mb-1">Email</label>
                    <input 
                      type="email" 
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-kraken-black border border-kraken-gray rounded-lg px-4 py-2.5 text-kraken-white focus:outline-none focus:border-kraken-gold transition-colors"
                      placeholder="ejemplo@correo.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-kraken-gold mb-1">WhatsApp</label>
                    <input 
                      type="tel" 
                      name="whatsapp"
                      required
                      value={formData.whatsapp}
                      onChange={handleInputChange}
                      className="w-full bg-kraken-black border border-kraken-gray rounded-lg px-4 py-2.5 text-kraken-white focus:outline-none focus:border-kraken-gold transition-colors"
                      placeholder="+57 300 000 0000"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-kraken-gold mb-1">Módulo de Interés</label>
                    <select 
                      name="interest"
                      value={formData.interest}
                      onChange={handleInputChange}
                      className="w-full bg-kraken-black border border-kraken-gray rounded-lg px-4 py-2.5 text-kraken-white focus:outline-none focus:border-kraken-gold transition-colors appearance-none"
                    >
                      <option value="Turismo AI Broker">Turismo AI Broker</option>
                      <option value="Dev-Factory SaaS">Dev-Factory SaaS</option>
                      <option value="Wealth Oracle">Wealth Oracle</option>
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full mt-6 bg-kraken-gold text-kraken-black font-bold uppercase tracking-wider py-3 rounded-lg hover:bg-kraken-goldLight transition-colors flex justify-center items-center cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-kraken-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Procesando...
                      </span>
                    ) : "Conectar al Oráculo"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

    </main>
  );
}
