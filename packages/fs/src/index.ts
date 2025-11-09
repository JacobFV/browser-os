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
    // Normalize trailing slashes - remove trailing slash unless it's root
    const normalizedPath = path === '/' ? '/' : path.replace(/\/+$/, '');
    const parts = normalizedPath.split('/').filter(Boolean);
    
    if (parts.length === 0) {
      throw new Error(`Invalid mount point: ${uri}`);
    }
    
    const mountPoint = '/' + parts[0];
    const mount = this.mounts.get(mountPoint);
    
    if (!mount) {
      throw new Error(`Mount point not found: ${mountPoint}`);
    }
    
    // Reconstruct driver path with leading slash
    const driverPath = parts.length > 1 ? '/' + parts.slice(1).join('/') : '/';
    return { driver: mount.driver, path: driverPath };
  }

  async read(uri: string, opts?: { binary?: boolean }): Promise<Uint8Array | string> {
    try {
      const { driver, path } = this.resolve(uri);
      return await driver.read(path, opts);
    } catch (error: any) {
      throw new Error(`Failed to read ${uri}: ${error.message}`);
    }
  }

  async write(uri: string, data: Uint8Array | string, opts?: { mkdirp?: boolean }): Promise<void> {
    try {
      const { driver, path } = this.resolve(uri);
      await driver.write(path, data, opts);
      eventBus.emit('fs', { type: 'write', path: uri });
    } catch (error: any) {
      throw new Error(`Failed to write ${uri}: ${error.message}`);
    }
  }

  async stat(uri: string): Promise<Stat> {
    try {
      const { driver, path } = this.resolve(uri);
      return await driver.stat(path);
    } catch (error: any) {
      throw new Error(`Failed to stat ${uri}: ${error.message}`);
    }
  }

  async readdir(uri: string): Promise<Entry[]> {
    try {
      const { driver, path } = this.resolve(uri);
      return await driver.readdir(path);
    } catch (error: any) {
      throw new Error(`Failed to readdir ${uri}: ${error.message}`);
    }
  }
}

export const vfs = new VfsImpl();

export function createMemDriver(): FsDriver {
  const files = new Map<string, Uint8Array | string>();
  const watchers = new Map<string, Set<(ev: FsEvent) => void>>();
  
  const notifyWatchers = (path: string, type: FsEvent['type']) => {
    // Notify watchers for this path and parent paths
    const pathsToCheck = [path];
    let currentPath = path;
    while (currentPath.includes('/')) {
      const parentPath = currentPath.slice(0, currentPath.lastIndexOf('/'));
      if (parentPath) pathsToCheck.push(parentPath);
      currentPath = parentPath;
    }
    
    pathsToCheck.forEach(p => {
      const handlers = watchers.get(p);
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler({ type, path: p } as FsEvent);
          } catch (e) {
            console.error('Error in file watcher:', e);
          }
        });
      }
    });
  };
  
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
      const existed = files.has(path);
      files.set(path, data);
      notifyWatchers(path, existed ? 'write' : 'write');
      eventBus.emit('fs', { type: 'write', path });
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
        toDelete.forEach(fp => {
          files.delete(fp);
          notifyWatchers(fp, 'delete');
          eventBus.emit('fs', { type: 'delete', path: fp });
        });
      } else {
        files.delete(path);
        // Also delete directory marker if it exists
        const dirMarker = path.endsWith('/') ? path + '.dir' : path + '/.dir';
        files.delete(dirMarker);
        notifyWatchers(path, 'delete');
        eventBus.emit('fs', { type: 'delete', path });
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
    watch(path: string, cb: (ev: FsEvent) => void): () => void {
      if (!watchers.has(path)) {
        watchers.set(path, new Set());
      }
      watchers.get(path)!.add(cb);
      
      // Return unsubscribe function
      return () => {
        const handlers = watchers.get(path);
        if (handlers) {
          handlers.delete(cb);
          if (handlers.size === 0) {
            watchers.delete(path);
          }
        }
      };
    },
  };
}

export function createIdbDriver(): FsDriver {
  const DB_NAME = 'browser-os-fs';
  const STORE_NAME = 'files';
  const VERSION = 1;
  
  let dbPromise: Promise<IDBDatabase> | null = null;
  
  const getDb = (): Promise<IDBDatabase> => {
    if (dbPromise) return dbPromise;
    
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'path' });
          store.createIndex('parent', 'parent', { unique: false });
        }
      };
    });
    
    return dbPromise;
  };
  
  const normalizePath = (path: string): string => {
    // Remove leading slash, ensure trailing slash for directories
    let normalized = path.startsWith('/') ? path.slice(1) : path;
    return normalized;
  };
  
  const getParentPath = (path: string): string => {
    const normalized = normalizePath(path);
    const lastSlash = normalized.lastIndexOf('/');
    return lastSlash >= 0 ? '/' + normalized.slice(0, lastSlash) : '/';
  };
  
  return {
    id: 'idb',
    scheme: 'idb:',
    async stat(path: string): Promise<Stat> {
      const db = await getDb();
      const normalized = normalizePath(path);
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(normalized);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const result = request.result;
          if (result) {
            resolve({
              type: result.type,
              size: result.size || 0,
              mtime: result.mtime || Date.now(),
            });
          } else {
            // Check if it's a directory by looking for children
            const index = store.index('parent');
            const parentRequest = index.getAll(normalized + '/');
            
            parentRequest.onsuccess = () => {
              const hasChildren = parentRequest.result.length > 0;
              resolve({
                type: hasChildren ? 'directory' : 'file',
                size: 0,
                mtime: Date.now(),
              });
            };
            parentRequest.onerror = () => reject(parentRequest.error);
          }
        };
      });
    },
    async read(path: string, opts?: { binary?: boolean }): Promise<Uint8Array | string> {
      const db = await getDb();
      const normalized = normalizePath(path);
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(normalized);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const result = request.result;
          if (!result) {
            reject(new Error(`File not found: ${path}`));
            return;
          }
          
          if (result.type === 'directory') {
            reject(new Error(`Cannot read directory: ${path}`));
            return;
          }
          
          const data = result.data || '';
          if (opts?.binary) {
            resolve(typeof data === 'string' ? new TextEncoder().encode(data) : data);
          } else {
            resolve(typeof data === 'string' ? data : new TextDecoder().decode(data));
          }
        };
      });
    },
    async write(path: string, data: Uint8Array | string, opts?: { mkdirp?: boolean }): Promise<void> {
      const db = await getDb();
      const normalized = normalizePath(path);
      
      // Handle mkdirp
      if (opts?.mkdirp) {
        const parentPath = getParentPath(path);
        if (parentPath !== '/') {
          const parentNormalized = normalizePath(parentPath);
          const parentDirMarker = parentNormalized + '/.dir';
          
          // Check if parent exists
          const parentExists = await new Promise<boolean>((resolve) => {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(parentDirMarker);
            request.onsuccess = () => resolve(!!request.result);
            request.onerror = () => resolve(false);
          });
          
          if (!parentExists) {
            // Create parent directory
            await this.write(parentDirMarker, '', { mkdirp: true });
          }
        }
      }
      
      const dataStr = typeof data === 'string' ? data : new TextDecoder().decode(data);
      const size = typeof data === 'string' ? data.length : data.length;
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        const entry = {
          path: normalized,
          parent: getParentPath(path),
          type: normalized.endsWith('/.dir') ? 'directory' : 'file',
          data: dataStr,
          size,
          mtime: Date.now(),
        };
        
        const request = store.put(entry);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    },
    async rm(path: string, opts?: { recursive?: boolean }): Promise<void> {
      const db = await getDb();
      const normalized = normalizePath(path);
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('parent');
        
        if (opts?.recursive) {
          // Delete all children recursively
          const toDelete: string[] = [normalized];
          
          const deleteRecursive = (parentPath: string) => {
            const parentNormalized = normalizePath(parentPath);
            const request = index.getAll(parentNormalized + '/');
            
            request.onsuccess = () => {
              const children = request.result;
              children.forEach((child: any) => {
                toDelete.push(child.path);
                if (child.type === 'directory') {
                  deleteRecursive('/' + child.path);
                }
              });
              
              // Delete all collected paths
              let deleted = 0;
              toDelete.forEach((p: string) => {
                const deleteRequest = store.delete(p);
                deleteRequest.onsuccess = () => {
                  deleted++;
                  if (deleted === toDelete.length) {
                    resolve();
                  }
                };
                deleteRequest.onerror = () => reject(deleteRequest.error);
              });
            };
            request.onerror = () => reject(request.error);
          };
          
          deleteRecursive(path);
        } else {
          const request = store.delete(normalized);
          request.onerror = () => reject(request.error);
          request.onsuccess = () => {
            // Also delete directory marker if it exists
            if (normalized.endsWith('/.dir')) {
              const dirPath = normalized.slice(0, -5);
              store.delete(dirPath + '/.dir').onsuccess = () => resolve();
            } else {
              resolve();
            }
          };
        }
      });
    },
    async readdir(path: string): Promise<Entry[]> {
      const db = await getDb();
      const normalized = normalizePath(path);
      const parentPath = normalized.endsWith('/') ? normalized : normalized + '/';
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('parent');
        const request = index.getAll(parentPath);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const entries: Entry[] = [];
          const seenDirs = new Set<string>();
          
          request.result.forEach((item: any) => {
            // Skip directory markers
            if (item.path.endsWith('/.dir')) return;
            
            const relativePath = item.path.slice(parentPath.length);
            const parts = relativePath.split('/');
            const name = parts[0];
            
            if (parts.length === 1) {
              // Direct child
              entries.push({
                name,
                path: '/' + item.path,
                stat: {
                  type: item.type,
                  size: item.size || 0,
                  mtime: item.mtime || Date.now(),
                },
              });
            } else {
              // Subdirectory
              const dirName = name;
              const dirPath = parentPath + dirName;
              if (!seenDirs.has(dirPath)) {
                seenDirs.add(dirPath);
                entries.push({
                  name: dirName,
                  path: '/' + dirPath,
                  stat: {
                    type: 'directory',
                    size: 0,
                    mtime: Date.now(),
                  },
                });
              }
            }
          });
          
          resolve(entries);
        };
      });
    },
  };
}

