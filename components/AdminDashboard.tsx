
import React, { useState, useMemo } from 'react';
import { Reservation, ReservationStatus } from '../types';
import { format, getYear, getMonth, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface AdminDashboardProps {
  reservations: Reservation[];
  onUpdateStatus: (id: string, status: ReservationStatus) => void;
  onUpdate: (reservation: Reservation) => void;
  onDelete: (id: string) => void;
  onBackToBooking: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  reservations, onUpdateStatus, onUpdate, onDelete, onBackToBooking 
}) => {
  const [editingRes, setEditingRes] = useState<Reservation | null>(null);
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

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div>
          <button onClick={onBackToBooking} className="text-indigo-600 font-bold text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">← Volver a Web</button>
          <h2 className="text-4xl font-serif text-slate-900">Gestión de Reservas</h2>
        </div>

        <div className="flex gap-4 bg-white p-3 rounded-2xl border border-slate-200">
          <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="bg-slate-50 border-none text-xs font-bold rounded-lg py-2 px-4 uppercase tracking-widest">
            <option value="all">Todos los años</option>
            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="bg-slate-50 border-none text-xs font-bold rounded-lg py-2 px-4 uppercase tracking-widest">
            <option value="all">Todos los meses</option>
            {[...Array(12)].map((_, i) => <option key={i} value={i}>{format(new Date(2000, i, 1), 'MMMM', { locale: es })}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Fecha / Evento</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Cliente</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Servicios Pack</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Estado</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReservations.map((res) => (
                <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="font-bold text-slate-900">{format(parseISO(res.date), 'dd MMMM yyyy', { locale: es })}</div>
                    <div className="text-sm text-slate-500 italic">{res.purpose}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="font-semibold">{res.customerName}</div>
                    <div className="text-xs text-slate-400">{res.phone}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-wrap gap-1">
                      {res.services.catering && <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-md text-[9px] font-bold uppercase tracking-wider">Catering</span>}
                      {res.services.vinoteca && <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-md text-[9px] font-bold uppercase tracking-wider">Vinoteca</span>}
                      {res.services.multimedia && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[9px] font-bold uppercase tracking-wider">Multimedia</span>}
                      {res.services.cleaning && <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-md text-[9px] font-bold uppercase tracking-wider">Limpieza</span>}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${res.status === ReservationStatus.CONFIRMED ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {res.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right space-x-4">
                    <button onClick={() => onUpdateStatus(res.id, ReservationStatus.CONFIRMED)} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 uppercase">Confirmar</button>
                    <button onClick={() => onDelete(res.id)} className="text-xs font-bold text-red-400 hover:text-red-600 uppercase">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
