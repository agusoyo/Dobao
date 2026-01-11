
import React, { useState, useMemo } from 'react';
import { Reservation, ReservationStatus, ReservationSlot } from '../types';
import { format, getYear, getMonth, isValid } from 'date-fns';
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
  onGoToWineConfig?: () => void;
  onLogout?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  reservations, onUpdateStatus, onUpdateCost, onDelete, onBackToBooking, onGoToWineConfig, onLogout 
}) => {
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());

  const safeFormat = (date: string | Date | undefined, formatStr: string) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return isValid(d) ? format(d, formatStr, { locale: es }) : 'N/A';
  };

  const filteredReservations = useMemo(() => {
    return reservations.filter(res => {
      const resDate = new Date(res.date);
      if (!isValid(resDate)) return false;
      
      const matchYear = filterYear === 'all' || getYear(resDate).toString() === filterYear;
      const matchMonth = filterMonth === 'all' || getMonth(resDate).toString() === filterMonth;
      return matchYear && matchMonth;
    }).sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return da - db;
    });
  }, [reservations, filterMonth, filterYear]);

  const getActiveServicesText = (services: any) => {
    const names: Record<string, string> = {
      catering: 'Catering',
      cleaning: 'Limpieza',
      multimedia: 'Multimedia',
      vinoteca: 'Vinoteca',
      beerEstrella: 'Estrella',
      beer1906: '1906'
    };
    return Object.entries(services || {})
      .filter(([_, active]) => active)
      .map(([key]) => names[key] || key)
      .join(', ');
  };

  const handleSystemSnapshot = () => {
    const snapshot = {
      backupDate: new Date().toISOString(),
      version: "1.3.0",
      data: reservations
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snapshot, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `Dobao_Full_Backup_${format(new Date(), 'yyyyMMdd')}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleExportExcel = () => {
    const dataToExport = filteredReservations.map(res => ({
      Fecha: safeFormat(res.date, 'dd/MM/yyyy'),
      Turno: res.slot === ReservationSlot.MIDDAY ? 'Comida' : 'Cena',
      Cliente: res.customerName,
      Teléfono: res.phone,
      Invitados: res.guests,
      Servicios: getActiveServicesText(res.services),
      Peticiones: res.comments || '',
      'Coste (€)': res.eventCost || 0,
      Estado: res.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reservas");
    XLSX.writeFile(workbook, `Dobao_Eventos_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Dobao Gourmet - Registro de Eventos", 14, 20);
    
    const tableRows = filteredReservations.map(res => [
      safeFormat(res.date, 'dd/MM/yyyy'),
      res.slot === ReservationSlot.MIDDAY ? 'Comida' : 'Cena',
      res.customerName,
      getActiveServicesText(res.services),
      `${res.eventCost || 0} €`,
      res.status
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['Fecha', 'Turno', 'Cliente', 'Servicios', 'Coste', 'Estado']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [197, 160, 89] },
      styles: { fontSize: 8 }
    });

    doc.save(`Dobao_Eventos_${format(new Date(), 'yyyyMMdd')}.pdf`);
  };

  return (
    <div className="pt-2 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex gap-4 mb-4">
            <button onClick={onBackToBooking} className="text-indigo-600 font-bold text-[10px] uppercase tracking-widest">← Volver a Web</button>
            <button onClick={onGoToWineConfig} className="text-[#C5A059] font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/></svg>
              Configurar Catas
            </button>
            {onLogout && <button onClick={onLogout} className="text-red-500 font-bold text-[10px] uppercase tracking-widest">Cerrar Sesión</button>}
          </div>
          <h2 className="text-2xl md:text-4xl font-serif text-slate-900">Registro de Eventos</h2>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
            <button onClick={handleSystemSnapshot} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-indigo-100 transition-colors" title="Copia de seguridad completa">Snapshot</button>
            <button onClick={handleExportExcel} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-100 transition-colors">Excel</button>
            <button onClick={handleExportPDF} className="px-4 py-2 bg-rose-50 text-rose-700 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-rose-100 transition-colors">PDF</button>
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
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Servicios y Peticiones</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Coste (€)</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estado</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReservations.map((res) => (
                <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="font-bold text-slate-900">{safeFormat(res.date, 'dd MMM yy')}</div>
                    <div className="text-[10px] font-bold text-[#C5A059] uppercase tracking-wider">{res.slot === ReservationSlot.MIDDAY ? 'COMIDA' : 'CENA'}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="font-semibold text-slate-900">{res.customerName}</div>
                    <div className="text-xs text-slate-500">{res.phone}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="max-w-[300px] space-y-2">
                       <p className="text-[11px] text-slate-600 line-clamp-2 italic" title={res.comments}>
                        {res.comments ? `"${res.comments}"` : <span className="text-slate-300">Sin comentarios adicionales</span>}
                       </p>
                       <div className="flex flex-wrap gap-1">
                          {res.services.cleaning && <span className="px-1.5 py-0.5 bg-slate-100 text-[8px] font-bold text-slate-500 rounded uppercase border border-slate-200">Limpieza</span>}
                          {res.services.catering && <span className="px-1.5 py-0.5 bg-amber-50 text-[8px] font-bold text-amber-600 rounded uppercase border border-amber-100">Catering</span>}
                          {res.services.vinoteca && <span className="px-1.5 py-0.5 bg-purple-50 text-[8px] font-bold text-purple-600 rounded uppercase border border-purple-100">Vinoteca</span>}
                          {res.services.multimedia && <span className="px-1.5 py-0.5 bg-blue-50 text-[8px] font-bold text-blue-600 rounded uppercase border border-blue-100">Multimedia</span>}
                          {res.services.beerEstrella && <span className="px-1.5 py-0.5 bg-red-50 text-[8px] font-bold text-red-600 rounded uppercase border border-red-100">Estrella</span>}
                          {res.services.beer1906 && <span className="px-1.5 py-0.5 bg-stone-100 text-[8px] font-bold text-stone-600 rounded uppercase border border-stone-200">1906</span>}
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        value={res.eventCost || 0}
                        onChange={(e) => onUpdateCost(res.id, parseFloat(e.target.value) || 0)}
                        className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-indigo-700 outline-none focus:border-indigo-500"
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
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
