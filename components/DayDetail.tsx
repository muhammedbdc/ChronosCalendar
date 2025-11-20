
import React, { useState, useRef } from 'react';
import { CalendarEvent, Attachment, Language } from '../types';
import { X, MapPin, Clock, CalendarPlus, Printer, Edit2, Save, Trash2, AlertCircle, Paperclip, File as FileIcon, Image as ImageIcon, Download, MessageCircle, Navigation, Palette } from 'lucide-react';
import { downloadICS } from '../utils/icsGenerator';
import { printDaySchedule } from '../utils/printGenerator';
import { getTranslation } from '../utils/translations';

interface DayDetailProps {
  date: Date;
  events: CalendarEvent[];
  language: Language;
  onClose: () => void;
  onUpdateEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
}

// Neon Color Palette
const NEON_COLORS = [
  '#00F3FF', // Cyan (Default)
  '#BC13FE', // Purple
  '#00FF41', // Green
  '#FF3232', // Red
  '#FFA500', // Orange
  '#FF1493', // Pink
  '#FFD700', // Yellow
];

export const DayDetail: React.FC<DayDetailProps> = ({ date, events, language, onClose, onUpdateEvent, onDeleteEvent }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<CalendarEvent>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = getTranslation(language);

  const handleClose = () => setIsExiting(true);

  const onAnimationEnd = (e: React.AnimationEvent) => {
    if (isExiting && (e.animationName.includes('modalOut') || e.animationName.includes('backdropOut'))) {
      onClose();
    }
  };

  const startEditing = (event: CalendarEvent) => {
    setEditingId(event.id);
    setEditForm({ ...event, attachments: event.attachments || [] });
  };

  const saveEditing = () => {
    if (editingId && editForm.id && editForm.title) {
      onUpdateEvent(editForm as CalendarEvent);
      setEditingId(null);
      setEditForm({});
    }
  };

  // Navigation Logic
  const handleNavigate = (location: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    window.open(url, '_blank');
  };

  // WhatsApp Sharing Logic
  const handleShareWhatsApp = (event: CalendarEvent) => {
    const startDate = new Date(event.start);
    const formattedDate = startDate.toLocaleDateString(language === 'de' ? 'de-DE' : language === 'tr' ? 'tr-TR' : 'en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    let message = "";
    
    if (language === 'de') {
      message = `📅 *Termineinladung*\n\n**${event.title}**\n🕒 ${formattedDate}\n📍 ${event.location || 'Kein Ort'}\n\n📝 ${event.description || ''}\n\n_Gesendet via Chronos_`;
    } else if (language === 'tr') {
      message = `📅 *Etkinlik Daveti*\n\n**${event.title}**\n🕒 ${formattedDate}\n📍 ${event.location || 'Konum yok'}\n\n📝 ${event.description || ''}\n\n_Chronos ile gönderildi_`;
    } else {
      message = `📅 *Event Invitation*\n\n**${event.title}**\n🕒 ${formattedDate}\n📍 ${event.location || 'No location'}\n\n📝 ${event.description || ''}\n\n_Sent via Chronos_`;
    }

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // File Upload Logic
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 1024 * 1024) {
        alert("File too large for local storage (Max 1MB).");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const newAttachment: Attachment = {
          id: Date.now().toString(),
          name: file.name,
          type: file.type,
          size: file.size,
          data: ev.target?.result as string
        };
        setEditForm(prev => ({
          ...prev,
          attachments: [...(prev.attachments || []), newAttachment]
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = (attId: string) => {
    setEditForm(prev => ({
      ...prev,
      attachments: (prev.attachments || []).filter(a => a.id !== attId)
    }));
  };

  const downloadAttachment = (att: Attachment) => {
    const link = document.createElement('a');
    link.href = att.data;
    link.download = att.name;
    link.click();
  };

  const toLocalISOString = (isoString: string) => {
    const d = new Date(isoString);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4 ${isExiting ? 'animate-backdrop-out' : 'animate-backdrop-in'}`}
      style={{ animationFillMode: 'forwards' }}
    >
      <style>{`
        @keyframes backdropIn { 
          from { background: rgba(0,0,0,0); backdrop-filter: blur(0); } 
          to { background: rgba(0,0,0,0.4); backdrop-filter: blur(12px); } 
        }
        @keyframes backdropOut { 
          from { background: rgba(0,0,0,0.4); backdrop-filter: blur(12px); } 
          to { background: rgba(0,0,0,0); backdrop-filter: blur(0); } 
        }
        @keyframes modalIn { 
          0% { transform: scale(0.92) translateY(20px); opacity: 0; } 
          100% { transform: scale(1) translateY(0); opacity: 1; } 
        }
        @keyframes modalOut { 
          from { transform: scale(1) translateY(0); opacity: 1; } 
          to { transform: scale(0.95) translateY(20px); opacity: 0; } 
        }
        
        .animate-backdrop-in { animation: backdropIn 0.5s cubic-bezier(0.32, 0.72, 0, 1) forwards; }
        .animate-backdrop-out { animation: backdropOut 0.3s cubic-bezier(0.32, 0.72, 0, 1) forwards; }
        .animate-modal-in { animation: modalIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-modal-out { animation: modalOut 0.3s cubic-bezier(0.32, 0.72, 0, 1) forwards; }
      `}</style>

      <div className="absolute inset-0" onClick={handleClose}></div>

      <div 
        className={`
          ultra-glass-dark w-full md:max-w-xl rounded-t-[2rem] md:rounded-[2rem] 
          shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[85dvh] relative pb-safe 
          border-t border-white/10 md:border md:border-white/10
          ${isExiting ? 'animate-modal-out' : 'animate-modal-in'}
        `}
        onAnimationEnd={onAnimationEnd}
      >
        {/* Mobile Handle */}
        <div className="w-full flex justify-center pt-3 pb-1 md:hidden cursor-pointer" onClick={handleClose}>
           <div className="w-10 h-1 bg-white/20 rounded-full"></div>
        </div>

        <div className="px-6 pt-4 pb-4 flex justify-between items-start relative z-10 shrink-0">
          <div>
            <h3 className="text-4xl md:text-5xl font-mono text-white font-light tracking-tighter">{date.getDate()}</h3>
            <span className="text-neon-primary text-xs uppercase tracking-[0.2em] font-bold block mt-1 opacity-90">
              {date.toLocaleString(language === 'de' ? 'de-DE' : language === 'tr' ? 'tr-TR' : 'en-US', { month: 'long', weekday: 'long' })}
            </span>
          </div>
          <button 
            onClick={handleClose} 
            className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full transition-all duration-300 border border-white/5"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 pb-8 overflow-y-auto space-y-4 flex-1 scrollbar-hide">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500/50">
              <Clock size={32} className="mb-3 opacity-30" />
              <p className="text-xs font-medium tracking-wide">No events scheduled</p>
            </div>
          ) : (
            events.map((event) => {
              const isEditing = editingId === event.id;
              const eventColor = event.color || '#00F3FF';
              
              return (
                <div 
                  key={event.id} 
                  className={`
                    relative rounded-2xl p-5 transition-all duration-500 border group/card
                    ${isEditing 
                      ? 'bg-white/[0.08] border-neon-primary/50 shadow-[0_0_30px_-10px_rgba(var(--neon-primary),0.3)] scale-[1.01] z-10' 
                      : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06]'}
                  `}
                  style={!isEditing ? {
                    borderLeft: `3px solid ${eventColor}`
                  } : {
                    borderLeft: `3px solid ${eventColor}`,
                    boxShadow: `0 0 20px -5px ${eventColor}40`
                  }}
                >
                  {isEditing ? (
                    <div className="space-y-4 animate-fade-in relative">
                      {/* Visual Cue: Pulse Indicator */}
                      <span className="absolute -top-2 -right-2 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-neon-primary"></span>
                      </span>

                      {/* Title Input */}
                      <div className="group/input relative">
                        <input 
                          value={editForm.title || ''} 
                          onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                          className="w-full bg-transparent border-b border-white/20 text-white text-xl font-light focus:border-neon-primary focus:outline-none pb-1 transition-all placeholder-white/20 caret-neon-primary"
                          placeholder="Event Title"
                          autoFocus
                        />
                        <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-neon-primary transition-all duration-300 group-focus-within/input:w-full"></div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 rounded-lg px-2 py-1.5 border border-white/5 focus-within:border-neon-primary/30 focus-within:bg-white/10 transition-colors">
                          <label className="text-[8px] text-gray-500 uppercase tracking-wider block mb-0.5">Start</label>
                          <input 
                            type="datetime-local"
                            value={toLocalISOString(editForm.start || '')}
                            onChange={(e) => setEditForm({...editForm, start: new Date(e.target.value).toISOString()})}
                            className="w-full bg-transparent text-[10px] text-white outline-none font-mono caret-neon-primary"
                          />
                        </div>
                        <div className="bg-white/5 rounded-lg px-2 py-1.5 border border-white/5 focus-within:border-neon-primary/30 focus-within:bg-white/10 transition-colors">
                          <label className="text-[8px] text-gray-500 uppercase tracking-wider block mb-0.5">End</label>
                          <input 
                             type="datetime-local"
                             value={toLocalISOString(editForm.end || '')}
                             onChange={(e) => setEditForm({...editForm, end: new Date(e.target.value).toISOString()})}
                             className="w-full bg-transparent text-[10px] text-white outline-none font-mono caret-neon-primary"
                           />
                        </div>
                      </div>

                      {/* Color Picker */}
                      <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                        <label className="text-[9px] text-gray-500 uppercase tracking-wider block mb-2 flex items-center gap-1"><Palette size={10}/> Color</label>
                        <div className="flex gap-2 items-center overflow-x-auto scrollbar-hide pb-1">
                          {NEON_COLORS.map(color => (
                            <button
                              key={color}
                              onClick={() => setEditForm({...editForm, color})}
                              className={`w-5 h-5 rounded-full shrink-0 transition-transform duration-200 ${editForm.color === color ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'}`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-white/5 focus-within:border-neon-primary/30 focus-within:bg-white/10 transition-colors">
                        <MapPin size={14} className="text-gray-400" />
                        <input 
                          value={editForm.location || ''} 
                          onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                          className="w-full bg-transparent text-xs text-white outline-none placeholder-gray-600 caret-neon-primary"
                          placeholder="Add Location"
                        />
                      </div>

                      <textarea 
                        value={editForm.description || ''} 
                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                        className="w-full bg-white/5 border border-white/5 rounded-lg p-3 text-xs text-gray-300 focus:border-neon-primary/30 focus:bg-white/10 outline-none resize-none h-20 placeholder-gray-600 leading-relaxed caret-neon-primary transition-colors"
                        placeholder="Notes..."
                      />

                      <div>
                        <div className="flex justify-between items-center mb-1.5 px-1">
                          <label className="text-[9px] text-gray-500 uppercase tracking-wider">Files</label>
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="text-[9px] flex items-center gap-1 text-neon-primary hover:text-white transition-colors"
                          >
                            <Paperclip size={10} /> Add
                          </button>
                          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2">
                          {editForm.attachments?.map(att => (
                            <div key={att.id} className="relative group bg-white/5 rounded-md p-1 border border-white/5 flex flex-col items-center justify-center h-16 overflow-hidden">
                               {att.type.startsWith('image/') ? (
                                 <img src={att.data} alt={att.name} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" />
                               ) : (
                                 <FileIcon size={16} className="text-gray-500 mb-1" />
                               )}
                               <div className="relative z-10 text-[8px] text-gray-300 truncate w-full text-center px-1">{att.name}</div>
                               <button 
                                onClick={() => removeAttachment(att.id)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                               >
                                 <X size={8} />
                               </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                        <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-xs text-gray-500 hover:text-white transition-colors">Cancel</button>
                        <button onClick={saveEditing} className="px-4 py-1.5 bg-white text-black rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-gray-200 transition-colors">
                          <Save size={12} /> Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="animate-fade-in">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <h4 className="text-lg font-medium text-white leading-tight tracking-tight">{event.title}</h4>
                        
                        {/* Action Bar */}
                        <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-black/20 rounded-lg p-0.5 border border-white/5 backdrop-blur-sm">
                           <button onClick={() => startEditing(event)} className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-neon-primary transition-colors" title="Edit"><Edit2 size={12}/></button>
                           <button onClick={() => handleShareWhatsApp(event)} className="p-1.5 hover:bg-green-500/10 rounded text-gray-400 hover:text-green-400 transition-colors" title="Share"><MessageCircle size={12}/></button>
                           <button onClick={() => printDaySchedule(date, [event])} className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors" title="Print"><Printer size={12}/></button>
                           <button onClick={() => downloadICS(event)} className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors" title="Export"><CalendarPlus size={12}/></button>
                           <button onClick={() => onDeleteEvent(event.id)} className="p-1.5 hover:bg-red-500/10 rounded text-gray-400 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={12}/></button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-mono tracking-tight text-gray-300">
                          <Clock size={12} />
                          <span className="bg-white/5 px-1.5 py-0.5 rounded">
                            {new Date(event.start).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} 
                            <span className="mx-1 text-gray-600">-</span>
                            {new Date(event.end).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        
                        {event.location && (
                          <div 
                            className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer hover:text-neon-primary transition-colors group/loc w-fit"
                            onClick={() => handleNavigate(event.location!)}
                          >
                             <Navigation size={12} className="text-gray-500 group-hover/loc:text-neon-primary transition-colors" />
                             <span className="hover:underline decoration-dotted underline-offset-2">{event.location}</span>
                          </div>
                        )}
                        
                        {event.description && (
                          <p className="text-xs text-gray-400 mt-2 leading-relaxed font-light">
                            {event.description}
                          </p>
                        )}

                        {event.attachments && event.attachments.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-white/5">
                             <div className="flex flex-wrap gap-2">
                                {event.attachments.map(att => (
                                  <button 
                                    key={att.id}
                                    onClick={() => downloadAttachment(att)}
                                    className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-md px-2 py-1.5 transition-all group/file"
                                  >
                                    {att.type.startsWith('image/') ? <ImageIcon size={12} className="text-gray-400"/> : <FileIcon size={12} className="text-gray-400"/>}
                                    <span className="text-[10px] text-gray-300 max-w-[80px] truncate">{att.name}</span>
                                    <Download size={10} className="text-gray-500 opacity-0 group-hover/file:opacity-100 transition-opacity ml-1" />
                                  </button>
                                ))}
                             </div>
                          </div>
                        )}

                        {(event.alarms?.length ?? 0) > 0 && (
                           <div className="flex gap-1 mt-2">
                             {event.alarms?.map((a, i) => (
                               <span key={i} className="text-[9px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded border border-white/5 flex items-center gap-1">
                                 <AlertCircle size={8} /> {a}m
                               </span>
                             ))}
                           </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
