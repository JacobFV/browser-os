import { StorageManager } from '@browser-os/storage';
import type { ProcessManager } from '@browser-os/proc';
import type { SyscallHandler } from '../types';

export function createStorageSyscalls(
  storageManager: StorageManager,
  procManager: ProcessManager
): Record<string, SyscallHandler> {
  /**
   * Get app-specific storage manager
   */
  function getAppStorage(pid: number): StorageManager {
    const process = procManager.get(pid);
    const appId = process ? process.name : `pid-${pid}`;
    // Create a new StorageManager with app-specific prefix
    // Note: This creates a new instance each time - in production, you might want to cache these
    return new StorageManager({
      prefix: `app:${appId}`,
    });
  }

  return {
    'storage.get': async (args, context) => {
      const key = args.key as string;
      if (!key) {
        throw new Error('key required');
      }

      const appStorage = getAppStorage(context.pid);
      return appStorage.get(key);
    },

    'storage.set': async (args, context) => {
      const key = args.key as string;
      const value = args.value as string;
      if (!key) {
        throw new Error('key required');
      }
      if (typeof value !== 'string') {
        throw new Error('value must be a string');
      }

      const appStorage = getAppStorage(context.pid);
      appStorage.set(key, value);
      return null;
    },

    'storage.remove': async (args, context) => {
      const key = args.key as string;
      if (!key) {
        throw new Error('key required');
      }

      const appStorage = getAppStorage(context.pid);
      appStorage.remove(key);
      return null;
    },

    'storage.clear': async (args, context) => {
      const appStorage = getAppStorage(context.pid);
      appStorage.clear();
      return null;
    },

    'storage.keys': async (args, context) => {
      const appStorage = getAppStorage(context.pid);
      return appStorage.keys();
    },

    'storage.has': async (args, context) => {
      const key = args.key as string;
      if (!key) {
        throw new Error('key required');
      }

      const appStorage = getAppStorage(context.pid);
      return appStorage.has(key);
    },

    'storage.size': async (args, context) => {
      const appStorage = getAppStorage(context.pid);
      return appStorage.size();
    },

    'storage.getJSON': async (args, context) => {
      const key = args.key as string;
      if (!key) {
        throw new Error('key required');
      }

      const appStorage = getAppStorage(context.pid);
      return appStorage.getJSON(key);
    },

    'storage.setJSON': async (args, context) => {
      const key = args.key as string;
      const value = args.value;
      if (!key) {
        throw new Error('key required');
      }

      const appStorage = getAppStorage(context.pid);
      appStorage.setJSON(key, value);
      return null;
    },
  };
}

