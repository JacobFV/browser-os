import { initDesktopShell, DesktopShellInitOptions, DesktopShellState } from '@browser-os/shell';
import { defaultDesktopIcons } from './defaults';
import { TerminalApp } from '@system-apps/terminal/TerminalApp';
import { CalculatorApp } from '@system-apps/calculator/CalculatorApp';
import { processManager } from '@browser-os/process';
import { vfs } from '@browser-os/fs';

export interface WebShellInitOptions extends DesktopShellInitOptions {
  // Web-shell specific options can go here
}

export async function initWebShell(options?: WebShellInitOptions): Promise<DesktopShellState> {
  // Create app instances
  const terminalApp = new TerminalApp(processManager, vfs);
  const calculatorApp = new CalculatorApp(processManager);
  
  // Merge defaults with options
  const initOptions: DesktopShellInitOptions = {
    desktop: {
      icons: options?.desktop?.icons || defaultDesktopIcons,
      wallpaper: options?.desktop?.wallpaper,
    },
    apps: {
      ...options?.apps,
      appInstances: [
        terminalApp,
        calculatorApp,
        ...(options?.apps?.appInstances || []),
      ],
    },
    ...options,
  };

  // Initialize the desktop shell
  const state = initDesktopShell(initOptions);

  return state;
}

