import { EventBus } from '@browser-os/events';
import type { Workspace } from '@browser-os/schemas';
import { WorkspaceSchema } from '@browser-os/schemas';
import type { WindowManager } from '@browser-os/windowing';
import type { WorkspaceManager as IWorkspaceManager } from './types';

export interface WorkspaceManagerOptions {
  eventBus?: EventBus;
  windowManager: WindowManager;
  initialWorkspaceCount?: number;
}

/**
 * Manages multiple workspaces
 */
export class WorkspaceManager implements IWorkspaceManager {
  private workspaces: Map<string, Workspace> = new Map();
  private activeWorkspaceId: string | null = null;
  private eventBus: EventBus;
  private windowManager: WindowManager;

  constructor(options: WorkspaceManagerOptions) {
    this.eventBus = options.eventBus ?? new EventBus();
    this.windowManager = options.windowManager;

    // Create initial workspaces (default: 4)
    const count = options.initialWorkspaceCount ?? 4;
    for (let i = 0; i < count; i++) {
      this.createWorkspace(`Workspace ${i + 1}`);
    }

    // Set first workspace as active
    const firstWorkspace = Array.from(this.workspaces.values())[0];
    if (firstWorkspace) {
      this.activeWorkspaceId = firstWorkspace.id;
    }
  }

  /**
   * Create a new workspace
   */
  createWorkspace(name?: string): string {
    const workspaceId = `workspace-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const index = this.workspaces.size;

    const workspace: Workspace = {
      id: workspaceId,
      name: name ?? `Workspace ${index + 1}`,
      index,
    };

    this.workspaces.set(workspaceId, workspace);
    this.eventBus.emit('workspace:created', { workspace }, { source: 'workspace' });

    return workspaceId;
  }

  /**
   * Switch to a workspace
   */
  switchWorkspace(workspaceId: string): void {
    if (!this.workspaces.has(workspaceId)) {
      throw new Error(`Workspace ${workspaceId} not found`);
    }

    const previousWorkspaceId = this.activeWorkspaceId;
    this.activeWorkspaceId = workspaceId;

    this.eventBus.emit('workspace:switched', { workspaceId, previousWorkspaceId }, { source: 'workspace' });
  }

  /**
   * Get the active workspace ID
   */
  getActiveWorkspace(): string {
    if (!this.activeWorkspaceId) {
      throw new Error('No active workspace');
    }
    return this.activeWorkspaceId;
  }

  /**
   * Get a workspace by ID
   */
  getWorkspace(workspaceId: string): Workspace | null {
    return this.workspaces.get(workspaceId) ?? null;
  }

  /**
   * Get all workspaces
   */
  getAllWorkspaces(): Workspace[] {
    return Array.from(this.workspaces.values());
  }

  /**
   * Move a window to a different workspace
   */
  moveWindowToWorkspace(windowId: string, workspaceId: string): void {
    if (!this.workspaces.has(workspaceId)) {
      throw new Error(`Workspace ${workspaceId} not found`);
    }

    const window = this.windowManager.getWindow(windowId);
    if (window) {
      this.windowManager.updateWindow(windowId, { workspaceId });
      this.eventBus.emit('workspace:windowMoved', { windowId, workspaceId }, { source: 'workspace' });
    }
  }

  /**
   * Switch workspace by index (for keyboard shortcuts)
   */
  switchWorkspaceByIndex(index: number): void {
    const workspace = Array.from(this.workspaces.values()).find((w) => w.index === index);
    if (workspace) {
      this.switchWorkspace(workspace.id);
    }
  }
}

