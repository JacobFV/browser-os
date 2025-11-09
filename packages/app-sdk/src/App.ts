import React from 'react';
import { Window } from '@browser-os/windowing';
import { ProcessManager } from '@browser-os/process';
import type { Pid } from '@browser-os/process';
import { WindowBounds, WindowState, EventBus, Container } from '@browser-os/core';

/**
 * Abstract base class for all applications in browser-os
 * 
 * Key principles:
 * - Apps are processes with state, lifecycle, and business logic
 * - Apps initialize their own Window instances
 * - Windows are controlled by both App and OS (shared control)
 * - React components are views created by apps, not apps themselves
 */
export abstract class App {
  // Identity
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly version: string;
  
  // Process management
  protected pid?: Pid;
  protected processManager: ProcessManager;
  protected eventBus: EventBus;
  protected container: Container;
  
  // State management (app-level, shared across windows)
  protected state: Map<string, any> = new Map();
  
  // Window tracking (apps own their windows)
  protected windows: Map<string, Window> = new Map();
  
  constructor(container: Container) {
    this.container = container;
    this.processManager = container.resolve('processManager');
    this.eventBus = container.resolve('eventBus');
  }
  
  /**
   * Initialize and return a Window instance for this app
   * Apps create their own windows - this is called when launching
   */
  abstract initialWindow(config?: Record<string, any>): Window;
  
  /**
   * Create a React component for rendering this app's UI in a window
   * Component receives the Window instance and any config
   */
  abstract createComponent(
    window: Window,
    config?: Record<string, any>
  ): React.ComponentType<any>;
  
  /**
   * Lifecycle: Called when app is launched (first window opened)
   */
  onLaunch?(window: Window, config?: Record<string, any>): void | Promise<void>;
  
  /**
   * Lifecycle: Called when app is closed (last window closed)
   */
  onClose?(window: Window): void | Promise<void>;
  
  /**
   * Lifecycle: Called when a new window is created for this app
   */
  onWindowCreated?(window: Window): void;
  
  /**
   * Lifecycle: Called when a window is destroyed
   */
  onWindowDestroyed?(window: Window): void;
  
  /**
   * Get all windows for this app instance
   */
  getWindows(): Window[] {
    return Array.from(this.windows.values());
  }
  
  /**
   * Get window by ID
   */
  getWindow(windowId: string): Window | undefined {
    return this.windows.get(windowId);
  }
  
  /**
   * Create a new window (for multi-window apps)
   */
  createWindow(config?: Record<string, any>): Window {
    return this.initialWindow(config);
  }
  
  /**
   * Register a window with this app
   * Called by AppManager when window is created
   */
  registerWindow(window: Window): void {
    this.windows.set(window.id, window);
    this.onWindowCreated?.(window);
    
    // If this is the first window, launch the app
    if (this.windows.size === 1) {
      this.onLaunch?.(window);
    }
  }
  
  /**
   * Unregister a window from this app
   * Called by AppManager when window is destroyed
   */
  unregisterWindow(windowId: string): void {
    const window = this.windows.get(windowId);
    if (window) {
      this.windows.delete(windowId);
      this.onWindowDestroyed?.(window);
      
      // If this was the last window, close the app
      if (this.windows.size === 0) {
        this.onClose?.(window);
      }
    }
  }
  
  /**
   * Initialize app process
   */
  protected initialize(): void {
    if (!this.pid) {
      this.pid = this.processManager.spawnApp(this.id);
    }
  }
  
  /**
   * Cleanup app process
   */
  protected cleanup(): void {
    if (this.pid) {
      this.processManager.kill(this.pid);
      this.pid = undefined;
    }
  }
  
  /**
   * Get app process ID
   */
  getPid(): Pid | undefined {
    return this.pid;
  }
  
  /**
   * Get app state value
   */
  getState<T = any>(key: string): T | undefined {
    return this.state.get(key) as T | undefined;
  }
  
  /**
   * Set app state value
   */
  setState(key: string, value: any): void {
    this.state.set(key, value);
  }
  
  /**
   * Check if app has a window
   */
  hasWindow(windowId: string): boolean {
    return this.windows.has(windowId);
  }
}

