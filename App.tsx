
import React, { useState, useEffect } from 'react';
import { Reservation, ReservationStatus, AdditionalServices, ReservationSlot } from './types';
import { INITIAL_RESERVATIONS } from './constants';
import Calendar from './components/Calendar';
import AdminDashboard from './components/AdminDashboard';
import Gallery from './components/Gallery';
import { supabase } from './services/supabaseClient';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const HERO_IMAGE_URL = "https://raw.githubusercontent.com/agusoyo/Dobao/main/IMG_4292.jpeg";

type ViewState = 'booking' | 'admin' | 'gallery';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('booking');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
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
  
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Cargar datos desde Supabase al iniciar
  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Error cargando reservas:', error);
      setReservations(INITIAL_RESERVATIONS);
    } else if (data) {
      const mappedData: Reservation[] = data.map(r => ({
        id: r.id,
        date: r.date,
        slot: r.slot as ReservationSlot,
        customerName: r.customer_name,
        email: r.email,
        phone: r.phone,
        guests: r.guests,
        purpose: r.purpose,
        status: r.status as ReservationStatus,
        services: r.services,
        createdAt: r.created_at
      }));
      setReservations(mappedData);
    }
    setLoading(false);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

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
  };

  const handleUpdateStatus = async (id: string, status: ReservationStatus) => {
    const { error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id);

    if (error) {
      alert('Error al actualizar: ' + error.message);
    } else {
      setReservations(prev => prev.map(r => r.id === id ? {...r, status} : r));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que desea eliminar esta reserva?')) return;
    
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error al eliminar: ' + error.message);
    } else {
      setReservations(prev => prev.filter(r => r.id !== id));
    }
  };

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
    
    const { data, error } = await supabase
      .from('reservations')
      .insert([{
        date: format(selectedDate, 'yyyy-MM-dd'),
        slot: selectedSlot,
        customer_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        guests: formData.guests,
        purpose: formData.purpose,
        services: formData.services,
        status: ReservationStatus.PENDING
      }])
      .select();

    if (error) {
      alert("Error al procesar la reserva: " + error.message);
    } else {
      await fetchReservations();
      alert("Solicitud recibida. En Dobao Gourmet estamos preparando su propuesta personalizada.");
      setFormData({ 
        name: '', email: '', phone: '', guests: 10, purpose: '',
        services: { 
          catering: false, cleaning: true, multimedia: false, 
          vinoteca: false, beerEstrella: false, beer1906: false
        }
      });
      setSelectedDate(null);
      setSelectedSlot(null);
    }
    setIsSubmitting(false);
  };

  const ServiceCard = ({ id, label, icon, active, onClick }: { id: keyof AdditionalServices, label: string, icon: string, active: boolean, onClick: () => void }) => (
    <div 
      onClick={onClick}
      className={`cursor-pointer p-4 rounded-xl border transition-all flex flex-col items-center justify-center text-center gap-2 ${
        active 
        ? 'bg-[#C5A059]/10 border-[#C5A059] text-[#C5A059]' 
        : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
      }`}
    >
      <span className="text-xl md:text-2xl">{icon}</span>
      <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#080808] text-slate-200">
      <header className="fixed top-0 left-0 right-0 z-[100] bg-black/80 backdrop-blur-2xl border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 md:h-24 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('booking')}>
            <div className="w-8 h-8 md:w-12 md:h-12 border-2 border-[#C5A059] rounded-full flex items-center justify-center text-[#C5A059] font-serif text-sm md:text-xl font-bold italic">DG</div>
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
            <section className="relative min-h-[90vh] w-full flex items-center justify-center overflow-hidden pt-32">
              <img 
                src={HERO_IMAGE_URL} 
                alt="Bodega Gourmet" 
                className="absolute inset-0 w-full h-full object-cover brightness-[1.1] contrast-[1.0] transition-all duration-1000" 
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#080808]"></div>
              
              <div className="relative z-10 text-center px-6 max-w-5xl">
                <h2 className="text-4xl sm:text-6xl md:text-8xl font-serif text-white mb-6 leading-tight drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
                  Tu espacio <br className="hidden sm:block"/>
                  <span className="text-[#C5A059] italic">exclusivo en Vigo</span>
                </h2>
                <div className="max-w-2xl mx-auto mb-10 p-6 rounded-3xl border border-white/30 bg-black/40 backdrop-blur-md shadow-2xl">
                   <p className="text-white text-base md:text-xl font-bold leading-relaxed">
                    Eventos privados, gastronomía de autor y la mejor selección de vinos en el corazón de la ciudad.
                  </p>
                </div>
                <a href="#calendario" className="inline-block bg-[#C5A059] text-black px-12 py-5 rounded-full font-bold uppercase tracking-widest hover:bg-white transition-all transform hover:scale-105 shadow-[0_10px_40px_rgba(197,160,89,0.6)]">
                  Reservar Fecha
                </a>
              </div>
            </section>

            <section id="calendario" className="py-24 px-6 bg-[#080808] scroll-mt-20">
              <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 md:gap-16 items-start">
                {/* Columna 1: El Momento */}
                <div className="lg:col-span-6 flex flex-col">
                  <div className="mb-10">
                    <h3 className="text-3xl md:text-5xl font-serif text-white mb-4">1. El Momento</h3>
                    <div className="w-16 h-1 bg-[#C5A059]"></div>
                  </div>
                  <Calendar 
                    selectedDate={selectedDate} 
                    onDateSelect={setSelectedDate} 
                    reservations={reservations.map(r => ({ date: r.date, slot: r.slot }))} 
                  />
                </div>

                {/* Columna 2: Detalles (Alineada con el calendario) */}
                <div className="lg:col-span-6 flex flex-col">
                  <div className="mb-10">
                    <h3 className="text-3xl md:text-5xl font-serif text-white mb-4">2. Detalles</h3>
                    <div className="w-16 h-1 bg-[#C5A059]"></div>
                  </div>
                  <div className={`bg-[#141414] rounded-[2rem] p-8 md:p-12 border border-white/5 transition-all duration-700 min-h-[600px] flex flex-col ${!selectedDate ? 'opacity-30 blur-sm pointer-events-none' : 'opacity-100 shadow-2xl shadow-[#C5A059]/5'}`}>
                    <p className="text-[#C5A059] text-[10px] font-bold uppercase tracking-widest mb-10 border-b border-white/10 pb-6">
                      {selectedDate ? format(selectedDate, "EEEE d 'de' MMMM", { locale: es }) : 'Seleccione una fecha primero'}
                    </p>
                    
                    <form onSubmit={handleSubmit} className="space-y-8 flex-1">
                      {/* Turno */}
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Seleccionar Turno</label>
                        <div className="grid grid-cols-2 gap-4">
                          {[ReservationSlot.MIDDAY, ReservationSlot.NIGHT].map(slot => {
                            const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
                            const isOccupied = reservations.some(r => r.date === dateStr && r.slot === slot && r.status !== ReservationStatus.CANCELLED);
                            return (
                              <button
                                key={slot}
                                type="button"
                                disabled={isOccupied}
                                onClick={() => setSelectedSlot(slot)}
                                className={`px-4 py-5 rounded-2xl border text-center transition-all ${
                                  selectedSlot === slot 
                                    ? 'bg-[#C5A059] border-[#C5A059] text-black font-bold' 
                                    : isOccupied
                                    ? 'bg-red-950/10 border-red-900/20 text-red-800 cursor-not-allowed opacity-40'
                                    : 'bg-transparent border-white/10 text-white hover:border-[#C5A059]/50'
                                }`}
                              >
                                {slot === ReservationSlot.MIDDAY ? 'Comida' : 'Cena'}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Datos Cliente */}
                      <div className={`space-y-6 ${!selectedSlot ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <input type="text" required placeholder="Su Nombre" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-[#C5A059]/50 transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                          <input type="tel" required placeholder="Teléfono" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-[#C5A059]/50 transition-all" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </div>
                        <input type="email" required placeholder="Email de contacto" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-[#C5A059]/50 transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        
                        {/* Servicios Extra */}
                        <div className="pt-4">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-6">Experiencias y Extras</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <ServiceCard id="cleaning" label="Limpieza" icon="🧹" active={formData.services.cleaning} onClick={() => handleServiceToggle('cleaning')} />
                            <ServiceCard id="vinoteca" label="Vinoteca" icon="🍷" active={formData.services.vinoteca} onClick={() => handleServiceToggle('vinoteca')} />
                            <ServiceCard id="catering" label="Catering" icon="👨‍🍳" active={formData.services.catering} onClick={() => handleServiceToggle('catering')} />
                            <ServiceCard id="multimedia" label="Multimedia" icon="📺" active={formData.services.multimedia} onClick={() => handleServiceToggle('multimedia')} />
                            <ServiceCard id="beerEstrella" label="Estrella" icon="🍺" active={formData.services.beerEstrella} onClick={() => handleServiceToggle('beerEstrella')} />
                            <ServiceCard id="beer1906" label="1906" icon="🍻" active={formData.services.beer1906} onClick={() => handleServiceToggle('beer1906')} />
                          </div>
                        </div>

                        <button type="submit" disabled={isSubmitting} className="w-full bg-[#C5A059] text-black font-bold py-6 rounded-2xl hover:bg-white transition-all uppercase tracking-widest text-sm shadow-[0_15px_40px_rgba(197,160,89,0.2)]">
                          {isSubmitting ? 'Enviando solicitud...' : 'Confirmar Disponibilidad'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {view === 'gallery' && <Gallery onBack={() => setView('booking')} />}

        {view === 'admin' && (
          <div className="pt-32 min-h-screen bg-slate-50 text-slate-900">
            {!isAdminAuthenticated ? (
              <div className="flex items-center justify-center py-24 px-6">
                <form onSubmit={handleAdminLogin} className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 text-center">
                  <h3 className="text-2xl font-serif mb-3">Panel de Gestión</h3>
                  <input 
                    type="password" 
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Contraseña" 
                    className="w-full bg-slate-50 border-2 rounded-2xl px-6 py-4 text-center mb-6 outline-none"
                  />
                  {loginError && <p className="text-red-500 text-xs mb-4">Contraseña incorrecta</p>}
                  <button type="submit" className="w-full bg-black text-white font-bold py-5 rounded-2xl hover:bg-[#C5A059] hover:text-black transition-all uppercase text-xs tracking-widest">
                    Acceder
                  </button>
                </form>
              </div>
            ) : (
              <AdminDashboard 
                reservations={reservations} 
                onUpdateStatus={handleUpdateStatus}
                onUpdate={() => {}}
                onDelete={handleDelete}
                onImport={() => {}}
                onBackToBooking={() => setView('booking')}
                onLogout={handleLogout}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
