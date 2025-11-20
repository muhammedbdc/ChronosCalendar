import React, { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';

interface CookieConsentProps {
  onOpenPrivacy: () => void;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({ onOpenPrivacy }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consented = localStorage.getItem('chronos_cookie_consent');
    if (!consented) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('chronos_cookie_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[100] animate-fade-in-scale">
      <div className="ultra-glass rounded-2xl p-5 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-neon-primary"></div>
        
        <div className="flex items-start gap-3 mb-3">
           <ShieldCheck className="text-neon-primary shrink-0" size={24} />
           <div>
             <h4 className="text-white font-bold text-sm">Privacy & Compliance</h4>
             <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
               We use local storage to secure your data. This app is GDPR compliant and does not track you across other sites. 
               By using Chronos, you agree to our Terms.
             </p>
           </div>
        </div>

        <div className="flex gap-2 mt-2">
          <button 
            onClick={handleAccept}
            className="flex-1 bg-neon-primary text-black text-xs font-bold py-2 rounded-lg hover:bg-white transition-colors"
          >
            Accept Essential
          </button>
          <button 
            onClick={onOpenPrivacy}
            className="flex-1 flex items-center justify-center border border-white/10 text-gray-400 text-xs font-medium py-2 rounded-lg hover:text-white hover:bg-white/5 transition-colors"
          >
            Privacy Policy
          </button>
        </div>
      </div>
    </div>
  );
};