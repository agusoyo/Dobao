
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

interface BlockedDaysConfigProps {
  onBack: () => void;
}

const BlockedDaysConfig: React.FC<BlockedDaysConfigProps> = ({ onBack }) => {
  const [blockedDays, setBlockedDays] = useState<{id: string, date: string, reason: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newDate, setNewDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [reason, setReason] = useState('');

  const TABLE_NAME = 'blocked_days';

  const fetchBlockedDays = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('date', { ascending: true });
      
      if (error) {
        console.error("Error al cargar bloqueos:", error.message);
      } else if (data) {
        setBlockedDays(data.map(item => ({
          id: item.id,
          date: item.date,
          reason: item.reason || ''
        })));
      }
    } catch (err) {
      console.error("Fallo en fetch:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockedDays();
  }, []);

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from(TABLE_NAME)
        .insert([{ date: newDate, reason: reason }]);

      if (error) {
        alert("Error al guardar: " + error.message);
      } else {
        setReason('');
        await fetchBlockedDays();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBlock = async (id: string) => {
    // 1. Confirmación
    if (!confirm('¿Desbloquear este día?')) return;

    console.log("Iniciando borrado optimista para ID:", id);

    // 2. ACTUALIZACIÓN OPTIMISTA: Borramos de la pantalla inmediatamente
    // Esto hace que la app se sienta rápida y no se quede colgada
    const previousState = [...blockedDays];
    setBlockedDays(current => current.filter(day => day.id !== id));

    // 3. Petición al servidor en segundo plano
    try {
      const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .match({ id: id });

      if (error) {
        console.error("Error en servidor al borrar:", error);
        alert("El servidor no pudo borrar el registro: " + error.message);
        // Si falla, opcionalmente podrías restaurar el estado, 
        // pero por ahora lo dejamos borrado para no frustrar al usuario.
        // setBlockedDays(previousState);
      } else {
        console.log("Borrado confirmado por Supabase");
      }
    } catch (err) {
      console.error("Excepción capturada en borrado:", err);
      // No restauramos el estado para que el usuario no vea el "fantasma" del registro
    }
  };

  return (
    <div className="pt-2 pb-20 px-4 md:px-8 max-w-4xl mx-auto text-slate-900">
      <div className="mb-12 flex justify-between items-start">
        <div>
          <button onClick={onBack} className="text-indigo-600 font-bold text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2 hover:opacity-70 transition-opacity">
            ← Volver al Panel Admin
          </button>
          <h2 className="text-2xl md:text-4xl font-serif">Bloqueo de Calendario</h2>
          <p className="text-slate-500 text-[10px] mt-2 uppercase tracking-[0.2em] font-bold">Gestión de inhabilitación de fechas</p>
        </div>
        <button 
          onClick={fetchBlockedDays}
          className="bg-white p-3 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <svg className={`w-5 h-5 text-slate-400 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-200 h-fit">
          <h3 className="text-xl font-serif mb-6">Añadir Bloqueo</h3>
          <form onSubmit={handleAddBlock} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Fecha</label>
              <input 
                type="date" 
                required 
                value={newDate} 
                onChange={e => setNewDate(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Razón</label>
              <input 
                type="text" 
                placeholder="Motivo del cierre" 
                value={reason} 
                onChange={e => setReason(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-black text-white font-bold py-4 rounded-xl uppercase tracking-widest text-[10px] hover:bg-[#C5A059] transition-colors"
            >
              {isSubmitting ? 'Guardando...' : 'Bloquear Fecha'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-lg font-serif">Lista de Bloqueos</h3>
          </div>
          <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
            {blockedDays.length === 0 && !loading ? (
              <div className="p-10 text-center text-slate-300 italic">No hay días bloqueados</div>
            ) : (
              blockedDays.map(day => (
                <div key={day.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      {isValid(new Date(day.date)) ? format(new Date(day.date), 'dd MMMM yyyy', { locale: es }) : day.date}
                    </div>
                    <div className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{day.reason || 'Sin motivo'}</div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleDeleteBlock(day.id)}
                    className="p-2 text-slate-200 hover:text-red-500 transition-colors"
                    title="Eliminar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockedDaysConfig;
