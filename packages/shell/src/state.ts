import { WindowManager } from '@browser-os/windowing';
import { WorkspaceManager } from '@browser-os/workspace';
import { AppHost } from '@browser-os/app-host';
import { SettingsStoreImpl } from '@browser-os/settings';
import { VfsImpl } from '@browser-os/fs';
import { ProcessManager } from '@browser-os/process';
import { ThemeSkin } from '@browser-os/theme';
import { DesktopIcon } from '@browser-os/desktop';
import { AppRegistry, AppManager, OS } from '@browser-os/app-sdk';
import { CursorManager } from '@browser-os/cursor';
import { TelemetryManager } from '@browser-os/telemetry';

export interface DesktopShellState {
  // Core systems (instances from OS)
  vfs: VfsImpl;
  processManager: ProcessManager;
  windowManager: WindowManager;
  workspaceManager: WorkspaceManager;
  appHost: AppHost;
  settingsStore: SettingsStoreImpl;
  
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
  cursor?: CursorManager;
  telemetry?: TelemetryManager;
}

