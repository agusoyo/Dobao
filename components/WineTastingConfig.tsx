
import React, { useState, useEffect, useRef } from 'react';
import { WineTasting, ReservationSlot, TastingAttendee } from '../types';
import { supabase } from '../services/supabaseClient';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

interface WineTastingConfigProps {
  onBack: () => void;
  onRefresh: () => void;
  externalTastings: WineTasting[];
}

const WineTastingConfig: React.FC<WineTastingConfigProps> = ({ onBack, onRefresh, externalTastings }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTastingId, setSelectedTastingId] = useState<string | null>(null);
  const [attendees, setAttendees] = useState<TastingAttendee[]>([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const [seatCounts, setSeatCounts] = useState<Record<string, number>>({});
  const [editingAttendee, setEditingAttendee] = useState<TastingAttendee | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    slot: ReservationSlot.NIGHT,
    maxCapacity: 12,
    pricePerPerson: 35,
    description: ''
  });

  const isEditing = !!selectedTastingId;

  const safeFormat = (date: string | Date | undefined, formatStr: string) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return isValid(d) ? format(d, formatStr, { locale: es }) : 'N/A';
  };

  const fetchAllSeatCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('tasting_attendees')
        .select('tasting_id, seats');
      
      if (error) throw error;

      const counts: Record<string, number> = {};
      (data || []).forEach(item => {
        counts[item.tasting_id] = (counts[item.tasting_id] || 0) + (item.seats || 0);
      });
      setSeatCounts(counts);
    } catch (err) {
      console.error("Error al cargar contadores de asientos:", err);
    }
  };

  useEffect(() => {
    fetchAllSeatCounts();
  }, [externalTastings]);

  useEffect(() => {
    if (selectedTastingId) {
      fetchAttendees(selectedTastingId);
    } else {
      setAttendees([]);
    }
  }, [selectedTastingId]);

  const fetchAttendees = async (tastingId: string) => {
    setLoadingAttendees(true);
    try {
      const { data, error } = await supabase
        .from('tasting_attendees')
        .select('*')
        .eq('tasting_id', tastingId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const mappedAttendees: TastingAttendee[] = (data || []).map(a => ({
        id: a.id,
        tastingId: a.tasting_id,
        name: a.name || a.customer_name || 'Invitado sin nombre',
        email: a.email,
        phone: a.phone,
        seats: a.seats,
        deposit: a.deposit || 0,
        createdAt: a.created_at
      }));
      
      setAttendees(mappedAttendees);
    } catch (err) {
      console.error("Error al cargar asistentes:", err);
    } finally {
      setLoadingAttendees(false);
    }
  };

  const handleSelectTasting = (t: WineTasting) => {
    setSelectedTastingId(t.id);
    setFormData({
      name: t.name,
      date: t.date,
      slot: t.slot,
      maxCapacity: t.maxCapacity,
      pricePerPerson: t.pricePerPerson,
      description: t.description || ''
    });
    
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleCancelEdit = () => {
    setSelectedTastingId(null);
    setFormData({
      name: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      slot: ReservationSlot.NIGHT,
      maxCapacity: 12,
      pricePerPerson: 35,
      description: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const capacity = parseInt(formData.maxCapacity.toString()) || 0;
      const price = parseFloat(formData.pricePerPerson.toString()) || 0;

      const payload = {
        name: formData.name,
        date: formData.date,
        slot: formData.slot,
        max_capacity: capacity,
        price_per_person: price,
        description: formData.description
      };

      if (isEditing && selectedTastingId) {
        const { error } = await supabase
          .from('wine_tastings')
          .update(payload)
          .eq('id', selectedTastingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('wine_tastings')
          .insert([payload]);
        if (error) throw error;
      }

      handleCancelEdit();
      await onRefresh();
      alert("Operación completada");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTasting = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('¿Seguro que desea eliminar esta cata completa?')) return;
    try {
      const { error } = await supabase.from('wine_tastings').delete().eq('id', id);
      if (error) throw error;
      if (selectedTastingId === id) handleCancelEdit();
      onRefresh();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleDeleteAttendee = async (attendeeId: string) => {
    if (!confirm('¿Seguro que desea eliminar esta reserva de asistente?')) return;
    try {
      const { error } = await supabase.from('tasting_attendees').delete().eq('id', attendeeId);
      if (error) throw error;
      if (selectedTastingId) {
        fetchAttendees(selectedTastingId);
        fetchAllSeatCounts();
      }
    } catch (err: any) {
      alert("Error al borrar asistente: " + err.message);
    }
  };

  const handleUpdateAttendee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAttendee) return;
    
    try {
      const { error } = await supabase
        .from('tasting_attendees')
        .update({
          name: editingAttendee.name,
          phone: editingAttendee.phone,
          email: editingAttendee.email,
          seats: editingAttendee.seats,
          deposit: editingAttendee.deposit
        })
        .eq('id', editingAttendee.id);
      
      if (error) throw error;
      
      setEditingAttendee(null);
      if (selectedTastingId) {
        fetchAttendees(selectedTastingId);
        fetchAllSeatCounts();
      }
    } catch (err: any) {
      alert("Error al actualizar asistente: " + err.message);
    }
  };

  const totalBookedSeats = attendees.reduce((acc, curr) => acc + (curr.seats || 0), 0);
  const totalDeposits = attendees.reduce((acc, curr) => acc + (curr.deposit || 0), 0);
  const currentPrice = formData.pricePerPerson || 0;

  return (
    <div className="pt-2 pb-20 px-4 md:px-8 max-w-7xl mx-auto text-slate-900">
      <div className="mb-12">
        <button onClick={onBack} className="text-indigo-600 font-bold text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2 hover:opacity-70 transition-opacity">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Volver al Panel Admin
        </button>
        <h2 className="text-2xl md:text-4xl font-serif">Gestión de Catas</h2>
        <p className="text-slate-500 text-[10px] mt-2 uppercase tracking-[0.2em] font-bold">Configuración y Reservas de Experiencias</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Formulario Izquierda */}
        <div className="lg:col-span-4" ref={formRef}>
          <div className={`bg-white p-8 rounded-[2.5rem] shadow-xl border transition-all duration-500 sticky top-32 ${isEditing ? 'border-[#C5A059] ring-2 ring-[#C5A059]/10' : 'border-slate-200'}`}>
            <h3 className="text-xl font-serif mb-6">{isEditing ? 'Editar Cata' : 'Nueva Cata'}</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Nombre del Evento</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#C5A059] outline-none" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Fecha</label>
                  <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Turno</label>
                  <select value={formData.slot} onChange={e => setFormData({...formData, slot: e.target.value as ReservationSlot})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none">
                    <option value={ReservationSlot.MIDDAY}>Comida</option>
                    <option value={ReservationSlot.NIGHT}>Cena</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Aforo</label>
                  <input required type="number" placeholder="Plazas" value={formData.maxCapacity} onChange={e => setFormData({...formData, maxCapacity: parseInt(e.target.value) || 0})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Precio (€)</label>
                  <input required type="number" step="0.01" placeholder="PVP" value={formData.pricePerPerson} onChange={e => setFormData({...formData, pricePerPerson: parseFloat(e.target.value) || 0})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Descripción y Vinos</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm min-h-[120px] outline-none focus:border-[#C5A059]" 
                  placeholder="Detalla los vinos que se probarán y el menú si lo hay..."
                />
              </div>

              <button type="submit" className={`w-full text-white font-bold py-5 rounded-xl uppercase tracking-widest text-[10px] transition-colors ${isEditing ? 'bg-[#C5A059] hover:bg-black' : 'bg-black hover:bg-[#C5A059]'}`}>
                {isSubmitting ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Publicar Cata')}
              </button>
              {isEditing && (
                <button type="button" onClick={handleCancelEdit} className="w-full text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-2 hover:text-red-500 transition-colors">Cancelar Edición</button>
              )}
            </form>
          </div>
        </div>

        {/* Listado Derecha */}
        <div className="lg:col-span-8 space-y-10">
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <h3 className="text-xl font-serif">Próximas Sesiones</h3>
            </div>
            <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
              {externalTastings.map(t => {
                const occupied = seatCounts[t.id] || 0;
                const free = Math.max(0, t.maxCapacity - occupied);
                return (
                  <div key={t.id} onClick={() => handleSelectTasting(t)} className={`p-6 cursor-pointer flex items-center justify-between border-l-4 ${selectedTastingId === t.id ? 'bg-[#C5A059]/10 border-[#C5A059]' : 'hover:bg-slate-50 border-transparent'}`}>
                    <div>
                      <span className="text-xs font-bold text-[#C5A059] uppercase tracking-tighter">{safeFormat(t.date, 'dd MMM yyyy')}</span>
                      <h4 className="text-lg font-serif">{t.name}</h4>
                      <div className="flex gap-4 mt-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Reservadas: {occupied}</span>
                        <span className={`text-[9px] font-bold uppercase ${free === 0 ? 'text-red-500' : 'text-emerald-600'}`}>Libres: {free}</span>
                      </div>
                    </div>
                    <button onClick={(e) => handleDeleteTasting(t.id, e)} className="p-3 text-slate-200 hover:text-red-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedTastingId && (
            <div className="bg-white rounded-[2.5rem] shadow-2xl border-2 border-[#C5A059]/20 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
              <div className="p-8 border-b border-slate-100 bg-[#C5A059]/5 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-serif">Asistentes Confirmados</h3>
                  <p className="text-[10px] font-bold text-[#C5A059] uppercase tracking-widest mt-1">{totalBookedSeats} plazas / {formData.maxCapacity} total</p>
                </div>
                <div className="flex gap-4">
                  <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm text-center">
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Cobrado</div>
                    <div className="text-2xl font-serif text-emerald-600 leading-none">{totalDeposits}€</div>
                  </div>
                  <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm text-center">
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Pendiente</div>
                    <div className="text-2xl font-serif text-amber-600 leading-none">{(totalBookedSeats * currentPrice) - totalDeposits}€</div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase">Nombre / Contacto</th>
                      <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase text-center">Plazas</th>
                      <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase text-center">Depósito</th>
                      <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase text-center">Pendiente</th>
                      <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendees.map(a => {
                      const totalCost = a.seats * currentPrice;
                      const pending = Math.max(0, totalCost - (a.deposit || 0));
                      return (
                        <tr key={a.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-8 py-4">
                            <div className="font-bold text-slate-900">{a.name}</div>
                            <div className="text-[10px] text-slate-500 font-medium">{a.phone}</div>
                            <div className="text-[10px] text-slate-400">{a.email}</div>
                          </td>
                          <td className="px-8 py-4 text-center font-black text-slate-600">{a.seats}</td>
                          <td className="px-8 py-4 text-center">
                            <span className={`px-2 py-1 rounded text-[11px] font-bold ${a.deposit && a.deposit > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                              {a.deposit || 0}€
                            </span>
                          </td>
                          <td className="px-8 py-4 text-center">
                            <span className={`px-2 py-1 rounded text-[11px] font-bold ${pending > 0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                              {pending}€
                            </span>
                          </td>
                          <td className="px-8 py-4 text-right flex justify-end gap-2">
                            <button onClick={() => setEditingAttendee(a)} className="p-2 text-slate-300 hover:text-indigo-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            <button onClick={() => handleDeleteAttendee(a.id)} className="p-2 text-slate-300 hover:text-red-500">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {editingAttendee && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl border-2 border-[#C5A059]/30">
            <h3 className="text-xl font-serif mb-6 text-slate-900 text-center">Editar Reserva</h3>
            <form onSubmit={handleUpdateAttendee} className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Nombre del Asistente</label>
                <input required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:border-[#C5A059] outline-none" value={editingAttendee.name} onChange={e => setEditingAttendee({...editingAttendee, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Plazas</label>
                  <input type="number" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm outline-none" value={editingAttendee.seats} onChange={e => setEditingAttendee({...editingAttendee, seats: parseInt(e.target.value) || 1})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#C5A059] uppercase tracking-widest mb-2 block">Dinero Entregado (€)</label>
                  <input type="number" step="0.01" className="w-full bg-[#C5A059]/5 border border-[#C5A059]/30 rounded-2xl px-5 py-3 text-sm font-bold text-[#C5A059] outline-none" value={editingAttendee.deposit || 0} onChange={e => setEditingAttendee({...editingAttendee, deposit: parseFloat(e.target.value) || 0})} />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setEditingAttendee(null)} className="flex-1 text-[10px] font-bold uppercase py-4 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 bg-black text-white text-[10px] font-bold uppercase py-4 rounded-2xl hover:bg-[#C5A059] transition-colors shadow-lg shadow-black/10">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WineTastingConfig;
