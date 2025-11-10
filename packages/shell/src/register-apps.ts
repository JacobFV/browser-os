import { OS, App, AppFactory } from '@browser-os/app-sdk';
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

/**
 * Register system apps with the OS
 * 
 * Uses AppFactory to create and register all system apps.
 * This centralizes app registration logic and makes it easy to add/remove apps.
 * 
 * @param os - OS instance to register apps with
 * @returns Array of registered app instances
 */
export function registerSystemApps(os: OS): App[] {
  const container = os.getContainer();
  const appManager = os.getAppManager();
  const factory = new AppFactory(container, appManager);
  
  // Create and register all system apps
  const apps: App[] = [
    factory.createApp(TerminalApp),
    factory.createApp(CalculatorApp),
    factory.createApp(FilesApp),
    factory.createApp(NotesApp),
    factory.createApp(MonitorApp),
    factory.createApp(SettingsApp),
    factory.createApp(EditorApp),
    factory.createApp(BrowserApp),
    factory.createApp(CalendarApp),
    factory.createApp(StoreApp),
  ];
  
  return apps;
}

