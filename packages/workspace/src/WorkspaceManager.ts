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

    // Create initial workspaces (default: 1)
    const count = options.initialWorkspaceCount ?? 1;
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
   * Generate a color for a workspace based on its index
   */
  private generateWorkspaceColor(index: number): string {
    const hues = [0, 30, 60, 120, 180, 210, 270, 300, 330]; // Distinct hues
    const hue = hues[index % hues.length];
    const saturation = 65 + (index % 20);
    const lightness = 45 + ((index * 7) % 15);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
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
      color: this.generateWorkspaceColor(index),
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

  /**
   * Delete a workspace
   */
  deleteWorkspace(workspaceId: string): void {
    if (!this.workspaces.has(workspaceId)) {
      throw new Error(`Workspace ${workspaceId} not found`);
    }

    // Prevent deletion if it's the last workspace
    if (this.workspaces.size <= 1) {
      throw new Error('Cannot delete the last workspace');
    }

    // Check if workspace has windows
    const windows = this.windowManager.getWindowsInWorkspace(workspaceId);
    if (windows.length > 0) {
      throw new Error(`Cannot delete workspace with ${windows.length} window(s)`);
    }

    // If deleting active workspace, switch to another first
    if (this.activeWorkspaceId === workspaceId) {
      const otherWorkspace = Array.from(this.workspaces.values()).find((w) => w.id !== workspaceId);
      if (otherWorkspace) {
        this.switchWorkspace(otherWorkspace.id);
      }
    }

    // Remove workspace and recalculate indices
    this.workspaces.delete(workspaceId);
    
    // Recalculate indices for remaining workspaces
    const remainingWorkspaces = Array.from(this.workspaces.values()).sort((a, b) => {
      // Sort by original index to maintain order
      return a.index - b.index;
    });
    
    remainingWorkspaces.forEach((workspace, newIndex) => {
      workspace.index = newIndex;
    });

    this.eventBus.emit('workspace:deleted', { workspaceId }, { source: 'workspace' });
  }

  /**
   * Rename a workspace
   */
  renameWorkspace(workspaceId: string, newName: string): void {
    if (!this.workspaces.has(workspaceId)) {
      throw new Error(`Workspace ${workspaceId} not found`);
    }

    if (!newName || newName.trim().length === 0) {
      throw new Error('Workspace name cannot be empty');
    }

    if (newName.length > 50) {
      throw new Error('Workspace name cannot exceed 50 characters');
    }

    const workspace = this.workspaces.get(workspaceId);
    if (workspace) {
      workspace.name = newName.trim();
      this.eventBus.emit('workspace:renamed', { workspaceId, newName: workspace.name }, { source: 'workspace' });
    }
  }

  /**
   * Reorder a workspace to a new index
   */
  reorderWorkspace(workspaceId: string, newIndex: number): void {
    if (!this.workspaces.has(workspaceId)) {
      throw new Error(`Workspace ${workspaceId} not found`);
    }

    const allWorkspaces = Array.from(this.workspaces.values()).sort((a, b) => a.index - b.index);
    const maxIndex = allWorkspaces.length - 1;
    
    if (newIndex < 0 || newIndex > maxIndex) {
      throw new Error(`New index ${newIndex} is out of range (0-${maxIndex})`);
    }

    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return;

    const oldIndex = workspace.index;
    
    // Remove workspace from list temporarily
    const otherWorkspaces = allWorkspaces.filter(w => w.id !== workspaceId);
    
    // Insert at new position
    otherWorkspaces.splice(newIndex, 0, workspace);
    
    // Reassign indices
    otherWorkspaces.forEach((w, idx) => {
      w.index = idx;
    });

    this.eventBus.emit('workspace:reordered', { workspaceId, oldIndex, newIndex }, { source: 'workspace' });
  }

  /**
   * Duplicate a workspace (creates new workspace with same name + "Copy")
   */
  duplicateWorkspace(workspaceId: string): string {
    if (!this.workspaces.has(workspaceId)) {
      throw new Error(`Workspace ${workspaceId} not found`);
    }

    const sourceWorkspace = this.workspaces.get(workspaceId);
    if (!sourceWorkspace) {
      throw new Error(`Workspace ${workspaceId} not found`);
    }

    const newName = `${sourceWorkspace.name || 'Workspace'} Copy`;
    return this.createWorkspace(newName);
  }

  /**
   * Update workspace color
   */
  updateWorkspaceColor(workspaceId: string, color: string): void {
    if (!this.workspaces.has(workspaceId)) {
      throw new Error(`Workspace ${workspaceId} not found`);
    }

    const workspace = this.workspaces.get(workspaceId);
    if (workspace) {
      workspace.color = color;
      this.eventBus.emit('workspace:colorUpdated', { workspaceId, color }, { source: 'workspace' });
    }
  }
}

