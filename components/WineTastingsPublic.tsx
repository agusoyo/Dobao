
import React, { useState, useEffect } from 'react';
import { WineTasting, ReservationSlot } from '../types';
import { supabase } from '../services/supabaseClient';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

interface WineTastingsPublicProps {
  externalTastings?: WineTasting[];
}

const WineTastingsPublic: React.FC<WineTastingsPublicProps> = ({ externalTastings }) => {
  const [localTastings, setLocalTastings] = useState<WineTasting[]>([]);
  const [loading, setLoading] = useState(!externalTastings);
  const [selectedTasting, setSelectedTasting] = useState<WineTasting | null>(null);
  const [bookingSeats, setBookingSeats] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  const safeFormat = (date: string | Date | undefined, formatStr: string) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return isValid(d) ? format(d, formatStr, { locale: es }) : 'N/A';
  };

  useEffect(() => {
    if (externalTastings) {
      setLocalTastings(externalTastings);
      setLoading(false);
    } else {
      fetchTastings();
    }
  }, [externalTastings]);

  const fetchTastings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('wine_tastings')
      .select('*')
      .gte('date', format(new Date(), 'yyyy-MM-dd'))
      .order('date', { ascending: true });

    if (error) {
      console.error('Error cargando catas públicas:', error);
    } else if (data) {
      setLocalTastings(data.map(t => ({
        id: t.id,
        date: t.date,
        slot: t.slot as ReservationSlot,
        name: t.name,
        maxCapacity: t.max_capacity,
        pricePerPerson: t.price_per_person,
        description: t.description
      })));
    }
    setLoading(false);
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTasting) return;
    setIsSubmitting(true);
    
    const { error } = await supabase
      .from('tasting_attendees')
      .insert([{
        tasting_id: selectedTasting.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        seats: bookingSeats
      }]);

    if (error) {
      console.error("Error al reservar plazas:", error);
      alert("Error al reservar: " + error.message);
    } else {
      alert("¡Reserva confirmada! Te esperamos en Dobao Gourmet.");
      setSelectedTasting(null);
      setFormData({ name: '', email: '', phone: '' });
    }
    setIsSubmitting(false);
  };

  if (loading) return <div className="py-40 text-center text-[#C5A059] font-serif italic text-2xl">Abriendo la bodega...</div>;

  return (
    <div className="flex flex-col">
      <section className="relative min-h-[60vh] w-full flex items-center justify-center overflow-hidden pt-32">
        <img 
          src="https://raw.githubusercontent.com/agusoyo/Dobao/main/IMG_4293.jpeg" 
          alt="Vinoteca Dobao" 
          className="absolute inset-0 w-full h-full object-cover brightness-[1.1]" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#080808]"></div>
        <div className="relative z-10 text-center px-6 max-w-5xl">
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-serif text-white mb-6 drop-shadow-2xl">Experiencias <span className="text-[#C5A059] italic">Gourmet</span></h2>
          <p className="text-slate-200 font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs drop-shadow-lg">Catas exclusivas y cultura vinícola en Vigo</p>
        </div>
      </section>

      <div className="pb-24 px-6 max-w-7xl mx-auto -mt-10 relative z-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {localTastings.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white/5 rounded-3xl border border-white/5 text-slate-500 italic">
              Próximamente anunciaremos nuevas fechas.
            </div>
          ) : (
            localTastings.map(t => (
              <div key={t.id} className="bg-[#141414] rounded-[2.5rem] border border-white/5 overflow-hidden group hover:border-[#C5A059]/30 transition-all duration-500 shadow-2xl">
                <div className="p-8 md:p-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                     <div className="text-center bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
                        <div className="text-[#C5A059] text-xl font-serif leading-none">{safeFormat(t.date, 'dd')}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{safeFormat(t.date, 'MMM')}</div>
                     </div>
                     <div className="text-right">
                        <div className="text-2xl font-serif text-white">{t.pricePerPerson}€</div>
                        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">por persona</div>
                     </div>
                  </div>

                  <h3 className="text-2xl font-serif text-white mb-4 group-hover:text-[#C5A059] transition-colors">{t.name}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-1 italic line-clamp-3">
                    {t.description || "Una sesión única para descubrir matices seleccionados."}
                  </p>

                  <div className="space-y-4 pt-6 border-t border-white/5">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-slate-500">Horario:</span>
                      <span className="text-white">{t.slot === ReservationSlot.MIDDAY ? 'Comida (14h)' : 'Cena (21h)'}</span>
                    </div>
                    <button 
                      onClick={() => setSelectedTasting(t)}
                      className="w-full bg-white/5 border border-white/10 text-white font-bold py-4 rounded-2xl hover:bg-[#C5A059] hover:text-black transition-all uppercase text-[10px]"
                    >
                      Reservar Plaza
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedTasting && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md">
          <div className="bg-[#141414] border border-[#C5A059]/30 p-8 rounded-[3rem] max-w-xl w-full relative">
            <button onClick={() => setSelectedTasting(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-3xl font-serif text-white mb-8">{selectedTasting.name}</h3>
            <form onSubmit={handleBook} className="space-y-6">
              <input required placeholder="Nombre" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#C5A059]" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input required placeholder="Teléfono" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#C5A059]" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              <input required type="email" placeholder="Email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#C5A059]" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plazas:</span>
                 <div className="flex items-center gap-4">
                    <button type="button" onClick={() => setBookingSeats(Math.max(1, bookingSeats - 1))} className="w-8 h-8 rounded-full bg-white/10 text-white">-</button>
                    <span className="text-white font-serif text-xl">{bookingSeats}</span>
                    <button type="button" onClick={() => setBookingSeats(bookingSeats + 1)} className="w-8 h-8 rounded-full bg-white/10 text-white">+</button>
                 </div>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-[#C5A059] text-black font-bold py-5 rounded-2xl hover:bg-white uppercase text-xs">
                {isSubmitting ? 'Procesando...' : `Confirmar (${selectedTasting.pricePerPerson * bookingSeats}€)`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WineTastingsPublic;
