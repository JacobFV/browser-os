import { OS, App } from '@browser-os/app-sdk';
import { Container } from '@browser-os/core';
import { AppRegistry, AppPlugin } from './app-registry';
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
import { WordProcessorApp } from '@system-apps/word-processor';

/**
 * Get all system app plugins
 * This function returns plugins that can be registered with AppRegistry
 */
function getSystemAppPlugins(): AppPlugin[] {
  return [
    {
      id: 'terminal',
      createApp: (container: Container) => new TerminalApp(container),
    },
    {
      id: 'calculator',
      createApp: (container: Container) => new CalculatorApp(container),
    },
    {
      id: 'files',
      createApp: (container: Container) => new FilesApp(container),
    },
    {
      id: 'notes',
      createApp: (container: Container) => new NotesApp(container),
    },
    {
      id: 'monitor',
      createApp: (container: Container) => new MonitorApp(container),
    },
    {
      id: 'settings',
      createApp: (container: Container) => new SettingsApp(container),
    },
    {
      id: 'editor',
      createApp: (container: Container) => new EditorApp(container),
    },
    {
      id: 'browser',
      createApp: (container: Container) => new BrowserApp(container),
    },
    {
      id: 'calendar',
      createApp: (container: Container) => new CalendarApp(container),
    },
    {
      id: 'store',
      createApp: (container: Container) => new StoreApp(container),
    },
    {
      id: 'os.word-processor',
      createApp: (container: Container) => new WordProcessorApp(container),
    },
  ];
}

/**
 * Register system apps with the OS using plugin registry
 * 
 * Uses AppRegistry to decouple app imports from registration logic.
 * Apps can be added/removed by modifying getSystemAppPlugins().
 * 
 * @param os - OS instance to register apps with
 * @returns Array of registered app instances
 */
export function registerSystemApps(os: OS): App[] {
  const container = os.getContainer();
  const appManager = os.getAppManager();
  const registry = new AppRegistry();
  
  // Register all system app plugins
  registry.registerPlugins(getSystemAppPlugins());
  
  // Create and register all apps
  return registry.createApps(container, appManager);
}

