
import React, { useState, useMemo, useRef } from 'react';
import { Reservation, ReservationStatus, ReservationSlot } from '../types';
import { format, getYear, getMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AdminDashboardProps {
  reservations: Reservation[];
  onUpdateStatus: (id: string, status: ReservationStatus) => void;
  onUpdate: (reservation: Reservation) => void;
  onDelete: (id: string) => void;
  onImport: (newReservations: Reservation[]) => void;
  onBackToBooking: () => void;
  onLogout?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  reservations, onUpdateStatus, onUpdate, onDelete, onImport, onBackToBooking, onLogout 
}) => {
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseDate = (dateStr: string) => new Date(dateStr);

  const filteredReservations = useMemo(() => {
    return reservations.filter(res => {
      const resDate = parseDate(res.date);
      const matchYear = filterYear === 'all' || getYear(resDate).toString() === filterYear;
      const matchMonth = filterMonth === 'all' || getMonth(resDate).toString() === filterMonth;
      return matchYear && matchMonth;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [reservations, filterMonth, filterYear]);

  const yearOptions = useMemo(() => {
    const years = new Set<number>();
    years.add(new Date().getFullYear());
    reservations.forEach(r => years.add(getYear(parseDate(r.date))));
    return Array.from(years).sort((a, b) => b - a);
  }, [reservations]);

  const getSlotLabel = (slot: ReservationSlot) => {
    return slot === ReservationSlot.MIDDAY ? 'Mediodía (12-16h)' : 'Noche (20-00h)';
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(reservations, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `Respaldo_Dobao_Gourmet_${format(new Date(), 'yyyyMMdd_HHmm')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);
        if (Array.isArray(importedData)) {
          if (confirm("¿Está seguro de que desea importar estas reservas?")) {
            onImport(importedData);
          }
        } else {
          alert("Formato incorrecto.");
        }
      } catch (err) {
        alert("Error al leer el archivo.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExportExcel = () => {
    try {
      const dataToExport = filteredReservations.map(res => ({
        Fecha: format(parseDate(res.date), 'dd/MM/yyyy'),
        Turno: getSlotLabel(res.slot),
        Cliente: res.customerName,
        Email: res.email,
        Teléfono: res.phone,
        Invitados: res.guests,
        Propósito: res.purpose,
        Estado: res.status,
        Servicios: Object.entries(res.services)
          .filter(([_, value]) => value)
          .map(([key, _]) => {
            const labels: Record<string, string> = {
              catering: 'Catering', cleaning: 'Limpieza', multimedia: 'Multimedia',
              vinoteca: 'Vinoteca', beerEstrella: 'Estrella', beer1906: '1906'
            };
            return labels[key] || key;
          })
          .join(', ')
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Reservas");
      XLSX.writeFile(workbook, `Reservas_Dobao_${format(new Date(), 'yyyyMMdd')}.xlsx`);
    } catch (error) {
      alert("Error al exportar Excel.");
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(197, 160, 89);
      doc.text("Dobao Gourmet", 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Listado generado el ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);

      const rows = filteredReservations.map(res => [
        format(parseDate(res.date), 'dd/MM/yyyy'),
        res.slot === ReservationSlot.MIDDAY ? 'Mediodía' : 'Noche',
        res.customerName,
        res.phone,
        res.status === ReservationStatus.CONFIRMED ? 'CONFIRMADO' : res.status === ReservationStatus.PENDING ? 'PENDIENTE' : 'CANCELADO'
      ]);

      autoTable(doc, {
        startY: 40,
        head: [['Fecha', 'Turno', 'Cliente', 'Teléfono', 'Estado']],
        body: rows,
        headStyles: { fillColor: [20, 20, 20] },
      });

      doc.save(`Reservas_Dobao_${format(new Date(), 'yyyyMMdd')}.pdf`);
    } catch (error) {
      alert("Error al exportar PDF.");
    }
  };

  const getStatusStyles = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.CONFIRMED:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-400';
      case ReservationStatus.CANCELLED:
        return 'bg-rose-50 text-rose-700 border-rose-200 hover:border-rose-400';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-400';
    }
  };

  return (
    <div className="pt-2 pb-12 md:pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 md:mb-12 gap-6">
        <div>
          <div className="flex gap-4 mb-3 md:mb-4 flex-wrap">
            <button onClick={onBackToBooking} className="text-indigo-600 font-bold text-[9px] md:text-[10px] uppercase tracking-widest flex items-center gap-2">← Volver a Web</button>
            {onLogout && (
              <button onClick={onLogout} className="text-red-500 font-bold text-[9px] md:text-[10px] uppercase tracking-widest flex items-center gap-2">Cerrar Sesión</button>
            )}
          </div>
          <h2 className="text-2xl md:text-4xl font-serif text-slate-900">Gestión de Reservas</h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex gap-2 bg-slate-900 p-2 rounded-2xl shadow-xl w-full sm:w-auto">
             <button onClick={handleExportJSON} className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-amber-400 flex items-center gap-2 text-[9px] md:text-[10px] font-bold uppercase tracking-wider">
              Exportar Backup
            </button>
            <div className="w-px h-6 bg-slate-800 self-center"></div>
            <label className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-sky-400 flex items-center gap-2 text-[9px] md:text-[10px] font-bold uppercase tracking-wider cursor-pointer">
              Importar Backup
              <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImportJSON} />
            </label>
          </div>

          <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm w-full sm:w-auto justify-center">
            <button onClick={handleExportExcel} className="p-2 hover:bg-green-50 rounded-xl transition-colors text-green-700 flex items-center gap-2 text-[9px] md:text-[10px] font-bold uppercase tracking-wider">Excel</button>
            <div className="w-px h-6 bg-slate-200 self-center"></div>
            <button onClick={handleExportPDF} className="p-2 hover:bg-red-50 rounded-xl transition-colors text-red-700 flex items-center gap-2 text-[9px] md:text-[10px] font-bold uppercase tracking-wider">PDF</button>
          </div>

          <div className="flex gap-3 bg-white p-2 md:p-3 rounded-2xl border border-slate-200 shadow-sm w-full sm:w-auto">
            <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="bg-slate-50 border-none text-[10px] md:text-xs font-bold rounded-lg py-2 px-3 md:px-4 uppercase tracking-widest outline-none w-1/2 sm:w-auto">
              <option value="all">Años</option>
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="bg-slate-50 border-none text-[10px] md:text-xs font-bold rounded-lg py-2 px-3 md:px-4 uppercase tracking-widest outline-none w-1/2 sm:w-auto">
              <option value="all">Meses</option>
              {[...Array(12)].map((_, i) => <option key={i} value={i}>{format(new Date(2000, i, 1), 'MMMM', { locale: es })}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] md:rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="px-5 md:px-8 py-4 md:py-5 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Fecha y Turno</th>
                <th className="px-5 md:px-8 py-4 md:py-5 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Cliente</th>
                <th className="px-5 md:px-8 py-4 md:py-5 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] hidden sm:table-cell">Servicios Solicitados</th>
                <th className="px-5 md:px-8 py-4 md:py-5 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Validación de Estado</th>
                <th className="px-5 md:px-8 py-4 md:py-5 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReservations.map((res) => (
                <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 md:px-8 py-5 md:py-6">
                    <div className="font-bold text-slate-900 text-xs md:text-base">{format(parseDate(res.date), 'dd MMM yy', { locale: es })}</div>
                    <div className="text-[8px] md:text-[10px] font-bold text-[#C5A059] uppercase tracking-wider mt-0.5 md:mt-1">{res.slot === ReservationSlot.MIDDAY ? 'COMIDA' : 'CENA'}</div>
                  </td>
                  <td className="px-5 md:px-8 py-5 md:py-6">
                    <div className="font-semibold text-slate-900 text-xs md:text-base truncate max-w-[120px] sm:max-w-none">{res.customerName}</div>
                    <div className="text-[10px] md:text-xs text-slate-500">{res.phone}</div>
                  </td>
                  <td className="px-5 md:px-8 py-5 md:py-6 hidden sm:table-cell">
                    <div className="flex flex-wrap gap-1.5 max-w-[250px]">
                      {res.services.cleaning && <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[8px] font-bold uppercase border border-slate-200">Limpieza</span>}
                      {res.services.vinoteca && <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-md text-[8px] font-bold uppercase border border-red-100">Vino</span>}
                      {res.services.catering && <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-md text-[8px] font-bold uppercase border border-amber-100">Catering</span>}
                      {res.services.beerEstrella && <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-md text-[8px] font-bold uppercase border border-red-200">Estrella</span>}
                    </div>
                  </td>
                  <td className="px-5 md:px-8 py-5 md:py-6">
                    <select 
                      value={res.status}
                      onChange={(e) => onUpdateStatus(res.id, e.target.value as ReservationStatus)}
                      className={`text-[9px] md:text-[10px] font-bold px-3 py-2 rounded-xl uppercase tracking-widest border transition-all cursor-pointer outline-none ${getStatusStyles(res.status)}`}
                    >
                      <option value={ReservationStatus.PENDING}>Pendiente</option>
                      <option value={ReservationStatus.CONFIRMED}>Validado / Confirmado</option>
                      <option value={ReservationStatus.CANCELLED}>Cancelado</option>
                    </select>
                  </td>
                  <td className="px-5 md:px-8 py-5 md:py-6 text-right">
                    <button 
                      onClick={() => onDelete(res.id)} 
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Eliminar registro"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredReservations.length === 0 && (
            <div className="p-12 md:p-20 text-center text-slate-400 italic text-sm">No hay reservas que coincidan con los filtros.</div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-amber-50 border border-amber-100 rounded-2xl p-6 text-amber-900 flex items-start gap-4">
        <svg className="w-6 h-6 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <div>
          <h4 className="font-bold text-sm mb-1 uppercase tracking-wider">Gestión de Estados</h4>
          <p className="text-xs leading-relaxed opacity-80">
            Al recibir una nueva solicitud, ésta aparecerá como <strong>Pendiente</strong>. Una vez revise los detalles y servicios con el cliente, puede cambiarla a <strong>Validado</strong> para bloquear definitivamente el calendario o <strong>Cancelado</strong> para liberar el turno. Los cambios se sincronizan automáticamente.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
