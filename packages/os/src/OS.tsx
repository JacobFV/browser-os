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
import { Notepad } from '@browser-os/notepad';
import { FileBrowser } from '@browser-os/file-browser';
import { Settings } from '@browser-os/settings';
import { Draw } from '@browser-os/draw';
import { Desktop } from './Desktop';
import { NotificationManager } from '@browser-os/notifications';
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
  const [notificationManager] = useState(() => new NotificationManager({ eventBus }));
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

        // Register notepad app component
        console.log('[OS] Registering notepad app component...');
        console.log('[OS] Notepad component:', Notepad);
        if (!Notepad) {
          throw new Error('Notepad component is undefined');
        }
        appComponentRegistry.registerAppComponent('notepad', Notepad);
        console.log('[OS] Notepad app component registered');

        // Register notepad app in registry if not already registered
        if (!appRegistry.isInstalled('notepad')) {
          console.log('[OS] Registering notepad app in registry...');
          const notepadEntry = {
            id: 'notepad',
            installedAt: Date.now(),
            installedBy: 'system',
            enabled: true,
            manifest: {
              id: 'notepad',
              name: 'Notepad',
              version: '0.1.0',
              description: 'Text editor',
              entrypoint: '/bin/notepad.js',
              permissions: [],
              showInTaskbar: true,
            },
          };
          appRegistry.add(notepadEntry);
          await appRegistry.save();
          console.log('[OS] Notepad app registered in registry');
        }

        // Register file browser app component
        console.log('[OS] Registering file browser app component...');
        console.log('[OS] FileBrowser component:', FileBrowser);
        if (!FileBrowser) {
          throw new Error('FileBrowser component is undefined');
        }
        appComponentRegistry.registerAppComponent('file-browser', FileBrowser);
        console.log('[OS] FileBrowser app component registered');

        // Register file browser app in registry if not already registered
        if (!appRegistry.isInstalled('file-browser')) {
          console.log('[OS] Registering file browser app in registry...');
          const fileBrowserEntry = {
            id: 'file-browser',
            installedAt: Date.now(),
            installedBy: 'system',
            enabled: true,
            manifest: {
              id: 'file-browser',
              name: 'File Browser',
              version: '0.1.0',
              description: 'File browser',
              entrypoint: '/bin/file-browser.js',
              permissions: [],
              showInTaskbar: true,
            },
          };
          appRegistry.add(fileBrowserEntry);
          await appRegistry.save();
          console.log('[OS] FileBrowser app registered in registry');
        }

        // Register settings app component
        console.log('[OS] Registering settings app component...');
        console.log('[OS] Settings component:', Settings);
        if (!Settings) {
          throw new Error('Settings component is undefined');
        }
        appComponentRegistry.registerAppComponent('settings', Settings);
        console.log('[OS] Settings app component registered');

        // Register settings app in registry if not already registered
        if (!appRegistry.isInstalled('settings')) {
          console.log('[OS] Registering settings app in registry...');
          const settingsEntry = {
            id: 'settings',
            installedAt: Date.now(),
            installedBy: 'system',
            enabled: true,
            manifest: {
              id: 'settings',
              name: 'Settings',
              version: '0.1.0',
              description: 'System settings',
              entrypoint: '/bin/settings.js',
              permissions: [],
              showInTaskbar: true,
            },
          };
          appRegistry.add(settingsEntry);
          await appRegistry.save();
          console.log('[OS] Settings app registered in registry');
        }

        // Register draw app component
        console.log('[OS] Registering draw app component...');
        console.log('[OS] Draw component:', Draw);
        if (!Draw) {
          throw new Error('Draw component is undefined');
        }
        appComponentRegistry.registerAppComponent('draw', Draw);
        console.log('[OS] Draw app component registered');

        // Register draw app in registry if not already registered
        if (!appRegistry.isInstalled('draw')) {
          console.log('[OS] Registering draw app in registry...');
          const drawEntry = {
            id: 'draw',
            installedAt: Date.now(),
            installedBy: 'system',
            enabled: true,
            manifest: {
              id: 'draw',
              name: 'Draw',
              version: '0.1.0',
              description: 'Drawing app',
              entrypoint: '/bin/draw.js',
              permissions: [],
              showInTaskbar: true,
            },
          };
          appRegistry.add(drawEntry);
          await appRegistry.save();
          console.log('[OS] Draw app registered in registry');
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
      fs={fs}
      notificationManager={notificationManager}
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
  fs: FileSystem;
  notificationManager: NotificationManager;
}

const DesktopShell: React.FC<DesktopShellProps> = ({
  eventBus,
  windowManager,
  workspaceManager,
  appRegistry,
  appComponentRegistry,
  desktop,
  fs,
  notificationManager,
}) => {
  const { activeWorkspaceId } = useWorkspace({ workspaceManager, eventBus });
  useKeyboardShortcuts({ workspaceManager, enabled: true });

  // Make windows reactive by using useState and useEffect
  const [windows, setWindows] = useState<Window[]>(() => 
    windowManager.getWindowsInWorkspace(activeWorkspaceId)
  );

  // Update windows when workspace changes or window events occur
  useEffect(() => {
    const updateWindows = () => {
      const currentWindows = windowManager.getWindowsInWorkspace(activeWorkspaceId);
      console.log('[OS] Updating windows list:', currentWindows.length, 'windows');
      setWindows(currentWindows);
    };

    // Initial update
    updateWindows();

    // Subscribe to window events
    const unsubscribeCreated = eventBus.on('window:created', () => {
      console.log('[OS] Window created event received, updating windows list');
      updateWindows();
    });

    const unsubscribeUpdated = eventBus.on('window:updated', () => {
      updateWindows();
    });

    const unsubscribeDestroyed = eventBus.on('window:destroyed', () => {
      console.log('[OS] Window destroyed event received, updating windows list');
      updateWindows();
    });

    const unsubscribeMinimized = eventBus.on('window:minimized', () => {
      updateWindows();
    });

    const unsubscribeRestored = eventBus.on('window:restored', () => {
      updateWindows();
    });

    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeDestroyed();
      unsubscribeMinimized();
      unsubscribeRestored();
    };
  }, [eventBus, windowManager, activeWorkspaceId]);

  // Handle app launching
  useEffect(() => {
    console.log('[OS] Setting up taskbar:shortcut:clicked event listener');
    
    const handleShortcutClick = (event: any) => {
      console.log('[OS] Received taskbar:shortcut:clicked event:', event);
      const { appId, forceNew } = event.payload || {};
      
      if (!appId) {
        console.warn('[OS] No appId in event payload:', event);
        return;
      }

      console.log('[OS] Attempting to launch app:', appId, 'forceNew:', forceNew);

      // Check if app is installed and enabled
      const app = appRegistry.get(appId);
      if (!app || !app.enabled) {
        console.warn(`[OS] App ${appId} is not installed or not enabled`, { app, enabled: app?.enabled });
        return;
      }

      console.log('[OS] App found in registry:', app.manifest.name);

      // Check if app component is registered
      if (!appComponentRegistry.hasAppComponent(appId)) {
        console.warn(`[OS] App component for ${appId} is not registered`);
        return;
      }

      console.log('[OS] App component is registered');

      // If forceNew is true, always create a new window
      if (forceNew) {
        console.log('[OS] Creating new window (forceNew=true) for app:', app.manifest.name);
        try {
          const windowId = windowManager.createWindow({
            title: app.manifest.name,
            width: 600,
            height: 500,
            workspaceId: activeWorkspaceId,
            appId: appId,
          });
          console.log('[OS] Window created successfully:', windowId);
        } catch (error) {
          console.error('[OS] Failed to create window:', error);
        }
        return;
      }

      // Check if app already has an open window in the active workspace
      const existingWindows = windowManager.getWindowsInWorkspace(activeWorkspaceId);
      const existingWindow = existingWindows.find((w: Window) => w.appId === appId && w.state !== 'minimized');

      if (existingWindow) {
        console.log('[OS] Focusing existing window:', existingWindow.id);
        // Focus existing window
        windowManager.focusWindow(existingWindow.id);
        if (existingWindow.state === 'minimized') {
          windowManager.restoreWindow(existingWindow.id);
        }
      } else {
        console.log('[OS] Creating new window for app:', app.manifest.name);
        try {
          const windowId = windowManager.createWindow({
            title: app.manifest.name,
            width: 600,
            height: 500,
            workspaceId: activeWorkspaceId,
            appId: appId,
          });
          console.log('[OS] Window created successfully:', windowId);
        } catch (error) {
          console.error('[OS] Failed to create window:', error);
        }
      }
    };

    const unsubscribe = eventBus.on('taskbar:shortcut:clicked', handleShortcutClick);
    console.log('[OS] Event listener registered for taskbar:shortcut:clicked');

    return () => {
      console.log('[OS] Unsubscribing from taskbar:shortcut:clicked event');
      unsubscribe();
    };
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
        {desktop ?? (
          <Desktop
            eventBus={eventBus}
            windowManager={windowManager}
            appRegistry={appRegistry}
            appComponentRegistry={appComponentRegistry}
            workspaceManager={workspaceManager}
            activeWorkspaceId={activeWorkspaceId}
          />
        )}
      </Workspace>
      <Taskbar
        windowManager={windowManager}
        appRegistry={appRegistry}
        workspaceManager={workspaceManager}
        eventBus={eventBus}
        activeWorkspaceId={activeWorkspaceId}
        fs={fs}
        notificationManager={notificationManager}
      />
      <NotificationOverlay
        notificationManager={notificationManager}
        eventBus={eventBus}
      />
    </div>
  );
};

// Notification overlay component
import { NotificationToast } from '@browser-os/notifications';
import { useNotifications } from '@browser-os/notifications';

interface NotificationOverlayProps {
  notificationManager: NotificationManager;
  eventBus: EventBus;
}

const NotificationOverlay: React.FC<NotificationOverlayProps> = ({
  notificationManager,
  eventBus,
}) => {
  const { notifications } = useNotifications({ notificationManager });
  const settings = notificationManager.getSettings();

  const handleDismiss = (id: string) => {
    notificationManager.dismissNotification(id);
  };

  const handleNotificationClick = (notification: import('@browser-os/schemas').Notification) => {
    // Handle notification click - could open app or window
    if (notification.appId) {
      eventBus.emit('taskbar:shortcut:clicked', { appId: notification.appId }, { source: 'notification' });
    }
  };

  const handleNotificationAction = (
    notification: import('@browser-os/schemas').Notification,
    action: string,
    data?: unknown
  ) => {
    // Handle notification action
    if (action === 'open-file' && data && typeof data === 'object' && 'path' in data) {
      // Open file browser with path
      eventBus.emit('taskbar:shortcut:clicked', { appId: 'file-browser' }, { source: 'notification' });
    }
  };

  return (
    <NotificationToast
      notifications={notifications}
      position={settings.toastPosition}
      autoDismissTimeout={settings.autoDismissTimeout}
      onDismiss={handleDismiss}
      onClick={handleNotificationClick}
      onAction={handleNotificationAction}
    />
  );
};

