import type { Backend } from './BaseBackend';
import type { FileMetadata } from '@browser-os/schemas';

/**
 * localStorage-based backend (persistent, limited storage)
 */
export class LocalStorageBackend implements Backend {
  private prefix: string;

  constructor(options?: { prefix?: string }) {
    this.prefix = options?.prefix ?? 'browser-os-fs:';
  }

  private getKey(path: string): string {
    return `${this.prefix}${path}`;
  }

  private getDirKey(path: string): string {
    return `${this.prefix}dir:${path}`;
  }

  async read(path: string): Promise<Uint8Array> {
    const key = this.getKey(path);
    const data = localStorage.getItem(key);
    if (!data) {
      throw new Error(`File not found: ${path}`);
    }
    // Decode base64
    const binary = atob(data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  async write(path: string, data: Uint8Array): Promise<void> {
    const key = this.getKey(path);
    // Encode as base64
    const binary = String.fromCharCode(...data);
    const base64 = btoa(binary);
    try {
      localStorage.setItem(key, base64);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded');
      }
      throw error;
    }
  }

  async delete(path: string): Promise<void> {
    const key = this.getKey(path);
    if (!localStorage.getItem(key)) {
      throw new Error(`File not found: ${path}`);
    }
    localStorage.removeItem(key);
  }

  async exists(path: string): Promise<boolean> {
    const fileKey = this.getKey(path);
    const dirKey = this.getDirKey(path);
    return localStorage.getItem(fileKey) !== null || localStorage.getItem(dirKey) !== null;
  }

  async mkdir(path: string): Promise<void> {
    const dirKey = this.getDirKey(path);
    if (localStorage.getItem(dirKey)) {
      return;
    }
    localStorage.setItem(dirKey, '1');
  }

  async rmdir(path: string): Promise<void> {
    const dirKey = this.getDirKey(path);
    if (!localStorage.getItem(dirKey)) {
      throw new Error(`Directory not found: ${path}`);
    }
    // Check if empty
    const children = await this.readdir(path);
    if (children.length > 0) {
      throw new Error(`Directory not empty: ${path}`);
    }
    localStorage.removeItem(dirKey);
  }

  async readdir(path: string): Promise<string[]> {
    const dirKey = this.getDirKey(path);
    if (!localStorage.getItem(dirKey)) {
      throw new Error(`Directory not found: ${path}`);
    }

    const entries = new Set<string>();
    const prefix = path === '/' ? this.prefix : `${this.prefix}${path}/`;
    const dirPrefix = path === '/' ? `${this.prefix}dir:` : `${this.prefix}dir:${path}/`;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(this.prefix)) continue;

      if (key.startsWith(prefix) && key !== dirKey) {
        const relative = key.slice(prefix.length);
        const name = relative.split('/')[0];
        if (name) entries.add(name);
      } else if (key.startsWith(dirPrefix)) {
        const relative = key.slice(dirPrefix.length);
        const name = relative.split('/')[0];
        if (name) entries.add(name);
      }
    }

    return Array.from(entries);
  }

  async stat(path: string): Promise<FileMetadata> {
    const fileKey = this.getKey(path);
    const dirKey = this.getDirKey(path);
    const fileData = localStorage.getItem(fileKey);
    const isDir = localStorage.getItem(dirKey) !== null;

    if (!fileData && !isDir) {
      throw new Error(`Path not found: ${path}`);
    }

    const size = fileData ? this.getDataSize(fileData) : 0;
    const now = Date.now();

    return {
      path,
      type: isDir ? 'directory' : 'file',
      size,
      createdAt: now,
      modifiedAt: now,
      permissions: 'rwxrwxrwx',
    };
  }

  private getDataSize(base64: string): number {
    return Math.ceil((base64.length * 3) / 4);
  }
}

