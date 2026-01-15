
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
    try {
      // Get tastings and counts
      const { data: tastings, error: tError } = await supabase
        .from('wine_tastings')
        .select('*')
        .gte('date', format(new Date(), 'yyyy-MM-dd'))
        .order('date', { ascending: true });

      if (tError) throw tError;

      const { data: attendees, error: aError } = await supabase
        .from('tasting_attendees')
        .select('tasting_id, seats');
      
      if (aError) throw aError;

      const counts: Record<string, number> = {};
      (attendees || []).forEach(item => {
        counts[item.tasting_id] = (counts[item.tasting_id] || 0) + (item.seats || 0);
      });

      if (tastings) {
        setLocalTastings(tastings.map(t => ({
          id: t.id,
          date: t.date,
          slot: t.slot as ReservationSlot,
          name: t.name,
          maxCapacity: t.max_capacity,
          pricePerPerson: t.price_per_person,
          description: t.description,
          currentAttendees: counts[t.id] || 0
        })));
      }
    } catch (err: any) {
      console.error("Error cargando catas:", err?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTasting) return;

    // Aforo check before submission
    const currentOccupancy = selectedTasting.currentAttendees || 0;
    if (currentOccupancy + bookingSeats > selectedTasting.maxCapacity) {
      alert(`Lo sentimos, solo quedan ${selectedTasting.maxCapacity - currentOccupancy} plazas libres.`);
      return;
    }

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
      alert("Error al reservar: " + error.message);
    } else {
      const subject = encodeURIComponent(`Nueva Reserva de Cata: ${selectedTasting.name}`);
      const body = encodeURIComponent(
        `Hola Dobao Gourmet,\n\n` +
        ` Me gustaría hacer una reserva para la cata : \n\n` +
        `EVENTO: ${selectedTasting.name}\n` +
        `FECHA: ${safeFormat(selectedTasting.date, 'dd/MM/yyyy')}\n` +
        `------------------------------------------\n` +
        `CLIENTE: ${formData.name}\n` +
        `TELÉFONO: ${formData.phone}\n` +
        `EMAIL: ${formData.email}\n` +
        `PLAZAS: ${bookingSeats}\n\n` +
        `Saludos.`
      );
      
      window.location.href = `mailto:reservas@dobaogourmet.com?subject=${subject}&body=${body}`;

      alert("¡Reserva confirmada! Te esperamos en Dobao Gourmet. (Se abrirá tu gestor de correo para la notificación)");
      setSelectedTasting(null);
      setFormData({ name: '', email: '', phone: '' });
      if (!externalTastings) fetchTastings();
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
            localTastings.map(t => {
              const freeSeats = t.maxCapacity - (t.currentAttendees || 0);
              const isFull = freeSeats <= 0;
              
              return (
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
                    <p className="text-slate-400 text-base leading-relaxed mb-4 flex-1 italic">
                      {t.description || "Una sesión única para descubrir matices seleccionados."}
                    </p>

                    <div className="mb-6 flex items-center justify-between bg-black/30 p-4 rounded-2xl border border-white/5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Aforo:</span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${isFull ? 'text-red-500' : freeSeats <= 3 ? 'text-amber-500 animate-pulse' : 'text-emerald-500'}`}>
                        {isFull ? 'Completo' : `${freeSeats} plazas libres`}
                      </span>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                      <button 
                        disabled={isFull}
                        onClick={() => setSelectedTasting(t)}
                        className={`w-full font-bold py-4 rounded-2xl transition-all uppercase text-[10px] ${
                          isFull 
                          ? 'bg-red-950/20 text-red-500 border border-red-900/30 cursor-not-allowed' 
                          : 'bg-white/5 border border-white/10 text-white hover:bg-[#C5A059] hover:text-black'
                        }`}
                      >
                        {isFull ? 'Aforo Completo' : 'Reservar Plaza'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {selectedTasting && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md">
          <div className="bg-[#141414] border border-[#C5A059]/30 p-8 rounded-[3rem] max-w-xl w-full relative">
            <button onClick={() => setSelectedTasting(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-3xl font-serif text-white mb-2">{selectedTasting.name}</h3>
            <p className="text-[#C5A059] text-[10px] font-bold uppercase tracking-widest mb-8">
              {selectedTasting.maxCapacity - (selectedTasting.currentAttendees || 0)} plazas disponibles
            </p>
            
            <form onSubmit={handleBook} className="space-y-6">
              <input required placeholder="Nombre" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#C5A059]" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input required placeholder="Teléfono" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#C5A059]" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              <input required type="email" placeholder="Email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#C5A059]" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plazas:</span>
                 <div className="flex items-center gap-4">
                    <button type="button" onClick={() => setBookingSeats(Math.max(1, bookingSeats - 1))} className="w-8 h-8 rounded-full bg-white/10 text-white">-</button>
                    <span className="text-white font-serif text-xl">{bookingSeats}</span>
                    <button 
                      type="button" 
                      onClick={() => {
                        const maxLibres = selectedTasting.maxCapacity - (selectedTasting.currentAttendees || 0);
                        if (bookingSeats < maxLibres) setBookingSeats(bookingSeats + 1);
                      }} 
                      className="w-8 h-8 rounded-full bg-white/10 text-white"
                    >+</button>
                 </div>
              </div>
              
              <button type="submit" disabled={isSubmitting} className="w-full bg-[#C5A059] text-black font-bold py-5 rounded-2xl hover:bg-white uppercase text-xs shadow-lg shadow-[#C5A059]/10">
                {isSubmitting ? 'Procesando...' : `Confirmar Reserva (${selectedTasting.pricePerPerson * bookingSeats}€)`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WineTastingsPublic;
