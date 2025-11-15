import type { Window } from '@browser-os/schemas';

export interface WindowOptions {
  title: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  workspaceId: string;
  appId?: string;
  resizable?: boolean;
  movable?: boolean;
  closable?: boolean;
  minimizable?: boolean;
  maximizable?: boolean;
}

export interface WindowManager {
  createWindow(options: WindowOptions): string;
  destroyWindow(windowId: string): void;
  focusWindow(windowId: string): void;
  minimizeWindow(windowId: string): void;
  maximizeWindow(windowId: string): void;
  restoreWindow(windowId: string): void;
  getWindow(windowId: string): Window | null;
  getAllWindows(): Window[];
  getWindowsInWorkspace(workspaceId: string): Window[];
  updateWindow(windowId: string, updates: Partial<Window>): void;
}

