import React, { createContext, useContext, useState, useEffect } from 'react';
import { themes, defaultTheme } from '../themes';

const ThemeContext = createContext();

export const useTheme = () => {
  return useContext(ThemeContext);
};

export const ThemeProvider = ({ children }) => {
  const [activeTheme, setActiveTheme] = useState(() => {
    // Check local storage for saved theme palette
    const saved = localStorage.getItem('gubbi_theme') || localStorage.getItem('quizforge_theme');
    return saved && themes[saved] ? themes[saved] : defaultTheme;
  });

  const [themeMode, setThemeMode] = useState(() => {
    // Default to 'light' theme unless user explicitly saved a preference
    const savedPreference = localStorage.getItem('gubbi_theme_preference');
    if (savedPreference === 'dark' || savedPreference === 'light') {
      return savedPreference;
    }
    const legacyMode = localStorage.getItem('gubbi_mode') || localStorage.getItem('quizforge_mode');
    if (legacyMode === 'dark') {
      // Legacy visitor whose mode was set by earlier dark default - upgrade to light default
      return 'light';
    }
    return 'light';
  });

  // Whenever palette or mode changes, update CSS variables on :root
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', activeTheme.colors.primary);
    root.style.setProperty('--theme-secondary', activeTheme.colors.secondary);
    root.style.setProperty('--theme-accent', activeTheme.colors.accent);
    root.style.setProperty('--theme-font', activeTheme.typography.fontFamily);
    
    if (themeMode === 'light') {
      root.style.removeProperty('--theme-bg');
      root.style.removeProperty('--theme-card-bg');
      root.style.removeProperty('--theme-text');
    } else {
      root.style.setProperty('--theme-bg', activeTheme.colors.background);
      root.style.setProperty('--theme-card-bg', activeTheme.colors.cardBg);
      root.style.setProperty('--theme-text', activeTheme.colors.text);
    }
    localStorage.setItem('gubbi_theme', activeTheme.id);
  }, [activeTheme, themeMode]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('light', themeMode === 'light');
    root.classList.toggle('dark', themeMode === 'dark');
    localStorage.setItem('gubbi_mode', themeMode);
    localStorage.setItem('gubbi_theme_preference', themeMode);
  }, [themeMode]);

  const changeTheme = (themeId) => {
    if (themes[themeId]) {
      setActiveTheme(themes[themeId]);
    }
  };

  const toggleThemeMode = () => {
    setThemeMode((current) => {
      const next = current === 'light' ? 'dark' : 'light';
      localStorage.setItem('gubbi_theme_preference', next);
      localStorage.setItem('gubbi_mode', next);
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ activeTheme, changeTheme, themes, themeMode, toggleThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
