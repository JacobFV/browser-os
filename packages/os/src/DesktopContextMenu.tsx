import React, { useEffect, useRef, useState } from 'react';
import './DesktopContextMenu.css';

export interface DesktopContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onRefresh: () => void;
  onNewFile: () => void;
  onNewFolder: () => void;
  onPaste: () => void;
  onView: () => void;
  onArrange: () => void;
  onShowDesktop: () => void;
  onProperties: () => void;
  onOpenTerminal: () => void;
  onOpenFileBrowser: () => void;
  onOpenBrowser: () => void;
  onOpenNotepad: () => void;
  onOpenSettings: () => void;
  onWorkspaceOverview: () => void;
}

export const DesktopContextMenu: React.FC<DesktopContextMenuProps> = ({
  x,
  y,
  onClose,
  onRefresh,
  onNewFile,
  onNewFolder,
  onPaste,
  onView,
  onArrange,
  onShowDesktop,
  onProperties,
  onOpenTerminal,
  onOpenFileBrowser,
  onOpenBrowser,
  onOpenNotepad,
  onOpenSettings,
  onWorkspaceOverview,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState({ x, y });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
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

  // Adjust position if menu would go off screen
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let adjustedX = x;
      let adjustedY = y;

      if (x + rect.width > viewportWidth) {
        adjustedX = Math.max(10, viewportWidth - rect.width - 10);
      }
      if (y + rect.height > viewportHeight) {
        adjustedY = Math.max(10, viewportHeight - rect.height - 10);
      }

      setAdjustedPosition({ x: adjustedX, y: adjustedY });
    } else {
      setAdjustedPosition({ x, y });
    }
  }, [x, y]);

  const handleItemClick = (callback: () => void) => {
    callback();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="desktop-context-menu"
      style={{ left: `${adjustedPosition.x}px`, top: `${adjustedPosition.y}px` }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="desktop-context-menu-section">
        <button className="desktop-context-menu-item" onClick={() => handleItemClick(onView)}>
          View
        </button>
        <button className="desktop-context-menu-item" onClick={() => handleItemClick(onArrange)}>
          Arrange Icons
        </button>
        <button className="desktop-context-menu-item" onClick={() => handleItemClick(onRefresh)}>
          Refresh
        </button>
      </div>
      
      <div className="desktop-context-menu-separator" />

      <div className="desktop-context-menu-section">
        <button className="desktop-context-menu-item" onClick={() => handleItemClick(onNewFile)}>
          New File
        </button>
        <button className="desktop-context-menu-item" onClick={() => handleItemClick(onNewFolder)}>
          New Folder
        </button>
        <button className="desktop-context-menu-item" onClick={() => handleItemClick(onPaste)}>
          Paste
        </button>
      </div>

      <div className="desktop-context-menu-separator" />

      <div className="desktop-context-menu-section">
        <div className="desktop-context-menu-section-title">Open</div>
        <button className="desktop-context-menu-item" onClick={() => handleItemClick(onOpenTerminal)}>
          Terminal
        </button>
        <button className="desktop-context-menu-item" onClick={() => handleItemClick(onOpenFileBrowser)}>
          File Browser
        </button>
        <button className="desktop-context-menu-item" onClick={() => handleItemClick(onOpenBrowser)}>
          Browser
        </button>
        <button className="desktop-context-menu-item" onClick={() => handleItemClick(onOpenNotepad)}>
          Notepad
        </button>
        <button className="desktop-context-menu-item" onClick={() => handleItemClick(onOpenSettings)}>
          Settings
        </button>
      </div>

      <div className="desktop-context-menu-separator" />

      <div className="desktop-context-menu-section">
        <button className="desktop-context-menu-item" onClick={() => handleItemClick(onShowDesktop)}>
          Show Desktop
        </button>
        <button className="desktop-context-menu-item" onClick={() => handleItemClick(onWorkspaceOverview)}>
          Workspace Overview
        </button>
      </div>

      <div className="desktop-context-menu-separator" />

      <div className="desktop-context-menu-section">
        <button className="desktop-context-menu-item" onClick={() => handleItemClick(onProperties)}>
          Properties
        </button>
      </div>
    </div>
  );
};

