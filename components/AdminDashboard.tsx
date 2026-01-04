
import React, { useState, useMemo } from 'react';
import { Reservation, ReservationStatus, ReservationSlot } from '../types';
import { format, getYear, getMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AdminDashboardProps {
  reservations: Reservation[];
  onUpdateStatus: (id: string, status: ReservationStatus) => void;
  onUpdateCost: (id: string, cost: number) => void;
  onUpdate: (reservation: Reservation) => void;
  onDelete: (id: string) => void;
  onImport: (newReservations: Reservation[]) => void;
  onBackToBooking: () => void;
  onLogout?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  reservations, onUpdateStatus, onUpdateCost, onDelete, onBackToBooking, onLogout 
}) => {
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());

  const filteredReservations = useMemo(() => {
    return reservations.filter(res => {
      const resDate = new Date(res.date);
      const matchYear = filterYear === 'all' || getYear(resDate).toString() === filterYear;
      const matchMonth = filterMonth === 'all' || getMonth(resDate).toString() === filterMonth;
      return matchYear && matchMonth;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [reservations, filterMonth, filterYear]);

  const handleExportExcel = () => {
    const dataToExport = filteredReservations.map(res => ({
      Fecha: format(new Date(res.date), 'dd/MM/yyyy'),
      Turno: res.slot === ReservationSlot.MIDDAY ? 'Comida' : 'Cena',
      Cliente: res.customerName,
      Teléfono: res.phone,
      Email: res.email,
      Invitados: res.guests,
      Peticiones: res.comments || '',
      'Coste (€)': res.eventCost || 0,
      Estado: res.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reservas");
    XLSX.writeFile(workbook, `Dobao_Gourmet_Reservas_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Dobao Gourmet - Listado de Reservas", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generado el: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);

    const tableRows = filteredReservations.map(res => [
      format(new Date(res.date), 'dd/MM/yyyy'),
      res.slot === ReservationSlot.MIDDAY ? 'Comida' : 'Cena',
      res.customerName,
      res.phone,
      `${res.eventCost || 0} €`,
      res.status
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Fecha', 'Turno', 'Cliente', 'Teléfono', 'Coste', 'Estado']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [197, 160, 89] }
    });

    doc.save(`Dobao_Gourmet_Reservas_${format(new Date(), 'yyyyMMdd')}.pdf`);
  };

  return (
    <div className="pt-2 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex gap-4 mb-4">
            <button onClick={onBackToBooking} className="text-indigo-600 font-bold text-[10px] uppercase tracking-widest">← Volver a Web</button>
            {onLogout && <button onClick={onLogout} className="text-red-500 font-bold text-[10px] uppercase tracking-widest">Cerrar Sesión</button>}
          </div>
          <h2 className="text-2xl md:text-4xl font-serif text-slate-900">Registro de Eventos</h2>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          {/* Botones de Exportación */}
          <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
            <button 
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Excel
            </button>
            <button 
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-rose-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              PDF
            </button>
          </div>

          <div className="flex gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
            <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="bg-slate-50 border-none text-xs font-bold rounded-lg py-2 px-4 uppercase tracking-widest outline-none">
              <option value="all">Años</option>
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="bg-slate-50 border-none text-xs font-bold rounded-lg py-2 px-4 uppercase tracking-widest outline-none">
              <option value="all">Meses</option>
              {[...Array(12)].map((_, i) => <option key={i} value={i}>{format(new Date(2000, i, 1), 'MMMM', { locale: es })}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fecha / Turno</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cliente</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detalles y Peticiones</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Coste (€)</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estado</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReservations.map((res) => (
                <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="font-bold text-slate-900">{format(new Date(res.date), 'dd MMM yy', { locale: es })}</div>
                    <div className="text-[10px] font-bold text-[#C5A059] uppercase tracking-wider">{res.slot === ReservationSlot.MIDDAY ? 'COMIDA' : 'CENA'}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="font-semibold text-slate-900">{res.customerName}</div>
                    <div className="text-xs text-slate-500">{res.phone}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="max-w-[250px]">
                       <p className="text-[11px] text-slate-600 line-clamp-3 italic" title={res.comments}>
                        {res.comments ? `"${res.comments}"` : <span className="text-slate-300">Sin peticiones</span>}
                       </p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        value={res.eventCost || 0}
                        onChange={(e) => onUpdateCost(res.id, parseFloat(e.target.value) || 0)}
                        className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-indigo-700 outline-none focus:border-indigo-500"
                        placeholder="0.00"
                      />
                      <span className="text-slate-400 font-bold text-xs">€</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <select 
                      value={res.status}
                      onChange={(e) => onUpdateStatus(res.id, e.target.value as ReservationStatus)}
                      className={`text-[10px] font-bold px-3 py-2 rounded-xl border outline-none cursor-pointer ${
                        res.status === ReservationStatus.CONFIRMED ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                        res.status === ReservationStatus.CANCELLED ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      <option value={ReservationStatus.PENDING}>Pendiente</option>
                      <option value={ReservationStatus.CONFIRMED}>Validado</option>
                      <option value={ReservationStatus.CANCELLED}>Cancelado</option>
                    </select>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button onClick={() => onDelete(res.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredReservations.length === 0 && <div className="p-20 text-center text-slate-400 italic">No hay registros para este periodo.</div>}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
