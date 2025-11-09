import { initDesktopShell, DesktopShellInitOptions, DesktopShellState } from '@browser-os/shell';
import { defaultDesktopIcons } from './defaults';
import { TerminalApp } from '@system-apps/terminal';
import { CalculatorApp } from '@system-apps/calculator';
import { FilesApp } from '@system-apps/files';
import { NotesApp } from '@system-apps/notes';
import { MonitorApp } from '@system-apps/monitor';
import { SettingsApp } from '@system-apps/settings';
import { EditorApp } from '@system-apps/editor';
import { BrowserApp } from '@system-apps/browser';
import { CalendarApp } from '@system-apps/calendar';
import { StoreApp } from '@system-apps/store';

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
    const container = state.os.getContainer();
    
    const terminalApp = new TerminalApp(container);
    const calculatorApp = new CalculatorApp(container);
    const filesApp = new FilesApp(container);
    const notesApp = new NotesApp(container);
    const monitorApp = new MonitorApp(container);
    const settingsApp = new SettingsApp(container);
    const editorApp = new EditorApp(container);
    const browserApp = new BrowserApp(container);
    const calendarApp = new CalendarApp(container);
    const storeApp = new StoreApp(container, state.os.getAppManager());
    
    // Register apps
    state.os.registerApps([
      terminalApp,
      calculatorApp,
      filesApp,
      notesApp,
      monitorApp,
      settingsApp,
      editorApp,
      browserApp,
      calendarApp,
      storeApp,
    ]);
  }

  return state;
}

