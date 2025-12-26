
import React, { useState, useEffect } from 'react';
import { Reservation, ReservationStatus } from './types';
import { INITIAL_RESERVATIONS, TXOKO_CONFIG } from './constants';
import Calendar from './components/Calendar';
import AdminDashboard from './components/AdminDashboard';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getSmartPlanningAdvice } from './services/geminiService';

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem('txoko_reservations');
    return saved ? JSON.parse(saved) : INITIAL_RESERVATIONS;
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    guests: 10,
    purpose: ''
  });
  const [smartAdvice, setSmartAdvice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    localStorage.setItem('txoko_reservations', JSON.stringify(reservations));
  }, [reservations]);

  const reservedDates = reservations
    .filter(r => r.status !== ReservationStatus.CANCELLED)
    .map(r => r.date);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSmartAdvice(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    setIsSubmitting(true);
    const newReservation: Reservation = {
      id: Math.random().toString(36).substr(2, 9),
      date: format(selectedDate, 'yyyy-MM-dd'),
      customerName: formData.name,
      email: formData.email,
      phone: formData.phone,
      guests: formData.guests,
      purpose: formData.purpose,
      status: ReservationStatus.PENDING,
      createdAt: new Date().toISOString()
    };

    setTimeout(() => {
      setReservations(prev => [...prev, newReservation]);
      alert("Su solicitud ha sido enviada con éxito. Dobao Gourmet confirmará su reserva en breve.");
      setFormData({ name: '', email: '', phone: '', guests: 10, purpose: '' });
      setSelectedDate(null);
      setIsSubmitting(false);
    }, 1200);
  };

  const handleUpdateStatus = (id: string, status: ReservationStatus) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const handleUpdateReservation = (updated: Reservation) => {
    setReservations(prev => prev.map(r => r.id === updated.id ? updated : r));
  };

  const handleDelete = (id: string) => {
    if (window.confirm("¿Confirmar eliminación de la reserva?")) {
      setReservations(prev => prev.filter(r => r.id !== id));
    }
  };

  const fetchAdvice = async () => {
    if (formData.guests > 0 && formData.purpose.length > 5) {
      const advice = await getSmartPlanningAdvice(formData.guests, formData.purpose);
      setSmartAdvice(advice);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080808] text-slate-200 selection:bg-[#C5A059] selection:text-black">
      {/* Exclusive Navigation */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-black/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setIsAdmin(false)}>
            <div className="w-10 h-10 border-2 border-[#C5A059] rounded-full flex items-center justify-center text-[#C5A059] font-serif text-lg font-bold italic transition-transform group-hover:rotate-12">
              DG
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-[0.2em] uppercase font-serif">DOBAO GOURMET</h1>
              <span className="text-[8px] text-[#C5A059] font-bold uppercase tracking-[0.4em] block -mt-1 opacity-80">Experiencia Privada · San Sebastián</span>
            </div>
          </div>
          <nav className="flex items-center gap-10">
            <button 
              onClick={() => setIsAdmin(false)}
              className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all relative py-2 ${!isAdmin ? 'text-[#C5A059]' : 'text-slate-500 hover:text-white'}`}
            >
              Reservar
              {!isAdmin && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#C5A059] shadow-[0_0_10px_#C5A059]"></span>}
            </button>
            <button 
              onClick={() => setIsAdmin(true)}
              className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all relative py-2 ${isAdmin ? 'text-[#C5A059]' : 'text-slate-500 hover:text-white'}`}
            >
              Admin
              {isAdmin && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#C5A059] shadow-[0_0_10px_#C5A059]"></span>}
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {!isAdmin ? (
          <>
            {/* Immersive Hero Section */}
            <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
              <img 
                src="./txoko.jpg" 
                alt="Dobao Gourmet Interior" 
                className="absolute inset-0 w-full h-full object-cover brightness-[0.35] scale-100 animate-slow-zoom"
                onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-black/40"></div>
              
              <div className="relative z-10 text-center px-6 max-w-5xl">
                <div className="inline-block mb-8 px-5 py-1.5 border border-[#C5A059]/40 rounded-full bg-black/50 backdrop-blur-md">
                  <span className="text-[10px] text-[#C5A059] font-black uppercase tracking-[0.5em]">El secreto mejor guardado de Donostia</span>
                </div>
                <h2 className="text-6xl md:text-9xl font-serif text-white mb-8 leading-none tracking-tight">
                  Siente la <br/>
                  <span className="text-[#C5A059] italic">exclusividad</span>
                </h2>
                <p className="text-lg md:text-2xl text-slate-300 font-light max-w-2xl mx-auto mb-14 leading-relaxed tracking-wide opacity-90">
                  Un Txoko de autor donde la arquitectura moderna se funde con una bodega excepcional. Reserva el espacio completo para tus encuentros más íntimos.
                </p>
                <a href="#booking-area" className="inline-flex items-center gap-4 bg-[#C5A059] text-black px-14 py-6 rounded-full font-black uppercase tracking-[0.2em] hover:bg-white transition-all hover:scale-105 shadow-[0_20px_50px_rgba(197,160,89,0.3)]">
                  Explorar Calendario
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                </a>
              </div>
            </section>

            {/* Atmosphere Spotlight */}
            <section className="py-40 px-6 bg-[#080808]">
              <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-24 items-center">
                  <div className="relative group">
                    <div className="absolute -inset-6 border border-[#C5A059]/10 rounded-3xl -rotate-2 group-hover:rotate-0 transition-transform duration-1000"></div>
                    <div className="relative rounded-2xl overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
                      <img 
                        src="./txoko.jpg" 
                        alt="Detalle de la bodega" 
                        className="w-full h-[700px] object-cover transition-transform duration-[5s] group-hover:scale-110"
                        onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1560624052-449f5ddf0c31?q=80&w=1935&auto=format&fit=crop"; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60"></div>
                      <div className="absolute bottom-12 left-12 right-12">
                        <span className="text-[#C5A059] font-black text-[10px] uppercase tracking-[0.4em] mb-4 block">La Bodega Privada</span>
                        <h3 className="text-3xl font-serif text-white italic leading-snug">"Un entorno donde cada botella es una obra de arte y cada cena un recuerdo eterno."</h3>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-12">
                    <div className="space-y-6">
                      <h3 className="text-5xl md:text-6xl font-serif text-white leading-tight">
                        Privacidad <br/>
                        <span className="text-[#C5A059]">Sin Compromisos</span>
                      </h3>
                      <p className="text-slate-400 font-light leading-relaxed text-xl tracking-wide">
                        Nuestro espacio ha sido diseñado para aquellos que valoran la discreción tanto como el buen gusto. 
                        Desde la iluminación cenital hasta la acústica perfecta, cada detalle de Dobao Gourmet invita al disfrute pausado.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                      <div className="p-8 bg-[#111] rounded-2xl border border-white/5 hover:border-[#C5A059]/30 transition-colors">
                        <span className="block text-[#C5A059] font-serif text-4xl mb-4">01.</span>
                        <h4 className="text-white font-bold uppercase tracking-widest text-[11px] mb-3">Capacidad</h4>
                        <p className="text-xs text-slate-500 font-light leading-relaxed">Hasta {TXOKO_CONFIG.maxCapacity} invitados en un entorno totalmente privado y personalizable.</p>
                      </div>
                      <div className="p-8 bg-[#111] rounded-2xl border border-white/5 hover:border-[#C5A059]/30 transition-colors">
                        <span className="block text-[#C5A059] font-serif text-4xl mb-4">02.</span>
                        <h4 className="text-white font-bold uppercase tracking-widest text-[11px] mb-3">Equipamiento</h4>
                        <p className="text-xs text-slate-500 font-light leading-relaxed">Cocina profesional de última generación a disposición del anfitrión o chef privado.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Booking Interactive Section */}
            <section id="booking-area" className="py-40 px-6 bg-[#0c0c0c] relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-10 pointer-events-none"></div>
              
              <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-24">
                  <h2 className="text-5xl font-serif text-white mb-6">Su Reserva en Dobao</h2>
                  <p className="text-[#C5A059] uppercase tracking-[0.4em] text-[10px] font-black">Consulte disponibilidad y solicite su fecha</p>
                  <div className="w-24 h-0.5 bg-[#C5A059] mx-auto mt-8 shadow-[0_0_15px_#C5A059]"></div>
                </div>

                <div className="grid lg:grid-cols-12 gap-16 items-start">
                  {/* Calendar Column */}
                  <div className="lg:col-span-7">
                    <div className="bg-[#141414] rounded-3xl p-8 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.8)] border border-white/5">
                      <Calendar 
                        selectedDate={selectedDate} 
                        onDateSelect={handleDateSelect}
                        reservedDates={reservedDates}
                      />
                    </div>
                  </div>

                  {/* Form Column */}
                  <div className="lg:col-span-5">
                    <div className={`bg-[#1a1a1a] rounded-3xl shadow-2xl border border-white/10 overflow-hidden transition-all duration-700 ${!selectedDate ? 'opacity-20 blur-md grayscale pointer-events-none' : 'opacity-100 scale-100'}`}>
                      <div className="p-10 border-b border-white/5 bg-gradient-to-br from-black/60 to-transparent">
                        <h4 className="text-2xl font-serif text-white mb-1">Confirmar Solicitud</h4>
                        {selectedDate && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse"></div>
                            <p className="text-[#C5A059] text-[11px] font-black uppercase tracking-widest">
                              {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
                            </p>
                          </div>
                        )}
                      </div>

                      <form onSubmit={handleSubmit} className="p-10 space-y-8">
                        <div className="space-y-6">
                          <div className="group">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block group-focus-within:text-[#C5A059] transition-colors">Nombre del Anfitrión</label>
                            <input 
                              type="text" required value={formData.name}
                              onChange={e => setFormData({...formData, name: e.target.value})}
                              className="w-full bg-[#222] border border-white/5 rounded-xl px-5 py-4 text-white focus:border-[#C5A059] outline-none transition-all text-sm placeholder-slate-700"
                              placeholder="Ej: Javier García"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Email</label>
                              <input 
                                type="email" required value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                className="w-full bg-[#222] border border-white/5 rounded-xl px-5 py-4 text-white focus:border-[#C5A059] outline-none transition-all text-sm"
                                placeholder="javier@contacto.com"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Móvil</label>
                              <input 
                                type="tel" required value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                className="w-full bg-[#222] border border-white/5 rounded-xl px-5 py-4 text-white focus:border-[#C5A059] outline-none transition-all text-sm"
                                placeholder="+34 000 000 000"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nº de Invitados: <span className="text-white text-base ml-2">{formData.guests}</span></label>
                            <span className="text-[9px] text-slate-600 font-bold">Límite: {TXOKO_CONFIG.maxCapacity}</span>
                          </div>
                          <input 
                            type="range" min="1" max={TXOKO_CONFIG.maxCapacity} value={formData.guests}
                            onChange={e => setFormData({...formData, guests: parseInt(e.target.value)})}
                            className="w-full h-1.5 bg-[#333] rounded-full appearance-none cursor-pointer accent-[#C5A059]"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tipo de Evento</label>
                            <button 
                              type="button" onClick={fetchAdvice}
                              className="text-[9px] font-black text-[#C5A059] border-b border-[#C5A059]/40 hover:text-white transition-colors uppercase tracking-widest"
                            >
                              IA Sommelier
                            </button>
                          </div>
                          <textarea 
                            required value={formData.purpose}
                            onChange={e => setFormData({...formData, purpose: e.target.value})}
                            className="w-full bg-[#222] border border-white/5 rounded-xl px-5 py-4 text-white focus:border-[#C5A059] outline-none transition-all h-28 resize-none text-sm placeholder-slate-700"
                            placeholder="Cena de empresa, cata de vinos, cumpleaños privado..."
                          ></textarea>
                        </div>

                        {smartAdvice && (
                          <div className="bg-[#C5A059]/10 border border-[#C5A059]/30 p-6 rounded-2xl animate-fade-in">
                            <p className="text-[11px] text-[#C5A059] leading-relaxed italic font-medium">{smartAdvice}</p>
                          </div>
                        )}

                        <button 
                          type="submit" disabled={isSubmitting}
                          className="group w-full bg-[#C5A059] text-black font-black py-6 rounded-xl hover:bg-white transition-all transform active:scale-[0.98] shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                          {isSubmitting ? 'SOLICITANDO...' : 'SOLICITAR MI RESERVA PRIVADA'}
                          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </button>
                      </form>
                    </div>

                    {!selectedDate && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-black/90 backdrop-blur-xl p-10 rounded-3xl border border-[#C5A059]/30 shadow-[0_0_50px_rgba(197,160,89,0.15)] text-center max-w-xs transform -rotate-1">
                          <div className="w-12 h-12 bg-[#C5A059]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-6 h-6 text-[#C5A059]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </div>
                          <p className="text-[#C5A059] font-serif italic text-2xl mb-3">Comienza aquí</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] leading-relaxed">Selecciona tu día especial en el calendario</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          <div className="pt-20 bg-white min-h-screen">
            <AdminDashboard 
              reservations={reservations} 
              onUpdateStatus={handleUpdateStatus}
              onUpdate={handleUpdateReservation}
              onDelete={handleDelete}
              onBackToBooking={() => setIsAdmin(false)}
            />
          </div>
        )}
      </main>

      {/* Haute Couture Footer */}
      <footer className="bg-black py-32 px-6 border-t border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-20 relative z-10">
          <div className="col-span-2 space-y-8">
            <h4 className="text-white font-serif text-4xl italic">Dobao Gourmet</h4>
            <p className="text-slate-500 text-sm max-w-sm leading-relaxed font-light tracking-wide">
              El arte de la hospitalidad vasca elevado a su máxima expresión. 
              Un espacio único donde la gastronomía se vive en absoluta privacidad.
            </p>
            <div className="flex gap-6 pt-4">
              <div className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center text-white hover:border-[#C5A059] hover:text-[#C5A059] transition-all cursor-pointer">IG</div>
              <div className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center text-white hover:border-[#C5A059] hover:text-[#C5A059] transition-all cursor-pointer">FB</div>
            </div>
          </div>
          <div>
            <h5 className="text-[#C5A059] font-black text-[10px] uppercase tracking-[0.4em] mb-10">Ubicación</h5>
            <p className="text-slate-400 text-sm font-light leading-loose">
              Calle de la Gastronomía 8,<br/>
              Distrito Gourmet<br/>
              20005 Donostia - San Sebastián
            </p>
          </div>
          <div>
            <h5 className="text-[#C5A059] font-black text-[10px] uppercase tracking-[0.4em] mb-10">Contacto Directo</h5>
            <div className="space-y-4">
              <p className="text-white text-sm font-medium tracking-wide">info@dobaogourmet.com</p>
              <p className="text-slate-500 text-sm font-light">+34 943 00 00 00</p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-32 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[9px] text-slate-700 tracking-[0.5em] uppercase font-black">
          <span>© 2024 DOBAO GOURMET LUXURY GROUP</span>
          <div className="flex gap-12">
            <span className="cursor-pointer hover:text-white transition-colors">Reserva Segura</span>
            <span className="cursor-pointer hover:text-white transition-colors">Privacidad</span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes slow-zoom {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s ease-in-out infinite alternate;
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default App;
