import type { AppRegistryEntry } from '@browser-os/schemas';
import { AppRegistryEntrySchema } from '@browser-os/schemas';
import type { FileSystem } from '@browser-os/fs';
import { EventBus } from '@browser-os/events';

const REGISTRY_PATH = '/etc/registry.json';

export interface AppRegistryOptions {
  fs: FileSystem;
  eventBus?: EventBus;
}

/**
 * Manages app registry
 */
export class AppRegistry {
  private entries: Map<string, AppRegistryEntry> = new Map();
  private fs: FileSystem;
  private eventBus?: EventBus;
  private loaded: boolean = false;

  constructor(options: AppRegistryOptions) {
    this.fs = options.fs;
    this.eventBus = options.eventBus;
  }

  /**
   * Initialize the registry (load from filesystem)
   */
  async init(): Promise<void> {
    await this.load();
  }

  /**
   * Load registry from filesystem
   */
  async load(): Promise<void> {
    try {
      console.log('[AppRegistry] Checking if registry exists at:', REGISTRY_PATH);
      const exists = await this.fs.exists(REGISTRY_PATH);
      console.log('[AppRegistry] Registry exists:', exists);
      
      if (!exists) {
        // Create empty registry - set loaded first to prevent infinite loop
        this.loaded = true;
        console.log('[AppRegistry] Creating empty registry...');
        await this.save();
        console.log('[AppRegistry] Empty registry created');
        return;
      }

      console.log('[AppRegistry] Reading registry file...');
      const data = await this.fs.read(REGISTRY_PATH);
      console.log('[AppRegistry] Registry file read, size:', data.length);
      
      const json = new TextDecoder().decode(data);
      const parsed = JSON.parse(json);

      if (!Array.isArray(parsed)) {
        throw new Error('Registry must be an array');
      }

      this.entries.clear();
      for (const entry of parsed) {
        const validated = AppRegistryEntrySchema.parse(entry);
        this.entries.set(validated.id, validated);
      }

      this.loaded = true;
      console.log('[AppRegistry] Registry loaded, entries:', this.entries.size);
      this.eventBus?.emit('registry:loaded', { count: this.entries.size }, { source: 'app-registry' });
    } catch (error) {
      console.error('[AppRegistry] Failed to load registry:', error);
      // Start with empty registry if load fails
      this.entries.clear();
      this.loaded = true;
    }
  }

  /**
   * Save registry to filesystem
   */
  async save(): Promise<void> {
    console.log('[AppRegistry] Saving registry...');
    // Don't call load() if we're already in the process of loading
    // This prevents infinite loops when the file doesn't exist
    if (!this.loaded) {
      console.log('[AppRegistry] Not loaded yet, loading first...');
      await this.load();
      // If load() created an empty registry, we're done
      if (this.loaded && this.entries.size === 0) {
        console.log('[AppRegistry] Load created empty registry, skipping save');
        return;
      }
    }

    const entries = Array.from(this.entries.values());
    const json = JSON.stringify(entries, null, 2);
    const data = new TextEncoder().encode(json);

    // Ensure /etc directory exists
    console.log('[AppRegistry] Ensuring /etc directory exists...');
    try {
      await this.fs.mkdir('/etc', { recursive: true });
      console.log('[AppRegistry] /etc directory ensured');
    } catch (error) {
      console.log('[AppRegistry] /etc directory creation (might already exist):', error);
      // Directory might already exist
    }

    console.log('[AppRegistry] Writing registry file...');
    await this.fs.write(REGISTRY_PATH, data);
    console.log('[AppRegistry] Registry file written');
    this.eventBus?.emit('registry:saved', { count: entries.length }, { source: 'app-registry' });
  }

  /**
   * Get all apps
   */
  list(): AppRegistryEntry[] {
    return Array.from(this.entries.values());
  }

  /**
   * Get app by ID
   */
  get(id: string): AppRegistryEntry | null {
    return this.entries.get(id) ?? null;
  }

  /**
   * Check if app is installed
   */
  isInstalled(id: string): boolean {
    return this.entries.has(id);
  }

  /**
   * Get enabled apps only
   */
  getEnabled(): AppRegistryEntry[] {
    return Array.from(this.entries.values()).filter((entry) => entry.enabled);
  }

  /**
   * Add an entry to the registry
   */
  add(entry: AppRegistryEntry): void {
    this.entries.set(entry.id, entry);
  }

  /**
   * Remove an entry from the registry
   */
  remove(id: string): void {
    this.entries.delete(id);
  }
}

