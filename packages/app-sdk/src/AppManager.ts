import React from 'react';
import { App } from './App';
import { AppLoader } from './AppLoader';
import { Window } from '@browser-os/windowing';
import { WindowManager } from '@browser-os/windowing';
import { ProcessManager } from '@browser-os/process';
import { EventBus } from '@browser-os/core';

/**
 * Manages app instances, registration, and lifecycle
 * Coordinates between apps, windows, and processes
 */
export class AppManager {
  private apps: Map<string, App> = new Map();
  private windowManager: WindowManager;
  private processManager: ProcessManager;
  private eventBus: EventBus;
  private appLoader?: AppLoader;
  
  constructor(
    windowManager: WindowManager,
    processManager: ProcessManager,
    eventBus: EventBus,
    appLoader?: AppLoader
  ) {
    this.windowManager = windowManager;
    this.processManager = processManager;
    this.eventBus = eventBus;
    this.appLoader = appLoader;
    
    // Listen for window close events
    this.eventBus.on('window', (event) => {
      if (event.type === 'close') {
        const window = this.windowManager.windows.get(event.winId);
        if (window) {
          const app = this.apps.get(window.appId);
          if (app) {
            app.unregisterWindow(event.winId);
          }
        }
      }
    });
  }
  
  /**
   * Register an app instance
   */
  registerApp(app: App): void {
    if (this.apps.has(app.id)) {
      throw new Error(`App ${app.id} is already registered`);
    }
    this.apps.set(app.id, app);
  }
  
  /**
   * Register multiple apps
   */
  registerApps(apps: App[]): void {
    apps.forEach(app => this.registerApp(app));
  }
  
  /**
   * Check if app is registered
   */
  hasApp(appId: string): boolean {
    return this.apps.has(appId);
  }
  
  /**
   * Get app by ID
   */
  getApp(appId: string): App | undefined {
    return this.apps.get(appId);
  }
  
  /**
   * Get all registered apps
   */
  getAllApps(): App[] {
    return Array.from(this.apps.values());
  }
  
  /**
   * Launch an app (create window)
   * If app is not found in registry, attempts to load from VFS using PATH
   */
  async launchApp(appId: string, config?: Record<string, unknown>): Promise<Window> {
    let app = this.apps.get(appId);
    
    // If app not found and we have an app loader, try loading from VFS
    if (!app && this.appLoader) {
      try {
        app = await this.appLoader.loadApp(appId);
        this.registerApp(app);
      } catch (error) {
        throw new Error(`App ${appId} not found and could not be loaded from VFS: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    if (!app) {
      throw new Error(`App ${appId} not found`);
    }
    
    // App creates its own window instance
    const window = app.initialWindow(config);
    
    // Register window with window manager
    this.windowManager.registerWindow(window);
    
    // Register window with app
    app.registerWindow(window);
    
    // Emit window open event
    this.eventBus.emit('window', { type: 'open', winId: window.id, appId });
    
    return window;
  }
  
  /**
   * Close a window (and potentially the app)
   */
  closeWindow(windowId: string): void {
    const window = this.windowManager.windows.get(windowId);
    if (!window) return;
    
    const app = this.apps.get(window.appId);
    if (app) {
      app.unregisterWindow(windowId);
    }
    
    this.windowManager.windows.delete(windowId);
    if (this.windowManager.focusedWindowId === windowId) {
      this.windowManager.focusedWindowId = null;
    }
    
    this.eventBus.emit('window', { type: 'close', winId: windowId });
  }
  
  /**
   * Close an app (close all windows)
   */
  closeApp(appId: string): void {
    const app = this.apps.get(appId);
    if (!app) return;
    
    const windows = app.getWindows();
    windows.forEach(window => {
      this.closeWindow(window.id);
    });
  }
  
  /**
   * Suspend app (suspend all processes)
   */
  suspendApp(appId: string): void {
    const app = this.apps.get(appId);
    if (!app) return;
    
    const processes = this.processManager.getProcessByAppId(appId);
    processes.forEach(proc => {
      this.processManager.suspend(proc.pid);
    });
  }
  
  /**
   * Resume app (resume all processes)
   */
  resumeApp(appId: string): void {
    const app = this.apps.get(appId);
    if (!app) return;
    
    const processes = this.processManager.getProcessByAppId(appId);
    processes.forEach(proc => {
      this.processManager.resume(proc.pid);
    });
  }
  
  /**
   * Get component for rendering an app in a window
   */
  async getAppComponent(windowId: string): Promise<React.ComponentType | null> {
    const window = this.windowManager.windows.get(windowId);
    if (!window) return null;
    
    const app = this.apps.get(window.appId);
    if (!app) return null;
    
    return app.createComponent(window, window.payload);
  }
}

