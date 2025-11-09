import { vfs } from '@browser-os/fs';
import { processManager } from '@browser-os/process';
import { windowManager, WindowManager } from '@browser-os/windowing';
import { workspaceManager } from '@browser-os/workspace';
import { appHost } from '@browser-os/app-host';
import { settingsStore } from '@browser-os/settings';
import { ThemeSkin } from '@browser-os/theme';
import { DesktopIcon } from '@browser-os/desktop';
import { AppRegistry, AppManager, OS } from '@browser-os/app-sdk';

export interface DesktopShellState {
  // Core systems (singletons, but initialized)
  vfs: typeof vfs;
  processManager: typeof processManager;
  windowManager: typeof windowManager;
  workspaceManager: typeof workspaceManager;
  appHost: typeof appHost;
  settingsStore: typeof settingsStore;
  
  // Desktop configuration
  desktopIcons: DesktopIcon[];
  initialTheme: ThemeSkin;
  wallpaper?: string;
  
  // App registry (legacy)
  appRegistry: AppRegistry;
  
  // New app system
  appManager?: AppManager;
  os?: OS;
  
  // Optional services
  cursor?: any; // CursorService - type when implemented
  telemetry?: any; // TelemetryService - type when implemented
}

