
import React, { useState, useEffect } from 'react';
import { Reservation, ReservationStatus, AdditionalServices, ReservationSlot } from './types';
import { INITIAL_RESERVATIONS, TXOKO_CONFIG } from './constants';
import Calendar from './components/Calendar';
import AdminDashboard from './components/AdminDashboard';
import Gallery from './components/Gallery';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * 🖼️ CAMBIAR FOTO PRINCIPAL:
 * Para usar una foto de tu GitHub, usa este formato:
 * "https://raw.githubusercontent.com/agusoyo/Dobao/main/NOMBRE_DE_TU_FOTO.jpeg"
 */
const HERO_IMAGE_URL = "https://raw.githubusercontent.com/agusoyo/Dobao/main/IMG_4292.jpeg";

type ViewState = 'booking' | 'admin' | 'gallery';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('booking');
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem('txoko_reservations_v3');
    return saved ? JSON.parse(saved) : INITIAL_RESERVATIONS;
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<ReservationSlot | null>(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', guests: 10, purpose: '',
    services: { 
      catering: false, 
      cleaning: true, 
      multimedia: false, 
      vinoteca: false,
      beerEstrella: false,
      beer1906: false
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Admin Auth States
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  useEffect(() => {
    localStorage.setItem('txoko_reservations_v3', JSON.stringify(reservations));
    window.scrollTo(0, 0);
  }, [reservations, view]);

  useEffect(() => {
    setSelectedSlot(null);
  }, [selectedDate]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'admin2025') {
      setIsAdminAuthenticated(true);
      setLoginError(false);
      setPasswordInput('');
    } else {
      setLoginError(true);
      setPasswordInput('');
    }
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    setView('booking');
  };

  const handleImportReservations = (newReservations: Reservation[]) => {
    setReservations(newReservations);
    alert("Base de datos sincronizada correctamente.");
  };

  const getOccupiedSlotsForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = format(date, 'yyyy-MM-dd');
    return reservations
      .filter(r => r.date === dateStr && r.status !== ReservationStatus.CANCELLED)
      .map(r => r.slot);
  };

  const occupiedSlots = getOccupiedSlotsForDate(selectedDate);

  const handleServiceToggle = (service: keyof AdditionalServices) => {
    setFormData(prev => ({
      ...prev,
      services: { ...prev.services, [service]: !prev.services[service] }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) return;
    setIsSubmitting(true);
    
    const newReservation: Reservation = {
      id: Math.random().toString(36).substr(2, 9),
      date: format(selectedDate, 'yyyy-MM-dd'),
      slot: selectedSlot,
      customerName: formData.name,
      email: formData.email,
      phone: formData.phone,
      guests: formData.guests,
      purpose: formData.purpose,
      status: ReservationStatus.PENDING,
      services: formData.services,
      createdAt: new Date().toISOString()
    };

    setTimeout(() => {
      setReservations(prev => [...prev, newReservation]);
      alert("Solicitud recibida. En Dobao Gourmet estamos preparando su propuesta personalizada para el turno seleccionado.");
      setFormData({ 
        name: '', email: '', phone: '', guests: 10, purpose: '',
        services: { 
          catering: false, 
          cleaning: true, 
          multimedia: false, 
          vinoteca: false,
          beerEstrella: false,
          beer1906: false
        }
      });
      setSelectedDate(null);
      setSelectedSlot(null);
      setIsSubmitting(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080808] text-slate-200">
      <header className="fixed top-0 left-0 right-0 z-[100] bg-black/95 backdrop-blur-2xl border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 md:h-24 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('booking')}>
            <div className="w-8 h-8 md:w-12 md:h-12 border-2 border-[#C5A059] rounded-full flex items-center justify-center text-[#C5A059] font-serif text-sm md:text-xl font-bold italic shadow-[0_0_15px_rgba(197,160,89,0.3)]">DG</div>
            <div>
              <h1 className="text-[10px] md:text-2xl font-bold text-white tracking-[0.1em] md:tracking-widest uppercase font-serif leading-none">DOBAO GOURMET</h1>
              <span className="text-[6px] md:text-[9px] text-[#C5A059] font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] block mt-0.5 md:mt-1">Vigo · Experiencia Privada</span>
            </div>
          </div>
          <nav className="flex gap-3 md:gap-10">
            <button onClick={() => setView('booking')} className={`text-[8px] md:text-[11px] font-bold uppercase tracking-widest transition-all ${view === 'booking' ? 'text-[#C5A059] border-b border-[#C5A059]' : 'text-slate-400 hover:text-white'}`}>Reservas</button>
            <button onClick={() => setView('gallery')} className={`text-[8px] md:text-[11px] font-bold uppercase tracking-widest transition-all ${view === 'gallery' ? 'text-[#C5A059] border-b border-[#C5A059]' : 'text-slate-400 hover:text-white'}`}>Galería</button>
            <button onClick={() => setView('admin')} className={`text-[8px] md:text-[11px] font-bold uppercase tracking-widest transition-all ${view === 'admin' ? 'text-[#C5A059] border-b border-[#C5A059]' : 'text-slate-400 hover:text-white'}`}>Admin</button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {view === 'booking' && (
          <>
            <section className="relative min-h-screen w-full flex items-start md:items-center justify-center overflow-hidden pt-64 md:pt-0">
              <img 
                src={HERO_IMAGE_URL} 
                alt="Bodega Gourmet" 
                className="absolute inset-0 w-full h-full object-cover brightness-[0.4] scale-105" 
                onError={(e) => {
                   (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=2070";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black via-black/30 to-black"></div>
              
              <div className="relative z-10 text-center px-6 max-w-5xl mt-8 md:mt-24">
                <h2 className="text-3xl sm:text-6xl md:text-9xl font-serif text-white mb-6 md:mb-12 leading-[1.2] md:leading-[1.1] drop-shadow-2xl">
                  Tu espacio <br className="hidden sm:block"/>
                  <span className="text-[#C5A059] italic text-3xl sm:text-6xl md:text-9xl">exclusivo en Vigo</span>
                </h2>
                <div className="max-w-3xl mx-auto mb-10 md:mb-16 p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-white/10 bg-black/60 backdrop-blur-2xl shadow-2xl">
                   <p className="text-slate-300 text-sm md:text-2xl font-light leading-relaxed">
                    Desde celebraciones íntimas hasta eventos corporativos de alto nivel. 
                    Privacidad y excelencia gastronómica en un entorno sofisticado diseñado para el éxito.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-10">
                  <a href="#calendario" className="w-full sm:w-auto bg-[#C5A059] text-black px-12 py-5 md:py-7 rounded-full font-bold uppercase tracking-widest hover:bg-white transition-all transform hover:scale-105 shadow-[0_15px_40px_rgba(197,160,89,0.4)] text-[10px] md:text-xs">
                    Solicitar Reserva
                  </a>
                  <button onClick={() => setView('gallery')} className="w-full sm:w-auto text-white backdrop-blur-xl bg-white/5 border border-white/20 px-12 py-5 md:py-7 rounded-full font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all text-[10px] md:text-xs">
                    Explorar el Espacio
                  </button>
                </div>
              </div>
            </section>

            <section id="calendario" className="py-24 md:py-48 px-6 bg-[#080808] scroll-mt-20 md:scroll-mt-32">
              <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16 md:gap-24 items-start">
                <div className="lg:col-span-7">
                  <div className="mb-12 md:mb-20">
                    <h3 className="text-3xl md:text-5xl font-serif text-white mb-6">1. Seleccione Fecha</h3>
                    <div className="w-16 h-1 bg-[#C5A059] mb-6"></div>
                    <p className="text-slate-400 font-light text-base md:text-xl">Consulte la disponibilidad de nuestros turnos privados de mediodía o noche.</p>
                  </div>
                  <Calendar 
                    selectedDate={selectedDate} 
                    onDateSelect={setSelectedDate} 
                    reservations={reservations.map(r => ({ date: r.date, slot: r.slot }))} 
                  />
                </div>

                <div className="lg:col-span-5">
                  <div className={`bg-[#0d0d0d] rounded-[2.5rem] p-8 md:p-14 border border-white/5 transition-all duration-1000 shadow-[0_30px_100px_rgba(0,0,0,0.5)] ${!selectedDate ? 'opacity-30 blur-sm pointer-events-none scale-95' : 'opacity-100'}`}>
                    <h3 className="text-2xl md:text-4xl font-serif text-white mb-3">2. Su Evento</h3>
                    <p className="text-[#C5A059] text-[10px] md:text-xs font-bold uppercase tracking-widest mb-10 border-b border-white/10 pb-6">
                      {selectedDate ? format(selectedDate, "EEEE d 'de' MMMM", { locale: es }) : 'Seleccione una fecha'}
                    </p>
                    
                    <form onSubmit={handleSubmit} className="space-y-6 md:space-y-10">
                      <div className="space-y-5">
                        <p className="text-[10px] md:text-[11px] uppercase font-bold text-slate-500 tracking-widest">Turno Deseado</p>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            disabled={occupiedSlots.includes(ReservationSlot.MIDDAY)}
                            onClick={() => setSelectedSlot(ReservationSlot.MIDDAY)}
                            className={`px-4 py-5 md:py-8 rounded-2xl border text-center transition-all ${
                              selectedSlot === ReservationSlot.MIDDAY 
                                ? 'bg-[#C5A059] border-[#C5A059] text-black font-bold shadow-lg' 
                                : occupiedSlots.includes(ReservationSlot.MIDDAY)
                                ? 'bg-red-950/10 border-red-900/20 text-red-800 cursor-not-allowed opacity-40'
                                : 'bg-transparent border-white/10 text-white hover:border-[#C5A059]/50'
                            }`}
                          >
                            <div className="text-xs md:text-base uppercase tracking-widest mb-1">Mediodía</div>
                            <div className="text-[9px] md:text-xs opacity-60">12:00h - 16:00h</div>
                          </button>
                          <button
                            type="button"
                            disabled={occupiedSlots.includes(ReservationSlot.NIGHT)}
                            onClick={() => setSelectedSlot(ReservationSlot.NIGHT)}
                            className={`px-4 py-5 md:py-8 rounded-2xl border text-center transition-all ${
                              selectedSlot === ReservationSlot.NIGHT 
                                ? 'bg-[#C5A059] border-[#C5A059] text-black font-bold shadow-lg' 
                                : occupiedSlots.includes(ReservationSlot.NIGHT)
                                ? 'bg-red-950/10 border-red-900/20 text-red-800 cursor-not-allowed opacity-40'
                                : 'bg-transparent border-white/10 text-white hover:border-[#C5A059]/50'
                            }`}
                          >
                            <div className="text-xs md:text-base uppercase tracking-widest mb-1">Noche</div>
                            <div className="text-[9px] md:text-xs opacity-60">20:00h - 00:00h</div>
                          </button>
                        </div>
                      </div>

                      <div className={`space-y-6 md:space-y-10 transition-all duration-700 ${!selectedSlot ? 'opacity-20 pointer-events-none blur-[2px]' : 'opacity-100'}`}>
                        <div className="grid gap-4 md:gap-6">
                          <input type="text" required placeholder="Nombre o Razón Social" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 md:py-5 text-white focus:border-[#C5A059] focus:bg-white/[0.07] outline-none text-sm md:text-base transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                            <input type="email" required placeholder="Email" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 md:py-5 text-white focus:border-[#C5A059] focus:bg-white/[0.07] outline-none text-sm md:text-base transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            <input type="tel" required placeholder="Teléfono" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 md:py-5 text-white focus:border-[#C5A059] focus:bg-white/[0.07] outline-none text-sm md:text-base transition-all" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                          </div>
                        </div>

                        <div className="space-y-5 pt-6 border-t border-white/10">
                          <p className="text-[10px] md:text-xs uppercase font-bold text-[#C5A059] tracking-widest">Servicios Premium</p>
                          <div className="grid grid-cols-2 gap-3 md:gap-4">
                            {[
                              { id: 'vinoteca', label: 'Cava de Vinos' },
                              { id: 'catering', label: 'Catering Gourmet' },
                              { id: 'multimedia', label: 'Multimedia' },
                              { id: 'cleaning', label: 'Limpieza' },
                              { id: 'beerEstrella', label: 'Barril Estrella' },
                              { id: 'beer1906', label: 'Barril 1906' }
                            ].map(s => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => handleServiceToggle(s.id as keyof AdditionalServices)}
                                className={`flex items-center justify-between px-4 py-3 md:py-4 rounded-xl border text-[9px] md:text-xs font-bold uppercase tracking-tight transition-all ${formData.services[s.id as keyof AdditionalServices] ? 'bg-[#C5A059] border-[#C5A059] text-black shadow-md' : 'bg-transparent border-white/10 text-slate-500 hover:border-white/20'}`}
                              >
                                {s.label}
                                {formData.services[s.id as keyof AdditionalServices] && <span className="text-xs">✓</span>}
                              </button>
                            ))}
                          </div>
                        </div>

                        <textarea required placeholder="Cuéntenos más sobre su evento..." className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 md:py-5 text-white focus:border-[#C5A059] focus:bg-white/[0.07] outline-none h-32 md:h-40 resize-none text-sm md:text-base transition-all" value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})} />

                        <button type="submit" disabled={isSubmitting} className="w-full bg-[#C5A059] text-black font-bold py-5 md:py-7 rounded-2xl hover:bg-white transition-all uppercase text-[10px] md:text-sm tracking-[0.3em] shadow-2xl active:scale-95 transform">
                          {isSubmitting ? 'Procesando...' : 'Solicitar Propuesta de Reserva'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {view === 'gallery' && (
          <Gallery onBack={() => setView('booking')} />
        )}

        {view === 'admin' && (
          <div className="pt-32 md:pt-48 min-h-screen bg-slate-50 text-slate-900">
            {!isAdminAuthenticated ? (
              <div className="flex items-center justify-center py-12 md:py-24 px-6">
                <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 md:p-14 shadow-[0_30px_60px_rgba(0,0,0,0.1)] border border-slate-100 text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-[#C5A059]/10 rounded-full flex items-center justify-center mx-auto mb-8 md:mb-10 text-[#C5A059]">
                    <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <h3 className="text-2xl md:text-4xl font-serif mb-3">Panel de Gestión</h3>
                  <p className="text-slate-400 text-sm md:text-lg mb-10">Introduzca la clave privada de Dobao Gourmet</p>
                  
                  <form onSubmit={handleAdminLogin} className="space-y-5">
                    <input 
                      type="password" 
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Contraseña" 
                      className={`w-full bg-slate-50 border-2 rounded-2xl px-6 py-4 text-center text-xl md:text-2xl outline-none transition-all ${loginError ? 'border-red-200 focus:border-red-400' : 'border-slate-100 focus:border-[#C5A059]'}`}
                    />
                    {loginError && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest animate-pulse">Clave incorrecta</p>}
                    <button type="submit" className="w-full bg-black text-white font-bold py-5 md:py-7 rounded-2xl hover:bg-[#C5A059] hover:text-black transition-all uppercase text-xs tracking-[0.3em] shadow-xl">
                      Acceder al Sistema
                    </button>
                    <button type="button" onClick={() => setView('booking')} className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-8 block w-full hover:text-black transition-colors">Volver a la Web</button>
                  </form>
                </div>
              </div>
            ) : (
              <AdminDashboard 
                reservations={reservations} 
                onUpdateStatus={(id, status) => setReservations(prev => prev.map(r => r.id === id ? {...r, status} : r))}
                onUpdate={(u) => setReservations(prev => prev.map(r => r.id === u.id ? u : r))}
                onDelete={(id) => setReservations(prev => prev.filter(r => r.id !== id))}
                onImport={handleImportReservations}
                onBackToBooking={() => setView('booking')}
                onLogout={handleLogout}
              />
            )}
          </div>
        )}
      </main>

      <footer className="bg-black py-20 md:py-32 px-8 border-t border-white/5 text-center">
        <div className="w-20 h-1 bg-[#C5A059] mx-auto mb-12"></div>
        <p className="text-[#C5A059] font-serif text-3xl md:text-5xl italic mb-8">Dobao Gourmet</p>
        <p className="text-slate-600 text-[10px] md:text-[12px] uppercase tracking-[0.6em] mb-16">Vigo · Experiencias Privadas de Alta Gastronomía</p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          <button onClick={() => setView('gallery')} className="text-slate-400 hover:text-[#C5A059] text-[11px] md:text-[13px] uppercase font-bold tracking-[0.3em] transition-colors">Galería</button>
          <button onClick={() => setView('booking')} className="text-slate-400 hover:text-[#C5A059] text-[11px] md:text-[13px] uppercase font-bold tracking-[0.3em] transition-colors">Reservas</button>
          <button onClick={() => setView('admin')} className="text-slate-400 hover:text-[#C5A059] text-[11px] md:text-[13px] uppercase font-bold tracking-[0.3em] transition-colors">Administración</button>
        </div>
      </footer>
    </div>
  );
};

export default App;
