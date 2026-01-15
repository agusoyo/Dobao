
import React from 'react';
import { WineTasting } from '../types';
import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

interface HomeProps {
  onNavigateBooking: () => void;
  onNavigateTastings: () => void;
  nextTasting?: WineTasting;
}

const Home: React.FC<HomeProps> = ({ onNavigateBooking, onNavigateTastings, nextTasting }) => {
  const freeSeats = nextTasting ? (nextTasting.maxCapacity - (nextTasting.currentAttendees || 0)) : 0;
  const isUrgent = freeSeats > 0 && freeSeats <= 4;

  const safeFormat = (dateStr: string, formatStr: string) => {
    try {
      const date = parseISO(dateStr);
      return isValid(date) ? format(date, formatStr, { locale: es }) : 'Próximamente';
    } catch {
      return 'Próximamente';
    }
  };

  return (
    <div className="min-h-screen flex flex-col pt-24 md:pt-0 bg-[#080808]">
      {/* Hero Central */}
      <section className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden">
        
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

          {/* Anuncio dinámico de próxima cata */}
          {nextTasting && (
            <div className="absolute bottom-10 right-10 z-20 max-w-xs w-full animate-in fade-in slide-in-from-right-10 duration-1000 delay-500">
              <div 
                onClick={(e) => { e.stopPropagation(); onNavigateTastings(); }}
                className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] shadow-2xl hover:border-[#C5A059]/50 hover:bg-black/60 transition-all cursor-pointer group/card"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#C5A059] text-[9px] font-black uppercase tracking-[0.2em]">PRÓXIMA CITA</span>
                  {isUrgent && (
                    <div className="flex items-center gap-1.5 bg-red-500/10 px-2 py-1 rounded-full border border-red-500/20">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                      <span className="text-red-500 text-[8px] font-black uppercase">Últimas plazas</span>
                    </div>
                  )}
                </div>
                <h4 className="text-white font-serif text-lg mb-1 group-hover/card:text-[#C5A059] transition-colors">{nextTasting.name}</h4>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                  {safeFormat(nextTasting.date, "EEEE d 'de' MMMM")} • {nextTasting.slot === 'MIDDAY' ? 'Comida' : 'Cena'}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest">Desde {nextTasting.pricePerPerson}€</span>
                  <div className="flex items-center gap-2 text-[#C5A059]">
                    <span className="text-[9px] font-black uppercase tracking-widest group-hover/card:mr-2 transition-all">Ver detalles</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </div>
            </div>
          )}
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
