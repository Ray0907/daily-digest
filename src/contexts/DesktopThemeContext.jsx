import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const THEMES = ['win95', 'mac', 'modern', 'newspaper'];
const DEFAULT_THEME = 'newspaper';

const DesktopThemeContext = createContext();

export function DesktopThemeProvider({ children }) {
  const [desktopTheme, setDesktopTheme] = useState(DEFAULT_THEME);

  useEffect(() => {
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
