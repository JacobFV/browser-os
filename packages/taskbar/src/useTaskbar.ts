import { useEffect, useState } from 'react';
import { EventBus } from '@browser-os/events';
import type { Window } from '@browser-os/schemas';
import type { AppRegistryEntry } from '@browser-os/schemas';
import type { WindowManager } from '@browser-os/windowing';
import type { AppRegistry } from '@browser-os/app-registry';
import type { TaskbarWindow, TaskbarShortcut } from './types';

export interface UseTaskbarOptions {
  windowManager: WindowManager;
  appRegistry: AppRegistry;
  eventBus?: EventBus;
  activeWorkspaceId: string;
}

/**
 * React hook for taskbar state
 */
export function useTaskbar(options: UseTaskbarOptions) {
  const { windowManager, appRegistry, eventBus, activeWorkspaceId } = options;
  const [windows, setWindows] = useState<TaskbarWindow[]>([]);
  const [shortcuts, setShortcuts] = useState<TaskbarShortcut[]>([]);
  const [focusedWindowId, setFocusedWindowId] = useState<string | null>(null);

  useEffect(() => {
    const updateWindows = () => {
      const allWindows = windowManager.getWindowsInWorkspace(activeWorkspaceId);
      const taskbarWindows: TaskbarWindow[] = allWindows
        .filter((w) => {
          // Only show windows for apps that have showInTaskbar: true
          if (!w.appId) return true; // Show windows without appId
          const app = appRegistry.get(w.appId);
          return app?.manifest.showInTaskbar !== false;
        })
        .map((w) => ({
          windowId: w.id,
          appId: w.appId,
          title: w.title,
          isFocused: w.zIndex === Math.max(...allWindows.map((w2) => w2.zIndex)),
          isMinimized: w.state === 'minimized',
        }));
      setWindows(taskbarWindows);
    };

    const updateShortcuts = () => {
      const apps = appRegistry.getEnabled().filter((app: any) => app.manifest.showInTaskbar !== false);
      const shortcutsList: TaskbarShortcut[] = apps.map((app: any) => ({
        appId: app.id,
        name: app.manifest.name,
        icon: app.manifest.icon,
      }));
      setShortcuts(shortcutsList);
    };

    updateWindows();
    updateShortcuts();

    const bus = eventBus ?? new EventBus();

    const unsubscribeWindow = bus.on('window:', () => {
      updateWindows();
    });

    const unsubscribeRegistry = bus.on('registry:', () => {
      updateShortcuts();
    });

    return () => {
      unsubscribeWindow();
      unsubscribeRegistry();
    };
  }, [windowManager, appRegistry, eventBus, activeWorkspaceId]);

  return {
    windows,
    shortcuts,
    focusedWindowId,
  };
}

