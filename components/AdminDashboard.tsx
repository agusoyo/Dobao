
import React, { useState, useMemo } from 'react';
import { Reservation, ReservationStatus } from '../types';
import { format, getMonth, getYear, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface AdminDashboardProps {
  reservations: Reservation[];
  onUpdateStatus: (id: string, status: ReservationStatus) => void;
  onUpdate: (reservation: Reservation) => void;
  onDelete: (id: string) => void;
  onBackToBooking: () => void; // Nuevo prop para navegar de vuelta
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  reservations, 
  onUpdateStatus, 
  onUpdate, 
  onDelete,
  onBackToBooking 
}) => {
  const [editingRes, setEditingRes] = useState<Reservation | null>(null);
  
  // Estados para los filtros
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());

  // Generar opciones de años dinámicamente basados en las reservas + año actual
  const yearOptions = useMemo(() => {
    const years = new Set<number>();
    years.add(new Date().getFullYear());
    reservations.forEach(r => years.add(getYear(parseISO(r.date))));
    return Array.from(years).sort((a, b) => b - a);
  }, [reservations]);

  const monthOptions = [
    { value: '0', label: 'Enero' },
    { value: '1', label: 'Febrero' },
    { value: '2', label: 'Marzo' },
    { value: '3', label: 'Abril' },
    { value: '4', label: 'Mayo' },
    { value: '5', label: 'Junio' },
    { value: '6', label: 'Julio' },
    { value: '7', label: 'Agosto' },
    { value: '8', label: 'Septiembre' },
    { value: '9', label: 'Octubre' },
    { value: '10', label: 'Noviembre' },
    { value: '11', label: 'Diciembre' },
  ];

  // Aplicar filtros
  const filteredReservations = useMemo(() => {
    return reservations
      .filter(res => {
        const resDate = parseISO(res.date);
        const matchYear = filterYear === 'all' || getYear(resDate).toString() === filterYear;
        const matchMonth = filterMonth === 'all' || getMonth(resDate).toString() === filterMonth;
        return matchYear && matchMonth;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [reservations, filterMonth, filterYear]);

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRes) {
      onUpdate(editingRes);
      setEditingRes(null);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <button 
              onClick={onBackToBooking}
              className="group flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold text-xs uppercase tracking-widest transition-all"
            >
              <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Volver a la web de reservas
            </button>
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Panel de Administración</h2>
          <p className="text-slate-500 mt-1">Gestiona y edita todas las reservas del Txoko</p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1">Año</label>
            <select 
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="bg-slate-50 border-none text-sm font-semibold text-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 py-2 pl-3 pr-8 cursor-pointer"
            >
              <option value="all">Todos los años</option>
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1">Mes</label>
            <select 
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="bg-slate-50 border-none text-sm font-semibold text-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 py-2 pl-3 pr-8 cursor-pointer"
            >
              <option value="all">Todos los meses</option>
              {monthOptions.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>

          <div className="h-10 w-px bg-slate-100 mx-2 hidden sm:block"></div>

          <div className="flex gap-4 px-2">
            <div className="text-center">
              <span className="block text-lg font-bold text-indigo-600 leading-tight">{filteredReservations.length}</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">Filtradas</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Detalles</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReservations.map((res) => (
                <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">
                      {format(parseISO(res.date), 'dd MMM yyyy', { locale: es })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{res.customerName}</div>
                    <div className="text-sm text-slate-500">{res.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-700">{res.purpose}</div>
                    <div className="text-sm text-slate-500">{res.guests} comensales</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${res.status === ReservationStatus.CONFIRMED ? 'bg-green-100 text-green-800' : ''}
                      ${res.status === ReservationStatus.PENDING ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${res.status === ReservationStatus.CANCELLED ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {res.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-3">
                      {res.status === ReservationStatus.PENDING && (
                        <button 
                          onClick={() => onUpdateStatus(res.id, ReservationStatus.CONFIRMED)}
                          className="text-green-600 hover:text-green-800 font-bold text-xs uppercase"
                        >
                          Confirmar
                        </button>
                      )}
                      <button 
                        onClick={() => setEditingRes(res)}
                        className="text-indigo-600 hover:text-indigo-800 font-bold text-xs uppercase"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => onDelete(res.id)}
                        className="text-red-600 hover:text-red-800 font-bold text-xs uppercase"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredReservations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                    No se encontraron reservas para el periodo seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingRes && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">Editar Reserva</h3>
              <button onClick={() => setEditingRes(null)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleEditSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Nombre del Cliente</label>
                <input 
                  type="text" 
                  value={editingRes.customerName}
                  onChange={e => setEditingRes({...editingRes, customerName: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Fecha (YYYY-MM-DD)</label>
                  <input 
                    type="date" 
                    value={editingRes.date}
                    onChange={e => setEditingRes({...editingRes, date: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nº Comensales</label>
                  <input 
                    type="number" 
                    value={editingRes.guests}
                    onChange={e => setEditingRes({...editingRes, guests: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Motivo/Evento</label>
                <input 
                  type="text" 
                  value={editingRes.purpose}
                  onChange={e => setEditingRes({...editingRes, purpose: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Estado</label>
                <select 
                  value={editingRes.status}
                  onChange={e => setEditingRes({...editingRes, status: e.target.value as ReservationStatus})}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={ReservationStatus.PENDING}>PENDIENTE</option>
                  <option value={ReservationStatus.CONFIRMED}>CONFIRMADA</option>
                  <option value={ReservationStatus.CANCELLED}>CANCELADA</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setEditingRes(null)}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
