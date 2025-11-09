import React from 'react';
import { App } from './App';
import { Window } from '@browser-os/windowing';
import { WindowManager } from '@browser-os/windowing';
import { ProcessManager } from '@browser-os/process';
import { EventBus, AppManifest } from '@browser-os/core';

/**
 * Manages app instances, registration, and lifecycle
 * Coordinates between apps, windows, and processes
 * Supports both App instances and manifest-based loading
 */
export class AppManager {
  private apps: Map<string, App> = new Map();
  private manifests: Map<string, AppManifest> = new Map();
  private windowManager: WindowManager;
  private processManager: ProcessManager;
  private eventBus: EventBus;
  
  constructor(
    windowManager: WindowManager,
    processManager: ProcessManager,
    eventBus: EventBus
  ) {
    this.windowManager = windowManager;
    this.processManager = processManager;
    this.eventBus = eventBus;
    
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
   * Register an app manifest (for legacy/manifest-based apps)
   */
  registerManifest(manifest: AppManifest): void {
    this.manifests.set(manifest.id, manifest);
  }
  
  /**
   * Register multiple manifests
   */
  registerManifests(manifests: AppManifest[]): void {
    manifests.forEach(manifest => this.registerManifest(manifest));
  }
  
  /**
   * Get app manifest by ID
   */
  getManifest(appId: string): AppManifest | undefined {
    return this.manifests.get(appId);
  }
  
  /**
   * Get all manifests
   */
  getAllManifests(): AppManifest[] {
    return Array.from(this.manifests.values());
  }
  
  /**
   * Load app component from manifest (for legacy apps)
   */
  async loadAppFromManifest(appId: string): Promise<React.ComponentType<any> | null> {
    const manifest = this.manifests.get(appId);
    if (!manifest) {
      return null;
    }
    
    try {
      // Dynamic import of the app entry point - entry is a string path
      const entryPath: string = manifest.entry;
      const module = await import(entryPath);
      return module.default || module[appId] || null;
    } catch (error: any) {
      console.error(`Failed to load app ${appId}:`, error);
      return null;
    }
  }
  
  /**
   * Check if app is registered (either as instance or manifest)
   */
  hasApp(appId: string): boolean {
    return this.apps.has(appId) || this.manifests.has(appId);
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
   * Works with both App instances and manifest-based apps
   */
  async launchApp(appId: string, config?: Record<string, any>): Promise<Window> {
    // First try to get App instance
    let app = this.apps.get(appId);
    
    // If not found, try to load from manifest (legacy)
    if (!app) {
      const component = await this.loadAppFromManifest(appId);
      if (component) {
        // For legacy apps, create a window directly
        const { EventBus } = await import('@browser-os/core');
        const { Window } = await import('@browser-os/windowing');
        const window = new Window(
          appId,
          config?.title || appId,
          config?.bounds || { x: 100, y: 100, w: 800, h: 600 },
          config?.workspaceId || 'default',
          config,
          this.eventBus
        );
        
        // Register window with window manager
        this.windowManager.registerWindow(window);
        
        return window;
      }
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
   * Works with both App instances and manifest-based apps
   */
  async getAppComponent(windowId: string): Promise<React.ComponentType<any> | null> {
    const window = this.windowManager.windows.get(windowId);
    if (!window) return null;
    
    // First try to get App instance
    const app = this.apps.get(window.appId);
    if (app) {
      return app.createComponent(window, window.payload);
    }
    
    // Fallback to manifest-based loading (legacy)
    return await this.loadAppFromManifest(window.appId);
  }
}

