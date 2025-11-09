import React, { useState } from 'react';
import { applyTheme } from '@browser-os/theme';
import './Settings.css';

export const SettingsApp: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<string>('win95');
  const [settings, setSettings] = useState({
    theme: 'win95',
    animations: true,
    sound: false,
  });

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme);
    setSettings(prev => ({ ...prev, theme }));
    applyTheme(theme);
  };

  return (
    <div className="settings-app">
      <div className="settings-header">
        <h1>Settings</h1>
      </div>
      <div className="settings-content">
        <div className="settings-section">
          <h2>Appearance</h2>
          <div className="settings-group">
            <label>Theme:</label>
            <select
              value={currentTheme}
              onChange={(e) => handleThemeChange(e.target.value)}
            >
              <option value="win95">Windows 95</option>
              <option value="macos">macOS</option>
              <option value="monaco">Monaco</option>
              <option value="glass">Glass</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h2>System</h2>
          <div className="settings-group">
            <label>
              <input
                type="checkbox"
                checked={settings.animations}
                onChange={(e) =>
                  setSettings(prev => ({ ...prev, animations: e.target.checked }))
                }
              />
              Enable animations
            </label>
          </div>
          <div className="settings-group">
            <label>
              <input
                type="checkbox"
                checked={settings.sound}
                onChange={(e) =>
                  setSettings(prev => ({ ...prev, sound: e.target.checked }))
                }
              />
              Enable sound effects
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h2>About</h2>
          <div className="settings-about">
            <p><strong>browser-os</strong></p>
            <p>Version 0.1.0</p>
            <p>A complete operating system running in your browser.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
