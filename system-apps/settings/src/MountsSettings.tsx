import React, { useState, useEffect } from 'react';
import type { SystemConfig } from '@browser-os/schemas';

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
      <h3 className="settings-panel-title">Mount Points</h3>
      <div className="settings-form">
        {showMountForm ? (
          <div className="mount-form">
            <h4>{editingMount ? 'Edit Mount Point' : 'Add Mount Point'}</h4>
            <div className="settings-form-group">
              <label htmlFor="mount-path">Path</label>
              <input
                id="mount-path"
                type="text"
                value={formData.path}
                onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                disabled={!!editingMount}
                placeholder="/path/to/mount"
              />
            </div>
            <div className="settings-form-group">
              <label htmlFor="mount-backend">Backend</label>
              <select
                id="mount-backend"
                value={formData.backend}
                onChange={(e) =>
                  setFormData({ ...formData, backend: e.target.value as MountPoint['backend'] })
                }
              >
                <option value="indexedDB">IndexedDB</option>
                <option value="localStorage">LocalStorage</option>
                <option value="ephemeral">Ephemeral</option>
                <option value="server">Server</option>
              </select>
            </div>
            <div className="settings-form-group">
              <label htmlFor="mount-options">Options (JSON)</label>
              <textarea
                id="mount-options"
                value={formData.optionsJson}
                onChange={(e) => setFormData({ ...formData, optionsJson: e.target.value })}
                rows={4}
                style={{ fontFamily: 'monospace', fontSize: '12px' }}
                placeholder='{"dbName": "my-db"}'
              />
            </div>
            {error && <div className="settings-form-error">{error}</div>}
            <div className="settings-form-actions">
              <button className="settings-button" onClick={() => setShowMountForm(false)}>
                Cancel
              </button>
              <button className="settings-button primary" onClick={handleSaveMount}>
                {editingMount ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mounts-list">
              <div className="mounts-list-header">
                <h4>Mount Points</h4>
                <button className="settings-button" onClick={handleAddMount}>
                  + Add Mount
                </button>
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
                        <td>{mount.path}</td>
                        <td>{mount.backend}</td>
                        <td>
                          <code>{JSON.stringify(mount.options)}</code>
                        </td>
                        <td>
                          <button
                            className="settings-button-small"
                            onClick={() => handleEditMount(mount)}
                          >
                            Edit
                          </button>
                          <button
                            className="settings-button-small"
                            onClick={() => handleDeleteMount(mount.path)}
                          >
                            Delete
                          </button>
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

