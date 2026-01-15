
import React, { useState, useEffect, useCallback } from 'react';

const GITHUB_BASE_URL = "https://raw.githubusercontent.com/agusoyo/Dobao/main/";

const IMAGES = [
  {
    fileName: "Escaparate Dobao.jpg", 
    title: "Nuestro Esparate",
    desc: "El Arte Forma parte de nuestro ADN ."
  },
  {
    fileName: "IMG_4293.jpeg",
    title: "La Vinoteca",
    desc: "Nuestra cava climatizada con una selección exclusiva para nuestros socios."
  },
  {
    fileName: "IMG_4297.jpeg",
    title: "Zona Multimedia",
    desc: "Pantalla de gran formato y sofás de piel para una experiencia de cine privada."
  },
  {
    fileName: "IMG_4298.jpeg",
    title: "Plano Abierto",
    desc: "Arquitectura diáfana que integra cocina y comedor en un solo ambiente."
  },
  {
    fileName: "IMG_4296.jpeg",
    title: "Barra y Servicio",
    desc: "Zona de barra completa con tirador de cerveza y servicio de cafetería."
  },
  {
    fileName: "IMG_4294.jpeg",
    title: "Cocina de Autor",
    desc: "Equipamiento profesional de alta gama para las mejores preparaciones."
  }
];

interface GalleryProps {
  onBack: () => void;
}

const Gallery: React.FC<GalleryProps> = ({ onBack }) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const nextImage = useCallback(() => {
    if (selectedIdx === null) return;
    setSelectedIdx((selectedIdx + 1) % IMAGES.length);
  }, [selectedIdx]);

  const prevImage = useCallback(() => {
    if (selectedIdx === null) return;
    setSelectedIdx((selectedIdx - 1 + IMAGES.length) % IMAGES.length);
  }, [selectedIdx]);

  const closeLightbox = () => setSelectedIdx(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIdx === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIdx, nextImage, prevImage]);

  return (
    <div className="pt-28 md:pt-40 pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Lightbox Overlay */}
      {selectedIdx !== null && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center animate-in fade-in duration-300">
          {/* Close button */}
          <button 
            onClick={closeLightbox}
            className="absolute top-6 right-6 md:top-10 md:right-10 z-[210] text-white/50 hover:text-[#C5A059] transition-colors p-4"
          >
            <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation Controls */}
          <button 
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-4 md:left-10 z-[210] text-white/30 hover:text-[#C5A059] transition-all p-4 hidden md:block"
          >
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-4 md:right-10 z-[210] text-white/30 hover:text-[#C5A059] transition-all p-4 hidden md:block"
          >
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Image Container */}
          <div className="relative max-w-[95vw] max-h-[80vh] flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img 
              src={`${GITHUB_BASE_URL}${IMAGES[selectedIdx].fileName}`} 
              alt={IMAGES[selectedIdx].title}
              className="max-w-full max-h-[70vh] object-contain shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10 rounded-lg animate-in zoom-in-95 duration-500"
            />
            
            <div className="mt-8 text-center max-w-2xl px-6 animate-in slide-in-from-bottom-4 duration-700">
              <h4 className="text-[#C5A059] font-serif text-2xl md:text-4xl mb-3">{IMAGES[selectedIdx].title}</h4>
              <p className="text-white/80 text-sm md:text-xl font-light leading-relaxed">
                {IMAGES[selectedIdx].desc}
              </p>
              <div className="mt-6 flex justify-center gap-2">
                {IMAGES.map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === selectedIdx ? 'bg-[#C5A059] w-8' : 'bg-white/10'}`} />
                ))}
              </div>
            </div>
          </div>

          {/* Mobile swipe hint or simple controls */}
          <div className="md:hidden fixed bottom-10 flex gap-20">
             <button onClick={prevImage} className="text-white/50 bg-white/5 p-4 rounded-full">Anterior</button>
             <button onClick={nextImage} className="text-white/50 bg-white/5 p-4 rounded-full">Siguiente</button>
          </div>
        </div>
      )}

      {/* Main Gallery View */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 md:mb-16 gap-6">
        <div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white mb-2 md:mb-4">Dobao Gourmet</h2>
          <p className="text-[#C5A059] italic font-serif text-base md:text-lg">Un recorrido visual por nuestra exclusividad</p>
        </div>
        <button 
          onClick={onBack}
          className="w-fit bg-white/5 border border-white/10 text-white px-6 md:px-8 py-3 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest hover:bg-[#C5A059] hover:text-black transition-all"
        >
          Volver a Reservas
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {IMAGES.map((img, idx) => (
          <div 
            key={idx} 
            onClick={() => setSelectedIdx(idx)}
            className="group relative overflow-hidden rounded-3xl bg-[#141414] aspect-[4/5] border border-white/5 cursor-pointer"
          >
            <img 
              src={`${GITHUB_BASE_URL}${img.fileName}`} 
              alt={img.title}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 brightness-[0.8] group-hover:brightness-100"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1000";
                target.style.opacity = "0.3";
              }}
            />
            
            {/* Hover Indicator */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 bg-[#C5A059] p-4 rounded-full text-black shadow-2xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity"></div>
            
            <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
              <h4 className="text-[#C5A059] font-serif text-xl md:text-2xl mb-1 md:mb-2 drop-shadow-md">{img.title}</h4>
              <p className="text-white/60 text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                Ver detalle
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 md:mt-20 text-center bg-gradient-to-b from-[#141414] to-black border border-white/5 rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 shadow-2xl">
        <h3 className="text-xl md:text-3xl font-serif text-white mb-6 italic">La realidad supera a la imagen</h3>
        <p className="text-slate-400 mb-10 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          Cada rincón de Dobao Gourmet ha sido diseñado para ofrecer la máxima privacidad y confort. 
          Realice su solicitud hoy mismo y garantice su fecha.
        </p>
        <button 
          onClick={onBack}
          className="bg-[#C5A059] text-black px-10 md:px-16 py-4 md:py-6 rounded-full font-bold uppercase tracking-[0.2em] hover:bg-white transition-all transform hover:scale-105 text-[10px] md:text-xs shadow-[0_20px_50px_rgba(197,160,89,0.3)]"
        >
          Solicitar Reserva Ahora
        </button>
      </div>
    </div>
  );
};

export default Gallery;
