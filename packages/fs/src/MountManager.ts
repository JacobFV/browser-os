import type { MountPoint } from '@browser-os/schemas';
import type { Backend } from './backends/BaseBackend';
import { PathUtils } from './PathUtils';

/**
 * Manages mount points in the filesystem
 */
export class MountManager {
  private mounts: Map<string, { backend: Backend; options: Record<string, unknown> }> = new Map();

  /**
   * Mount a backend at a path
   */
  mount(path: string, backend: Backend, options?: Record<string, unknown>): void {
    const normalized = PathUtils.normalize(path);
    this.mounts.set(normalized, { backend, options: options ?? {} });
  }

  /**
   * Unmount a backend
   */
  unmount(path: string): void {
    const normalized = PathUtils.normalize(path);
    this.mounts.delete(normalized);
  }

  /**
   * Get the backend for a given path
   */
  getBackend(path: string): { backend: Backend; mountPath: string } | null {
    const normalized = PathUtils.normalize(path);
    
    // Find the longest matching mount point
    let bestMatch: { backend: Backend; mountPath: string } | null = null;
    let bestLength = 0;

    for (const [mountPath, { backend }] of this.mounts.entries()) {
      if (normalized === mountPath || normalized.startsWith(mountPath + '/')) {
        if (mountPath.length > bestLength) {
          bestLength = mountPath.length;
          bestMatch = { backend, mountPath };
        }
      }
    }

    return bestMatch;
  }

  /**
   * Get all mount points
   */
  getMounts(): MountPoint[] {
    return Array.from(this.mounts.entries()).map(([path, { backend, options }]) => ({
      path,
      backend: this.getBackendType(backend),
      options,
    }));
  }

  private getBackendType(backend: Backend): 'localStorage' | 'indexedDB' | 'server' | 'ephemeral' {
    const className = backend.constructor.name;
    if (className === 'LocalStorageBackend') return 'localStorage';
    if (className === 'IndexedDBBackend') return 'indexedDB';
    if (className === 'ServerBackend') return 'server';
    return 'ephemeral';
  }
}

