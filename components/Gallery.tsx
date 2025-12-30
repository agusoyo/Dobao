
import React from 'react';

// INSTRUCCIONES: Reemplaza los enlaces de "url" por los links directos de tus fotos reales.
const IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=2070", // FOTO 1: Proyector
    title: "Cine y Presentaciones",
    desc: "Pantalla de gran formato y sonido envolvente para eventos corporativos o partidos."
  },
  {
    url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070", // FOTO 2: Mesa e iluminación
    title: "La Mesa Imperial",
    desc: "Mesa artesanal de madera maciza iluminada por nuestras icónicas lámparas tejidas."
  },
  {
    url: "https://images.unsplash.com/photo-1506377247377-2a5b3b0ca7df?q=80&w=2070", // FOTO 3: Cava detalle
    title: "Selección de Bodega",
    desc: "Exhibición de vinos premium con iluminación indirecta para una atmósfera sofisticada."
  },
  {
    url: "https://images.unsplash.com/photo-1556911220-e15021a81b84?q=80&w=2070", // FOTO 4: Cocina verde
    title: "Cocina de Autor",
    desc: "Equipamiento profesional integrado en un diseño verde bosque minimalista."
  },
  {
    url: "https://images.unsplash.com/photo-1538333302904-2f94a3bc9014?q=80&w=2070", // FOTO 5: Vista con grifo
    title: "Barra Privada",
    desc: "Disponemos de tirador profesional de cerveza y zona de servicio independiente."
  },
  {
    url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070", // FOTO 6: Detalle mesa
    title: "Detalles que Importan",
    desc: "Menaje de alta calidad y cristalería fina para elevar su experiencia gastronómica."
  },
  {
    url: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?q=80&w=2070", // FOTO 7: Sillas cuero
    title: "Confort Premium",
    desc: "Sillas ergonómicas de cuero diseñadas para largas sobremesas en la mejor compañía."
  },
  {
    url: "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?q=80&w=2070", // FOTO 8: Cocina/Mesa
    title: "Espacio Diáfano",
    desc: "Un diseño abierto que conecta la cocina con los comensales, fomentando el show-cooking."
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
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white mb-2 md:mb-4">Galería Real</h2>
          <p className="text-[#C5A059] italic font-serif text-base md:text-lg">Explora cada rincón de Dobao Gourmet en Vigo</p>
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
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity"></div>
            <div className="absolute bottom-0 left-0 p-6 md:p-8 transform translate-y-2 md:translate-y-4 group-hover:translate-y-0 transition-transform duration-500 w-full">
              <h4 className="text-[#C5A059] font-serif text-xl md:text-2xl mb-2">{img.title}</h4>
              <p className="text-slate-300 text-xs md:text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100 pr-8">
                {img.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 md:mt-20 text-center bg-[#141414] border border-white/5 rounded-[2rem] md:rounded-[3rem] p-8 md:p-16">
        <h3 className="text-xl md:text-3xl font-serif text-white mb-6">¿Desea ver el local en persona?</h3>
        <p className="text-slate-400 mb-10 max-w-2xl mx-auto text-sm md:text-base">
          Nada supera la experiencia de estar allí. Reserve ahora su turno y disfrute de toda la exclusividad de nuestro Txoko Gourmet.
        </p>
        <button 
          onClick={onBack}
          className="bg-[#C5A059] text-black px-8 md:px-12 py-4 md:py-5 rounded-full font-bold uppercase tracking-widest hover:bg-white transition-all transform hover:scale-105 text-[10px] md:text-xs"
        >
          Solicitar Reserva
        </button>
      </div>
    </div>
  );
};

export default Gallery;
