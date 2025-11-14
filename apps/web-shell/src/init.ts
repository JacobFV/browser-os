import { initDesktopShell, DesktopShellInitOptions, DesktopShellState } from '@browser-os/shell';
import { defaultDesktopIcons } from './defaults';

export interface WebShellInitOptions extends DesktopShellInitOptions {
  // Web-shell specific options can go here
}

/**
 * Initialize web shell
 * 
 * This is a convenience wrapper around initDesktopShell that sets up
 * default desktop icons for the web shell environment.
 * 
 * @param options - Configuration options
 * @returns Complete shell state
 */
export async function initWebShell(options?: WebShellInitOptions): Promise<DesktopShellState> {
  // Initialize desktop shell with defaults
  // System apps are automatically registered via registerSystemApps()
  const state = await initDesktopShell({
    desktop: {
      icons: options?.desktop?.icons || defaultDesktopIcons,
      wallpaper: options?.desktop?.wallpaper,
    },
    theme: options?.theme,
    vfs: options?.vfs,
    apps: {
      ...options?.apps,
      // registerDefaults defaults to true, so system apps are registered automatically
      registerDefaults: options?.apps?.registerDefaults !== false,
    },
    ...options,
  });

  return state;
}

