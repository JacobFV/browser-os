/**
 * Test setup - Mock browser APIs before any modules are loaded
 * This prevents IndexedDB and localStorage from being accessed during module resolution
 */

// Mock indexedDB
if (typeof globalThis.indexedDB === 'undefined') {
  globalThis.indexedDB = {
    open: () => ({
      onerror: null,
      onsuccess: null,
      onupgradeneeded: null,
      result: null,
      error: null,
    }),
  } as unknown as IDBFactory;
}

// Mock localStorage
if (typeof globalThis.localStorage === 'undefined') {
  const storage = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
    clear: () => storage.clear(),
    key: (index: number) => Array.from(storage.keys())[index] ?? null,
    get length() {
      return storage.size;
    },
  } as unknown as Storage;
}

