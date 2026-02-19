
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { format, isValid, startOfWeek, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { WeeklyPrice, SpecialPrice } from '../types';

interface PricingConfigProps {
  onBack: () => void;
  onRefresh: () => void;
}

const PricingConfig: React.FC<PricingConfigProps> = ({ onBack, onRefresh }) => {
  const [weeklyPrices, setWeeklyPrices] = useState<WeeklyPrice[]>([]);
  const [specialPrices, setSpecialPrices] = useState<SpecialPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado para nueva tarifa especial
  const [newSpecial, setNewSpecial] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    price: 250,
    reason: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [weeklyRes, specialRes] = await Promise.all([
        supabase.from('weekly_prices').select('*').order('day_of_week', { ascending: true }),
        supabase.from('special_prices').select('*').order('date', { ascending: true })
      ]);

      if (weeklyRes.data) setWeeklyPrices(weeklyRes.data);
      if (specialRes.data) setSpecialPrices(specialRes.data);
    } catch (err) {
      console.error("Error cargando precios:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateWeekly = async (day: number, price: number) => {
    const { error } = await supabase
      .from('weekly_prices')
      .upsert({ day_of_week: day, price });
    
    if (!error) {
      setWeeklyPrices(prev => prev.map(p => p.day_of_week === day ? { ...p, price } : p));
    }
  };

  const handleAddSpecial = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await supabase
      .from('special_prices')
      .insert([newSpecial]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      setNewSpecial({ ...newSpecial, reason: '' });
      fetchData();
      onRefresh();
    }
    setIsSubmitting(false);
  };

  const handleDeleteSpecial = async (id: string) => {
    if (!confirm('¿Eliminar esta tarifa especial?')) return;
    const { error } = await supabase.from('special_prices').delete().eq('id', id);
    if (!error) {
      fetchData();
      onRefresh();
    }
  };

  const getDayName = (dayIndex: number) => {
    const start = startOfWeek(new Date(), { weekStartsOn: 0 });
    return format(addDays(start, dayIndex), 'EEEE', { locale: es });
  };

  // Reordenar para que empiece en Lunes para el usuario (1,2,3,4,5,6,0)
  const orderedWeekly = [...weeklyPrices].sort((a, b) => {
    const aVal = a.day_of_week === 0 ? 7 : a.day_of_week;
    const bVal = b.day_of_week === 0 ? 7 : b.day_of_week;
    return aVal - bVal;
  });

  return (
    <div className="pt-2 pb-20 px-4 md:px-8 max-w-6xl mx-auto text-slate-900">
      <div className="mb-12">
        <button onClick={onBack} className="text-indigo-600 font-bold text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
          ← Volver al Panel Admin
        </button>
        <h2 className="text-2xl md:text-4xl font-serif">Configuración de Tarifas</h2>
        <p className="text-slate-500 text-[10px] mt-2 uppercase tracking-[0.2em] font-bold">Gestión de Precios Base y Excepciones</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Precios Semanales */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-200">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
            <h3 className="text-xl font-serif">Tarifa Base Semanal</h3>
          </div>
          
          <div className="space-y-4">
            {orderedWeekly.map((wp) => (
              <div key={wp.day_of_week} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-colors group">
                <span className="font-bold text-slate-700 capitalize text-sm">{getDayName(wp.day_of_week)}</span>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" 
                    value={wp.price}
                    onChange={(e) => handleUpdateWeekly(wp.day_of_week, parseFloat(e.target.value) || 0)}
                    className="w-24 bg-white border border-slate-200 rounded-xl px-3 py-2 text-right font-black text-indigo-600 outline-none focus:ring-2 ring-indigo-500/20"
                  />
                  <span className="text-xs font-bold text-slate-400">€</span>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-[10px] text-slate-400 italic">Los cambios se guardan automáticamente y afectan a nuevas reservas.</p>
        </div>

        {/* Tarifas Especiales */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-200">
            <h3 className="text-xl font-serif mb-6">Añadir Tarifa Especial</h3>
            <form onSubmit={handleAddSpecial} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Fecha</label>
                  <input 
                    type="date" 
                    required 
                    value={newSpecial.date} 
                    onChange={e => setNewSpecial({...newSpecial, date: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Precio (€)</label>
                  <input 
                    type="number" 
                    required 
                    value={newSpecial.price} 
                    onChange={e => setNewSpecial({...newSpecial, price: parseFloat(e.target.value) || 0})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Motivo (Ej: Navidad)</label>
                <input 
                  type="text" 
                  value={newSpecial.reason} 
                  onChange={e => setNewSpecial({...newSpecial, reason: e.target.value})} 
                  placeholder="Ej: Festivo Local"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none"
                />
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-black text-white font-bold py-4 rounded-xl uppercase tracking-widest text-[10px] hover:bg-[#C5A059] transition-colors"
              >
                {isSubmitting ? 'Guardando...' : 'Establecer Tarifa'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-serif">Tarifas Especiales Activas</h3>
            </div>
            <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
              {specialPrices.length === 0 ? (
                <div className="p-10 text-center text-slate-300 italic">No hay tarifas especiales configuradas</div>
              ) : (
                specialPrices.map(sp => (
                  <div key={sp.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="text-sm font-bold text-slate-900">{format(new Date(sp.date), 'dd MMMM yyyy', { locale: es })}</div>
                      <div className="text-[10px] text-[#C5A059] font-bold uppercase tracking-wider">{sp.reason || 'Día Especial'}</div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-lg font-serif text-indigo-600">{sp.price}€</span>
                      <button onClick={() => handleDeleteSpecial(sp.id)} className="p-2 text-slate-200 hover:text-red-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingConfig;
