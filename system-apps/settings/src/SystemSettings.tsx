import React, { useState, useEffect } from 'react';
import type { SystemConfig } from '@browser-os/schemas';
import { Input, Button } from '@browser-os/ui';

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
  const [maxRecentFiles, setMaxRecentFiles] = useState(10);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (config?.system) {
      setHostname(config.system.hostname || '');
      setTimezone(config.system.timezone || '');
      setMaxRecentFiles(config.system.maxRecentFiles ?? 10);
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
          maxRecentFiles: maxRecentFiles,
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
        <Input
          label="Hostname"
          type="text"
          value={hostname}
          onChange={handleHostnameChange}
          placeholder="browser-os"
        />
        <Input
          label="Timezone"
          type="text"
          value={timezone}
          onChange={handleTimezoneChange}
          placeholder="UTC"
          hint="e.g., America/New_York, Europe/London, UTC"
        />
        <Input
          label="Max Recent Files"
          type="number"
          min="1"
          max="100"
          value={maxRecentFiles.toString()}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = parseInt(e.target.value, 10);
            if (!isNaN(value) && value >= 1 && value <= 100) {
              setMaxRecentFiles(value);
              setHasChanges(true);
              setSuccess(false);
            }
          }}
          hint="Number of recent files to show per app (1-100)"
        />
        {error && <div className="settings-form-error">{error}</div>}
        {success && <div className="settings-form-success">Settings saved successfully!</div>}
        <div className="settings-form-actions">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!hasChanges || saving || !hostname.trim()}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
};

