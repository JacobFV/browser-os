import React, { useEffect, useState } from 'react';
import { EventBus } from '@browser-os/events';
import { FileSystem, IndexedDBBackend } from '@browser-os/fs';
import { AppRegistry } from '@browser-os/app-registry';
import { WindowManager } from '@browser-os/windowing';
import { WorkspaceManager, Workspace, useWorkspace, useKeyboardShortcuts } from '@browser-os/workspace';
import { Taskbar } from '@browser-os/taskbar';
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
  }, [fs, appRegistry, windowManager, eventBus, workspaceCount, dbName]);

  if (!initialized || !workspaceManager) {
    return <div className="os-loading">Loading...</div>;
  }

  return (
    <DesktopShell
      eventBus={eventBus}
      windowManager={windowManager}
      workspaceManager={workspaceManager}
      appRegistry={appRegistry}
      desktop={desktop}
    />
  );
};

interface DesktopShellProps {
  eventBus: EventBus;
  windowManager: WindowManager;
  workspaceManager: WorkspaceManager;
  appRegistry: AppRegistry;
  desktop?: React.ReactNode;
}

const DesktopShell: React.FC<DesktopShellProps> = ({
  eventBus,
  windowManager,
  workspaceManager,
  appRegistry,
  desktop,
}) => {
  const { activeWorkspaceId } = useWorkspace({ workspaceManager, eventBus });
  useKeyboardShortcuts({ workspaceManager, enabled: true });

  const windows = windowManager.getWindowsInWorkspace(activeWorkspaceId);

  return (
    <div className="os">
      <Workspace
        workspaceId={activeWorkspaceId}
        windows={windows}
        windowManager={windowManager}
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

