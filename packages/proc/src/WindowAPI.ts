/**
 * Window API for processes to create and manipulate windows
 */

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
  resizable?: boolean;
  movable?: boolean;
  closable?: boolean;
  minimizable?: boolean;
  maximizable?: boolean;
}

export interface WindowData {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  maxWidth?: number;
  maxHeight?: number;
  state: 'normal' | 'minimized' | 'maximized';
  workspaceId: string;
  appId?: string;
  resizable: boolean;
  movable: boolean;
  closable: boolean;
  minimizable: boolean;
  maximizable: boolean;
}

/**
 * Window instance with OO interface
 */
export class Window {
  private windowId: string;
  private syscall: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  private cachedState: WindowData | null = null;
  private refreshPromise: Promise<void> | null = null;

  constructor(
    windowId: string,
    syscall: (name: string, args: Record<string, unknown>) => Promise<unknown>
  ) {
    this.windowId = windowId;
    this.syscall = syscall;
  }

  /**
   * Refresh window state from server
   */
  async refresh(): Promise<void> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const result = await this.syscall('window.get', { windowId: this.windowId });
        this.cachedState = result as WindowData;
      } catch (error) {
        console.error(`[Window] Failed to refresh window ${this.windowId}:`, error);
        throw error;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Get current window state (cached or refreshed)
   */
  private async getState(): Promise<WindowData> {
    if (!this.cachedState) {
      await this.refresh();
    }
    if (!this.cachedState) {
      throw new Error(`Window ${this.windowId} not found`);
    }
    return this.cachedState;
  }

  // Sync property getters (use cached state)
  get width(): number {
    return this.cachedState?.width ?? 0;
  }

  set width(value: number) {
    // Fire and forget async update
    this.syscall('window.update', {
      windowId: this.windowId,
      updates: { width: value },
    }).then(() => {
      if (this.cachedState) {
        this.cachedState.width = value;
      }
    }).catch((error) => {
      console.error(`[Window] Failed to set width:`, error);
    });
  }

  get height(): number {
    return this.cachedState?.height ?? 0;
  }

  set height(value: number) {
    this.syscall('window.update', {
      windowId: this.windowId,
      updates: { height: value },
    }).then(() => {
      if (this.cachedState) {
        this.cachedState.height = value;
      }
    }).catch((error) => {
      console.error(`[Window] Failed to set height:`, error);
    });
  }

  get x(): number {
    return this.cachedState?.x ?? 0;
  }

  set x(value: number) {
    this.syscall('window.update', {
      windowId: this.windowId,
      updates: { x: value },
    }).then(() => {
      if (this.cachedState) {
        this.cachedState.x = value;
      }
    }).catch((error) => {
      console.error(`[Window] Failed to set x:`, error);
    });
  }

  get y(): number {
    return this.cachedState?.y ?? 0;
  }

  set y(value: number) {
    this.syscall('window.update', {
      windowId: this.windowId,
      updates: { y: value },
    }).then(() => {
      if (this.cachedState) {
        this.cachedState.y = value;
      }
    }).catch((error) => {
      console.error(`[Window] Failed to set y:`, error);
    });
  }

  get size(): { width: number; height: number } {
    return {
      width: this.cachedState?.width ?? 0,
      height: this.cachedState?.height ?? 0,
    };
  }

  set size(value: { width: number; height: number }) {
    this.syscall('window.update', {
      windowId: this.windowId,
      updates: { width: value.width, height: value.height },
    }).then(() => {
      if (this.cachedState) {
        this.cachedState.width = value.width;
        this.cachedState.height = value.height;
      }
    }).catch((error) => {
      console.error(`[Window] Failed to set size:`, error);
    });
  }

  get position(): { x: number; y: number } {
    return {
      x: this.cachedState?.x ?? 0,
      y: this.cachedState?.y ?? 0,
    };
  }

  set position(value: { x: number; y: number }) {
    this.syscall('window.update', {
      windowId: this.windowId,
      updates: { x: value.x, y: value.y },
    }).then(() => {
      if (this.cachedState) {
        this.cachedState.x = value.x;
        this.cachedState.y = value.y;
      }
    }).catch((error) => {
      console.error(`[Window] Failed to set position:`, error);
    });
  }

  // Async methods for explicit async access
  async getWidth(): Promise<number> {
    const state = await this.getState();
    return state.width;
  }

  async setWidth(width: number): Promise<void> {
    await this.syscall('window.update', {
      windowId: this.windowId,
      updates: { width },
    });
    if (this.cachedState) {
      this.cachedState.width = width;
    }
  }

  async getHeight(): Promise<number> {
    const state = await this.getState();
    return state.height;
  }

  async setHeight(height: number): Promise<void> {
    await this.syscall('window.update', {
      windowId: this.windowId,
      updates: { height },
    });
    if (this.cachedState) {
      this.cachedState.height = height;
    }
  }

  async getX(): Promise<number> {
    const state = await this.getState();
    return state.x;
  }

  async setX(x: number): Promise<void> {
    await this.syscall('window.update', {
      windowId: this.windowId,
      updates: { x },
    });
    if (this.cachedState) {
      this.cachedState.x = x;
    }
  }

  async getY(): Promise<number> {
    const state = await this.getState();
    return state.y;
  }

  async setY(y: number): Promise<void> {
    await this.syscall('window.update', {
      windowId: this.windowId,
      updates: { y },
    });
    if (this.cachedState) {
      this.cachedState.y = y;
    }
  }

  async getSize(): Promise<{ width: number; height: number }> {
    const state = await this.getState();
    return { width: state.width, height: state.height };
  }

  async setSize(size: { width: number; height: number }): Promise<void> {
    await this.syscall('window.update', {
      windowId: this.windowId,
      updates: { width: size.width, height: size.height },
    });
    if (this.cachedState) {
      this.cachedState.width = size.width;
      this.cachedState.height = size.height;
    }
  }

  async getPosition(): Promise<{ x: number; y: number }> {
    const state = await this.getState();
    return { x: state.x, y: state.y };
  }

  async setPosition(position: { x: number; y: number }): Promise<void> {
    await this.syscall('window.update', {
      windowId: this.windowId,
      updates: { x: position.x, y: position.y },
    });
    if (this.cachedState) {
      this.cachedState.x = position.x;
      this.cachedState.y = position.y;
    }
  }

  // Action methods
  async close(): Promise<void> {
    await this.syscall('window.close', { windowId: this.windowId });
    this.cachedState = null;
  }

  async minimize(): Promise<void> {
    await this.syscall('window.minimize', { windowId: this.windowId });
    if (this.cachedState) {
      this.cachedState.state = 'minimized';
    }
  }

  async maximize(): Promise<void> {
    await this.syscall('window.maximize', { windowId: this.windowId });
    if (this.cachedState) {
      this.cachedState.state = 'maximized';
    }
  }

  async focus(): Promise<void> {
    await this.syscall('window.focus', { windowId: this.windowId });
  }

  async restore(): Promise<void> {
    await this.syscall('window.restore', { windowId: this.windowId });
    if (this.cachedState) {
      this.cachedState.state = 'normal';
    }
  }

  /**
   * Get window ID
   */
  get id(): string {
    return this.windowId;
  }
}

/**
 * Window API factory
 */
export class WindowAPI {
  private syscall: (name: string, args: Record<string, unknown>) => Promise<unknown>;

  constructor(syscall: (name: string, args: Record<string, unknown>) => Promise<unknown>) {
    this.syscall = syscall;
  }

  /**
   * Create a new window
   */
  async create(options: WindowOptions): Promise<Window> {
    const result = await this.syscall('window.create', { options }) as { windowId: string };
    const window = new Window(result.windowId, this.syscall);
    // Initial refresh to populate cache
    await window.refresh();
    return window;
  }
}

