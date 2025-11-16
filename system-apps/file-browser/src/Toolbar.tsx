import React from 'react';
import './Toolbar.css';

export type ViewMode = 'list' | 'details';

export interface ToolbarProps {
  currentPath: string;
  canGoBack: boolean;
  canGoForward: boolean;
  viewMode: ViewMode;
  searchQuery: string;
  onBack: () => void;
  onForward: () => void;
  onUp: () => void;
  onPathChange: (path: string) => void;
  onRefresh: () => void;
  onViewModeChange: (mode: ViewMode) => void;
  onNewFolder: () => void;
  onSearchChange: (query: string) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentPath,
  canGoBack,
  canGoForward,
  viewMode,
  searchQuery,
  onBack,
  onForward,
  onUp,
  onPathChange,
  onRefresh,
  onViewModeChange,
  onNewFolder,
  onSearchChange,
}) => {
  const handlePathKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onPathChange(e.currentTarget.value);
    }
  };

  const pathParts = currentPath.split('/').filter((p) => p);
  const breadcrumbs = pathParts.length === 0 ? ['/'] : ['/', ...pathParts];

  return (
    <div className="file-browser-toolbar">
      <div className="toolbar-nav-buttons">
        <button
          className="toolbar-button"
          onClick={onBack}
          disabled={!canGoBack}
          title="Back"
        >
          ←
        </button>
        <button
          className="toolbar-button"
          onClick={onForward}
          disabled={!canGoForward}
          title="Forward"
        >
          →
        </button>
        <button
          className="toolbar-button"
          onClick={onUp}
          disabled={currentPath === '/'}
          title="Up"
        >
          ↑
        </button>
        <button
          className="toolbar-button"
          onClick={onRefresh}
          title="Refresh"
        >
          ↻
        </button>
      </div>
      <div className="toolbar-path">
        <div className="toolbar-breadcrumbs">
          {breadcrumbs.map((part, index) => {
            const path = index === 0 ? '/' : '/' + breadcrumbs.slice(1, index + 1).join('/');
            return (
              <span key={index}>
                <button
                  className="toolbar-breadcrumb"
                  onClick={() => onPathChange(path)}
                  title={path}
                >
                  {part || '/'}
                </button>
                {index < breadcrumbs.length - 1 && <span className="toolbar-separator">/</span>}
              </span>
            );
          })}
        </div>
        <input
          type="text"
          className="toolbar-path-input"
          value={currentPath}
          onChange={(e) => onPathChange(e.target.value)}
          onKeyDown={handlePathKeyDown}
          placeholder="/path/to/directory"
        />
      </div>
      <div className="toolbar-actions">
        <input
          type="text"
          className="toolbar-search"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <button
          className="toolbar-button"
          onClick={() => onViewModeChange(viewMode === 'list' ? 'details' : 'list')}
          title={`Switch to ${viewMode === 'list' ? 'details' : 'list'} view`}
        >
          {viewMode === 'list' ? '☰' : '≡'}
        </button>
        <button
          className="toolbar-button"
          onClick={onNewFolder}
          title="New Folder"
        >
          +📁
        </button>
      </div>
    </div>
  );
};

