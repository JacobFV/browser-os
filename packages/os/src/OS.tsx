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
import { Terminal } from '@browser-os/terminal';
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
        console.log('[OS] Starting initialization...');
        
        // Initialize filesystem with IndexedDB backend
        console.log('[OS] Initializing IndexedDB backend...');
        const backend = new IndexedDBBackend({ dbName });
        await backend.init();
        console.log('[OS] IndexedDB backend initialized');
        
        await fs.mount('/', backend);
        console.log('[OS] Filesystem mounted');

        // Initialize app registry
        console.log('[OS] Initializing app registry...');
        await appRegistry.init();
        console.log('[OS] App registry initialized');

        // Register browser app component
        console.log('[OS] Registering browser app component...');
        console.log('[OS] Browser component:', Browser);
        if (!Browser) {
          throw new Error('Browser component is undefined');
        }
        appComponentRegistry.registerAppComponent('browser', Browser);
        console.log('[OS] Browser app component registered');

        // Register browser app in registry if not already registered
        if (!appRegistry.isInstalled('browser')) {
          console.log('[OS] Registering browser app in registry...');
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
          console.log('[OS] Browser app registered in registry');
        }

        // Register terminal app component
        console.log('[OS] Registering terminal app component...');
        console.log('[OS] Terminal component:', Terminal);
        if (!Terminal) {
          throw new Error('Terminal component is undefined');
        }
        appComponentRegistry.registerAppComponent('terminal', Terminal);
        console.log('[OS] Terminal app component registered');

        // Register terminal app in registry if not already registered
        if (!appRegistry.isInstalled('terminal')) {
          console.log('[OS] Registering terminal app in registry...');
          const terminalEntry = {
            id: 'terminal',
            installedAt: Date.now(),
            installedBy: 'system',
            enabled: true,
            manifest: {
              id: 'terminal',
              name: 'Terminal',
              version: '0.1.0',
              description: 'Terminal emulator',
              entrypoint: '/bin/terminal.js',
              permissions: [],
              showInTaskbar: true,
            },
          };
          appRegistry.add(terminalEntry);
          await appRegistry.save();
          console.log('[OS] Terminal app registered in registry');
        }

        // Initialize workspace manager
        console.log('[OS] Initializing workspace manager...');
        const wm = new WorkspaceManager({
          eventBus,
          windowManager,
          initialWorkspaceCount: workspaceCount,
        });
        setWorkspaceManager(wm);
        console.log('[OS] Workspace manager initialized');

        setInitialized(true);
        console.log('[OS] Initialization complete!');
      } catch (error) {
        console.error('[OS] Failed to initialize OS:', error);
        console.error('[OS] Error details:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
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

