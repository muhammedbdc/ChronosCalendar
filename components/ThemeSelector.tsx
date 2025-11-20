
import React, { useState } from 'react';
import { Palette } from 'lucide-react';
import { Theme } from '../types';

export const THEMES: Theme[] = [
  { name: 'Inferno', primary: '255 50 50', secondary: '255 165 0' },    // Red / Orange (Default)
  { name: 'Cyberpunk', primary: '0 243 255', secondary: '188 19 254' }, // Cyan / Purple
  { name: 'Matrix', primary: '0 255 65', secondary: '0 128 0' },        // Green / Dark Green
  { name: 'Ocean', primary: '0 191 255', secondary: '64 224 208' },     // Deep Sky Blue / Turquoise
  { name: 'Love', primary: '255 20 147', secondary: '255 105 180' },    // Deep Pink / Hot Pink
];

interface ThemeSelectorProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onThemeChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-white/5 hover:bg-neon-primary/20 hover:text-neon-primary transition-colors border border-white/10"
        title="Change Theme"
      >
        <Palette size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-48 bg-neon-card border border-white/10 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] p-2 animate-[fadeIn_0.2s_ease-out]">
          <div className="space-y-1">
            {THEMES.map((theme) => (
              <button
                key={theme.name}
                onClick={() => {
                  onThemeChange(theme);
                  setIsOpen(false);
                }}
                className={`
                  w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between hover:bg-white/5 transition-colors
                  ${currentTheme.name === theme.name ? 'text-white font-medium bg-white/10' : 'text-gray-400'}
                `}
              >
                <span>{theme.name}</span>
                <div className="flex gap-1">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: `rgb(${theme.primary})`, boxShadow: `0 0 5px rgb(${theme.primary})` }}
                  />
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: `rgb(${theme.secondary})`, boxShadow: `0 0 5px rgb(${theme.secondary})` }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
