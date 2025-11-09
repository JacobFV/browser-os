import { vfs } from '@browser-os/fs';
import { processManager } from '@browser-os/process';
import { windowManager } from '@browser-os/windowing';
import { workspaceManager } from '@browser-os/workspace';
import { appHost } from '@browser-os/app-host';
import { settingsStore } from '@browser-os/settings';
import { applyTheme, ThemeSkin } from '@browser-os/theme';
import { DesktopIcon } from '@browser-os/desktop';
import { AppRegistry } from '@browser-os/app-sdk';
import { DesktopShellState } from './state';
import type { FilesystemInitOptions } from '@browser-os/fs';
import { initFilesystem } from '@browser-os/fs';
import { AppManifest } from '@browser-os/core';

export interface DesktopShellInitOptions {
  vfs?: FilesystemInitOptions;
  apps?: {
    manifests?: AppManifest[];
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
  // Initialize filesystem
  initFilesystem(options?.vfs);

  // Initialize theme
  const themeSkin = options?.theme?.skin || 'win95';
  const themeAccent = options?.theme?.accent;
  applyTheme(themeSkin, themeAccent);

  // Initialize app registry
  const appRegistry = new AppRegistry();
  if (options?.apps?.registerDefaults !== false) {
    // Register default apps if needed
    if (options?.apps?.manifests) {
      appRegistry.registerMany(options.apps.manifests);
    }
  }

  // Get desktop icons
  const desktopIcons = options?.desktop?.icons || [];

  // Create and return state
  const state: DesktopShellState = {
    vfs,
    processManager,
    windowManager,
    workspaceManager,
    appHost,
    settingsStore,
    desktopIcons,
    initialTheme: themeSkin,
    wallpaper: options?.desktop?.wallpaper,
    appRegistry,
  };

  return state;
}

