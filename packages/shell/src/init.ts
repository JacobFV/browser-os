import { OS, App } from '@browser-os/app-sdk';
import { DesktopShellState } from './state';
import { AppManifest } from '@browser-os/core';
import { createOS, OSInitOptions } from './create-os';
import { registerSystemApps } from './register-apps';
import { configureShell, ShellConfig } from './configure-shell';

export interface DesktopShellInitOptions extends OSInitOptions, ShellConfig {
  apps?: {
    manifests?: AppManifest[];
    appInstances?: App[];
    registerDefaults?: boolean;
  };
}

/**
 * Initialize desktop shell with OS, apps, and configuration
 * 
 * This is the main entry point for shell initialization. It orchestrates:
 * 1. OS creation (with container and all services)
 * 2. System app registration (using AppFactory)
 * 3. Shell configuration (theme, desktop, filesystem)
 * 
 * @param options - Configuration options for shell initialization
 * @returns Complete shell state with OS and all configured services
 */
export function initDesktopShell(options?: DesktopShellInitOptions): DesktopShellState {
  // Step 1: Create OS instance (sets up container and all services)
  const os = createOS(options);
  
  // Step 2: Register system apps if requested
  let systemApps: App[] = [];
  if (options?.apps?.registerDefaults !== false) {
    systemApps = registerSystemApps(os);
  }
  
  // Also register any provided app instances
  if (options?.apps?.appInstances) {
    os.registerApps(options.apps.appInstances);
  }
  
  // Register manifests with AppManager (for legacy apps)
  if (options?.apps?.manifests) {
    os.getAppManager().registerManifests(options.apps.manifests);
  }
  
  // Step 3: Configure shell (theme, desktop, filesystem)
  const shellConfig = configureShell(os, options);
  
  // Step 4: Assemble and return complete state
  const state: DesktopShellState = {
    vfs: os.getVFS(),
    processManager: os.getProcessManager(),
    windowManager: os.getWindowManager(),
    workspaceManager: os.getWorkspaceManager(),
    appHost: os.getAppHost(),
    settingsStore: os.getSettingsStore(),
    appManager: os.getAppManager(),
    os,
    cursor: os.getCursorManager(),
    telemetry: os.getTelemetryManager(),
    ...shellConfig,
  };
  
  return state;
}

