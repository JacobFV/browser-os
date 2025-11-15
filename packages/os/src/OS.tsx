import React, { useEffect, useState } from 'react';
import { EventBus } from '@browser-os/events';
import { FileSystem, IndexedDBBackend } from '@browser-os/fs';
import { AppRegistry } from '@browser-os/app-registry';
import { WindowManager } from '@browser-os/windowing';
import { WorkspaceManager, Workspace, useWorkspace, useKeyboardShortcuts } from '@browser-os/workspace';
import { Taskbar } from '@browser-os/taskbar';
import type { Window } from '@browser-os/schemas';
import { AppComponentRegistry } from './AppComponentRegistry';
import { Browser } from '@browser-os/browser';
import { Desktop } from './Desktop';
import './OS.css';

export interface OSProps {
  /** Custom desktop background component */
  desktop?: React.ReactNode;
  /** Number of workspaces to create (default: 4) */
  workspaceCount?: number;
  /** Filesystem database name (default: 'browser-os-fs') */
  dbName?: string;
}

export const OS: React.FC<OSProps> = ({ desktop, workspaceCount = 4, dbName = 'browser-os-fs' }) => {
  const [eventBus] = useState(() => new EventBus());
  const [fs] = useState(() => new FileSystem());
  const [appRegistry] = useState(() => new AppRegistry({ fs, eventBus }));
  const [windowManager] = useState(() => new WindowManager({ eventBus }));
  const [appComponentRegistry] = useState(() => new AppComponentRegistry(eventBus));
  const [workspaceManager, setWorkspaceManager] = useState<WorkspaceManager | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize filesystem and app registry
  useEffect(() => {
    const init = async () => {
      try {
        // Initialize filesystem with IndexedDB backend
        const backend = new IndexedDBBackend({ dbName });
        await backend.init();
        await fs.mount('/', backend);

        // Initialize app registry
        await appRegistry.init();

        // Register browser app component
        appComponentRegistry.registerAppComponent('browser', Browser);

        // Register browser app in registry if not already registered
        if (!appRegistry.isInstalled('browser')) {
          const browserEntry = {
            id: 'browser',
            installedAt: Date.now(),
            installedBy: 'system',
            enabled: true,
            manifest: {
              id: 'browser',
              name: 'Browser',
              version: '0.1.0',
              description: 'Web browser',
              entrypoint: '/bin/browser.js',
              permissions: [],
              showInTaskbar: true,
            },
          };
          appRegistry.add(browserEntry);
          await appRegistry.save();
        }

        // Initialize workspace manager
        const wm = new WorkspaceManager({
          eventBus,
          windowManager,
          initialWorkspaceCount: workspaceCount,
        });
        setWorkspaceManager(wm);

        setInitialized(true);
      } catch (error) {
        console.error('Failed to initialize OS:', error);
      }
    };

    init();
  }, [fs, appRegistry, windowManager, appComponentRegistry, eventBus, workspaceCount, dbName]);

  if (!initialized || !workspaceManager) {
    return <div className="os-loading">Loading...</div>;
  }

  return (
    <DesktopShell
      eventBus={eventBus}
      windowManager={windowManager}
      workspaceManager={workspaceManager}
      appRegistry={appRegistry}
      appComponentRegistry={appComponentRegistry}
      desktop={desktop}
    />
  );
};

interface DesktopShellProps {
  eventBus: EventBus;
  windowManager: WindowManager;
  workspaceManager: WorkspaceManager;
  appRegistry: AppRegistry;
  appComponentRegistry: AppComponentRegistry;
  desktop?: React.ReactNode;
}

const DesktopShell: React.FC<DesktopShellProps> = ({
  eventBus,
  windowManager,
  workspaceManager,
  appRegistry,
  appComponentRegistry,
  desktop,
}) => {
  const { activeWorkspaceId } = useWorkspace({ workspaceManager, eventBus });
  useKeyboardShortcuts({ workspaceManager, enabled: true });

  const windows = windowManager.getWindowsInWorkspace(activeWorkspaceId);

  // Handle app launching
  useEffect(() => {
    const handleShortcutClick = (event: any) => {
      const { appId } = event.payload || {};
      if (!appId) return;

      // Check if app is installed and enabled
      const app = appRegistry.get(appId);
      if (!app || !app.enabled) {
        console.warn(`App ${appId} is not installed or not enabled`);
        return;
      }

      // Check if app component is registered
      if (!appComponentRegistry.hasAppComponent(appId)) {
        console.warn(`App component for ${appId} is not registered`);
        return;
      }

      // Check if app already has an open window in the active workspace
      const existingWindows = windowManager.getWindowsInWorkspace(activeWorkspaceId);
      const existingWindow = existingWindows.find((w: Window) => w.appId === appId && w.state !== 'minimized');

      if (existingWindow) {
        // Focus existing window
        windowManager.focusWindow(existingWindow.id);
        if (existingWindow.state === 'minimized') {
          windowManager.restoreWindow(existingWindow.id);
        }
      } else {
        // Create new window for the app
        windowManager.createWindow({
          title: app.manifest.name,
          width: 1000,
          height: 700,
          workspaceId: activeWorkspaceId,
          appId: appId,
        });
      }
    };

    const unsubscribe = eventBus.on('taskbar:shortcut:clicked', handleShortcutClick);

    return unsubscribe;
  }, [eventBus, appRegistry, appComponentRegistry, windowManager, activeWorkspaceId]);

  return (
    <div className="os">
      <Workspace
        workspaceId={activeWorkspaceId}
        windows={windows}
        windowManager={windowManager}
        appComponentRegistry={appComponentRegistry}
        eventBus={eventBus}
      >
        {desktop ?? <Desktop />}
      </Workspace>
      <Taskbar
        windowManager={windowManager}
        appRegistry={appRegistry}
        workspaceManager={workspaceManager}
        eventBus={eventBus}
        activeWorkspaceId={activeWorkspaceId}
      />
    </div>
  );
};

