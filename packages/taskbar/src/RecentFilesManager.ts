import type { FileSystem } from '@browser-os/fs';
import { SystemConfigSchema } from '@browser-os/schemas';

export interface RecentFile {
  path: string;
  timestamp: number;
  title?: string;
}

export interface RecentFilesData {
  [appId: string]: RecentFile[];
}

const RECENT_FILES_PATH = '/etc/recent-files.json';
const CONFIG_PATH = '/etc/config.json';

/**
 * Manages recently opened files per application
 * Stores data in VFS at /etc/recent-files.json
 */
export class RecentFilesManager {
  private fs: FileSystem;
  private data: RecentFilesData = {};
  private maxRecentFiles: number = 10;
  private initialized: boolean = false;

  constructor(fs: FileSystem) {
    this.fs = fs;
  }

  /**
   * Initialize the manager - load data and config
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      // Load maxRecentFiles from system config
      if (await this.fs.exists(CONFIG_PATH)) {
        const configData = await this.fs.read(CONFIG_PATH);
        const configJson = new TextDecoder().decode(configData);
        const config = SystemConfigSchema.parse(JSON.parse(configJson));
        this.maxRecentFiles = config.system.maxRecentFiles ?? 10;
      }

      // Load recent files data
      await this.load();
      this.initialized = true;
    } catch (error) {
      console.error('[RecentFilesManager] Failed to initialize:', error);
      // Continue with defaults
      this.initialized = true;
    }
  }

  /**
   * Load recent files from VFS
   */
  async load(): Promise<void> {
    try {
      if (await this.fs.exists(RECENT_FILES_PATH)) {
        const data = await this.fs.read(RECENT_FILES_PATH);
        const json = new TextDecoder().decode(data);
        this.data = JSON.parse(json);
      } else {
        this.data = {};
      }
    } catch (error) {
      console.error('[RecentFilesManager] Failed to load recent files:', error);
      this.data = {};
    }
  }

  /**
   * Save recent files to VFS
   */
  async save(): Promise<void> {
    try {
      // Ensure /etc directory exists
      if (!(await this.fs.exists('/etc'))) {
        await this.fs.mkdir('/etc', { recursive: true });
      }

      const json = JSON.stringify(this.data, null, 2);
      const data = new TextEncoder().encode(json);
      await this.fs.write(RECENT_FILES_PATH, data);
    } catch (error) {
      console.error('[RecentFilesManager] Failed to save recent files:', error);
    }
  }

  /**
   * Add a recent file for an app
   */
  async addRecentFile(appId: string, path: string, title?: string): Promise<void> {
    if (!this.initialized) {
      await this.init();
    }

    if (!this.data[appId]) {
      this.data[appId] = [];
    }

    // Remove existing entry for this path (if any)
    this.data[appId] = this.data[appId].filter((f) => f.path !== path);

    // Add new entry at the beginning
    this.data[appId].unshift({
      path,
      timestamp: Date.now(),
      title,
    });

    // Trim to maxRecentFiles
    if (this.data[appId].length > this.maxRecentFiles) {
      this.data[appId] = this.data[appId].slice(0, this.maxRecentFiles);
    }

    await this.save();
  }

  /**
   * Get recent files for an app
   */
  getRecentFiles(appId: string): RecentFile[] {
    return this.data[appId] || [];
  }

  /**
   * Update maxRecentFiles from system config
   */
  async updateMaxRecentFiles(): Promise<void> {
    try {
      if (await this.fs.exists(CONFIG_PATH)) {
        const configData = await this.fs.read(CONFIG_PATH);
        const configJson = new TextDecoder().decode(configData);
        const config = SystemConfigSchema.parse(JSON.parse(configJson));
        const newMax = config.system.maxRecentFiles ?? 10;

        if (newMax !== this.maxRecentFiles) {
          this.maxRecentFiles = newMax;
          // Trim all apps' recent files
          for (const appId in this.data) {
            if (this.data[appId].length > this.maxRecentFiles) {
              this.data[appId] = this.data[appId].slice(0, this.maxRecentFiles);
            }
          }
          await this.save();
        }
      }
    } catch (error) {
      console.error('[RecentFilesManager] Failed to update maxRecentFiles:', error);
    }
  }
}

