import type { Workspace } from '@browser-os/schemas';
import React from 'react';

export interface WorkspaceManager {
  createWorkspace(name?: string): string;
  switchWorkspace(workspaceId: string): void;
  getActiveWorkspace(): string;
  getWorkspace(workspaceId: string): Workspace | null;
  getAllWorkspaces(): Workspace[];
  moveWindowToWorkspace(windowId: string, workspaceId: string): void;
}

export interface AppComponentProps {
  windowId: string;
  [key: string]: any;
}

export type AppComponent = React.ComponentType<AppComponentProps>;

export interface AppComponentRegistry {
  registerAppComponent(appId: string, component: AppComponent): void;
  getAppComponent(appId: string): AppComponent | null;
  hasAppComponent(appId: string): boolean;
  unregisterAppComponent(appId: string): void;
}

