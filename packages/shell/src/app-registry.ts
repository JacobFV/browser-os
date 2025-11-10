import { App } from '@browser-os/app-sdk';
import { AppManager } from '@browser-os/app-sdk';
import { Container } from '@browser-os/core';

/**
 * Plugin interface for app registration
 * Apps can register themselves via this interface
 */
export interface AppPlugin {
  id: string;
  createApp: (container: Container) => App;
}

/**
 * Registry for app plugins
 * Allows apps to register themselves dynamically instead of hardcoding imports
 */
export class AppRegistry {
  private plugins = new Map<string, AppPlugin>();
  
  /**
   * Register an app plugin
   */
  register(plugin: AppPlugin): void {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`App plugin ${plugin.id} is already registered`);
    }
    this.plugins.set(plugin.id, plugin);
  }
  
  /**
   * Register multiple app plugins
   */
  registerPlugins(plugins: AppPlugin[]): void {
    plugins.forEach(plugin => this.register(plugin));
  }
  
  /**
   * Create all registered apps and register them with AppManager
   */
  createApps(container: Container, appManager: AppManager): App[] {
    return Array.from(this.plugins.values()).map(plugin => {
      const app = plugin.createApp(container);
      appManager.registerApp(app);
      return app;
    });
  }
  
  /**
   * Get plugin by ID
   */
  getPlugin(id: string): AppPlugin | undefined {
    return this.plugins.get(id);
  }
  
  /**
   * Check if plugin is registered
   */
  hasPlugin(id: string): boolean {
    return this.plugins.has(id);
  }
  
  /**
   * Get all registered plugin IDs
   */
  getPluginIds(): string[] {
    return Array.from(this.plugins.keys());
  }
  
  /**
   * Clear all plugins
   */
  clear(): void {
    this.plugins.clear();
  }
}

