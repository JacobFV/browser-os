import { initDesktopShell, DesktopShellInitOptions, DesktopShellState } from '@browser-os/shell';
import { defaultDesktopIcons } from './defaults';

export interface WebShellInitOptions extends DesktopShellInitOptions {
  // Web-shell specific options can go here
}

export async function initWebShell(options?: WebShellInitOptions): Promise<DesktopShellState> {
  // Merge defaults with options
  const initOptions: DesktopShellInitOptions = {
    desktop: {
      icons: options?.desktop?.icons || defaultDesktopIcons,
      wallpaper: options?.desktop?.wallpaper,
    },
    ...options,
  };

  // Initialize the desktop shell
  const state = initDesktopShell(initOptions);

  return state;
}

