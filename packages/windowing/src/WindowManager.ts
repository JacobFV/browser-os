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
  private staggerCounter: number = 0;

  constructor(options?: WindowManagerOptions) {
    this.registry = new WindowRegistry();
    this.eventBus = options?.eventBus ?? new EventBus();
  }

  /**
   * Stagger new windows around (60..420, 50..400) in 32-pixel steps so they
   * don't all land on top of each other.
   */
  private nextStagger(): { x: number; y: number } {
    const i = this.staggerCounter++;
    const step = 32;
    const cycle = 8; // wrap after 8 windows
    const offset = (i % cycle) * step;
    return { x: 60 + offset, y: 50 + offset };
  }

  /**
   * Pick a spawn position that overlaps the already-open windows as little as
   * possible — real users put two apps side-by-side to see both, rather than
   * letting windows cascade into a single pile. Scores anchored slots
   * (halves, then corners, then center) against open normal/maximized windows
   * and takes the least-occluded one; cascades only when nothing is open.
   */
  private pickSlot(width: number, height: number): { x: number; y: number } {
    const TASKBAR = 56, MARGIN = 12, TOP = 8;
    const vw = (typeof window !== 'undefined' && window.innerWidth) || 1440;
    const vh = (typeof window !== 'undefined' && window.innerHeight) || 900;
    const left = MARGIN;
    const right = Math.max(MARGIN, vw - MARGIN - width);
    const top = TOP;
    const bottom = Math.max(top, vh - TASKBAR - height);
    const midX = Math.round((left + right) / 2);
    const midY = Math.round((top + bottom) / 2);
    const open = this.registry.getAll().filter((w) => w.state !== 'minimized');
    if (open.length === 0) return this.nextStagger();
    const cands = [
      { x: left, y: top }, { x: right, y: top },
      { x: left, y: bottom }, { x: right, y: bottom },
      { x: midX, y: top }, { x: midX, y: midY },
    ];
    const ov = (ax: number, ay: number, w: { x: number; y: number; width: number; height: number }) => {
      const ix = Math.max(0, Math.min(ax + width, w.x + w.width) - Math.max(ax, w.x));
      const iy = Math.max(0, Math.min(ay + height, w.y + w.height) - Math.max(ay, w.y));
      return ix * iy;
    };
    let best = cands[0], bestScore = Infinity;
    for (const c of cands) {
      let score = 0;
      for (const w of open) score += ov(c.x, c.y, w);
      if (score < bestScore) { bestScore = score; best = c; }
      if (score === 0) break;
    }
    return best;
  }

  /**
   * Create a new window
   */
  createWindow(options: WindowOptions): string {
    const windowId = `window-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const stagger = this.pickSlot(options.width ?? 1100, options.height ?? 720);

    const window: Window = {
      id: windowId,
      title: options.title,
      x: options.x ?? stagger.x,
      y: options.y ?? stagger.y,
      width: options.width ?? 1100,
      height: options.height ?? 720,
      minWidth: options.minWidth ?? 500,
      minHeight: options.minHeight ?? 400,
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
   * Get windows by app ID (across all workspaces)
   */
  getWindowsByApp(appId: string): Window[] {
    return this.registry.getAll().filter((w) => w.appId === appId);
  }

  /**
   * Close all windows for an app (across all workspaces)
   */
  closeAllWindowsForApp(appId: string): void {
    const windows = this.getWindowsByApp(appId);
    windows.forEach((window) => {
      this.destroyWindow(window.id);
    });
  }

  /**
   * Get the registry (for internal use)
   */
  getRegistry(): WindowRegistry {
    return this.registry;
  }
}

