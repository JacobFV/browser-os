import { WindowState, WindowBounds, createId } from '@browser-os/core';
import { eventBus } from '@browser-os/core';
import { Window } from './Window';

// Re-export Window class
export { Window };

export interface WindowManager {
  windows: Map<string, Window>;
  focusedWindowId: string | null;
  nextZ: number;
}

class WindowManagerImpl implements WindowManager {
  windows: Map<string, Window> = new Map();
  focusedWindowId: string | null = null;
  nextZ: number = 1;

  openWindow(options: {
    appId: string;
    title: string;
    bounds?: WindowBounds;
    workspaceId?: string;
    payload?: Record<string, any>;
  }): Window {
    // Create Window instance (apps will create their own, but this is for backward compat)
    const window = new Window(
      options.appId,
      options.title,
      options.bounds || { x: 100, y: 100, w: 800, h: 600 },
      options.workspaceId || 'default',
      options.payload
    );
    
    window.setZ(this.nextZ++, 'os');
    this.windows.set(window.id, window);
    this.focusWindow(window.id);
    
    eventBus.emit('window', { type: 'open', winId: window.id, appId: options.appId });
    
    return window;
  }
  
  /**
   * Register a window created by an app
   */
  registerWindow(window: Window): void {
    window.setZ(this.nextZ++, 'os');
    this.windows.set(window.id, window);
    this.focusWindow(window.id);
    eventBus.emit('window', { type: 'open', winId: window.id, appId: window.appId });
  }

  closeWindow(winId: string): void {
    const window = this.windows.get(winId);
    if (window) {
      this.windows.delete(winId);
      if (this.focusedWindowId === winId) {
        this.focusedWindowId = null;
      }
      eventBus.emit('window', { type: 'close', winId });
    }
  }

  focusWindow(winId: string): void {
    const window = this.windows.get(winId);
    if (window) {
      if (this.focusedWindowId !== winId) {
        if (this.focusedWindowId) {
          eventBus.emit('window', { type: 'blur', winId: this.focusedWindowId });
        }
        this.focusedWindowId = winId;
        window.setZ(this.nextZ++, 'os');
        eventBus.emit('window', { type: 'focus', winId });
      }
    }
  }

  moveWindow(winId: string, x: number, y: number): void {
    const window = this.windows.get(winId);
    if (window) {
      window.moveTo(x, y, 'os');
    }
  }

  resizeWindow(winId: string, w: number, h: number): void {
    const window = this.windows.get(winId);
    if (window) {
      window.resizeTo(w, h, 'os');
    }
  }

  minimizeWindow(winId: string): void {
    const window = this.windows.get(winId);
    if (window) {
      window.minimize('os');
    }
  }

  maximizeWindow(winId: string): void {
    const window = this.windows.get(winId);
    if (window) {
      window.maximize('os');
    }
  }

  restoreWindow(winId: string): void {
    const window = this.windows.get(winId);
    if (window) {
      window.restore('os');
    }
  }

  setWindowState(winId: string, state: WindowState): void {
    const window = this.windows.get(winId);
    if (window) {
      window.setState(state, 'os');
    }
  }

  updateWindowTitle(winId: string, title: string): void {
    const window = this.windows.get(winId);
    if (window) {
      window.setTitle(title, 'os');
    }
  }

  getWindowsForWorkspace(workspaceId: string): Window[] {
    return Array.from(this.windows.values())
      .filter(w => w.workspaceId === workspaceId)
      .sort((a, b) => b.z - a.z);
  }
  
  /**
   * Get window by ID
   */
  getWindow(winId: string): Window | undefined {
    return this.windows.get(winId);
  }
}

export const windowManager = new WindowManagerImpl();

export function openWindow(options: {
  appId: string;
  title: string;
  bounds?: WindowBounds;
  workspaceId?: string;
  payload?: Record<string, any>;
}): Window {
  return windowManager.openWindow(options);
}

export function closeWindow(winId: string): void {
  windowManager.closeWindow(winId);
}

export function focusWindow(winId: string): void {
  windowManager.focusWindow(winId);
}

export function updateWindowTitle(winId: string, title: string): void {
  windowManager.updateWindowTitle(winId, title);
}

export function arrangeWindows(pattern: 'grid-2x2' | 'stack-right' | 'monocle'): void {
  const windows = Array.from(windowManager.windows.values())
    .filter(w => w.state === 'floating')
    .sort((a, b) => b.z - a.z);
  
  if (windows.length === 0) return;

  const screenW = window.innerWidth;
  const screenH = window.innerHeight;

  if (pattern === 'grid-2x2') {
    const cols = 2;
    const rows = Math.ceil(windows.length / cols);
    const cellW = screenW / cols;
    const cellH = screenH / rows;
    
    windows.forEach((win, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      windowManager.moveWindow(win.id, col * cellW, row * cellH);
      windowManager.resizeWindow(win.id, cellW, cellH);
    });
  } else if (pattern === 'stack-right') {
    const mainW = screenW * 0.7;
    const sideW = screenW * 0.3;
    const sideH = screenH / Math.max(1, windows.length - 1);
    
    windows.forEach((win, i) => {
      if (i === 0) {
        windowManager.moveWindow(win.id, 0, 0);
        windowManager.resizeWindow(win.id, mainW, screenH);
      } else {
        windowManager.moveWindow(win.id, mainW, (i - 1) * sideH);
        windowManager.resizeWindow(win.id, sideW, sideH);
      }
    });
  } else if (pattern === 'monocle') {
    windows.forEach((win) => {
      windowManager.moveWindow(win.id, 0, 0);
      windowManager.resizeWindow(win.id, screenW, screenH);
    });
  }
}

