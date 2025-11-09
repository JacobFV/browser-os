import { initDesktopShell, DesktopShellInitOptions, DesktopShellState } from '@browser-os/shell';
import { defaultDesktopIcons } from './defaults';
import { TerminalApp } from '@system-apps/terminal';
import { CalculatorApp } from '@system-apps/calculator';
import { FilesApp } from '@system-apps/files';

export interface WebShellInitOptions extends DesktopShellInitOptions {
  // Web-shell specific options can go here
}

export async function initWebShell(options?: WebShellInitOptions): Promise<DesktopShellState> {
  // Initialize the desktop shell first (creates OS and all services)
  const state = initDesktopShell({
    desktop: {
      icons: options?.desktop?.icons || defaultDesktopIcons,
      wallpaper: options?.desktop?.wallpaper,
    },
    theme: options?.theme,
    vfs: options?.vfs,
    apps: {
      ...options?.apps,
      appInstances: [
        // Create app instances with dependencies from OS
        ...(options?.apps?.appInstances || []),
      ],
    },
    ...options,
  });

  // Create app instances with dependencies from OS
  if (state.os) {
    const terminalApp = new TerminalApp(
      state.os.getProcessManager(),
      state.os.getEventBus(),
      state.os.getVFS()
    );
    const calculatorApp = new CalculatorApp(
      state.os.getProcessManager(),
      state.os.getEventBus()
    );
    const filesApp = new FilesApp(
      state.os.getProcessManager(),
      state.os.getEventBus(),
      state.os.getVFS()
    );
    
    // Register apps
    state.os.registerApps([terminalApp, calculatorApp, filesApp]);
  }

  return state;
}

