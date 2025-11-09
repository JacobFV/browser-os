import { WindowManager } from '@browser-os/windowing';
import { Window } from '@browser-os/windowing';
import { SettingsStoreImpl } from '@browser-os/settings';

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

export class WorkspaceManager {
  private currentWorkspaceId: string = 'default';
  private windowManager: WindowManager;
  private settingsStore: SettingsStoreImpl;
  
  constructor(windowManager: WindowManager, settingsStore: SettingsStoreImpl) {
    this.windowManager = windowManager;
    this.settingsStore = settingsStore;
  }
  
  async saveWorkspace(name?: string): Promise<string> {
    const workspaceId = name || `workspace-${Date.now()}`;
    const windows = Array.from(this.windowManager.windows.values());
    
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
    
    await this.settingsStore.set(`workspace:${workspaceId}`, workspace);
    await this.addToWorkspaceList(workspaceId);
    
    return workspaceId;
  }
  
  async loadWorkspace(workspaceId: string): Promise<void> {
    const workspace = await this.settingsStore.get<Workspace>(`workspace:${workspaceId}`);
    if (!workspace) {
      throw new Error(`Workspace not found: ${workspaceId}`);
    }
    
    // Close all current windows
    const currentWindows = Array.from(this.windowManager.windows.keys());
    currentWindows.forEach(winId => this.windowManager.closeWindow(winId));
    
    // Restore windows
    workspace.windows.forEach((winData: {
      appId: string;
      title: string;
      bounds: { x: number; y: number; w: number; h: number };
      state: string;
      payload?: Record<string, any>;
    }) => {
      this.windowManager.openWindow({
        appId: winData.appId,
        title: winData.title,
        bounds: winData.bounds,
        payload: winData.payload,
      });
      
      // Restore window state
      const restoredWin = Array.from(this.windowManager.windows.values())
        .find(w => w.appId === winData.appId && w.title === winData.title);
      
      if (restoredWin) {
        if (winData.state === 'maximized') {
          this.windowManager.maximizeWindow(restoredWin.id);
        } else if (winData.state === 'minimized') {
          this.windowManager.minimizeWindow(restoredWin.id);
        }
      }
    });
    
    this.currentWorkspaceId = workspaceId;
  }
  
  async listWorkspaces(): Promise<string[]> {
    const list = await this.settingsStore.get<string[]>('workspace:list') || [];
    return list;
  }
  
  private async addToWorkspaceList(workspaceId: string): Promise<void> {
    const list = await this.listWorkspaces();
    if (!list.includes(workspaceId)) {
      list.push(workspaceId);
      await this.settingsStore.set('workspace:list', list);
    }
  }
  
  async deleteWorkspace(workspaceId: string): Promise<void> {
    await this.settingsStore.delete(`workspace:${workspaceId}`);
    const list = await this.listWorkspaces();
    const filtered = list.filter(id => id !== workspaceId);
    await this.settingsStore.set('workspace:list', filtered);
  }
  
  getCurrentWorkspaceId(): string {
    return this.currentWorkspaceId;
  }
}

// WorkspaceManager is exported as a class - instances should be created via dependency injection
export { WorkspaceManager };
