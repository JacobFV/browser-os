import { OS, OSConfig } from '@browser-os/app-sdk';
import { Container } from '@browser-os/core';
import { EventBus, ViewportService, WindowPlacementService } from '@browser-os/core';
import { ProcessManager } from '@browser-os/process';
import { WindowManagerImpl } from '@browser-os/windowing';
import { VfsImpl } from '@browser-os/fs';
import { SettingsStoreImpl } from '@browser-os/settings';
import { AppHost } from '@browser-os/app-host';
import { CursorManager } from '@browser-os/cursor';
import { NetworkManager } from '@browser-os/net';
import { NotificationManager } from '@browser-os/notif';
import { TelemetryManager } from '@browser-os/telemetry';
import { AppManager } from '@browser-os/app-sdk';

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
  viewportService?: ViewportService;
  windowPlacementService?: WindowPlacementService;
  // Note: workspaceManager is created by OS after AppManager, so it's not in options
}

/**
 * Initialize container with all core services
 * 
 * This function sets up the dependency injection container with all core services.
 * It's extracted to avoid duplication and provide a single source of truth.
 * 
 * @param container - Container to initialize
 * @param options - Optional service overrides for testing
 */
export function initializeContainer(
  container: Container,
  options?: OSInitOptions
): void {
  // Create core event bus first (all other services depend on it)
  const eventBus = options?.eventBus || new EventBus();
  container.register('eventBus', eventBus);
  
  // Create viewport service (depends on event bus)
  const viewportService = options?.viewportService || new ViewportService(eventBus);
  container.register('viewportService', viewportService);
  
  // Create window placement service (depends on viewport service)
  const windowPlacementService = options?.windowPlacementService || new WindowPlacementService(viewportService);
  container.register('windowPlacementService', windowPlacementService);
  
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
  
  // Create app manager (depends on window manager, process manager, and event bus)
  const appManager = new AppManager(
    windowManager,
    processManager,
    eventBus
  );
  container.register('appManager', appManager);
  
  // Note: WorkspaceManager will be created by OS after AppManager exists
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
    initializeContainer(container, options);
  }
  
  // Create OS with container
  // OS will create WorkspaceManager internally after resolving AppManager
  const osConfig: OSConfig = {
    container,
  };
  
  return new OS(osConfig);
}

