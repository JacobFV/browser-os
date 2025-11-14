import type { FileMetadata, MountPoint } from '@browser-os/schemas';
import { EventBus } from '@browser-os/events';
import { MountManager } from './MountManager';
import { PathUtils } from './PathUtils';
import type { Backend } from './backends/BaseBackend';

export interface FileSystemOptions {
  eventBus?: EventBus;
}

/**
 * Virtual filesystem with mount point support
 */
export class FileSystem {
  private mountManager: MountManager;
  private eventBus?: EventBus;

  constructor(options?: FileSystemOptions) {
    this.mountManager = new MountManager();
    this.eventBus = options?.eventBus;
  }

  /**
   * Read file contents
   */
  async read(path: string): Promise<Uint8Array> {
    const resolved = this.resolve(path);
    const mount = this.mountManager.getBackend(resolved);
    if (!mount) {
      throw new Error(`No mount point found for path: ${path}`);
    }

    const relativePath = this.getRelativePath(resolved, mount.mountPath);
    const data = await mount.backend.read(relativePath);

    this.eventBus?.emit('fs:read', { path: resolved }, { source: 'fs' });
    return data;
  }

  /**
   * Write file contents
   */
  async write(
    path: string,
    data: Uint8Array,
    options?: { create?: boolean; append?: boolean }
  ): Promise<void> {
    const resolved = this.resolve(path);
    const mount = this.mountManager.getBackend(resolved);
    if (!mount) {
      throw new Error(`No mount point found for path: ${path}`);
    }

    const relativePath = this.getRelativePath(resolved, mount.mountPath);
    const create = options?.create ?? true;

    if (options?.append) {
      try {
        const existing = await mount.backend.read(relativePath);
        const combined = new Uint8Array(existing.length + data.length);
        combined.set(existing);
        combined.set(data, existing.length);
        await mount.backend.write(relativePath, combined);
      } catch {
        if (create) {
          await mount.backend.write(relativePath, data);
        } else {
          throw new Error(`File not found: ${path}`);
        }
      }
    } else {
      if (!create) {
        const exists = await mount.backend.exists(relativePath);
        if (!exists) {
          throw new Error(`File not found: ${path}`);
        }
      }
      await mount.backend.write(relativePath, data);
    }

    this.eventBus?.emit('fs:write', { path: resolved }, { source: 'fs' });
  }

  /**
   * Delete a file
   */
  async delete(path: string): Promise<void> {
    const resolved = this.resolve(path);
    const mount = this.mountManager.getBackend(resolved);
    if (!mount) {
      throw new Error(`No mount point found for path: ${path}`);
    }

    const relativePath = this.getRelativePath(resolved, mount.mountPath);
    await mount.backend.delete(relativePath);

    this.eventBus?.emit('fs:delete', { path: resolved }, { source: 'fs' });
  }

  /**
   * Check if a path exists
   */
  async exists(path: string): Promise<boolean> {
    try {
      const resolved = this.resolve(path);
      const mount = this.mountManager.getBackend(resolved);
      if (!mount) {
        return false;
      }

      const relativePath = this.getRelativePath(resolved, mount.mountPath);
      return await mount.backend.exists(relativePath);
    } catch {
      return false;
    }
  }

  /**
   * Create a directory
   */
  async mkdir(path: string, options?: { recursive?: boolean }): Promise<void> {
    const resolved = this.resolve(path);
    const mount = this.mountManager.getBackend(resolved);
    if (!mount) {
      throw new Error(`No mount point found for path: ${path}`);
    }

    const relativePath = this.getRelativePath(resolved, mount.mountPath);

    if (options?.recursive) {
      const parts = relativePath.split('/').filter((p) => p);
      let currentPath = '';
      for (const part of parts) {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        try {
          await mount.backend.mkdir(currentPath);
        } catch {
          // Directory might already exist, continue
        }
      }
    } else {
      await mount.backend.mkdir(relativePath);
    }

    this.eventBus?.emit('fs:mkdir', { path: resolved }, { source: 'fs' });
  }

  /**
   * Remove a directory
   */
  async rmdir(path: string, options?: { recursive?: boolean }): Promise<void> {
    const resolved = this.resolve(path);
    const mount = this.mountManager.getBackend(resolved);
    if (!mount) {
      throw new Error(`No mount point found for path: ${path}`);
    }

    const relativePath = this.getRelativePath(resolved, mount.mountPath);

    if (options?.recursive) {
      const children = await mount.backend.readdir(relativePath);
      for (const child of children) {
        const childPath = PathUtils.join(relativePath, child);
        const stat = await mount.backend.stat(childPath);
        if (stat.type === 'directory') {
          await this.rmdir(PathUtils.join(resolved, child), { recursive: true });
        } else {
          await mount.backend.delete(childPath);
        }
      }
    }

    await mount.backend.rmdir(relativePath);
    this.eventBus?.emit('fs:rmdir', { path: resolved }, { source: 'fs' });
  }

  /**
   * List directory contents
   */
  async readdir(path: string): Promise<string[]> {
    const resolved = this.resolve(path);
    const mount = this.mountManager.getBackend(resolved);
    if (!mount) {
      throw new Error(`No mount point found for path: ${path}`);
    }

    const relativePath = this.getRelativePath(resolved, mount.mountPath);
    return await mount.backend.readdir(relativePath);
  }

  /**
   * Get file metadata
   */
  async stat(path: string): Promise<FileMetadata> {
    const resolved = this.resolve(path);
    const mount = this.mountManager.getBackend(resolved);
    if (!mount) {
      throw new Error(`No mount point found for path: ${path}`);
    }

    const relativePath = this.getRelativePath(resolved, mount.mountPath);
    const metadata = await mount.backend.stat(relativePath);
    return {
      ...metadata,
      path: resolved, // Return resolved path, not relative
    };
  }

  /**
   * Change file permissions (placeholder - not all backends support this)
   */
  async chmod(path: string, permissions: string): Promise<void> {
    // Most backends don't support permissions, so this is a no-op
    // In the future, we could store permissions in metadata
    this.eventBus?.emit('fs:chmod', { path, permissions }, { source: 'fs' });
  }

  /**
   * Mount a backend at a path
   */
  async mount(path: string, backend: Backend, options?: Record<string, unknown>): Promise<void> {
    const normalized = PathUtils.normalize(path);
    
    // Initialize backend if needed
    if (backend.init) {
      await backend.init();
    }

    this.mountManager.mount(normalized, backend, options);
    this.eventBus?.emit('fs:mount', { path: normalized }, { source: 'fs' });
  }

  /**
   * Unmount a backend
   */
  async unmount(path: string): Promise<void> {
    const normalized = PathUtils.normalize(path);
    this.mountManager.unmount(normalized);
    this.eventBus?.emit('fs:unmount', { path: normalized }, { source: 'fs' });
  }

  /**
   * Get mount point for a path
   */
  getMount(path: string): MountPoint | null {
    const mount = this.mountManager.getBackend(path);
    if (!mount) return null;

    const mounts = this.mountManager.getMounts();
    return mounts.find((m) => m.path === mount.mountPath) || null;
  }

  /**
   * Resolve a path (normalize and make absolute)
   */
  resolve(...paths: string[]): string {
    const joined = PathUtils.join(...paths);
    return PathUtils.isAbsolute(joined) ? PathUtils.normalize(joined) : PathUtils.normalize('/' + joined);
  }

  /**
   * Normalize a path
   */
  normalize(path: string): string {
    return PathUtils.normalize(path);
  }

  /**
   * Check if path is absolute
   */
  isAbsolute(path: string): boolean {
    return PathUtils.isAbsolute(path);
  }

  /**
   * Join path segments
   */
  join(...paths: string[]): string {
    return PathUtils.join(...paths);
  }

  /**
   * Get relative path from mount point
   */
  private getRelativePath(path: string, mountPath: string): string {
    if (path === mountPath) return '/';
    if (mountPath === '/') return path;
    return path.startsWith(mountPath + '/') ? path.slice(mountPath.length) : path;
  }
}

