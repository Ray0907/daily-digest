import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const THEMES = ['win95', 'mac', 'modern'];
const STORAGE_KEY = 'desktop-theme';
const DEFAULT_THEME = 'modern';

const DesktopThemeContext = createContext();

export function DesktopThemeProvider({ children }) {
  const [desktopTheme, setDesktopTheme] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return THEMES.includes(stored) ? stored : DEFAULT_THEME;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, desktopTheme);
    document.documentElement.setAttribute('data-desktop-theme', desktopTheme);
  }, [desktopTheme]);

  const cycleTheme = useCallback(() => {
    setDesktopTheme((current) => {
      const index = THEMES.indexOf(current);
      return THEMES[(index + 1) % THEMES.length];
    });
  }, []);

  return (
    <DesktopThemeContext.Provider value={{ desktopTheme, setDesktopTheme, cycleTheme }}>
      {children}
    </DesktopThemeContext.Provider>
  );
}

export function useDesktopTheme() {
  const context = useContext(DesktopThemeContext);
  if (!context) {
    throw new Error('useDesktopTheme must be used within a DesktopThemeProvider');
  }
  return context;
}
