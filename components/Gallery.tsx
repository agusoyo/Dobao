
import React from 'react';

/**
 * 🛠️ CONFIGURACIÓN DE TUS FOTOS:
 * 1. Renombra tus fotos en tu PC como: foto1.jpg, foto2.jpg, etc.
 * 2. Súbelas a tu repositorio "Dobao" en GitHub.
 * 3. Pulsa el botón verde "Commit changes" en GitHub para guardar.
 */

// Cambia esta URL si cambias el nombre de tu usuario o repositorio
const GITHUB_BASE_URL = "https://raw.githubusercontent.com/agusoyo/Dobao/main/";

const IMAGES = [
  {
    fileName: "IMG_4292.jpeg", // Tu primera foto confirmada
    title: "Zona Multimedia",
    desc: "Pantalla de gran formato y sofás de piel para una experiencia de cine privada."
  },
  {
    fileName: "foto2.jpg", 
    title: "La Mesa Imperial",
    desc: "Iluminación de diseño y madera noble para banquetes inolvidables."
  },
  {
    fileName: "foto3.jpg",
    title: "La Vinoteca",
    desc: "Nuestra cava climatizada con una selección exclusiva para nuestros socios."
  },
  {
    fileName: "foto4.jpg",
    title: "Cocina de Autor",
    desc: "Equipamiento profesional de alta gama en un entorno verde esmeralda."
  },
  {
    fileName: "foto5.jpg",
    title: "Barra y Servicio",
    desc: "Zona de barra completa con tirador de cerveza y servicio de cafetería."
  },
  {
    fileName: "foto6.jpg",
    title: "Detalles Gourmet",
    desc: "Cristalería y menaje seleccionados para elevar cada degustación."
  },
  {
    fileName: "foto7.jpg",
    title: "Rincón de Lectura",
    desc: "Espacios de confort diseñados para la sobremesa y la confidencia."
  },
  {
    fileName: "foto8.jpg",
    title: "Plano Abierto",
    desc: "Arquitectura diáfana que integra cocina y comedor en un solo ambiente."
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
          <div key={idx} className="group relative overflow-hidden rounded-3xl bg-[#141414] aspect-[4/5] border border-white/5">
            <img 
              src={`${GITHUB_BASE_URL}${img.fileName}`} 
              alt={img.title}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 brightness-[0.6] group-hover:brightness-100"
              onLoad={(e) => (e.currentTarget.style.opacity = "1")}
              onError={(e) => {
                // Si la foto no carga, ponemos una elegante de reserva de Unsplash
                const target = e.target as HTMLImageElement;
                target.src = "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1000";
                target.style.opacity = "0.2";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-40 transition-opacity"></div>
            <div className="absolute bottom-0 left-0 p-6 md:p-8 transform translate-y-2 md:translate-y-4 group-hover:translate-y-0 transition-transform duration-500 w-full">
              <h4 className="text-[#C5A059] font-serif text-xl md:text-2xl mb-2">{img.title}</h4>
              <p className="text-slate-300 text-xs md:text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                {img.desc}
              </p>
            </div>
            {/* Indicador de carga si la imagen no ha llegado de GitHub */}
            <div className="absolute top-4 right-4 text-[8px] text-white/20 uppercase tracking-widest font-bold">
              Ref: {img.fileName}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 md:mt-20 text-center bg-gradient-to-b from-[#141414] to-black border border-white/5 rounded-[2rem] md:rounded-[3rem] p-8 md:p-16">
        <h3 className="text-xl md:text-3xl font-serif text-white mb-6 italic">La realidad supera a la imagen</h3>
        <p className="text-slate-400 mb-10 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          Cada rincón de Dobao Gourmet ha sido diseñado para ofrecer la máxima privacidad y confort. 
          Realice su solicitud hoy mismo y garantice su fecha.
        </p>
        <button 
          onClick={onBack}
          className="bg-[#C5A059] text-black px-10 md:px-16 py-4 md:py-6 rounded-full font-bold uppercase tracking-[0.2em] hover:bg-white transition-all transform hover:scale-105 text-[10px] md:text-xs shadow-[0_20px_50px_rgba(197,160,89,0.2)]"
        >
          Solicitar Reserva Ahora
        </button>
      </div>
    </div>
  );
};

export default Gallery;
