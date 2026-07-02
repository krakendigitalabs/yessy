export default function Home() {
  return (
    <main className="min-h-screen bg-kraken-black flex flex-col items-center justify-center p-8 relative overflow-hidden">
      
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
          <button className="bg-transparent border-2 border-kraken-gold text-kraken-gold px-8 py-3 rounded-full font-bold uppercase tracking-wider hover:bg-kraken-gold hover:text-kraken-black transition-colors duration-300 cursor-pointer">
            Iniciar Secuencia
          </button>
        </div>

      </div>
    </main>
  );
}
