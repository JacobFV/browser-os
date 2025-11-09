import React from 'react';
import { App } from './App';
import { AppManager } from './AppManager';
import { WindowManager, WindowManagerImpl } from '@browser-os/windowing';
import { ProcessManager } from '@browser-os/process';
import { WorkspaceManager } from '@browser-os/workspace';
import { EventBus } from '@browser-os/core';
import { VfsImpl } from '@browser-os/fs';
import { SettingsStoreImpl } from '@browser-os/settings';
import { AppHost } from '@browser-os/app-host';
import { CursorManager } from '@browser-os/cursor';
import { NetworkManager } from '@browser-os/net';
import { NotificationManager } from '@browser-os/notif';
import { TelemetryManager } from '@browser-os/telemetry';

export interface OSConfig {
  apps?: App[];
  // Optional overrides for testing
  eventBus?: EventBus;
  windowManager?: WindowManager;
  processManager?: ProcessManager;
  workspaceManager?: WorkspaceManager;
  vfs?: VfsImpl;
  settingsStore?: SettingsStoreImpl;
  appHost?: AppHost;
  cursorManager?: CursorManager;
  networkManager?: NetworkManager;
  notificationManager?: NotificationManager;
  telemetryManager?: TelemetryManager;
}

/**
 * Top-level OS class that orchestrates all subsystems
 * This is the main entry point for browser-os
 */
export class OS {
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
  
  constructor(config: OSConfig = {}) {
    // Create core event bus first (all other services depend on it)
    this.eventBus = config.eventBus || new EventBus();
    
    // Create process manager
    this.processManager = config.processManager || new ProcessManager();
    
    // Create window manager
    this.windowManager = config.windowManager || new WindowManagerImpl(this.eventBus);
    
    // Create settings store
    this.settingsStore = config.settingsStore || new SettingsStoreImpl();
    
    // Create VFS
    this.vfs = config.vfs || new VfsImpl(this.eventBus);
    
    // Create app host
    this.appHost = config.appHost || new AppHost(this.processManager);
    
    // Create system services
    this.cursorManager = config.cursorManager || new CursorManager(this.eventBus);
    this.networkManager = config.networkManager || new NetworkManager();
    this.notificationManager = config.notificationManager || new NotificationManager(this.eventBus);
    this.telemetryManager = config.telemetryManager || new TelemetryManager(this.eventBus);
    
    // Create app manager (depends on window manager, process manager, and event bus)
    this.appManager = new AppManager(
      this.windowManager,
      this.processManager,
      this.eventBus
    );
    
    // Create workspace manager (depends on app manager)
    this.workspaceManager = config.workspaceManager || new WorkspaceManager(
      this.windowManager,
      this.settingsStore,
      this.appManager
    );
    
    // Register apps if provided
    if (config.apps) {
      this.appManager.registerApps(config.apps);
    }
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
  async launchApp(appId: string, config?: Record<string, any>): Promise<import('@browser-os/windowing').Window> {
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
}

