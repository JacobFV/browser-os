import { useEffect, useState } from 'react';
import { EventBus } from '@browser-os/events';
import type { Window } from '@browser-os/schemas';
import { WindowManager } from './WindowManager';

export interface UseWindowOptions {
  windowManager: WindowManager;
  eventBus?: EventBus;
}

/**
 * React hook for window operations
 */
export function useWindow(windowId: string | null, options: UseWindowOptions) {
  const { windowManager, eventBus } = options;
  const [window, setWindow] = useState<Window | null>(
    windowId ? windowManager.getWindow(windowId) : null
  );

  useEffect(() => {
    if (!windowId) return;

    const updateWindow = () => {
      const w = windowManager.getWindow(windowId);
      if (w) setWindow(w);
    };

    // Initial load
    updateWindow();

    // Subscribe to window events
    const bus = eventBus ?? new EventBus();
    const unsubscribe = bus.on('window:updated', (event) => {
      if (event.payload && typeof event.payload === 'object' && 'windowId' in event.payload) {
        if (event.payload.windowId === windowId) {
          updateWindow();
        }
      }
    });

    return unsubscribe;
  }, [windowId, windowManager, eventBus]);

  const close = () => {
    if (windowId) windowManager.destroyWindow(windowId);
  };

  const minimize = () => {
    if (windowId) windowManager.minimizeWindow(windowId);
  };

  const maximize = () => {
    if (windowId) windowManager.maximizeWindow(windowId);
  };

  const restore = () => {
    if (windowId) windowManager.restoreWindow(windowId);
  };

  const focus = () => {
    if (windowId) windowManager.focusWindow(windowId);
  };

  const move = (x: number, y: number) => {
    if (windowId) windowManager.updateWindow(windowId, { x, y });
  };

  const resize = (width: number, height: number) => {
    if (windowId) windowManager.updateWindow(windowId, { width, height });
  };

  return {
    window,
    close,
    minimize,
    maximize,
    restore,
    focus,
    move,
    resize,
  };
}

