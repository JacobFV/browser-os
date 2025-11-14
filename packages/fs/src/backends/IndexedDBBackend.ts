import type { Backend } from './BaseBackend';
import type { FileMetadata } from '@browser-os/schemas';

/**
 * IndexedDB-based backend (persistent, larger storage)
 */
export class IndexedDBBackend implements Backend {
  private dbName: string;
  private storeName: string = 'files';
  private db: IDBDatabase | null = null;

  constructor(options?: { dbName?: string; storeName?: string }) {
    this.dbName = options?.dbName ?? 'browser-os-fs';
    if (options?.storeName) {
      this.storeName = options.storeName;
    }
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  private getStore(mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    const transaction = this.db.transaction([this.storeName], mode);
    return transaction.objectStore(this.storeName);
  }

  private async get(path: string): Promise<Uint8Array | null> {
    return new Promise((resolve, reject) => {
      const store = this.getStore();
      const request = store.get(path);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        if (result === undefined) {
          resolve(null);
        } else if (result instanceof Uint8Array) {
          resolve(result);
        } else if (result instanceof ArrayBuffer) {
          resolve(new Uint8Array(result));
        } else {
          resolve(null);
        }
      };
    });
  }

  async read(path: string): Promise<Uint8Array> {
    const data = await this.get(path);
    if (!data) {
      throw new Error(`File not found: ${path}`);
    }
    return data;
  }

  async write(path: string, data: Uint8Array): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('readwrite');
      const request = store.put(data, path);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async delete(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('readwrite');
      const request = store.delete(path);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async exists(path: string): Promise<boolean> {
    const data = await this.get(path);
    return data !== null;
  }

  async mkdir(path: string): Promise<void> {
    // In IndexedDB, directories are implicit based on path structure
    // We store a marker to indicate directory existence
    const marker = new Uint8Array([0]); // Empty marker
    await this.write(`${path}/.dir`, marker);
  }

  async rmdir(path: string): Promise<void> {
    // Check if directory has children
    const children = await this.readdir(path);
    if (children.length > 0) {
      throw new Error(`Directory not empty: ${path}`);
    }
    // Remove directory marker
    try {
      await this.delete(`${path}/.dir`);
    } catch {
      // Ignore if marker doesn't exist
    }
  }

  async readdir(path: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore();
      const request = store.openCursor();
      const entries = new Set<string>();
      const prefix = path === '/' ? '/' : `${path}/`;

      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const key = cursor.key as string;
          if (key.startsWith(prefix) && key !== `${prefix}.dir`) {
            const relative = key.slice(prefix.length);
            const name = relative.split('/')[0];
            if (name) entries.add(name);
          }
          cursor.continue();
        } else {
          resolve(Array.from(entries));
        }
      };
    });
  }

  async stat(path: string): Promise<FileMetadata> {
    const data = await this.get(path);
    const dirMarker = await this.get(`${path}/.dir`);

    if (!data && !dirMarker) {
      throw new Error(`Path not found: ${path}`);
    }

    const now = Date.now();
    return {
      path,
      type: dirMarker !== null ? 'directory' : 'file',
      size: data?.length ?? 0,
      createdAt: now,
      modifiedAt: now,
      permissions: 'rwxrwxrwx',
    };
  }
}

