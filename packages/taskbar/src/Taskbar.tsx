import React, { useState } from 'react';
import type { Window } from '@browser-os/schemas';
import type { WindowManager } from '@browser-os/windowing';
import type { AppRegistry } from '@browser-os/app-registry';
import type { WorkspaceManager } from '@browser-os/workspace';
import { EventBus } from '@browser-os/events';
import { Shortcuts } from './Shortcuts';
import { SearchBar } from './SearchBar';
import { TaskbarButton } from './TaskbarButton';
import { WorkspaceOverviewButton } from './WorkspaceOverviewButton';
import { WorkspaceOverview } from '@browser-os/workspace';
import { useTaskbar } from './useTaskbar';
import './Taskbar.css';

export interface TaskbarProps {
  windowManager: WindowManager;
  appRegistry: AppRegistry;
  workspaceManager: WorkspaceManager;
  eventBus?: EventBus;
  activeWorkspaceId: string;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  windowManager,
  appRegistry,
  workspaceManager,
  eventBus,
  activeWorkspaceId,
}) => {
  const [showOverview, setShowOverview] = useState(false);
  const { windows, shortcuts } = useTaskbar({
    windowManager,
    appRegistry,
    eventBus,
    activeWorkspaceId,
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

  const handleShortcutClick = (appId: string) => {
    // TODO: Launch app or focus existing window
    // For now, just emit an event
    const bus = eventBus ?? new EventBus();
    bus.emit('taskbar:shortcut:clicked', { appId }, { source: 'taskbar' });
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

  return (
    <>
      <div className="taskbar">
        <Shortcuts shortcuts={shortcuts} onShortcutClick={handleShortcutClick} />
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
    </>
  );
};

