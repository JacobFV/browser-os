import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import './theme.css';
import './components/Button.css';
import './components/Input.css';
import './components/Select.css';
import './components/Toggle.css';

export type Theme = 'light' | 'dark';
export type TrafficLightPosition = 'left' | 'right';

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  trafficLightPosition: TrafficLightPosition;
  setTrafficLightPosition: (position: TrafficLightPosition) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = 'browser-os-theme';
const TRAFFIC_LIGHT_POSITION_STORAGE_KEY = 'browser-os-traffic-light-position';

export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  defaultTrafficLightPosition?: TrafficLightPosition;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'light',
  defaultTrafficLightPosition = 'left',
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

  const [trafficLightPosition, setTrafficLightPositionState] = useState<TrafficLightPosition>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(TRAFFIC_LIGHT_POSITION_STORAGE_KEY);
      if (stored === 'left' || stored === 'right') {
        return stored;
      }
    }
    return defaultTrafficLightPosition;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TRAFFIC_LIGHT_POSITION_STORAGE_KEY, trafficLightPosition);
      document.documentElement.setAttribute('data-traffic-lights', trafficLightPosition);
    }
  }, [trafficLightPosition]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const setTrafficLightPosition = (position: TrafficLightPosition) => {
    setTrafficLightPositionState(position);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, trafficLightPosition, setTrafficLightPosition }}>
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

