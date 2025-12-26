
import React from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isBefore,
  startOfToday
} from 'date-fns';
import { es } from 'date-fns/locale';

interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  reservedDates: string[];
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect, reservedDates }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const today = startOfToday();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const isReserved = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return reservedDates.includes(dateStr);
  };

  const isPast = (date: Date) => isBefore(date, today);

  return (
    <div className="bg-[#1a1a1a] p-6 text-slate-300">
      <div className="flex items-center justify-between mb-10">
        <h3 className="text-2xl font-serif text-white capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h3>
        <div className="flex gap-4">
          <button 
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors"
          >
            <svg className="w-4 h-4 text-[#C5A059]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button 
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors"
          >
            <svg className="w-4 h-4 text-[#C5A059]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map(day => (
          <div key={day} className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, idx) => {
          const reserved = isReserved(day);
          const past = isPast(day);
          const selected = selectedDate && isSameDay(day, selectedDate);
          const sameMonth = isSameMonth(day, monthStart);

          return (
            <button
              key={idx}
              disabled={reserved || past || !sameMonth}
              onClick={() => onDateSelect(day)}
              className={`
                relative h-16 w-full flex flex-col items-center justify-center rounded-2xl transition-all border
                ${!sameMonth ? 'opacity-0 pointer-events-none' : ''}
                ${past ? 'text-slate-700 border-transparent cursor-not-allowed grayscale' : ''}
                ${reserved ? 'bg-red-950/20 text-red-700 border-red-900/30 cursor-not-allowed' : 'border-white/5 hover:border-[#C5A059]/50 hover:bg-white/5'}
                ${selected ? 'bg-[#C5A059] text-black border-[#C5A059] shadow-[0_0_15px_rgba(197,160,89,0.3)] transform scale-105 z-10' : ''}
                ${!reserved && !past && !selected && sameMonth ? 'text-white' : ''}
              `}
            >
              <span className="text-sm font-medium">{format(day, 'd')}</span>
              {reserved && <span className="text-[7px] font-bold uppercase mt-1 tracking-tighter">Ocupado</span>}
            </button>
          );
        })}
      </div>

      <div className="mt-10 flex flex-wrap gap-6 text-[10px] uppercase font-bold tracking-widest text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#C5A059]"></div>
          <span>Seleccionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-900/50"></div>
          <span>No disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white/10"></div>
          <span>Disponible</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
