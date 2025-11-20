import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Lock, Copy, Edit, Trash2, Eye, EyeOff, X, Check, Globe, User, Key } from 'lucide-react';
import './PasswordManager.css';

interface PasswordEntry {
  id: string;
  name: string;
  username: string;
  password: string;
  url: string;
  category: string;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

type Category = 'all' | 'social' | 'email' | 'finance' | 'work' | 'shopping' | 'entertainment' | 'other';

const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: 'all', label: 'All Passwords', icon: '🔐' },
  { value: 'social', label: 'Social Media', icon: '📱' },
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'finance', label: 'Finance', icon: '💰' },
  { value: 'work', label: 'Work', icon: '💼' },
  { value: 'shopping', label: 'Shopping', icon: '🛒' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { value: 'other', label: 'Other', icon: '📁' },
];

export const PasswordManager: React.FC<{ os: any }> = ({ os }) => {
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    url: '',
    category: 'other' as Category,
    notes: '',
  });

  useEffect(() => {
    loadPasswords();
  }, []);

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const loadPasswords = async () => {
    try {
      if (os?.fs) {
        const passwordsFile = '/home/user/.passwords.json';
        try {
          const data = await os.fs.read(passwordsFile);
          const parsed = JSON.parse(data);
          setPasswords(parsed);
        } catch (err) {
          // File doesn't exist yet, that's okay
          console.log('Passwords file does not exist yet');
        }
      }
    } catch (err) {
      console.error('Error loading passwords:', err);
    }
  };

  const savePasswords = async (passwordsToSave: PasswordEntry[]) => {
    try {
      if (os?.fs) {
        const passwordsFile = '/home/user/.passwords.json';
        await os.fs.write(passwordsFile, JSON.stringify(passwordsToSave, null, 2));
      }
    } catch (err) {
      console.error('Error saving passwords:', err);
      showStatus('error', 'Failed to save passwords');
    }
  };

  const generatePassword = (length: number = 16): string => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
    if (password.length < 8) return 'weak';
    if (password.length < 12) return 'medium';
    if (/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(password)) return 'strong';
    return 'medium';
  };

  const openModal = (entry?: PasswordEntry) => {
    if (entry) {
      setEditingId(entry.id);
      setFormData({
        name: entry.name,
        username: entry.username,
        password: entry.password,
        url: entry.url,
        category: entry.category as Category,
        notes: entry.notes,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        username: '',
        password: '',
        url: '',
        category: 'other',
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      name: '',
      username: '',
      password: '',
      url: '',
      category: 'other',
      notes: '',
    });
  };

  const handleSave = () => {
    if (!formData.name || !formData.password) {
      showStatus('error', 'Name and password are required');
      return;
    }

    if (editingId) {
      const updated = passwords.map(p => {
        if (p.id === editingId) {
          return {
            ...p,
            ...formData,
            updatedAt: Date.now(),
          };
        }
        return p;
      });
      setPasswords(updated);
      savePasswords(updated);
      showStatus('success', 'Password updated');
    } else {
      const newEntry: PasswordEntry = {
        id: `pwd-${Date.now()}`,
        ...formData,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const updated = [newEntry, ...passwords];
      setPasswords(updated);
      savePasswords(updated);
      showStatus('success', 'Password added');
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this password?')) {
      const updated = passwords.filter(p => p.id !== id);
      setPasswords(updated);
      savePasswords(updated);
      showStatus('success', 'Password deleted');
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showStatus('success', `${type} copied to clipboard`);
    } catch (err) {
      showStatus('error', 'Failed to copy to clipboard');
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPassword(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const filteredPasswords = passwords.filter(p => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(query) ||
        p.username.toLowerCase().includes(query) ||
        p.url.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const totalPasswords = passwords.length;
  const weakPasswords = passwords.filter(p => getPasswordStrength(p.password) === 'weak').length;

  return (
    <div className="password-manager-app">
      <div className="password-manager-header">
        <div className="password-manager-title">Password Manager</div>
        <div className="password-manager-stats">
          <div className="stat-item">
            <Lock size={16} />
            <span>{totalPasswords} Passwords</span>
          </div>
          {weakPasswords > 0 && (
            <div className="stat-item" style={{ color: '#ff5252' }}>
              <span>{weakPasswords} Weak</span>
            </div>
          )}
        </div>
      </div>

      <div className="password-manager-content">
        <div className="password-manager-sidebar">
          <input
            type="text"
            className="search-box"
            placeholder="Search passwords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="sidebar-section">
            <div className="sidebar-title">Categories</div>
            <div className="category-list">
              {CATEGORIES.map(cat => (
                <div
                  key={cat.value}
                  className={`category-item ${selectedCategory === cat.value ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.value)}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="password-manager-main">
          <div className="main-header">
            <div className="main-title">
              {selectedCategory === 'all' ? 'All Passwords' : CATEGORIES.find(c => c.value === selectedCategory)?.label}
            </div>
            <button className="add-btn" onClick={() => openModal()}>
              <Plus size={18} />
              Add Password
            </button>
          </div>

          <div className="password-list">
            {statusMessage && (
              <div className={`status-message ${statusMessage.type}`}>
                {statusMessage.type === 'success' ? <Check size={16} /> : <X size={16} />}
                {statusMessage.text}
              </div>
            )}

            {filteredPasswords.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔒</div>
                <div className="empty-state-text">
                  {searchQuery ? 'No passwords found' : 'No passwords yet'}
                </div>
                <div className="empty-state-hint">
                  {searchQuery ? 'Try a different search term' : 'Click "Add Password" to get started'}
                </div>
              </div>
            ) : (
              filteredPasswords.map(entry => (
                <div key={entry.id} className="password-item">
                  <div className="password-icon">{getInitials(entry.name)}</div>
                  <div className="password-info">
                    <div className="password-name">{entry.name}</div>
                    <div className="password-username">{entry.username || 'No username'}</div>
                    {entry.url && (
                      <div className="password-url">{entry.url}</div>
                    )}
                  </div>
                  <div className="password-actions">
                    <button
                      className="action-btn copy"
                      onClick={() => copyToClipboard(entry.password, 'Password')}
                      title="Copy Password"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      className="action-btn copy"
                      onClick={() => copyToClipboard(entry.username, 'Username')}
                      title="Copy Username"
                    >
                      <User size={16} />
                    </button>
                    <button
                      className="action-btn edit"
                      onClick={() => openModal(entry)}
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(entry.id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                {editingId ? 'Edit Password' : 'Add Password'}
              </div>
              <button className="modal-close" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Globe size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                Name / Service *
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Gmail, Facebook"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <User size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                Username / Email
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="username@example.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Key size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                Password *
                <button
                  className="generate-password-btn"
                  onClick={() => setFormData({ ...formData, password: generatePassword() })}
                >
                  Generate
                </button>
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword['form'] ? 'text' : 'password'}
                  className="form-input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password"
                />
                <button
                  className="password-toggle"
                  onClick={() => setShowPassword({ ...showPassword, form: !showPassword['form'] })}
                >
                  {showPassword['form'] ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formData.password && (
                <div className="password-strength">
                  <span>Strength: {getPasswordStrength(formData.password)}</span>
                  <div className={`strength-bar strength-${getPasswordStrength(formData.password)}`} />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">URL</label>
              <input
                type="url"
                className="form-input"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
              >
                {CATEGORIES.filter(c => c.value !== 'all').map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                className="form-input"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
              />
            </div>

            <div className="modal-actions">
              <button className="modal-btn secondary" onClick={closeModal}>
                Cancel
              </button>
              <button className="modal-btn primary" onClick={handleSave}>
                {editingId ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

