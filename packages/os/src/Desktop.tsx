import React, { useState } from 'react';
import { EventBus } from '@browser-os/events';
import { AppRegistry } from '@browser-os/app-registry';
import { WindowManager } from '@browser-os/windowing';
import { WorkspaceManager } from '@browser-os/workspace';
import { AppComponentRegistry } from './AppComponentRegistry';
import { DesktopContextMenu } from './DesktopContextMenu';
import './Desktop.css';

export interface DesktopProps {
  eventBus: EventBus;
  windowManager: WindowManager;
  appRegistry: AppRegistry;
  appComponentRegistry: AppComponentRegistry;
  workspaceManager: WorkspaceManager;
  activeWorkspaceId: string;
}

export const Desktop: React.FC<DesktopProps> = ({
  eventBus,
  windowManager,
  appRegistry,
  appComponentRegistry,
  workspaceManager,
  activeWorkspaceId,
}) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleCloseMenu = () => {
    setContextMenu(null);
  };

  const launchApp = (appId: string) => {
    const app = appRegistry.get(appId);
    if (!app || !app.enabled) {
      console.warn(`[Desktop] App ${appId} is not installed or not enabled`);
      return;
    }

    if (!appComponentRegistry.hasAppComponent(appId)) {
      console.warn(`[Desktop] App component for ${appId} is not registered`);
      return;
    }

    const existingWindows = windowManager.getWindowsInWorkspace(activeWorkspaceId);
    const existingWindow = existingWindows.find((w) => w.appId === appId && w.state !== 'minimized');

    if (existingWindow) {
      windowManager.focusWindow(existingWindow.id);
      if (existingWindow.state === 'minimized') {
        windowManager.restoreWindow(existingWindow.id);
      }
    } else {
      try {
        windowManager.createWindow({
          title: app.manifest.name,
          width: 600,
          height: 500,
          workspaceId: activeWorkspaceId,
          appId: appId,
        });
      } catch (error) {
        console.error('[Desktop] Failed to create window:', error);
      }
    }
  };

  const handleRefresh = () => {
    // Refresh desktop - could trigger a refresh event or reload icons
    eventBus.emit('desktop:refresh', {}, { source: 'desktop' });
  };

  const handleNewFile = () => {
    // Open file browser or create new file dialog
    launchApp('file-browser');
    eventBus.emit('desktop:new-file', {}, { source: 'desktop' });
  };

  const handleNewFolder = () => {
    // Open file browser or create new folder dialog
    launchApp('file-browser');
    eventBus.emit('desktop:new-folder', {}, { source: 'desktop' });
  };

  const handlePaste = () => {
    // Handle paste operation
    eventBus.emit('desktop:paste', {}, { source: 'desktop' });
  };

  const handleView = () => {
    // Handle view options
    eventBus.emit('desktop:view', {}, { source: 'desktop' });
  };

  const handleArrange = () => {
    // Handle arrange icons
    eventBus.emit('desktop:arrange', {}, { source: 'desktop' });
  };

  const handleShowDesktop = () => {
    // Minimize all windows in current workspace
    const windows = windowManager.getWindowsInWorkspace(activeWorkspaceId);
    windows.forEach((window) => {
      if (window.state !== 'minimized') {
        windowManager.minimizeWindow(window.id);
      }
    });
  };

  const handleProperties = () => {
    // Show desktop properties/settings
    launchApp('settings');
  };

  const handleOpenTerminal = () => {
    launchApp('terminal');
  };

  const handleOpenFileBrowser = () => {
    launchApp('file-browser');
  };

  const handleOpenBrowser = () => {
    launchApp('browser');
  };

  const handleOpenNotepad = () => {
    launchApp('notepad');
  };

  const handleOpenSettings = () => {
    launchApp('settings');
  };

  const handleWorkspaceOverview = () => {
    // Trigger workspace overview
    eventBus.emit('workspace:show-overview', {}, { source: 'desktop' });
  };

  return (
    <>
      <div className="os-desktop" onContextMenu={handleContextMenu}>
      <div className="os-desktop-background">
        <div className="os-desktop-branding">
          <img src="/favicon.svg" alt="Browser OS Icon" className="os-desktop-icon" />
          <span className="os-desktop-title">BROWSER-OS</span>
        </div>
        <div className="os-desktop-blurstorm">
          <div className="blur-blob blob-1"></div>
          <div className="blur-blob blob-2"></div>
          <div className="blur-blob blob-3"></div>
          <div className="blur-blob blob-4"></div>
          <div className="blur-blob blob-5"></div>
          <div className="blur-blob blob-6"></div>
        </div>
      </div>
      <div className="os-desktop-content">
        {/* Desktop icons, widgets, etc. can go here */}
      </div>
    </div>
      {contextMenu && (
        <DesktopContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={handleCloseMenu}
          onRefresh={handleRefresh}
          onNewFile={handleNewFile}
          onNewFolder={handleNewFolder}
          onPaste={handlePaste}
          onView={handleView}
          onArrange={handleArrange}
          onShowDesktop={handleShowDesktop}
          onProperties={handleProperties}
          onOpenTerminal={handleOpenTerminal}
          onOpenFileBrowser={handleOpenFileBrowser}
          onOpenBrowser={handleOpenBrowser}
          onOpenNotepad={handleOpenNotepad}
          onOpenSettings={handleOpenSettings}
          onWorkspaceOverview={handleWorkspaceOverview}
        />
      )}
    </>
  );
};

