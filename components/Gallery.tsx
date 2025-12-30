
import React from 'react';

const IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1550966841-3ee3ad359051?q=80&w=2070&auto=format&fit=crop",
    title: "El Gran Comedor",
    desc: "Mesa imperial tallada en madera noble con capacidad para 35 comensales."
  },
  {
    url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=2070&auto=format&fit=crop",
    title: "La Vinoteca",
    desc: "Nuestra cava privada con selección de Denominaciones de Origen gallegas y nacionales."
  },
  {
    url: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070&auto=format&fit=crop",
    title: "Cocina de Autor",
    desc: "Equipamiento profesional de última generación para chefs y aficionados."
  },
  {
    url: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=2069&auto=format&fit=crop",
    title: "Zona Lounge",
    desc: "Ambiente relajado para aperitivos y sobremesas inolvidables."
  },
  {
    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop",
    title: "Espacio Corporativo",
    desc: "Tecnología multimedia integrada para presentaciones y eventos de empresa en Vigo."
  },
  {
    url: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop",
    title: "Detalles que Enamoran",
    desc: "Cristalería de cristal fino y cubertería de diseño para una experiencia gourmet completa."
  }
];

interface GalleryProps {
  onBack: () => void;
}

const Gallery: React.FC<GalleryProps> = ({ onBack }) => {
  return (
    <div className="pt-28 md:pt-40 pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 md:mb-16 gap-6">
        <div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white mb-2 md:mb-4">El Espacio</h2>
          <p className="text-[#C5A059] italic font-serif text-base md:text-lg">Un refugio gastronómico en el corazón de Vigo</p>
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
          <div key={idx} className="group relative overflow-hidden rounded-3xl bg-[#141414] aspect-[4/5]">
            <img 
              src={img.url} 
              alt={img.title}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 brightness-[0.7] group-hover:brightness-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
            <div className="absolute bottom-0 left-0 p-6 md:p-8 transform translate-y-2 md:translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <h4 className="text-[#C5A059] font-serif text-xl md:text-2xl mb-2">{img.title}</h4>
              <p className="text-slate-300 text-xs md:text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                {img.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 md:mt-20 text-center bg-[#141414] border border-white/5 rounded-[2rem] md:rounded-[3rem] p-8 md:p-16">
        <h3 className="text-xl md:text-3xl font-serif text-white mb-6">¿Desea conocerlo en persona?</h3>
        <button 
          onClick={onBack}
          className="bg-[#C5A059] text-black px-8 md:px-12 py-4 md:py-5 rounded-full font-bold uppercase tracking-widest hover:bg-white transition-all transform hover:scale-105 text-[10px] md:text-xs"
        >
          Solicitar Visita o Reserva
        </button>
      </div>
    </div>
  );
};

export default Gallery;
