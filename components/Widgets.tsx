import React, { useState, useEffect } from 'react';
import { CalendarEvent, Language } from '../types';
import { Clock, Search, Sparkles, ArrowRight } from 'lucide-react';
import { generateWeeklyBrief } from '../services/geminiService';
import { getTranslation } from '../utils/translations';

interface WidgetsProps {
  events: CalendarEvent[];
  onEventClick: (date: Date) => void;
  language: Language;
}

export const Widgets: React.FC<WidgetsProps> = ({ events, onEventClick, language }) => {
  const [time, setTime] = useState(new Date());
  const [search, setSearch] = useState('');
  const [brief, setBrief] = useState<string | null>(null);
  const [loadingBrief, setLoadingBrief] = useState(false);
  const t = getTranslation(language);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredEvents = search 
    ? events.filter(e => 
        e.title.toLowerCase().includes(search.toLowerCase()) || 
        e.description?.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 5)
    : [];

  const nextEvent = events
    .filter(e => new Date(e.start) > new Date())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())[0];

  const handleGenerateBrief = async () => {
    setLoadingBrief(true);
    const summary = await generateWeeklyBrief(events, new Date(), language);
    setBrief(summary);
    setLoadingBrief(false);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Search Widget */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-neon-primary transition-colors" size={18} />
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.searchPlaceholder} 
          className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white focus:border-neon-primary/50 focus:bg-white/10 transition-all outline-none placeholder-gray-600 shadow-inner"
        />
        {search && (
          <div className="absolute top-full left-0 right-0 mt-2 ultra-glass-dark rounded-2xl shadow-2xl z-50 overflow-hidden border border-white/10">
            {filteredEvents.length > 0 ? (
              filteredEvents.map(e => (
                <div 
                  key={e.id} 
                  onClick={() => onEventClick(new Date(e.start))}
                  className="p-4 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-0 transition-colors"
                >
                  <div className="text-white text-sm font-medium">{e.title}</div>
                  <div className="text-xs text-gray-500">{new Date(e.start).toLocaleDateString()}</div>
                </div>
              ))
            ) : (
              <div className="p-4 text-xs text-gray-500 text-center">No matches found.</div>
            )}
          </div>
        )}
      </div>

      {/* Clock */}
      <div className="ultra-glass rounded-3xl p-6 relative overflow-hidden hover:border-white/20 transition-all group">
        <div className="relative z-10">
          <h3 className="text-neon-primary text-[9px] uppercase tracking-[0.3em] mb-2 font-bold drop-shadow-md">System Time</h3>
          <div className="text-5xl font-mono text-white tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] group-hover:drop-shadow-[0_0_15px_rgba(var(--neon-primary),0.4)] transition-all">
            {time.toLocaleTimeString(t.dateFormat, { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-gray-400 text-xs mt-3 font-medium">
            {time.toLocaleDateString(t.dateFormat, { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-neon-primary/10 rounded-full blur-2xl group-hover:bg-neon-primary/20 transition-colors"></div>
      </div>

      {/* Weekly Brief AI */}
      <div className="ultra-glass rounded-3xl p-6 hover:border-neon-secondary/40 transition-all relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-neon-secondary/5 to-transparent pointer-events-none"></div>
        <div className="flex justify-between items-center mb-4 relative z-10">
           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
             <Sparkles size={14} className="text-neon-secondary" /> {t.weekBrief}
           </h3>
           {!brief && (
             <button onClick={handleGenerateBrief} disabled={loadingBrief} className="text-[10px] text-neon-primary font-bold hover:text-white disabled:opacity-50 transition-colors px-2 py-1 rounded bg-neon-primary/10">
               {loadingBrief ? t.generating : t.generate}
             </button>
           )}
        </div>
        {brief ? (
          <div className="text-sm text-gray-300 leading-relaxed animate-fade-in relative z-10 font-light">
            "{brief}"
          </div>
        ) : (
          <div className="text-xs text-gray-600 italic relative z-10">
             Ready to analyze schedule...
          </div>
        )}
      </div>

      {/* Next Event */}
      <div className="ultra-glass rounded-3xl p-6 hover:border-neon-primary/40 transition-all cursor-pointer group relative overflow-hidden" onClick={() => nextEvent && onEventClick(new Date(nextEvent.start))}>
        <div className="flex justify-between items-start mb-4 relative z-10">
           <h3 className="text-gray-500 text-[10px] uppercase tracking-wider">{t.nextEvent}</h3>
           <ArrowRight size={16} className="text-gray-600 group-hover:text-neon-primary transition-colors transform group-hover:translate-x-1" />
        </div>
        
        {nextEvent ? (
          <div className="relative z-10">
            <div className="text-xl text-white font-light mb-2 line-clamp-1 group-hover:text-neon-primary transition-colors">{nextEvent.title}</div>
            <div className="flex items-center gap-3 text-xs text-gray-400 font-mono">
              <span className="text-neon-secondary font-bold bg-neon-secondary/10 px-2 py-0.5 rounded">
                {new Date(nextEvent.start).toLocaleDateString(t.dateFormat, { weekday: 'short' })}
              </span>
              <span>
                {new Date(nextEvent.start).toLocaleTimeString(t.dateFormat, { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 text-xs relative z-10">{t.noUpcoming}</div>
        )}
        <div className="absolute -top-5 -left-5 w-20 h-20 bg-neon-secondary/5 rounded-full blur-2xl group-hover:bg-neon-secondary/10 transition-colors"></div>
      </div>
    </div>
  );
};