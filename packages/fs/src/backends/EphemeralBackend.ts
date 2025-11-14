import type { Backend } from './BaseBackend';
import type { FileMetadata } from '@browser-os/schemas';

/**
 * In-memory ephemeral backend (cleared on page reload)
 */
export class EphemeralBackend implements Backend {
  private files: Map<string, Uint8Array> = new Map();
  private dirs: Set<string> = new Set(['/']);

  async read(path: string): Promise<Uint8Array> {
    const file = this.files.get(path);
    if (!file) {
      throw new Error(`File not found: ${path}`);
    }
    return file;
  }

  async write(path: string, data: Uint8Array): Promise<void> {
    // Ensure parent directory exists
    const parent = this.getParentPath(path);
    if (parent && !this.dirs.has(parent)) {
      await this.mkdir(parent);
    }
    this.files.set(path, data);
  }

  async delete(path: string): Promise<void> {
    if (!this.files.has(path)) {
      throw new Error(`File not found: ${path}`);
    }
    this.files.delete(path);
  }

  async exists(path: string): Promise<boolean> {
    return this.files.has(path) || this.dirs.has(path);
  }

  async mkdir(path: string): Promise<void> {
    if (this.dirs.has(path)) {
      return;
    }
    // Ensure parent exists
    const parent = this.getParentPath(path);
    if (parent && !this.dirs.has(parent)) {
      await this.mkdir(parent);
    }
    this.dirs.add(path);
  }

  async rmdir(path: string): Promise<void> {
    if (!this.dirs.has(path)) {
      throw new Error(`Directory not found: ${path}`);
    }
    // Check if directory is empty
    const children = Array.from(this.files.keys()).filter((p) => p.startsWith(path + '/'));
    if (children.length > 0) {
      throw new Error(`Directory not empty: ${path}`);
    }
    this.dirs.delete(path);
  }

  async readdir(path: string): Promise<string[]> {
    if (!this.dirs.has(path)) {
      throw new Error(`Directory not found: ${path}`);
    }
    const entries = new Set<string>();
    const prefix = path === '/' ? '/' : path + '/';

    // Add files
    for (const filePath of this.files.keys()) {
      if (filePath.startsWith(prefix)) {
        const relative = filePath.slice(prefix.length);
        const name = relative.split('/')[0];
        if (name) entries.add(name);
      }
    }

    // Add subdirectories
    for (const dirPath of this.dirs) {
      if (dirPath.startsWith(prefix) && dirPath !== path) {
        const relative = dirPath.slice(prefix.length);
        const name = relative.split('/')[0];
        if (name) entries.add(name);
      }
    }

    return Array.from(entries);
  }

  async stat(path: string): Promise<FileMetadata> {
    const isFile = this.files.has(path);
    const isDir = this.dirs.has(path);

    if (!isFile && !isDir) {
      throw new Error(`Path not found: ${path}`);
    }

    const fileData = isFile ? this.files.get(path) : null;
    const data = fileData ?? new Uint8Array(0);
    const now = Date.now();

    return {
      path,
      type: isDir ? 'directory' : 'file',
      size: data.length,
      createdAt: now,
      modifiedAt: now,
      permissions: 'rwxrwxrwx',
    };
  }

  private getParentPath(path: string): string {
    if (path === '/' || path === '') return '';
    const parts = path.split('/').filter((p) => p);
    if (parts.length === 0) return '/';
    parts.pop();
    return '/' + parts.join('/');
  }
}

