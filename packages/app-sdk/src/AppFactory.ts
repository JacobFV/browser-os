import { App } from './App';
import { AppManager } from './AppManager';
import { Container } from '@browser-os/core';
import { AppManifest } from '@browser-os/core';
import { Window } from '@browser-os/windowing';
import React from 'react';

/**
 * Factory for creating and registering apps
 * 
 * Centralizes app instantiation logic and handles dependency injection
 * through the Container. Automatically registers apps with AppManager.
 * 
 * Usage:
 * ```typescript
 * const factory = new AppFactory(container, appManager);
 * const terminalApp = factory.createApp(TerminalApp);
 * ```
 */
export class AppFactory {
  constructor(
    private container: Container,
    private appManager: AppManager
  ) {}

  /**
   * Create an app instance from a class
   * 
   * @param AppClass - App class constructor that accepts Container
   * @returns Created and registered app instance
   * @throws Error if app is already registered
   */
  createApp<T extends App>(
    AppClass: new (container: Container, ...args: unknown[]) => T,
    ...args: unknown[]
  ): T {
    const app = new AppClass(this.container, ...args);
    this.appManager.registerApp(app);
    return app;
  }

  /**
   * Create multiple apps from classes
   * 
   * @param appClasses - Array of app class constructors
   * @returns Array of created and registered app instances
   */
  createApps<T extends App>(
    appClasses: Array<new (container: Container, ...args: unknown[]) => T>
  ): T[] {
    return appClasses.map(AppClass => this.createApp(AppClass));
  }

  /**
   * Create an app from a manifest (for legacy/manifest-based apps)
   * 
   * This loads the app component dynamically and creates a wrapper App instance.
   * The manifest must already be registered with AppManager.
   * 
   * @param manifest - App manifest
   * @returns Promise resolving to created app instance
   * @throws Error if manifest not found or app fails to load
   */
  async createAppFromManifest(manifest: AppManifest): Promise<App> {
    // Ensure manifest is registered
    if (!this.appManager.getManifest(manifest.id)) {
      this.appManager.registerManifest(manifest);
    }

    // Load the app component
    const component = await this.appManager.loadAppFromManifest(manifest.id);
    if (!component) {
      throw new Error(`Failed to load app component for ${manifest.id}`);
    }

    // Create a wrapper App instance for manifest-based apps
    // This allows manifest-based apps to work with the App lifecycle system
    const ManifestApp = class extends App {
      readonly id = manifest.id;
      readonly name = manifest.name;
      readonly version = manifest.version;
      private Component: React.ComponentType;

      constructor(container: Container) {
        super(container);
        this.Component = component;
      }

      initialWindow(config?: Record<string, unknown>) {
        const { EventBus } = require('@browser-os/core');
        const eventBus = this.container.resolve('eventBus') as EventBus;
        
        return new Window(
          this.id,
          manifest.name,
          manifest.defaultWindow 
            ? { x: 100, y: 100, w: manifest.defaultWindow.w, h: manifest.defaultWindow.h }
            : { x: 100, y: 100, w: 800, h: 600 },
          config?.workspaceId as string || 'default',
          config,
          eventBus
        );
      }

      createComponent(window: Window, config?: Record<string, unknown>): React.ComponentType {
        const Component = this.Component;
        return () => React.createElement(Component, { window, config });
      }
    };

    const app = new ManifestApp(this.container);
    this.appManager.registerApp(app);
    return app;
  }

  /**
   * Create multiple apps from manifests
   * 
   * @param manifests - Array of app manifests
   * @returns Promise resolving to array of created app instances
   */
  async createAppsFromManifests(manifests: AppManifest[]): Promise<App[]> {
    return Promise.all(manifests.map(manifest => this.createAppFromManifest(manifest)));
  }
}

