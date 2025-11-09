import { createIdbDriver } from '@browser-os/fs';

const SETTINGS_DB_NAME = 'browser-os-settings';
const SETTINGS_STORE_NAME = 'settings';

interface SettingsStore {
  get<T = any>(key: string): Promise<T | undefined>;
  set<T = any>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  getAll(): Promise<Record<string, any>>;
  clear(): Promise<void>;
}

class SettingsStoreImpl implements SettingsStore {
  private dbPromise: Promise<IDBDatabase> | null = null;
  
  private getDb(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;
    
    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(SETTINGS_DB_NAME, 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(SETTINGS_STORE_NAME)) {
          db.createObjectStore(SETTINGS_STORE_NAME, { keyPath: 'key' });
        }
      };
    });
    
    return this.dbPromise;
  }
  
  async get<T = any>(key: string): Promise<T | undefined> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([SETTINGS_STORE_NAME], 'readonly');
      const store = transaction.objectStore(SETTINGS_STORE_NAME);
      const request = store.get(key);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : undefined);
      };
    });
  }
  
  async set<T = any>(key: string, value: T): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([SETTINGS_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(SETTINGS_STORE_NAME);
      const request = store.put({ key, value });
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
  
  async delete(key: string): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([SETTINGS_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(SETTINGS_STORE_NAME);
      const request = store.delete(key);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
  
  async getAll(): Promise<Record<string, any>> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([SETTINGS_STORE_NAME], 'readonly');
      const store = transaction.objectStore(SETTINGS_STORE_NAME);
      const request = store.getAll();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result: Record<string, any> = {};
        request.result.forEach((item: any) => {
          result[item.key] = item.value;
        });
        resolve(result);
      };
    });
  }
  
  async clear(): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([SETTINGS_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(SETTINGS_STORE_NAME);
      const request = store.clear();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export const settingsStore = new SettingsStoreImpl();

export async function getSetting<T = any>(key: string): Promise<T | undefined> {
  return settingsStore.get<T>(key);
}

export async function setSetting<T = any>(key: string, value: T): Promise<void> {
  return settingsStore.set(key, value);
}

export async function deleteSetting(key: string): Promise<void> {
  return settingsStore.delete(key);
}

export async function getAllSettings(): Promise<Record<string, any>> {
  return settingsStore.getAll();
}

export async function clearSettings(): Promise<void> {
  return settingsStore.clear();
}
