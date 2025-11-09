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
    const notesApp = new NotesApp(
      state.os.getProcessManager(),
      state.os.getEventBus(),
      state.os.getVFS()
    );
    const monitorApp = new MonitorApp(
      state.os.getProcessManager(),
      state.os.getEventBus()
    );
    const settingsApp = new SettingsApp(
      state.os.getProcessManager(),
      state.os.getEventBus()
    );
    const editorApp = new EditorApp(
      state.os.getProcessManager(),
      state.os.getEventBus(),
      state.os.getVFS()
    );
    const browserApp = new BrowserApp(
      state.os.getProcessManager(),
      state.os.getEventBus()
    );
    const calendarApp = new CalendarApp(
      state.os.getProcessManager(),
      state.os.getEventBus()
    );
    const storeApp = new StoreApp(
      state.os.getProcessManager(),
      state.os.getEventBus(),
      state.os.getAppManager()
    );
    
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

