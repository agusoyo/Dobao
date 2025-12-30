
import React, { useState, useMemo } from 'react';
import { Reservation, ReservationStatus, ReservationSlot } from '../types';
import { format, getYear, getMonth, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface AdminDashboardProps {
  reservations: Reservation[];
  onUpdateStatus: (id: string, status: ReservationStatus) => void;
  onUpdate: (reservation: Reservation) => void;
  onDelete: (id: string) => void;
  onBackToBooking: () => void;
  onLogout?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  reservations, onUpdateStatus, onUpdate, onDelete, onBackToBooking, onLogout 
}) => {
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());

  const filteredReservations = useMemo(() => {
    return reservations.filter(res => {
      const resDate = parseISO(res.date);
      const matchYear = filterYear === 'all' || getYear(resDate).toString() === filterYear;
      const matchMonth = filterMonth === 'all' || getMonth(resDate).toString() === filterMonth;
      return matchYear && matchMonth;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [reservations, filterMonth, filterYear]);

  const yearOptions = useMemo(() => {
    const years = new Set<number>();
    years.add(new Date().getFullYear());
    reservations.forEach(r => years.add(getYear(parseISO(r.date))));
    return Array.from(years).sort((a, b) => b - a);
  }, [reservations]);

  const getSlotLabel = (slot: ReservationSlot) => {
    return slot === ReservationSlot.MIDDAY ? 'Mediodía (12-16h)' : 'Noche (20-00h)';
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div>
          <div className="flex gap-4 mb-4">
            <button onClick={onBackToBooking} className="text-indigo-600 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">← Volver a Web</button>
            {onLogout && (
              <button onClick={onLogout} className="text-red-500 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 ml-4">Cerrar Sesión</button>
            )}
          </div>
          <h2 className="text-4xl font-serif text-slate-900">Gestión de Reservas</h2>
        </div>

        <div className="flex gap-4 bg-white p-3 rounded-2xl border border-slate-200">
          <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="bg-slate-50 border-none text-xs font-bold rounded-lg py-2 px-4 uppercase tracking-widest outline-none">
            <option value="all">Años</option>
            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="bg-slate-50 border-none text-xs font-bold rounded-lg py-2 px-4 uppercase tracking-widest outline-none">
            <option value="all">Meses</option>
            {[...Array(12)].map((_, i) => <option key={i} value={i}>{format(new Date(2000, i, 1), 'MMMM', { locale: es })}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Fecha y Turno</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Cliente</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Pack</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Estado</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReservations.map((res) => (
                <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="font-bold text-slate-900">{format(parseISO(res.date), 'dd MMMM yyyy', { locale: es })}</div>
                    <div className="text-[10px] font-bold text-[#C5A059] uppercase tracking-wider mt-1">{getSlotLabel(res.slot)}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="font-semibold text-slate-900">{res.customerName}</div>
                    <div className="text-xs text-slate-500">{res.phone}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-wrap gap-1">
                      {res.services.catering && <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-md text-[8px] font-bold uppercase">Catering</span>}
                      {res.services.vinoteca && <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-md text-[8px] font-bold uppercase">Vinoteca</span>}
                      {res.services.multimedia && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[8px] font-bold uppercase">Multimedia</span>}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${res.status === ReservationStatus.CONFIRMED ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {res.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right space-x-3">
                    {res.status !== ReservationStatus.CONFIRMED && (
                      <button onClick={() => onUpdateStatus(res.id, ReservationStatus.CONFIRMED)} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-tighter">Confirmar</button>
                    )}
                    <button onClick={() => onDelete(res.id)} className="text-[10px] font-bold text-red-400 hover:text-red-600 uppercase tracking-tighter">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredReservations.length === 0 && (
            <div className="p-20 text-center text-slate-400 italic">No hay reservas para este periodo.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
