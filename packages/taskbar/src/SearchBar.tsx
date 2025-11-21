import React, { useState, useRef, useEffect } from 'react';
import type { AppRegistryEntry } from '@browser-os/schemas';
import './SearchBar.css';

export interface SearchBarProps {
  apps: AppRegistryEntry[];
  onAppSelect: (appId: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ apps, onAppSelect }) => {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
    setIsExpanded(false);
  };

  const handleExpand = () => {
    setIsExpanded(true);
    // Focus input after expansion animation
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Check if focus is moving to search results or button
    if (containerRef.current?.contains(e.relatedTarget as Node)) {
      return;
    }
    // Delay to allow click on results
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setIsExpanded(false);
        setIsOpen(false);
        setQuery('');
      }
    }, 200);
  };

  // Handle clicking outside to collapse
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isExpanded && containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
        setIsOpen(false);
        setQuery('');
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isExpanded]);

  return (
    <div ref={containerRef} className={`taskbar-search ${isExpanded ? 'expanded' : ''}`}>
      {!isExpanded && (
        <button
          className="taskbar-search-button"
          onClick={handleExpand}
          title="Search apps"
        >
          <svg
            className="taskbar-search-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </button>
      )}
      <input
        ref={inputRef}
        type="text"
        className="taskbar-search-input"
        placeholder="Search apps..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          setIsExpanded(true);
          setIsOpen(true);
        }}
        onBlur={handleBlur}
      />
      {isOpen && filteredApps.length > 0 && (
        <div className="taskbar-search-results">
          {filteredApps.slice(0, 10).map((app) => (
            <button
              key={app.id}
              className="taskbar-search-result"
              onClick={() => handleSelect(app.id)}
              onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
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

