import { useEffect } from 'react';
import type { WorkspaceManager } from './WorkspaceManager';

export interface UseKeyboardShortcutsOptions {
  workspaceManager: WorkspaceManager;
  enabled?: boolean;
}

/**
 * React hook for keyboard shortcuts (Ctrl+1,2,3,4 for workspace switching)
 */
export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions) {
  const { workspaceManager, enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+Number (1-9)
      if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key, 10) - 1; // Convert to 0-based index
        e.preventDefault();
        workspaceManager.switchWorkspaceByIndex(index);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [workspaceManager, enabled]);
}

