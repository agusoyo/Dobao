
import React, { useState, useEffect } from 'react';
import { Reservation, ReservationStatus, AdditionalServices, ReservationSlot } from './types';
import { INITIAL_RESERVATIONS, TXOKO_CONFIG } from './constants';
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', guests: 10, purpose: '',
    comments: '',
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
        comments: r.comments,
        eventCost: r.event_cost,
        status: r.status as ReservationStatus,
        services: r.services,
        createdAt: r.created_at
      }));
      setReservations(mappedData);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (id: string, status: ReservationStatus) => {
    const { error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id);

    if (error) {
      alert('Error al actualizar estado: ' + error.message);
    } else {
      setReservations(prev => prev.map(r => r.id === id ? {...r, status} : r));
    }
  };

  const handleUpdateCost = async (id: string, cost: number) => {
    const { error } = await supabase
      .from('reservations')
      .update({ event_cost: cost })
      .eq('id', id);

    if (error) {
      alert('Error al actualizar coste: ' + error.message);
    } else {
      setReservations(prev => prev.map(r => r.id === id ? {...r, eventCost: cost} : r));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que desea eliminar esta reserva?')) return;
    const { error } = await supabase.from('reservations').delete().eq('id', id);
    if (error) {
      alert('Error al eliminar: ' + error.message);
    } else {
      setReservations(prev => prev.filter(r => r.id !== id));
    }
  };

  const toggleService = (service: keyof AdditionalServices) => {
    setFormData(prev => ({
      ...prev,
      services: {
        ...prev.services,
        [service]: !prev.services[service]
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) return;
    setIsSubmitting(true);
    
    const payload = {
      date: format(selectedDate, 'yyyy-MM-dd'),
      slot: selectedSlot,
      customer_name: formData.name,
      email: formData.email,
      phone: formData.phone,
      guests: formData.guests,
      purpose: formData.purpose,
      comments: formData.comments,
      services: formData.services,
      status: ReservationStatus.PENDING,
      event_cost: 0
    };

    const { data, error } = await supabase
      .from('reservations')
      .insert([payload])
      .select();

    if (error) {
      alert("Error al procesar la reserva: " + error.message);
    } else {
      await fetchReservations();
      alert("¡Solicitud enviada correctamente! En Dobao Gourmet hemos recibido sus detalles y peticiones. Nos pondremos en contacto con usted en breve.");
      setShowSuccessModal(true);
      setFormData({ 
        name: '', email: '', phone: '', guests: 10, purpose: '',
        comments: '',
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

  return (
    <div className="min-h-screen flex flex-col bg-[#080808] text-slate-200">
      <header className="fixed top-0 left-0 right-0 z-[100] bg-black/80 backdrop-blur-2xl border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 md:h-24 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('booking')}>
            <div className="w-8 h-8 md:w-12 md:h-12 border-2 border-[#C5A059] rounded-full flex items-center justify-center text-[#C5A059] font-serif text-sm md:text-xl font-bold italic">DG</div>
            <div>
              <h1 className="text-[10px] md:text-2xl font-bold text-white tracking-[0.1em] md:tracking-widest uppercase font-serif leading-none">DOBAO GOURMET</h1>
              <span className="text-[6px] md:text-[9px] text-[#C5A059] font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] block mt-0.5 md:mt-1">
                {TXOKO_CONFIG.address} · <a href="tel:+34689204786" className="hover:text-white transition-colors">+34 689 20 47 86</a>
              </span>
            </div>
          </div>
          <nav className="flex gap-3 md:gap-10">
            <button onClick={() => setView('booking')} className={`text-[8px] md:text-[11px] font-bold uppercase tracking-widest transition-all ${view === 'booking' ? 'text-[#C5A059] border-b border-[#C5A059]' : 'text-slate-400 hover:text-white'}`}>Reservas</button>
            <button onClick={() => setView('gallery')} className={`text-[8px] md:text-[11px] font-bold uppercase tracking-widest transition-all ${view === 'gallery' ? 'text-[#C5A059] border-b border-[#C5A059]' : 'text-slate-400 hover:text-white'}`}>Galería</button>
            <button onClick={() => setView('admin')} className={`text-[8px] md:text-[11px] font-bold uppercase tracking-widest transition-all ${view === 'admin' ? 'text-[#C5A059] border-b border-[#C5A059]' : 'text-slate-400 hover:text-white'}`}>Admin</button>
          </nav>
        </div>
      </header>

      {showSuccessModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
          <div className="bg-[#141414] border border-[#C5A059]/30 p-10 md:p-16 rounded-[3rem] max-w-lg w-full text-center shadow-2xl">
            <div className="w-20 h-20 bg-[#C5A059] rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-3xl font-serif text-white mb-4">Solicitud Recibida</h3>
            <p className="text-slate-400 mb-10 leading-relaxed">
              Gracias por confiar en <strong>Dobao Gourmet</strong>. <br/>
              Sus detalles han sido registrados. Contactaremos con usted pronto para confirmar su evento.
            </p>
            <button onClick={() => setShowSuccessModal(false)} className="w-full bg-[#C5A059] text-black font-bold py-5 rounded-2xl hover:bg-white transition-all uppercase tracking-widest text-xs">Entendido</button>
          </div>
        </div>
      )}

      <main className="flex-1">
        {view === 'booking' && (
          <>
            <section className="relative min-h-[90vh] w-full flex items-center justify-center overflow-hidden pt-32">
              <img src={HERO_IMAGE_URL} alt="Bodega" className="absolute inset-0 w-full h-full object-cover brightness-[1.1]" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#080808]"></div>
              <div className="relative z-10 text-center px-6 max-w-5xl">
                <h2 className="text-4xl sm:text-6xl md:text-8xl font-serif text-white mb-6 drop-shadow-2xl">Tu espacio <span className="text-[#C5A059] italic">exclusivo</span></h2>
                <a href="#calendario" className="inline-block bg-[#C5A059] text-black px-12 py-5 rounded-full font-bold uppercase tracking-widest hover:bg-white transition-all transform hover:scale-105">Reservar Fecha</a>
              </div>
            </section>

            <section id="calendario" className="py-24 px-6 bg-[#080808] scroll-mt-20">
              <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16 items-start">
                <div className="lg:col-span-5">
                  <div className="mb-10"><h3 className="text-3xl md:text-5xl font-serif text-white mb-4">1. El Momento</h3><div className="w-16 h-1 bg-[#C5A059]"></div></div>
                  <Calendar selectedDate={selectedDate} onDateSelect={setSelectedDate} reservations={reservations.map(r => ({ date: r.date, slot: r.slot }))} />
                </div>
                <div className="lg:col-span-7">
                  <div className="mb-10"><h3 className="text-3xl md:text-5xl font-serif text-white mb-4">2. Detalles del Evento</h3><div className="w-16 h-1 bg-[#C5A059]"></div></div>
                  <div className={`bg-[#141414] rounded-[2rem] p-8 md:p-12 border border-white/5 transition-all ${!selectedDate ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                    <form onSubmit={handleSubmit} className="space-y-10">
                      {/* Turno */}
                      <div className="grid grid-cols-2 gap-4">
                        {[ReservationSlot.MIDDAY, ReservationSlot.NIGHT].map(slot => (
                          <button key={slot} type="button" onClick={() => setSelectedSlot(slot)} className={`px-4 py-5 rounded-2xl border text-center transition-all ${selectedSlot === slot ? 'bg-[#C5A059] text-black font-bold border-[#C5A059]' : 'border-white/10 text-white hover:border-[#C5A059]'}`}>
                            {slot === ReservationSlot.MIDDAY ? 'Comida' : 'Cena'}
                          </button>
                        ))}
                      </div>

                      <div className={`space-y-8 ${!selectedSlot ? 'opacity-20 pointer-events-none' : ''}`}>
                        {/* Datos de contacto */}
                        <div className="grid sm:grid-cols-2 gap-4">
                          <input type="text" required placeholder="Nombre completo" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-[#C5A059]" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                          <input type="tel" required placeholder="Teléfono de contacto" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-[#C5A059]" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <input type="email" required placeholder="Email" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-[#C5A059]" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                          <div className="flex items-center bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4">
                            <span className="text-slate-500 text-sm mr-4 uppercase font-bold">Invitados:</span>
                            <input type="number" min="1" max="35" className="bg-transparent w-full text-white outline-none" value={formData.guests} onChange={e => setFormData({...formData, guests: parseInt(e.target.value)})} />
                          </div>
                        </div>

                        {/* Servicios Adicionales */}
                        <div className="space-y-4">
                          <h4 className="text-[#C5A059] font-serif text-lg">Servicios Premium</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {(Object.keys(formData.services) as Array<keyof AdditionalServices>).map((service) => (
                              <button
                                key={service}
                                type="button"
                                onClick={() => toggleService(service)}
                                className={`px-4 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all ${
                                  formData.services[service] 
                                    ? 'bg-[#C5A059] text-black border-[#C5A059]' 
                                    : 'border-white/5 text-slate-400 hover:border-white/20'
                                }`}
                              >
                                {service === 'catering' && 'Catering'}
                                {service === 'cleaning' && 'Limpieza'}
                                {service === 'multimedia' && 'Multimedia'}
                                {service === 'vinoteca' && 'Vinoteca'}
                                {service === 'beerEstrella' && 'Estrella Galicia'}
                                {service === 'beer1906' && '1906 Reserva'}
                              </button>
                            ))}
                          </div>
                        </div>

                        <textarea placeholder="Peticiones especiales, intolerancias, detalles del evento..." className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white min-h-[120px] resize-none outline-none focus:border-[#C5A059]" value={formData.comments} onChange={e => setFormData({...formData, comments: e.target.value})} />
                        
                        <button type="submit" disabled={isSubmitting} className="w-full bg-[#C5A059] text-black font-bold py-6 rounded-2xl hover:bg-white transition-all uppercase tracking-widest text-sm shadow-[0_10px_30px_rgba(197,160,89,0.2)]">
                          {isSubmitting ? 'Procesando Solicitud...' : 'Solicitar Reserva'}
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
                <form onSubmit={handleAdminLogin} className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-xl border text-center">
                  <h3 className="text-2xl font-serif mb-6">Acceso Administración</h3>
                  <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Contraseña" className="w-full bg-slate-50 border rounded-2xl px-6 py-4 text-center mb-6" />
                  {loginError && <p className="text-red-500 text-xs mb-4">Error de acceso</p>}
                  <button type="submit" className="w-full bg-black text-white font-bold py-5 rounded-2xl hover:bg-[#C5A059] uppercase text-xs tracking-widest">Entrar</button>
                </form>
              </div>
            ) : (
              <AdminDashboard 
                reservations={reservations} 
                onUpdateStatus={handleUpdateStatus}
                onUpdateCost={handleUpdateCost}
                onUpdate={() => {}}
                onDelete={handleDelete}
                onImport={() => {}}
                onBackToBooking={() => setView('booking')}
                onLogout={() => setIsAdminAuthenticated(false)}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
