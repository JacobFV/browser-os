import { EventBus } from './event-bus';
import { ProcessManager } from '@browser-os/process';
import { WindowManager } from '@browser-os/windowing';
import { WorkspaceManager } from '@browser-os/workspace';
import { VfsImpl } from '@browser-os/fs';
import { SettingsStoreImpl } from '@browser-os/settings';
import { AppHost } from '@browser-os/app-host';
import { CursorManager } from '@browser-os/cursor';
import { NetworkManager } from '@browser-os/net';
import { NotificationManager } from '@browser-os/notif';
import { TelemetryManager } from '@browser-os/telemetry';

/**
 * Type-safe dependency injection container
 * 
 * Defines all dependencies available in the system with compile-time type safety.
 * Prevents typos and type mismatches at compile time.
 */
export interface Dependencies {
  processManager: ProcessManager;
  eventBus: EventBus;
  vfs: VfsImpl;
  windowManager: WindowManager;
  workspaceManager: WorkspaceManager;
  settingsStore: SettingsStoreImpl;
  appHost: AppHost;
  cursorManager: CursorManager;
  networkManager: NetworkManager;
  notificationManager: NotificationManager;
  telemetryManager: TelemetryManager;
}

/**
 * Type-safe dependency injection container
 * 
 * Usage:
 * ```typescript
 * const container = new Container();
 * container.register('eventBus', new EventBus());
 * container.register('processManager', new ProcessManager(container.resolve('eventBus')));
 * 
 * // TypeScript enforces correct keys and types
 * const pm = container.resolve('processManager'); // Type: ProcessManager
 * ```
 */
export class Container {
  private services = new Map<keyof Dependencies, Dependencies[keyof Dependencies]>();
  private factories = new Map<keyof Dependencies, () => Dependencies[keyof Dependencies]>();

  /**
   * Register a service instance
   * @param key - Dependency key (type-safe)
   * @param instance - Service instance (type-safe)
   */
  register<K extends keyof Dependencies>(key: K, instance: Dependencies[K]): void {
    this.services.set(key, instance);
  }

  /**
   * Register a factory function for lazy initialization
   * @param key - Dependency key (type-safe)
   * @param factory - Factory function that creates the service (type-safe)
   */
  registerFactory<K extends keyof Dependencies>(key: K, factory: () => Dependencies[K]): void {
    this.factories.set(key, factory);
  }

  /**
   * Resolve a dependency
   * @param key - Dependency key (type-safe)
   * @returns Service instance (type-safe)
   * @throws Error if dependency not found
   */
  resolve<K extends keyof Dependencies>(key: K): Dependencies[K] {
    // Check for registered instance first
    if (this.services.has(key)) {
      return this.services.get(key)!;
    }
    
    // Check for factory and create instance
    if (this.factories.has(key)) {
      const instance = this.factories.get(key)!();
      // Cache the instance for future resolves
      this.services.set(key, instance);
      return instance;
    }
    
    throw new Error(`Dependency ${String(key)} not found. Make sure to register it before resolving.`);
  }

  /**
   * Check if a dependency is registered (either as instance or factory)
   * @param key - Dependency key (type-safe)
   * @returns True if dependency is available
   */
  has<K extends keyof Dependencies>(key: K): boolean {
    return this.services.has(key) || this.factories.has(key);
  }

  /**
   * Clear all registered services and factories
   */
  clear(): void {
    this.services.clear();
    this.factories.clear();
  }
}

