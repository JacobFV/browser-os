import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import './theme.css';
import './components/Button.css';
import './components/Input.css';
import './components/Select.css';
import './components/Toggle.css';

export type Theme = 'light' | 'dark';
export type WindowButtonSide = 'left' | 'right';

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  windowButtonSide: WindowButtonSide;
  setWindowButtonSide: (side: WindowButtonSide) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = 'browser-os-theme';
const WINDOW_BUTTON_SIDE_STORAGE_KEY = 'browser-os-window-button-side';

export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  defaultWindowButtonSide?: WindowButtonSide;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'light',
  defaultWindowButtonSide = 'left',
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    }
    return defaultTheme;
  });

  const [windowButtonSide, setWindowButtonSideState] = useState<WindowButtonSide>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(WINDOW_BUTTON_SIDE_STORAGE_KEY);
      if (stored === 'left' || stored === 'right') {
        return stored;
      }
    }
    return defaultWindowButtonSide;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(WINDOW_BUTTON_SIDE_STORAGE_KEY, windowButtonSide);
      document.documentElement.setAttribute('data-window-button-side', windowButtonSide);
    }
  }, [windowButtonSide]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const setWindowButtonSide = (side: WindowButtonSide) => {
    setWindowButtonSideState(side);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, windowButtonSide, setWindowButtonSide }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

