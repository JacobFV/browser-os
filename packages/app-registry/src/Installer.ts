import type { AppManifest } from '@browser-os/schemas';
import { AppManifestSchema } from '@browser-os/schemas';
import type { FileSystem } from '@browser-os/fs';
import { EventBus } from '@browser-os/events';
import { AppRegistry } from './AppRegistry';

export interface InstallerOptions {
  registry: AppRegistry;
  fs: FileSystem;
  eventBus?: EventBus;
  userId?: string;
}

/**
 * Handles app installation and uninstallation
 */
export class Installer {
  private registry: AppRegistry;
  private fs: FileSystem;
  private eventBus?: EventBus;
  private userId: string;

  constructor(options: InstallerOptions) {
    this.registry = options.registry;
    this.fs = options.fs;
    this.eventBus = options.eventBus;
    this.userId = options.userId ?? 'system';
  }

  /**
   * Install an app
   */
  async install(
    appId: string,
    code: string | Uint8Array,
    manifest: AppManifest,
    options?: { enabled?: boolean }
  ): Promise<void> {
    // Validate manifest
    const validatedManifest = AppManifestSchema.parse(manifest);

    // Ensure manifest ID matches appId
    if (validatedManifest.id !== appId) {
      throw new Error(`Manifest ID (${validatedManifest.id}) does not match appId (${appId})`);
    }

    // Ensure /bin directory exists
    try {
      await this.fs.mkdir('/bin', { recursive: true });
    } catch {
      // Directory might already exist
    }

    // Write app code to /bin/<app-id>.js
    const appPath = `/bin/${appId}.js`;
    const codeBytes = typeof code === 'string' ? new TextEncoder().encode(code) : code;
    await this.fs.write(appPath, codeBytes);

    // Add entry to registry
    const entry = {
      id: appId,
      installedAt: Date.now(),
      installedBy: this.userId,
      enabled: options?.enabled ?? true,
      manifest: validatedManifest,
    };

    this.registry.add(entry);
    await this.registry.save();

    this.eventBus?.emit('app:installed', { appId, manifest: validatedManifest }, { source: 'app-registry' });
  }

  /**
   * Uninstall an app
   */
  async uninstall(appId: string): Promise<void> {
    const entry = this.registry.get(appId);
    if (!entry) {
      throw new Error(`App ${appId} is not installed`);
    }

    // Remove app code from /bin
    const appPath = `/bin/${appId}.js`;
    try {
      await this.fs.delete(appPath);
    } catch (error) {
      console.warn(`Failed to delete app file ${appPath}:`, error);
      // Continue with uninstallation even if file deletion fails
    }

    // Remove from registry
    this.registry.remove(appId);
    await this.registry.save();

    this.eventBus?.emit('app:uninstalled', { appId }, { source: 'app-registry' });
  }

  /**
   * Enable an app
   */
  async enable(appId: string): Promise<void> {
    const entry = this.registry.get(appId);
    if (!entry) {
      throw new Error(`App ${appId} is not installed`);
    }

    entry.enabled = true;
    this.registry.add(entry);
    await this.registry.save();

    this.eventBus?.emit('app:enabled', { appId }, { source: 'app-registry' });
  }

  /**
   * Disable an app
   */
  async disable(appId: string): Promise<void> {
    const entry = this.registry.get(appId);
    if (!entry) {
      throw new Error(`App ${appId} is not installed`);
    }

    entry.enabled = false;
    this.registry.add(entry);
    await this.registry.save();

    this.eventBus?.emit('app:disabled', { appId }, { source: 'app-registry' });
  }
}

