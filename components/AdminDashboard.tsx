
import React, { useState, useMemo } from 'react';
import { Reservation, ReservationStatus, ReservationSlot } from '../types';
import { format, getYear, getMonth, getDate, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ReservationEditModal from '../src/components/ReservationEditModal'; // Import the new modal component

interface AdminDashboardProps {
  reservations: Reservation[];
  onUpdateStatus: (id: string, status: ReservationStatus) => void;
  onUpdateCost: (id: string, cost: number) => void;
  onUpdateDeposit: (id: string, deposit: number) => void;
  onUpdate: (reservation: Reservation) => void;
  onDelete: (id: string) => void;
  onImport: (newReservations: Reservation[]) => void;
  onBackToBooking: () => void;
  onGoToWineConfig?: () => void;
  onGoToBlockedDays?: () => void;
  onGoToAdminCalendar?: () => void;
  onGoToPricingConfig?: () => void;
  onLogout?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  reservations, onUpdateStatus, onUpdateCost, onUpdateDeposit, onUpdate, onDelete, onBackToBooking, onGoToWineConfig, onGoToBlockedDays, onGoToAdminCalendar, onGoToPricingConfig, onLogout 
}) => {
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());
  const [filterDay, setFilterDay] = useState<string>('all');
  const [selectedReservationForEdit, setSelectedReservationForEdit] = useState<Reservation | null>(null); // State to hold the reservation being edited

  const safeFormat = (date: string | Date | undefined, formatStr: string) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return isValid(d) ? format(d, formatStr, { locale: es }) : 'N/A';
  };

  const handleStatusChange = (res: Reservation, newStatus: ReservationStatus) => {
    onUpdateStatus(res.id, newStatus);
    
    // Si el estado cambia a CONFIRMED (Validado), enviamos el correo
    if (newStatus === ReservationStatus.CONFIRMED) {
      const subject = encodeURIComponent(`Reserva Confirmada - Dobao Gourmet`);
      const slotText = res.slot === ReservationSlot.MIDDAY ? 'Comida' : 'Cena';
      const body = encodeURIComponent(
        `¡Hola ${res.customerName}!\n\n` +
        `Nos complace comunicarte que tu reserva en Dobao Gourmet para el próximo ${safeFormat(res.date, 'dd/MM/yyyy')} (Turno de ${slotText}) ha sido VALIDADA con éxito.\n\n` +
        `Ya tenemos todo preparado para que disfrutes de nuestro espacio exclusivo. Queremos agradecerte sinceramente que nos hayas elegido para tu evento; trabajamos cada detalle para que vuestra experiencia sea memorable.\n\n` +
        `Si necesitas realizar cualquier ajuste en los servicios contratados o tienes alguna duda de última hora, estamos a tu entera disposición.\n\n` +
        `¡Estamos deseando recibiros!\n\n` +
        `Atentamente,\n` +
        `El equipo de Dobao Gourmet`
      );
      
      // Abrir el gestor de correo del sistema
      window.location.href = `mailto:${res.email}?subject=${subject}&body=${body}`;
    }
  };

  const filteredReservations = useMemo(() => {
    return reservations.filter(res => {
      const resDate = new Date(res.date);
      if (!isValid(resDate)) return false;
      
      const matchYear = filterYear === 'all' || getYear(resDate).toString() === filterYear;
      const matchMonth = filterMonth === 'all' || getMonth(resDate).toString() === filterMonth;
      const matchDay = filterDay === 'all' || getDate(resDate).toString() === filterDay;
      
      return matchYear && matchMonth && matchDay;
    }).sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return da - db;
    });
  }, [reservations, filterMonth, filterYear, filterDay]);

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

  const handleExportExcel = () => {
    const dataToExport = filteredReservations.map(res => ({
      Fecha: safeFormat(res.date, 'dd/MM/yyyy'),
      Turno: res.slot === ReservationSlot.MIDDAY ? 'Comida' : 'Cena',
      Cliente: res.customerName,
      Teléfono: res.phone,
      Invitados: res.guests,
      Servicios: getActiveServicesText(res.services),
      'Coste Total (€)': res.eventCost || 0,
      'Depósito (€)': res.deposit || 0,
      'Pendiente (€)': (res.eventCost || 0) - (res.deposit || 0),
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
      res.customerName,
      `${res.eventCost || 0} €`,
      `${res.deposit || 0} €`,
      `${(res.eventCost || 0) - (res.deposit || 0)} €`,
      res.status
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['Fecha', 'Cliente', 'Total', 'Depósito', 'Pendiente', 'Estado']],
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
          <div className="flex flex-wrap gap-4 mb-4">
            <button onClick={onBackToBooking} className="text-indigo-600 font-bold text-[10px] uppercase tracking-widest">← Volver a Web</button>
            <button onClick={onGoToAdminCalendar} className="text-indigo-600 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z"/></svg>
              Vista Calendario
            </button>
            <button onClick={onGoToPricingConfig} className="text-indigo-600 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Configurar Precios
            </button>
            <button onClick={onGoToWineConfig} className="text-[#C5A059] font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
              Configurar Catas
            </button>
            <button onClick={onGoToBlockedDays} className="text-red-500 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/></svg>
              Bloquear Días
            </button>
            {onLogout && <button onClick={onLogout} className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Cerrar Sesión</button>}
          </div>
          <h2 className="text-2xl md:text-4xl font-serif text-slate-900">Registro de Eventos</h2>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
            <button onClick={handleExportExcel} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-100 transition-colors">Excel</button>
            <button onClick={handleExportPDF} className="px-4 py-2 bg-rose-50 text-rose-700 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-rose-100 transition-colors">PDF</button>
          </div>

          <div className="flex gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
            <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="bg-slate-50 border-none text-[10px] font-bold rounded-lg py-2 px-4 uppercase tracking-widest outline-none">
              <option value="all">Año</option>
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="bg-slate-50 border-none text-[10px] font-bold rounded-lg py-2 px-4 uppercase tracking-widest outline-none">
              <option value="all">Mes</option>
              {[...Array(12)].map((_, i) => <option key={i} value={i}>{format(new Date(2000, i, 1), 'MMMM', { locale: es })}</option>)}
            </select>
            <select value={filterDay} onChange={(e) => setFilterDay(e.target.value)} className="bg-slate-50 border-none text-[10px] font-bold rounded-lg py-2 px-4 uppercase tracking-widest outline-none">
              <option value="all">Día</option>
              {[...Array(31)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fecha</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cliente</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Coste (€)</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Depósito (€)</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Pendiente (€)</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReservations.map((res) => {
                const pending = (res.eventCost || 0) - (res.deposit || 0);
                return (
                  <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-6">
                      <div className="font-bold text-slate-900">{safeFormat(res.date, 'dd MMM yy')}</div>
                      <div className="text-[10px] font-bold text-[#C5A059] uppercase tracking-wider">{res.slot === ReservationSlot.MIDDAY ? 'COMIDA' : 'CENA'}</div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="font-semibold text-slate-900">{res.customerName}</div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">{res.phone}</div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <input 
                        type="number" 
                        value={res.eventCost || 0}
                        onChange={(e) => onUpdateCost(res.id, parseFloat(e.target.value) || 0)}
                        className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700 text-center outline-none focus:border-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-6 text-center">
                      <input 
                        type="number" 
                        value={res.deposit || 0}
                        onChange={(e) => onUpdateDeposit(res.id, parseFloat(e.target.value) || 0)}
                        className="w-20 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5 text-xs font-bold text-amber-700 text-center outline-none focus:border-amber-500"
                      />
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className={`text-sm font-black ${pending > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {pending}€
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <select 
                        value={res.status}
                        onChange={(e) => handleStatusChange(res, e.target.value as ReservationStatus)}
                        className={`text-[9px] font-bold px-3 py-2 rounded-xl border outline-none cursor-pointer ${
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
                    <td className="px-6 py-6 text-right flex justify-end items-center gap-2">

                      <button
                        onClick={() => setSelectedReservationForEdit(res)}
                        className="p-2 text-indigo-600 hover:text-indigo-800 transition-colors"
                        title="Editar Reserva"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button onClick={() => onDelete(res.id)} className="p-2 text-slate-200 hover:text-red-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedReservationForEdit && (
        <ReservationEditModal
          reservation={selectedReservationForEdit}
          onSave={async (updatedRes) => {
            await onUpdate(updatedRes);
            setSelectedReservationForEdit(null);
          }}
          onClose={() => setSelectedReservationForEdit(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
