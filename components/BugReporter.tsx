import React, { useState } from 'react';
import { AlertTriangle, Wrench, Check, Loader2, Bug } from 'lucide-react';
import { analyzeBugReport, repairEventData } from '../services/geminiService';
import { CalendarEvent } from '../types';

interface BugReporterProps {
  events: CalendarEvent[];
  onEventsUpdated: (events: CalendarEvent[]) => void;
}

export const BugReporter: React.FC<BugReporterProps> = ({ events, onEventsUpdated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [bugText, setBugText] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'ANALYZING' | 'FIXING' | 'DONE'>('IDLE');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleAutoFix = async () => {
    setStatus('FIXING');
    setFeedback('Gemini is scanning database integrity...');
    try {
      const fixedEvents = await repairEventData(events);
      onEventsUpdated(fixedEvents);
      setFeedback('Data integrity scan complete. Malformed events repaired.');
      setStatus('DONE');
    } catch (e) {
      setFeedback('Repair failed. Please try again.');
      setStatus('IDLE');
    }
  };

  const handleBugReport = async () => {
    if (!bugText) return;
    setStatus('ANALYZING');
    try {
      const snippet = JSON.stringify(events.slice(0, 2)); // Send small context
      const result = await analyzeBugReport(bugText, snippet);
      
      setFeedback(`Analysis: ${result.analysis}\n\nAction: ${result.suggestedFix}`);
      setStatus('DONE');
      setBugText('');
    } catch (e) {
      setFeedback('Could not reach support servers.');
      setStatus('IDLE');
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full text-xs text-gray-500 hover:text-neon-primary transition-colors flex items-center gap-2 mt-4 px-2"
      >
        <Bug size={12} />
        <span>Report Bug / Auto-Fix</span>
      </button>
    );
  }

  return (
    <div className="mt-4 bg-black/40 border border-white/10 rounded-lg p-3">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gemini Maintenance</h4>
        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">
          <AlertTriangle size={12} />
        </button>
      </div>

      {status === 'IDLE' && (
        <div className="space-y-2">
          <textarea
            value={bugText}
            onChange={(e) => setBugText(e.target.value)}
            placeholder="Describe the issue..."
            className="w-full bg-white/5 text-xs text-white p-2 rounded border border-white/10 focus:border-neon-primary outline-none"
            rows={2}
          />
          <div className="flex gap-2">
            <button 
              onClick={handleBugReport}
              disabled={!bugText}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs py-1.5 rounded transition-colors disabled:opacity-50"
            >
              Report
            </button>
            <button 
              onClick={handleAutoFix}
              className="flex-1 bg-neon-primary/10 hover:bg-neon-primary/20 text-neon-primary border border-neon-primary/30 text-xs py-1.5 rounded transition-colors flex items-center justify-center gap-1"
            >
              <Wrench size={10} /> Auto-Heal Data
            </button>
          </div>
        </div>
      )}

      {(status === 'ANALYZING' || status === 'FIXING') && (
        <div className="flex items-center gap-2 text-xs text-neon-secondary py-4 justify-center">
          <Loader2 size={14} className="animate-spin" />
          {status === 'FIXING' ? 'Repairing data...' : 'Analyzing code...'}
        </div>
      )}

      {status === 'DONE' && (
        <div className="text-xs">
          <div className="text-green-400 mb-2 flex items-center gap-1">
             <Check size={12} /> Task Complete
          </div>
          <p className="text-gray-400 whitespace-pre-wrap leading-relaxed">{feedback}</p>
          <button 
            onClick={() => { setStatus('IDLE'); setFeedback(null); }}
            className="w-full mt-2 bg-white/5 hover:bg-white/10 text-gray-300 py-1 rounded"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};