import React, { useEffect } from 'react';
import { CalendarEvent, CalendarViewMode, Language } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getTranslation } from '../utils/translations';

interface CalendarGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  language: Language;
  onDateSelect: (date: Date) => void;
  onPrev: () => void;
  onNext: () => void;
  onJumpToToday: () => void;
  viewMode: CalendarViewMode;
  onChangeViewMode: (mode: CalendarViewMode, date?: Date) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({ 
  currentDate, 
  events, 
  language,
  onDateSelect, 
  onPrev, 
  onNext,
  onJumpToToday,
  viewMode,
  onChangeViewMode
}) => {
  const t = getTranslation(language);
  const locale = t.dateFormat;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPrev, onNext]);

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // ----- View: MONTH -----
  const renderMonthView = () => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    
    const days = [];
    // Fix Sunday = 0 to be 7 if needed, but standard JS Date uses 0 for Sunday. 
    // We'll keep it standard for now.
    for (let i = 0; i < firstDayOfMonth; i++) days.push({ day: null, id: `pad-${i}` });
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i), id: `day-${i}` });
    }

    return (
      <>
        <div className="grid grid-cols-7 mb-4 text-[11px] font-medium text-gray-400 shrink-0 px-1 uppercase tracking-widest border-b border-white/5 pb-2">
          {Array.from({ length: 7 }).map((_, i) => {
             const d = new Date(2024, 0, i); 
             return (
                <div key={i} className="text-center">
                  {new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(d)}
                </div>
             )
          })}
        </div>
        
        {/* Calendar Body - "Royal" style (No internal borders, just clean spacing) */}
        <div className="grid grid-cols-7 grid-rows-5 gap-2 flex-1 min-h-0">
          {days.map((item) => {
            if (!item.day || !item.date) return <div key={item.id} className=""></div>;
            
            const dayEvents = events.filter(e => {
              const d = new Date(e.start);
              return d.getDate() === item.date!.getDate() && 
                     d.getMonth() === item.date!.getMonth() && 
                     d.getFullYear() === item.date!.getFullYear();
            });

            const currentDay = isToday(item.date);

            return (
              <div 
                key={item.id}
                onClick={() => onDateSelect(item.date!)}
                className={`
                  relative rounded-xl p-1.5 cursor-pointer transition-all duration-300 flex flex-col group
                  ${currentDay ? 'bg-white/10' : 'hover:bg-white/5'}
                `}
              >
                <div className="flex justify-center md:justify-between mb-1 items-start">
                  <span className={`
                    text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full transition-all
                    ${currentDay 
                      ? 'bg-neon-primary text-black shadow-[0_0_10px_rgba(var(--neon-primary),0.4)] font-bold' 
                      : 'text-white/80 group-hover:text-white'}
                  `}>
                    {item.day}
                  </span>
                </div>
                
                <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                  {dayEvents.slice(0, 4).map(event => {
                    const evtColor = event.color || 'var(--neon-primary)';
                    return (
                      <div key={event.id} className="hidden md:block">
                         <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border-l-[2px]" style={{ borderLeftColor: evtColor }}>
                           <span className="text-[10px] font-medium truncate text-gray-200 leading-none tracking-tight">{event.title}</span>
                         </div>
                      </div>
                    );
                  })}
                  {dayEvents.length > 0 && (
                    <div className="md:hidden flex justify-center flex-wrap gap-1 mt-1">
                      {dayEvents.slice(0, 4).map((e, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: e.color || '#fff' }}></div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  // ----- View: YEAR (12 Months) -----
  const renderYearView = () => {
    return (
      <div className="grid grid-cols-3 gap-4 flex-1 overflow-y-auto px-1 content-start pb-48 md:pb-24 scrollbar-hide">
        {Array.from({ length: 12 }).map((_, i) => {
          const monthDate = new Date(currentDate.getFullYear(), i, 1);
          const isCurrentMonth = new Date().getMonth() === i && new Date().getFullYear() === currentDate.getFullYear();
          
          return (
            <div 
              key={i}
              onClick={() => onChangeViewMode(CalendarViewMode.MONTH, monthDate)}
              className={`
                ultra-glass rounded-2xl p-4 flex flex-col justify-between cursor-pointer hover:bg-white/10 transition-colors h-28
                ${isCurrentMonth ? 'border-neon-primary/30 bg-neon-primary/5' : 'border-white/5'}
              `}
            >
              <div className={`text-lg font-semibold ${isCurrentMonth ? 'text-neon-primary' : 'text-white'}`}>
                 {new Intl.DateTimeFormat(locale, { month: 'long' }).format(monthDate)}
              </div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">View Details</div>
            </div>
          );
        })}
      </div>
    );
  };

  // ----- View: DECADE -----
  const renderDecadeView = () => {
    const startYear = Math.floor(currentDate.getFullYear() / 10) * 10;
    const years = Array.from({ length: 12 }).map((_, i) => startYear - 1 + i);

    return (
      <div className="grid grid-cols-3 gap-4 flex-1 overflow-y-auto px-1 content-start pb-48 md:pb-24 scrollbar-hide">
        {years.map((year) => {
          const isCurrentYear = new Date().getFullYear() === year;
          const isOffDecade = year < startYear || year > startYear + 9;

          return (
            <div 
              key={year}
              onClick={() => onChangeViewMode(CalendarViewMode.YEAR, new Date(year, 0, 1))}
              className={`
                ultra-glass rounded-2xl p-6 flex items-center justify-center text-2xl font-light cursor-pointer hover:bg-white/10 transition-colors h-32
                ${isCurrentYear ? 'text-neon-primary font-bold' : 'text-white'}
                ${isOffDecade ? 'opacity-30' : 'opacity-100'}
              `}
            >
              {year}
            </div>
          );
        })}
      </div>
    );
  };

  const getHeaderTitle = () => {
    if (viewMode === CalendarViewMode.MONTH) {
      return (
        <div className="flex items-baseline gap-3">
          <span className="hover:opacity-70 cursor-pointer transition-opacity" onClick={() => onChangeViewMode(CalendarViewMode.YEAR)}>
            {new Intl.DateTimeFormat(locale, { month: 'long' }).format(currentDate)}
          </span>
          <span className="text-gray-500 text-2xl font-light cursor-pointer hover:text-white transition-colors" onClick={() => onChangeViewMode(CalendarViewMode.DECADE)}>
            {currentDate.getFullYear()}
          </span>
        </div>
      );
    } else if (viewMode === CalendarViewMode.YEAR) {
      return (
        <span className="cursor-pointer hover:opacity-70" onClick={() => onChangeViewMode(CalendarViewMode.DECADE)}>
          {currentDate.getFullYear()}
        </span>
      );
    } else {
      const startYear = Math.floor(currentDate.getFullYear() / 10) * 10;
      return <span>{startYear} - {startYear + 9}</span>;
    }
  };

  return (
    <div className="w-full h-full flex flex-col px-4 pt-4 md:px-8 md:pt-8 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tighter">
          {getHeaderTitle()}
        </h2>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={onJumpToToday}
            className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 hover:text-white transition-colors border border-white/5"
          >
            {t.today}
          </button>
          <div className="flex bg-white/5 rounded-full p-1 border border-white/5">
            <button onClick={onPrev} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button onClick={onNext} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Body with significant padding bottom to clear InputBar on mobile */}
      <div className="flex-1 min-h-0 flex flex-col pb-40 md:pb-24">
        {viewMode === CalendarViewMode.MONTH && renderMonthView()}
        {viewMode === CalendarViewMode.YEAR && renderYearView()}
        {viewMode === CalendarViewMode.DECADE && renderDecadeView()}
      </div>
    </div>
  );
};