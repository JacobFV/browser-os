import type { EventBus } from '@browser-os/events';

export interface StorageManagerOptions {
  eventBus?: EventBus;
  prefix?: string; // Prefix for all keys (for namespacing per app)
}

/**
 * Storage Manager for localStorage/sessionStorage operations
 * Provides namespaced storage per app
 */
export class StorageManager {
  private eventBus?: EventBus;
  private prefix: string;
  private storage: Storage;

  constructor(options?: StorageManagerOptions) {
    this.eventBus = options?.eventBus;
    this.prefix = options?.prefix ?? '';
    // Use localStorage by default
    this.storage = window.localStorage;
  }

  /**
   * Set storage type (localStorage or sessionStorage)
   */
  setStorageType(type: 'localStorage' | 'sessionStorage'): void {
    this.storage = type === 'localStorage' ? window.localStorage : window.sessionStorage;
  }

  /**
   * Get namespaced key
   */
  private getKey(key: string): string {
    return this.prefix ? `${this.prefix}:${key}` : key;
  }

  /**
   * Get value from storage
   */
  get(key: string): string | null {
    try {
      return this.storage.getItem(this.getKey(key));
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  }

  /**
   * Set value in storage
   */
  set(key: string, value: string): void {
    try {
      this.storage.setItem(this.getKey(key), value);
      this.eventBus?.emit('storage:changed', { key, value }, { source: 'storage-manager' });
    } catch (error) {
      console.error('Storage set error:', error);
      throw new Error(`Failed to set storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Remove value from storage
   */
  remove(key: string): void {
    try {
      this.storage.removeItem(this.getKey(key));
      this.eventBus?.emit('storage:changed', { key, value: null }, { source: 'storage-manager' });
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  }

  /**
   * Clear all keys with this prefix
   */
  clear(): void {
    try {
      if (this.prefix) {
        // Only clear keys with this prefix
        const keys: string[] = [];
        for (let i = 0; i < this.storage.length; i++) {
          const key = this.storage.key(i);
          if (key && key.startsWith(`${this.prefix}:`)) {
            keys.push(key);
          }
        }
        keys.forEach((key) => this.storage.removeItem(key));
      } else {
        this.storage.clear();
      }
      this.eventBus?.emit('storage:cleared', {}, { source: 'storage-manager' });
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  }

  /**
   * Get all keys with this prefix
   */
  keys(): string[] {
    try {
      const result: string[] = [];
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key) {
          if (this.prefix) {
            if (key.startsWith(`${this.prefix}:`)) {
              result.push(key.substring(this.prefix.length + 1));
            }
          } else {
            result.push(key);
          }
        }
      }
      return result;
    } catch (error) {
      console.error('Storage keys error:', error);
      return [];
    }
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Get number of keys with this prefix
   */
  size(): number {
    return this.keys().length;
  }

  /**
   * Get JSON value from storage
   */
  getJSON<T = unknown>(key: string): T | null {
    const value = this.get(key);
    if (value === null) {
      return null;
    }
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  /**
   * Set JSON value in storage
   */
  setJSON(key: string, value: unknown): void {
    try {
      this.set(key, JSON.stringify(value));
    } catch (error) {
      throw new Error(`Failed to serialize JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

