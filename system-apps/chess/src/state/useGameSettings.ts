import { useState, useEffect, useCallback } from 'react';

export interface GameSettings {
  chatEnabled: boolean;
  soundsEnabled: boolean;
  boardTheme: string;
  pieceSet: string;
}

const DEFAULT_SETTINGS: GameSettings = {
  chatEnabled: true,
  soundsEnabled: true,
  boardTheme: 'classic',
  pieceSet: 'classic',
};

const SETTINGS_KEY = 'chess_settings';

export function useGameSettings() {
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<GameSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  return {
    settings,
    updateSettings,
    setChatEnabled: useCallback((enabled: boolean) => {
      updateSettings({ chatEnabled: enabled });
    }, [updateSettings]),
    setSoundsEnabled: useCallback((enabled: boolean) => {
      updateSettings({ soundsEnabled: enabled });
    }, [updateSettings]),
    setBoardTheme: useCallback((theme: string) => {
      updateSettings({ boardTheme: theme });
    }, [updateSettings]),
    setPieceSet: useCallback((set: string) => {
      updateSettings({ pieceSet: set });
    }, [updateSettings]),
  };
}

