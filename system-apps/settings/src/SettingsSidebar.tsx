import React from 'react';
import './SettingsSidebar.css';

export type SettingsCategory = 'system' | 'users' | 'mounts' | 'apps' | 'chess' | 'appearance' | 'other';

export interface SettingsSidebarProps {
  currentCategory: SettingsCategory;
  onCategoryChange: (category: SettingsCategory) => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  currentCategory,
  onCategoryChange,
}) => {
  const categories: { id: SettingsCategory; label: string; icon: string }[] = [
    { id: 'system', label: 'System', icon: '⚙️' },
    { id: 'users', label: 'Users', icon: '👤' },
    { id: 'mounts', label: 'Mounts', icon: '💾' },
    { id: 'apps', label: 'Apps', icon: '📱' },
    { id: 'chess', label: 'Chess', icon: '♟️' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'other', label: 'Other', icon: '📄' },
  ];

  return (
    <div className="settings-sidebar">
      <div className="settings-sidebar-header">
        <h2>Settings</h2>
      </div>
      <nav className="settings-sidebar-nav">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`settings-sidebar-item ${currentCategory === category.id ? 'active' : ''}`}
            onClick={() => onCategoryChange(category.id)}
          >
            <span className="settings-sidebar-icon">{category.icon}</span>
            <span className="settings-sidebar-label">{category.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

