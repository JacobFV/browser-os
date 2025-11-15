import type { Window } from '@browser-os/schemas';
import { WindowSchema } from '@browser-os/schemas';

/**
 * Registry that tracks all windows and manages z-index ordering
 */
export class WindowRegistry {
  private windows: Map<string, Window> = new Map();
  private nextZIndex: number = 1;

  /**
   * Add a window to the registry
   */
  add(window: Window): void {
    const validated = WindowSchema.parse(window);
    this.windows.set(validated.id, validated);
  }

  /**
   * Remove a window from the registry
   */
  remove(windowId: string): void {
    this.windows.delete(windowId);
  }

  /**
   * Get a window by ID
   */
  get(windowId: string): Window | null {
    return this.windows.get(windowId) ?? null;
  }

  /**
   * Get all windows
   */
  getAll(): Window[] {
    return Array.from(this.windows.values());
  }

  /**
   * Get windows in a specific workspace
   */
  getByWorkspace(workspaceId: string): Window[] {
    return Array.from(this.windows.values()).filter((w) => w.workspaceId === workspaceId);
  }

  /**
   * Get the next z-index value
   */
  getNextZIndex(): number {
    return this.nextZIndex++;
  }

  /**
   * Bring window to front (highest z-index)
   */
  bringToFront(windowId: string): void {
    const window = this.windows.get(windowId);
    if (window) {
      window.zIndex = this.getNextZIndex();
    }
  }

  /**
   * Update window properties
   */
  update(windowId: string, updates: Partial<Window>): void {
    const window = this.windows.get(windowId);
    if (window) {
      Object.assign(window, updates);
      const validated = WindowSchema.parse(window);
      this.windows.set(windowId, validated);
    }
  }
}

