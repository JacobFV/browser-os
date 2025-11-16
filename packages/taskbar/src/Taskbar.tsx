import React, { useState } from 'react';
import type { Window } from '@browser-os/schemas';
import type { WindowManager } from '@browser-os/windowing';
import type { AppRegistry } from '@browser-os/app-registry';
import type { WorkspaceManager } from '@browser-os/workspace';
import type { FileSystem } from '@browser-os/fs';
import { EventBus } from '@browser-os/events';
import { Shortcuts } from './Shortcuts';
import { SearchBar } from './SearchBar';
import { TaskbarButton } from './TaskbarButton';
import { WorkspaceOverviewButton } from './WorkspaceOverviewButton';
import { WorkspaceOverview } from '@browser-os/workspace';
import { useTaskbar } from './useTaskbar';
import { NotificationCenter } from '@browser-os/notifications';
import { NotificationBadgeButton } from './NotificationBadgeButton';
import './Taskbar.css';

export interface TaskbarProps {
  windowManager: WindowManager;
  appRegistry: AppRegistry;
  workspaceManager: WorkspaceManager;
  eventBus: EventBus;
  activeWorkspaceId: string;
  fs?: FileSystem;
  notificationManager?: import('@browser-os/notifications').NotificationManager;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  windowManager,
  appRegistry,
  workspaceManager,
  eventBus,
  activeWorkspaceId,
  fs,
  notificationManager,
}) => {
  const [showOverview, setShowOverview] = useState(false);
  const { windows, shortcuts, recentFilesManager } = useTaskbar({
    windowManager,
    appRegistry,
    eventBus,
    activeWorkspaceId,
    fs,
  });

  const handleWindowClick = (windowId: string) => {
    const window = windowManager.getWindow(windowId);
    if (window) {
      if (window.state === 'minimized') {
        windowManager.restoreWindow(windowId);
      } else {
        windowManager.focusWindow(windowId);
      }
    }
  };

  const handleShortcutClick = (appId: string, forceNew?: boolean) => {
    if (!eventBus) {
      console.error('[Taskbar] eventBus is required but not provided');
      return;
    }
    console.log('[Taskbar] Emitting taskbar:shortcut:clicked event for app:', appId, 'forceNew:', forceNew);
    eventBus.emit('taskbar:shortcut:clicked', { appId, forceNew }, { source: 'taskbar' });
  };

  const handleAppSelect = (appId: string) => {
    handleShortcutClick(appId);
  };

  // Get windows by workspace for overview
  const windowsByWorkspace = new Map<string, Window[]>();
  workspaceManager.getAllWorkspaces().forEach((workspace) => {
    const wsWindows = windowManager.getWindowsInWorkspace(workspace.id).filter((w) => {
      if (!w.appId) return true;
      const app = appRegistry.get(w.appId);
      return app?.manifest.showInTaskbar !== false;
    });
    windowsByWorkspace.set(workspace.id, wsWindows);
  });

  const [showNotificationCenter, setShowNotificationCenter] = useState(false);

  return (
    <>
      <div className="taskbar">
        {recentFilesManager ? (
          <Shortcuts
            shortcuts={shortcuts}
            onShortcutClick={handleShortcutClick}
            windowManager={windowManager}
            recentFilesManager={recentFilesManager}
            eventBus={eventBus}
          />
        ) : (
          <div className="taskbar-shortcuts">
            {shortcuts.map((shortcut) => (
              <button
                key={shortcut.appId}
                className="taskbar-shortcut"
                onClick={() => handleShortcutClick(shortcut.appId)}
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
        )}
        <div className="taskbar-windows">
          {windows.map((window) => (
            <TaskbarButton
              key={window.windowId}
              window={window}
              onClick={() => handleWindowClick(window.windowId)}
              onContextMenu={(e) => {
                e.preventDefault();
                // TODO: Show context menu
              }}
            />
          ))}
        </div>
        <SearchBar apps={appRegistry.getEnabled()} onAppSelect={handleAppSelect} />
        {notificationManager && (
          <NotificationBadgeButton
            notificationManager={notificationManager}
            onClick={() => setShowNotificationCenter(!showNotificationCenter)}
          />
        )}
        <WorkspaceOverviewButton onClick={() => setShowOverview(true)} />
      </div>
      {showOverview && (
        <WorkspaceOverview
          workspaces={workspaceManager.getAllWorkspaces()}
          activeWorkspaceId={activeWorkspaceId}
          windowsByWorkspace={windowsByWorkspace}
          onSelectWorkspace={(workspaceId) => {
            workspaceManager.switchWorkspace(workspaceId);
            setShowOverview(false);
          }}
          onClose={() => setShowOverview(false)}
        />
      )}
      {showNotificationCenter && notificationManager && (
        <>
          <div
            className="notification-center-backdrop"
            onClick={() => setShowNotificationCenter(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 10001,
            }}
          />
          <NotificationCenter
            notificationManager={notificationManager}
            onClose={() => setShowNotificationCenter(false)}
          />
        </>
      )}
    </>
  );
};

