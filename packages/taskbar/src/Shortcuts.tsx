import React, { useState } from 'react';
import type { TaskbarShortcut } from './types';
import type { WindowManager } from '@browser-os/windowing';
import { RecentFilesManager } from './RecentFilesManager';
import { EventBus } from '@browser-os/events';
import { ShortcutContextMenu } from './ShortcutContextMenu';
import './Shortcuts.css';

export interface ShortcutsProps {
  shortcuts: TaskbarShortcut[];
  onShortcutClick: (appId: string, forceNew?: boolean) => void;
  windowManager: WindowManager;
  recentFilesManager: RecentFilesManager;
  eventBus: EventBus;
}

export const Shortcuts: React.FC<ShortcutsProps> = ({
  shortcuts,
  onShortcutClick,
  windowManager,
  recentFilesManager,
  eventBus,
}) => {
  const [contextMenu, setContextMenu] = useState<{
    appId: string;
    appName: string;
    position: { x: number; y: number };
  } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, shortcut: TaskbarShortcut) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[Shortcuts] Right-click on shortcut:', shortcut.appId, shortcut.name);
    setContextMenu({
      appId: shortcut.appId,
      appName: shortcut.name,
      position: { x: e.clientX, y: e.clientY },
    });
  };

  const handleNewWindow = (appId: string) => {
    onShortcutClick(appId, true);
    setContextMenu(null);
  };

  return (
    <>
      <div className="taskbar-shortcuts">
        {shortcuts.map((shortcut) => (
          <button
            key={shortcut.appId}
            className="taskbar-shortcut"
            onClick={() => onShortcutClick(shortcut.appId)}
            onContextMenu={(e) => handleContextMenu(e, shortcut)}
            title={shortcut.name}
          >
            {shortcut.icon ? (
              <img src={shortcut.icon} alt={shortcut.name} className="taskbar-shortcut-icon" />
            ) : (
              <span className="taskbar-shortcut-icon-placeholder">{shortcut.name[0]}</span>
            )}
          </button>
        ))}
      </div>
      {contextMenu && (
        <ShortcutContextMenu
          appId={contextMenu.appId}
          appName={contextMenu.appName}
          position={contextMenu.position}
          windowManager={windowManager}
          recentFilesManager={recentFilesManager}
          eventBus={eventBus}
          onClose={() => setContextMenu(null)}
          onNewWindow={() => handleNewWindow(contextMenu.appId)}
        />
      )}
    </>
  );
};

