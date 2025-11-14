import { App } from './App';
import { Container } from '@browser-os/core';
import { VfsImpl } from '@browser-os/fs';

/**
 * Metadata format for apps stored in VFS
 */
export interface AppMetadata {
  id: string;
  modulePath: string;
  className: string;
}

/**
 * Service for loading apps from VFS
 * Handles reading app metadata and dynamically importing/instantiating app classes
 */
export class AppLoader {
  private vfs: VfsImpl;
  private container: Container;
  private loadedModules: Map<string, any> = new Map();

  constructor(vfs: VfsImpl, container: Container) {
    this.vfs = vfs;
    this.container = container;
  }

  /**
   * Load app metadata from VFS
   */
  async loadAppMetadata(appId: string, path?: string): Promise<AppMetadata> {
    // If path is provided, use it directly
    if (path) {
      const metadataPath = path.endsWith('.json') ? path : `${path}.json`;
      const content = await this.vfs.read(metadataPath, { binary: false }) as string;
      return JSON.parse(content) as AppMetadata;
    }

    // Otherwise, search PATH for the app
    const pathEnv = 'vfs://bin/';
    const metadataPath = `${pathEnv}${appId}.json`;
    
    try {
      const content = await this.vfs.read(metadataPath, { binary: false }) as string;
      return JSON.parse(content) as AppMetadata;
    } catch (error) {
      throw new Error(`App ${appId} not found in PATH (${pathEnv})`);
    }
  }

  /**
   * Load and instantiate an app from VFS
   */
  async loadApp(appId: string, path?: string): Promise<App> {
    const metadata = await this.loadAppMetadata(appId, path);
    
    // Check if module is already loaded
    if (!this.loadedModules.has(metadata.modulePath)) {
      // Dynamically import the module
      const module = await import(metadata.modulePath);
      this.loadedModules.set(metadata.modulePath, module);
    }
    
    const module = this.loadedModules.get(metadata.modulePath);
    const AppClass = module[metadata.className];
    
    if (!AppClass) {
      throw new Error(`Class ${metadata.className} not found in module ${metadata.modulePath}`);
    }
    
    // Instantiate the app
    const app = new AppClass(this.container);
    
    // Verify it's the correct app
    if (app.id !== metadata.id) {
      throw new Error(`App ID mismatch: expected ${metadata.id}, got ${app.id}`);
    }
    
    return app;
  }

  /**
   * Register app metadata to VFS
   */
  async registerAppToVFS(metadata: AppMetadata, path?: string): Promise<void> {
    const targetPath = path || `vfs://bin/${metadata.id}.json`;
    const content = JSON.stringify(metadata, null, 2);
    await this.vfs.write(targetPath, content, { mkdirp: true });
  }
}

