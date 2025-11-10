import { App } from './App';
import { AppManager } from './AppManager';
import { Container } from '@browser-os/core';

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
}

