import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeBackground = ({ children }) => {
  const { activeTheme, themeMode } = useTheme();
  const isLight = themeMode === 'light';

  const primaryColor = activeTheme?.colors?.primary || '#0284c7';
  const secondaryColor = activeTheme?.colors?.secondary || '#38bdf8';
  const accentColor = activeTheme?.colors?.accent || '#06b6d4';

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col">
      {/* Base Background: Soft glowing lavender-white in Light mode */}
      <div 
        className="absolute inset-0 z-0 transition-colors duration-700" 
        style={{ 
          background: isLight 
            ? '#FAF7FE' 
            : (activeTheme?.colors?.background || 'var(--theme-bg)') 
        }}
      />

      {/* Subtle Ambient Soft Lavender & Violet Glows */}
      <div 
        className={`absolute top-[-5%] left-[8%] w-[550px] h-[550px] rounded-full pointer-events-none filter blur-[130px] ${
          isLight ? 'opacity-40' : 'mix-blend-screen opacity-40'
        }`}
        style={{ background: isLight ? '#EDE9FE' : primaryColor }}
      />

      <div 
        className={`absolute top-[15%] right-[5%] w-[600px] h-[600px] rounded-full pointer-events-none filter blur-[140px] ${
          isLight ? 'opacity-35' : 'mix-blend-screen opacity-30'
        }`}
        style={{ background: isLight ? '#DDD6FE' : accentColor }}
      />

      <div 
        className={`absolute top-[45%] left-[30%] w-[450px] h-[450px] rounded-full pointer-events-none filter blur-[120px] ${
          isLight ? 'opacity-25' : 'mix-blend-screen opacity-20'
        }`}
        style={{ background: isLight ? '#F5F3FF' : secondaryColor }}
      />

      {/* Main Content Container */}
      <div className="relative z-10 flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default ThemeBackground;
