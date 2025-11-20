import React, { useState, useEffect } from 'react';
import { Shield, Activity, Users, Database, Send, Terminal, CheckCircle, Edit3, Save, Monitor, FileText, Palette, Power, Trash2, UserX, UserCheck, RefreshCw } from 'lucide-react';
import { AdminStats, GlobalConfig, Theme, User, SystemLog } from '../types';
import { AuthService } from '../services/authService';
import { StorageService } from '../utils/storage';
import { THEMES } from './ThemeSelector';
import { GoogleGenAI } from "@google/genai";

interface AdminPanelProps {
  onConfigUpdate: (config: GlobalConfig) => void;
}

type AdminTab = 'DASHBOARD' | 'USERS' | 'CONTENT' | 'APPEARANCE' | 'SYSTEM' | 'LOGS';

export const AdminPanel: React.FC<AdminPanelProps> = ({ onConfigUpdate }) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');
  
  // Data States
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [config, setConfig] = useState<GlobalConfig>({ maintenanceMode: false });
  
  // Editor States
  const [privacyText, setPrivacyText] = useState('');
  const [announcement, setAnnouncement] = useState('');
  
  // AI Console State
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>(["> System initialized...", "> Secure connection established.", "> Listening for kernel commands..."]);

  useEffect(() => {
    refreshData();
    const currentConfig = StorageService.loadConfig();
    setConfig(currentConfig);
    setPrivacyText(currentConfig.privacyPolicyContent || '');
    setAnnouncement(currentConfig.globalAnnouncement || '');
  }, []);

  const refreshData = () => {
    setStats(AuthService.getAdminStats());
    setUsers(AuthService.getAllUsers());
    setLogs(AuthService.getSystemLogs());
  };

  const saveConfig = (newConfig: Partial<GlobalConfig>) => {
    const updated = { ...config, ...newConfig };
    setConfig(updated);
    StorageService.saveConfig(updated);
    onConfigUpdate(updated);
    setConsoleLogs(prev => [...prev, `> Configuration saved: ${Object.keys(newConfig).join(', ')} updated.`]);
  };

  const handleSaveContent = () => {
    saveConfig({ 
      privacyPolicyContent: privacyText,
      globalAnnouncement: announcement
    });
    alert("Content updated globally.");
  };

  const toggleUserBan = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'BANNED' ? 'ACTIVE' : 'BANNED';
    AuthService.updateUserStatus(userId, newStatus);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
  };

  const deleteUser = (userId: string) => {
    if(window.confirm("Permanently delete this user and all encrypted data?")) {
      AuthService.deleteAccount(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  const handleAdminAction = async () => {
    if (!prompt.trim()) return;
    setIsProcessing(true);
    setConsoleLogs(prev => [...prev, `> ${prompt}`]);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const model = "gemini-2.5-flash";
        
        const result = await ai.models.generateContent({
            model,
            contents: `You are the Kernel AI of the Chronos App. 
            Current Request: "${prompt}". 
            Return a JSON object representing the new GlobalConfig. 
            Schema: { maintenanceMode: boolean, globalAnnouncement: string | null, forcedTheme: { name: string, primary: string, secondary: string } | null }.
            If the user asks to change theme to [color], return valid RGB strings for primary/secondary.`
        });

        if (result.text) {
            const cleanedText = result.text.replace(/```json|```/g, '');
            const newConfig = JSON.parse(cleanedText);
            saveConfig(newConfig);
            setConsoleLogs(prev => [...prev, "> Command executed successfully."]);
        }
        setPrompt('');
    } catch (e) {
        setConsoleLogs(prev => [...prev, "> Error: Command interpretation failed."]);
    } finally {
        setIsProcessing(false);
    }
  };

  const NavButton = ({ tab, icon: Icon, label }: { tab: AdminTab, icon: any, label: string }) => (
    <button onClick={() => setActiveTab(tab)} className={`p-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-all ${activeTab === tab ? 'bg-neon-primary/20 text-neon-primary border border-neon-primary/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
      <Icon size={18} /> {label}
    </button>
  );

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-black/90 backdrop-blur-md overflow-hidden h-full">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 border-r border-white/10 bg-black/40 p-4 flex flex-col gap-2 shrink-0">
         <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 px-2">Management</div>
         <NavButton tab="DASHBOARD" icon={Activity} label="Overview" />
         <NavButton tab="USERS" icon={Users} label="Users" />
         <NavButton tab="LOGS" icon={Terminal} label="System Logs" />
         
         <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-6 mb-4 px-2">Configuration</div>
         <NavButton tab="APPEARANCE" icon={Palette} label="Appearance" />
         <NavButton tab="CONTENT" icon={FileText} label="Policy & Content" />
         <NavButton tab="SYSTEM" icon={Monitor} label="System" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div>
              <h1 className="text-3xl font-mono font-bold text-white flex items-center gap-3">
                <Shield className="text-red-500" /> {activeTab}
              </h1>
              <p className="text-xs text-gray-500 mt-2 font-mono uppercase">Root Access // Encrypted Session</p>
            </div>
            <button onClick={refreshData} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
              <RefreshCw size={18} />
            </button>
          </div>

          {/* --- DASHBOARD TAB --- */}
          {activeTab === 'DASHBOARD' && stats && (
             <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                        <div className="text-gray-400 text-xs uppercase mb-2 flex items-center gap-2"><Users size={14}/> Total Users</div>
                        <div className="text-2xl text-white font-mono">{stats.totalUsers.toLocaleString()}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                        <div className="text-gray-400 text-xs uppercase mb-2 flex items-center gap-2"><Activity size={14}/> Daily Active</div>
                        <div className="text-2xl text-neon-primary font-mono">{stats.activeUsersDaily.toLocaleString()}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                        <div className="text-gray-400 text-xs uppercase mb-2 flex items-center gap-2"><Database size={14}/> Stored Events</div>
                        <div className="text-2xl text-neon-secondary font-mono">{stats.totalEventsStored.toLocaleString()}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                        <div className="text-gray-400 text-xs uppercase mb-2 flex items-center gap-2"><CheckCircle size={14}/> Health</div>
                        <div className="text-2xl text-green-400 font-mono">{stats.systemHealth}%</div>
                    </div>
                </div>

                {/* Real-time Graph Simulation */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Live Traffic Simulation</div>
                    <div className="flex items-end justify-between h-32 gap-1">
                        {Array.from({length: 40}).map((_, i) => (
                            <div 
                                key={i} 
                                className="flex-1 bg-neon-primary/30 rounded-t-sm transition-all duration-500"
                                style={{ 
                                    height: `${Math.random() * 100}%`,
                                    opacity: Math.random() * 0.5 + 0.5
                                }}
                            ></div>
                        ))}
                    </div>
                </div>

                {/* AI Command Center */}
                <div className="bg-black border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="bg-white/5 p-3 border-b border-white/10 flex items-center gap-2">
                        <Terminal size={16} className="text-gray-400" />
                        <span className="text-xs text-gray-300 font-mono">Chronos Kernel (AI)</span>
                    </div>
                    <div className="h-48 p-4 font-mono text-xs space-y-1 overflow-y-auto text-green-400/80 bg-black/50 scrollbar-thin">
                        {consoleLogs.map((log, i) => <div key={i}>{log}</div>)}
                        {isProcessing && <div className="animate-pulse">_</div>}
                    </div>
                    <div className="p-4 bg-white/5 border-t border-white/10 flex gap-3">
                        <input 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Enter natural language command (e.g., 'Enable Maintenance', 'Switch to Matrix theme')..."
                            className="flex-1 bg-transparent text-white font-mono text-sm outline-none placeholder-gray-600"
                            onKeyDown={(e) => e.key === 'Enter' && handleAdminAction()}
                        />
                        <button onClick={handleAdminAction} disabled={isProcessing || !prompt} className="text-neon-primary hover:text-white disabled:opacity-30 transition-colors">
                            <Send size={18} />
                        </button>
                    </div>
                </div>
             </div>
          )}

          {/* --- USERS TAB --- */}
          {activeTab === 'USERS' && (
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden animate-fade-in">
               <table className="w-full text-left text-sm text-gray-400">
                  <thead className="bg-black/20 text-gray-500 font-mono text-xs uppercase tracking-wider">
                     <tr>
                        <th className="p-4">User</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Joined</th>
                        <th className="p-4 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {users.length === 0 ? (
                        <tr><td colSpan={5} className="p-8 text-center">No users found in simulation DB.</td></tr>
                     ) : users.map(user => (
                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                           <td className="p-4 flex items-center gap-3">
                              <img src={user.avatar} className="w-8 h-8 rounded-full bg-white/10" alt="" />
                              <div>
                                 <div className="text-white font-medium">{user.name}</div>
                                 <div className="text-xs">{user.email}</div>
                              </div>
                           </td>
                           <td className="p-4">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                 {user.role}
                              </span>
                           </td>
                           <td className="p-4">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${user.status === 'BANNED' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                 {user.status || 'ACTIVE'}
                              </span>
                           </td>
                           <td className="p-4 font-mono text-xs">
                              {new Date(user.createdAt).toLocaleDateString()}
                           </td>
                           <td className="p-4 text-right flex justify-end gap-2">
                              <button 
                                 onClick={() => toggleUserBan(user.id, user.status || 'ACTIVE')} 
                                 className={`p-2 rounded hover:bg-white/10 transition-colors ${user.status === 'BANNED' ? 'text-green-400' : 'text-orange-400'}`}
                                 title={user.status === 'BANNED' ? "Unban" : "Ban"}
                              >
                                 {user.status === 'BANNED' ? <UserCheck size={16} /> : <UserX size={16} />}
                              </button>
                              <button onClick={() => deleteUser(user.id)} className="p-2 rounded hover:bg-red-500/20 text-red-500 transition-colors" title="Delete">
                                 <Trash2 size={16} />
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          )}

          {/* --- LOGS TAB --- */}
          {activeTab === 'LOGS' && (
            <div className="bg-black border border-white/10 rounded-2xl p-4 font-mono text-xs h-[600px] overflow-y-auto scrollbar-thin animate-fade-in">
               {logs.map((log) => (
                  <div key={log.id} className="flex gap-3 mb-1.5 border-b border-white/5 pb-1 last:border-0">
                     <span className="text-gray-600 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                     <span className={`font-bold shrink-0 w-16 ${
                        log.level === 'ERROR' ? 'text-red-500' : 
                        log.level === 'WARN' ? 'text-yellow-500' : 
                        log.level === 'SUCCESS' ? 'text-green-500' : 'text-blue-500'
                     }`}>[{log.level}]</span>
                     <span className="text-gray-500 shrink-0 w-16">[{log.source}]</span>
                     <span className="text-gray-300">{log.message}</span>
                  </div>
               ))}
            </div>
          )}

          {/* --- APPEARANCE TAB --- */}
          {activeTab === 'APPEARANCE' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Palette size={18}/> Global Theme Override</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {THEMES.map(theme => (
                    <button
                      key={theme.name}
                      onClick={() => saveConfig({ forcedTheme: theme })}
                      className={`p-4 rounded-xl border flex items-center justify-between group transition-all
                        ${config.forcedTheme?.name === theme.name ? 'bg-white/10 border-neon-primary' : 'bg-black/20 border-white/10 hover:bg-white/5'}
                      `}
                    >
                      <span className="text-gray-300 text-sm">{theme.name}</span>
                      <div className="flex gap-2">
                        <div className="w-4 h-4 rounded-full" style={{background: `rgb(${theme.primary})`, boxShadow: `0 0 10px rgb(${theme.primary})`}}></div>
                        <div className="w-4 h-4 rounded-full" style={{background: `rgb(${theme.secondary})`}}></div>
                      </div>
                    </button>
                  ))}
                  <button
                     onClick={() => saveConfig({ forcedTheme: null })}
                     className={`p-4 rounded-xl border flex items-center justify-center gap-2 group transition-all
                        ${!config.forcedTheme ? 'bg-white/10 border-white' : 'bg-black/20 border-white/10 hover:bg-white/5'}
                      `}
                  >
                    <span className="text-gray-300 text-sm">User Preference (Default)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- CONTENT TAB --- */}
          {activeTab === 'CONTENT' && (
            <div className="space-y-6 h-full animate-fade-in">
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                 <h3 className="text-white font-bold mb-2 flex items-center gap-2"><Monitor size={18}/> Global Announcement</h3>
                 <p className="text-xs text-gray-400 mb-4">Display a banner message at the top of the app for all users.</p>
                 <input 
                   value={announcement}
                   onChange={(e) => setAnnouncement(e.target.value)}
                   className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-neon-primary outline-none"
                   placeholder="e.g., 'System Maintenance scheduled for Sunday...'"
                 />
              </div>

              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col">
                 <h3 className="text-white font-bold mb-2 flex items-center gap-2"><Edit3 size={18}/> Privacy Policy Editor</h3>
                 <textarea 
                   value={privacyText}
                   onChange={(e) => setPrivacyText(e.target.value)}
                   className="w-full h-64 bg-black/40 border border-white/10 rounded-xl p-4 text-gray-300 text-sm font-mono focus:border-neon-primary outline-none resize-none"
                   placeholder="# Privacy Policy..."
                 />
              </div>

              <div className="flex justify-end">
                <button onClick={handleSaveContent} className="px-6 py-3 bg-neon-primary text-black font-bold rounded-xl hover:bg-white transition-colors flex items-center gap-2">
                   <Save size={18} /> Save Changes
                </button>
              </div>
            </div>
          )}

          {/* --- SYSTEM TAB --- */}
          {activeTab === 'SYSTEM' && (
             <div className="space-y-6 animate-fade-in">
                <div className="bg-red-500/10 p-6 rounded-2xl border border-red-500/30">
                  <h3 className="text-red-500 font-bold mb-4 flex items-center gap-2"><Power size={18}/> Emergency Control</h3>
                  
                  <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-red-500/20">
                    <div>
                      <div className="text-white font-medium">Maintenance Mode</div>
                      <div className="text-xs text-gray-400">Locks user access and displays a maintenance screen.</div>
                    </div>
                    <button 
                      onClick={() => saveConfig({ maintenanceMode: !config.maintenanceMode })}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${config.maintenanceMode ? 'bg-red-500 text-white' : 'bg-white/10 text-gray-400 hover:text-white'}`}
                    >
                      {config.maintenanceMode ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>
                </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};