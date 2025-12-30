
import React, { useState, useMemo, useRef } from 'react';
import { Reservation, ReservationStatus, ReservationSlot } from '../types';
import { format, getYear, getMonth, parseISO } from 'date-fns';
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
          if (confirm("¿Está seguro de que desea importar estas reservas? Esto sincronizará el historial con el archivo seleccionado.")) {
            onImport(importedData);
          }
        } else {
          alert("El archivo no tiene el formato correcto.");
        }
      } catch (err) {
        alert("Error al leer el archivo de respaldo.");
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExportExcel = () => {
    try {
      const dataToExport = filteredReservations.map(res => ({
        Fecha: format(parseISO(res.date), 'dd/MM/yyyy'),
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
              catering: 'Catering',
              cleaning: 'Limpieza',
              multimedia: 'Multimedia',
              vinoteca: 'Vinoteca',
              beerEstrella: 'Barril Estrella',
              beer1906: 'Barril 1906'
            };
            return labels[key] || key;
          })
          .join(', ')
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Reservas");
      XLSX.writeFile(workbook, `Reservas_Dobao_Gourmet_${format(new Date(), 'yyyyMMdd')}.xlsx`);
    } catch (error) {
      console.error("Error al exportar Excel:", error);
      alert("Hubo un error al generar el archivo Excel.");
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(197, 160, 89);
      doc.text("Dobao Gourmet", 14, 20);
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text("Listado de Reservas Privadas", 14, 30);
      doc.text(`Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 37);

      const rows = filteredReservations.map(res => [
        format(parseISO(res.date), 'dd/MM/yyyy'),
        res.slot === ReservationSlot.MIDDAY ? 'Mediodía' : 'Noche',
        res.customerName,
        res.phone,
        res.status
      ]);

      autoTable(doc, {
        startY: 45,
        head: [['Fecha', 'Turno', 'Cliente', 'Teléfono', 'Estado']],
        body: rows,
        headStyles: { fillColor: [20, 20, 20], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [250, 250, 250] },
      });

      doc.save(`Reservas_Dobao_Gourmet_${format(new Date(), 'yyyyMMdd')}.pdf`);
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      alert("Hubo un error al generar el archivo PDF.");
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
          {/* Herramientas de Respaldo */}
          <div className="flex gap-2 bg-slate-900 p-2 rounded-2xl shadow-xl w-full sm:w-auto">
             <button 
              onClick={handleExportJSON}
              className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-amber-400 flex items-center gap-2 text-[9px] md:text-[10px] font-bold uppercase tracking-wider"
              title="Descargar copia de seguridad para usar en otro ordenador"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Exportar Backup
            </button>
            <div className="w-px h-6 bg-slate-800 self-center"></div>
            <label className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-sky-400 flex items-center gap-2 text-[9px] md:text-[10px] font-bold uppercase tracking-wider cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              Importar Backup
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept=".json" 
                onChange={handleImportJSON} 
              />
            </label>
          </div>

          <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm w-full sm:w-auto justify-center">
            <button 
              onClick={handleExportExcel}
              className="p-2 hover:bg-green-50 rounded-xl transition-colors text-green-700 flex items-center gap-2 text-[9px] md:text-[10px] font-bold uppercase tracking-wider"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Excel
            </button>
            <div className="w-px h-6 bg-slate-200 self-center"></div>
            <button 
              onClick={handleExportPDF}
              className="p-2 hover:bg-red-50 rounded-xl transition-colors text-red-700 flex items-center gap-2 text-[9px] md:text-[10px] font-bold uppercase tracking-wider"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9h1m1 0h1m1 0h1m-3 4h1m1 0h1m1 0h1m-3 4h1m1 0h1m1 0h1" /></svg>
              PDF
            </button>
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
                <th className="px-5 md:px-8 py-4 md:py-5 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] hidden sm:table-cell">Servicios</th>
                <th className="px-5 md:px-8 py-4 md:py-5 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Estado</th>
                <th className="px-5 md:px-8 py-4 md:py-5 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReservations.map((res) => (
                <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 md:px-8 py-5 md:py-6">
                    <div className="font-bold text-slate-900 text-xs md:text-base">{format(parseISO(res.date), 'dd MMM yy', { locale: es })}</div>
                    <div className="text-[8px] md:text-[10px] font-bold text-[#C5A059] uppercase tracking-wider mt-0.5 md:mt-1">{res.slot === ReservationSlot.MIDDAY ? 'Medio' : 'Noche'}</div>
                  </td>
                  <td className="px-5 md:px-8 py-5 md:py-6">
                    <div className="font-semibold text-slate-900 text-xs md:text-base truncate max-w-[80px] sm:max-w-none">{res.customerName}</div>
                    <div className="text-[10px] md:text-xs text-slate-500">{res.phone}</div>
                  </td>
                  <td className="px-5 md:px-8 py-5 md:py-6 hidden sm:table-cell">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {res.services.catering && <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-md text-[8px] font-bold uppercase">Cat</span>}
                      {res.services.vinoteca && <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-md text-[8px] font-bold uppercase">Vino</span>}
                      {res.services.beerEstrella && <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-md text-[8px] font-bold uppercase">EST</span>}
                    </div>
                  </td>
                  <td className="px-5 md:px-8 py-5 md:py-6">
                    <span className={`text-[8px] md:text-[9px] font-bold px-2 md:px-3 py-1 rounded-full uppercase tracking-widest ${res.status === ReservationStatus.CONFIRMED ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {res.status.substring(0, 4)}
                    </span>
                  </td>
                  <td className="px-5 md:px-8 py-5 md:py-6 text-right space-x-2 md:space-x-3">
                    <button onClick={() => onDelete(res.id)} className="text-red-400 hover:text-red-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredReservations.length === 0 && (
            <div className="p-12 md:p-20 text-center text-slate-400 italic text-sm">No hay reservas registradas.</div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-sky-50 border border-sky-100 rounded-2xl p-6 text-sky-800 flex items-start gap-4">
        <svg className="w-6 h-6 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <div>
          <h4 className="font-bold text-sm mb-1 uppercase tracking-wider">Consejo Pro: Portabilidad de Datos</h4>
          <p className="text-xs leading-relaxed opacity-80">
            Para llevar su historial de reservas a otro ordenador o dispositivo, utilice el botón <strong>Exportar Backup</strong> arriba. Guarde el archivo .json y cárguelo en el otro dispositivo con el botón <strong>Importar Backup</strong>. Esto sincronizará su historial instantáneamente.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
