import type { Workspace } from '@browser-os/schemas';

export interface WorkspaceManager {
  createWorkspace(name?: string): string;
  switchWorkspace(workspaceId: string): void;
  getActiveWorkspace(): string;
  getWorkspace(workspaceId: string): Workspace | null;
  getAllWorkspaces(): Workspace[];
  moveWindowToWorkspace(windowId: string, workspaceId: string): void;
}

