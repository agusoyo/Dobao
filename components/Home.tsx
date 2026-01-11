
import React from 'react';

interface HomeProps {
  onNavigateBooking: () => void;
  onNavigateTastings: () => void;
}

const Home: React.FC<HomeProps> = ({ onNavigateBooking, onNavigateTastings }) => {
  return (
    <div className="min-h-screen flex flex-col pt-24 md:pt-0">
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
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110 brightness-[0.75] group-hover:brightness-[0.95]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
          
          <div className="relative z-10 text-center px-8 transition-transform duration-700 group-hover:-translate-y-4">
            <span className="text-[#C5A059] font-bold uppercase tracking-[0.4em] text-[10px] md:text-xs mb-4 block drop-shadow-lg">Privacidad & Espacio</span>
            <h2 className="text-4xl md:text-7xl font-serif text-white mb-6 drop-shadow-2xl">Reserva el <span className="text-[#C5A059] italic">Local</span></h2>
            <p className="text-slate-100 max-w-md mx-auto mb-10 text-sm md:text-base font-medium leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-700 drop-shadow-md">
              Un santuario gastronómico diáfano con cocina profesional, zona multimedia y vinoteca. Ideal para reuniones corporativas, banquetes privados o celebraciones íntimas.
            </p>
            <div className="inline-block border-2 border-[#C5A059] text-[#C5A059] px-10 py-4 rounded-full font-bold uppercase tracking-widest text-[10px] md:text-xs transition-all group-hover:bg-[#C5A059] group-hover:text-black shadow-lg">
              Ver Disponibilidad
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
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110 brightness-[0.75] group-hover:brightness-[0.95]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
          
          <div className="relative z-10 text-center px-8 transition-transform duration-700 group-hover:-translate-y-4">
            <span className="text-[#C5A059] font-bold uppercase tracking-[0.4em] text-[10px] md:text-xs mb-4 block drop-shadow-lg">Experiencias & Cultura</span>
            <h2 className="text-4xl md:text-7xl font-serif text-white mb-6 drop-shadow-2xl">Catas de <span className="text-[#C5A059] italic">Vinos</span></h2>
            <p className="text-slate-100 max-w-md mx-auto mb-10 text-sm md:text-base font-medium leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-700 drop-shadow-md">
              Sesiones guiadas por sumilleres expertos. Descubre etiquetas exclusivas de bodegas boutique en un ambiente diseñado para despertar los sentidos.
            </p>
            <div className="inline-block border-2 border-[#C5A059] text-[#C5A059] px-10 py-4 rounded-full font-bold uppercase tracking-widest text-[10px] md:text-xs transition-all group-hover:bg-[#C5A059] group-hover:text-black shadow-lg">
              Próximos Eventos
            </div>
          </div>
        </div>

      </section>

      {/* Footer Minimalista Home */}
      <footer className="bg-black py-10 border-t border-white/5 text-center">
        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[9px]">Dobao Gourmet © 2025 | Vigo, España</p>
      </footer>
    </div>
  );
};

export default Home;
