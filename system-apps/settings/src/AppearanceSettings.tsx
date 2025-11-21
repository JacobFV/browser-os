import React from 'react';
import { useTheme, Toggle, Select } from '@browser-os/ui';
import './AppearanceSettings.css';

export interface AppearanceSettingsProps {
  loading?: boolean;
}

export const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({ loading }) => {
  const { theme, setTheme, trafficLightPosition, setTrafficLightPosition } = useTheme();

  if (loading) {
    return (
      <div className="settings-panel-loading">
        <div>Loading appearance settings...</div>
      </div>
    );
  }

  return (
    <div className="settings-panel">
      <h2 className="settings-panel-title">Appearance</h2>

      <div className="settings-section">
        <h3 className="settings-section-title">Theme</h3>
        <div className="settings-section-content">
          <Toggle
            label="Dark Mode"
            checked={theme === 'dark'}
            onChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            hint="Switch between light and dark themes"
          />
        </div>
      </div>

      <div className="settings-section">
        <h3 className="settings-section-title">Window Controls</h3>
        <div className="settings-section-content">
          <Select
            label="Traffic Light Position"
            value={trafficLightPosition}
            onChange={(e) => setTrafficLightPosition(e.target.value as 'left' | 'right')}
            options={[
              { value: 'left', label: 'Top Left' },
              { value: 'right', label: 'Top Right' },
            ]}
            hint="Choose where the window control buttons appear"
          />
        </div>
      </div>
    </div>
  );
};

