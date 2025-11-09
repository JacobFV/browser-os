import { useEffect } from 'react';
import { windowManager } from '@browser-os/windowing';

export function useGlobalShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+Tab: Cycle windows
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        const windows = Array.from(windowManager.windows.values())
          .filter(w => w.state !== 'minimized')
          .sort((a, b) => b.z - a.z);
        if (windows.length > 0) {
          const nextIndex = (windows.findIndex(w => w.id === windowManager.focusedWindowId) + 1) % windows.length;
          windowManager.focusWindow(windows[nextIndex].id);
        }
      }

      // Win/Meta key: Open start menu (placeholder)
      if (e.metaKey || e.key === 'Meta') {
        // Handle start menu
      }

      // Escape: Close menus/dialogs
      if (e.key === 'Escape') {
        // Handle escape
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}

