import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  const recentFiles = recentFilesManager ? recentFilesManager.getRecentFiles(appId) : [];
  
  console.log('[ShortcutContextMenu] Rendering menu for:', appId, 'windows:', windows.length, 'recentFiles:', recentFiles.length);

  // Calculate menu position - taskbar is at bottom, so menu opens upward
  const TASKBAR_HEIGHT = 48; // From Taskbar.css
  const MENU_GAP = 4; // Gap between taskbar and menu
  const MENU_MAX_HEIGHT = 400; // From CSS max-height
  const MENU_MIN_WIDTH = 200; // From CSS min-width
  const MENU_MAX_WIDTH = 300; // From CSS max-width
  
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  
  // Menu opens upward from taskbar, positioned just above it
  // Position vertically: just above the taskbar (viewportHeight - TASKBAR_HEIGHT - MENU_GAP)
  // But we need to account for menu height, so we'll position from bottom
  const menuBottom = TASKBAR_HEIGHT + MENU_GAP;
  
  // Handle horizontal positioning - align to click position, but don't go off screen
  let menuLeft = position.x;
  if (menuLeft + MENU_MAX_WIDTH > viewportWidth) {
    // If menu would go off right edge, align to right
    menuLeft = Math.max(0, viewportWidth - MENU_MAX_WIDTH);
  }
  if (menuLeft < 0) {
    menuLeft = 0;
  }
  
  // Calculate max height to ensure menu doesn't go above viewport
  const maxAvailableHeight = viewportHeight - menuBottom - 10; // Leave some margin at top
  
  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    left: `${menuLeft}px`,
    bottom: `${menuBottom}px`, // Position from bottom to align with taskbar
    maxHeight: `${Math.min(MENU_MAX_HEIGHT, maxAvailableHeight)}px`,
  };

  useEffect(() => {
    let cleanup: (() => void) | null = null;

    // Use a small delay to prevent immediate closure on right-click
    const timeoutId = setTimeout(() => {
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

      // Use click instead of mousedown to avoid immediate closure
      document.addEventListener('click', handleClickOutside, true);
      document.addEventListener('keydown', handleEscape);

      cleanup = () => {
        document.removeEventListener('click', handleClickOutside, true);
        document.removeEventListener('keydown', handleEscape);
      };
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (cleanup) {
        cleanup();
      }
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

  const menuContent = (
    <div
      ref={menuRef}
      className="shortcut-context-menu"
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
      style={menuStyle}
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

  // Render menu in a portal to ensure it's above everything
  return createPortal(menuContent, document.body);
};

