
import React from 'react';
import { Logo } from './Logo';
import { ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  onGuestAccess: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onGuestAccess }) => {
  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden flex flex-col">
      
      {/* Navigation */}
      <nav className="w-full max-w-6xl mx-auto px-6 py-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-3 opacity-90">
            <Logo size={24} />
            <span className="font-semibold text-lg tracking-tight">Chronos</span>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={onGuestAccess} 
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            Demo
          </button>
          <button 
            onClick={onEnterApp} 
            className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col justify-center items-center text-center z-10 px-6">
        <div className="mb-8 animate-spring-in">
          <h1 className="text-5xl md:text-8xl font-semibold tracking-tighter text-white mb-2">
            Time.
          </h1>
          <h1 className="text-5xl md:text-8xl font-semibold tracking-tighter text-gray-500">
            Elevated.
          </h1>
        </div>
        
        <p className="text-base md:text-lg text-gray-400 max-w-lg mx-auto mb-12 font-light leading-relaxed animate-fade-in" style={{animationDelay: '0.2s'}}>
          The definitive intelligent calendar. <br/> Encrypted locally. Powered by AI.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in" style={{animationDelay: '0.4s'}}>
          <button 
            onClick={onEnterApp}
            className="px-8 py-4 bg-white text-black rounded-full font-medium text-sm tracking-wide hover:scale-105 transition-transform shadow-ios-float flex items-center gap-2"
          >
            Get Started <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-8 text-center z-10">
         <div className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">Designed by muhammedbdc</div>
      </footer>
      
      {/* Subtle Background Gradients */}
      <div className="absolute top-[-20%] left-[20%] w-[60vw] h-[60vw] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[20%] w-[60vw] h-[60vw] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none"></div>
    </div>
  );
};
