import React, { useState, useEffect } from 'react';
import type { SystemConfig, User } from '@browser-os/schemas';
import { Input, Button, Dropdown } from '@browser-os/ui';

export interface UsersSettingsProps {
  config: SystemConfig | null;
  onSave: (config: Partial<SystemConfig>) => Promise<void>;
  loading?: boolean;
}

export const UsersSettings: React.FC<UsersSettingsProps> = ({
  config,
  onSave,
  loading = false,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [defaultUser, setDefaultUser] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    username: '',
    homeDir: '',
    defaultShell: '',
  });

  useEffect(() => {
    if (config) {
      setUsers(config.users || []);
      setDefaultUser(config.defaultUser || '');
      setHasChanges(false);
    }
  }, [config]);

  const handleAddUser = () => {
    setFormData({ id: '', username: '', homeDir: '', defaultShell: '' });
    setEditingUser(null);
    setShowUserForm(true);
  };

  const handleEditUser = (user: User) => {
    setFormData({
      id: user.id,
      username: user.username,
      homeDir: user.homeDir,
      defaultShell: user.defaultShell || '',
    });
    setEditingUser(user);
    setShowUserForm(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === defaultUser) {
      alert('Cannot delete the default user. Please change the default user first.');
      return;
    }
    if (!window.confirm(`Delete user ${userId}?`)) return;

    const newUsers = users.filter((u) => u.id !== userId);
    setUsers(newUsers);
    setHasChanges(true);
    setShowUserForm(false);
  };

  const handleSaveUser = () => {
    if (!formData.id.trim() || !formData.username.trim() || !formData.homeDir.trim()) {
      setError('ID, username, and home directory are required');
      return;
    }

    const user: User = {
      id: formData.id.trim(),
      username: formData.username.trim(),
      homeDir: formData.homeDir.trim(),
      defaultShell: formData.defaultShell.trim() || undefined,
    };

    if (editingUser) {
      const newUsers = users.map((u) => (u.id === editingUser.id ? user : u));
      setUsers(newUsers);
    } else {
      if (users.some((u) => u.id === user.id)) {
        setError('User ID already exists');
        return;
      }
      setUsers([...users, user]);
    }

    setShowUserForm(false);
    setEditingUser(null);
    setHasChanges(true);
    setError(null);
  };

  const handleSave = async () => {
    if (users.length === 0) {
      setError('At least one user is required');
      return;
    }
    if (!users.some((u) => u.id === defaultUser)) {
      setError('Default user must be one of the existing users');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await onSave({
        users,
        defaultUser,
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

  if (loading) {
    return <div className="settings-panel-loading">Loading...</div>;
  }

  return (
    <div className="settings-panel">
      <h2 className="settings-panel-title">User Management</h2>
      <div className="settings-form">
        {showUserForm ? (
          <div className="user-form">
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px', color: 'var(--text-primary)' }}>
              {editingUser ? 'Edit User' : 'Add User'}
            </h3>
            <Input
              label="User ID"
              type="text"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              disabled={!!editingUser}
              placeholder="user-1"
            />
            <Input
              label="Username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="user"
            />
            <Input
              label="Home Directory"
              type="text"
              value={formData.homeDir}
              onChange={(e) => setFormData({ ...formData, homeDir: e.target.value })}
              placeholder="/home/user"
            />
            <Input
              label="Default Shell (optional)"
              type="text"
              value={formData.defaultShell}
              onChange={(e) => setFormData({ ...formData, defaultShell: e.target.value })}
              placeholder="/bin/sh"
            />
            {error && <div className="settings-form-error">{error}</div>}
            <div className="settings-form-actions">
              <Button variant="ghost" onClick={() => setShowUserForm(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveUser}>
                {editingUser ? 'Update' : 'Add'}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Dropdown
              label="Default User"
              value={defaultUser}
              onChange={(value) => {
                setDefaultUser(value);
                setHasChanges(true);
              }}
              options={users.map((user) => ({
                value: user.id,
                label: `${user.username} (${user.id})`,
              }))}
            />
            <div className="users-list">
              <div className="users-list-header">
                <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                  Users
                </h3>
                <Button onClick={handleAddUser}>+ Add User</Button>
              </div>
              {users.length === 0 ? (
                <div className="users-list-empty">No users configured</div>
              ) : (
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Home Directory</th>
                      <th>Shell</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.username}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{user.homeDir}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{user.defaultShell || '-'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditUser(user)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={user.id === defaultUser}
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
