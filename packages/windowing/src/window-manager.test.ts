import { describe, it, expect, beforeEach } from 'vitest';
import { windowManager, openWindow, closeWindow, Window } from './window-manager';
import { eventBus } from '@browser-os/core';

describe('Window Manager', () => {
  beforeEach(() => {
    // Clear all windows before each test
    const windows = Array.from(windowManager.windows.keys());
    windows.forEach(id => closeWindow(id));
  });

  describe('openWindow', () => {
    it('should create a new window', () => {
      const win = openWindow({
        appId: 'test-app',
        title: 'Test Window',
      });

      expect(win).toBeDefined();
      expect(win.id).toBeTruthy();
      expect(win.appId).toBe('test-app');
      expect(win.title).toBe('Test Window');
      expect(win.state).toBe('floating');
      expect(windowManager.windows.has(win.id)).toBe(true);
    });

    it('should set default bounds if not provided', () => {
      const win = openWindow({
        appId: 'test-app',
        title: 'Test Window',
      });

      expect(win.bounds.x).toBe(100);
      expect(win.bounds.y).toBe(100);
      expect(win.bounds.w).toBe(800);
      expect(win.bounds.h).toBe(600);
    });

    it('should use provided bounds', () => {
      const win = openWindow({
        appId: 'test-app',
        title: 'Test Window',
        bounds: { x: 50, y: 50, w: 400, h: 300 },
      });

      expect(win.bounds.x).toBe(50);
      expect(win.bounds.y).toBe(50);
      expect(win.bounds.w).toBe(400);
      expect(win.bounds.h).toBe(300);
    });

    it('should emit window open event', () => {
      let eventReceived = false;
      const unsubscribe = eventBus.on('window', (event) => {
        if (event.type === 'open') {
          eventReceived = true;
        }
      });

      openWindow({
        appId: 'test-app',
        title: 'Test Window',
      });

      expect(eventReceived).toBe(true);
      unsubscribe();
    });

    it('should focus the new window', () => {
      const win = openWindow({
        appId: 'test-app',
        title: 'Test Window',
      });

      expect(windowManager.focusedWindowId).toBe(win.id);
    });

    it('should increment z-index for new windows', () => {
      const win1 = openWindow({
        appId: 'test-app',
        title: 'Window 1',
      });
      const win2 = openWindow({
        appId: 'test-app',
        title: 'Window 2',
      });

      expect(win2.z).toBeGreaterThan(win1.z);
    });
  });

  describe('closeWindow', () => {
    it('should remove window from manager', () => {
      const win = openWindow({
        appId: 'test-app',
        title: 'Test Window',
      });

      closeWindow(win.id);

      expect(windowManager.windows.has(win.id)).toBe(false);
    });

    it('should emit window close event', () => {
      const win = openWindow({
        appId: 'test-app',
        title: 'Test Window',
      });

      let eventReceived = false;
      const unsubscribe = eventBus.on('window', (event) => {
        if (event.type === 'close' && event.winId === win.id) {
          eventReceived = true;
        }
      });

      closeWindow(win.id);

      expect(eventReceived).toBe(true);
      unsubscribe();
    });

    it('should clear focused window if it was focused', () => {
      const win = openWindow({
        appId: 'test-app',
        title: 'Test Window',
      });

      expect(windowManager.focusedWindowId).toBe(win.id);
      closeWindow(win.id);
      expect(windowManager.focusedWindowId).toBeNull();
    });
  });

  describe('focusWindow', () => {
    it('should focus a window', () => {
      const win1 = openWindow({
        appId: 'test-app',
        title: 'Window 1',
      });
      const win2 = openWindow({
        appId: 'test-app',
        title: 'Window 2',
      });

      windowManager.focusWindow(win1.id);

      expect(windowManager.focusedWindowId).toBe(win1.id);
      expect(win1.z).toBeGreaterThan(win2.z);
    });

    it('should emit focus event when switching focus', () => {
      const win1 = openWindow({
        appId: 'test-app',
        title: 'Window 1',
      });
      const win2 = openWindow({
        appId: 'test-app',
        title: 'Window 2',
      });

      let eventReceived = false;
      const unsubscribe = eventBus.on('window', (event) => {
        if (event.type === 'focus' && event.winId === win1.id) {
          eventReceived = true;
        }
      });

      windowManager.focusWindow(win1.id);

      expect(eventReceived).toBe(true);
      unsubscribe();
    });
  });

  describe('moveWindow', () => {
    it('should update window position', () => {
      const win = openWindow({
        appId: 'test-app',
        title: 'Test Window',
      });

      windowManager.moveWindow(win.id, 200, 300);

      const updatedWin = windowManager.windows.get(win.id);
      expect(updatedWin?.bounds.x).toBe(200);
      expect(updatedWin?.bounds.y).toBe(300);
    });

    it('should emit move event', () => {
      const win = openWindow({
        appId: 'test-app',
        title: 'Test Window',
      });

      let eventReceived = false;
      const unsubscribe = eventBus.on('window', (event) => {
        if (event.type === 'move' && event.winId === win.id) {
          eventReceived = true;
        }
      });

      windowManager.moveWindow(win.id, 200, 300);

      expect(eventReceived).toBe(true);
      unsubscribe();
    });
  });

  describe('resizeWindow', () => {
    it('should update window size', () => {
      const win = openWindow({
        appId: 'test-app',
        title: 'Test Window',
      });

      windowManager.resizeWindow(win.id, 500, 400);

      const updatedWin = windowManager.windows.get(win.id);
      expect(updatedWin?.bounds.w).toBe(500);
      expect(updatedWin?.bounds.h).toBe(400);
    });

    it('should emit resize event', () => {
      const win = openWindow({
        appId: 'test-app',
        title: 'Test Window',
      });

      let eventReceived = false;
      const unsubscribe = eventBus.on('window', (event) => {
        if (event.type === 'resize' && event.winId === win.id) {
          eventReceived = true;
        }
      });

      windowManager.resizeWindow(win.id, 500, 400);

      expect(eventReceived).toBe(true);
      unsubscribe();
    });
  });

  describe('minimizeWindow', () => {
    it('should set window state to minimized', () => {
      const win = openWindow({
        appId: 'test-app',
        title: 'Test Window',
      });

      windowManager.minimizeWindow(win.id);

      const updatedWin = windowManager.windows.get(win.id);
      expect(updatedWin?.state).toBe('minimized');
    });

    it('should emit minimize event', () => {
      const win = openWindow({
        appId: 'test-app',
        title: 'Test Window',
      });

      let eventReceived = false;
      const unsubscribe = eventBus.on('window', (event) => {
        if (event.type === 'minimize' && event.winId === win.id) {
          eventReceived = true;
        }
      });

      windowManager.minimizeWindow(win.id);

      expect(eventReceived).toBe(true);
      unsubscribe();
    });
  });

  describe('maximizeWindow', () => {
    it('should set window state to maximized', () => {
      const win = openWindow({
        appId: 'test-app',
        title: 'Test Window',
      });

      windowManager.maximizeWindow(win.id);

      const updatedWin = windowManager.windows.get(win.id);
      expect(updatedWin?.state).toBe('maximized');
    });

    it('should emit maximize event', () => {
      const win = openWindow({
        appId: 'test-app',
        title: 'Test Window',
      });

      let eventReceived = false;
      const unsubscribe = eventBus.on('window', (event) => {
        if (event.type === 'maximize' && event.winId === win.id) {
          eventReceived = true;
        }
      });

      windowManager.maximizeWindow(win.id);

      expect(eventReceived).toBe(true);
      unsubscribe();
    });
  });
});

