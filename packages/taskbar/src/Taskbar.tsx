import React, { useState, useRef, useEffect } from 'react';
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
  position?: 'bottom' | 'top' | 'left' | 'right';
}

export const Taskbar: React.FC<TaskbarProps> = ({
  windowManager,
  appRegistry,
  workspaceManager,
  eventBus,
  activeWorkspaceId,
  fs,
  notificationManager,
  position = 'bottom',
}) => {
  const [showOverview, setShowOverview] = useState(false);
  const { windows, shortcuts, recentFilesManager } = useTaskbar({
    windowManager,
    appRegistry,
    eventBus,
    activeWorkspaceId,
    fs,
  });

  const dragStartRef = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0, hasMoved: false });
  const isVertical = position === 'left' || position === 'right';

  console.log('[Taskbar] Component rendering:', {
    windowsCount: windows.length,
    position,
    isVertical,
  });

  const handleWindowClick = (windowId: string) => {
    // Prevent click if we just finished dragging
    if (dragStartRef.current.hasMoved) return;

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Handle mouse drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    // We allow dragging from buttons now
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: scrollContainerRef.current.scrollLeft,
      scrollTop: scrollContainerRef.current.scrollTop,
      hasMoved: false,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!scrollContainerRef.current || dragStartRef.current.x === 0) return;
    
    const deltaX = Math.abs(dragStartRef.current.x - e.clientX);
    const deltaY = Math.abs(dragStartRef.current.y - e.clientY);
    const moveThreshold = 5;

    // Check if moved enough to start dragging
    if (!dragStartRef.current.hasMoved && (deltaX > moveThreshold || deltaY > moveThreshold)) {
      setIsDragging(true);
      dragStartRef.current.hasMoved = true;
    }

    if (dragStartRef.current.hasMoved) {
      if (isVertical) {
        const scrollDelta = dragStartRef.current.y - e.clientY;
        scrollContainerRef.current.scrollTop = dragStartRef.current.scrollTop + scrollDelta;
      } else {
        const scrollDelta = dragStartRef.current.x - e.clientX;
        scrollContainerRef.current.scrollLeft = dragStartRef.current.scrollLeft + scrollDelta;
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Note: We don't reset hasMoved here so onClick can check it. 
    // It will be reset on next mouseDown.
    dragStartRef.current.x = 0; // Reset drag start
  };

  // Handle mouse wheel
  const handleWheel = (e: React.WheelEvent) => {
    if (!scrollContainerRef.current) {
      return;
    }
    
    // For horizontal taskbar, map vertical scroll to horizontal scroll
    if (!isVertical) {
      const container = scrollContainerRef.current;
      const scrollAmount = e.deltaY;
      container.scrollLeft += scrollAmount;
    }
  };

  // Handle touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return;
    const touch = e.touches[0];
    dragStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      scrollLeft: scrollContainerRef.current.scrollLeft,
      scrollTop: scrollContainerRef.current.scrollTop,
      hasMoved: false,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return;
    const touch = e.touches[0];
    const deltaX = dragStartRef.current.x - touch.clientX;
    const deltaY = dragStartRef.current.y - touch.clientY;
    
    // Start dragging immediately on touch move
    if (!dragStartRef.current.hasMoved) {
      dragStartRef.current.hasMoved = true;
    }
    
    if (isVertical) {
      scrollContainerRef.current.scrollTop = dragStartRef.current.scrollTop + deltaY;
    } else {
      scrollContainerRef.current.scrollLeft = dragStartRef.current.scrollLeft + deltaX;
    }
    
    e.preventDefault(); // Prevent scrolling the page
  };

  useEffect(() => {
    const handleMouseMoveGlobal = (e: MouseEvent) => {
      // Only handle if we have a starting position
      if (dragStartRef.current.x !== 0) {
        handleMouseMove(e);
      }
    };
    const handleMouseUpGlobal = () => {
      if (dragStartRef.current.x !== 0) {
        handleMouseUp();
      }
    };

    window.addEventListener('mousemove', handleMouseMoveGlobal);
    window.addEventListener('mouseup', handleMouseUpGlobal);
    return () => {
      window.removeEventListener('mousemove', handleMouseMoveGlobal);
      window.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, [isVertical]); // Re-bind if orientation changes

  // Log critical errors only
  useEffect(() => {
    if (!scrollContainerRef.current && windows.length > 0) {
      console.error('[Taskbar] Scroll container ref is null!');
    }
  }, [windows]);

  return (
    <>
      <div className={`taskbar ${position}`}>
        <div
          ref={scrollContainerRef}
          className="taskbar-content"
          onMouseDown={handleMouseDown}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
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
                appRegistry={appRegistry}
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

