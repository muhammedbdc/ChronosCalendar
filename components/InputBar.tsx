
import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Send, Loader2, Mic, Camera, X } from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../utils/translations';

interface InputBarProps {
  onSubmit: (text: string, image?: string) => Promise<void>;
  isProcessing: boolean;
  language: Language;
}

export const InputBar: React.FC<InputBarProps> = ({ onSubmit, isProcessing, language }) => {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const t = getTranslation(language);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language === 'de' ? 'de-DE' : language === 'tr' ? 'tr-TR' : 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
        }
        if (finalTranscript) setInput(prev => prev + (prev ? ' ' : '') + finalTranscript);
      };
      
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [language]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if ((!input.trim() && !selectedImage) || isProcessing) return;
    await onSubmit(input, selectedImage || undefined);
    setInput(''); 
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {/* Gradient fade to smooth content scrolling behind the floating bar */}
      <div 
        className="fixed bottom-0 left-0 w-full h-32 pointer-events-none z-30"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 40%, transparent 100%)' }}
      ></div>

      <div 
        className="fixed left-0 w-full z-40 pointer-events-none flex justify-center"
        style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
      >
        <div className="w-full max-w-2xl px-4 pointer-events-auto">
          
          {/* Image Preview */}
          {selectedImage && (
            <div className="mb-2 animate-spring-in origin-bottom">
              <div className="relative inline-block">
                <img src={selectedImage} alt="Preview" className="h-20 w-auto rounded-xl border border-white/10 shadow-xl object-cover" />
                <button 
                  onClick={() => { setSelectedImage(null); if(fileInputRef.current) fileInputRef.current.value=''; }}
                  className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1 shadow-md border border-white/10"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          )}

          {/* "Dynamic Island" Input */}
          <div className="ultra-glass rounded-full p-1.5 pl-5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] flex items-center gap-2 transition-all duration-300 focus-within:scale-[1.01] focus-within:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)]">
            
            {isProcessing ? (
               <Loader2 className="animate-spin text-gray-400 shrink-0" size={20} />
            ) : (
               <div className="w-2 h-2 rounded-full bg-neon-primary shrink-0 shadow-[0_0_8px_rgba(var(--neon-primary),0.6)]"></div>
            )}
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? t.listening : t.askChronos}
              className="flex-1 bg-transparent border-none text-white placeholder-gray-500 py-3 focus:ring-0 outline-none text-base font-normal"
              disabled={isProcessing}
            />
            
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

            <div className="flex items-center gap-1 pr-1">
               <button
                onClick={toggleListening}
                className={`p-3 rounded-full transition-all ${isListening ? 'text-red-500 bg-red-500/10' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
              >
                <Mic size={20} />
              </button>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className={`p-3 rounded-full transition-all ${selectedImage ? 'text-neon-primary' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
              >
                <Camera size={20} />
              </button>

              <button 
                onClick={handleSubmit}
                disabled={(!input.trim() && !selectedImage) || isProcessing}
                className={`p-3 rounded-full transition-all ${ (input.trim() || selectedImage) && !isProcessing ? 'bg-white text-black hover:scale-105' : 'bg-white/10 text-gray-500 cursor-not-allowed'}`}
              >
                <Send size={18} fill={input.trim() ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
