import React, { useState, useEffect } from 'react';
import type { NotificationSettings as NotificationSettingsType } from './types';
import type { NotificationManager } from './NotificationManager';
import './NotificationSettings.css';

export interface NotificationSettingsProps {
  notificationManager: NotificationManager;
  onClose?: () => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  notificationManager,
  onClose,
}) => {
  const [settings, setSettings] = useState<NotificationSettingsType>(
    notificationManager.getSettings()
  );

  useEffect(() => {
    setSettings(notificationManager.getSettings());
  }, [notificationManager]);

  const updateSetting = <K extends keyof NotificationSettingsType>(
    key: K,
    value: NotificationSettingsType[K]
  ) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    notificationManager.updateSettings({ [key]: value });
  };

  return (
    <div className="notification-settings">
      <div className="notification-settings-header">
        <h2 className="notification-settings-title">Notification Settings</h2>
        {onClose && (
          <button className="notification-settings-close" onClick={onClose}>
            ×
          </button>
        )}
      </div>

      <div className="notification-settings-content">
        <div className="notification-settings-section">
          <h3 className="notification-settings-section-title">General</h3>

          <div className="notification-settings-item">
            <label className="notification-settings-label">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => updateSetting('enabled', e.target.checked)}
              />
              <span>Enable notifications</span>
            </label>
          </div>

          <div className="notification-settings-item">
            <label className="notification-settings-label">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
              />
              <span>Play notification sound</span>
            </label>
          </div>

          <div className="notification-settings-item">
            <label className="notification-settings-label">
              <input
                type="checkbox"
                checked={settings.doNotDisturb}
                onChange={(e) => updateSetting('doNotDisturb', e.target.checked)}
              />
              <span>Do not disturb</span>
            </label>
          </div>
        </div>

        <div className="notification-settings-section">
          <h3 className="notification-settings-section-title">Display</h3>

          <div className="notification-settings-item">
            <label className="notification-settings-label">
              Toast position:
              <select
                value={settings.toastPosition}
                onChange={(e) =>
                  updateSetting('toastPosition', e.target.value as NotificationSettingsType['toastPosition'])
                }
                className="notification-settings-select"
              >
                <option value="top-right">Top Right</option>
                <option value="top-left">Top Left</option>
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
              </select>
            </label>
          </div>

          <div className="notification-settings-item">
            <label className="notification-settings-label">
              Auto-dismiss timeout (ms):
              <input
                type="number"
                value={settings.autoDismissTimeout}
                onChange={(e) =>
                  updateSetting('autoDismissTimeout', parseInt(e.target.value, 10))
                }
                min="0"
                className="notification-settings-input"
              />
            </label>
          </div>
        </div>

        <div className="notification-settings-section">
          <h3 className="notification-settings-section-title">Quiet Hours</h3>

          <div className="notification-settings-item">
            <label className="notification-settings-label">
              Start hour (0-23):
              <input
                type="number"
                value={settings.quietHoursStart ?? ''}
                onChange={(e) =>
                  updateSetting('quietHoursStart', e.target.value ? parseInt(e.target.value, 10) : undefined)
                }
                min="0"
                max="23"
                className="notification-settings-input"
              />
            </label>
          </div>

          <div className="notification-settings-item">
            <label className="notification-settings-label">
              End hour (0-23):
              <input
                type="number"
                value={settings.quietHoursEnd ?? ''}
                onChange={(e) =>
                  updateSetting('quietHoursEnd', e.target.value ? parseInt(e.target.value, 10) : undefined)
                }
                min="0"
                max="23"
                className="notification-settings-input"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

