import React, { useState, useEffect } from 'react';
import type { AppRegistryEntry } from '@browser-os/schemas';
import { JsonEditor } from './JsonEditor';

export interface AppsSettingsProps {
  registryEntries: AppRegistryEntry[];
  onSave: (entries: AppRegistryEntry[]) => Promise<void>;
  loading?: boolean;
}

export const AppsSettings: React.FC<AppsSettingsProps> = ({
  registryEntries,
  onSave,
  loading = false,
}) => {
  const [entries, setEntries] = useState<AppRegistryEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<AppRegistryEntry | null>(null);
  const [jsonView, setJsonView] = useState(false);
  const [jsonContent, setJsonContent] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setEntries(registryEntries);
    setHasChanges(false);
    if (registryEntries.length > 0) {
      setJsonContent(JSON.stringify(registryEntries, null, 2));
    }
  }, [registryEntries]);

  const handleToggleEnabled = async (entryId: string) => {
    const newEntries = entries.map((entry) =>
      entry.id === entryId ? { ...entry, enabled: !entry.enabled } : entry
    );
    setEntries(newEntries);
    setJsonContent(JSON.stringify(newEntries, null, 2));
    setHasChanges(true);
  };

  const handleJsonChange = (value: string) => {
    setJsonContent(value);
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        setEntries(parsed);
        setHasChanges(true);
        setError(null);
      } else {
        setError('Registry must be an array');
      }
    } catch {
      // Invalid JSON, but that's okay - user is still editing
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate JSON
      const parsed = JSON.parse(jsonContent);
      if (!Array.isArray(parsed)) {
        throw new Error('Registry must be an array');
      }
      await onSave(parsed);
      setHasChanges(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save registry');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="settings-panel-loading">Loading...</div>;
  }

  return (
    <div className="settings-panel">
      <h3 className="settings-panel-title">App Registry</h3>
      <div className="settings-form">
        <div className="settings-form-group">
          <label>
            <input
              type="checkbox"
              checked={jsonView}
              onChange={(e) => setJsonView(e.target.checked)}
            />
            {' '}JSON View
          </label>
        </div>
        {jsonView ? (
          <>
            <JsonEditor value={jsonContent} onChange={handleJsonChange} error={error} />
            {error && <div className="settings-form-error">{error}</div>}
            {success && <div className="settings-form-success">Registry saved successfully!</div>}
            <div className="settings-form-actions">
              <button
                className="settings-button primary"
                onClick={handleSave}
                disabled={!hasChanges || saving || !!error}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="apps-list">
              {entries.length === 0 ? (
                <div className="apps-list-empty">No apps registered</div>
              ) : (
                <table className="apps-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Version</th>
                      <th>Enabled</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <tr key={entry.id}>
                        <td>{entry.id}</td>
                        <td>{entry.manifest.name}</td>
                        <td>{entry.manifest.version}</td>
                        <td>
                          <input
                            type="checkbox"
                            checked={entry.enabled}
                            onChange={() => handleToggleEnabled(entry.id)}
                          />
                        </td>
                        <td>
                          <button
                            className="settings-button-small"
                            onClick={() => {
                              setSelectedEntry(entry);
                              setJsonView(true);
                              setJsonContent(JSON.stringify([entry], null, 2));
                            }}
                          >
                            View JSON
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {error && <div className="settings-form-error">{error}</div>}
            {success && <div className="settings-form-success">Registry saved successfully!</div>}
            <div className="settings-form-actions">
              <button
                className="settings-button primary"
                onClick={handleSave}
                disabled={!hasChanges || saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

