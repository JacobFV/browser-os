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
      const exists = await this.fs.exists(REGISTRY_PATH);
      if (!exists) {
        // Create empty registry
        await this.save();
        return;
      }

      const data = await this.fs.read(REGISTRY_PATH);
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
      this.eventBus?.emit('registry:loaded', { count: this.entries.size }, { source: 'app-registry' });
    } catch (error) {
      console.error('Failed to load registry:', error);
      // Start with empty registry if load fails
      this.entries.clear();
      this.loaded = true;
    }
  }

  /**
   * Save registry to filesystem
   */
  async save(): Promise<void> {
    if (!this.loaded) {
      await this.load();
    }

    const entries = Array.from(this.entries.values());
    const json = JSON.stringify(entries, null, 2);
    const data = new TextEncoder().encode(json);

    // Ensure /etc directory exists
    try {
      await this.fs.mkdir('/etc', { recursive: true });
    } catch {
      // Directory might already exist
    }

    await this.fs.write(REGISTRY_PATH, data);
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

