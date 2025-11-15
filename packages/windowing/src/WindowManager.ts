import { EventBus } from '@browser-os/events';
import type { Window } from '@browser-os/schemas';
import { WindowRegistry } from './WindowRegistry';
import type { WindowOptions, WindowManager as IWindowManager } from './types';

export interface WindowManagerOptions {
  eventBus?: EventBus;
}

/**
 * Manages all windows - creation, destruction, focus, state changes
 */
export class WindowManager implements IWindowManager {
  private registry: WindowRegistry;
  private eventBus: EventBus;

  constructor(options?: WindowManagerOptions) {
    this.registry = new WindowRegistry();
    this.eventBus = options?.eventBus ?? new EventBus();
  }

  /**
   * Create a new window
   */
  createWindow(options: WindowOptions): string {
    const windowId = `window-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    
    const window: Window = {
      id: windowId,
      title: options.title,
      x: options.x ?? 100,
      y: options.y ?? 100,
      width: options.width ?? 800,
      height: options.height ?? 600,
      minWidth: options.minWidth ?? 200,
      minHeight: options.minHeight ?? 150,
      maxWidth: options.maxWidth,
      maxHeight: options.maxHeight,
      zIndex: this.registry.getNextZIndex(),
      state: 'normal',
      workspaceId: options.workspaceId,
      appId: options.appId,
      resizable: options.resizable ?? true,
      movable: options.movable ?? true,
      closable: options.closable ?? true,
      minimizable: options.minimizable ?? true,
      maximizable: options.maximizable ?? true,
    };

    this.registry.add(window);
    this.eventBus.emit('window:created', { window }, { source: 'windowing' });
    this.focusWindow(windowId);

    return windowId;
  }

  /**
   * Destroy a window
   */
  destroyWindow(windowId: string): void {
    const window = this.registry.get(windowId);
    if (window) {
      this.registry.remove(windowId);
      this.eventBus.emit('window:destroyed', { windowId }, { source: 'windowing' });
    }
  }

  /**
   * Focus a window (bring to front)
   */
  focusWindow(windowId: string): void {
    const window = this.registry.get(windowId);
    if (window && window.state !== 'minimized') {
      this.registry.bringToFront(windowId);
      this.eventBus.emit('window:focused', { windowId }, { source: 'windowing' });
    }
  }

  /**
   * Minimize a window
   */
  minimizeWindow(windowId: string): void {
    const window = this.registry.get(windowId);
    if (window && window.minimizable) {
      this.registry.update(windowId, { state: 'minimized' });
      this.eventBus.emit('window:minimized', { windowId }, { source: 'windowing' });
    }
  }

  /**
   * Maximize a window
   */
  maximizeWindow(windowId: string): void {
    const window = this.registry.get(windowId);
    if (window && window.maximizable) {
      this.registry.update(windowId, { state: 'maximized' });
      this.eventBus.emit('window:maximized', { windowId }, { source: 'windowing' });
    }
  }

  /**
   * Restore a window (from minimized or maximized)
   */
  restoreWindow(windowId: string): void {
    const window = this.registry.get(windowId);
    if (window) {
      this.registry.update(windowId, { state: 'normal' });
      this.eventBus.emit('window:restored', { windowId }, { source: 'windowing' });
      this.focusWindow(windowId);
    }
  }

  /**
   * Get a window by ID
   */
  getWindow(windowId: string): Window | null {
    return this.registry.get(windowId);
  }

  /**
   * Get all windows
   */
  getAllWindows(): Window[] {
    return this.registry.getAll();
  }

  /**
   * Get windows in a workspace
   */
  getWindowsInWorkspace(workspaceId: string): Window[] {
    return this.registry.getByWorkspace(workspaceId);
  }

  /**
   * Update window properties
   */
  updateWindow(windowId: string, updates: Partial<Window>): void {
    this.registry.update(windowId, updates);
    this.eventBus.emit('window:updated', { windowId, updates }, { source: 'windowing' });
  }

  /**
   * Get the registry (for internal use)
   */
  getRegistry(): WindowRegistry {
    return this.registry;
  }
}

