import { windowManager } from '@browser-os/windowing';
import { Window } from '@browser-os/windowing';
import { settingsStore } from '@browser-os/settings';

export interface Workspace {
  id: string;
  name: string;
  windows: Array<{
    appId: string;
    title: string;
    bounds: { x: number; y: number; w: number; h: number };
    state: string;
    payload?: Record<string, any>;
  }>;
}

class WorkspaceManager {
  private currentWorkspaceId: string = 'default';
  
  async saveWorkspace(name?: string): Promise<string> {
    const workspaceId = name || `workspace-${Date.now()}`;
    const windows = Array.from(windowManager.windows.values());
    
    const workspace: Workspace = {
      id: workspaceId,
      name: name || workspaceId,
      windows: windows.map(win => ({
        appId: win.appId,
        title: win.title,
        bounds: win.bounds,
        state: win.state,
        payload: win.payload,
      })),
    };
    
    await settingsStore.set(`workspace:${workspaceId}`, workspace);
    await this.addToWorkspaceList(workspaceId);
    
    return workspaceId;
  }
  
  async loadWorkspace(workspaceId: string): Promise<void> {
    const workspace = await settingsStore.get<Workspace>(`workspace:${workspaceId}`);
    if (!workspace) {
      throw new Error(`Workspace not found: ${workspaceId}`);
    }
    
    // Close all current windows
    const currentWindows = Array.from(windowManager.windows.keys());
    currentWindows.forEach(winId => windowManager.closeWindow(winId));
    
    // Restore windows
    workspace.windows.forEach(winData => {
      windowManager.openWindow({
        appId: winData.appId,
        title: winData.title,
        bounds: winData.bounds,
        payload: winData.payload,
      });
      
      // Restore window state
      const restoredWin = Array.from(windowManager.windows.values())
        .find(w => w.appId === winData.appId && w.title === winData.title);
      
      if (restoredWin) {
        if (winData.state === 'maximized') {
          windowManager.maximizeWindow(restoredWin.id);
        } else if (winData.state === 'minimized') {
          windowManager.minimizeWindow(restoredWin.id);
        }
      }
    });
    
    this.currentWorkspaceId = workspaceId;
  }
  
  async listWorkspaces(): Promise<string[]> {
    const list = await settingsStore.get<string[]>('workspace:list') || [];
    return list;
  }
  
  private async addToWorkspaceList(workspaceId: string): Promise<void> {
    const list = await this.listWorkspaces();
    if (!list.includes(workspaceId)) {
      list.push(workspaceId);
      await settingsStore.set('workspace:list', list);
    }
  }
  
  async deleteWorkspace(workspaceId: string): Promise<void> {
    await settingsStore.delete(`workspace:${workspaceId}`);
    const list = await this.listWorkspaces();
    const filtered = list.filter(id => id !== workspaceId);
    await settingsStore.set('workspace:list', filtered);
  }
  
  getCurrentWorkspaceId(): string {
    return this.currentWorkspaceId;
  }
}

export const workspaceManager = new WorkspaceManager();

export async function saveWorkspace(name?: string): Promise<string> {
  return workspaceManager.saveWorkspace(name);
}

export async function loadWorkspace(workspaceId: string): Promise<void> {
  return workspaceManager.loadWorkspace(workspaceId);
}

export async function listWorkspaces(): Promise<string[]> {
  return workspaceManager.listWorkspaces();
}

export async function deleteWorkspace(workspaceId: string): Promise<void> {
  return workspaceManager.deleteWorkspace(workspaceId);
}

export function getCurrentWorkspaceId(): string {
  return workspaceManager.getCurrentWorkspaceId();
}
