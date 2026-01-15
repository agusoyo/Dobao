
import React from 'react';

interface HomeProps {
  onNavigateBooking: () => void;
  onNavigateTastings: () => void;
}

const Home: React.FC<HomeProps> = ({ onNavigateBooking, onNavigateTastings }) => {
  return (
    <div className="min-h-screen flex flex-col pt-24 md:pt-0 bg-[#080808]">
      {/* Hero Central */}
      <section className="flex-1 flex flex-col lg:flex-row h-full">
        
        {/* Lado Izquierdo: Reserva de Local */}
        <div 
          onClick={onNavigateBooking}
          className="group relative flex-1 min-h-[50vh] lg:min-h-screen flex items-center justify-center overflow-hidden cursor-pointer border-b lg:border-b-0 lg:border-r border-white/10"
        >
          <img 
            src="https://raw.githubusercontent.com/agusoyo/Dobao/main/IMG_4292.jpeg" 
            alt="Reserva Local" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110 brightness-[0.7] group-hover:brightness-[0.9]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
          
          <div className="relative z-10 text-center px-8 transition-transform duration-700 group-hover:-translate-y-4">
            <span className="text-[#C5A059] font-bold uppercase tracking-[0.4em] text-[10px] md:text-xs mb-4 block drop-shadow-lg italic">Arquitectura & Gastronomía</span>
            <h2 className="text-4xl md:text-7xl font-serif text-white mb-6 drop-shadow-2xl">El Arte de la <span className="text-[#C5A059] italic">Mesa</span></h2>
            <p className="text-slate-100 max-w-md mx-auto mb-10 text-sm md:text-base font-medium leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-700 drop-shadow-md">
              Un santuario diáfano donde la cocina profesional se convierte en lienzo para tus mejores momentos privados y eventos corporativos.
            </p>
            <div className="inline-block border-2 border-[#C5A059] text-[#C5A059] px-10 py-4 rounded-full font-bold uppercase tracking-widest text-[10px] md:text-xs transition-all group-hover:bg-[#C5A059] group-hover:text-black shadow-lg">
              Reservar Espacio
            </div>
          </div>
        </div>

        {/* Lado Derecho: Catas de Vino */}
        <div 
          onClick={onNavigateTastings}
          className="group relative flex-1 min-h-[50vh] lg:min-h-screen flex items-center justify-center overflow-hidden cursor-pointer"
        >
          <img 
            src="https://raw.githubusercontent.com/agusoyo/Dobao/main/IMG_4293.jpeg" 
            alt="Catas de Vino" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110 brightness-[0.7] group-hover:brightness-[0.9]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
          
          <div className="relative z-10 text-center px-8 transition-transform duration-700 group-hover:-translate-y-4">
            <span className="text-[#C5A059] font-bold uppercase tracking-[0.4em] text-[10px] md:text-xs mb-4 block drop-shadow-lg italic">Enología & Sabor</span>
            <h2 className="text-4xl md:text-7xl font-serif text-white mb-6 drop-shadow-2xl">El Arte del <span className="text-[#C5A059] italic">Vino</span></h2>
            <p className="text-slate-100 max-w-md mx-auto mb-10 text-sm md:text-base font-medium leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-700 drop-shadow-md">
              Sesiones guiadas donde cada etiqueta cuenta una historia y cada brindis es una pincelada de cultura vinícola en el paladar.
            </p>
            <div className="inline-block border-2 border-[#C5A059] text-[#C5A059] px-10 py-4 rounded-full font-bold uppercase tracking-widest text-[10px] md:text-xs transition-all group-hover:bg-[#C5A059] group-hover:text-black shadow-lg">
              Experiencias Gourmet
            </div>
          </div>
        </div>
      </section>

      {/* Frase de Enlace con el Arte */}
      <section className="bg-[#0a0a0a] py-20 border-y border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-[#C5A059] to-transparent opacity-50"></div>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-[#C5A059] font-serif text-2xl md:text-4xl italic leading-relaxed">
            "Donde la gastronomía se eleva a la categoría de arte y cada reserva es el inicio de una obra maestra inolvidable."
          </h3>
          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-white/10"></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Dobao Gourmet Manifesto</span>
            <div className="h-px w-12 bg-white/10"></div>
          </div>
        </div>
      </section>

      {/* Footer Minimalista Home */}
      <footer className="bg-black py-10 text-center">
        <p className="text-slate-600 font-bold uppercase tracking-[0.2em] text-[9px]">Dobao Gourmet © 2025 | Vigo, España</p>
      </footer>
    </div>
  );
};

export default Home;
