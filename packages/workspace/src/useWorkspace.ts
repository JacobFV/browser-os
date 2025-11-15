import { useEffect, useState } from 'react';
import { EventBus } from '@browser-os/events';
import type { Workspace } from '@browser-os/schemas';
import type { WorkspaceManager } from './WorkspaceManager';

export interface UseWorkspaceOptions {
  workspaceManager: WorkspaceManager;
  eventBus?: EventBus;
}

/**
 * React hook for workspace operations
 */
export function useWorkspace(options: UseWorkspaceOptions) {
  const { workspaceManager, eventBus } = options;
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(
    workspaceManager.getActiveWorkspace()
  );
  const [workspaces, setWorkspaces] = useState<Workspace[]>(workspaceManager.getAllWorkspaces());

  useEffect(() => {
    const bus = eventBus ?? new EventBus();

    const unsubscribe = bus.on('workspace:switched', (event) => {
      if (event.payload && typeof event.payload === 'object' && 'workspaceId' in event.payload) {
        setActiveWorkspaceId(event.payload.workspaceId as string);
      }
    });

    return unsubscribe;
  }, [eventBus]);

  const switchWorkspace = (workspaceId: string) => {
    workspaceManager.switchWorkspace(workspaceId);
    setActiveWorkspaceId(workspaceId);
  };

  const switchWorkspaceByIndex = (index: number) => {
    workspaceManager.switchWorkspaceByIndex(index);
    const workspace = workspaces.find((w) => w.index === index);
    if (workspace) {
      setActiveWorkspaceId(workspace.id);
    }
  };

  return {
    activeWorkspaceId,
    workspaces,
    switchWorkspace,
    switchWorkspaceByIndex,
  };
}

