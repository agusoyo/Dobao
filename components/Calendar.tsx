
import React from 'react';
import { 
  format, 
  endOfMonth, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  isBefore,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ReservationSlot } from '../types';

interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  reservations: { date: string, slot: ReservationSlot }[];
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect, reservations }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  // Fix: Manual implementation of startOfToday to avoid missing export error on line 15
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fix: Manual implementation of startOfMonth to avoid missing export error on line 5
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = endOfMonth(monthStart);

  // Fix: Manual implementation of startOfWeek (Monday start) to avoid missing export error on line 7
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - (day === 0 ? 6 : day - 1);
    const result = new Date(d.setDate(diff));
    result.setHours(0, 0, 0, 0);
    return result;
  };

  const startDate = getStartOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getDayStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayReservations = reservations.filter(r => r.date === dateStr);
    
    if (dayReservations.length >= 2) return 'FULL';
    if (dayReservations.length === 1) return 'PARTIAL';
    return 'FREE';
  };

  const isPast = (date: Date) => isBefore(date, today);

  return (
    <div className="bg-[#1a1a1a] p-8 rounded-[2rem] border border-white/5 shadow-2xl">
      <div className="flex items-center justify-between mb-10">
        <h3 className="text-3xl font-serif text-white capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h3>
        <div className="flex gap-3">
          <button 
            // Fix: Use addMonths with -1 instead of subMonths to avoid missing export error on line 13
            onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
            className="w-12 h-12 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/5 transition-all"
          >
            <svg className="w-5 h-5 text-[#C5A059]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button 
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="w-12 h-12 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/5 transition-all"
          >
            <svg className="w-5 h-5 text-[#C5A059]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3 mb-6">
        {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map(day => (
          <div key={day} className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-3">
        {calendarDays.map((day, idx) => {
          const status = getDayStatus(day);
          const past = isPast(day);
          const selected = selectedDate && isSameDay(day, selectedDate);
          const sameMonth = isSameMonth(day, monthStart);

          return (
            <button
              key={idx}
              disabled={status === 'FULL' || past || !sameMonth}
              onClick={() => onDateSelect(day)}
              className={`
                relative h-20 w-full flex flex-col items-center justify-center rounded-2xl transition-all border duration-300
                ${!sameMonth ? 'opacity-0 pointer-events-none' : ''}
                ${past ? 'text-slate-700 border-transparent cursor-not-allowed' : ''}
                ${status === 'FULL' ? 'bg-red-950/20 text-red-700 border-red-900/30 cursor-not-allowed' : 'border-white/5 hover:border-[#C5A059]/50 hover:bg-white/5'}
                ${status === 'PARTIAL' && !selected ? 'border-[#C5A059]/30 bg-[#C5A059]/5' : ''}
                ${selected ? 'bg-[#C5A059] text-black border-[#C5A059] shadow-[0_0_20px_rgba(197,160,89,0.4)] transform scale-105 z-10' : ''}
                ${status === 'FREE' && !past && !selected && sameMonth ? 'text-white' : ''}
              `}
            >
              <span className="text-lg font-serif">{format(day, 'd')}</span>
              {status === 'FULL' && <span className="text-[7px] font-bold uppercase mt-1 tracking-tighter">Completo</span>}
              {status === 'PARTIAL' && !selected && <span className="text-[7px] font-bold uppercase mt-1 tracking-tighter text-[#C5A059]">1 Turno Libre</span>}
            </button>
          );
        })}
      </div>

      <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap gap-8 text-[10px] uppercase font-bold tracking-widest text-slate-500">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#C5A059]"></div>
          <span>Seleccionado</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full border border-[#C5A059]/30 bg-[#C5A059]/5"></div>
          <span>Parcialmente libre</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-900/50"></div>
          <span>Agotado</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
