import React, { useState, useEffect } from 'react';
import type { SystemConfig } from '@browser-os/schemas';

export interface SystemSettingsProps {
  config: SystemConfig | null;
  onSave: (config: Partial<SystemConfig>) => Promise<void>;
  loading?: boolean;
}

export const SystemSettings: React.FC<SystemSettingsProps> = ({
  config,
  onSave,
  loading = false,
}) => {
  const [hostname, setHostname] = useState('');
  const [timezone, setTimezone] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (config?.system) {
      setHostname(config.system.hostname || '');
      setTimezone(config.system.timezone || '');
      setHasChanges(false);
    }
  }, [config]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await onSave({
        system: {
          hostname: hostname.trim(),
          timezone: timezone.trim() || undefined,
        },
      });
      setHasChanges(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleHostnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHostname(e.target.value);
    setHasChanges(true);
    setSuccess(false);
  };

  const handleTimezoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimezone(e.target.value);
    setHasChanges(true);
    setSuccess(false);
  };

  if (loading) {
    return <div className="settings-panel-loading">Loading...</div>;
  }

  return (
    <div className="settings-panel">
      <h3 className="settings-panel-title">System Settings</h3>
      <div className="settings-form">
        <div className="settings-form-group">
          <label htmlFor="hostname">Hostname</label>
          <input
            id="hostname"
            type="text"
            value={hostname}
            onChange={handleHostnameChange}
            placeholder="browser-os"
          />
        </div>
        <div className="settings-form-group">
          <label htmlFor="timezone">Timezone</label>
          <input
            id="timezone"
            type="text"
            value={timezone}
            onChange={handleTimezoneChange}
            placeholder="UTC"
          />
          <small className="settings-form-hint">e.g., America/New_York, Europe/London, UTC</small>
        </div>
        {error && <div className="settings-form-error">{error}</div>}
        {success && <div className="settings-form-success">Settings saved successfully!</div>}
        <div className="settings-form-actions">
          <button
            className="settings-button primary"
            onClick={handleSave}
            disabled={!hasChanges || saving || !hostname.trim()}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

