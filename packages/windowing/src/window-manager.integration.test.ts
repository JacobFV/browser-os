import { describe, it, expect, beforeEach } from 'vitest';
import { windowManager, openWindow, closeWindow } from './window-manager';
import { eventBus } from '@browser-os/core';

describe('Window Manager Integration', () => {
  beforeEach(() => {
    const windows = Array.from(windowManager.windows.keys());
    windows.forEach(id => closeWindow(id));
  });

  describe('Window Focus and Z-Ordering', () => {
    it('should bring window to front when focused', () => {
      const win1 = openWindow({ appId: 'app1', title: 'Window 1' });
      const win2 = openWindow({ appId: 'app2', title: 'Window 2' });
      
      // win2 should be on top initially
      expect(win2.z).toBeGreaterThan(win1.z);
      
      // Focus win1
      windowManager.focusWindow(win1.id);
      const updatedWin1 = windowManager.windows.get(win1.id);
      
      // win1 should now be on top
      expect(updatedWin1?.z).toBeGreaterThan(win2.z);
    });

    it('should maintain correct z-order with multiple windows', () => {
      const win1 = openWindow({ appId: 'app1', title: 'Window 1' });
      const win2 = openWindow({ appId: 'app2', title: 'Window 2' });
      const win3 = openWindow({ appId: 'app3', title: 'Window 3' });
      
      // Initially win3 should be on top
      expect(win3.z).toBeGreaterThan(win2.z);
      expect(win2.z).toBeGreaterThan(win1.z);
      
      // Focus win1
      windowManager.focusWindow(win1.id);
      const updatedWin1 = windowManager.windows.get(win1.id);
      expect(updatedWin1?.z).toBeGreaterThan(win3.z);
      
      // Focus win2
      windowManager.focusWindow(win2.id);
      const updatedWin2 = windowManager.windows.get(win2.id);
      expect(updatedWin2?.z).toBeGreaterThan(updatedWin1!.z);
    });
  });

  describe('Window State Transitions', () => {
    it('should transition from floating to minimized and back', () => {
      const win = openWindow({ appId: 'app1', title: 'Window 1' });
      
      expect(win.state).toBe('floating');
      
      windowManager.minimizeWindow(win.id);
      const minimized = windowManager.windows.get(win.id);
      expect(minimized?.state).toBe('minimized');
      
      windowManager.restoreWindow(win.id);
      const restored = windowManager.windows.get(win.id);
      expect(restored?.state).toBe('floating');
    });

    it('should transition from floating to maximized and back', () => {
      const win = openWindow({ 
        appId: 'app1', 
        title: 'Window 1',
        bounds: { x: 100, y: 100, w: 400, h: 300 }
      });
      
      const originalBounds = { ...win.bounds };
      
      windowManager.maximizeWindow(win.id);
      const maximized = windowManager.windows.get(win.id);
      expect(maximized?.state).toBe('maximized');
      expect(maximized?.bounds.x).toBe(0);
      expect(maximized?.bounds.y).toBe(0);
      
      windowManager.restoreWindow(win.id);
      const restored = windowManager.windows.get(win.id);
      expect(restored?.state).toBe('floating');
      expect(restored?.bounds.x).toBe(originalBounds.x);
      expect(restored?.bounds.y).toBe(originalBounds.y);
      expect(restored?.bounds.w).toBe(originalBounds.w);
      expect(restored?.bounds.h).toBe(originalBounds.h);
    });
  });

  describe('Event Bus Integration', () => {
    it('should emit events for all window operations', () => {
      const events: any[] = [];
      const unsubscribe = eventBus.on('window', (event) => {
        events.push(event);
      });

      const win = openWindow({ appId: 'app1', title: 'Window 1' });
      windowManager.moveWindow(win.id, 200, 300);
      windowManager.resizeWindow(win.id, 500, 400);
      windowManager.minimizeWindow(win.id);
      windowManager.restoreWindow(win.id);
      windowManager.maximizeWindow(win.id);
      windowManager.restoreWindow(win.id);
      closeWindow(win.id);

      expect(events.length).toBeGreaterThan(0);
      expect(events.some(e => e.type === 'open')).toBe(true);
      expect(events.some(e => e.type === 'move')).toBe(true);
      expect(events.some(e => e.type === 'resize')).toBe(true);
      expect(events.some(e => e.type === 'minimize')).toBe(true);
      expect(events.some(e => e.type === 'restore')).toBe(true);
      expect(events.some(e => e.type === 'maximize')).toBe(true);
      expect(events.some(e => e.type === 'close')).toBe(true);

      unsubscribe();
    });
  });

  describe('Window Bounds Management', () => {
    it('should update bounds correctly on move', () => {
      const win = openWindow({ 
        appId: 'app1', 
        title: 'Window 1',
        bounds: { x: 100, y: 100, w: 400, h: 300 }
      });

      windowManager.moveWindow(win.id, 250, 350);
      const updated = windowManager.windows.get(win.id);
      
      expect(updated?.bounds.x).toBe(250);
      expect(updated?.bounds.y).toBe(350);
      expect(updated?.bounds.w).toBe(400); // Width unchanged
      expect(updated?.bounds.h).toBe(300); // Height unchanged
    });

    it('should update bounds correctly on resize', () => {
      const win = openWindow({ 
        appId: 'app1', 
        title: 'Window 1',
        bounds: { x: 100, y: 100, w: 400, h: 300 }
      });

      windowManager.resizeWindow(win.id, 600, 500);
      const updated = windowManager.windows.get(win.id);
      
      expect(updated?.bounds.w).toBe(600);
      expect(updated?.bounds.h).toBe(500);
      expect(updated?.bounds.x).toBe(100); // Position unchanged
      expect(updated?.bounds.y).toBe(100); // Position unchanged
    });
  });

  describe('Multiple Windows Management', () => {
    it('should handle multiple windows independently', () => {
      const win1 = openWindow({ appId: 'app1', title: 'Window 1' });
      const win2 = openWindow({ appId: 'app2', title: 'Window 2' });
      const win3 = openWindow({ appId: 'app3', title: 'Window 3' });

      expect(windowManager.windows.size).toBe(3);

      // Move win1
      windowManager.moveWindow(win1.id, 50, 50);
      expect(windowManager.windows.get(win1.id)?.bounds.x).toBe(50);
      expect(windowManager.windows.get(win2.id)?.bounds.x).toBe(100); // Unchanged

      // Resize win2
      windowManager.resizeWindow(win2.id, 500, 400);
      expect(windowManager.windows.get(win2.id)?.bounds.w).toBe(500);
      expect(windowManager.windows.get(win1.id)?.bounds.w).toBe(800); // Unchanged

      // Minimize win3
      windowManager.minimizeWindow(win3.id);
      expect(windowManager.windows.get(win3.id)?.state).toBe('minimized');
      expect(windowManager.windows.get(win1.id)?.state).toBe('floating'); // Unchanged

      // Close win1
      closeWindow(win1.id);
      expect(windowManager.windows.has(win1.id)).toBe(false);
      expect(windowManager.windows.has(win2.id)).toBe(true);
      expect(windowManager.windows.has(win3.id)).toBe(true);
    });
  });
});

