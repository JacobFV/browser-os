import React from 'react';
import { App } from './App';
import { AppManager } from './AppManager';
import { WindowManager, windowManager } from '@browser-os/windowing';
import { ProcessManager, processManager } from '@browser-os/process';
import { WorkspaceManager, workspaceManager } from '@browser-os/workspace';
import { EventBus, eventBus } from '@browser-os/core';
import { VFS, vfs } from '@browser-os/fs';

export interface OSConfig {
  apps?: App[];
  windowManager?: WindowManager;
  processManager?: ProcessManager;
  workspaceManager?: WorkspaceManager;
  eventBus?: EventBus;
  vfs?: typeof vfs;
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
  private vfs: typeof vfs;
  
  constructor(config: OSConfig = {}) {
    // Initialize subsystems
    this.eventBus = config.eventBus || eventBus;
    this.vfs = config.vfs || vfs;
    this.processManager = config.processManager || processManager;
    this.windowManager = config.windowManager || windowManager;
    this.workspaceManager = config.workspaceManager || workspaceManager;
    
    // Create app manager
    this.appManager = new AppManager(
      this.windowManager,
      this.processManager
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
  getVFS(): typeof vfs {
    return this.vfs;
  }
  
  /**
   * Launch an app
   */
  launchApp(appId: string, config?: Record<string, any>): import('@browser-os/windowing').Window {
    return this.appManager.launchApp(appId, config);
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

