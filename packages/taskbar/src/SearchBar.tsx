import React, { useState } from 'react';
import type { AppRegistryEntry } from '@browser-os/schemas';
import './SearchBar.css';

export interface SearchBarProps {
  apps: AppRegistryEntry[];
  onAppSelect: (appId: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ apps, onAppSelect }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredApps = query
    ? apps.filter(
        (app) =>
          app.manifest.name.toLowerCase().includes(query.toLowerCase()) ||
          app.manifest.description?.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleSelect = (appId: string) => {
    onAppSelect(appId);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="taskbar-search">
      <input
        type="text"
        className="taskbar-search-input"
        placeholder="Search apps..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => {
          // Delay to allow click on results
          setTimeout(() => setIsOpen(false), 200);
        }}
      />
      {isOpen && filteredApps.length > 0 && (
        <div className="taskbar-search-results">
          {filteredApps.slice(0, 10).map((app) => (
            <button
              key={app.id}
              className="taskbar-search-result"
              onClick={() => handleSelect(app.id)}
            >
              {app.manifest.icon && (
                <img src={app.manifest.icon} alt="" className="taskbar-search-result-icon" />
              )}
              <div className="taskbar-search-result-info">
                <div className="taskbar-search-result-name">{app.manifest.name}</div>
                {app.manifest.description && (
                  <div className="taskbar-search-result-desc">{app.manifest.description}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

