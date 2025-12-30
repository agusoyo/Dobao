
import React, { useState, useEffect } from 'react';
import { Reservation, ReservationStatus, AdditionalServices, ReservationSlot } from './types';
import { INITIAL_RESERVATIONS, TXOKO_CONFIG } from './constants';
import Calendar from './components/Calendar';
import AdminDashboard from './components/AdminDashboard';
import Gallery from './components/Gallery';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
    services: { catering: false, cleaning: true, multimedia: false, vinoteca: false }
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
    // Contraseña de ejemplo: admin2025
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
        services: { catering: false, cleaning: true, multimedia: false, vinoteca: false }
      });
      setSelectedDate(null);
      setSelectedSlot(null);
      setIsSubmitting(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080808] text-slate-200">
      <header className="fixed top-0 left-0 right-0 z-[100] bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setView('booking')}>
            <div className="w-10 h-10 border-2 border-[#C5A059] rounded-full flex items-center justify-center text-[#C5A059] font-serif text-lg font-bold italic">DG</div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-widest uppercase font-serif">DOBAO GOURMET</h1>
              <span className="text-[8px] text-[#C5A059] font-bold uppercase tracking-[0.4em] block -mt-1">Vigo · Experiencia Privada</span>
            </div>
          </div>
          <nav className="flex gap-8">
            <button onClick={() => setView('booking')} className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${view === 'booking' ? 'text-[#C5A059]' : 'text-slate-400 hover:text-white'}`}>Reservas</button>
            <button onClick={() => setView('gallery')} className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${view === 'gallery' ? 'text-[#C5A059]' : 'text-slate-400 hover:text-white'}`}>Galería</button>
            <button onClick={() => setView('admin')} className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${view === 'admin' ? 'text-[#C5A059]' : 'text-slate-400 hover:text-white'}`}>Admin</button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {view === 'booking' && (
          <>
            <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=2070&auto=format&fit=crop" 
                alt="Bodega Gourmet" 
                className="absolute inset-0 w-full h-full object-cover brightness-[0.65]" 
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90"></div>
              
              <div className="relative z-10 text-center px-6 max-w-5xl">
                <h2 className="text-6xl md:text-8xl font-serif text-white mb-6 leading-tight drop-shadow-2xl">
                  Tu espacio <br/>
                  <span className="text-[#C5A059] italic text-5xl md:text-8xl">exclusivo en Vigo</span>
                </h2>
                <p className="text-white max-w-3xl mx-auto mb-10 text-lg md:text-xl font-medium leading-relaxed drop-shadow-lg bg-black/20 backdrop-blur-[4px] p-8 rounded-3xl border border-white/10">
                  Desde celebraciones íntimas con familiares y amigos hasta eventos comerciales de alto nivel y presentaciones de marketing. 
                  Un entorno sofisticado donde la excelencia gastronómica y la privacidad se unen para garantizar el éxito de sus momentos más importantes, tanto personales como profesionales.
                </p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                  <a href="#calendario" className="bg-[#C5A059] text-black px-12 py-5 rounded-full font-bold uppercase tracking-widest hover:bg-white transition-all transform hover:scale-105 shadow-2xl">
                    Solicitar Reserva
                  </a>
                  <button onClick={() => setView('gallery')} className="text-white backdrop-blur-md bg-white/10 border border-white/30 px-12 py-5 rounded-full font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                    Explorar el Espacio
                  </button>
                </div>
              </div>
            </section>

            <section id="calendario" className="py-32 px-6 bg-black">
              <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16 items-start">
                <div className="lg:col-span-7">
                  <div className="mb-8">
                    <h3 className="text-4xl font-serif text-white mb-2">1. Seleccione Fecha</h3>
                    <p className="text-slate-400 font-light">Disponemos de dos turnos diarios independientes.</p>
                  </div>
                  <Calendar 
                    selectedDate={selectedDate} 
                    onDateSelect={setSelectedDate} 
                    reservations={reservations.map(r => ({ date: r.date, slot: r.slot }))} 
                  />
                </div>

                <div className="lg:col-span-5">
                  <div className={`bg-[#141414] rounded-3xl p-10 border border-white/5 transition-all duration-700 ${!selectedDate ? 'opacity-30 blur-sm pointer-events-none scale-95' : 'opacity-100'}`}>
                    <h3 className="text-2xl font-serif text-white mb-2">2. Configure su Evento</h3>
                    <p className="text-[#C5A059] text-[10px] font-bold uppercase tracking-widest mb-8">
                      {selectedDate ? format(selectedDate, "EEEE d 'de' MMMM", { locale: es }) : ''}
                    </p>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-4">
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Turno Deseado</p>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            disabled={occupiedSlots.includes(ReservationSlot.MIDDAY)}
                            onClick={() => setSelectedSlot(ReservationSlot.MIDDAY)}
                            className={`px-4 py-5 rounded-xl border text-center transition-all ${
                              selectedSlot === ReservationSlot.MIDDAY 
                                ? 'bg-[#C5A059] border-[#C5A059] text-black font-bold' 
                                : occupiedSlots.includes(ReservationSlot.MIDDAY)
                                ? 'bg-red-950/20 border-red-900/30 text-red-700 cursor-not-allowed opacity-50'
                                : 'bg-transparent border-white/10 text-white hover:border-[#C5A059]/50'
                            }`}
                          >
                            <div className="text-xs uppercase tracking-widest mb-1">Mediodía</div>
                            <div className="text-[10px] opacity-60">12:00h - 16:00h</div>
                          </button>
                          <button
                            type="button"
                            disabled={occupiedSlots.includes(ReservationSlot.NIGHT)}
                            onClick={() => setSelectedSlot(ReservationSlot.NIGHT)}
                            className={`px-4 py-5 rounded-xl border text-center transition-all ${
                              selectedSlot === ReservationSlot.NIGHT 
                                ? 'bg-[#C5A059] border-[#C5A059] text-black font-bold' 
                                : occupiedSlots.includes(ReservationSlot.NIGHT)
                                ? 'bg-red-950/20 border-red-900/30 text-red-700 cursor-not-allowed opacity-50'
                                : 'bg-transparent border-white/10 text-white hover:border-[#C5A059]/50'
                            }`}
                          >
                            <div className="text-xs uppercase tracking-widest mb-1">Noche</div>
                            <div className="text-[10px] opacity-60">20:00h - 00:00h</div>
                          </button>
                        </div>
                      </div>

                      <div className={`space-y-6 transition-all duration-500 ${!selectedSlot ? 'opacity-20 pointer-events-none blur-[2px]' : 'opacity-100'}`}>
                        <div className="grid gap-4">
                          <input type="text" required placeholder="Nombre o Razón Social" className="w-full bg-white/5 border border-white/5 rounded-xl px-5 py-4 text-white focus:border-[#C5A059] outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                          <div className="grid grid-cols-2 gap-4">
                            <input type="email" required placeholder="Email" className="w-full bg-white/5 border border-white/5 rounded-xl px-5 py-4 text-white focus:border-[#C5A059] outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            <input type="tel" required placeholder="Teléfono" className="w-full bg-white/5 border border-white/5 rounded-xl px-5 py-4 text-white focus:border-[#C5A059] outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                          </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                          <p className="text-[10px] uppercase font-bold text-[#C5A059] tracking-widest">Servicios Adicionales</p>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { id: 'vinoteca', label: 'Cava de Vinos' },
                              { id: 'catering', label: 'Catering Gourmet' },
                              { id: 'multimedia', label: 'Pack Multimedia' },
                              { id: 'cleaning', label: 'Servicio Limpieza' }
                            ].map(s => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => handleServiceToggle(s.id as keyof AdditionalServices)}
                                className={`flex items-center justify-between px-4 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-tighter transition-all ${formData.services[s.id as keyof AdditionalServices] ? 'bg-[#C5A059] border-[#C5A059] text-black' : 'bg-transparent border-white/10 text-slate-500'}`}
                              >
                                {s.label}
                                {formData.services[s.id as keyof AdditionalServices] && <span>✓</span>}
                              </button>
                            ))}
                          </div>
                        </div>

                        <textarea required placeholder="Propósito del evento..." className="w-full bg-white/5 border border-white/5 rounded-xl px-5 py-4 text-white focus:border-[#C5A059] outline-none h-24 resize-none" value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})} />

                        <button type="submit" disabled={isSubmitting} className="w-full bg-[#C5A059] text-black font-bold py-5 rounded-xl hover:bg-white transition-all uppercase text-xs tracking-[0.2em] shadow-xl">
                          {isSubmitting ? 'Procesando...' : 'Confirmar Solicitud de Reserva'}
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
          <div className="pt-24 min-h-screen bg-slate-50 text-slate-900">
            {!isAdminAuthenticated ? (
              <div className="flex items-center justify-center py-20 px-6">
                <div className="max-w-md w-full bg-white rounded-[2.5rem] p-12 shadow-2xl border border-slate-100 text-center">
                  <div className="w-16 h-16 bg-[#C5A059]/10 rounded-full flex items-center justify-center mx-auto mb-8 text-[#C5A059]">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <h3 className="text-3xl font-serif mb-2">Acceso Restringido</h3>
                  <p className="text-slate-400 text-sm mb-10">Introduzca la clave de gestión de Dobao Gourmet</p>
                  
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <input 
                      type="password" 
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Contraseña" 
                      className={`w-full bg-slate-50 border-2 rounded-2xl px-6 py-4 text-center text-xl outline-none transition-all ${loginError ? 'border-red-200 focus:border-red-400' : 'border-slate-100 focus:border-[#C5A059]'}`}
                    />
                    {loginError && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">Clave incorrecta</p>}
                    <button type="submit" className="w-full bg-black text-white font-bold py-5 rounded-2xl hover:bg-[#C5A059] hover:text-black transition-all uppercase text-xs tracking-[0.2em] shadow-lg">
                      Entrar al Panel
                    </button>
                    <button type="button" onClick={() => setView('booking')} className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-4">Cancelar</button>
                  </form>
                </div>
              </div>
            ) : (
              <AdminDashboard 
                reservations={reservations} 
                onUpdateStatus={(id, status) => setReservations(prev => prev.map(r => r.id === id ? {...r, status} : r))}
                onUpdate={(u) => setReservations(prev => prev.map(r => r.id === u.id ? u : r))}
                onDelete={(id) => setReservations(prev => prev.filter(r => r.id !== id))}
                onBackToBooking={() => setView('booking')}
                onLogout={handleLogout}
              />
            )}
          </div>
        )}
      </main>

      <footer className="bg-black py-20 px-6 border-t border-white/5 text-center">
        <p className="text-[#C5A059] font-serif text-2xl italic mb-4">Dobao Gourmet</p>
        <p className="text-slate-600 text-[10px] uppercase tracking-[0.4em]">Vigo · Galicia</p>
        <div className="mt-8 flex justify-center gap-6">
          <button onClick={() => setView('gallery')} className="text-slate-400 hover:text-[#C5A059] text-[10px] uppercase font-bold tracking-widest">Galería</button>
          <button onClick={() => setView('booking')} className="text-slate-400 hover:text-[#C5A059] text-[10px] uppercase font-bold tracking-widest">Reservas</button>
          <button onClick={() => setView('admin')} className="text-slate-400 hover:text-[#C5A059] text-[10px] uppercase font-bold tracking-widest">Administración</button>
        </div>
      </footer>
    </div>
  );
};

export default App;
