import type { WindowManager } from '@browser-os/windowing';
import type { ProcessManager } from '@browser-os/proc';
import type { SyscallHandler } from '../types';

export function createWindowSyscalls(
  windowManager: WindowManager,
  procManager: ProcessManager
): Record<string, SyscallHandler> {
  /**
   * Check if a process owns a window
   */
  function ownsWindow(pid: number, windowId: string): boolean {
    const window = windowManager.getWindow(windowId);
    if (!window) {
      return false;
    }

    // Get process to check appId
    const process = procManager.get(pid);
    if (!process) {
      return false;
    }

    // Process name is set to appId when spawned
    return window.appId === process.name;
  }

  return {
    'window.create': async (args, context) => {
      const options = args.options as {
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
        resizable?: boolean;
        movable?: boolean;
        closable?: boolean;
        minimizable?: boolean;
        maximizable?: boolean;
      };

      if (!options?.title) {
        throw new Error('title required');
      }
      if (!options.workspaceId) {
        throw new Error('workspaceId required');
      }

      // Get process to get appId
      const process = procManager.get(context.pid);
      if (!process) {
        throw new Error('Process not found');
      }

      const windowId = windowManager.createWindow({
        title: options.title,
        x: options.x,
        y: options.y,
        width: options.width,
        height: options.height,
        minWidth: options.minWidth,
        minHeight: options.minHeight,
        maxWidth: options.maxWidth,
        maxHeight: options.maxHeight,
        workspaceId: options.workspaceId,
        appId: process.name, // Process name is appId
        resizable: options.resizable,
        movable: options.movable,
        closable: options.closable,
        minimizable: options.minimizable,
        maximizable: options.maximizable,
      });

      return { windowId };
    },

    'window.get': async (args, context) => {
      const windowId = args.windowId as string;
      if (!windowId) {
        throw new Error('windowId required');
      }

      // Check ownership
      if (!ownsWindow(context.pid, windowId)) {
        throw new Error('Permission denied: window does not belong to this process');
      }

      const window = windowManager.getWindow(windowId);
      if (!window) {
        return null;
      }

      // Return serializable window data
      return {
        id: window.id,
        title: window.title,
        x: window.x,
        y: window.y,
        width: window.width,
        height: window.height,
        minWidth: window.minWidth,
        minHeight: window.minHeight,
        maxWidth: window.maxWidth,
        maxHeight: window.maxHeight,
        state: window.state,
        workspaceId: window.workspaceId,
        appId: window.appId,
        resizable: window.resizable,
        movable: window.movable,
        closable: window.closable,
        minimizable: window.minimizable,
        maximizable: window.maximizable,
      };
    },

    'window.update': async (args, context) => {
      const windowId = args.windowId as string;
      const updates = args.updates as Partial<{
        title: string;
        x: number;
        y: number;
        width: number;
        height: number;
        minWidth: number;
        minHeight: number;
        maxWidth: number;
        maxHeight: number;
        resizable: boolean;
        movable: boolean;
        closable: boolean;
        minimizable: boolean;
        maximizable: boolean;
      }>;

      if (!windowId) {
        throw new Error('windowId required');
      }

      // Check ownership
      if (!ownsWindow(context.pid, windowId)) {
        throw new Error('Permission denied: window does not belong to this process');
      }

      windowManager.updateWindow(windowId, updates);
      return null;
    },

    'window.close': async (args, context) => {
      const windowId = args.windowId as string;
      if (!windowId) {
        throw new Error('windowId required');
      }

      // Check ownership
      if (!ownsWindow(context.pid, windowId)) {
        throw new Error('Permission denied: window does not belong to this process');
      }

      windowManager.destroyWindow(windowId);
      return null;
    },

    'window.minimize': async (args, context) => {
      const windowId = args.windowId as string;
      if (!windowId) {
        throw new Error('windowId required');
      }

      // Check ownership
      if (!ownsWindow(context.pid, windowId)) {
        throw new Error('Permission denied: window does not belong to this process');
      }

      windowManager.minimizeWindow(windowId);
      return null;
    },

    'window.maximize': async (args, context) => {
      const windowId = args.windowId as string;
      if (!windowId) {
        throw new Error('windowId required');
      }

      // Check ownership
      if (!ownsWindow(context.pid, windowId)) {
        throw new Error('Permission denied: window does not belong to this process');
      }

      windowManager.maximizeWindow(windowId);
      return null;
    },

    'window.restore': async (args, context) => {
      const windowId = args.windowId as string;
      if (!windowId) {
        throw new Error('windowId required');
      }

      // Check ownership
      if (!ownsWindow(context.pid, windowId)) {
        throw new Error('Permission denied: window does not belong to this process');
      }

      windowManager.restoreWindow(windowId);
      return null;
    },

    'window.focus': async (args, context) => {
      const windowId = args.windowId as string;
      if (!windowId) {
        throw new Error('windowId required');
      }

      // Check ownership
      if (!ownsWindow(context.pid, windowId)) {
        throw new Error('Permission denied: window does not belong to this process');
      }

      windowManager.focusWindow(windowId);
      return null;
    },
  };
}

