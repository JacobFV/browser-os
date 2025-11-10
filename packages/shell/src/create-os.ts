import { OS, OSConfig } from '@browser-os/app-sdk';
import { Container } from '@browser-os/core';
import { EventBus } from '@browser-os/core';
import { ProcessManager } from '@browser-os/process';
import { WindowManagerImpl } from '@browser-os/windowing';
import { VfsImpl } from '@browser-os/fs';
import { SettingsStoreImpl } from '@browser-os/settings';
import { AppHost } from '@browser-os/app-host';
import { CursorManager } from '@browser-os/cursor';
import { NetworkManager } from '@browser-os/net';
import { NotificationManager } from '@browser-os/notif';
import { TelemetryManager } from '@browser-os/telemetry';

export interface OSInitOptions {
  // Optional container override for testing
  container?: Container;
  // Optional service overrides for testing
  eventBus?: EventBus;
  processManager?: ProcessManager;
  windowManager?: WindowManagerImpl;
  vfs?: VfsImpl;
  settingsStore?: SettingsStoreImpl;
  appHost?: AppHost;
  cursorManager?: CursorManager;
  networkManager?: NetworkManager;
  notificationManager?: NotificationManager;
  telemetryManager?: TelemetryManager;
  // Note: workspaceManager is created by OS after AppManager, so it's not in options
}

/**
 * Create an OS instance with properly configured container
 * 
 * This function sets up the dependency injection container with all core services
 * and creates the OS instance. This is the foundation for all shell initialization.
 * 
 * @param options - Optional configuration for OS creation
 * @returns Configured OS instance
 */
export function createOS(options?: OSInitOptions): OS {
  // Use provided container or create new one
  const container = options?.container || new Container();
  
  // Initialize container with dependencies if not already populated
  if (!options?.container) {
    // Create core event bus first (all other services depend on it)
    const eventBus = options?.eventBus || new EventBus();
    container.register('eventBus', eventBus);
    
    // Create process manager (depends on event bus)
    const processManager = options?.processManager || new ProcessManager(eventBus);
    container.register('processManager', processManager);
    
    // Create window manager
    const windowManager = options?.windowManager || new WindowManagerImpl(eventBus);
    container.register('windowManager', windowManager);
    
    // Create settings store
    const settingsStore = options?.settingsStore || new SettingsStoreImpl();
    container.register('settingsStore', settingsStore);
    
    // Create VFS
    const vfs = options?.vfs || new VfsImpl(eventBus);
    container.register('vfs', vfs);
    
    // Create app host
    const appHost = options?.appHost || new AppHost(processManager);
    container.register('appHost', appHost);
    
    // Create system services
    const cursorManager = options?.cursorManager || new CursorManager(eventBus);
    container.register('cursorManager', cursorManager);
    
    const networkManager = options?.networkManager || new NetworkManager();
    container.register('networkManager', networkManager);
    
    const notificationManager = options?.notificationManager || new NotificationManager(eventBus);
    container.register('notificationManager', notificationManager);
    
    const telemetryManager = options?.telemetryManager || new TelemetryManager(eventBus);
    container.register('telemetryManager', telemetryManager);
    
    // Note: AppManager is created by OS, not here
    // WorkspaceManager will be created by OS after AppManager exists
  }
  
  // Create OS with container
  // OS will create AppManager and WorkspaceManager internally
  const osConfig: OSConfig = {
    container,
  };
  
  return new OS(osConfig);
}

