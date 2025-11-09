import { eventBus, FsEvent } from '@browser-os/core';

export interface Stat {
  type: 'file' | 'directory';
  size: number;
  mtime: number;
}

export interface Entry {
  name: string;
  path: string;
  stat: Stat;
}

export interface FsDriver {
  id: string;
  scheme: string;
  stat(path: string): Promise<Stat>;
  read(path: string, opts?: { binary?: boolean }): Promise<Uint8Array | string>;
  write(path: string, data: Uint8Array | string, opts?: { mkdirp?: boolean }): Promise<void>;
  rm(path: string, opts?: { recursive?: boolean }): Promise<void>;
  readdir(path: string): Promise<Entry[]>;
  watch?(path: string, cb: (ev: FsEvent) => void): () => void;
}

export interface Mount {
  mountPoint: string;
  driver: FsDriver;
  root?: string;
}

export interface Vfs {
  mount(m: Mount): void;
  resolve(uri: string): { driver: FsDriver; path: string };
}

class VfsImpl implements Vfs {
  private mounts: Map<string, Mount> = new Map();

  mount(m: Mount): void {
    this.mounts.set(m.mountPoint, m);
    eventBus.emit('fs', { type: 'mount', mountPoint: m.mountPoint, driver: m.driver.id });
  }

  resolve(uri: string): { driver: FsDriver; path: string } {
    if (!uri.startsWith('vfs://')) {
      throw new Error(`Invalid URI: ${uri}`);
    }
    
    const path = uri.slice(6);
    const parts = path.split('/');
    const mountPoint = '/' + parts[1];
    const mount = this.mounts.get(mountPoint);
    
    if (!mount) {
      throw new Error(`Mount point not found: ${mountPoint}`);
    }
    
    const driverPath = '/' + parts.slice(2).join('/');
    return { driver: mount.driver, path: driverPath };
  }

  async read(uri: string, opts?: { binary?: boolean }): Promise<Uint8Array | string> {
    const { driver, path } = this.resolve(uri);
    return driver.read(path, opts);
  }

  async write(uri: string, data: Uint8Array | string, opts?: { mkdirp?: boolean }): Promise<void> {
    const { driver, path } = this.resolve(uri);
    await driver.write(path, data, opts);
    eventBus.emit('fs', { type: 'write', path: uri });
  }

  async stat(uri: string): Promise<Stat> {
    const { driver, path } = this.resolve(uri);
    return driver.stat(path);
  }

  async readdir(uri: string): Promise<Entry[]> {
    const { driver, path } = this.resolve(uri);
    return driver.readdir(path);
  }
}

export const vfs = new VfsImpl();

export function createMemDriver(): FsDriver {
  const files = new Map<string, Uint8Array | string>();
  
  return {
    id: 'mem',
    scheme: 'mem:',
    async stat(path: string): Promise<Stat> {
      // Check for directory marker
      const dirMarker = path.endsWith('/') ? path + '.dir' : path + '/.dir';
      if (files.has(dirMarker)) {
        return {
          type: 'directory',
          size: 0,
          mtime: Date.now(),
        };
      }
      
      const data = files.get(path);
      if (data === undefined) {
        // Check if it's a directory by looking for children
        const hasChildren = Array.from(files.keys()).some(fp => 
          fp.startsWith(path + '/') && fp !== dirMarker
        );
        return {
          type: hasChildren ? 'directory' : 'file',
          size: 0,
          mtime: Date.now(),
        };
      }
      
      return {
        type: 'file',
        size: typeof data === 'string' ? data.length : data.length,
        mtime: Date.now(),
      };
    },
    async read(path: string, opts?: { binary?: boolean }): Promise<Uint8Array | string> {
      const data = files.get(path);
      if (!data) throw new Error(`File not found: ${path}`);
      return opts?.binary && typeof data === 'string' ? new TextEncoder().encode(data) : data;
    },
    async write(path: string, data: Uint8Array | string, opts?: { mkdirp?: boolean }): Promise<void> {
      files.set(path, data);
    },
    async rm(path: string, opts?: { recursive?: boolean }): Promise<void> {
      if (opts?.recursive) {
        // Delete all files/dirs that start with this path
        const toDelete: string[] = [];
        for (const filePath of files.keys()) {
          if (filePath.startsWith(path + '/') || filePath === path) {
            toDelete.push(filePath);
          }
        }
        toDelete.forEach(fp => files.delete(fp));
      } else {
        files.delete(path);
        // Also delete directory marker if it exists
        const dirMarker = path.endsWith('/') ? path + '.dir' : path + '/.dir';
        files.delete(dirMarker);
      }
    },
    async readdir(path: string): Promise<Entry[]> {
      const entries: Entry[] = [];
      const seenDirs = new Set<string>();
      
      for (const [filePath] of files) {
        if (filePath.startsWith(path + '/') || filePath === path + '/.dir') {
          const relativePath = filePath.slice(path.length + 1);
          const parts = relativePath.split('/');
          const name = parts[0];
          
          // Skip directory markers
          if (name === '.dir') continue;
          
          // If it's a direct child, add it
          if (parts.length === 1) {
            entries.push({
              name,
              path: filePath,
              stat: await this.stat(filePath),
            });
          } else {
            // It's in a subdirectory, add the subdirectory if not already added
            const dirName = name;
            const dirPath = path.endsWith('/') ? path + dirName : path + '/' + dirName;
            if (!seenDirs.has(dirPath)) {
              seenDirs.add(dirPath);
              entries.push({
                name: dirName,
                path: dirPath,
                stat: { type: 'directory', size: 0, mtime: Date.now() },
              });
            }
          }
        }
      }
      
      return entries;
    },
  };
}

export function createIdbDriver(): FsDriver {
  return {
    id: 'idb',
    scheme: 'idb:',
    async stat(path: string): Promise<Stat> {
      // TODO: Implement IndexedDB driver
      throw new Error('IndexedDB driver not implemented');
    },
    async read(path: string): Promise<string> {
      throw new Error('IndexedDB driver not implemented');
    },
    async write(path: string, data: Uint8Array | string): Promise<void> {
      throw new Error('IndexedDB driver not implemented');
    },
    async rm(path: string): Promise<void> {
      throw new Error('IndexedDB driver not implemented');
    },
    async readdir(path: string): Promise<Entry[]> {
      throw new Error('IndexedDB driver not implemented');
    },
  };
}

