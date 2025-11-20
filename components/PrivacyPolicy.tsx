import React from 'react';
import { X, Shield, Lock, Server, Globe, FileText } from 'lucide-react';

interface PrivacyPolicyProps {
  isOpen: boolean;
  onClose: () => void;
  cmsContent?: string;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ isOpen, onClose, cmsContent }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative w-full max-w-4xl h-[85vh] ultra-glass-dark rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-modal-in">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
          <div className="flex items-center gap-3">
            <Shield className="text-neon-primary" size={24} />
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Privacy Policy & Terms</h2>
              <p className="text-xs text-gray-400">Legal Document</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 text-gray-300 text-sm leading-relaxed scrollbar-thin">
          
          {cmsContent ? (
            <div className="whitespace-pre-wrap font-sans">
               {cmsContent}
            </div>
          ) : (
            <div className="space-y-8">
              <section>
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Globe size={18} className="text-neon-secondary" /> 1. Introduction
                </h3>
                <p>
                  Welcome to <strong>Chronos</strong> ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and website (the "App").
                  By using the App, you consent to the data practices described in this policy.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <DatabaseIcon size={18} className="text-neon-secondary" /> 2. Data Collection & Storage (Local-First)
                </h3>
                <p className="mb-2">
                  <strong>Chronos operates on a "Local-First" architecture.</strong> This means:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-gray-400">
                  <li><strong>Calendar Data:</strong> Your events, titles, descriptions, and schedules are stored directly on your device using <code>localStorage</code>. We do not maintain a central database of your personal appointments.</li>
                  <li><strong>Encryption:</strong> We simulate AES-256 encryption for data stored locally on your device to prevent unauthorized access by other applications.</li>
                  <li><strong>Account Info:</strong> Your user profile (Name, Email) is stored locally to simulate a session. We do not track your identity across other services.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Server size={18} className="text-neon-secondary" /> 3. AI Processing (Google Gemini)
                </h3>
                <p>
                  To provide intelligent scheduling features (e.g., "Text-to-Event", "Image Analysis"), Chronos utilizes the <strong>Google Gemini API</strong>.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-gray-400 mt-2">
                  <li><strong>Data Transmission:</strong> When you create an event via text or voice, the raw text is sent securely (via HTTPS) to Google's servers for processing.</li>
                  <li><strong>No Training:</strong> By default, data sent to the Gemini API is used solely to generate the response and is not used to train Google's models (subject to Google's Enterprise Terms).</li>
                  <li><strong>Images:</strong> If you upload an image for analysis, it is converted to Base64 and sent temporarily to the API for interpretation. It is stored locally on your device afterwards.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Lock size={18} className="text-neon-secondary" /> 4. Your Rights (GDPR & CCPA)
                </h3>
                <p className="mb-2">Under the General Data Protection Regulation (GDPR) and CCPA, you have specific rights regarding your data:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <strong className="text-white block mb-1">Right to Erasure ("Right to be Forgotten")</strong>
                    You can permanently delete all your data by using the "Delete Account" button in the sidebar. This wipes all local storage related to Chronos immediately.
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <strong className="text-white block mb-1">Right to Data Portability</strong>
                    You can export your entire calendar at any time using the "Backup Calendar (.ICS)" feature in the settings.
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-white mb-3">5. Third-Party Services</h3>
                <p>
                  We may use the following third-party services:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-gray-400 mt-2">
                  <li><strong>Google Gemini API:</strong> For natural language processing.</li>
                  <li><strong>Google Maps:</strong> For location linking and navigation.</li>
                  <li><strong>WhatsApp:</strong> For sharing event details (triggered only by user action).</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold text-white mb-3">6. Children's Privacy</h3>
                <p>
                  We do not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal data, please contact us so that we will be able to perform necessary actions.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-white mb-3">7. Contact Us / Impressum</h3>
                <p>
                  If you have any questions about this Privacy Policy, please contact us:
                </p>
                <div className="mt-2 text-gray-400">
                  <p><strong>Chronos Dev Team</strong></p>
                  <p>Designed and Created by muhammedbdc</p>
                  <p>Email: privacy@chronos.app</p>
                  <p>Address: Musterstraße 1, 10115 Berlin, Germany (Example)</p>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-black/40 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-neon-primary text-black font-bold px-6 py-2 rounded-xl hover:bg-white transition-colors shadow-[0_0_15px_rgba(var(--neon-primary),0.4)]"
          >
            I Understand
          </button>
        </div>

      </div>
    </div>
  );
};

const DatabaseIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
  </svg>
);