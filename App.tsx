
import React, { useState, useEffect } from 'react';
import { CalendarGrid } from './components/CalendarGrid';
import { InputBar } from './components/InputBar';
import { DayDetail } from './components/DayDetail';
import { Widgets } from './components/Widgets';
import { ThemeSelector, THEMES } from './components/ThemeSelector';
import { Auth } from './components/Auth';
import { BugReporter } from './components/BugReporter';
import { AdminPanel } from './components/AdminPanel';
import { CookieConsent } from './components/CookieConsent';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { LandingPage } from './components/LandingPage';
import { MiniGames } from './components/MiniGames';
import { Logo } from './components/Logo';
import { parseEventFromInput } from './services/geminiService';
import { StorageService } from './utils/storage';
import { downloadFullCalendarICS } from './utils/icsGenerator';
import { AuthService } from './services/authService';
import { CalendarEvent, Theme, Language, CalendarViewMode, User, GlobalConfig } from './types';
import { Menu, X, Download, LogOut, Trash2, ShieldCheck, User as UserIcon } from 'lucide-react';
import { getTranslation } from './utils/translations';

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Welcome to Chronos',
    start: new Date().toISOString(),
    end: new Date(new Date().getTime() + 3600000).toISOString(),
    description: 'Your secure, encrypted calendar is ready.',
    location: 'Chronos Secure Hub',
    allDay: false,
    alarms: [60],
    color: '#00F3FF'
  }
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [config, setConfig] = useState<GlobalConfig>({ maintenanceMode: false });
  const [isLandingOpen, setIsLandingOpen] = useState(true);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>(CalendarViewMode.MONTH);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentTheme, setCurrentTheme] = useState<Theme>(THEMES[0]);
  const [language, setLanguage] = useState<Language>('en');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  
  const [showGame, setShowGame] = useState(false);
  const [watermarkClicks, setWatermarkClicks] = useState(0);

  const t = getTranslation(language);

  useEffect(() => {
    const session = StorageService.loadSession();
    if (session) {
      setUser(session);
      setIsLandingOpen(false);
    }
    
    const savedConfig = StorageService.loadConfig();
    setConfig(savedConfig);
    if (savedConfig.forcedTheme) setCurrentTheme(savedConfig.forcedTheme);
  }, []);

  useEffect(() => {
    if (user) {
      const loaded = StorageService.loadEvents(user.id);
      setEvents(loaded || INITIAL_EVENTS);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.role !== 'GUEST') {
      StorageService.saveEvents(events, user.id);
    }
  }, [events, user]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--neon-primary', currentTheme.primary);
    root.style.setProperty('--neon-secondary', currentTheme.secondary);
  }, [currentTheme]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    StorageService.saveSession(loggedInUser);
    setIsLandingOpen(false);
  };

  const handleGuestAccess = () => {
    const guestUser: User = {
      id: 'guest-' + Date.now(),
      name: 'Guest User',
      email: 'guest@chronos.local',
      role: 'GUEST',
      createdAt: Date.now()
    };
    setUser(guestUser);
    setEvents(INITIAL_EVENTS);
    setIsLandingOpen(false);
  };

  const handleLogout = () => {
    StorageService.clearSession();
    setUser(null);
    setEvents([]);
    setIsSidebarOpen(false);
    setIsLandingOpen(true);
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    const confirm = window.confirm("Delete account? This action is irreversible.");
    if (confirm) {
      await AuthService.deleteAccount(user.id);
      handleLogout();
    }
  };

  const handleWatermarkClick = () => {
    const newCount = watermarkClicks + 1;
    setWatermarkClicks(newCount);
    if (newCount >= 3) {
      setShowGame(true);
      setWatermarkClicks(0);
      setIsSidebarOpen(false);
    }
  };

  const handleCreateEvent = async (text: string, image?: string) => {
    setIsProcessing(true);
    try {
      const partialEvent = await parseEventFromInput(text, language, image, currentDate);
      if (partialEvent && partialEvent.title && partialEvent.start) {
        const newEvent: CalendarEvent = {
          id: Date.now().toString(),
          title: partialEvent.title,
          start: partialEvent.start,
          end: partialEvent.end || partialEvent.start, 
          location: partialEvent.location,
          description: partialEvent.description,
          allDay: partialEvent.allDay || false,
          alarms: partialEvent.alarms || [60],
          color: partialEvent.color || '#00F3FF'
        };
        setEvents(prev => [...prev, newEvent]);
        const eventDate = new Date(newEvent.start);
        setCurrentDate(new Date(eventDate.getFullYear(), eventDate.getMonth(), 1));
        setViewMode(CalendarViewMode.MONTH);
        setSelectedDate(eventDate);
      }
    } catch (error) {
      console.error("Error", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLandingOpen && !user) {
    return <LandingPage onEnterApp={() => setIsLandingOpen(false)} onGuestAccess={handleGuestAccess} />;
  }

  if (user?.role === 'ADMIN') {
    return (
      <div className="w-full h-screen flex flex-col bg-black text-white font-sans overflow-hidden">
         <div className="h-14 border-b border-white/10 flex items-center justify-between px-6">
            <div className="font-semibold flex items-center gap-2"><Logo size={20} /> Admin Console</div>
            <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-white">Logout</button>
         </div>
         <AdminPanel onConfigUpdate={(newConfig) => {
             setConfig(newConfig);
             if (newConfig.forcedTheme) setCurrentTheme(newConfig.forcedTheme);
         }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative w-full h-screen-safe bg-black flex items-center justify-center p-4">
         <CookieConsent onOpenPrivacy={() => setIsPrivacyOpen(true)} />
         <PrivacyPolicy isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} cmsContent={config.privacyPolicyContent} />
         
         <div className="w-full max-w-md z-10">
            <div className="flex justify-center mb-6">
              <Logo size={64} />
            </div>
            <Auth onLogin={handleLogin} onOpenPrivacy={() => setIsPrivacyOpen(true)} />
         </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen-safe flex flex-col md:flex-row bg-black text-white font-sans overflow-hidden">
      <CookieConsent onOpenPrivacy={() => setIsPrivacyOpen(true)} />
      <PrivacyPolicy isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} cmsContent={config.privacyPolicyContent} />
      
      {showGame && <MiniGames onClose={() => setShowGame(false)} />}

      {/* Mobile Header with Safe Area Padding */}
      <div className="md:hidden flex justify-between items-center px-4 pb-3 pt-[calc(1rem+env(safe-area-inset-top))] bg-black/80 backdrop-blur-xl border-b border-white/10 z-30 sticky top-0">
        <button onClick={() => setIsSidebarOpen(true)}><Menu size={24} /></button>
        <div className="flex items-center gap-2">
           <Logo size={18} />
           <span className="font-semibold tracking-tight text-sm">Chronos</span>
        </div>
        <div className="w-6"></div> 
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-[#1c1c1e]/95 backdrop-blur-2xl border-r border-white/10 
        transform transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] 
        flex flex-col pt-[calc(1.5rem+env(safe-area-inset-top))] pb-safe px-6
        md:relative md:translate-x-0 md:bg-transparent md:backdrop-blur-none md:w-[300px] md:pt-6
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
         <div className="md:hidden flex justify-end mb-4">
           <button onClick={() => setIsSidebarOpen(false)}><X size={24} /></button>
         </div>

         <div className="hidden md:flex items-center gap-3 mb-10 px-2">
            <Logo size={28} />
            <h1 className="text-xl font-semibold tracking-tight">Chronos</h1>
         </div>
         
         <div className="flex-1 overflow-y-auto scrollbar-hide space-y-8">
            {/* Profile Card */}
            <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden border border-white/10">
                  {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt=""/> : <UserIcon size={20} className="m-2 text-gray-400"/>}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate text-white">{user.name}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wide">{user.role === 'GUEST' ? 'Guest' : 'Pro Account'}</div>
                </div>
                <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-white transition-colors"><LogOut size={16}/></button>
            </div>
            
            {/* Language */}
            <div className="flex gap-1 p-1 bg-white/5 rounded-lg border border-white/5">
                {(['en', 'de', 'tr'] as Language[]).map(lang => (
                    <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${language === lang ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                    {lang.toUpperCase()}
                    </button>
                ))}
            </div>

            <Widgets 
                events={events} 
                language={language}
                onEventClick={(d) => {
                    setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1));
                    setViewMode(CalendarViewMode.MONTH);
                    setSelectedDate(d);
                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                }} 
            />

            <div className="pt-6 border-t border-white/5 space-y-2">
                <button 
                    onClick={() => downloadFullCalendarICS(events)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-gray-400 hover:text-white"
                >
                    <Download size={16} /> {t.backup}
                </button>
                {user.role !== 'GUEST' && (
                  <button onClick={handleDeleteAccount} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors text-sm text-gray-400 hover:text-red-500">
                    <Trash2 size={16} /> Delete Account
                  </button>
                )}
                <BugReporter events={events} onEventsUpdated={setEvents} />
            </div>
         </div>

         <div className="text-[10px] text-gray-700 text-center pt-6 pb-2 cursor-default hover:text-gray-500 transition-colors" onClick={handleWatermarkClick}>
           Designed by muhammedbdc
         </div>
      </aside>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      <main className="flex-1 flex flex-col h-full relative w-full md:border-l md:border-white/10">
          <CalendarGrid 
              currentDate={currentDate} 
              events={events} 
              language={language}
              viewMode={viewMode}
              onChangeViewMode={(mode, date) => {
                  setViewMode(mode);
                  if(date) setCurrentDate(date);
              }}
              onDateSelect={setSelectedDate}
              onPrev={() => {
                  const d = new Date(currentDate);
                  if (viewMode === CalendarViewMode.MONTH) d.setMonth(d.getMonth() - 1);
                  else d.setFullYear(d.getFullYear() - 1);
                  setCurrentDate(d);
              }}
              onNext={() => {
                  const d = new Date(currentDate);
                  if (viewMode === CalendarViewMode.MONTH) d.setMonth(d.getMonth() + 1);
                  else d.setFullYear(d.getFullYear() + 1);
                  setCurrentDate(d);
              }}
              onJumpToToday={() => {
                  const now = new Date();
                  setCurrentDate(now);
                  setViewMode(CalendarViewMode.MONTH);
                  setSelectedDate(now);
              }}
          />
          <InputBar onSubmit={handleCreateEvent} isProcessing={isProcessing} language={language} />
      </main>

      {selectedDate && (
        <DayDetail 
          date={selectedDate} 
          events={selectedDate ? events.filter(e => {
             const d = new Date(e.start);
             return d.getDate() === selectedDate.getDate() && 
                    d.getMonth() === selectedDate.getMonth() &&
                    d.getFullYear() === selectedDate.getFullYear();
          }) : []} 
          language={language}
          onClose={() => setSelectedDate(null)} 
          onUpdateEvent={(upd) => setEvents(prev => prev.map(e => e.id === upd.id ? upd : e))}
          onDeleteEvent={(id) => setEvents(prev => prev.filter(e => e.id !== id))}
        />
      )}
    </div>
  );
};

export default App;
