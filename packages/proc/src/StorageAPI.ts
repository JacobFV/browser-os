/**
 * Storage API for processes to manage localStorage/sessionStorage
 */

/**
 * Storage API factory
 */
export class StorageAPI {
  private syscall: (name: string, args: Record<string, unknown>) => Promise<unknown>;

  constructor(syscall: (name: string, args: Record<string, unknown>) => Promise<unknown>) {
    this.syscall = syscall;
  }

  /**
   * Get value from storage
   */
  async get(key: string): Promise<string | null> {
    return (await this.syscall('storage.get', { key })) as string | null;
  }

  /**
   * Set value in storage
   */
  async set(key: string, value: string): Promise<void> {
    await this.syscall('storage.set', { key, value });
  }

  /**
   * Remove value from storage
   */
  async remove(key: string): Promise<void> {
    await this.syscall('storage.remove', { key });
  }

  /**
   * Clear all storage for this app
   */
  async clear(): Promise<void> {
    await this.syscall('storage.clear', {});
  }

  /**
   * Get all keys
   */
  async keys(): Promise<string[]> {
    return (await this.syscall('storage.keys', {})) as string[];
  }

  /**
   * Check if key exists
   */
  async has(key: string): Promise<boolean> {
    return (await this.syscall('storage.has', { key })) as boolean;
  }

  /**
   * Get number of keys
   */
  async size(): Promise<number> {
    return (await this.syscall('storage.size', {})) as number;
  }

  /**
   * Get JSON value from storage
   */
  async getJSON<T = unknown>(key: string): Promise<T | null> {
    return (await this.syscall('storage.getJSON', { key })) as T | null;
  }

  /**
   * Set JSON value in storage
   */
  async setJSON(key: string, value: unknown): Promise<void> {
    await this.syscall('storage.setJSON', { key, value });
  }
}

