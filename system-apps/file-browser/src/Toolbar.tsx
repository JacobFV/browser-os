import React from 'react';
import './Toolbar.css';

export type ViewMode = 'list' | 'details' | 'tile';

export interface ToolbarProps {
  currentPath: string;
  canGoBack: boolean;
  canGoForward: boolean;
  viewMode: ViewMode;
  itemScale?: number;
  searchQuery: string;
  onBack: () => void;
  onForward: () => void;
  onUp: () => void;
  onPathChange: (path: string) => void;
  onRefresh: () => void;
  onViewModeChange: (mode: ViewMode) => void;
  onItemScaleChange?: (scale: number) => void;
  onNewFolder: () => void;
  onSearchChange: (query: string) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentPath,
  canGoBack,
  canGoForward,
  viewMode,
  itemScale = 1,
  searchQuery,
  onBack,
  onForward,
  onUp,
  onPathChange,
  onRefresh,
  onViewModeChange,
  onItemScaleChange,
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
      <div className="toolbar-row toolbar-row-primary">
        <div className="toolbar-nav-buttons">
          <button className="toolbar-button" onClick={onBack} disabled={!canGoBack} title="Back">←</button>
          <button className="toolbar-button" onClick={onForward} disabled={!canGoForward} title="Forward">→</button>
          <button className="toolbar-button" onClick={onUp} disabled={currentPath === '/'} title="Up">↑</button>
          <button className="toolbar-button" onClick={onRefresh} title="Refresh">↻</button>
        </div>
        <div className="toolbar-address">
          <div className="toolbar-breadcrumbs" aria-label="Path">
            {breadcrumbs.map((part, index) => {
              const path = index === 0 ? '/' : '/' + breadcrumbs.slice(1, index + 1).join('/');
              return (
                <span key={index} className="breadcrumb-cell">
                  <button
                    className="toolbar-breadcrumb"
                    onClick={() => onPathChange(path)}
                    title={path}
                  >{part || '/'}</button>
                  {index < breadcrumbs.length - 1 && <span className="toolbar-separator" aria-hidden="true">›</span>}
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
            aria-label="Path"
          />
        </div>
        <div className="toolbar-search-wrap">
          <span className="toolbar-search-icon" aria-hidden="true">🔍</span>
          <input
            type="text"
            className="toolbar-search"
            placeholder="Search this folder"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <div className="toolbar-row toolbar-row-secondary">
        <button
          className="toolbar-action-button toolbar-action-primary"
          onClick={onNewFolder}
          title="New Folder"
        >
          <span className="action-icon">＋</span>
          <span className="action-label">New folder</span>
        </button>
        <div className="toolbar-spacer" />
        <div className="toolbar-view-toggle" role="group" aria-label="View mode">
          <button
            className={`toolbar-view-button ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => onViewModeChange('list')}
            title="List view"
          >☰</button>
          <button
            className={`toolbar-view-button ${viewMode === 'details' ? 'active' : ''}`}
            onClick={() => onViewModeChange('details')}
            title="Details view"
          >≡</button>
          <button
            className={`toolbar-view-button ${viewMode === 'tile' ? 'active' : ''}`}
            onClick={() => onViewModeChange('tile')}
            title="Tile view"
          >⊞</button>
        </div>
        {viewMode === 'tile' && onItemScaleChange && (
          <div className="toolbar-scale-control">
            <span className="toolbar-scale-label">Size</span>
            <input
              type="range"
              className="toolbar-scale-slider"
              min="0.5"
              max="2"
              step="0.1"
              value={itemScale}
              onChange={(e) => onItemScaleChange(parseFloat(e.target.value))}
              title={`Scale: ${Math.round(itemScale * 100)}%`}
            />
            <span className="toolbar-scale-value">{Math.round(itemScale * 100)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

