import { applyTheme, ThemeSkin } from '@browser-os/theme';
import { DesktopIcon } from '@browser-os/desktop';
import { AppRegistry, OS, App } from '@browser-os/app-sdk';
import { DesktopShellState } from './state';
import type { FilesystemInitOptions } from '@browser-os/fs';
import { initFilesystem, VfsImpl } from '@browser-os/fs';
import { AppManifest } from '@browser-os/core';

export interface DesktopShellInitOptions {
  vfs?: FilesystemInitOptions;
  apps?: {
    manifests?: AppManifest[];
    appInstances?: App[]; // New: App instances
    registerDefaults?: boolean;
  };
  desktop?: {
    icons?: DesktopIcon[];
    wallpaper?: string;
  };
  theme?: {
    skin?: ThemeSkin;
    accent?: string;
  };
  processManager?: {
    // Future: custom process manager config
  };
}

export function initDesktopShell(options?: DesktopShellInitOptions): DesktopShellState {
  // Create OS instance first (this creates all services)
  const os = new OS({
    apps: options?.apps?.appInstances,
  });

  // Initialize filesystem using OS VFS instance
  initFilesystem(os.getVFS(), options?.vfs);

  // Initialize theme
  const themeSkin = options?.theme?.skin || 'win95';
  const themeAccent = options?.theme?.accent;
  applyTheme(themeSkin, themeAccent);

  // Initialize app registry (legacy)
  const appRegistry = new AppRegistry();
  if (options?.apps?.registerDefaults !== false) {
    // Register default apps if needed
    if (options?.apps?.manifests) {
      appRegistry.registerMany(options.apps.manifests);
    }
  }

  // Get desktop icons
  const desktopIcons = options?.desktop?.icons || [];

  // Create and return state with instances from OS
  const state: DesktopShellState = {
    vfs: os.getVFS(),
    processManager: os.getProcessManager(),
    windowManager: os.getWindowManager(),
    workspaceManager: os.getWorkspaceManager(),
    appHost: os.getAppHost(),
    settingsStore: os.getSettingsStore(),
    desktopIcons,
    initialTheme: themeSkin,
    wallpaper: options?.desktop?.wallpaper,
    appRegistry,
    appManager: os.getAppManager(),
    os,
    cursor: os.getCursorManager(),
    telemetry: os.getTelemetryManager(),
  };

  return state;
}

