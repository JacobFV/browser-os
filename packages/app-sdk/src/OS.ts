import React from 'react';
import { App } from './App';
import { AppManager } from './AppManager';
import { AppLoader, AppMetadata } from './AppLoader';
import { WindowManager } from '@browser-os/windowing';
import { ProcessManager } from '@browser-os/process';
import { WorkspaceManager } from '@browser-os/workspace';
import { EventBus, Container } from '@browser-os/core';
import { VfsImpl } from '@browser-os/fs';
import { SettingsStoreImpl } from '@browser-os/settings';
import { AppHost } from '@browser-os/app-host';
import { CursorManager } from '@browser-os/cursor';
import { NetworkManager } from '@browser-os/net';
import { NotificationManager } from '@browser-os/notif';
import { TelemetryManager } from '@browser-os/telemetry';

export interface OSConfig {
  container: Container; // Required - container must be pre-configured
  apps?: App[];
}

/**
 * Top-level OS class that orchestrates all subsystems
 * This is the main entry point for browser-os
 * 
 * The OS constructor requires a pre-configured container. Use `createOS()` from
 * `@browser-os/shell` to create an OS instance with a properly configured container.
 */
export class OS {
  private container: Container;
  private appManager: AppManager;
  private windowManager: WindowManager;
  private processManager: ProcessManager;
  private workspaceManager: WorkspaceManager;
  private eventBus: EventBus;
  private vfs: VfsImpl;
  private settingsStore: SettingsStoreImpl;
  private appHost: AppHost;
  private cursorManager: CursorManager;
  private networkManager: NetworkManager;
  private notificationManager: NotificationManager;
  private telemetryManager: TelemetryManager;
  private appLoader: AppLoader;
  
  constructor(config: OSConfig) {
    if (!config.container) {
      throw new Error('OS requires a pre-configured container. Use createOS() from @browser-os/shell instead.');
    }
    
    this.container = config.container;
    
    // Resolve all dependencies from container
    this.eventBus = this.container.resolve('eventBus');
    this.processManager = this.container.resolve('processManager');
    this.windowManager = this.container.resolve('windowManager');
    this.settingsStore = this.container.resolve('settingsStore');
    this.vfs = this.container.resolve('vfs');
    this.appHost = this.container.resolve('appHost');
    this.cursorManager = this.container.resolve('cursorManager');
    this.networkManager = this.container.resolve('networkManager');
    this.notificationManager = this.container.resolve('notificationManager');
    this.telemetryManager = this.container.resolve('telemetryManager');
    
    // Resolve app manager from container
    this.appManager = this.container.resolve('appManager');
    
    // Create app loader if not in container
    if (this.container.has('appLoader')) {
      this.appLoader = this.container.resolve('appLoader');
    } else {
      this.appLoader = new AppLoader(this.vfs, this.container);
      this.container.register('appLoader', this.appLoader);
    }
    
    // Create workspace manager if not in container (it depends on AppManager)
    if (this.container.has('workspaceManager')) {
      this.workspaceManager = this.container.resolve('workspaceManager');
    } else {
      this.workspaceManager = new WorkspaceManager(
        this.windowManager,
        this.settingsStore,
        this.appManager
      );
      this.container.register('workspaceManager', this.workspaceManager);
    }
    
    // Register apps if provided
    if (config.apps) {
      this.appManager.registerApps(config.apps);
    }
  }
  
  /**
   * Get the dependency injection container
   */
  getContainer(): Container {
    return this.container;
  }
  
  /**
   * Get app manager
   */
  getAppManager(): AppManager {
    return this.appManager;
  }
  
  /**
   * Get window manager
   */
  getWindowManager(): WindowManager {
    return this.windowManager;
  }
  
  /**
   * Get process manager
   */
  getProcessManager(): ProcessManager {
    return this.processManager;
  }
  
  /**
   * Get workspace manager
   */
  getWorkspaceManager(): WorkspaceManager {
    return this.workspaceManager;
  }
  
  /**
   * Get event bus
   */
  getEventBus(): EventBus {
    return this.eventBus;
  }
  
  /**
   * Get VFS
   */
  getVFS(): VfsImpl {
    return this.vfs;
  }
  
  /**
   * Get settings store
   */
  getSettingsStore(): SettingsStoreImpl {
    return this.settingsStore;
  }
  
  /**
   * Get app host
   */
  getAppHost(): AppHost {
    return this.appHost;
  }
  
  /**
   * Get cursor manager
   */
  getCursorManager(): CursorManager {
    return this.cursorManager;
  }
  
  /**
   * Get network manager
   */
  getNetworkManager(): NetworkManager {
    return this.networkManager;
  }
  
  /**
   * Get notification manager
   */
  getNotificationManager(): NotificationManager {
    return this.notificationManager;
  }
  
  /**
   * Get telemetry manager
   */
  getTelemetryManager(): TelemetryManager {
    return this.telemetryManager;
  }
  
  /**
   * Launch an app
   */
  async launchApp(appId: string, config?: Record<string, unknown>): Promise<import('@browser-os/windowing').Window> {
    return await this.appManager.launchApp(appId, config);
  }

  /**
   * Close a window
   */
  closeWindow(windowId: string): void {
    this.appManager.closeWindow(windowId);
  }

  /**
   * Close an app
   */
  closeApp(appId: string): void {
    this.appManager.closeApp(appId);
  }

  /**
   * Register an app
   */
  registerApp(app: App): void {
    this.appManager.registerApp(app);
  }

  /**
   * Register multiple apps
   */
  registerApps(apps: App[]): void {
    this.appManager.registerApps(apps);
  }

  /**
   * Get app by ID
   */
  getApp(appId: string): App | undefined {
    return this.appManager.getApp(appId);
  }

  /**
   * Get all apps
   */
  getAllApps(): App[] {
    return this.appManager.getAllApps();
  }

  /**
   * Shutdown OS
   */
  shutdown(): void {
    // Close all apps
    const apps = this.appManager.getAllApps();
    apps.forEach(app => {
      this.appManager.closeApp(app.id);
    });
  }

  /**
   * Load an app from VFS using PATH resolution
   * This is the kernel-level app loading mechanism
   */
  async loadAppFromVFS(appId: string, path?: string): Promise<App> {
    const app = await this.appLoader.loadApp(appId, path);
    this.appManager.registerApp(app);
    return app;
  }

  /**
   * Register app metadata to VFS
   * This places the app in the VFS at the PATH location
   */
  async registerAppToVFS(metadata: AppMetadata, path?: string): Promise<void> {
    await this.appLoader.registerAppToVFS(metadata, path);
  }
}

