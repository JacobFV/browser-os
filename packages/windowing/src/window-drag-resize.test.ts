import { describe, it, expect, beforeEach } from 'vitest';
import { windowManager, openWindow, closeWindow } from './window-manager';
import { eventBus } from '@browser-os/core';

describe('Window Drag and Resize Integration', () => {
  beforeEach(() => {
    const windows = Array.from(windowManager.windows.keys());
    windows.forEach(id => closeWindow(id));
  });

  describe('Window Drag', () => {
    it('should update window position on drag', () => {
      const win = openWindow({
        appId: 'test-app',
        title: 'Test Window',
        bounds: { x: 100, y: 100, w: 400, h: 300 }
      });

      const initialX = win.bounds.x;
      const initialY = win.bounds.y;

      // Simulate drag
      windowManager.moveWindow(win.id, 250, 350);

      const updated = windowManager.windows.get(win.id);
      expect(updated?.bounds.x).toBe(250);
      expect(updated?.bounds.y).toBe(350);
      expect(updated?.bounds.x).not.toBe(initialX);
      expect(updated?.bounds.y).not.toBe(initialY);
    });

    it('should emit move events during drag', () => {
      const win = openWindow({
        appId: 'test-app',
        title: 'Test Window',
        bounds: { x: 100, y: 100, w: 400, h: 300 }
      });

      const events: any[] = [];
      const unsubscribe = eventBus.on('window', (event) => {
        if (event.type === 'move') {
          events.push(event);
        }
      });

      windowManager.moveWindow(win.id, 200, 300);
      windowManager.moveWindow(win.id, 300, 400);
      windowManager.moveWindow(win.id, 400, 500);

      expect(events.length).toBe(3);
      expect(events[0]).toMatchObject({ type: 'move', winId: win.id, x: 200, y: 300 });
      expect(events[1]).toMatchObject({ type: 'move', winId: win.id, x: 300, y: 400 });
      expect(events[2]).toMatchObject({ type: 'move', winId: win.id, x: 400, y: 500 });

      unsubscribe();
    });

    it('should maintain window size during drag', () => {
      const win = openWindow({
        appId: 'test-app',
        title: 'Test Window',
        bounds: { x: 100, y: 100, w: 400, h: 300 }
      });

      const originalWidth = win.bounds.w;
      const originalHeight = win.bounds.h;

      windowManager.moveWindow(win.id, 500, 600);

      const updated = windowManager.windows.get(win.id);
      expect(updated?.bounds.w).toBe(originalWidth);
      expect(updated?.bounds.h).toBe(originalHeight);
    });
  });

  describe('Window Resize', () => {
    it('should update window size on resize', () => {
      const win = openWindow({
        appId: 'test-app',
        title: 'Test Window',
        bounds: { x: 100, y: 100, w: 400, h: 300 }
      });

      const initialWidth = win.bounds.w;
      const initialHeight = win.bounds.h;

      windowManager.resizeWindow(win.id, 600, 500);

      const updated = windowManager.windows.get(win.id);
      expect(updated?.bounds.w).toBe(600);
      expect(updated?.bounds.h).toBe(500);
      expect(updated?.bounds.w).not.toBe(initialWidth);
      expect(updated?.bounds.h).not.toBe(initialHeight);
    });

    it('should emit resize events during resize', () => {
      const win = openWindow({
        appId: 'test-app',
        title: 'Test Window',
        bounds: { x: 100, y: 100, w: 400, h: 300 }
      });

      const events: any[] = [];
      const unsubscribe = eventBus.on('window', (event) => {
        if (event.type === 'resize') {
          events.push(event);
        }
      });

      windowManager.resizeWindow(win.id, 500, 400);
      windowManager.resizeWindow(win.id, 600, 500);
      windowManager.resizeWindow(win.id, 700, 600);

      expect(events.length).toBe(3);
      expect(events[0]).toMatchObject({ type: 'resize', winId: win.id, w: 500, h: 400 });
      expect(events[1]).toMatchObject({ type: 'resize', winId: win.id, w: 600, h: 500 });
      expect(events[2]).toMatchObject({ type: 'resize', winId: win.id, w: 700, h: 600 });

      unsubscribe();
    });

    it('should maintain window position during resize', () => {
      const win = openWindow({
        appId: 'test-app',
        title: 'Test Window',
        bounds: { x: 100, y: 100, w: 400, h: 300 }
      });

      const originalX = win.bounds.x;
      const originalY = win.bounds.y;

      windowManager.resizeWindow(win.id, 600, 500);

      const updated = windowManager.windows.get(win.id);
      expect(updated?.bounds.x).toBe(originalX);
      expect(updated?.bounds.y).toBe(originalY);
    });
  });

  describe('Window Maximize Behavior', () => {
    it('should set window to fullscreen bounds when maximized', () => {
      const win = openWindow({
        appId: 'test-app',
        title: 'Test Window',
        bounds: { x: 100, y: 100, w: 400, h: 300 }
      });

      const originalBounds = { ...win.bounds };

      windowManager.maximizeWindow(win.id);

      const maximized = windowManager.windows.get(win.id);
      expect(maximized?.state).toBe('maximized');
      expect(maximized?.bounds.x).toBe(0);
      expect(maximized?.bounds.y).toBe(0);
      expect(maximized?.bounds.w).toBeGreaterThan(originalBounds.w);
      expect(maximized?.bounds.h).toBeGreaterThan(originalBounds.h);
    });

    it('should restore original bounds when restored from maximized', () => {
      const win = openWindow({
        appId: 'test-app',
        title: 'Test Window',
        bounds: { x: 100, y: 100, w: 400, h: 300 }
      });

      const originalBounds = { ...win.bounds };

      windowManager.maximizeWindow(win.id);
      windowManager.restoreWindow(win.id);

      const restored = windowManager.windows.get(win.id);
      expect(restored?.state).toBe('floating');
      expect(restored?.bounds.x).toBe(originalBounds.x);
      expect(restored?.bounds.y).toBe(originalBounds.y);
      expect(restored?.bounds.w).toBe(originalBounds.w);
      expect(restored?.bounds.h).toBe(originalBounds.h);
    });

    it('should not allow drag/resize when maximized', () => {
      const win = openWindow({
        appId: 'test-app',
        title: 'Test Window',
        bounds: { x: 100, y: 100, w: 400, h: 300 }
      });

      windowManager.maximizeWindow(win.id);
      const maximizedBounds = { ...windowManager.windows.get(win.id)!.bounds };

      // Try to move/resize maximized window
      windowManager.moveWindow(win.id, 200, 300);
      windowManager.resizeWindow(win.id, 500, 400);

      const updated = windowManager.windows.get(win.id);
      // Maximized windows should ignore move/resize
      expect(updated?.bounds.x).toBe(maximizedBounds.x);
      expect(updated?.bounds.y).toBe(maximizedBounds.y);
    });
  });

  describe('Complex Window Interactions', () => {
    it('should handle multiple windows with independent drag/resize', () => {
      const win1 = openWindow({
        appId: 'app1',
        title: 'Window 1',
        bounds: { x: 100, y: 100, w: 400, h: 300 }
      });
      const win2 = openWindow({
        appId: 'app2',
        title: 'Window 2',
        bounds: { x: 200, y: 200, w: 500, h: 400 }
      });

      // Drag win1
      windowManager.moveWindow(win1.id, 300, 400);
      expect(windowManager.windows.get(win1.id)?.bounds.x).toBe(300);
      expect(windowManager.windows.get(win2.id)?.bounds.x).toBe(200); // Unchanged

      // Resize win2
      windowManager.resizeWindow(win2.id, 600, 500);
      expect(windowManager.windows.get(win2.id)?.bounds.w).toBe(600);
      expect(windowManager.windows.get(win1.id)?.bounds.w).toBe(400); // Unchanged

      // Drag win2
      windowManager.moveWindow(win2.id, 500, 600);
      expect(windowManager.windows.get(win2.id)?.bounds.x).toBe(500);
      expect(windowManager.windows.get(win1.id)?.bounds.x).toBe(300); // Unchanged
    });

    it('should maintain z-order during drag operations', () => {
      const win1 = openWindow({ appId: 'app1', title: 'Window 1' });
      const win2 = openWindow({ appId: 'app2', title: 'Window 2' });

      const initialZ1 = win1.z;
      const initialZ2 = win2.z;

      // Drag win1 (should not change z-order)
      windowManager.moveWindow(win1.id, 300, 400);

      expect(windowManager.windows.get(win1.id)?.z).toBe(initialZ1);
      expect(windowManager.windows.get(win2.id)?.z).toBe(initialZ2);
    });

    it('should handle rapid state changes', () => {
      const win = openWindow({
        appId: 'test-app',
        title: 'Test Window',
        bounds: { x: 100, y: 100, w: 400, h: 300 }
      });

      // Rapid state changes
      windowManager.minimizeWindow(win.id);
      expect(windowManager.windows.get(win.id)?.state).toBe('minimized');

      windowManager.restoreWindow(win.id);
      expect(windowManager.windows.get(win.id)?.state).toBe('floating');

      windowManager.maximizeWindow(win.id);
      expect(windowManager.windows.get(win.id)?.state).toBe('maximized');

      windowManager.restoreWindow(win.id);
      expect(windowManager.windows.get(win.id)?.state).toBe('floating');

      windowManager.minimizeWindow(win.id);
      expect(windowManager.windows.get(win.id)?.state).toBe('minimized');
    });
  });
});

