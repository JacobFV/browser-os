import React, { useState, useEffect } from 'react';
import type { SystemConfig } from '@browser-os/schemas';
import { Input, Button, Dropdown } from '@browser-os/ui';

type MountPoint = {
  path: string;
  backend: 'localStorage' | 'indexedDB' | 'server' | 'ephemeral';
  options: Record<string, unknown>;
};

export interface MountsSettingsProps {
  config: SystemConfig | null;
  onSave: (config: Partial<SystemConfig>) => Promise<void>;
  loading?: boolean;
}

export const MountsSettings: React.FC<MountsSettingsProps> = ({
  config,
  onSave,
  loading = false,
}) => {
  const [mounts, setMounts] = useState<MountPoint[]>([]);
  const [editingMount, setEditingMount] = useState<MountPoint | null>(null);
  const [showMountForm, setShowMountForm] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    path: '',
    backend: 'indexedDB' as MountPoint['backend'],
    optionsJson: '{}',
  });

  useEffect(() => {
    if (config?.mounts) {
      setMounts(config.mounts);
      setHasChanges(false);
    }
  }, [config]);

  const handleAddMount = () => {
    setFormData({ path: '', backend: 'indexedDB', optionsJson: '{}' });
    setEditingMount(null);
    setShowMountForm(true);
  };

  const handleEditMount = (mount: MountPoint) => {
    setFormData({
      path: mount.path,
      backend: mount.backend,
      optionsJson: JSON.stringify(mount.options, null, 2),
    });
    setEditingMount(mount);
    setShowMountForm(true);
  };

  const handleDeleteMount = (mountPath: string) => {
    if (!window.confirm(`Delete mount point ${mountPath}?`)) return;
    const newMounts = mounts.filter((m) => m.path !== mountPath);
    setMounts(newMounts);
    setHasChanges(true);
    setShowMountForm(false);
  };

  const handleSaveMount = () => {
    if (!formData.path.trim()) {
      setError('Path is required');
      return;
    }

    let options: Record<string, unknown> = {};
    try {
      options = JSON.parse(formData.optionsJson);
    } catch {
      setError('Invalid JSON in options');
      return;
    }

    const mount: MountPoint = {
      path: formData.path.trim(),
      backend: formData.backend,
      options,
    };

    if (editingMount) {
      const newMounts = mounts.map((m) => (m.path === editingMount.path ? mount : m));
      setMounts(newMounts);
    } else {
      if (mounts.some((m) => m.path === mount.path)) {
        setError('Mount point already exists');
        return;
      }
      setMounts([...mounts, mount]);
    }

    setShowMountForm(false);
    setEditingMount(null);
    setHasChanges(true);
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await onSave({ mounts });
      setHasChanges(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="settings-panel-loading">Loading...</div>;
  }

  return (
    <div className="settings-panel">
      <h2 className="settings-panel-title">Mount Points</h2>
      <div className="settings-form">
        {showMountForm ? (
          <div className="mount-form">
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px', color: 'var(--text-primary)' }}>
              {editingMount ? 'Edit Mount Point' : 'Add Mount Point'}
            </h3>
            <Input
              label="Path"
              type="text"
              value={formData.path}
              onChange={(e) => setFormData({ ...formData, path: e.target.value })}
              disabled={!!editingMount}
              placeholder="/path/to/mount"
            />
            <Dropdown
              label="Backend"
              value={formData.backend}
              onChange={(value) =>
                setFormData({ ...formData, backend: value as MountPoint['backend'] })
              }
              options={[
                { value: 'indexedDB', label: 'IndexedDB' },
                { value: 'localStorage', label: 'LocalStorage' },
                { value: 'ephemeral', label: 'Ephemeral' },
                { value: 'server', label: 'Server' },
              ]}
            />
            <div className="settings-form-group">
              <label htmlFor="mount-options">Options (JSON)</label>
              <textarea
                id="mount-options"
                className="settings-form-group textarea"
                value={formData.optionsJson}
                onChange={(e) => setFormData({ ...formData, optionsJson: e.target.value })}
                rows={4}
                style={{ fontFamily: 'monospace', fontSize: '12px' }}
                placeholder='{"dbName": "my-db"}'
              />
            </div>
            {error && <div className="settings-form-error">{error}</div>}
            <div className="settings-form-actions">
              <Button variant="ghost" onClick={() => setShowMountForm(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveMount}>
                {editingMount ? 'Update' : 'Add'}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mounts-list">
              <div className="mounts-list-header">
                <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                  Mount Points
                </h3>
                <Button onClick={handleAddMount}>+ Add Mount</Button>
              </div>
              {mounts.length === 0 ? (
                <div className="mounts-list-empty">No mount points configured</div>
              ) : (
                <table className="mounts-table">
                  <thead>
                    <tr>
                      <th>Path</th>
                      <th>Backend</th>
                      <th>Options</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mounts.map((mount) => (
                      <tr key={mount.path}>
                        <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{mount.path}</td>
                        <td>{mount.backend}</td>
                        <td>
                          <code>{JSON.stringify(mount.options)}</code>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditMount(mount)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteMount(mount.path)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {error && <div className="settings-form-error">{error}</div>}
            {success && <div className="settings-form-success">Settings saved successfully!</div>}
            <div className="settings-form-actions">
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={!hasChanges || saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
