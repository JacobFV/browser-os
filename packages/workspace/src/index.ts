import { createId } from '@browser-os/core';
import { Window } from '@browser-os/windowing';
import { ThemeSkin } from '@browser-os/theme';

export interface Workspace {
  id: string;
  name: string;
  layout: {
    dockview: unknown;
    windows: Window[];
  };
  mode: 'desktop' | 'mobile';
  theme: {
    skin: ThemeSkin;
    accent?: string;
  };
}

class WorkspaceManager {
  private workspaces: Map<string, Workspace> = new Map();
  private currentWorkspaceId: string = 'default';

  createWorkspace(name: string, mode: 'desktop' | 'mobile' = 'desktop'): Workspace {
    const id = createId();
    const workspace: Workspace = {
      id,
      name,
      layout: { dockview: null, windows: [] },
      mode,
      theme: { skin: 'win95' },
    };
    this.workspaces.set(id, workspace);
    return workspace;
  }

  getWorkspace(id: string): Workspace | undefined {
    return this.workspaces.get(id);
  }

  getCurrentWorkspace(): Workspace {
    return this.workspaces.get(this.currentWorkspaceId) || this.createWorkspace('Default');
  }

  setCurrentWorkspace(id: string): void {
    this.currentWorkspaceId = id;
  }

  saveWorkspace(workspace: Workspace): void {
    this.workspaces.set(workspace.id, workspace);
  }

  loadWorkspace(id: string): Workspace | undefined {
    return this.workspaces.get(id);
  }

  getAllWorkspaces(): Workspace[] {
    return Array.from(this.workspaces.values());
  }
}

export const workspaceManager = new WorkspaceManager();

export function saveWorkspace(name: string): Promise<void> {
  const current = workspaceManager.getCurrentWorkspace();
  current.name = name;
  workspaceManager.saveWorkspace(current);
  return Promise.resolve();
}

export function loadWorkspace(id: string): Promise<void> {
  const workspace = workspaceManager.loadWorkspace(id);
  if (workspace) {
    workspaceManager.setCurrentWorkspace(id);
  }
  return Promise.resolve();
}

