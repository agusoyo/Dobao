
import React, { useState, useEffect, useCallback } from 'react';
import { Reservation, ReservationStatus, AdditionalServices, ReservationSlot, WineTasting, BlockedDay } from './types';
import { INITIAL_RESERVATIONS, TXOKO_CONFIG } from './constants';
import Calendar from './components/Calendar';
import AdminDashboard from './components/AdminDashboard';
import Gallery from './components/Gallery';
import WineTastingConfig from './components/WineTastingConfig';
import WineTastingsPublic from './components/WineTastingsPublic';
import BlockedDaysConfig from './components/BlockedDaysConfig';
import Home from './components/Home';
import { supabase } from './services/supabaseClient';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const HERO_IMAGE_URL = "https://raw.githubusercontent.com/agusoyo/Dobao/main/IMG_4292.jpeg";

type ViewState = 'home' | 'booking' | 'admin' | 'gallery' | 'wine-config' | 'tastings' | 'blocked-days';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tastings, setTastings] = useState<WineTasting[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
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

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [resResult, wineResult, blockedResult] = await Promise.allSettled([
        supabase.from('reservations').select('*'),
        supabase.from('wine_tastings').select('*'),
        supabase.from('blocked_days').select('id, date, reason')
      ]);

      if (resResult.status === 'fulfilled') {
        const { data, error } = resResult.value;
        if (!error && data) {
          setReservations(data.map(r => ({
            id: r.id,
            date: r.date,
            slot: (r.slot || ReservationSlot.NIGHT) as ReservationSlot,
            customerName: r.customer_name,
            email: r.email,
            phone: r.phone,
            guests: r.guests,
            purpose: r.purpose,
            comments: r.comments,
            eventCost: r.event_cost,
            deposit: r.deposit || 0,
            status: (r.status || ReservationStatus.PENDING) as ReservationStatus,
            services: r.services || {},
            createdAt: r.created_at
          })));
        }
      }

      if (wineResult.status === 'fulfilled') {
        const { data, error } = wineResult.value;
        if (!error && data) {
          setTastings(data.map(t => ({
            id: t.id,
            date: t.date,
            slot: (t.slot || ReservationSlot.NIGHT) as ReservationSlot,
            name: t.name,
            maxCapacity: t.max_capacity,
            pricePerPerson: t.price_per_person,
            description: t.description
          })));
        }
      }

      if (blockedResult.status === 'fulfilled') {
        const { data, error } = blockedResult.value;
        if (!error && data) {
          setBlockedDates(data.map(b => b.date));
        }
      }

    } catch (err) {
      console.error("Error sincronizando:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleUpdateStatus = async (id: string, status: ReservationStatus) => {
    const { error } = await supabase.from('reservations').update({ status }).eq('id', id);
    if (!error) fetchAllData();
  };

  const handleUpdateCost = async (id: string, cost: number) => {
    const { error } = await supabase.from('reservations').update({ event_cost: cost }).eq('id', id);
    if (!error) fetchAllData();
  };

  const handleUpdateDeposit = async (id: string, deposit: number) => {
    const { error } = await supabase.from('reservations').update({ deposit }).eq('id', id);
    if (!error) fetchAllData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que desea eliminar esta reserva?')) return;
    const { error } = await supabase.from('reservations').delete().eq('id', id);
    if (!error) fetchAllData();
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
      status: ReservationStatus.PENDING
    };

    const { error } = await supabase.from('reservations').insert([payload]);

    if (!error) {
      await fetchAllData();
      setShowSuccessModal(true);
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
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080808] text-slate-200">
      <header className="fixed top-0 left-0 right-0 z-[100] bg-black/80 backdrop-blur-2xl border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 md:h-24 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
            <div className="w-8 h-8 md:w-12 md:h-12 border-2 border-[#C5A059] rounded-full flex items-center justify-center text-[#C5A059] font-serif text-sm md:text-xl font-bold italic">DG</div>
            <div className="hidden sm:block">
              <h1 className="text-[10px] md:text-2xl font-bold text-white tracking-[0.1em] md:tracking-widest uppercase font-serif leading-none">DOBAO GOURMET</h1>
              <span className="text-[6px] md:text-[9px] text-[#C5A059] font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] block mt-0.5 md:mt-1">
                {TXOKO_CONFIG.address} <span className="mx-1 text-white/30">•</span> {TXOKO_CONFIG.phone}
              </span>
            </div>
          </div>
          <nav className="flex gap-2 md:gap-8">
            <button onClick={() => setView('home')} className={`text-[7px] md:text-[11px] font-bold uppercase tracking-widest transition-all ${view === 'home' ? 'text-[#C5A059] border-b border-[#C5A059]' : 'text-slate-400 hover:text-white'}`}>Inicio</button>
            <button onClick={() => setView('booking')} className={`text-[7px] md:text-[11px] font-bold uppercase tracking-widest transition-all ${view === 'booking' ? 'text-[#C5A059] border-b border-[#C5A059]' : 'text-slate-400 hover:text-white'}`}>Reserva Local</button>
            <button onClick={() => setView('tastings')} className={`text-[7px] md:text-[11px] font-bold uppercase tracking-widest transition-all ${view === 'tastings' ? 'text-[#C5A059] border-b border-[#C5A059]' : 'text-slate-400 hover:text-white'}`}>Catas</button>
            <button onClick={() => setView('gallery')} className={`text-[7px] md:text-[11px] font-bold uppercase tracking-widest transition-all ${view === 'gallery' ? 'text-[#C5A059] border-b border-[#C5A059]' : 'text-slate-400 hover:text-white'}`}>Galería</button>
            <button onClick={() => setView('admin')} className={`text-[7px] md:text-[11px] font-bold uppercase tracking-widest transition-all ${['admin', 'wine-config', 'blocked-days'].includes(view) ? 'text-[#C5A059] border-b border-[#C5A059]' : 'text-slate-400 hover:text-white'}`}>Admin</button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {view === 'home' && (
          <Home 
            onNavigateBooking={() => setView('booking')} 
            onNavigateTastings={() => setView('tastings')} 
          />
        )}

        {view === 'booking' && (
          <>
            <section className="relative min-h-[60vh] w-full flex items-center justify-center overflow-hidden pt-32">
              <img src={HERO_IMAGE_URL} alt="Bodega" className="absolute inset-0 w-full h-full object-cover brightness-[1.1]" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#080808]"></div>
              <div className="relative z-10 text-center px-6 max-w-5xl">
                <h2 className="text-4xl sm:text-6xl md:text-7xl font-serif text-white mb-6 drop-shadow-2xl">Reserva el <span className="text-[#C5A059] italic">Espacio</span></h2>
                <p className="text-slate-200 font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs drop-shadow-lg">Exclusividad absoluta para tus eventos privados</p>
              </div>
            </section>

            <section id="calendario" className="py-24 px-6 bg-[#080808] scroll-mt-20">
              <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16 items-start">
                <div className="lg:col-span-5">
                  <div className="mb-10"><h3 className="text-3xl md:text-5xl font-serif text-white mb-4">1. El Momento</h3><div className="w-16 h-1 bg-[#C5A059]"></div></div>
                  <Calendar 
                    selectedDate={selectedDate} 
                    onDateSelect={setSelectedDate} 
                    reservations={[...reservations.filter(r => r.status !== ReservationStatus.CANCELLED).map(r => ({ date: r.date, slot: r.slot })), ...tastings.map(t => ({ date: t.date, slot: t.slot }))]}
                    tastingDates={tastings.map(t => t.date)} 
                    blockedDates={blockedDates}
                  />
                </div>
                <div className="lg:col-span-7">
                  <div className="mb-10"><h3 className="text-3xl md:text-5xl font-serif text-white mb-4">2. Detalles del Evento</h3><div className="w-16 h-1 bg-[#C5A059]"></div></div>
                  <div className={`bg-[#141414] rounded-[2rem] p-8 md:p-12 border border-white/5 transition-all ${!selectedDate ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                    <form onSubmit={handleSubmit} className="space-y-10">
                      <div className="grid grid-cols-2 gap-4">
                        {[ReservationSlot.MIDDAY, ReservationSlot.NIGHT].map(slot => (
                          <button key={slot} type="button" onClick={() => setSelectedSlot(slot)} className={`px-4 py-5 rounded-2xl border text-center transition-all ${selectedSlot === slot ? 'bg-[#C5A059] text-black font-bold border-[#C5A059]' : 'border-white/10 text-white hover:border-[#C5A059]'}`}>
                            {slot === ReservationSlot.MIDDAY ? 'Comida' : 'Cena'}
                          </button>
                        ))}
                      </div>

                      <div className={`space-y-8 ${!selectedSlot ? 'opacity-20 pointer-events-none' : ''}`}>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <input type="text" required placeholder="Nombre completo" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-[#C5A059]" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                          <input type="tel" required placeholder="Teléfono" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-[#C5A059]" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="w-full bg-[#C5A059] text-black font-bold py-6 rounded-2xl hover:bg-white transition-all uppercase tracking-widest text-sm shadow-xl">
                          {isSubmitting ? 'Procesando...' : 'Solicitar Reserva'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {view === 'tastings' && <WineTastingsPublic externalTastings={tastings} />}

        {view === 'gallery' && <Gallery onBack={() => setView('home')} />}

        {view === 'admin' && (
          <div className="pt-32 min-h-screen bg-slate-50 text-slate-900">
            {!isAdminAuthenticated ? (
              <div className="flex items-center justify-center py-24 px-6">
                <form onSubmit={handleAdminLogin} className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-xl border text-center">
                  <h3 className="text-2xl font-serif mb-6">Acceso Admin</h3>
                  <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Contraseña" className="w-full bg-slate-50 border rounded-2xl px-6 py-4 text-center mb-6" />
                  {loginError && <p className="text-red-500 text-xs mb-4">Acceso Denegado</p>}
                  <button type="submit" className="w-full bg-black text-white font-bold py-5 rounded-2xl hover:bg-[#C5A059] uppercase text-xs tracking-widest">Entrar</button>
                </form>
              </div>
            ) : (
              <AdminDashboard 
                reservations={reservations} 
                onUpdateStatus={handleUpdateStatus}
                onUpdateCost={handleUpdateCost}
                onUpdateDeposit={handleUpdateDeposit}
                onUpdate={() => {}}
                onDelete={handleDelete}
                onImport={() => {}}
                onBackToBooking={() => setView('home')}
                onGoToWineConfig={() => setView('wine-config')}
                onGoToBlockedDays={() => setView('blocked-days')}
                onLogout={() => setIsAdminAuthenticated(false)}
              />
            )}
          </div>
        )}

        {view === 'wine-config' && isAdminAuthenticated && (
          <div className="pt-32 min-h-screen bg-slate-50 text-slate-900">
            <WineTastingConfig onBack={() => setView('admin')} onRefresh={fetchAllData} externalTastings={tastings} />
          </div>
        )}

        {view === 'blocked-days' && isAdminAuthenticated && (
          <div className="pt-32 min-h-screen bg-slate-50 text-slate-900">
            <BlockedDaysConfig onBack={() => { setView('admin'); fetchAllData(); }} />
          </div>
        )}
      </main>

      {showSuccessModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
          <div className="bg-[#141414] border border-[#C5A059]/30 p-10 rounded-[3rem] max-w-lg w-full text-center shadow-2xl">
            <h3 className="text-3xl font-serif text-white mb-4">Solicitud Recibida</h3>
            <p className="text-slate-400 mb-10">Nos pondremos en contacto pronto para confirmar.</p>
            <button onClick={() => setShowSuccessModal(false)} className="w-full bg-[#C5A059] text-black font-bold py-5 rounded-2xl uppercase text-xs">Entendido</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
