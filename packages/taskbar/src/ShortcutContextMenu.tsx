import React, { useEffect, useRef } from 'react';
import type { Window } from '@browser-os/schemas';
import type { WindowManager } from '@browser-os/windowing';
import type { RecentFile } from './RecentFilesManager';
import { RecentFilesManager } from './RecentFilesManager';
import { EventBus } from '@browser-os/events';
import './ShortcutContextMenu.css';

export interface ShortcutContextMenuProps {
  appId: string;
  appName: string;
  position: { x: number; y: number };
  windowManager: WindowManager;
  recentFilesManager: RecentFilesManager;
  eventBus: EventBus;
  onClose: () => void;
  onNewWindow: () => void;
}

export const ShortcutContextMenu: React.FC<ShortcutContextMenuProps> = ({
  appId,
  appName,
  position,
  windowManager,
  recentFilesManager,
  eventBus,
  onClose,
  onNewWindow,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const windows = windowManager.getWindowsByApp(appId);
  const recentFiles = recentFilesManager.getRecentFiles(appId);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleWindowClick = (windowId: string) => {
    const window = windowManager.getWindow(windowId);
    if (window) {
      if (window.state === 'minimized') {
        windowManager.restoreWindow(windowId);
      }
      windowManager.focusWindow(windowId);
    }
    onClose();
  };

  const handleCloseAll = () => {
    windowManager.closeAllWindowsForApp(appId);
    onClose();
  };

  const handleRecentFileClick = (filePath: string) => {
    eventBus.emit('app:file:open', { appId, filePath }, { source: 'taskbar' });
    onClose();
  };

  const getFileName = (path: string): string => {
    const parts = path.split('/');
    return parts[parts.length - 1] || path;
  };

  return (
    <div
      ref={menuRef}
      className="shortcut-context-menu"
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="shortcut-context-menu-header">{appName}</div>
      
      {windows.length > 0 && (
        <>
          <div className="shortcut-context-menu-section">
            <div className="shortcut-context-menu-section-title">Windows</div>
            {windows.map((window) => (
              <button
                key={window.id}
                className="shortcut-context-menu-item"
                onClick={() => handleWindowClick(window.id)}
              >
                <span className="shortcut-context-menu-item-icon">📄</span>
                <span className="shortcut-context-menu-item-label">{window.title}</span>
              </button>
            ))}
          </div>
          <div className="shortcut-context-menu-divider" />
        </>
      )}

      {recentFiles.length > 0 && (
        <>
          <div className="shortcut-context-menu-section">
            <div className="shortcut-context-menu-section-title">Recent Files</div>
            {recentFiles.map((file, index) => (
              <button
                key={`${file.path}-${index}`}
                className="shortcut-context-menu-item"
                onClick={() => handleRecentFileClick(file.path)}
                title={file.path}
              >
                <span className="shortcut-context-menu-item-icon">📄</span>
                <span className="shortcut-context-menu-item-label">
                  {file.title || getFileName(file.path)}
                </span>
              </button>
            ))}
          </div>
          <div className="shortcut-context-menu-divider" />
        </>
      )}

      <div className="shortcut-context-menu-section">
        <button className="shortcut-context-menu-item" onClick={onNewWindow}>
          <span className="shortcut-context-menu-item-icon">➕</span>
          <span className="shortcut-context-menu-item-label">New Window</span>
        </button>
        {windows.length > 0 && (
          <button className="shortcut-context-menu-item" onClick={handleCloseAll}>
            <span className="shortcut-context-menu-item-icon">✕</span>
            <span className="shortcut-context-menu-item-label">Close All Windows</span>
          </button>
        )}
      </div>
    </div>
  );
};

