
import React, { useState } from 'react';
import { 
  format, 
  endOfMonth, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  startOfMonth,
  startOfWeek,
  isValid
} from 'date-fns';
import { es } from 'date-fns/locale';
import { Reservation, WineTasting, ReservationSlot, ReservationStatus } from '../types';

interface AdminCalendarViewProps {
  reservations: Reservation[];
  tastings: WineTasting[];
  blockedDates: string[];
  onBack: () => void;
  onUpdateStatus?: (id: string, status: ReservationStatus) => void;
}

const AdminCalendarView: React.FC<AdminCalendarViewProps> = ({ 
  reservations, tastings, blockedDates, onBack, onUpdateStatus 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const selectedDateStr = format(selectedDay, 'yyyy-MM-dd');
  // En el calendario administrativo mostramos todas las reservas no canceladas para el aforo, 
  // pero para el detalle incluiremos la posibilidad de ver/validar las pendientes.
  const dayReservations = reservations.filter(r => r.date === selectedDateStr);
  const dayTastings = tastings.filter(t => t.date === selectedDateStr);
  const isBlocked = blockedDates.includes(selectedDateStr);

  const getDayData = (day: Date) => {
    const dStr = format(day, 'yyyy-MM-dd');
    const dayRes = reservations.filter(r => r.date === dStr && r.status !== ReservationStatus.CANCELLED);
    const dayTas = tastings.filter(t => t.date === dStr);
    const dayBlocked = blockedDates.includes(dStr);
    return { dayRes, dayTas, dayBlocked };
  };

  const handleStatusChange = (res: Reservation, newStatus: ReservationStatus) => {
    if (onUpdateStatus) {
      onUpdateStatus(res.id, newStatus);
      
      // Lógica de envío de correo si se valida (CONFIRMED)
      if (newStatus === ReservationStatus.CONFIRMED) {
        const subject = encodeURIComponent(`Reserva Confirmada - Dobao Gourmet`);
        const slotText = res.slot === ReservationSlot.MIDDAY ? 'Comida' : 'Cena';
        const formattedDate = format(new Date(res.date), 'dd/MM/yyyy');
        
        const body = encodeURIComponent(
          `¡Hola ${res.customerName}!\n\n` +
          `Nos complace comunicarte que tu reserva en Dobao Gourmet para el próximo ${formattedDate} (Turno de ${slotText}) ha sido VALIDADA con éxito.\n\n` +
          `Ya tenemos todo preparado para que disfrutes de nuestro espacio exclusivo. Queremos agradecerte sinceramente que nos hayas elegido para tu evento; trabajamos cada detalle para que vuestra experiencia sea memorable.\n\n` +
          `Si necesitas realizar cualquier ajuste en los servicios contratados o tienes alguna duda de última hora, estamos a tu entera disposición.\n\n` +
          `¡Estamos deseando recibiros!\n\n` +
          `Atentamente,\n` +
          `El equipo de Dobao Gourmet`
        );
        
        window.location.href = `mailto:${res.email}?subject=${subject}&body=${body}`;
      }
    }
  };

  const renderSlotInfo = (slot: ReservationSlot, title: string, themeColor: string) => {
    const res = dayReservations.find(r => r.slot === slot);
    
    return (
      <div className={`p-5 rounded-2xl border border-slate-100 bg-slate-50/50`}>
        <div className="flex justify-between items-center mb-3">
          <span className={`text-[10px] font-bold ${themeColor} uppercase tracking-widest`}>{title}</span>
          <span className={`text-[8px] px-2 py-1 rounded-full font-black uppercase ${res ? (res.status === ReservationStatus.CONFIRMED ? 'bg-emerald-600 text-white' : res.status === ReservationStatus.CANCELLED ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white') : 'bg-slate-200 text-slate-500'}`}>
            {res ? (res.status === ReservationStatus.CONFIRMED ? 'Validado' : res.status === ReservationStatus.CANCELLED ? 'Cancelado' : 'Pendiente') : 'Libre'}
          </span>
        </div>
        
        {res ? (
          <div className="space-y-3">
            <div>
              <div className="font-bold text-slate-900">{res.customerName}</div>
              <div className="text-xs text-slate-500">{res.guests} invitados • {res.phone}</div>
            </div>
            
            <div className="pt-2 border-t border-slate-200">
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Cambiar Estado</label>
              <select 
                value={res.status}
                onChange={(e) => handleStatusChange(res, e.target.value as ReservationStatus)}
                className={`w-full text-[9px] font-bold px-3 py-2 rounded-xl border outline-none cursor-pointer transition-colors ${
                  res.status === ReservationStatus.CONFIRMED ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                  res.status === ReservationStatus.CANCELLED ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                  'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                <option value={ReservationStatus.PENDING}>Pendiente</option>
                <option value={ReservationStatus.CONFIRMED}>Validar (Enviar Email)</option>
                <option value={ReservationStatus.CANCELLED}>Cancelar</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400 italic">No hay reservas</div>
        )}
      </div>
    );
  };

  return (
    <div className="pt-2 pb-20 px-4 md:px-8 max-w-7xl mx-auto text-slate-900">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <button onClick={onBack} className="text-indigo-600 font-bold text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
            ← Volver al Listado
          </button>
          <h2 className="text-2xl md:text-4xl font-serif">Calendario de Ocupación</h2>
        </div>
        <div className="flex gap-4 items-center bg-white p-3 rounded-2xl border shadow-sm">
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, -1))} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <span className="font-serif text-lg min-w-[140px] text-center capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </span>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Calendario Principal */}
        <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] border shadow-xl">
          <div className="grid grid-cols-7 gap-4 mb-4">
            {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-4">
            {calendarDays.map((day, idx) => {
              const { dayRes, dayTas, dayBlocked } = getDayData(day);
              const isSelected = isSameDay(day, selectedDay);
              const sameMonth = isSameMonth(day, monthStart);
              
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDay(day)}
                  className={`
                    relative h-28 w-full flex flex-col items-center justify-start p-2 rounded-2xl border transition-all duration-200 overflow-hidden
                    ${!sameMonth ? 'opacity-20 pointer-events-none' : 'hover:border-[#C5A059]'}
                    ${isSelected ? 'border-[#C5A059] bg-[#C5A059]/5 ring-2 ring-[#C5A059]/10' : 'border-slate-100'}
                    ${dayBlocked ? 'bg-red-50 border-red-100' : ''}
                  `}
                >
                  <span className={`text-sm font-serif mb-2 ${isSelected ? 'text-[#C5A059] font-bold' : 'text-slate-900'}`}>
                    {format(day, 'd')}
                  </span>
                  
                  <div className="flex flex-col gap-1 w-full overflow-hidden">
                    {dayBlocked && (
                      <div className="text-[7px] leading-tight font-black bg-red-500 text-white py-0.5 px-1 rounded uppercase text-center tracking-tighter">
                        BLOQUEO
                      </div>
                    )}
                    {dayTas.length > 0 && (
                      <div className="text-[7px] leading-tight font-black bg-[#C5A059] text-black py-0.5 px-1 rounded uppercase text-center tracking-tighter">
                        CATA
                      </div>
                    )}
                    {dayRes.map(r => (
                      <div 
                        key={r.id} 
                        className={`text-[7px] leading-tight font-black py-0.5 px-1 rounded uppercase text-center tracking-tighter text-white ${
                          r.slot === ReservationSlot.MIDDAY ? 'bg-indigo-500' : 'bg-slate-700'
                        }`}
                      >
                        {r.slot === ReservationSlot.MIDDAY ? 'COMIDA' : 'CENA'}
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-6 text-[9px] font-bold uppercase tracking-widest">
            <div className="flex items-center gap-2"><div className="w-4 h-2 rounded bg-red-500"></div> Bloqueo</div>
            <div className="flex items-center gap-2"><div className="w-4 h-2 rounded bg-[#C5A059]"></div> Cata</div>
            <div className="flex items-center gap-2"><div className="w-4 h-2 rounded bg-indigo-500"></div> Comida</div>
            <div className="flex items-center gap-2"><div className="w-4 h-2 rounded bg-slate-700"></div> Cena</div>
          </div>
        </div>

        {/* Panel Lateral de Detalle */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border shadow-xl sticky top-32 overflow-hidden">
            <div className="text-center mb-8">
              <span className="text-[10px] font-black text-[#C5A059] uppercase tracking-widest">{format(selectedDay, "EEEE", { locale: es })}</span>
              <h3 className="text-3xl font-serif text-slate-900">{format(selectedDay, "d 'de' MMMM", { locale: es })}</h3>
            </div>

            <div className="space-y-6">
              {isBlocked ? (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-center">
                  <span className="text-red-600 font-bold uppercase text-[10px] tracking-widest block mb-1">Día Inhabilitado</span>
                  <p className="text-red-700 text-sm">Este día no acepta reservas automáticas ni eventos.</p>
                </div>
              ) : (
                <>
                  {renderSlotInfo(ReservationSlot.MIDDAY, "Turno Comida", "text-indigo-600")}
                  {renderSlotInfo(ReservationSlot.NIGHT, "Turno Cena", "text-slate-700")}

                  {/* Catas */}
                  {dayTastings.length > 0 && (
                    <div className="p-5 rounded-2xl border border-[#C5A059]/20 bg-[#C5A059]/5">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-widest">Evento de Cata</span>
                        <span className="bg-[#C5A059] text-white text-[8px] px-2 py-1 rounded-full font-black uppercase">Activo</span>
                      </div>
                      {dayTastings.map(t => (
                        <div key={t.id}>
                          <div className="font-bold text-[#C5A059]">{t.name}</div>
                          <div className="text-xs text-[#C5A059]/70">{t.currentAttendees} asistentes registrados</div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCalendarView;
